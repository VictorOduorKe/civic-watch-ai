import { participationModel } from '../models/participationModel.js';
import { safeCreateNotification } from './notificationService.js';
import { pool } from '../config/database.js';

class ParticipationService {
  // ==========================================
  // 1. PETITIONS MANAGEMENT
  // ==========================================

  async listPetitions(options = {}) {
    return await participationModel.listPetitions(options);
  }

  async getPetition(id, currentUser = null) {
    const petition = await participationModel.getPetitionById(id);
    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    let userSignature = null;
    if (currentUser?.id) {
      userSignature = await participationModel.getSignature(id, currentUser.id);
    }

    return {
      ...petition,
      hasUserSigned: !!(userSignature && !userSignature.is_withdrawn),
      userSignature: userSignature ? {
        id: userSignature.id,
        isVerifiedSigner: Boolean(userSignature.is_verified_signer),
        isWithdrawn: Boolean(userSignature.is_withdrawn),
        createdAt: userSignature.created_at
      } : null
    };
  }

  async createPetition(data, user) {
    if (!user) {
      const error = new Error('Authentication required to create a petition');
      error.statusCode = 401;
      throw error;
    }

    // Citizens create DRAFT; Admins/Moderators can directly publish or draft
    const initialStatus = user.role === 'Admin' || user.role === 'Moderator' ? 'PUBLISHED' : 'DRAFT';

    const petitionId = await participationModel.createPetition({
      ...data,
      creator_id: user.id,
      status: initialStatus
    });

    if (initialStatus === 'PUBLISHED') {
      await participationModel.updatePetitionStatus(petitionId, {
        status: 'PUBLISHED',
        publishedAt: new Date()
      });
    }

    await participationModel.createAudit({
      entityType: 'PETITION',
      entityId: petitionId,
      action: 'PETITION_CREATED',
      actorId: user.id,
      actorRole: user.role,
      previousState: null,
      newState: { title: data.title, status: initialStatus, quorumRequirement: data.quorum_requirement },
      reason: 'Citizen petition registered'
    });

    return await this.getPetition(petitionId, user);
  }

  async updatePetition(id, updates, user) {
    const petition = await participationModel.getPetitionById(id);
    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    // Only creator or admin can update petition
    const isOwner = petition.creator_id === user.id;
    const isAdmin = user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Unauthorized to modify this petition');
      error.statusCode = 403;
      throw error;
    }

    // Cannot edit once closed or archived
    if (['CLOSED', 'ARCHIVED', 'REJECTED'].includes(petition.status) && !isAdmin) {
      const error = new Error(`Cannot edit petition in ${petition.status} status`);
      error.statusCode = 400;
      throw error;
    }

    await participationModel.updatePetition(id, updates);

    await participationModel.createAudit({
      entityType: 'PETITION',
      entityId: id,
      action: 'PETITION_UPDATED',
      actorId: user.id,
      actorRole: user.role,
      previousState: { title: petition.title, summary: petition.summary },
      newState: updates,
      reason: 'Petition details amended'
    });

    return await this.getPetition(id, user);
  }

  async moderatePetition(id, { status, reason }, user) {
    if (user.role !== 'Admin' && user.role !== 'Moderator') {
      const error = new Error('Administrative authorization required to moderate petitions');
      error.statusCode = 403;
      throw error;
    }

    const petition = await participationModel.getPetitionById(id);
    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    // State transition validation
    const allowedTransitions = {
      DRAFT: ['PENDING_REVIEW', 'PUBLISHED', 'REJECTED'],
      PENDING_REVIEW: ['PUBLISHED', 'REJECTED'],
      PUBLISHED: ['CLOSED', 'ARCHIVED'],
      QUORUM_REACHED: ['CLOSED', 'ARCHIVED'],
      CLOSED: ['ARCHIVED'],
      REJECTED: ['ARCHIVED'],
      ARCHIVED: []
    };

    if (!allowedTransitions[petition.status]?.includes(status)) {
      const error = new Error(
        `Invalid status transition from ${petition.status} to ${status}`
      );
      error.statusCode = 400;
      throw error;
    }

    if (status === 'REJECTED' && (!reason || reason.trim().length < 5)) {
      const error = new Error('Mandatory rejection reason required (min 5 characters)');
      error.statusCode = 400;
      throw error;
    }

    const updates = {
      status,
      reason: reason || null,
      publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
      closedAt: status === 'CLOSED' ? new Date() : undefined
    };

    await participationModel.updatePetitionStatus(id, updates);

    await participationModel.createAudit({
      entityType: 'PETITION',
      entityId: id,
      action: `PETITION_${status}`,
      actorId: user.id,
      actorRole: user.role,
      previousState: { status: petition.status },
      newState: { status, reason },
      reason: reason || `Status transitioned to ${status}`
    });

    // Notify creator
    if (petition.creator_id) {
      await safeCreateNotification({
        recipientUserId: petition.creator_id,
        type: 'CONSULTATION_OPENED',
        title: `Petition ${status === 'PUBLISHED' ? 'Published' : status}`,
        message: `Your petition "${petition.title}" status has changed to ${status}.`,
        entityType: 'petition',
        entityId: id,
        entityReference: `PET-${id}`,
        dedupeKey: `petition-mod:${id}:${status}`
      });
    }

    return await this.getPetition(id, user);
  }

  // ==========================================
  // 2. PETITION SIGNATURES & QUORUM
  // ==========================================

  async signPetition(petitionId, user, { comment } = {}) {
    if (!user) {
      const error = new Error('Authentication required to sign a petition');
      error.statusCode = 401;
      throw error;
    }

    const petition = await participationModel.getPetitionById(petitionId);
    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    if (petition.status !== 'PUBLISHED' && petition.status !== 'QUORUM_REACHED') {
      const error = new Error(`Cannot sign petition in ${petition.status} status`);
      error.statusCode = 400;
      throw error;
    }

    // Check closing date
    const today = new Date().toISOString().split('T')[0];
    const closingDate = new Date(petition.closing_date).toISOString().split('T')[0];
    if (today > closingDate) {
      const error = new Error('This petition has reached its closing date and is closed for signatures');
      error.statusCode = 400;
      throw error;
    }

    // Duplicate check
    const existing = await participationModel.getSignature(petitionId, user.id);
    if (existing && !existing.is_withdrawn) {
      const error = new Error('You have already signed this petition');
      error.statusCode = 409;
      throw error;
    }

    // Check user verification eligibility via M14 identity verification
    const isVerifiedSigner = user.identity_status === 'VERIFIED';

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await participationModel.addSignature(petitionId, user.id, {
        isVerifiedSigner,
        signerCounty: user.county,
        comment
      });

      const quorumResult = await participationModel.recalculateQuorum(petitionId, connection);

      await participationModel.createAudit({
        entityType: 'SIGNATURE',
        entityId: petitionId,
        action: 'SIGNATURE_ADDED',
        actorId: user.id,
        actorRole: user.role,
        previousState: null,
        newState: {
          isVerifiedSigner,
          signerCounty: user.county,
          totalSignatures: quorumResult?.totalSignatures,
          verifiedSignatures: quorumResult?.verifiedSignatures
        },
        reason: 'Citizen endorsed petition'
      });

      if (quorumResult?.quorumReached && quorumResult.previousStatus === 'PUBLISHED') {
        await participationModel.createAudit({
          entityType: 'PETITION',
          entityId: petitionId,
          action: 'QUORUM_REACHED',
          actorId: user.id,
          actorRole: user.role,
          previousState: { status: 'PUBLISHED' },
          newState: {
            status: 'QUORUM_REACHED',
            verifiedSignatures: quorumResult.verifiedSignatures,
            quorumRequirement: quorumResult.quorumRequirement
          },
          reason: 'Verified signature quorum threshold reached'
        });

        // Notify petition creator
        if (petition.creator_id) {
          await safeCreateNotification({
            recipientUserId: petition.creator_id,
            type: 'CONSULTATION_OPENED',
            title: 'Petition Quorum Reached!',
            message: `Congratulations! Your petition "${petition.title}" has reached its verified signature quorum of ${quorumResult.quorumRequirement}.`,
            entityType: 'petition',
            entityId: petitionId,
            entityReference: `PET-${petitionId}`,
            dedupeKey: `petition-quorum:${petitionId}`
          });
        }
      }

      await connection.commit();

      return {
        success: true,
        message: isVerifiedSigner
          ? 'Signature successfully recorded and added to verified quorum.'
          : 'Signature recorded. Note: Identity verification is required for signature to count toward official quorum.',
        isVerifiedSigner,
        quorumResult
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async withdrawSignature(petitionId, user) {
    if (!user) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const existing = await participationModel.getSignature(petitionId, user.id);
    if (!existing || existing.is_withdrawn) {
      const error = new Error('No active signature found to withdraw');
      error.statusCode = 400;
      throw error;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await participationModel.withdrawSignature(petitionId, user.id);
      const quorumResult = await participationModel.recalculateQuorum(petitionId, connection);

      await participationModel.createAudit({
        entityType: 'SIGNATURE',
        entityId: petitionId,
        action: 'SIGNATURE_WITHDRAWN',
        actorId: user.id,
        actorRole: user.role,
        previousState: { isVerifiedSigner: Boolean(existing.is_verified_signer) },
        newState: { isWithdrawn: true, verifiedSignatures: quorumResult?.verifiedSignatures },
        reason: 'Signer voluntarily withdrew signature'
      });

      await connection.commit();

      return {
        success: true,
        message: 'Signature withdrawn successfully.',
        quorumResult
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async getSignatures(petitionId, options = {}) {
    return await participationModel.getSignaturesByPetition(petitionId, options);
  }

  // ==========================================
  // 3. BUDGET HEARINGS
  // ==========================================

  async listHearings(options = {}) {
    return await participationModel.listHearings(options);
  }

  async getHearing(id) {
    const hearing = await participationModel.getHearingById(id);
    if (!hearing) {
      const error = new Error('Budget hearing not found');
      error.statusCode = 404;
      throw error;
    }
    return hearing;
  }

  async createHearing(data, user) {
    // RBAC: Admin, Moderator, or County Liaison
    if (user.role !== 'Admin' && user.role !== 'Moderator' && !user.is_county_liaison) {
      const error = new Error('Administrative or County Liaison access required to schedule hearings');
      error.statusCode = 403;
      throw error;
    }

    // County-scoped enforcement: County liaisons can ONLY create hearings in their authorized county
    if (user.is_county_liaison && user.role !== 'Admin') {
      if (data.county.toLowerCase() !== user.liaison_county?.toLowerCase()) {
        const error = new Error(
          `Unauthorized: As a County Liaison for ${user.liaison_county}, you cannot schedule hearings for ${data.county}.`
        );
        error.statusCode = 403;
        throw error;
      }
    }

    const hearingId = await participationModel.createHearing({
      ...data,
      created_by: user.id,
      status: 'PUBLISHED'
    });

    await participationModel.createAudit({
      entityType: 'HEARING',
      entityId: hearingId,
      action: 'HEARING_CREATED',
      actorId: user.id,
      actorRole: user.role,
      previousState: null,
      newState: { title: data.title, county: data.county, date: data.hearing_date, venue: data.venue },
      reason: 'Public participation hearing scheduled'
    });

    return await this.getHearing(hearingId);
  }

  async updateHearing(id, updates, user) {
    const hearing = await participationModel.getHearingById(id);
    if (!hearing) {
      const error = new Error('Budget hearing not found');
      error.statusCode = 404;
      throw error;
    }

    // County-scoped enforcement
    if (user.is_county_liaison && user.role !== 'Admin') {
      if (hearing.county.toLowerCase() !== user.liaison_county?.toLowerCase()) {
        const error = new Error(
          `Unauthorized: You can only manage hearings in your designated jurisdiction (${user.liaison_county}).`
        );
        error.statusCode = 403;
        throw error;
      }

      if (updates.county && updates.county.toLowerCase() !== user.liaison_county?.toLowerCase()) {
        const error = new Error('County liaisons cannot reassign hearings to another county');
        error.statusCode = 403;
        throw error;
      }
    } else if (user.role !== 'Admin' && user.role !== 'Moderator') {
      const error = new Error('Unauthorized to update hearings');
      error.statusCode = 403;
      throw error;
    }

    await participationModel.updateHearing(id, {
      ...updates,
      updated_by: user.id
    });

    await participationModel.createAudit({
      entityType: 'HEARING',
      entityId: id,
      action: 'HEARING_UPDATED',
      actorId: user.id,
      actorRole: user.role,
      previousState: { title: hearing.title, date: hearing.hearing_date, venue: hearing.venue },
      newState: updates,
      reason: 'Hearing details updated'
    });

    return await this.getHearing(id);
  }

  async cancelHearing(id, reason, user) {
    const hearing = await participationModel.getHearingById(id);
    if (!hearing) {
      const error = new Error('Budget hearing not found');
      error.statusCode = 404;
      throw error;
    }

    // County-scoped enforcement
    if (user.is_county_liaison && user.role !== 'Admin') {
      if (hearing.county.toLowerCase() !== user.liaison_county?.toLowerCase()) {
        const error = new Error('Unauthorized county boundary violation');
        error.statusCode = 403;
        throw error;
      }
    } else if (user.role !== 'Admin' && user.role !== 'Moderator') {
      const error = new Error('Unauthorized to cancel hearings');
      error.statusCode = 403;
      throw error;
    }

    await participationModel.cancelHearing(id, reason, user.id);

    await participationModel.createAudit({
      entityType: 'HEARING',
      entityId: id,
      action: 'HEARING_CANCELLED',
      actorId: user.id,
      actorRole: user.role,
      previousState: { status: hearing.status },
      newState: { status: 'CANCELLED', reason },
      reason
    });

    return await this.getHearing(id);
  }

  // ==========================================
  // 4. LEGISLATIVE ITEMS & FEEDBACK
  // ==========================================

  async listLegislativeItems(options = {}) {
    return await participationModel.listLegislativeItems(options);
  }

  async getLegislativeItem(id) {
    const item = await participationModel.getLegislativeItemById(id);
    if (!item) {
      const error = new Error('Legislative item not found');
      error.statusCode = 404;
      throw error;
    }
    return item;
  }

  async createLegislativeItem(data, user) {
    if (user.role !== 'Admin' && user.role !== 'Moderator') {
      const error = new Error('Administrative authorization required to create legislative items');
      error.statusCode = 403;
      throw error;
    }

    const itemId = await participationModel.createLegislativeItem({
      ...data,
      created_by: user.id
    });

    await participationModel.createAudit({
      entityType: 'LEGISLATIVE_ITEM',
      entityId: itemId,
      action: 'LEGISLATIVE_ITEM_CREATED',
      actorId: user.id,
      actorRole: user.role,
      previousState: null,
      newState: { reference_code: data.reference_code, title: data.title },
      reason: 'Legislative item registered for public feedback'
    });

    return await this.getLegislativeItem(itemId);
  }

  async submitFeedback(itemId, data, user) {
    if (!user) {
      const error = new Error('Authentication required to submit legislative feedback');
      error.statusCode = 401;
      throw error;
    }

    const item = await participationModel.getLegislativeItemById(itemId);
    if (!item) {
      const error = new Error('Legislative item not found');
      error.statusCode = 404;
      throw error;
    }

    if (item.status !== 'ACTIVE') {
      const error = new Error(`Cannot submit feedback on ${item.status.toLowerCase()} legislative items`);
      error.statusCode = 400;
      throw error;
    }

    // Check feedback deadline
    const today = new Date().toISOString().split('T')[0];
    const deadline = new Date(item.feedback_deadline).toISOString().split('T')[0];
    if (today > deadline) {
      const error = new Error('Feedback submission window for this legislative item has closed');
      error.statusCode = 400;
      throw error;
    }

    const feedbackId = await participationModel.createFeedback({
      ...data,
      legislative_item_id: itemId,
      user_id: user.id,
      county: user.county || data.county || null
    });

    await participationModel.createAudit({
      entityType: 'LEGISLATIVE_FEEDBACK',
      entityId: feedbackId,
      action: 'FEEDBACK_SUBMITTED',
      actorId: user.id,
      actorRole: user.role,
      previousState: null,
      newState: { itemId, stance: data.stance, title: data.title },
      reason: 'Citizen submitted public policy feedback'
    });

    return await participationModel.getFeedbackById(feedbackId);
  }

  async moderateFeedback(feedbackId, { status, notes }, user) {
    if (user.role !== 'Admin' && user.role !== 'Moderator') {
      const error = new Error('Administrative authorization required to moderate feedback');
      error.statusCode = 403;
      throw error;
    }

    const feedback = await participationModel.getFeedbackById(feedbackId);
    if (!feedback) {
      const error = new Error('Feedback submission not found');
      error.statusCode = 404;
      throw error;
    }

    await participationModel.moderateFeedback(feedbackId, {
      status,
      notes,
      moderatedBy: user.id
    });

    await participationModel.createAudit({
      entityType: 'LEGISLATIVE_FEEDBACK',
      entityId: feedbackId,
      action: `FEEDBACK_${status}`,
      actorId: user.id,
      actorRole: user.role,
      previousState: { status: feedback.status },
      newState: { status, notes },
      reason: notes || `Feedback moderated to ${status}`
    });

    // Notify citizen if published or rejected
    if (feedback.user_id) {
      await safeCreateNotification({
        recipientUserId: feedback.user_id,
        type: 'CONSULTATION_OPENED',
        title: `Legislative Feedback ${status === 'PUBLISHED' ? 'Accepted' : status}`,
        message: `Your feedback on item #${feedback.legislative_item_id} has been reviewed and marked ${status}.`,
        entityType: 'legislative_feedback',
        entityId: feedbackId,
        entityReference: `FB-${feedbackId}`,
        dedupeKey: `fb-mod:${feedbackId}:${status}`
      });
    }

    return await participationModel.getFeedbackById(feedbackId);
  }

  async listFeedback(itemId, options = {}, user = null) {
    const isStaff = user && (user.role === 'Admin' || user.role === 'Moderator' || user.role === 'Analyst');
    return await participationModel.listFeedbackByItem(itemId, {
      ...options,
      isPublic: !isStaff,
      userId: user?.id || null
    });
  }

  // ==========================================
  // 5. STATS & AUDITS
  // ==========================================

  async getParticipationStats() {
    return await participationModel.getParticipationStats();
  }

  async getAudits(entityType, entityId) {
    return await participationModel.getAuditsByEntity(entityType, entityId);
  }
}

export const participationService = new ParticipationService();
