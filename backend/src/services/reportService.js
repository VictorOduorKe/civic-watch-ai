import fs from 'fs';
import { pool } from '../config/database.js';

/**
 * Retrieve all active report categories.
 */
export async function getActiveCategories() {
  const [categories] = await pool.query(
    'SELECT id, name, description FROM report_categories WHERE is_active = TRUE ORDER BY id ASC'
  );
  return categories;
}

/**
 * Create a new incident report with atomic transaction and attachment records.
 */
export async function createReport({ userId, reportData, files = [] }) {
  // 1. Verify category is valid and active
  const [categories] = await pool.query(
    'SELECT id, name FROM report_categories WHERE id = ? AND is_active = TRUE',
    [reportData.category_id]
  );

  if (categories.length === 0) {
    // Clean up uploaded files if category check fails
    cleanupFiles(files);
    const err = new Error('Selected incident category is invalid or inactive.');
    err.status = 400;
    throw err;
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 2. Insert base report record
    const insertSql = `
      INSERT INTO reports (
        user_id,
        category_id,
        title,
        description,
        county,
        sub_county,
        ward,
        location_text,
        latitude,
        longitude,
        incident_date,
        incident_time,
        is_anonymous,
        preferred_contact,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
    `;

    const [insertResult] = await conn.execute(insertSql, [
      userId,
      reportData.category_id,
      reportData.title,
      reportData.description,
      reportData.county,
      reportData.sub_county || null,
      reportData.ward || null,
      reportData.location_text || null,
      reportData.latitude !== undefined && reportData.latitude !== null ? reportData.latitude : null,
      reportData.longitude !== undefined && reportData.longitude !== null ? reportData.longitude : null,
      reportData.incident_date || null,
      reportData.incident_time || null,
      reportData.is_anonymous ? 1 : 0,
      reportData.preferred_contact || 'none'
    ]);

    const reportId = insertResult.insertId;

    // 3. Generate unique server-side reference: CWK-YYYY-XXXXXX
    const currentYear = new Date().getFullYear();
    const reference = `CWK-${currentYear}-${String(reportId).padStart(6, '0')}`;

    await conn.execute(
      'UPDATE reports SET report_reference = ? WHERE id = ?',
      [reference, reportId]
    );

    // 4. Record attachments if any
    if (files && files.length > 0) {
      const attachmentSql = `
        INSERT INTO report_attachments (
          report_id,
          original_name,
          stored_name,
          mime_type,
          size_bytes,
          storage_path
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      for (const file of files) {
        await conn.execute(attachmentSql, [
          reportId,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
          file.path
        ]);
      }
    }

    await conn.commit();

    return {
      reference,
      status: 'Submitted',
      category: categories[0].name,
      title: reportData.title,
      county: reportData.county,
      isAnonymous: Boolean(reportData.is_anonymous),
      attachmentCount: files.length,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    await conn.rollback();
    // Clean up uploaded files to avoid orphan storage
    cleanupFiles(files);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Helper to safely remove uploaded files if a transaction fails
 */
function cleanupFiles(files) {
  if (!files || !Array.isArray(files)) return;
  for (const file of files) {
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error(`[Upload] Failed to clean up file ${file.path}:`, e.message);
      }
    }
  }
}

/**
 * Get total reports submitted by a specific user
 */
export async function getUserReportCount(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM reports WHERE user_id = ?',
    [userId]
  );
  return rows[0]?.total || 0;
}
