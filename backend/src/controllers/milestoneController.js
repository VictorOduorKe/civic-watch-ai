import milestoneService from '../services/milestoneService.js';

export const getRoadmapOverview = async (req, res, next) => {
  try {
    const data = await milestoneService.getRoadmapOverview();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getMilestoneDetails = async (req, res, next) => {
  try {
    const data = await milestoneService.getMilestoneDetails(req.params.id);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const approveMilestone = async (req, res, next) => {
  try {
    const result = await milestoneService.approveMilestone({
      milestoneId: req.params.id,
      userId: req.user.id,
      comment: req.body?.comment
    });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectMilestone = async (req, res, next) => {
  try {
    const result = await milestoneService.rejectMilestone({
      milestoneId: req.params.id,
      userId: req.user.id,
      reason: req.body.reason
    });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const reportRegression = async (req, res, next) => {
  try {
    const result = await milestoneService.reportRegression({
      milestoneId: req.params.id,
      userId: req.user.id,
      reason: req.body.reason
    });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateMilestoneDefinition = async (req, res, next) => {
  try {
    const result = await milestoneService.updateMilestoneDefinition({
      milestoneId: req.params.id,
      userId: req.user.id,
      updates: req.body,
      changeReason: req.body.change_reason
    });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
