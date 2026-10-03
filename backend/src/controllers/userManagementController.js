import {
  getUsersList,
  getUserDetailsById,
  updateUserRole,
  suspendUser,
  reactivateUser,
  provisionCountyLiaison,
  updateIdentityVerification,
  createStaffInvitation,
  getUserManagementAudits,
  getUserStats
} from '../models/userManagementModel.js';

/**
 * M14-1 — Administrative User & Role Management Controller
 */

export async function listUsersHandler(req, res, next) {
  try {
    const { page, limit, search, role, status, identity_status, county, is_county_liaison } = req.query;
    const result = await getUsersList({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      role,
      status,
      identity_status,
      county,
      is_county_liaison
    });

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserDetailsHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const user = await getUserDetailsById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function changeUserRoleHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { role, reason } = req.body;
    const actorId = req.user.id;

    const result = await updateUserRole({
      userId,
      newRole: role,
      actorId,
      reason
    });

    res.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function suspendUserHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { reason } = req.body;
    const actorId = req.user.id;

    const result = await suspendUser({
      userId,
      actorId,
      reason
    });

    res.json({
      success: true,
      message: 'User account suspended immediately and session revoked',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function reactivateUserHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { reason } = req.body;
    const actorId = req.user.id;

    const result = await reactivateUser({
      userId,
      actorId,
      reason
    });

    res.json({
      success: true,
      message: 'User account reactivated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function provisionCountyLiaisonHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { is_county_liaison, liaison_county, liaison_sub_county, reason } = req.body;
    const actorId = req.user.id;

    const result = await provisionCountyLiaison({
      userId,
      actorId,
      isCountyLiaison: is_county_liaison !== undefined ? is_county_liaison : true,
      liaisonCounty: liaison_county,
      liaisonSubCounty: liaison_sub_county,
      reason
    });

    res.json({
      success: true,
      message: result.isCountyLiaison
        ? `User successfully designated as County Liaison for ${result.liaisonCounty}`
        : 'County liaison status revoked',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function updateIdentityHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { status, reason, id_document_type, id_document_ref } = req.body;
    const actorId = req.user.id;

    const result = await updateIdentityVerification({
      userId,
      actorId,
      status,
      reason,
      idDocumentType: id_document_type,
      idDocumentRef: id_document_ref
    });

    res.json({
      success: true,
      message: `User identity status updated to ${status}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function inviteStaffHandler(req, res, next) {
  try {
    const { email, full_name, role, is_county_liaison, liaison_county } = req.body;
    const actorId = req.user.id;

    const result = await createStaffInvitation({
      email,
      fullName: full_name,
      role,
      isCountyLiaison: Boolean(is_county_liaison),
      liaisonCounty: liaison_county,
      actorId
    });

    res.status(201).json({
      success: true,
      message: `Invitation issued for ${role} staff member`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserAuditsHandler(req, res, next) {
  try {
    const { page, limit, action } = req.query;
    const targetUserId = req.params.id ? Number(req.params.id) : (req.query.targetUserId ? Number(req.query.targetUserId) : undefined);

    const result = await getUserManagementAudits({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      targetUserId,
      action
    });

    res.json({
      success: true,
      data: result.audits,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserStatsHandler(req, res, next) {
  try {
    const stats = await getUserStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}
