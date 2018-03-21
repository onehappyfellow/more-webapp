const mongoose = require('mongoose');
const User = mongoose.model('User');
const Transaction = mongoose.model('Transaction');

exports.home = async (req, res) => {
  const result = await useSunJoulesForApp(req.user._id);
  const user = await User.findOne({ _id: req.user._id });
  const accounts = await Transaction.getAccounts(req.user._id);
  res.render('home', {user, accounts, title: 'Home'});
};

exports.loginForm = (req, res) => {
	res.render('login', { title: 'Login' });
};
exports.video = (req, res) => {
	res.render('refill', { title: 'Refill SunJoules' });
};

exports.account = async (req, res) => {
  const data = await Transaction.aggregate([
    { $match: { $and: [{ user: mongoose.Types.ObjectId(req.user._id) }, { sj_used: { $gt: 0 }}]}},
    { $project: { date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, sj_used: 1 }},
    { $group: { _id: "$date", sj_used: { $sum: "$sj_used" }}},
    { $sort : { date : 1 }},
    { $limit: 20 }
  ]);
  //if this also puts out week number, can easily do a rollup
  const user = await User.findOne({ _id: req.user._id });
  res.render('account', {data, user, title: 'Account'});
};

exports.setRate = async (req, res) => {
  const [min, max] = [1, 3];
  const increment = 0.2;
  const rate = Number(req.body.currentRate);
  let newRate = (req.body.change == 'up') ? rate + increment : rate - increment;
  if (newRate < min) newRate = min;
  if (newRate > max) newRate = max;
  const user = await User.findOneAndUpdate({ _id: req.user._id },{ $set: { multiplier: newRate }},{ new: true });
  res.redirect('/account');
};

exports.refill = async (req, res) => {
  const result = await refillSolar(req.user._id);
  res.redirect('/');
};


function useSunJoules(user, amount) {
  const tx = new Transaction();
  tx.user = mongoose.Types.ObjectId(user);
  tx.sj_used = amount;
  tx.sj_account = -amount;
  return tx.save();
};

function buySunJoules(user, amount) {
  const tx = new Transaction();
  tx.user = mongoose.Types.ObjectId(user);
  tx.sj_account = amount;
  tx.sj_server = -amount;
  return tx.save();
};

async function useSunJoulesForApp(id) {
  // request data for user and last transaction
  const user = await User.findOne({ _id: id });
  const last = await Transaction.aggregate([
    { $match: { $and: [
      { user: mongoose.Types.ObjectId(id) },
      { sj_used: { $gt: 0 }}
    ]}},
    { $sort : { timestamp : -1 }},
    { $limit: 1 }
  ]);
  const balance = await Transaction.getAccounts(id);

  // calculate energy used
  const randomization = (Math.random() * 0.4) + 0.8; // between 80 - 120%
  const standardRate = (50 / (24 * 60 * 60 * 1000)); // SJ per period of time in milliseconds
  const timeElapsed = Date.now() - Date.parse(last[0].timestamp) || Date.now();
  const multiplier = user.multiplier;
  const energyUsed = Math.round(standardRate * randomization * multiplier * timeElapsed);
  if (energyUsed == 0) return;

  // does user have enough SunJoules?
  const available = balance[0].sj_account;
  if (available >= energyUsed) {
    await useSunJoules(id, energyUsed);
    console.log(`${energyUsed} SunJoules used`);
    return;
  } else {
    await User.findOneAndUpdate({ _id: id },{ $set: { solar_streak: 0 }});
    await useSunJoules(id, available);
    console.log(`${available} SunJoules used, insufficient`);
    return;
  }
};

async function refillSolar(id) {
  const balance = await Transaction.getAccounts(id);
  const need = 200 - balance[0].sj_account;
  if (need == 0) return;
  return buySunJoules(id, need);
};
