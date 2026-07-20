import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import User from '../models/User.js';
import Passkey from '../models/Passkey.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

const rpName = 'Passora';
// Parse the FRONTEND_URL to get the rpID (hostname)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const rpID = process.env.NODE_ENV === 'production' ? new URL(frontendUrl).hostname : 'localhost';
const origin = process.env.NODE_ENV === 'production' ? frontendUrl : 'http://localhost:5173';

// Temporary store for challenges in memory (in production use Redis)
// Key: userId, Value: current challenge string
const challengesStore = {}; 
const authChallengesStore = {}; // Key: email, Value: challenge

// @desc    Generate Passkey Registration Options
// @route   GET /api/webauthn/register/generate-options
// @access  Private
export const generateRegOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userPasskeys = await Passkey.find({ userId: user._id });

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user._id.toString(),
      userName: user.email,
      userDisplayName: user.fullName,
      // Don't re-register existing authenticators
      excludeCredentials: userPasskeys.map(passkey => ({
        id: Buffer.from(passkey.credentialID, 'base64url'),
        type: 'public-key',
        transports: passkey.transports,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      }
    });

    // Save challenge
    challengesStore[user._id.toString()] = options.challenge;

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Passkey Registration
// @route   POST /api/webauthn/register/verify
// @access  Private
export const verifyRegResponse = async (req, res) => {
  try {
    const { body } = req;
    const { deviceName } = req.body; // Custom property sent by client
    const user = await User.findById(req.user._id);

    const expectedChallenge = challengesStore[user._id.toString()];

    if (!expectedChallenge) {
      return res.status(400).json({ message: 'No registration challenge found' });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      // Save passkey
      await Passkey.create({
        userId: user._id,
        credentialID: Buffer.from(credentialID).toString('base64url'),
        credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
        counter,
        transports: body.response.transports || [],
        deviceName: deviceName || 'New Device',
      });

      // Clear challenge
      delete challengesStore[user._id.toString()];

      res.status(200).json({ verified: true });
    } else {
      res.status(400).json({ message: 'Verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Passkey Authentication Options
// @route   POST /api/webauthn/auth/generate-options
// @access  Public
export const generateAuthOptions = async (req, res) => {
  try {
    const { email } = req.body;
    let userPasskeys = [];
    let user = null;

    if (email) {
      user = await User.findOne({ email });
      if (user) {
        userPasskeys = await Passkey.find({ userId: user._id });
      }
    }

    // Generate options. If no email is provided, it relies on discoverable credentials (Conditional UI)
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userPasskeys.map(passkey => ({
        id: Buffer.from(passkey.credentialID, 'base64url'),
        type: 'public-key',
        transports: passkey.transports,
      })),
      userVerification: 'preferred',
    });

    // Save challenge tied to email (or a session ID if Conditional UI without email)
    const storeKey = email || 'conditional';
    authChallengesStore[storeKey] = options.challenge;

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Passkey Authentication
// @route   POST /api/webauthn/auth/verify
// @access  Public
export const verifyAuthResponse = async (req, res) => {
  try {
    const { body, email } = req.body;
    
    // Find passkey by credentialID
    const credentialIDBase64url = body.id;
    const passkey = await Passkey.findOne({ credentialID: credentialIDBase64url }).populate('userId');

    if (!passkey) {
      return res.status(400).json({ message: 'Passkey not found in our records.' });
    }

    const user = passkey.userId;
    const storeKey = email || 'conditional';
    const expectedChallenge = authChallengesStore[storeKey];

    if (!expectedChallenge) {
      return res.status(400).json({ message: 'No authentication challenge found.' });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(passkey.credentialID, 'base64url'),
        credentialPublicKey: Buffer.from(passkey.credentialPublicKey, 'base64url'),
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });

    if (verification.verified) {
      // Update counter and last used
      passkey.counter = verification.authenticationInfo.newCounter;
      passkey.lastUsed = Date.now();
      await passkey.save();

      // Clear challenge
      delete authChallengesStore[storeKey];

      // Login the user - issue JWT
      const token = generateToken(res, user._id);

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        token,
      });
    } else {
      res.status(400).json({ message: 'Authentication verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's registered passkeys
// @route   GET /api/webauthn/passkeys
// @access  Private
export const getPasskeys = async (req, res) => {
  try {
    const passkeys = await Passkey.find({ userId: req.user._id }).select('-credentialPublicKey');
    res.json(passkeys);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a passkey
// @route   DELETE /api/webauthn/passkeys/:id
// @access  Private
export const deletePasskey = async (req, res) => {
  try {
    const passkey = await Passkey.findOne({ _id: req.params.id, userId: req.user._id });
    if (!passkey) {
      return res.status(404).json({ message: 'Passkey not found' });
    }
    await Passkey.findByIdAndDelete(req.params.id);
    res.json({ message: 'Passkey deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
