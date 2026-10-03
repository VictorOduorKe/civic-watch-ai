import { participationService } from '../services/participationService.js';

export const participationController = {
  // ==========================================
  // 1. PETITIONS
  // ==========================================

  async listPetitions(req, res, next) {
    try {
      const isStaff = req.user && ['Admin', 'Moderator', 'Analyst'].includes(req.user.role);
      const isPublic = !isStaff;
      const result = await participationService.listPetitions({
        ...req.query,
        isPublic
      });

      return res.status(200).json({
        success: true,
        data: result.petitions,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  },

  async getPetition(req, res, next) {
    try {
      const petition = await participationService.getPetition(req.params.id, req.user);
      return res.status(200).json({
        success: true,
        data: petition
      });
    } catch (err) {
      next(err);
    }
  },

  async createPetition(req, res, next) {
    try {
      const petition = await participationService.createPetition(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Petition created successfully',
        data: petition
      });
    } catch (err) {
      next(err);
    }
  },

  async updatePetition(req, res, next) {
    try {
      const petition = await participationService.updatePetition(req.params.id, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: 'Petition updated successfully',
        data: petition
      });
    } catch (err) {
      next(err);
    }
  },

  async moderatePetition(req, res, next) {
    try {
      const petition = await participationService.moderatePetition(req.params.id, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: `Petition status transitioned to ${req.body.status}`,
        data: petition
      });
    } catch (err) {
      next(err);
    }
  },

  async signPetition(req, res, next) {
    try {
      const result = await participationService.signPetition(req.params.id, req.user, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          isVerifiedSigner: result.isVerifiedSigner,
          quorumResult: result.quorumResult
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async withdrawSignature(req, res, next) {
    try {
      const result = await participationService.withdrawSignature(req.params.id, req.user);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          quorumResult: result.quorumResult
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getSignatures(req, res, next) {
    try {
      const result = await participationService.getSignatures(req.params.id, req.query);
      return res.status(200).json({
        success: true,
        data: result.signatures,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // 2. BUDGET HEARINGS
  // ==========================================

  async listHearings(req, res, next) {
    try {
      const isStaff = req.user && ['Admin', 'Moderator', 'Analyst'].includes(req.user.role);
      const isPublic = !isStaff;
      const result = await participationService.listHearings({
        ...req.query,
        isPublic
      });

      return res.status(200).json({
        success: true,
        data: result.hearings,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  },

  async getHearing(req, res, next) {
    try {
      const hearing = await participationService.getHearing(req.params.id);
      return res.status(200).json({
        success: true,
        data: hearing
      });
    } catch (err) {
      next(err);
    }
  },

  async createHearing(req, res, next) {
    try {
      const hearing = await participationService.createHearing(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Budget hearing scheduled successfully',
        data: hearing
      });
    } catch (err) {
      next(err);
    }
  },

  async updateHearing(req, res, next) {
    try {
      const hearing = await participationService.updateHearing(req.params.id, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: 'Budget hearing updated successfully',
        data: hearing
      });
    } catch (err) {
      next(err);
    }
  },

  async cancelHearing(req, res, next) {
    try {
      const hearing = await participationService.cancelHearing(req.params.id, req.body.reason, req.user);
      return res.status(200).json({
        success: true,
        message: 'Budget hearing cancelled',
        data: hearing
      });
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // 3. LEGISLATIVE ITEMS & FEEDBACK
  // ==========================================

  async listLegislativeItems(req, res, next) {
    try {
      const isStaff = req.user && ['Admin', 'Moderator', 'Analyst'].includes(req.user.role);
      const isPublic = !isStaff;
      const result = await participationService.listLegislativeItems({
        ...req.query,
        isPublic
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  },

  async getLegislativeItem(req, res, next) {
    try {
      const item = await participationService.getLegislativeItem(req.params.id);
      return res.status(200).json({
        success: true,
        data: item
      });
    } catch (err) {
      next(err);
    }
  },

  async createLegislativeItem(req, res, next) {
    try {
      const item = await participationService.createLegislativeItem(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Legislative item registered successfully',
        data: item
      });
    } catch (err) {
      next(err);
    }
  },

  async listFeedback(req, res, next) {
    try {
      const result = await participationService.listFeedback(req.params.id, req.query, req.user);
      return res.status(200).json({
        success: true,
        data: result.feedback,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  },

  async submitFeedback(req, res, next) {
    try {
      const feedback = await participationService.submitFeedback(req.params.id, req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Feedback submitted for review',
        data: feedback
      });
    } catch (err) {
      next(err);
    }
  },

  async moderateFeedback(req, res, next) {
    try {
      const feedback = await participationService.moderateFeedback(req.params.id, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: `Feedback status updated to ${req.body.status}`,
        data: feedback
      });
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // 4. STATS & AUDITS
  // ==========================================

  async getParticipationStats(req, res, next) {
    try {
      const stats = await participationService.getParticipationStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  },

  async getAudits(req, res, next) {
    try {
      const { entityType, entityId } = req.query;
      if (!entityType || !entityId) {
        return res.status(400).json({
          success: false,
          message: 'entityType and entityId query parameters are required'
        });
      }
      const audits = await participationService.getAudits(entityType, entityId);
      return res.status(200).json({
        success: true,
        data: audits
      });
    } catch (err) {
      next(err);
    }
  }
};
