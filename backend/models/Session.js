import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    deviceInfo: {
      os: { type: String, default: 'Unknown' },
      browser: { type: String, default: 'Unknown' },
      ipAddress: { type: String, default: 'Unknown' },
      deviceName: { type: String, default: 'Unknown Device' }
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically remove expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
