const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    releaseDate: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    subtitleUrl: {
      type: String,
      trim: true,
      default: '',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Ensure id is always accessible whether numeric or string
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

// Helper static method to find by either custom numeric id or MongoDB _id
movieSchema.statics.findByAnyId = function (paramId) {
  const queryOr = [];
  const numId = Number(paramId);
  if (!isNaN(numId)) {
    queryOr.push({ id: numId });
  }
  if (mongoose.isValidObjectId(paramId)) {
    queryOr.push({ _id: paramId });
  }
  if (queryOr.length === 0) {
    return this.findOne({ _id: null }); // will return null safely
  }
  return this.findOne({ $or: queryOr });
};

module.exports = mongoose.model('Movie', movieSchema);
