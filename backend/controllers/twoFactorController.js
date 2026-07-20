import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import RecoveryCode from '../models/RecoveryCode.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import sendEmail from '../services/emailService.js';

// @desc    Setup 2FA (Generate Secret & QR Code)
// @route   POST /api/2fa/setup
// @access  Private
export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    const secret = speakeasy.generateSecret({
      name: `Passora (${user.email})`
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      res.json({
        secret: secret.base32,
        qrCode: data_url
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify 2FA setup and enable it
// @route   POST /api/2fa/verify-setup
// @access  Private
export const verify2FASetup = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    // Generate 10 recovery codes
    const recoveryCodes = [];
    const plainCodes = [];

    await RecoveryCode.deleteMany({ userId: user._id }); // Clear existing

    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex');
      plainCodes.push(code);
      const salt = await bcrypt.genSalt(10);
      const codeHash = await bcrypt.hash(code, salt);
      recoveryCodes.push({ userId: user._id, codeHash });
    }

    await RecoveryCode.insertMany(recoveryCodes);

    await Activity.create({
      userId: user._id,
      action: '2FA Enabled',
      details: 'Two-Factor Authentication was enabled'
    });

    await sendEmail({
      email: user.email,
      subject: '2FA Enabled - Passora',
      html: `
        <h2>Two-Factor Authentication Enabled</h2>
        <p>2FA has been successfully enabled on your account.</p>
      `
    });

    res.json({ message: '2FA enabled successfully', recoveryCodes: plainCodes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Disable 2FA
// @route   DELETE /api/2fa
// @access  Private
export const disable2FA = async (req, res) => {
  try {
    const { token, password } = req.body; // User should provide master password or normal password to disable

    if (!password) {
      return res.status(400).json({ message: 'Password is required to disable 2FA' });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (user.twoFactorEnabled && !token) {
       return res.status(400).json({ message: 'OTP is required to disable 2FA' });
    }

    if (user.twoFactorEnabled && token) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid OTP code' });
      }
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    await RecoveryCode.deleteMany({ userId: user._id });

    await Activity.create({
      userId: user._id,
      action: '2FA Disabled',
      details: 'Two-Factor Authentication was disabled'
    });

    await sendEmail({
      email: user.email,
      subject: '2FA Disabled - Passora',
      html: `
        <h2>Two-Factor Authentication Disabled</h2>
        <p>2FA has been disabled on your account. Your account is now less secure.</p>
      `
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
