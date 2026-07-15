import mongoose from 'mongoose';

const vaultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    websiteURL: {
      type: String,
      trim: true,
    },
    favicon: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    authTag: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Others',
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries (optional but good for performance)
vaultSchema.index({ userId: 1, title: 1 });
vaultSchema.index({ userId: 1, deleted: 1, archived: 1, favorite: 1 });

const Vault = mongoose.model('Vault', vaultSchema);

export default Vault;
