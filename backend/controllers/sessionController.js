import Session from '../models/Session.js';

// @desc    Get all active sessions for current user
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ lastActive: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Revoke specific session
// @route   DELETE /api/sessions/:id
// @access  Private
export const revokeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session || session.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session revoked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Revoke all other sessions
// @route   DELETE /api/sessions
// @access  Private
export const revokeAllSessions = async (req, res) => {
  try {
    // Ideally, we'd keep the current session, but since we rely on JWT,
    // revoking means deleting from DB. The JWT middleware needs to check the Session DB.
    // For now, we will delete all sessions EXCEPT the current one if we pass the current session ID in the header.
    // For simplicity, we'll just delete all of them. The user will have to log in again.
    
    // Wait, the user wants "Logout All Sessions" and "Logout Other Devices".
    // We can pass `currentSessionId` from the frontend to preserve it.
    const { currentSessionId } = req.body;

    if (currentSessionId) {
      await Session.deleteMany({ 
        userId: req.user._id, 
        _id: { $ne: currentSessionId } 
      });
      res.json({ message: 'All other sessions revoked' });
    } else {
      await Session.deleteMany({ userId: req.user._id });
      res.json({ message: 'All sessions revoked' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
