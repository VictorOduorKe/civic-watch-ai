import pool from '../../config/database.js';
import { GeminiProvider } from './geminiProvider.js';

// Default AI provider instance
const defaultProvider = new GeminiProvider();

function parseJsonField(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

/**
 * Format a raw database row into a standardized response object
 */
export function formatVerificationRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    inputType: row.input_type,
    claimText: row.claim_text,
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    imagePath: row.image_path ? `/api/verifications/${row.id}/image` : null,
    hasImage: Boolean(row.image_path),
    status: row.status,
    mainClaim: row.main_claim,
    summary: row.ai_summary,
    confidence: row.confidence,
    supportingInformation: parseJsonField(row.supporting_information),
    contradictoryInformation: parseJsonField(row.contradictory_information),
    missingContext: parseJsonField(row.missing_context),
    recommendedVerification: parseJsonField(row.recommended_verification),
    aiProvider: row.ai_provider,
    aiModel: row.ai_model,
    promptVersion: row.prompt_version,
    processingDurationMs: row.processing_duration_ms,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at
  };
}

/**
 * Submit and process a new verification request
 */
export async function submitVerification({
  userId,
  inputType,
  claimText,
  sourceUrl,
  sourceTitle,
  imageFile,
  aiProvider = defaultProvider
}) {
  const imagePath = imageFile ? imageFile.path : null;
  const mimeType = imageFile ? imageFile.mimetype : null;

  // Insert initial pending verification record
  const insertSql = `
    INSERT INTO verification_requests (
      user_id,
      input_type,
      claim_text,
      source_url,
      source_title,
      image_path,
      status,
      confidence,
      ai_provider,
      ai_model,
      prompt_version
    ) VALUES (?, ?, ?, ?, ?, ?, 'REQUIRES_VERIFICATION', 'LOW', ?, ?, ?)
  `;

  const [insertResult] = await pool.query(insertSql, [
    userId,
    inputType,
    claimText || null,
    sourceUrl || null,
    sourceTitle || null,
    imagePath,
    aiProvider.name,
    aiProvider.model,
    aiProvider.promptVersion
  ]);

  const verificationId = insertResult.insertId;

  // Execute AI verification
  try {
    const aiResult = await aiProvider.verifyInformation({
      claimText,
      sourceUrl,
      sourceTitle,
      imagePath,
      mimeType
    });

    // Update database with successful analysis
    const updateSql = `
      UPDATE verification_requests
      SET
        status = ?,
        main_claim = ?,
        ai_summary = ?,
        confidence = ?,
        supporting_information = ?,
        contradictory_information = ?,
        missing_context = ?,
        recommended_verification = ?,
        ai_provider = ?,
        ai_model = ?,
        prompt_version = ?,
        processing_duration_ms = ?,
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(updateSql, [
      aiResult.status,
      aiResult.mainClaim,
      aiResult.summary,
      aiResult.confidence,
      JSON.stringify(aiResult.supportingInformation || []),
      JSON.stringify(aiResult.contradictoryInformation || []),
      JSON.stringify(aiResult.missingContext || []),
      JSON.stringify(aiResult.recommendedVerification || []),
      aiResult.provider,
      aiResult.model,
      aiResult.promptVersion,
      aiResult.durationMs,
      verificationId
    ]);

    // Fetch and return updated record
    return await getVerificationById(verificationId, userId);
  } catch (error) {
    // Record error in database
    const safeErrorMsg = error.message ? error.message.substring(0, 500) : 'AI analysis failed';
    const fallbackSql = `
      UPDATE verification_requests
      SET
        status = 'INSUFFICIENT_EVIDENCE',
        error_message = ?,
        processing_duration_ms = ?,
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(fallbackSql, [
      safeErrorMsg,
      error.durationMs || null,
      verificationId
    ]);

    throw error;
  }
}

/**
 * Retrieve paginated list of verifications for an authenticated user
 */
export async function getUserVerifications(userId, { page = 1, limit = 20, status = null } = {}) {
  const offset = (page - 1) * limit;
  const whereClauses = ['user_id = ?'];
  const queryParams = [userId];

  if (status) {
    whereClauses.push('status = ?');
    queryParams.push(status);
  }

  const whereSql = whereClauses.join(' AND ');

  // Count total matching records
  const countSql = `SELECT COUNT(*) AS total FROM verification_requests WHERE ${whereSql}`;
  const [countRows] = await pool.query(countSql, queryParams);
  const total = countRows[0].total;

  // Retrieve paginated records
  const listSql = `
    SELECT *
    FROM verification_requests
    WHERE ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(listSql, [...queryParams, Number(limit), Number(offset)]);
  const verifications = rows.map(formatVerificationRecord);

  return {
    verifications,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

/**
 * Retrieve a single verification record with strict user ownership enforcement
 */
export async function getVerificationById(id, userId) {
  const sql = `
    SELECT *
    FROM verification_requests
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [id, userId]);
  if (!rows || rows.length === 0) {
    return null;
  }

  return formatVerificationRecord(rows[0]);
}

/**
 * Retrieve raw image file path with ownership check
 */
export async function getVerificationImageFile(id, userId) {
  const sql = `
    SELECT id, user_id, image_path
    FROM verification_requests
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [id, userId]);
  if (!rows || rows.length === 0 || !rows[0].image_path) {
    return null;
  }

  return rows[0].image_path;
}
