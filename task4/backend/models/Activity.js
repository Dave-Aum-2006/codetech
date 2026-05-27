import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 0, // In seconds
    },
    category: {
      type: String,
      enum: ['productive', 'unproductive', 'neutral'],
      default: 'neutral',
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        return d;
      },
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
