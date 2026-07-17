import mongoose from 'mongoose';

const recoveryCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const RecoveryCode = mongoose.model('RecoveryCode', recoveryCodeSchema);
export default RecoveryCode;
