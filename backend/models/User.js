import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    masterPassword: {
      type: String,
      default: null,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    autoLockTimeout: {
      type: Number,
      default: 15, // minutes
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('masterPassword') && this.masterPassword) {
    this.masterPassword = await bcrypt.hash(this.masterPassword, salt);
  }

  next();
});

// Method to compare master passwords
userSchema.methods.matchMasterPassword = async function (enteredMasterPassword) {
  if (!this.masterPassword) return false;
  return await bcrypt.compare(enteredMasterPassword, this.masterPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
