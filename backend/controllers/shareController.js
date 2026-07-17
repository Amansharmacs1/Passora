import SharedPassword from '../models/SharedPassword.js';
import Vault from '../models/Vault.js';
import crypto from 'crypto';

// @desc    Create a share link
// @route   POST /api/share
// @access  Private
export const createShare = async (req, res) => {
  try {
    const { vaultId, expiresInHours, maxViews } = req.body;

    const vault = await Vault.findOne({ _id: vaultId, user: req.user._id });
    if (!vault) {
      return res.status(404).json({ message: 'Vault item not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (expiresInHours || 24) * 60 * 60 * 1000);

    const sharedPassword = await SharedPassword.create({
      vaultId,
      createdBy: req.user._id,
      token,
      expiresAt,
      maxViews: maxViews || 1
    });

    res.status(201).json({
      shareId: sharedPassword._id,
      token,
      expiresAt: sharedPassword.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get shared password by token
// @route   GET /api/share/:token
// @access  Public
export const getShare = async (req, res) => {
  try {
    const { token } = req.params;

    const sharedPassword = await SharedPassword.findOne({ token }).populate('vaultId');

    if (!sharedPassword) {
      return res.status(404).json({ message: 'Link expired or invalid' });
    }

    if (sharedPassword.expiresAt < new Date()) {
      await SharedPassword.findByIdAndDelete(sharedPassword._id);
      return res.status(404).json({ message: 'Link expired' });
    }

    if (sharedPassword.maxViews > 0 && sharedPassword.viewsCount >= sharedPassword.maxViews) {
      await SharedPassword.findByIdAndDelete(sharedPassword._id);
      return res.status(404).json({ message: 'View limit reached' });
    }

    sharedPassword.viewsCount += 1;
    await sharedPassword.save();

    const vault = sharedPassword.vaultId;

    res.json({
      title: vault.title,
      username: vault.username,
      password: vault.password,
      notes: vault.notes
    });

    if (sharedPassword.maxViews > 0 && sharedPassword.viewsCount >= sharedPassword.maxViews) {
        await SharedPassword.findByIdAndDelete(sharedPassword._id);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all active shares for current user
// @route   GET /api/share
// @access  Private
export const getShareHistory = async (req, res) => {
  try {
    const shares = await SharedPassword.find({ createdBy: req.user._id }).populate('vaultId', 'title');
    res.json(shares);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Revoke a share link
// @route   DELETE /api/share/:id
// @access  Private
export const revokeShare = async (req, res) => {
  try {
    const share = await SharedPassword.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    await SharedPassword.findByIdAndDelete(req.params.id);
    res.json({ message: 'Share revoked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
