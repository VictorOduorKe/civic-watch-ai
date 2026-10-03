import { pool } from '../config/database.js';

export const participationModel = {
  // ==========================================
  // 1. PETITIONS
  // ==========================================

  async listPetitions({ page = 1, limit = 20, status, category, county, search, isPublic = true }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (isPublic) {
      if (status) {
        conditions.push('p.status = ?');
        params.push(status);
      } else {
        conditions.push("p.status IN ('PUBLISHED', 'QUORUM_REACHED', 'CLOSED')");
      }
    } else if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (category) {
      conditions.push('p.category = ?');
      params.push(category);
    }

    if (county) {
      conditions.push('(p.county = ? OR p.county IS NULL)');
      params.push(county);
    }

    if (search) {
      conditions.push('(p.title LIKE ? OR p.summary LIKE ? OR p.target_authority LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM petitions p ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        p.id, p.title, p.summary, p.description, p.purpose, p.category,
        p.county, p.sub_county, p.target_authority, p.requested_action,
        p.supporting_information, p.opening_date, p.closing_date,
        p.quorum_requirement, p.total_signatures, p.verified_signatures,
        p.status, p.rejection_reason, p.creator_id, p.published_at,
        p.quorum_reached_at, p.closed_at, p.created_at, p.updated_at,
        u.full_name AS creator_name, u.role AS creator_role
      FROM petitions p
      LEFT JOIN users u ON p.creator_id = u.id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN p.status = 'QUORUM_REACHED' THEN 1
          WHEN p.status = 'PUBLISHED' THEN 2
          ELSE 3
        END,
        p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, limit, offset]);

    return {
      petitions: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getPetitionById(id) {
    const [rows] = await pool.query(
      `
      SELECT 
        p.*,
        u.full_name AS creator_name,
        u.role AS creator_role,
        u.is_county_liaison AS creator_is_liaison,
        u.liaison_county AS creator_liaison_county
      FROM petitions p
      LEFT JOIN users u ON p.creator_id = u.id
      WHERE p.id = ?
    `,
      [id]
    );
    return rows[0] || null;
  },

  async createPetition(data) {
    const {
      title,
      summary,
      description,
      purpose,
      category,
      county,
      sub_county,
      target_authority,
      requested_action,
      supporting_information,
      opening_date,
      closing_date,
      quorum_requirement,
      creator_id,
      status = 'DRAFT'
    } = data;

    const effectiveOpeningDate = opening_date || new Date().toISOString().slice(0, 10);
    const effectiveClosingDate =
      closing_date || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const effectiveQuorum = quorum_requirement ? Number(quorum_requirement) : 50;

    const [result] = await pool.query(
      `
      INSERT INTO petitions (
        title, summary, description, purpose, category,
        county, sub_county, target_authority, requested_action,
        supporting_information, opening_date, closing_date,
        quorum_requirement, creator_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        title,
        summary,
        description,
        purpose,
        category,
        county || null,
        sub_county || null,
        target_authority,
        requested_action,
        supporting_information || null,
        effectiveOpeningDate,
        effectiveClosingDate,
        effectiveQuorum,
        creator_id,
        status
      ]
    );

    return result.insertId;
  },

  async updatePetition(id, updates) {
    const fields = [];
    const params = [];

    const allowed = [
      'title',
      'summary',
      'description',
      'purpose',
      'category',
      'county',
      'sub_county',
      'target_authority',
      'requested_action',
      'supporting_information',
      'closing_date',
      'quorum_requirement'
    ];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`\`${key}\` = ?`);
        params.push(updates[key]);
      }
    }

    if (fields.length === 0) return false;

    params.push(id);
    const [res] = await pool.query(
      `UPDATE petitions SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return res.affectedRows > 0;
  },

  async updatePetitionStatus(id, { status, reason, publishedAt, quorumReachedAt, closedAt }) {
    const fields = ['`status` = ?'];
    const params = [status];

    if (reason !== undefined) {
      fields.push('`rejection_reason` = ?');
      params.push(reason);
    }
    if (publishedAt) {
      fields.push('`published_at` = ?');
      params.push(publishedAt);
    }
    if (quorumReachedAt) {
      fields.push('`quorum_reached_at` = ?');
      params.push(quorumReachedAt);
    }
    if (closedAt) {
      fields.push('`closed_at` = ?');
      params.push(closedAt);
    }

    params.push(id);
    const [res] = await pool.query(
      `UPDATE petitions SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return res.affectedRows > 0;
  },

  // ==========================================
  // 2. PETITION SIGNATURES & QUORUM
  // ==========================================

  async getSignature(petitionId, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM petition_signatures WHERE petition_id = ? AND user_id = ?',
      [petitionId, userId]
    );
    return rows[0] || null;
  },

  async getSignaturesByPetition(petitionId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM petition_signatures WHERE petition_id = ? AND is_withdrawn = 0',
      [petitionId]
    );
    const total = countRows[0].total;

    // Privacy-preserving signature list: omit emails, phones, IDs, tokens.
    const [rows] = await pool.query(
      `
      SELECT 
        ps.id,
        ps.is_verified_signer,
        ps.signer_county,
        ps.comment,
        ps.created_at,
        CASE 
          WHEN ps.is_verified_signer = 1 THEN CONCAT(LEFT(u.full_name, 1), '*** (Verified Citizen)')
          ELSE CONCAT(LEFT(u.full_name, 1), '*** (Citizen)')
        END AS display_name
      FROM petition_signatures ps
      JOIN users u ON ps.user_id = u.id
      WHERE ps.petition_id = ? AND ps.is_withdrawn = 0
      ORDER BY ps.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [petitionId, limit, offset]
    );

    return {
      signatures: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async addSignature(petitionId, userId, { isVerifiedSigner, signerCounty, comment }) {
    const [res] = await pool.query(
      `
      INSERT INTO petition_signatures (
        petition_id, user_id, is_verified_signer, signer_county, comment
      ) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        is_withdrawn = 0,
        withdrawn_at = NULL,
        is_verified_signer = VALUES(is_verified_signer),
        comment = VALUES(comment)
    `,
      [petitionId, userId, isVerifiedSigner ? 1 : 0, signerCounty || null, comment || null]
    );
    return res.insertId;
  },

  async withdrawSignature(petitionId, userId) {
    const [res] = await pool.query(
      `
      UPDATE petition_signatures 
      SET is_withdrawn = 1, withdrawn_at = NOW()
      WHERE petition_id = ? AND user_id = ? AND is_withdrawn = 0
    `,
      [petitionId, userId]
    );
    return res.affectedRows > 0;
  },

  async recalculateQuorum(petitionId, connection = pool) {
    // 1. Count active total & verified signatures
    const [sigRows] = await connection.query(
      `
      SELECT 
        COUNT(*) AS total_sigs,
        SUM(CASE WHEN is_verified_signer = 1 THEN 1 ELSE 0 END) AS verified_sigs
      FROM petition_signatures 
      WHERE petition_id = ? AND is_withdrawn = 0
    `,
      [petitionId]
    );

    const totalSigs = sigRows[0].total_sigs || 0;
    const verifiedSigs = Number(sigRows[0].verified_sigs || 0);

    // 2. Fetch petition quorum requirement and current status
    const [petRows] = await connection.query(
      'SELECT id, quorum_requirement, status, quorum_reached_at FROM petitions WHERE id = ?',
      [petitionId]
    );

    if (petRows.length === 0) return null;
    const petition = petRows[0];

    const quorumReached = verifiedSigs >= petition.quorum_requirement;
    let newStatus = petition.status;
    let quorumReachedAt = petition.quorum_reached_at;

    if (quorumReached && petition.status === 'PUBLISHED') {
      newStatus = 'QUORUM_REACHED';
      quorumReachedAt = new Date();
    } else if (!quorumReached && petition.status === 'QUORUM_REACHED') {
      // In case signatures were withdrawn below threshold
      newStatus = 'PUBLISHED';
      quorumReachedAt = null;
    }

    await connection.query(
      `
      UPDATE petitions
      SET 
        total_signatures = ?,
        verified_signatures = ?,
        status = ?,
        quorum_reached_at = ?
      WHERE id = ?
    `,
      [totalSigs, verifiedSigs, newStatus, quorumReachedAt, petitionId]
    );

    return {
      totalSignatures: totalSigs,
      verifiedSignatures: verifiedSigs,
      quorumRequirement: petition.quorum_requirement,
      quorumReached,
      previousStatus: petition.status,
      newStatus
    };
  },

  // ==========================================
  // 3. BUDGET HEARINGS
  // ==========================================

  async listHearings({ page = 1, limit = 20, county, status, from_date, to_date, search, isPublic = true }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (isPublic) {
      if (status) {
        conditions.push('bh.status = ?');
        params.push(status);
      } else {
        conditions.push("bh.status IN ('PUBLISHED', 'ONGOING', 'COMPLETED')");
      }
    } else if (status) {
      conditions.push('bh.status = ?');
      params.push(status);
    }

    if (county) {
      conditions.push('bh.county = ?');
      params.push(county);
    }

    if (from_date) {
      conditions.push('bh.hearing_date >= ?');
      params.push(from_date);
    }

    if (to_date) {
      conditions.push('bh.hearing_date <= ?');
      params.push(to_date);
    }

    if (search) {
      conditions.push('(bh.title LIKE ? OR bh.description LIKE ? OR bh.venue LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM budget_hearings bh ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        bh.*,
        u.full_name AS creator_name,
        u.role AS creator_role
      FROM budget_hearings bh
      LEFT JOIN users u ON bh.created_by = u.id
      ${whereClause}
      ORDER BY bh.hearing_date ASC, bh.start_time ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, limit, offset]);

    return {
      hearings: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getHearingById(id) {
    const [rows] = await pool.query(
      `
      SELECT 
        bh.*,
        u.full_name AS creator_name,
        u.role AS creator_role,
        u.is_county_liaison AS creator_is_liaison,
        u.liaison_county AS creator_liaison_county
      FROM budget_hearings bh
      LEFT JOIN users u ON bh.created_by = u.id
      WHERE bh.id = ?
    `,
      [id]
    );
    return rows[0] || null;
  },

  async createHearing(data) {
    const {
      title,
      county,
      sub_county,
      ward,
      description,
      fiscal_year,
      hearing_date,
      start_time,
      end_time,
      venue,
      participation_instructions,
      contact_information,
      created_by,
      status = 'DRAFT'
    } = data;

    const publishedAt = status === 'PUBLISHED' ? new Date() : null;

    const [res] = await pool.query(
      `
      INSERT INTO budget_hearings (
        title, county, sub_county, ward, description, fiscal_year,
        hearing_date, start_time, end_time, venue, participation_instructions,
        contact_information, status, created_by, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        title,
        county,
        sub_county || null,
        ward || null,
        description,
        fiscal_year || 'FY 2026/2027',
        hearing_date,
        start_time,
        end_time,
        venue,
        participation_instructions || null,
        contact_information || null,
        status,
        created_by,
        publishedAt
      ]
    );

    return res.insertId;
  },

  async updateHearing(id, updates) {
    const fields = [];
    const params = [];

    const allowed = [
      'title',
      'county',
      'sub_county',
      'ward',
      'description',
      'fiscal_year',
      'hearing_date',
      'start_time',
      'end_time',
      'venue',
      'participation_instructions',
      'contact_information',
      'status',
      'updated_by'
    ];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`\`${key}\` = ?`);
        params.push(updates[key]);
      }
    }

    if (updates.status === 'PUBLISHED') {
      fields.push('`published_at` = COALESCE(`published_at`, NOW())');
    }

    if (fields.length === 0) return false;

    params.push(id);
    const [res] = await pool.query(
      `UPDATE budget_hearings SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return res.affectedRows > 0;
  },

  async cancelHearing(id, reason, cancelledBy) {
    const [res] = await pool.query(
      `
      UPDATE budget_hearings 
      SET 
        status = 'CANCELLED',
        cancellation_reason = ?,
        cancelled_at = NOW(),
        updated_by = ?
      WHERE id = ?
    `,
      [reason, cancelledBy, id]
    );
    return res.affectedRows > 0;
  },

  // ==========================================
  // 4. LEGISLATIVE ITEMS & FEEDBACK
  // ==========================================

  async listLegislativeItems({ page = 1, limit = 20, level, county, category, status, search, isPublic = true }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (isPublic) {
      if (status) {
        conditions.push('li.status = ?');
        params.push(status);
      } else {
        conditions.push("li.status = 'ACTIVE'");
      }
    } else if (status) {
      conditions.push('li.status = ?');
      params.push(status);
    }

    if (level) {
      conditions.push('li.level = ?');
      params.push(level);
    }

    if (county) {
      conditions.push('(li.county = ? OR li.county IS NULL)');
      params.push(county);
    }

    if (category) {
      conditions.push('li.category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(li.title LIKE ? OR li.summary LIKE ? OR li.reference_code LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM legislative_items li ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        li.*,
        (SELECT COUNT(*) FROM legislative_feedback lf WHERE lf.legislative_item_id = li.id AND lf.status = 'PUBLISHED') AS feedback_count
      FROM legislative_items li
      ${whereClause}
      ORDER BY li.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, limit, offset]);

    return {
      items: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getLegislativeItemById(id) {
    const [rows] = await pool.query(
      `
      SELECT 
        li.*,
        (SELECT COUNT(*) FROM legislative_feedback lf WHERE lf.legislative_item_id = li.id AND lf.status = 'PUBLISHED') AS published_feedback_count,
        (SELECT COUNT(*) FROM legislative_feedback lf WHERE lf.legislative_item_id = li.id) AS total_feedback_count
      FROM legislative_items li
      WHERE li.id = ?
    `,
      [id]
    );
    return rows[0] || null;
  },

  async createLegislativeItem(data) {
    const {
      reference_code,
      title,
      summary,
      body_text,
      category,
      level,
      county,
      sponsoring_body,
      feedback_deadline,
      created_by
    } = data;

    const [res] = await pool.query(
      `
      INSERT INTO legislative_items (
        reference_code, title, summary, body_text, category,
        level, county, sponsoring_body, feedback_deadline, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        reference_code,
        title,
        summary,
        body_text || null,
        category,
        level || 'NATIONAL',
        county || null,
        sponsoring_body,
        feedback_deadline,
        created_by
      ]
    );

    return res.insertId;
  },

  async listFeedbackByItem(itemId, { page = 1, limit = 20, status, stance, isPublic = true, userId = null }) {
    const offset = (page - 1) * limit;
    const conditions = ['lf.legislative_item_id = ?'];
    const params = [itemId];

    if (isPublic) {
      // Citizens see all PUBLISHED feedback, plus their own submissions even if SUBMITTED
      if (userId) {
        conditions.push("(lf.status = 'PUBLISHED' OR lf.user_id = ?)");
        params.push(userId);
      } else {
        conditions.push("lf.status = 'PUBLISHED'");
      }
    } else if (status) {
      conditions.push('lf.status = ?');
      params.push(status);
    }

    if (stance) {
      conditions.push('lf.stance = ?');
      params.push(stance);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countSql = `SELECT COUNT(*) AS total FROM legislative_feedback lf ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        lf.id,
        lf.legislative_item_id,
        lf.title,
        lf.feedback_text,
        lf.stance,
        lf.category,
        lf.county,
        lf.status,
        lf.moderation_notes,
        lf.created_at,
        CASE 
          WHEN u.identity_status = 'VERIFIED' THEN CONCAT(LEFT(u.full_name, 1), '*** (Verified Citizen)')
          ELSE CONCAT(LEFT(u.full_name, 1), '*** (Citizen)')
        END AS author_display_name,
        lf.user_id = ? AS is_author
      FROM legislative_feedback lf
      JOIN users u ON lf.user_id = u.id
      ${whereClause}
      ORDER BY lf.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [userId || 0, ...params, limit, offset]);

    return {
      feedback: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getFeedbackById(id) {
    const [rows] = await pool.query(
      `
      SELECT 
        lf.*,
        u.full_name AS author_name,
        u.email AS author_email,
        u.county AS author_county,
        u.identity_status AS author_identity_status,
        m.full_name AS moderator_name
      FROM legislative_feedback lf
      JOIN users u ON lf.user_id = u.id
      LEFT JOIN users m ON lf.moderated_by = m.id
      WHERE lf.id = ?
    `,
      [id]
    );
    return rows[0] || null;
  },

  async createFeedback(data) {
    const { legislative_item_id, user_id, title, feedback_text, stance, category, county } = data;

    const [res] = await pool.query(
      `
      INSERT INTO legislative_feedback (
        legislative_item_id, user_id, title, feedback_text, stance, category, county
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        legislative_item_id,
        user_id,
        title,
        feedback_text,
        stance || 'NEUTRAL',
        category || null,
        county || null
      ]
    );

    return res.insertId;
  },

  async moderateFeedback(id, { status, notes, moderatedBy }) {
    const [res] = await pool.query(
      `
      UPDATE legislative_feedback
      SET 
        status = ?,
        moderation_notes = ?,
        moderated_by = ?,
        moderated_at = NOW()
      WHERE id = ?
    `,
      [status, notes || null, moderatedBy, id]
    );
    return res.affectedRows > 0;
  },

  // ==========================================
  // 5. PARTICIPATION AUDITS
  // ==========================================

  async createAudit({ entityType, entityId, action, actorId, actorRole, previousState, newState, reason }) {
    const [res] = await pool.query(
      `
      INSERT INTO participation_audits (
        entity_type, entity_id, action, actor_id, actor_role,
        previous_state, new_state, reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        entityType,
        entityId,
        action,
        actorId,
        actorRole,
        previousState ? JSON.stringify(previousState) : null,
        newState ? JSON.stringify(newState) : null,
        reason || null
      ]
    );
    return res.insertId;
  },

  async getAuditsByEntity(entityType, entityId) {
    const [rows] = await pool.query(
      `
      SELECT 
        pa.*,
        u.full_name AS actor_name
      FROM participation_audits pa
      LEFT JOIN users u ON pa.actor_id = u.id
      WHERE pa.entity_type = ? AND pa.entity_id = ?
      ORDER BY pa.created_at DESC
    `,
      [entityType, entityId]
    );
    return rows;
  },

  async getParticipationStats() {
    const [petRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_petitions,
        SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) AS active_petitions,
        SUM(CASE WHEN status = 'QUORUM_REACHED' THEN 1 ELSE 0 END) AS quorum_reached_petitions,
        SUM(total_signatures) AS total_signatures_cast,
        SUM(verified_signatures) AS verified_signatures_cast
      FROM petitions
    `);

    const [hearingRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_hearings,
        SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) AS upcoming_hearings,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_hearings
      FROM budget_hearings
    `);

    const [legRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_bills,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_bills
      FROM legislative_items
    `);

    const [fbRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_feedback,
        SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) AS published_feedback,
        SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) AS pending_feedback
      FROM legislative_feedback
    `);

    return {
      petitions: petRows[0],
      hearings: hearingRows[0],
      legislative: legRows[0],
      feedback: fbRows[0]
    };
  }
};
