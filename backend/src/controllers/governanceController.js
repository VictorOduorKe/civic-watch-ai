import governanceService from '../services/governanceService.js';

// ==========================================
// Category Management
// ==========================================

export async function listCategories(req, res, next) {
  try {
    const categories = await governanceService.listCategories(req.query);
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const category = await governanceService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await governanceService.createCategory({
      ...req.body,
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role
    });
    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await governanceService.updateCategory(
      req.params.id,
      req.body,
      req.user.id,
      req.user.email,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function archiveCategory(req, res, next) {
  try {
    const category = await governanceService.archiveCategory(
      req.params.id,
      req.user.id,
      req.user.email,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Category archived successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// API Key Management
// ==========================================

export async function listApiKeys(req, res, next) {
  try {
    // Admins can see all keys, non-admins only their own
    const filterUserId = req.user.role === 'Admin' ? (req.query.userId || null) : req.user.id;
    const result = await governanceService.listApiKeys({
      ...req.query,
      userId: filterUserId
    });
    res.status(200).json({
      success: true,
      data: result.keys,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function createApiKey(req, res, next) {
  try {
    const result = await governanceService.createApiKey({
      ...req.body,
      userId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role
    });
    res.status(201).json({
      success: true,
      message: 'API Key generated successfully. Save your secret now.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function rotateApiKey(req, res, next) {
  try {
    const result = await governanceService.rotateApiKey(
      req.params.id,
      req.user.id,
      req.user.email,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'API Key rotated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeApiKey(req, res, next) {
  try {
    const result = await governanceService.revokeApiKey(
      req.params.id,
      req.user.id,
      req.user.email,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Webhook Management
// ==========================================

export async function listWebhooks(req, res, next) {
  try {
    const result = await governanceService.listWebhooks(req.query);
    res.status(200).json({
      success: true,
      data: result.webhooks,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getWebhookById(req, res, next) {
  try {
    const webhook = await governanceService.getWebhookById(req.params.id);
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found.' });
    }
    res.status(200).json({
      success: true,
      data: webhook
    });
  } catch (error) {
    next(error);
  }
}

export async function createWebhook(req, res, next) {
  try {
    const webhook = await governanceService.createWebhook({
      ...req.body,
      userId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role
    });
    res.status(201).json({
      success: true,
      message: 'Webhook endpoint registered successfully.',
      data: webhook
    });
  } catch (error) {
    next(error);
  }
}

export async function updateWebhook(req, res, next) {
  try {
    const webhook = await governanceService.updateWebhook(
      req.params.id,
      req.body,
      req.user.id,
      req.user.email,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Webhook updated successfully.',
      data: webhook
    });
  } catch (error) {
    next(error);
  }
}

export async function testWebhook(req, res, next) {
  try {
    const result = await governanceService.testWebhook(
      req.params.id,
      req.user.id,
      req.user.email,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Webhook test execution completed.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function getWebhookDeliveries(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await governanceService.getWebhookDeliveries(req.params.id, page, limit);
    res.status(200).json({
      success: true,
      data: result.deliveries,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Security Policy Configurations
// ==========================================

export async function getSecurityPolicies(req, res, next) {
  try {
    const policies = await governanceService.getSecurityPolicies();
    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSecurityPolicy(req, res, next) {
  try {
    const { value, reason } = req.body;
    const result = await governanceService.updateSecurityPolicy(
      req.params.key,
      value,
      req.user.id,
      req.user.email,
      req.user.role,
      reason
    );
    res.status(200).json({
      success: true,
      message: `Security policy "${req.params.key}" updated.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function getSecurityPolicyHistory(req, res, next) {
  try {
    const history = await governanceService.getSecurityPolicyHistory(req.params.key);
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
}
