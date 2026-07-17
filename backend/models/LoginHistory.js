import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

loginHistorySchema.index({ userId: 1, loginTime: -1 });

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);

export default LoginHistory;
