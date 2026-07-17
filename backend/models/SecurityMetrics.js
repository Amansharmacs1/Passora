import mongoose from 'mongoose';

const securityMetricsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    totalPasswords: {
      type: Number,
      default: 0,
    },
    strongPasswords: {
      type: Number,
      default: 0,
    },
    weakPasswords: {
      type: Number,
      default: 0,
    },
    duplicatePasswords: {
      type: Number,
      default: 0,
    },
    oldPasswords: {
      type: Number,
      default: 0,
    },
    missingInfo: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

securityMetricsSchema.index({ userId: 1, createdAt: -1 });

const SecurityMetrics = mongoose.model('SecurityMetrics', securityMetricsSchema);

export default SecurityMetrics;
