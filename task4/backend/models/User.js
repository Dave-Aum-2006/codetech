import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    settings: {
      workHoursStart: {
        type: String,
        default: '09:00',
      },
      workHoursEnd: {
        type: String,
        default: '17:00',
      },
      blockedDomains: {
        type: [String],
        default: ['facebook.com', 'youtube.com', 'instagram.com', 'twitter.com', 'netflix.com'],
      },
      customClassifications: {
        type: Map,
        of: String,
        default: {
          'github.com': 'productive',
          'stackoverflow.com': 'productive',
          'chatgpt.com': 'productive',
          'google.com': 'productive',
          'youtube.com': 'unproductive',
          'facebook.com': 'unproductive',
          'netflix.com': 'unproductive',
        },
      },
    },
  },
  { timestamps: true }
);

// Match password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
