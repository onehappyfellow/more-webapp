const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const bodyParser = require('body-parser');
const controller = require('./controllers/apiController');

const app = express();

// serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// take the raw requests and turn them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// sessions are used for part of API authorization
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: 604800000 },
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// api endpoints
app.post('/api', controller.auth, controller.api);
app.post('/api/login', controller.login);
app.get('/api/logout', controller.logout);

// default handler for anything that doesn't match above routes - use the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// export it so we can start the site in start.js
module.exports = app;
