const mongoose = require('mongoose');
const User = mongoose.model('User');
const randomNumber = require('random-number-csprng');
const passport = require('passport');
const promisify = require('es6-promisify');
const Transaction = mongoose.model('Transaction');

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/login');
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

exports.verifyWithSMS = async (req, res) => {
	// see if a user with that phone number exists
	const phone = `+1${req.body.phone.replace(/\D/g,'')}`;
  const user = await User.findOne({ phone: phone });

	// create a random code for SMS verification
	const code = await randomNumber(10000,99999);
	const codeExpires = Date.now() + 600000; // 10 minutes from now

	// new user create, current user modify
	if(!user){
		const n = new User();
		n.phone = phone;
		n.code = code;
		n.code_expires = codeExpires;
		const user = await n.save();
    //create initial transaction
    const tx = new Transaction();
    tx.user = mongoose.Types.ObjectId(user._id);
    tx.sj_account = 50;
    tx.sj_server = -50;
    await tx.save();
  } else {
		user.code = code;
		user.code_expires = codeExpires;
		await user.save();
	}

	// send SMS with verification code
	const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
	await	client.messages.create({
		to: phone,
		from: process.env.TWILIO_PHONE,
		body: `More Solar verification code ${code}`
	});

	// render the verification input form
  req.flash('success', `Your verification code has been texted to ${phone}`);
  res.render('verify', { title: 'Verify your account', phone, flashes: req.flash() });
};

exports.verifyDev = async (req, res) => {
	// see if a user with that phone number exists
	const phone = `+1${req.body.phone.replace(/\D/g,'')}`;
  const user = await User.findOne({ phone: phone });

	// create a random code for SMS verification
	const code = await randomNumber(10000,99999);
	const codeExpires = Date.now() + 600000; // 10 minutes from now

	// new user create, current user modify
	if(!user){
		const n = new User();
		n.phone = phone;
		n.code = code;
		n.code_expires = codeExpires;
    const user = await n.save();
    //create initial transaction
    const tx = new Transaction();
    tx.user = mongoose.Types.ObjectId(user._id);
    tx.sj_account = 50;
    tx.sj_server = -50;
    await tx.save();
  } else {
		user.code = code;
		user.code_expires = codeExpires;
		await user.save();
	}

	// render the verification input form
  req.flash('success', `Enter verification code ${code}`);
  res.render('verify', { title: 'Verify your account', phone, flashes: req.flash() });
};

exports.checkVerification = async (req, res) => {
	const user = await User.findOne({ phone: req.body.phone });
	if (user.code == req.body.code && user.code_expires > Date.now()){
		await req.login(user);
		res.redirect('/');
	} else {
		req.flash('error', 'Login failed. Please try again.');
		res.redirect('/login');
	}
};
