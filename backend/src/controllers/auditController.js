import auditService from '../services/auditService.js';

export async function getAuditEvents(req, res, next) {
  try {
    const result = await auditService.getAuditEvents(req.query);
    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditEventById(req, res, next) {
  try {
    const event = await auditService.getAuditEventById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Audit event not found.'
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

export async function verifyAuditIntegrity(req, res, next) {
  try {
    const verification = await auditService.verifyAuditIntegrity();
    res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    next(error);
  }
}

export async function generateComplianceExport(req, res, next) {
  try {
    const { format, ...filters } = req.body || {};
    const exportResult = await auditService.generateComplianceExport({
      requestedBy: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      format: format || 'CSV',
      filters
    });

    if (exportResult.format === 'CSV') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-compliance-${exportResult.exportId}.csv"`);
      return res.status(200).send(exportResult.content);
    }

    res.status(200).json({
      success: true,
      data: exportResult
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditStats(req, res, next) {
  try {
    const stats = await auditService.getAuditStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}
