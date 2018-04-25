const mongoose = require('mongoose');
const User = mongoose.model('User');
const Transaction = mongoose.model('Transaction');
const randomNumber = require('random-number-csprng');

exports.auth = (req, res, next) => {
  /***********************************
      API - authorization

      todo: currently using only _id, which cannot be changed
      add session related hash/password to improve security
      add session related browser data comparison to improve security
  ***********************************/

  // if a session cookie is provided instead of the user
  if (!req.body.user && req.session.userId) {
    req.body.user = {};
    req.body.user._id = mongoose.Types.ObjectId(req.session.userId);
    req.session.lastSeen = Date.now();
  }
  // if user credentials are provided in the json request
  if (req.body.user && req.body.user._id) {
    return next(); // user is authorized to make API calls
  }
  console.log("unauthorized API request", req.body, req.session);
  res.json({ error: "You do not have permission to access this resource" });
}

exports.api = async (req, res) => {
  /***********************************
      API - getUserData

      accepts user object with id only
      returns full user object (filtered)
  ***********************************/
  console.log(`******** API ${req.body.action} ********`);

  if (req.body.action === "getUserData") {
    // remove these lines
    // const id = mongoose.Types.ObjectId(req.body.user._id);
    // const user = await User.findOne(id);
    const user = await User.findOne({ _id: req.body.user._id });
    // filter - currently returns everything including access codes
    res.json({ success: true, user });
  }

  /***********************************
      API - useSunJoulesForApp

      accepts user object with id only
      creates new SunJoule transaction and
      returns updated user object (filtered)
  ***********************************/

  else if (req.body.action === "useSunJoulesForApp") {
    let user = await User.findOne({ _id: req.body.user._id });
    user = await useSunJoulesForApp(user);
    res.json({ success: true, user });
  }

  /***********************************
      API - refillSunJoulesForApp

      accepts user object with id only
      creates new SunJoule transaction and
      returns updated user object (filtered)
  ***********************************/

  else if (req.body.action === "refillSunJoulesForApp") {
    let user = await User.findOne({ _id: req.body.user._id });
    user = await refillSunJoulesForApp(user);
    res.json({ success: true, user });
  }

  /***********************************
      API - setAppMultiplier

      accepts user object with id and new multiplier
      validates and sets multiplier
      returns success or error message
  ***********************************/

  else if (req.body.action === "setAppMultiplier") {
    const [min, max] = [1, 3];

    // check if it is a valid value
    let message, success;
    let newMultiplier = Math.round(req.body.user.multiplier * 10) / 10;
    if (newMultiplier < min) {
      newMultiplier = min;
      message = `${min * 100}% is the minimum rate`;
      success = false;
    } else if (newMultiplier > max) {
      newMultiplier = max;
      message = `${max * 100}% is the maximum rate`;
      success = false;
    } else {
      message = `Rate set to ${Math.round(newMultiplier * 100)}% solar`;
      success = true;
    }

    await User.findOneAndUpdate({ _id: req.body.user._id },{ $set: { multiplier: newMultiplier }});

    res.json({
      success,
      message,
      user: { multiplier: newMultiplier }
    });
  }

  /***********************************
      API - setData

      accepts user object with id and account data (show_page)
      validates and sets
      returns success or error message
  ***********************************/

  else if (req.body.action === "setData") {
    await User.findOneAndUpdate({ _id: req.body.user._id },{ $set: { "show_page": '' }});

    res.json({
      success: true
    });
  }

  /***********************************
      API - getTransactions

      accepts user object with id
      returns history object listing both SunJoule and More transactions
  ***********************************/

  else if (req.body.action === "getTransactions") {
    // retreive transactions from database
    const sj_transactions = await Transaction.aggregate([
      { $match: { $and: [{ user: mongoose.Types.ObjectId(req.body.user._id) }, { sj_used: { $gt: 0 }}]}},
      { $project: { date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, sj_used: 1 }},
      { $group: { _id: "$date", sj_used: { $sum: "$sj_used" }}},
      { $sort : { _id : -1 }},
      { $limit: 10 }
    ]);
    const mt_transactions = await Transaction.aggregate([
      { $match: { $and: [{ user: mongoose.Types.ObjectId(req.body.user._id) }, { mt_account: { $gt: 0 }}]}},
      { $project: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, mt_account: 1 }},
      { $sort : { _id : -1 }},
      { $limit: 10 }
    ]);
    res.json({history: {sj_transactions, mt_transactions}});
  }

  // none of the supported actions were requested
  else {
    res.json({ error: "Your API request was not formatted correctly." });
  }
}

exports.login = async (req, res) => {
  /***********************************
      API - login

      two step login process using SMS verification
      requires POST with phone number
      followed by POST with phone number and verification code
      successful login initiates a new user or uses SunJoules for an existing user
      then returns the user data and a session cookie
  ***********************************/
  console.log(`******** API phone login ********`);


  if (req.body.phone && req.body.code) {
    const phone = sanitizeAndFormatPhone(req.body.phone);
    const code = req.body.code.toString().replace(/\D/g,'');
    let user = await User.findOne({ phone });

    // check database to see if code for this number is valid and unexpired
  	if (user.code == code && user.code_expires > Date.now()) {

      // actions required before returning user data
      if (!user.sj_account) {
        console.log(`setup new user -- ${user.phone}`)
        user = await setupNewUser(user);
      } else {
        console.log(`use SunJoules for -- ${user.phone}`);
        user = await useSunJoulesForApp(user);
      }

      // update session and set cookie
      req.session.userId = user._id;
      req.session.lastSeen = Date.now();

      // reset verification code and code expiration to null
      await User.findOneAndUpdate({ _id: user._id },{ $unset: { code:"",code_expires:"" }});

      res.json({ success: true, user });
  	} else {
  		res.json({
        success: false,
        message: "That code is incorrect or expired. Please try again."
      });
  	}
  }

  else if (req.body.phone) {
    const phone = sanitizeAndFormatPhone(req.body.phone);
    // send an error message if the phone doesn't meet validation checks
    if (!phone) {
      res.json({success: false, message: 'That is not a valid US phone number. Please provide a 10 digit number.'});
      return;
    }
    // set the verification code and send it to the user
    const code = await setPhoneVerificationCode(phone);
    if (process.env.NODE_ENV === "development") {
      console.log(`new verification code for ${phone} -- ${code}`);
    } else {
      await smsVerificationCode(phone, code);
    }

    res.json({
      success: true,
      message: `Your verification code has been texted to ${phone}`,
      user: { phone }
    });
  }
}

exports.logout = async (req, res) => {
  if (req.session.userId) {
    await req.session.destroy();
  }
  res.json({
    success: true,
    message: "You have been logged out."
  });
}

async function convertSunJoulesToMore() {
  /***********************************
      function operates weekly to distribute a fixed number of More tokens
      so the number received by a user is mySunJoulesUsed / totalSunJoulesUsed
  ***********************************/

  const moreTokens = 1000;
  let totalSunJoulesUsed = await User.outstandingSunJoules();
  totalSunJoulesUsed = totalSunJoulesUsed[0]["total"];
  const users = await User.usersWithSunJoulesUsed();

  for (const index in users) {
    // data example: {_id:"5z9f31f98067a526148a8552",sj_used:350}
    const user = users[index];
    console.log(user);

    // figure out how many MORE the user should receive
    const more = Math.round(moreTokens * user.sj_used / totalSunJoulesUsed);
    const sunjoules = user.sj_used;
    console.log("more",more,"sunjoules",sunjoules);

    // create new transaction
    const tx = new Transaction();
    tx.user = mongoose.Types.ObjectId(user._id);
    tx.sj_used = -sunjoules;
    tx.sj_burned = sunjoules;
    tx.mt_account = more;
    const txDone = await tx.save();
    console.log(txDone);

    // update user object
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: {
          sj_used: Math.round(user.sj_used - sunjoules),
          mt_account: Math.round(user.mt_account + more)
        }
      }
    );
    // end of per user loop
  }
  return `${moreTokens} MORE tokens distributed to ${users.length} users`;
}

async function useSunJoulesForApp(user, increment=false) {
  /***********************************
      function accepts a full user object
      creates a new transaction retiring SunJoules for all energy used or amount left in account
      updates the user accounts, sets date solar used,if necessary
      returns the user object reflecting any changes
  ***********************************/

  // calculate energy used in SunJoules
  const randomization = (Math.random() * 0.4) + 0.8; // between 80 - 120%
  const standardRate = (50 / (24 * 60 * 60 * 1000)); // SJ per period of time in milliseconds
  const timeElapsed = Date.now() - (Date.parse(user.solar_last_used) || Date.now());
  const multiplier = user.multiplier;
  const energyUsed = Math.round(standardRate * randomization * multiplier * timeElapsed);

  // don't try to create transactions of 0 SunJoules
  if (user.sj_account <= 0 || energyUsed == 0) {
    return user; // return original user object unchanged
  }

  // does user have enough SunJoules to cover all energy used?
  outOfSolar = (energyUsed >= user.sj_account) ? true : false;
  solarUsed = (energyUsed < user.sj_account) ? energyUsed : user.sj_account;

  // create new transaction
  const tx = new Transaction();
  tx.user = mongoose.Types.ObjectId(user._id);
  tx.sj_used = solarUsed;
  tx.sj_account = -solarUsed;
  const txDone = await tx.save();

  // update user object
  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { $set: {
        sj_account: Math.round(user.sj_account - solarUsed),
        sj_used: Math.round(user.sj_used + solarUsed),
        solar_last_used: outOfSolar ? null : Date.now(),
        solar_streak: outOfSolar ? 0 : (increment ? user.solar_streak + 1 : user.solar_streak)
      }
    },
    { new: true }
  );

  return updatedUser;
}

async function refillSunJoulesForApp(user) {
  /***********************************
      function accepts a full user object
      creates a new transaction retiring SunJoules for all energy used or amount left in account
      updates the user accounts, sets date solar used,if necessary
      returns the user object reflecting any changes
  ***********************************/

  const walletSize = 200; // the wallet size is fixed
  const need = walletSize - user.sj_account;

  // don't create new transaction if wallet is full
  if (need <= 0) {
    return user;
  }

  // create new transaction
  const tx = new Transaction();
  tx.user = mongoose.Types.ObjectId(user._id);
  tx.sj_account = need;
  tx.sj_server = -need;
  const txDone = await tx.save();

  // update user properties
  const updateIfUsingSolar = (user.solar_last_used === null) ? Date.now() : user.solar_last_used;
  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { $set: {
        sj_account: Math.round(user.sj_account + need),
        solar_last_used: updateIfUsingSolar
      }
    },
    { new: true }
  );

  return updatedUser;
}

function sanitizeAndFormatPhone(phone) {
  phone = phone.toString().replace(/\D/g,'');
  if (phone.length !== 10) return false;
  return `+1${phone}`;
}

async function setPhoneVerificationCode(phone) {
  // create a random code for SMS verification
	const code = await randomNumber(10000,99999);
  const code_expires = Date.now() + 600000; // 10 minutes from now

  // set the verification code and expiration in the database
  const query = { phone: phone };
  const update = { phone, code, code_expires };
  await User.update(query,update,{upsert:true});
  return code;
}

async function smsVerificationCode(phone, code) {
  // phone must be formatted as string including country code, example "+15055069968"
  const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  await	client.messages.create({
    to: phone,
    from: process.env.TWILIO_PHONE,
    body: `More Solar verification code ${code}`
  });
}

async function setupNewUser(user) {
  const amount = 50

  // create new transaction
  const tx = new Transaction();
  tx.user = mongoose.Types.ObjectId(user._id);
  tx.sj_account = amount;
  tx.sj_server = -amount;
  const txDone = await tx.save();

  // update user properties
  newUser = await User.findOneAndUpdate(
    { _id: user._id },
    { $set: {
        show_page: "welcome",
        solar_last_used: Date.now(),
        sj_account: amount,
        mt_account: 0,
        sj_used: 0
      }
    },
    { new: true }
  );

  return newUser;
}

exports.useSunJoulesForApp = useSunJoulesForApp;
exports.convertSunJoulesToMore = convertSunJoulesToMore;
