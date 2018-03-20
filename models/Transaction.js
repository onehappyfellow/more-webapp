const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const transactionSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sj_server: Number,
  sj_account: Number,
  sj_used: Number,
  mt_account: Number,
  memo: String
});

transactionSchema.statics.getAccounts = function(id) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(id) }},
    { $group: { _id: "$user",
      sj_server: { $sum: "$sj_server" },
      sj_account: { $sum: "$sj_account" },
      sj_used: { $sum: "$sj_used" },
      mt_account: { $sum: "$mt_account" }
    } }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
