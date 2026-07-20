import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../services/emailService.js';
import { UAParser } from 'ua-parser-js';
import Activity from '../models/Activity.js';
import LoginHistory from '../models/LoginHistory.js';
import Session from '../models/Session.js';
import speakeasy from 'speakeasy';

// Helper to get the correct frontend URL dynamically based on the request origin
const getFrontendUrl = (req) => {
  const reqOrigin = req.headers.origin || req.headers.referer;
  
  if (reqOrigin) {
    try {
      const originUrl = new URL(reqOrigin);
      const baseOrigin = `${originUrl.protocol}//${originUrl.host}`;
      
      if (baseOrigin.endsWith('.vercel.app') || baseOrigin === process.env.FRONTEND_URL || baseOrigin.includes('localhost')) {
        return baseOrigin;
      }
    } catch (e) {
      // Ignore Invalid URL
    }
  }
  
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

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

      const verificationUrl = `${getFrontendUrl(req)}/verify-email/${verificationToken}`;
      const message = `Please verify your email by clicking: \n\n ${verificationUrl}`;
      
      const html = `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #eaeaea;">
          <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Passora</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #1f2937; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Welcome to Passora!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello ${fullName.split(' ')[0]}, <br/><br/>
              Thank you for signing up for Passora. To complete your registration and secure your new account, please verify your email address by clicking the button below.
            </p>
            <div style="text-align: center; margin: 36px 0;">
              <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; transition: background-color 0.2s;">Verify Your Email</a>
            </div>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              If you did not sign up for Passora, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
              If you're having trouble clicking the verification button, copy and paste the URL below into your web browser:<br/>
              <a href="${verificationUrl}" style="color: #4f46e5; text-decoration: underline; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              &copy; ${new Date().getFullYear()} Passora. All rights reserved.
            </p>
          </div>
        </div>
      `;
      
      try {
        await sendEmail({
          email: user.email,
          subject: 'Verify your Email - Passora',
          message,
          html,
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
    const resetUrl = `${getFrontendUrl(req)}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click: \n\n ${resetUrl}`;
    
    const html = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #eaeaea;">
        <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Passora</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #1f2937; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hello, <br/><br/>
            We received a request to reset the password for your Passora account associated with this email address. If you made this request, please click the button below to choose a new password.
          </p>
          <div style="text-align: center; margin: 36px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; transition: background-color 0.2s;">Reset Your Password</a>
          </div>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            This password reset link is only valid for the next <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
            If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:<br/>
            <a href="${resetUrl}" style="color: #4f46e5; text-decoration: underline; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">
            &copy; ${new Date().getFullYear()} Passora. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - Passora',
        message,
        html,
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
      token,
      window: 1
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
