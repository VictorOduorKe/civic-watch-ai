import {
  fetchSources,
  fetchSource,
  createSource,
  updateSource,
  executeVerificationAction,
  addEntityReference,
  getEntityProvenanceDossier,
  fetchVerificationQueue,
  fetchVerificationStats
} from '../services/trustService.js';
import { getEntityReferences, getEntityVerificationHistory } from '../models/trustModel.js';

/**
 * M14 — Verification & Trust Layer: Controller
 */

export async function listSourcesHandler(req, res, next) {
  try {
    const isPublic = !req.user || req.user.role === 'Citizen';
    const result = await fetchSources(req.query, isPublic);
    res.json({
      success: true,
      data: result.sources,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getSourceHandler(req, res, next) {
  try {
    const isPublic = !req.user || req.user.role === 'Citizen';
    const source = await fetchSource(req.params.id, isPublic);
    res.json({
      success: true,
      data: source
    });
  } catch (error) {
    next(error);
  }
}

export async function createSourceHandler(req, res, next) {
  try {
    const source = await createSource(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Source created successfully',
      data: source
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSourceHandler(req, res, next) {
  try {
    const source = await updateSource(req.params.id, req.body, req.user.id);
    res.json({
      success: true,
      message: 'Source updated successfully',
      data: source
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyActionHandler(req, res, next) {
  try {
    const { entityType, entityId } = req.params;
    const { action, reason, evidence_summary, references } = req.body;

    const result = await executeVerificationAction({
      entityType,
      entityId,
      action,
      reason,
      evidence_summary,
      references,
      user: req.user
    });

    res.json({
      success: true,
      message: `Entity successfully marked as ${action}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function addReferenceHandler(req, res, next) {
  try {
    const { entityType, entityId } = req.params;
    const { title, reference_url, description, source_type } = req.body;

    const ref = await addEntityReference({
      entityType,
      entityId,
      title,
      reference_url,
      description,
      source_type,
      user: req.user
    });

    res.status(201).json({
      success: true,
      message: 'Reference added successfully',
      data: ref
    });
  } catch (error) {
    next(error);
  }
}

export async function getProvenanceDossierHandler(req, res, next) {
  try {
    const { entityType, entityId } = req.params;
    const isPublic = !req.user || req.user.role === 'Citizen';
    const dossier = await getEntityProvenanceDossier(entityType.toUpperCase(), entityId, isPublic);

    res.json({
      success: true,
      data: dossier
    });
  } catch (error) {
    next(error);
  }
}

export async function getVerificationHistoryHandler(req, res, next) {
  try {
    const { entityType, entityId } = req.params;
    const history = await getEntityVerificationHistory(entityType.toUpperCase(), entityId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
}

export async function getVerificationReferencesHandler(req, res, next) {
  try {
    const { entityType, entityId } = req.params;
    const references = await getEntityReferences(entityType.toUpperCase(), entityId);

    res.json({
      success: true,
      data: references
    });
  } catch (error) {
    next(error);
  }
}

export async function getVerificationQueueHandler(req, res, next) {
  try {
    const result = await fetchVerificationQueue(req.query);
    res.json({
      success: true,
      data: result.queue,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getVerificationStatsHandler(req, res, next) {
  try {
    const stats = await fetchVerificationStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}
