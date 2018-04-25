const mongoose = require('mongoose');
const User = mongoose.model('User');
const { useSunJoulesForApp, convertSunJoulesToMore } = require('./controllers/apiController');

exports.daily = {
  on: "50 23 * * *", // 11:50pm every day
  job: async function() {
    console.log("******** Crontab: Use SunJoules for all Users ********");
    const start = Date.now();

    // get an array of all user id numbers
    const users = await User.activeUsers();

    // calculate energy, use SunJoules and increment streak
    for (const id in users) {
      let user = await User.findOne({ _id: users[id] });
      user = await useSunJoulesForApp(user, true);
    }

    console.log(`******** job finished in ${(Date.now() - start) / 1000} seconds -- ${users.length} users`);
  },
  spawn: false
};

exports.weekly = {
  on: "0 0 * * 0", // 12:00am every Sunday
  job: async function() {
    console.log("******** Crontab: Convert SunJoules to MORE ********");
    const start = Date.now();
    const status = await convertSunJoulesToMore();
    console.log(status);
    console.log(`******** job finished in ${(Date.now() - start) / 1000} seconds`);
  },
  spawn: false
};
