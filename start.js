const mongoose = require('mongoose');
require('dotenv').config();
const cronjob = require('node-cron-job');

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`ERROR connecting to database: ${err.message}`);
});

require('./models/User');
require('./models/Transaction');

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

// Start reoccuring jobs for use of SunJoules and conversion to More
cronjob.setJobsPath('../../../jobs');
cronjob.startAllJobs();
