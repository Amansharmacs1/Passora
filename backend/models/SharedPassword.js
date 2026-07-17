import mongoose from 'mongoose';

const sharedPasswordSchema = new mongoose.Schema(
  {
    vaultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vault',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    maxViews: {
      type: Number,
      default: 1, // 0 for unlimited
    },
    viewsCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically remove expired shares
sharedPasswordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SharedPassword = mongoose.model('SharedPassword', sharedPasswordSchema);
export default SharedPassword;
