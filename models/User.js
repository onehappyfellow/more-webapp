const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  code: Number,
  code_expires: Date,
  show_page: String,
  multiplier: {
    type: Number,
    min: 1,
    max: 3,
    default: 1
  },
  solar_last_used: {
    type: Date,
    default: Date.now
  },
  solar_streak: {
    type: Number,
    default: 0
  },
  sj_account: Number,
  sj_used: Number,
  mt_account: Number,
});

userSchema.statics.activeUsers = function() {
  return this.distinct("_id", { sj_account: { $gt: 0 }});
};
userSchema.statics.usersWithSunJoulesUsed = function() {
  return this.aggregate([
    { $match: {sj_used: {$gt:0}}},
    { $project: { _id:1, sj_used:1, mt_account:1 }}
  ]);
};
userSchema.statics.outstandingSunJoules = function() {
  return this.aggregate([
    { $group: { _id:null, total:{$sum: "$sj_used"}}},
    { $project: { _id: 0, total: 1 }}
  ]);
};

module.exports = mongoose.model('User', userSchema);
