import path from 'path';
import fs from 'fs';
import * as incidentService from '../services/incidentManagementService.js';

/**
 * GET /api/admin/incidents
 * List incidents with search, filters, pagination, and sorting.
 * Accessible to Admin, Moderator, Analyst.
 */
export async function listIncidents(req, res, next) {
  try {
    const result = await incidentService.getAdminIncidents(req.query);
    return res.status(200).json({
      success: true,
      incidents: result.incidents,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/incidents/assignees
 * List eligible staff members for assignment.
 * Accessible to Admin, Moderator.
 */
export async function getAssignees(req, res, next) {
  try {
    const assignees = await incidentService.getEligibleAssignees();
    return res.status(200).json({
      success: true,
      assignees
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/incidents/:reference
 * Full incident management detail.
 * Accessible to Admin, Moderator, Analyst.
 */
export async function getIncidentDetail(req, res, next) {
  try {
    const { reference } = req.params;
    const incident = await incidentService.getAdminIncidentDetail(reference);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    return res.status(200).json({
      success: true,
      incident
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/incidents/:reference/status
 * Execute status transition.
 * Accessible to Admin, Moderator only.
 */
export async function updateStatus(req, res, next) {
  try {
    const { reference } = req.params;
    const result = await incidentService.changeIncidentStatus({
      reference,
      status: req.body.status,
      note: req.body.note,
      reopen: req.body.reopen,
      publish_citizen_update: req.body.publish_citizen_update,
      citizen_message: req.body.citizen_message,
      user: req.user
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/incidents/:reference/assign
 * Assign or reassign incident to staff.
 * Accessible to Admin, Moderator only.
 */
export async function assignIncident(req, res, next) {
  try {
    const { reference } = req.params;
    const result = await incidentService.assignIncident({
      reference,
      assigned_to_user_id: req.body.assigned_to_user_id,
      assignment_note: req.body.assignment_note,
      update_status_to_assigned: req.body.update_status_to_assigned,
      user: req.user
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/incidents/:reference/unassign
 * Unassign currently assigned staff.
 * Accessible to Admin, Moderator only.
 */
export async function unassignIncident(req, res, next) {
  try {
    const { reference } = req.params;
    const result = await incidentService.unassignIncident({
      reference,
      reason: req.body?.reason,
      user: req.user
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/incidents/:reference/internal-notes
 * Create internal note (admin-only).
 * Accessible to Admin, Moderator only.
 */
export async function addInternalNote(req, res, next) {
  try {
    const { reference } = req.params;
    const note = await incidentService.addInternalNote({
      reference,
      note: req.body.note,
      user: req.user
    });

    return res.status(201).json({
      success: true,
      message: 'Internal note added successfully',
      note
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/incidents/:reference/updates
 * Publish citizen-visible update.
 * Accessible to Admin, Moderator only.
 */
export async function addCitizenUpdate(req, res, next) {
  try {
    const { reference } = req.params;
    const update = await incidentService.addCitizenUpdate({
      reference,
      message: req.body.message,
      user: req.user
    });

    return res.status(201).json({
      success: true,
      message: 'Citizen update published successfully',
      update
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/incidents/:reference/referrals
 * Create referral for an incident.
 * Accessible to Admin, Moderator only.
 */
export async function createReferral(req, res, next) {
  try {
    const { reference } = req.params;
    const referral = await incidentService.createReferral({
      reference,
      referral_type: req.body.referral_type,
      organization_name: req.body.organization_name,
      reason: req.body.reason,
      user: req.user
    });

    return res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      referral
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/incidents/:reference/referrals/:referralId
 * Update referral status.
 * Accessible to Admin, Moderator only.
 */
export async function updateReferralStatus(req, res, next) {
  try {
    const { reference, referralId } = req.params;
    const result = await incidentService.updateReferralStatus({
      reference,
      referralId,
      status: req.body.status,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Referral status updated',
      result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/incidents/:reference/attachments/:attachmentId
 * Securely download an attachment associated with an incident.
 * Accessible to Admin, Moderator, Analyst.
 */
export async function downloadIncidentAttachment(req, res, next) {
  try {
    const { reference, attachmentId } = req.params;
    const attachment = await incidentService.getAttachmentForAdmin({
      reference,
      attachmentId
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const absolutePath = path.resolve(attachment.storage_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'Attachment file is unavailable on storage'
      });
    }

    res.setHeader('Content-Type', attachment.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.original_name)}"`);

    return res.download(absolutePath, attachment.original_name);
  } catch (error) {
    next(error);
  }
}
