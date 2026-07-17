import Vault from '../models/Vault.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import Activity from '../models/Activity.js';
import PasswordHistory from '../models/PasswordHistory.js';

// @desc    Get all vault items for a user (excluding passwords)
// @route   GET /api/vault
// @access  Private
export const getVaults = async (req, res, next) => {
  try {
    const vaults = await Vault.find({ userId: req.user._id, deleted: false }).select('-encryptedPassword -iv -authTag').sort({ createdAt: -1 });
    res.json(vaults);
  } catch (error) {
    next(error);
  }
};

// @desc    Search vault items
// @route   GET /api/vault/search?q=query
// @access  Private
export const searchVaults = async (req, res, next) => {
  try {
    const keyword = req.query.q
      ? {
          userId: req.user._id,
          deleted: false,
          $or: [
            { title: { $regex: req.query.q, $options: 'i' } },
            { website: { $regex: req.query.q, $options: 'i' } },
            { username: { $regex: req.query.q, $options: 'i' } },
            { email: { $regex: req.query.q, $options: 'i' } },
            { category: { $regex: req.query.q, $options: 'i' } },
            { tags: { $regex: req.query.q, $options: 'i' } },
          ],
        }
      : { userId: req.user._id, deleted: false };

    const vaults = await Vault.find(keyword).select('-encryptedPassword -iv -authTag').sort({ createdAt: -1 });
    res.json(vaults);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific vault item details (including decrypted password)
// @route   GET /api/vault/:id
// @access  Private
export const getVaultById = async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, userId: req.user._id });
    if (!vault) {
      res.status(404);
      throw new Error('Vault item not found');
    }

    // Attempt to decrypt
    try {
      const decryptedPassword = decrypt(vault.encryptedPassword, vault.iv, vault.authTag);
      
      const vaultObj = vault.toObject();
      vaultObj.password = decryptedPassword;
      delete vaultObj.encryptedPassword;
      delete vaultObj.iv;
      delete vaultObj.authTag;

      res.json(vaultObj);
    } catch (encError) {
      res.status(500);
      throw new Error('Error decrypting password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new vault item
// @route   POST /api/vault
// @access  Private
export const createVault = async (req, res, next) => {
  try {
    const { title, website, websiteURL, username, email, password, notes, category, folder, tags, favorite } = req.body;

    if (!title || !password) {
      res.status(400);
      throw new Error('Title and password are required');
    }

    const { encryptedData, iv, authTag } = encrypt(password);

    // simple logic to auto-generate favicon if URL is present and favicon is empty
    let faviconUrl = '';
    if (websiteURL) {
      try {
        const domain = new URL(websiteURL.startsWith('http') ? websiteURL : `https://${websiteURL}`).hostname;
        faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (err) {
        // ignore invalid urls
      }
    }

    const vault = new Vault({
      userId: req.user._id,
      title,
      website,
      websiteURL,
      favicon: faviconUrl,
      username,
      email,
      encryptedPassword: encryptedData,
      iv,
      authTag,
      notes,
      category,
      folder: folder || null,
      tags,
      favorite: favorite || false,
    });

    const createdVault = await vault.save();
    
    await Activity.create({
      userId: req.user._id,
      action: 'Added',
      vaultId: createdVault._id,
      details: `Added password for ${title}`
    });

    // Send back without sensitive info
    const vaultObj = createdVault.toObject();
    delete vaultObj.encryptedPassword;
    delete vaultObj.iv;
    delete vaultObj.authTag;

    res.status(201).json(vaultObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vault item
// @route   PUT /api/vault/:id
// @access  Private
export const updateVault = async (req, res, next) => {
  try {
    const { title, website, websiteURL, username, email, password, notes, category, folder, tags } = req.body;

    const vault = await Vault.findOne({ _id: req.params.id, userId: req.user._id });

    if (!vault) {
      res.status(404);
      throw new Error('Vault item not found');
    }

    vault.title = title || vault.title;
    vault.website = website !== undefined ? website : vault.website;
    
    if (websiteURL !== undefined && websiteURL !== vault.websiteURL) {
        vault.websiteURL = websiteURL;
        try {
            const domain = new URL(websiteURL.startsWith('http') ? websiteURL : `https://${websiteURL}`).hostname;
            vault.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (err) {
             vault.favicon = '';
        }
    }

    vault.username = username !== undefined ? username : vault.username;
    vault.email = email !== undefined ? email : vault.email;
    vault.notes = notes !== undefined ? notes : vault.notes;
    vault.category = category || vault.category;
    vault.folder = folder || vault.folder;
    vault.tags = tags || vault.tags;

    if (password) {
      // Store old password in history
      if (vault.encryptedPassword) {
        await PasswordHistory.create({
          vaultId: vault._id,
          userId: req.user._id,
          encryptedPassword: vault.encryptedPassword,
          iv: vault.iv,
          authTag: vault.authTag,
        });
      }

      const { encryptedData, iv, authTag } = encrypt(password);
      vault.encryptedPassword = encryptedData;
      vault.iv = iv;
      vault.authTag = authTag;
    }

    const updatedVault = await vault.save();
    
    await Activity.create({
      userId: req.user._id,
      action: 'Edited',
      vaultId: updatedVault._id,
      details: `Edited password for ${updatedVault.title}`
    });
    
    const vaultObj = updatedVault.toObject();
    delete vaultObj.encryptedPassword;
    delete vaultObj.iv;
    delete vaultObj.authTag;

    res.json(vaultObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete vault item (Move to trash)
// @route   DELETE /api/vault/:id
// @access  Private
export const deleteVault = async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, userId: req.user._id });

    if (!vault) {
      res.status(404);
      throw new Error('Vault item not found');
    }

    vault.deleted = true;
    await vault.save();

    await Activity.create({
      userId: req.user._id,
      action: 'Deleted',
      vaultId: vault._id,
      details: `Moved ${vault.title} to trash`
    });

    res.json({ message: 'Moved to trash' });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive a vault item
// @route   PATCH /api/vault/:id/archive
// @access  Private
export const archiveVault = async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, userId: req.user._id });

    if (!vault) {
      res.status(404);
      throw new Error('Vault item not found');
    }

    vault.archived = !vault.archived;
    await vault.save();

    res.json({ message: vault.archived ? 'Archived' : 'Unarchived' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite status
// @route   PATCH /api/vault/:id/favorite
// @access  Private
export const favoriteVault = async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, userId: req.user._id });

    if (!vault) {
      res.status(404);
      throw new Error('Vault item not found');
    }

    vault.favorite = !vault.favorite;
    await vault.save();

    res.json({ message: vault.favorite ? 'Added to favorites' : 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore a soft-deleted vault item
// @route   PATCH /api/vault/:id/restore
// @access  Private
export const restoreVault = async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, userId: req.user._id });

    if (!vault) {
      res.status(404);
      throw new Error('Vault item not found');
    }

    vault.deleted = false;
    await vault.save();

    res.json({ message: 'Restored from trash' });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete vault item
// @route   DELETE /api/vault/:id/permanent
// @access  Private
export const permanentDeleteVault = async (req, res, next) => {
  try {
    const vault = await Vault.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!vault) {
      res.status(404);
      throw new Error('Vault item not found');
    }

    res.json({ message: 'Vault item permanently deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trashed vault items
// @route   GET /api/vault/trash
// @access  Private
export const getTrashVaults = async (req, res, next) => {
    try {
      const vaults = await Vault.find({ userId: req.user._id, deleted: true }).select('-encryptedPassword -iv -authTag').sort({ updatedAt: -1 });
      res.json(vaults);
    } catch (error) {
      next(error);
    }
};
