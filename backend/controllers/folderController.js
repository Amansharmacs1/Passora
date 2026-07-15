import Folder from '../models/Folder.js';
import Vault from '../models/Vault.js';

// @desc    Get all folders for a user
// @route   GET /api/folders
// @access  Private
export const getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new folder
// @route   POST /api/folders
// @access  Private
export const createFolder = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Folder name is required');
    }

    const folderExists = await Folder.findOne({ userId: req.user._id, name });
    if (folderExists) {
        res.status(400);
        throw new Error('Folder already exists');
    }

    const folder = new Folder({
      userId: req.user._id,
      name,
    });

    const createdFolder = await folder.save();
    res.status(201).json(createdFolder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a folder
// @route   PUT /api/folders/:id
// @access  Private
export const updateFolder = async (req, res, next) => {
  try {
    const { name } = req.body;

    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });

    if (!folder) {
      res.status(404);
      throw new Error('Folder not found');
    }

    folder.name = name || folder.name;
    const updatedFolder = await folder.save();

    res.json(updatedFolder);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a folder
// @route   DELETE /api/folders/:id
// @access  Private
export const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!folder) {
      res.status(404);
      throw new Error('Folder not found');
    }

    // Nullify folder references in Vault
    await Vault.updateMany({ folder: req.params.id, userId: req.user._id }, { $set: { folder: null } });

    res.json({ message: 'Folder removed' });
  } catch (error) {
    next(error);
  }
};
