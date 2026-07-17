import Vault from '../models/Vault.js';
import SecurityMetrics from '../models/SecurityMetrics.js';
import { decrypt } from '../utils/encryption.js';

// Helper to check if a password is weak
const isWeakPassword = (password) => {
  if (password.length < 8) return true;
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = password.length > 0 && poolSize > 0 ? password.length * Math.log2(poolSize) : 0;
  return entropy < 40; // Weak if entropy < 40
};

// @desc    Get complete security report
// @route   GET /api/security/report
// @access  Private
export const getSecurityReport = async (req, res, next) => {
  try {
    const vaults = await Vault.find({ userId: req.user._id, deleted: false });

    let strongCount = 0;
    let weakCount = 0;
    let oldPasswordCount = 0;
    let missingInfoCount = 0;

    const weakPasswords = [];
    const oldPasswords = [];
    const missingInfoPasswords = [];
    const passwordMap = new Map(); // to find duplicates
    const duplicatePasswords = [];

    const now = new Date();
    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

    for (const vault of vaults) {
      try {
        const password = decrypt(vault.encryptedPassword, vault.iv, vault.authTag);

        // Check Weak
        if (isWeakPassword(password)) {
          weakCount++;
          weakPasswords.push(vault._id);
        } else {
          strongCount++;
        }

        // Check Duplicates
        if (passwordMap.has(password)) {
          duplicatePasswords.push(vault._id);
          // add the original to duplicates if not already
          const origId = passwordMap.get(password);
          if (!duplicatePasswords.includes(origId)) {
            duplicatePasswords.push(origId);
          }
        } else {
          passwordMap.set(password, vault._id);
        }

        // Check Old
        const age = now - new Date(vault.updatedAt);
        if (age > NINETY_DAYS) {
          oldPasswordCount++;
          oldPasswords.push(vault._id);
        }

        // Check Missing Info
        if (!vault.username || !vault.websiteURL || !vault.notes) {
          missingInfoCount++;
          missingInfoPasswords.push(vault._id);
        }
      } catch (err) {
        // Skip decryption errors
      }
    }

    const total = vaults.length;
    // Base score is 100
    // -10 for every duplicate
    // -5 for every weak
    // -2 for every old
    // -1 for every missing info
    // But normalized so it doesn't go below 0
    let score = 100;
    if (total > 0) {
      const penalty = ((duplicatePasswords.length / total) * 40) + ((weakCount / total) * 30) + ((oldPasswordCount / total) * 20);
      score = Math.max(0, Math.round(100 - penalty));
    }

    const report = {
      overallScore: score,
      totalPasswords: total,
      strongPasswords: strongCount,
      weakPasswords: weakCount,
      duplicatePasswords: duplicatePasswords.length,
      oldPasswords: oldPasswordCount,
      missingInfo: missingInfoCount,
      lists: {
        weak: weakPasswords,
        duplicates: duplicatePasswords,
        old: oldPasswords,
        missingInfo: missingInfoPasswords
      }
    };

    // Save snapshot asynchronously
    SecurityMetrics.create({
      userId: req.user._id,
      overallScore: report.overallScore,
      totalPasswords: report.totalPasswords,
      strongPasswords: report.strongPasswords,
      weakPasswords: report.weakPasswords,
      duplicatePasswords: report.duplicatePasswords,
      oldPasswords: report.oldPasswords,
      missingInfo: report.missingInfo
    }).catch(err => console.error('Failed to save security metric snapshot', err));

    res.json(report);
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical security score trend
// @route   GET /api/security/score-trend
// @access  Private
export const getScoreTrend = async (req, res, next) => {
  try {
    const metrics = await SecurityMetrics.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30); // Last 30 snapshots
    res.json(metrics.reverse());
  } catch (error) {
    next(error);
  }
};
