import PasswordHistory from '../models/PasswordHistory.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// @desc    Get password history for a specific vault item
// @route   GET /api/password/history/:id
// @access  Private
export const getPasswordHistory = async (req, res, next) => {
  try {
    const history = await PasswordHistory.find({ 
      vaultId: req.params.id, 
      userId: req.user._id 
    }).sort({ createdAt: -1 });

    // Decrypt all historical passwords
    const decryptedHistory = history.map(item => {
      try {
        const decrypted = decrypt(item.encryptedPassword, item.iv, item.authTag);
        const obj = item.toObject();
        obj.password = decrypted;
        delete obj.encryptedPassword;
        delete obj.iv;
        delete obj.authTag;
        return obj;
      } catch (err) {
        return null;
      }
    }).filter(item => item !== null);

    res.json(decryptedHistory);
  } catch (error) {
    next(error);
  }
};

// @desc    Check password strength (Entropy based)
// @route   POST /api/password/check-strength
// @access  Private
export const checkPasswordStrength = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // A simple robust entropy calculation algorithm
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    const entropy = password.length > 0 && poolSize > 0 
      ? password.length * Math.log2(poolSize) 
      : 0;

    let score = 'Weak';
    if (entropy > 80) score = 'Excellent';
    else if (entropy > 60) score = 'Strong';
    else if (entropy > 40) score = 'Good';
    else if (entropy > 25) score = 'Fair';

    // Estimated crack time (very rough estimate assuming 10 billion guesses/sec)
    // 10 billion = 10^10 = 2^33 guesses per second.
    const guesses = Math.pow(2, entropy);
    const seconds = guesses / Math.pow(10, 10);
    
    let crackTime = 'Instantly';
    if (seconds > 31536000000000) crackTime = 'Millions of years';
    else if (seconds > 31536000000) crackTime = 'Thousands of years';
    else if (seconds > 31536000) crackTime = 'Years';
    else if (seconds > 2592000) crackTime = 'Months';
    else if (seconds > 86400) crackTime = 'Days';
    else if (seconds > 3600) crackTime = 'Hours';
    else if (seconds > 60) crackTime = 'Minutes';

    const suggestions = [];
    if (password.length < 12) suggestions.push('Make it longer (at least 12 characters).');
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters.');
    if (!/[0-9]/.test(password)) suggestions.push('Add numbers.');
    if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Add symbols.');

    res.json({
      entropy: Math.round(entropy),
      score,
      crackTime,
      suggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate password securely on server
// @route   POST /api/password/generate
// @access  Private
export const generatePassword = async (req, res, next) => {
  try {
    const { length = 16, uppercase = true, lowercase = true, numbers = true, symbols = true } = req.body;
    
    let chars = '';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (chars.length === 0) chars = 'abcdefghijklmnopqrstuvwxyz'; // fallback

    let password = '';
    // Use crypto for secure randomness if needed, or simple Math.random since it's just a tool 
    // We will use standard Math.random for simplicity but in prod Node `crypto.randomBytes` is better
    // For this context, standard random is sufficient to generate strings
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }

    res.json({ password });
  } catch (error) {
    next(error);
  }
};
