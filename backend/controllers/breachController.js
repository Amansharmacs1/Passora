import crypto from 'crypto';
import axios from 'axios';
import Vault from '../models/Vault.js';
import { decrypt } from '../utils/encryption.js';

// Helper function to hash password with SHA-1
const sha1 = (str) => {
    return crypto.createHash('sha1').update(str).digest('hex').toUpperCase();
};

// @desc    Check a specific password against HIBP
// @route   POST /api/breach/check-single
// @access  Private
export const checkSinglePassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const hash = sha1(password);
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
        const breaches = response.data.split('\n');

        let isBreached = false;
        let count = 0;

        for (const line of breaches) {
            const [hashSuffix, breachCount] = line.split(':');
            if (hashSuffix.trim() === suffix) {
                isBreached = true;
                count = parseInt(breachCount.trim(), 10);
                break;
            }
        }

        res.json({ breached: isBreached, count });
    } catch (error) {
        next(error);
    }
};

// @desc    Scan entire vault for breached passwords
// @route   POST /api/breach/scan-vault
// @access  Private
export const scanVault = async (req, res, next) => {
    try {
        // Only check logins, not secure notes or cards
        const vaults = await Vault.find({ userId: req.user._id, itemType: 'login', deleted: false });
        const breachedVaults = [];
        
        // HIBP allows range/ API to be called freely as it is k-anonymity based
        for (const vault of vaults) {
            if (vault.encryptedPassword) {
                try {
                    const decryptedPassword = decrypt(vault.encryptedPassword, vault.iv, vault.authTag);
                    if (decryptedPassword) {
                        const hash = sha1(decryptedPassword);
                        const prefix = hash.substring(0, 5);
                        const suffix = hash.substring(5);

                        const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
                        const breaches = response.data.split('\n');

                        let count = 0;
                        for (const line of breaches) {
                            const [hashSuffix, breachCount] = line.split(':');
                            if (hashSuffix.trim() === suffix) {
                                count = parseInt(breachCount.trim(), 10);
                                break;
                            }
                        }

                        if (count > 0) {
                            breachedVaults.push({
                                vaultId: vault._id,
                                title: vault.title,
                                website: vault.website,
                                username: vault.username,
                                count
                            });
                        }
                    }
                } catch (e) {
                    console.error('Error scanning vault item:', e.message);
                }
            }
        }

        res.json({ breachedCount: breachedVaults.length, breachedVaults });
    } catch (error) {
        next(error);
    }
};
