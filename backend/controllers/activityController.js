import Activity from '../models/Activity.js';
import LoginHistory from '../models/LoginHistory.js';

// @desc    Get recent user activity timeline
// @route   GET /api/activity
// @access  Private
export const getActivityTimeline = async (req, res, next) => {
  try {
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 activities
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

// @desc    Get login history for user
// @route   GET /api/activity/login-history
// @access  Private
export const getLoginHistory = async (req, res, next) => {
  try {
    const history = await LoginHistory.find({ userId: req.user._id })
      .sort({ loginTime: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

// @desc    Log a specific action from frontend (e.g., Copied, Viewed, Generated)
// @route   POST /api/activity/log
// @access  Private
export const logActivity = async (req, res, next) => {
  try {
    const { action, vaultId, details } = req.body;
    
    // Validate action enum
    const validActions = ['Added', 'Edited', 'Deleted', 'Viewed', 'Copied', 'Login', 'Logout', 'Generated', 'Restored', 'Archived', 'Favorite'];
    if (!validActions.includes(action)) {
      res.status(400);
      throw new Error('Invalid action type');
    }

    const activity = new Activity({
      userId: req.user._id,
      action,
      vaultId: vaultId || null,
      details: details || ''
    });

    await activity.save();
    res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    next(error);
  }
};
