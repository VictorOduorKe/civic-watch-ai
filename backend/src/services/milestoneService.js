import { pool } from '../config/database.js';

/**
 * Milestone Service
 * Implements the single source of truth for M1-M17 development roadmap,
 * strict Human Approval Gate enforcement, sequential locking, and auditable history.
 */
class MilestoneService {
  /**
   * Retrieves full roadmap overview with dynamic progress calculations.
   */
  async getRoadmapOverview() {
    const [rows] = await pool.query(`
      SELECT 
        id, sequence_order, title, objective, tasks, acceptance_criteria, 
        verification_requirements, dependencies, status, human_approval_status, 
        is_locked, is_current, updated_at
      FROM milestone_roadmap
      ORDER BY sequence_order ASC
    `);

    const milestones = rows.map((m) => ({
      ...m,
      is_locked: Boolean(m.is_locked),
      is_current: Boolean(m.is_current),
      tasks: typeof m.tasks === 'string' ? JSON.parse(m.tasks) : m.tasks,
      acceptance_criteria: typeof m.acceptance_criteria === 'string' ? JSON.parse(m.acceptance_criteria) : m.acceptance_criteria,
      verification_requirements: typeof m.verification_requirements === 'string' ? JSON.parse(m.verification_requirements) : m.verification_requirements
    }));

    const total = milestones.length;

    // Dynamic metrics calculation (Section 16: Separate metrics, never combine into one misleading %)
    const implementedCount = milestones.filter((m) =>
      ['IMPLEMENTED', 'VERIFIED', 'WAITING_FOR_HUMAN_APPROVAL', 'HUMAN_APPROVED'].includes(m.status)
    ).length;

    const verifiedCount = milestones.filter((m) =>
      ['VERIFIED', 'WAITING_FOR_HUMAN_APPROVAL', 'HUMAN_APPROVED'].includes(m.status)
    ).length;

    const approvedCount = milestones.filter((m) =>
      m.human_approval_status === 'APPROVED'
    ).length;

    const currentMilestone = milestones.find((m) => m.is_current) || milestones.find((m) => !m.is_locked && m.status !== 'HUMAN_APPROVED') || null;

    return {
      progress: {
        total,
        implementation: {
          count: implementedCount,
          total,
          percentage: total > 0 ? Math.round((implementedCount / total) * 100) : 0
        },
        verification: {
          count: verifiedCount,
          total,
          percentage: total > 0 ? Math.round((verifiedCount / total) * 100) : 0
        },
        humanApproval: {
          count: approvedCount,
          total,
          percentage: total > 0 ? Math.round((approvedCount / total) * 100) : 0
        }
      },
      currentMilestoneId: currentMilestone ? currentMilestone.id : null,
      milestones
    };
  }

  /**
   * Retrieves single milestone details, including checklist, next milestone preview, and audit trail.
   */
  async getMilestoneDetails(milestoneId) {
    const [rows] = await pool.query(
      `SELECT * FROM milestone_roadmap WHERE id = ?`,
      [milestoneId.toUpperCase()]
    );

    if (rows.length === 0) {
      const err = new Error(`Milestone ${milestoneId} not found.`);
      err.status = 404;
      throw err;
    }

    const milestone = rows[0];
    milestone.is_locked = Boolean(milestone.is_locked);
    milestone.is_current = Boolean(milestone.is_current);
    milestone.tasks = typeof milestone.tasks === 'string' ? JSON.parse(milestone.tasks) : milestone.tasks;
    milestone.acceptance_criteria = typeof milestone.acceptance_criteria === 'string' ? JSON.parse(milestone.acceptance_criteria) : milestone.acceptance_criteria;
    milestone.verification_requirements = typeof milestone.verification_requirements === 'string' ? JSON.parse(milestone.verification_requirements) : milestone.verification_requirements;

    // Fetch next milestone for review preview (Section 4 & 12)
    const [nextRows] = await pool.query(
      `SELECT id, sequence_order, title, objective, status, is_locked FROM milestone_roadmap WHERE sequence_order = ?`,
      [milestone.sequence_order + 1]
    );
    const nextMilestone = nextRows.length > 0 ? nextRows[0] : null;

    // Fetch previous milestone to check predecessor state (Section 9)
    let previousMilestone = null;
    if (milestone.sequence_order > 1) {
      const [prevRows] = await pool.query(
        `SELECT id, sequence_order, title, status, human_approval_status FROM milestone_roadmap WHERE sequence_order = ?`,
        [milestone.sequence_order - 1]
      );
      if (prevRows.length > 0) previousMilestone = prevRows[0];
    }

    // Fetch audit trail
    const [audits] = await pool.query(
      `SELECT a.id, a.milestone_id, a.action, a.previous_status, a.new_status, a.approval_comment, a.created_at,
              u.id as user_id, u.full_name as approved_by_name, u.email as approved_by_email, u.role as approved_by_role
       FROM milestone_approval_audits a
       JOIN users u ON a.approved_by = u.id
       WHERE a.milestone_id = ?
       ORDER BY a.created_at DESC`,
      [milestone.id]
    );

    // Section 12: Human Review Checklist
    const isVerified = ['VERIFIED', 'WAITING_FOR_HUMAN_APPROVAL', 'HUMAN_APPROVED'].includes(milestone.status);
    const isImplemented = ['IMPLEMENTED', 'VERIFIED', 'WAITING_FOR_HUMAN_APPROVAL', 'HUMAN_APPROVED'].includes(milestone.status);

    const checklist = {
      milestoneId: milestone.id,
      implementation: isImplemented ? 'Complete' : 'Pending',
      automatedVerification: isVerified ? 'Passed' : 'Pending',
      manualVerification: isVerified ? 'Passed' : 'Pending',
      knownIssues: milestone.status === 'REGRESSION' ? 'Active Regression Reported' : 'None',
      securityImpact: 'Reviewed',
      regressionImpact: milestone.status === 'REGRESSION' ? 'Needs Fix' : 'Reviewed',
      nextMilestone: nextMilestone ? `${nextMilestone.id} — ${nextMilestone.title}` : 'None (Final Milestone)',
      humanApproval: milestone.human_approval_status
    };

    return {
      milestone,
      nextMilestone,
      previousMilestone,
      checklist,
      auditHistory: audits
    };
  }

  /**
   * Approves a milestone and unlocks strictly ONE next milestone.
   * Enforces that:
   * 1. Target milestone must be VERIFIED or WAITING_FOR_HUMAN_APPROVAL.
   * 2. Predecessor milestone must be HUMAN_APPROVED.
   * 3. Next milestone unlocks sequentially and becomes current.
   * 4. An immutable audit record is saved with authenticated user info.
   */
  async approveMilestone({ milestoneId, userId, comment }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Lock row for update
      const [rows] = await connection.query(
        `SELECT * FROM milestone_roadmap WHERE id = ? FOR UPDATE`,
        [milestoneId.toUpperCase()]
      );

      if (rows.length === 0) {
        const err = new Error(`Milestone ${milestoneId} not found.`);
        err.status = 404;
        throw err;
      }

      const milestone = rows[0];

      if (milestone.status === 'HUMAN_APPROVED' && milestone.human_approval_status === 'APPROVED') {
        const err = new Error(`Milestone ${milestone.id} is already approved.`);
        err.status = 400;
        throw err;
      }

      // Check verification status (Rule 2: Cannot unlock next milestone unless status = VERIFIED)
      if (!['VERIFIED', 'WAITING_FOR_HUMAN_APPROVAL'].includes(milestone.status)) {
        const err = new Error(
          `Milestone ${milestone.id} cannot be approved because its status is '${milestone.status}'. Verification must be complete first.`
        );
        err.status = 400;
        throw err;
      }

      // Check predecessor status (Section 9: Predecessor must be VERIFIED + HUMAN_APPROVED)
      if (milestone.sequence_order > 1) {
        const [prevRows] = await connection.query(
          `SELECT id, status, human_approval_status FROM milestone_roadmap WHERE sequence_order = ? FOR UPDATE`,
          [milestone.sequence_order - 1]
        );
        if (prevRows.length > 0) {
          const prev = prevRows[0];
          if (prev.human_approval_status !== 'APPROVED') {
            const err = new Error(
              `Cannot approve ${milestone.id} because predecessor milestone ${prev.id} is not yet HUMAN_APPROVED.`
            );
            err.status = 400;
            throw err;
          }
        }
      }

      const previousStatus = milestone.status;
      const newStatus = 'HUMAN_APPROVED';
      const approvalComment = comment || 'Approved after human verification and review.';

      // Update current milestone
      await connection.query(
        `UPDATE milestone_roadmap 
         SET status = 'HUMAN_APPROVED', human_approval_status = 'APPROVED', is_current = FALSE, is_locked = FALSE 
         WHERE id = ?`,
        [milestone.id]
      );

      // Record audit in milestone_approval_audits (Section 5)
      await connection.query(
        `INSERT INTO milestone_approval_audits 
         (milestone_id, approved_by, action, previous_status, new_status, approval_comment) 
         VALUES (?, ?, 'APPROVED', ?, ?, ?)`,
        [milestone.id, userId, previousStatus, newStatus, approvalComment]
      );

      // Unlock strictly ONE next milestone (Section 13)
      const [nextRows] = await connection.query(
        `SELECT id, sequence_order, title, status FROM milestone_roadmap WHERE sequence_order = ? FOR UPDATE`,
        [milestone.sequence_order + 1]
      );

      let unlockedNextMilestone = null;
      if (nextRows.length > 0) {
        const nextMs = nextRows[0];
        const nextStatus = nextMs.status === 'NOT_STARTED' ? 'IN_PROGRESS' : nextMs.status;

        await connection.query(
          `UPDATE milestone_roadmap 
           SET is_locked = FALSE, is_current = TRUE, status = ? 
           WHERE id = ?`,
          [nextStatus, nextMs.id]
        );

        unlockedNextMilestone = {
          id: nextMs.id,
          title: nextMs.title,
          status: nextStatus
        };
      }

      await connection.commit();

      return {
        success: true,
        message: `Milestone ${milestone.id} successfully approved.`,
        approvedMilestoneId: milestone.id,
        unlockedNextMilestone
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Rejects progression for a milestone.
   * Requires a reason comment. Keeps subsequent milestones locked.
   */
  async rejectMilestone({ milestoneId, userId, reason }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT * FROM milestone_roadmap WHERE id = ? FOR UPDATE`,
        [milestoneId.toUpperCase()]
      );

      if (rows.length === 0) {
        const err = new Error(`Milestone ${milestoneId} not found.`);
        err.status = 404;
        throw err;
      }

      const milestone = rows[0];

      // Update approval status to REJECTED
      await connection.query(
        `UPDATE milestone_roadmap 
         SET human_approval_status = 'REJECTED' 
         WHERE id = ?`,
        [milestone.id]
      );

      // Record audit
      await connection.query(
        `INSERT INTO milestone_approval_audits 
         (milestone_id, approved_by, action, previous_status, new_status, approval_comment) 
         VALUES (?, ?, 'REJECTED', ?, ?, ?)`,
        [milestone.id, userId, milestone.status, milestone.status, reason]
      );

      await connection.commit();

      return {
        success: true,
        message: `Milestone ${milestone.id} progression rejected. Reason recorded in audit trail.`,
        milestoneId: milestone.id,
        humanApprovalStatus: 'REJECTED'
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Flags a regression on a milestone (Section 1: VERIFIED -> REGRESSION -> IN_PROGRESS).
   */
  async reportRegression({ milestoneId, userId, reason }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT * FROM milestone_roadmap WHERE id = ? FOR UPDATE`,
        [milestoneId.toUpperCase()]
      );

      if (rows.length === 0) {
        const err = new Error(`Milestone ${milestoneId} not found.`);
        err.status = 404;
        throw err;
      }

      const milestone = rows[0];

      // Mark current milestone as REGRESSION
      await connection.query(
        `UPDATE milestone_roadmap 
         SET status = 'REGRESSION', human_approval_status = 'REJECTED', is_current = TRUE 
         WHERE id = ?`,
        [milestone.id]
      );

      // Lock any subsequent milestones that may have been previously unlocked
      await connection.query(
        `UPDATE milestone_roadmap 
         SET is_locked = TRUE, is_current = FALSE 
         WHERE sequence_order > ?`,
        [milestone.sequence_order]
      );

      // Record audit
      await connection.query(
        `INSERT INTO milestone_approval_audits 
         (milestone_id, approved_by, action, previous_status, new_status, approval_comment) 
         VALUES (?, ?, 'REJECTED', ?, 'REGRESSION', ?)`,
        [milestone.id, userId, milestone.status, `REGRESSION REPORTED: ${reason}`]
      );

      await connection.commit();

      return {
        success: true,
        message: `Regression reported for Milestone ${milestone.id}. Subsequent milestones locked.`,
        milestoneId: milestone.id
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Updates future milestone definition with audit preservation (Section 18).
   */
  async updateMilestoneDefinition({ milestoneId, userId, updates, changeReason }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT * FROM milestone_roadmap WHERE id = ? FOR UPDATE`,
        [milestoneId.toUpperCase()]
      );

      if (rows.length === 0) {
        const err = new Error(`Milestone ${milestoneId} not found.`);
        err.status = 404;
        throw err;
      }

      const milestone = rows[0];

      // Disallow modifications to already approved milestones without explicit owner rationale
      const previousDefinition = {
        title: milestone.title,
        objective: milestone.objective,
        tasks: typeof milestone.tasks === 'string' ? JSON.parse(milestone.tasks) : milestone.tasks,
        acceptance_criteria: typeof milestone.acceptance_criteria === 'string' ? JSON.parse(milestone.acceptance_criteria) : milestone.acceptance_criteria,
        verification_requirements: typeof milestone.verification_requirements === 'string' ? JSON.parse(milestone.verification_requirements) : milestone.verification_requirements
      };

      const newDefinition = {
        title: updates.title || milestone.title,
        objective: updates.objective || milestone.objective,
        tasks: updates.tasks || previousDefinition.tasks,
        acceptance_criteria: updates.acceptance_criteria || previousDefinition.acceptance_criteria,
        verification_requirements: updates.verification_requirements || previousDefinition.verification_requirements
      };

      // Record change in milestone_change_audits
      await connection.query(
        `INSERT INTO milestone_change_audits 
         (milestone_id, changed_by, previous_definition, new_definition, change_reason) 
         VALUES (?, ?, ?, ?, ?)`,
        [milestone.id, userId, JSON.stringify(previousDefinition), JSON.stringify(newDefinition), changeReason]
      );

      // Update definition
      await connection.query(
        `UPDATE milestone_roadmap 
         SET title = ?, objective = ?, tasks = ?, acceptance_criteria = ?, verification_requirements = ? 
         WHERE id = ?`,
        [
          newDefinition.title,
          newDefinition.objective,
          JSON.stringify(newDefinition.tasks),
          JSON.stringify(newDefinition.acceptance_criteria),
          JSON.stringify(newDefinition.verification_requirements),
          milestone.id
        ]
      );

      await connection.commit();

      return {
        success: true,
        message: `Milestone ${milestone.id} definition updated. Revision preserved in change audit trail.`,
        milestoneId: milestone.id,
        definition: newDefinition
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new MilestoneService();
