import fs from 'fs';
import path from 'path';
import {
  submitVerification,
  getUserVerifications,
  getVerificationById,
  getVerificationImageFile
} from '../services/ai/verificationService.js';

/**
 * POST /api/verifications
 * Submit a new claim/URL/screenshot for AI verification
 */
export async function createVerification(req, res, next) {
  try {
    const { input_type, claim_text, source_url, source_title } = req.body;
    const imageFile = req.file;

    // Validate that image-dependent input types have an actual file attached
    if ((input_type === 'IMAGE' || input_type === 'TEXT_AND_IMAGE') && !imageFile) {
      return res.status(400).json({
        success: false,
        message: 'A screenshot or image file is required for the selected input type.'
      });
    }

    // Call service to store and run AI verification
    const verification = await submitVerification({
      userId: req.user.id,
      inputType: input_type,
      claimText: claim_text,
      sourceUrl: source_url,
      sourceTitle: source_title,
      imageFile
    });

    return res.status(201).json({
      success: true,
      message: 'Information verification completed successfully.',
      verification
    });
  } catch (error) {
    if (error.code === 'AI_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'AI_TIMEOUT') {
      return res.status(504).json({
        success: false,
        message: 'The AI verification request timed out. Please try again later.'
      });
    }

    if (error.code === 'AI_MALFORMED_RESPONSE' || error.code === 'AI_PROVIDER_ERROR') {
      return res.status(502).json({
        success: false,
        message: 'AI verification could not be completed reliably right now. Please try again later.'
      });
    }

    next(error);
  }
}

/**
 * GET /api/verifications
 * Retrieve paginated verification history for the authenticated user
 */
export async function getVerifications(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status || null;

    const result = await getUserVerifications(req.user.id, { page, limit, status });

    return res.status(200).json({
      success: true,
      data: result.verifications,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/verifications/:id
 * Retrieve details for a specific verification with strict ownership enforcement
 */
export async function getVerification(req, res, next) {
  try {
    const id = Number(req.params.id);
    const verification = await getVerificationById(id, req.user.id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification record not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      verification
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/verifications/:id/image
 * Serve authorized verification screenshot image
 */
export async function getVerificationImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const imagePath = await getVerificationImageFile(id, req.user.id);

    if (!imagePath || !fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Verification image not found or access denied.'
      });
    }

    return res.sendFile(path.resolve(imagePath));
  } catch (error) {
    next(error);
  }
}
