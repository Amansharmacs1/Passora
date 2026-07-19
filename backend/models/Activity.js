import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['Added', 'Edited', 'Deleted', 'Viewed', 'Copied', 'Login', 'Login 2FA', 'Logout', 'Generated', 'Restored', 'Archived', 'Favorite', 'Master Password Set', 'Master Password Changed', 'Master Password Removed'],
      required: true,
    },
    vaultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vault',
      default: null,
    },
    details: {
      type: String,
      default: '', // Store extra context like "Copied password for Netflix"
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ userId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
