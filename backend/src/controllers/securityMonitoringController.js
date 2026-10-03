import securityMonitoringService from '../services/securityMonitoringService.js';

export async function getSecurityEvents(req, res, next) {
  try {
    const result = await securityMonitoringService.getSecurityEvents(req.query);
    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getSecurityEventById(req, res, next) {
  try {
    const event = await securityMonitoringService.getSecurityEventById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Security event not found.'
      });
    }
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSecurityEventStatus(req, res, next) {
  try {
    const { status, resolutionNote } = req.body;
    const updated = await securityMonitoringService.updateSecurityEventStatus({
      id: req.params.id,
      status,
      reviewedBy: req.user.id,
      reviewerEmail: req.user.email,
      reviewerRole: req.user.role,
      resolutionNote
    });

    res.status(200).json({
      success: true,
      message: `Security event status updated to ${status}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function getSecurityMonitoringStats(req, res, next) {
  try {
    const stats = await securityMonitoringService.getSecurityMonitoringStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}
