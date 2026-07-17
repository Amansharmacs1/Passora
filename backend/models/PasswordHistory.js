import mongoose from 'mongoose';

const passwordHistorySchema = new mongoose.Schema(
  {
    vaultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vault',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
  },
  {
    timestamps: true,
  }
);

passwordHistorySchema.index({ vaultId: 1, createdAt: -1 });

const PasswordHistory = mongoose.model('PasswordHistory', passwordHistorySchema);

export default PasswordHistory;
