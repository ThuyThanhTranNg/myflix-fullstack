const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    username: {
      type: String,
      required: true,
      unique: true,
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
    gender: {
      type: String,
      trim: true,
      default: '',
    },
    isAdmin: {
      type: Boolean,
      default: false,
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

userSchema.statics.findByAnyId = function (paramId) {
  const queryOr = [];
  const numId = Number(paramId);
  if (!isNaN(numId)) {
    queryOr.push({ id: numId });
  }
  if (mongoose.isValidObjectId(paramId)) {
    queryOr.push({ _id: paramId });
  }
  if (queryOr.length === 0) {
    return this.findOne({ _id: null });
  }
  return this.findOne({ $or: queryOr });
};

module.exports = mongoose.model('User', userSchema);
