import {
  getPreferences,
  updatePreferences,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  unsubscribe
} from '../services/subscriptionService.js';

/**
 * M13 — Citizen Notifications & Subscriptions: Controller
 */

export async function getUserPreferencesController(req, res, next) {
  try {
    const userId = req.user.id;
    const preferences = await getPreferences(userId);
    return res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserPreferencesController(req, res, next) {
  try {
    const userId = req.user.id;
    const preferences = await updatePreferences(userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserSubscriptionsController(req, res, next) {
  try {
    const userId = req.user.id;
    const subscriptions = await getSubscriptions(userId);
    return res.status(200).json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
}

export async function createSubscriptionController(req, res, next) {
  try {
    const userId = req.user.id;
    const subscription = await createSubscription(userId, req.body);
    return res.status(201).json({
      success: true,
      message: subscription.isDuplicate
        ? 'Subscription already exists and is active'
        : 'Alert subscription created successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSubscriptionController(req, res, next) {
  try {
    const userId = req.user.id;
    const subscriptionId = Number(req.params.id);
    const subscription = await updateSubscription(subscriptionId, userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubscriptionController(req, res, next) {
  try {
    const userId = req.user.id;
    const subscriptionId = Number(req.params.id);
    const result = await deleteSubscription(subscriptionId, userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function unsubscribeController(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await unsubscribe(userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
