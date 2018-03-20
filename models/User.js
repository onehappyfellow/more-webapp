const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  code: Number,
  code_expires: Date,
  multiplier: {
    type: Number,
    min: 1,
    max: 3,
    default: 1
  },
  solar_streak: {
    type: Number,
    default: 0
  }
});

userSchema.statics.allUsers = function() {
  return this.distinct("_id");
};

module.exports = mongoose.model('User', userSchema);
