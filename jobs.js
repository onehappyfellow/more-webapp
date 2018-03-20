exports.daily = {
  on: "50 23 * * *", // 11:50pm every day
  job: async function() {
    const start = Date.now();
    console.log(`daily job starting`);
    await incrementAllUsers();
    console.log(`daily job finished in ${Date.now() - start}`);
  },
  spawn: false
};

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Transaction = mongoose.model('Transaction');

function useSunJoules(user, amount) {
  const tx = new Transaction();
  tx.user = mongoose.Types.ObjectId(user);
  tx.sj_used = amount;
  tx.sj_account = -amount;
  return tx.save();
};

async function incrementAllUsers(){
  const users = await User.allUsers(); // array of all users
  users.forEach(async (id) => {
    console.log(`>>>starting user ${id}`);
    try {
      // request data for user and last transaction
      const user = await User.findOne({ _id: id });
      const last = await Transaction.aggregate([
        { $match: { user: mongoose.Types.ObjectId(id) }},
        { $sort : { timestamp : -1 }},
        { $limit: 1 }
      ]);
      const balance = await Transaction.getAccounts(id);

      // calculate energy used
      const randomization = (Math.random() * 0.4) + 0.8; // between 80 - 120%
      const standardRate = (50 / (24 * 60 * 60 * 1000)); // SJ per period of time in milliseconds
      const timeElapsed = Date.now() - Date.parse(last[0].timestamp);
      const multiplier = user.multiplier;
      const energyUsed = Math.round(standardRate * randomization * multiplier * timeElapsed);
      if (energyUsed == 0) return;

      // does user have enough SunJoules?
      const available = balance[0].sj_account;
      if (available >= energyUsed) {
        await useSunJoules(id, energyUsed);
        await User.findOneAndUpdate({ _id: id },{ $inc: { solar_streak: 1 }});
        console.log(`${energyUsed} SunJoules used, streak incremented`);
        return;
      } else {
        await User.findOneAndUpdate({ _id: id },{ $set: { solar_streak: 0 }});
        await useSunJoules(id, available);
        console.log(`${available} SunJoules used - insufficient - streak reset`);
        return;
      }
    }
    catch(err){
      console.log(err);
    }
  });
  return;
};
