import User from '../models/User.js';
import Activity from '../models/Activity.js';
import sendEmail from '../services/emailService.js';

// @desc    Setup master password
// @route   POST /api/master/create
// @access  Private
export const setupMasterPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Master password is required' });
    }

    const user = await User.findById(req.user._id);

    if (user.masterPassword) {
      return res.status(400).json({ message: 'Master password already set' });
    }

    user.masterPassword = password;
    await user.save();

    await Activity.create({
      userId: user._id,
      action: 'Master Password Set',
      details: 'Master password was configured for the first time'
    });

    res.json({ message: 'Master password set successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change master password
// @route   PUT /api/master/change
// @access  Private
export const changeMasterPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new master password required' });
    }

    const user = await User.findById(req.user._id);

    if (!user.masterPassword) {
      return res.status(400).json({ message: 'Master password is not set' });
    }

    const isMatch = await user.matchMasterPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid current master password' });
    }

    user.masterPassword = newPassword;
    await user.save();

    await Activity.create({
      userId: user._id,
      action: 'Master Password Changed',
      details: 'Master password was changed'
    });

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: 'Master Password Changed - Passora',
      html: `
        <h2>Master Password Changed</h2>
        <p>Your master password was recently changed. If this was not you, please secure your account immediately.</p>
      `
    });

    res.json({ message: 'Master password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify master password
// @route   POST /api/master/verify
// @access  Private
export const verifyMasterPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Master password is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user.masterPassword) {
      return res.status(400).json({ message: 'Master password is not set' });
    }

    const isMatch = await user.matchMasterPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid master password' });
    }

    res.json({ message: 'Master password verified' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove master password
// @route   DELETE /api/master/remove
// @access  Private
export const removeMasterPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Master password is required for removal' });
    }

    const user = await User.findById(req.user._id);

    if (!user.masterPassword) {
      return res.status(400).json({ message: 'Master password is not set' });
    }

    const isMatch = await user.matchMasterPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid master password' });
    }

    user.masterPassword = null;
    await user.save();

    await Activity.create({
      userId: user._id,
      action: 'Master Password Removed',
      details: 'Master password was removed'
    });

    res.json({ message: 'Master password removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
