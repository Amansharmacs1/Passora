import mongoose from 'mongoose';

const passkeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  credentialID: {
    type: String, // Stored as base64url string
    required: true,
    unique: true,
  },
  credentialPublicKey: {
    type: String, // Stored as base64url string
    required: true,
  },
  counter: {
    type: Number,
    required: true,
    default: 0,
  },
  transports: {
    type: [String],
    default: [],
  },
  deviceName: {
    type: String,
    default: 'Unknown Device',
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Passkey = mongoose.model('Passkey', passkeySchema);
export default Passkey;
