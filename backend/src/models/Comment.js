const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: true,
      index: true,
    },
    movieTitle: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: String,
      default: '',
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (!ret.id && ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        if (!ret.id && ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Comment', commentSchema);
