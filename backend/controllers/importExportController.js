import Vault from '../models/Vault.js';
import User from '../models/User.js';
import csv from 'csv-parser';
import { Readable } from 'stream';
import crypto from 'crypto';
import Activity from '../models/Activity.js';

// Helper to encrypt JSON
const encryptJSON = (data, password) => {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    data: encrypted
  };
};

// @desc    Export Vault as Encrypted JSON
// @route   GET /api/export/json
// @access  Private
export const exportJSON = async (req, res) => {
  try {
    const { masterPassword } = req.query; // Passed as query param for GET request, or better use POST. The user said GET /export/json

    if (!masterPassword) {
      return res.status(400).json({ message: 'Master password required for export' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchMasterPassword(masterPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid master password' });
    }

    const vaults = await Vault.find({ user: req.user._id, deleted: false });

    const exportData = vaults.map(v => ({
      title: v.title,
      username: v.username,
      email: v.email,
      password: v.password,
      websiteURL: v.websiteURL,
      notes: v.notes,
      category: v.category
    }));

    const encryptedData = encryptJSON(exportData, masterPassword);

    await Activity.create({
      userId: user._id,
      action: 'Export',
      details: 'Exported vault as Encrypted JSON'
    });

    res.json(encryptedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export Vault as CSV
// @route   GET /api/export/csv
// @access  Private
export const exportCSV = async (req, res) => {
  try {
    const { masterPassword } = req.query;

    if (!masterPassword) {
      return res.status(400).json({ message: 'Master password required for export' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchMasterPassword(masterPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid master password' });
    }

    const vaults = await Vault.find({ user: req.user._id, deleted: false });

    let csvContent = 'title,username,email,password,website,notes,category\n';
    
    vaults.forEach(v => {
      // Escape quotes
      const escape = (str) => str ? `"${str.replace(/"/g, '""')}"` : '';
      csvContent += `${escape(v.title)},${escape(v.username)},${escape(v.email)},${escape(v.password)},${escape(v.websiteURL)},${escape(v.notes)},${escape(v.category)}\n`;
    });

    await Activity.create({
      userId: user._id,
      action: 'Export',
      details: 'Exported vault as CSV'
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('passora_export.csv');
    return res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Import Passwords from CSV
// @route   POST /api/import
// @access  Private
export const importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => {
        // Handle common CSV headers (Bitwarden, Lastpass, Chrome)
        const name = data.name || data.title || data.Title || data.name;
        const url = data.url || data.login_uri || data.website || data.URL;
        const username = data.username || data.login_username || data.Username;
        const password = data.password || data.login_password || data.Password;
        const notes = data.notes || data.extra || data.Notes;

        if (name && password) {
          results.push({
            user: req.user._id,
            title: name,
            websiteURL: url || '',
            username: username || '',
            email: username?.includes('@') ? username : '',
            password: password,
            notes: notes || '',
            category: 'login', // Default
            tags: []
          });
        }
      })
      .on('end', async () => {
        if (results.length === 0) {
          return res.status(400).json({ message: 'No valid passwords found in CSV' });
        }

        // Check for duplicates before inserting
        const existingVaults = await Vault.find({ user: req.user._id });
        const existingSet = new Set(existingVaults.map(v => `${v.title}-${v.username}-${v.password}`));

        const toInsert = results.filter(r => !existingSet.has(`${r.title}-${r.username}-${r.password}`));

        if (toInsert.length > 0) {
          await Vault.insertMany(toInsert);
        }

        await Activity.create({
          userId: req.user._id,
          action: 'Import',
          details: `Imported ${toInsert.length} passwords from CSV (${results.length - toInsert.length} duplicates skipped)`
        });

        res.json({
          message: 'Import successful',
          totalFound: results.length,
          imported: toInsert.length,
          skipped: results.length - toInsert.length
        });
      });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
