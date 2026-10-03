import {
  listSources,
  getSourceById,
  createSourceRecord,
  updateSourceRecord,
  createVerificationAudit,
  createVerificationReferenceRecord,
  getEntityReferences,
  getEntityVerificationHistory,
  getEntityDetails,
  updateEntityVerificationStatus,
  getVerificationQueue,
  getVerificationStats
} from '../models/trustModel.js';
import { pool } from '../config/database.js';

/**
 * M14 — Verification & Trust Layer: Service Layer
 */

export async function fetchSources(params, isPublic = true) {
  return await listSources({ ...params, isPublic });
}

export async function fetchSource(id, isPublic = true) {
  const source = await getSourceById(id, isPublic);
  if (!source) {
    const error = new Error('Source not found');
    error.status = 404;
    throw error;
  }
  return source;
}

export async function createSource(data, userId) {
  const source = await createSourceRecord(data, userId);

  // Record initial verification history
  await createVerificationAudit({
    entity_type: 'SOURCE',
    entity_id: source.id,
    action: 'UNDER_REVIEW',
    previous_status: null,
    new_status: 'UNVERIFIED',
    verified_by: userId,
    reason: 'Initial source registration submitted',
    evidence_summary: data.description || null
  });

  return source;
}

export async function updateSource(id, data, userId) {
  const existing = await getSourceById(id, false);
  if (!existing) {
    const error = new Error('Source not found');
    error.status = 404;
    throw error;
  }

  const updated = await updateSourceRecord(id, data);
  return updated;
}

/**
 * Execute Verification Workflow Action on SOURCE, ALERT, or REPORT
 * Supports: VERIFIED, DISPUTED, CORRECTED, WITHDRAWN, UNDER_REVIEW
 */
export async function executeVerificationAction({
  entityType,
  entityId,
  action,
  reason = null,
  evidence_summary = null,
  references = [],
  user
}) {
  const entity = await getEntityDetails(entityType, entityId);
  if (!entity) {
    const error = new Error(`${entityType} not found`);
    error.status = 404;
    throw error;
  }

  const previousStatus = entity.verification_status || 'UNVERIFIED';
  let newStatus = action;

  if (action === 'UNDER_REVIEW') {
    newStatus = 'UNDER_REVIEW';
  } else if (action === 'VERIFIED') {
    newStatus = 'VERIFIED';
  } else if (action === 'DISPUTED') {
    newStatus = 'DISPUTED';
  } else if (action === 'CORRECTED') {
    newStatus = 'CORRECTED';
  } else if (action === 'WITHDRAWN') {
    newStatus = 'WITHDRAWN';
  }

  // 1. Create append-only verification record (Section 7 & 8)
  const recordId = await createVerificationAudit({
    entity_type: entityType,
    entity_id: entityId,
    action,
    previous_status: previousStatus,
    new_status: newStatus,
    verified_by: user.id,
    reason,
    evidence_summary
  });

  // 2. Attach any provided supporting references
  if (Array.isArray(references) && references.length > 0) {
    for (const ref of references) {
      await createVerificationReferenceRecord({
        verification_record_id: recordId,
        entity_type: entityType,
        entity_id: entityId,
        title: ref.title,
        reference_url: ref.reference_url,
        description: ref.description || null,
        source_type: ref.source_type || null,
        created_by: user.id
      });
    }
  }

  // 3. Update the entity's current verification status
  await updateEntityVerificationStatus(entityType, entityId, newStatus, user.id);

  // 4. If alert, log in civic_alert_audits for backwards-compatible audit tracking
  if (entityType === 'ALERT') {
    await pool.query(
      `INSERT INTO civic_alert_audits (alert_id, user_id, action, change_summary)
       VALUES (?, ?, ?, ?)`,
      [
        entityId,
        user.id,
        `VERIFICATION_${action}`,
        `Verification status transitioned from ${previousStatus} to ${newStatus}. Reason: ${reason || 'Status updated by reviewer'}`
      ]
    );
  }

  return await getEntityProvenanceDossier(entityType, entityId, false);
}

/**
 * Add Reference directly to an entity
 */
export async function addEntityReference({
  entityType,
  entityId,
  title,
  reference_url,
  description = null,
  source_type = null,
  user
}) {
  const entity = await getEntityDetails(entityType, entityId);
  if (!entity) {
    const error = new Error(`${entityType} not found`);
    error.status = 404;
    throw error;
  }

  const refId = await createVerificationReferenceRecord({
    entity_type: entityType,
    entity_id: entityId,
    title,
    reference_url,
    description,
    source_type,
    created_by: user.id
  });

  return {
    id: refId,
    title,
    referenceUrl: reference_url,
    description,
    sourceType: source_type,
    createdAt: new Date().toISOString()
  };
}

/**
 * Get Public Provenance Dossier
 * Section 13, 14, 15: Citizen-facing provenance information without exposing sensitive internals
 */
export async function getEntityProvenanceDossier(entityType, entityId, isPublic = true) {
  const entity = await getEntityDetails(entityType, entityId);
  if (!entity) {
    const error = new Error(`${entityType} not found`);
    error.status = 404;
    throw error;
  }

  const references = await getEntityReferences(entityType, entityId);
  const history = await getEntityVerificationHistory(entityType, entityId);

  // Privacy protection: for public view, redact verifier full names and only expose verified role
  const formattedHistory = history.map((item) => ({
    id: item.id,
    action: item.action,
    previousStatus: item.previousStatus,
    newStatus: item.newStatus,
    reason: item.reason,
    evidenceSummary: item.evidenceSummary,
    createdAt: item.createdAt,
    verifierRole: item.verifier.role || 'Authorized Staff',
    verifierName: isPublic ? undefined : item.verifier.name
  }));

  // Resolve source details if available
  let sourceDetails = null;
  if (entity.source_id) {
    const src = await getSourceById(entity.source_id, isPublic);
    if (src) {
      sourceDetails = {
        id: src.id,
        name: src.name,
        organization: src.organization,
        sourceType: src.sourceType,
        website: src.website,
        isOfficial: src.isOfficial,
        verificationStatus: src.verificationStatus
      };
    }
  } else if (entity.source_name) {
    sourceDetails = {
      name: entity.source_name,
      sourceType: entity.source_type || 'COMMUNITY',
      isOfficial: Boolean(entity.is_official)
    };
  }

  return {
    entityType,
    entityId: Number(entityId),
    title: entity.title || entity.name,
    verificationStatus: entity.verification_status || 'UNVERIFIED',
    verifiedAt: entity.verified_at,
    isOfficial: Boolean(entity.is_official),
    source: sourceDetails,
    referencesCount: references.length,
    references,
    history: formattedHistory,
    trustIndicators: {
      isVerified: entity.verification_status === 'VERIFIED',
      isDisputed: entity.verification_status === 'DISPUTED',
      isCorrected: entity.verification_status === 'CORRECTED',
      isWithdrawn: entity.verification_status === 'WITHDRAWN',
      badgeText: getBadgeLabel(entity.verification_status, entity.is_official)
    }
  };
}

export async function fetchVerificationQueue(params) {
  return await getVerificationQueue(params);
}

export async function fetchVerificationStats() {
  return await getVerificationStats();
}

function getBadgeLabel(status, isOfficial) {
  if (status === 'VERIFIED') return isOfficial ? 'Official & Verified' : 'Verified Community Notice';
  if (status === 'DISPUTED') return 'Verification Disputed';
  if (status === 'CORRECTED') return 'Official Notice Corrected';
  if (status === 'WITHDRAWN') return 'Notice Withdrawn';
  if (status === 'UNDER_REVIEW') return 'Under Verification Review';
  return isOfficial ? 'Pending Verification' : 'Unverified Community Submission';
}
