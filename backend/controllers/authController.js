import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../services/emailService.js';
import { UAParser } from 'ua-parser-js';
import Activity from '../models/Activity.js';
import LoginHistory from '../models/LoginHistory.js';
import Session from '../models/Session.js';
import speakeasy from 'speakeasy';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (user) {
      // Generate email verification token (optional based on requirements, but asked for Verify Email)
      const verificationToken = crypto.randomBytes(20).toString('hex');
      user.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      
      await user.save();

      // In a real scenario, send the email here
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
      const message = `Please verify your email by clicking: \n\n ${verificationUrl}`;
      
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification - Passora',
          message,
        });
      } catch (error) {
        console.error('Email sending failed, but user created');
      }

      const token = generateToken(res, user._id);
      
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        token,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check for 2FA
      if (user.twoFactorEnabled) {
        return res.json({
          requires2FA: true,
          userId: user._id
        });
      }

      const token = generateToken(res, user._id);
      
      const parser = new UAParser(req.headers['user-agent']);
      const result = parser.getResult();
      const browser = result.browser.name ? `${result.browser.name} ${result.browser.version}` : 'Unknown';
      const os = result.os.name ? `${result.os.name} ${result.os.version}` : 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      const deviceName = result.device.model || result.device.vendor || 'Unknown Device';

      await LoginHistory.create({
        userId: user._id,
        browser,
        os,
        ipAddress,
        loginTime: Date.now()
      });

      // Track Session
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const session = await Session.create({
        userId: user._id,
        tokenHash,
        deviceInfo: { os, browser, ipAddress, deviceName },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days matches JWT
      });

      await Activity.create({
        userId: user._id,
        action: 'Login',
        details: `Logged in from ${os} using ${browser}`
      });

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        token,
        sessionId: session._id
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie or just success response for client to remove token
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  try {
    if (req.user) {
      // Find the most recent login without a logout time and update it
      await LoginHistory.findOneAndUpdate(
        { userId: req.user._id, logoutTime: null },
        { logoutTime: Date.now() },
        { sort: { loginTime: -1 } }
      );

      await Activity.create({
        userId: req.user._id,
        action: 'Logout',
        details: 'User logged out manually or due to inactivity'
      });
    }
  } catch (error) {
    console.error('Error logging logout', error);
  }
  // Since we are using Bearer tokens, the client handles deleting the token.
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404);
      throw new Error('There is no user with that email');
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token - Passora',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500);
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const token = generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    // Get hashed token
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA for login
// @route   POST /api/auth/login-2fa
// @access  Public
export const verifyLogin2FA = async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      // Check if it's a recovery code instead
      const RecoveryCode = (await import('../models/RecoveryCode.js')).default;
      const codes = await RecoveryCode.find({ userId: user._id, used: false });
      
      let isRecoveryCodeValid = false;
      for (const code of codes) {
        const isMatch = await bcrypt.compare(token, code.codeHash);
        if (isMatch) {
          isRecoveryCodeValid = true;
          code.used = true;
          await code.save();
          break;
        }
      }

      if (!isRecoveryCodeValid) {
        res.status(401);
        throw new Error('Invalid OTP code or recovery code');
      }
    }

    const jwtToken = generateToken(res, user._id);
    
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();
    const browser = result.browser.name ? `${result.browser.name} ${result.browser.version}` : 'Unknown';
    const os = result.os.name ? `${result.os.name} ${result.os.version}` : 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    const deviceName = result.device.model || result.device.vendor || 'Unknown Device';

    await LoginHistory.create({
      userId: user._id,
      browser,
      os,
      ipAddress,
      loginTime: Date.now()
    });

    // Track Session
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(jwtToken).digest('hex');
    const session = await Session.create({
      userId: user._id,
      tokenHash,
      deviceInfo: { os, browser, ipAddress, deviceName },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days matches JWT
    });

    await Activity.create({
      userId: user._id,
      action: 'Login 2FA',
      details: `Logged in with 2FA from ${os} using ${browser}`
    });

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token: jwtToken,
      sessionId: session._id
    });
  } catch (error) {
    next(error);
  }
};
