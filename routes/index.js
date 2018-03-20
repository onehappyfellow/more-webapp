const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/login', userController.loginForm);
router.get('/logout', authController.logout);

//router.post('/login', catchErrors(authController.verifyWithSMS));
router.post('/login', catchErrors(authController.verifyDev));
router.post('/verify', catchErrors(authController.checkVerification));

// protected routes
router.get('/', authController.isLoggedIn, catchErrors(userController.home));
router.get('/account', authController.isLoggedIn, catchErrors(userController.account));
router.get('/refill', authController.isLoggedIn, userController.video);

// API
router.post('/api/setrate', authController.isLoggedIn, catchErrors(userController.setRate));
router.post('/api/refill', authController.isLoggedIn, catchErrors(userController.refill));

module.exports = router;
