require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const logFile = 'cloud_connection_log.txt';

function log(message) {
  fs.appendFileSync(logFile, message + '\n');
  console.log(message);
}

log('--- Starting Cloud Connection Test ---');
log(`Time: ${new Date().toISOString()}`);

const uri = process.env.MONGODB_URI;
log(`URI defined: ${!!uri}`);
if (uri) {
  mongoose.connect(uri)
    .then(() => {
      console.log('✅ Successfully connected to MongoDB!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Connection Error:');
      console.error(err.message);
      console.error('Full error:', err);
      process.exit(1);
    });
} else {
  log('ERROR: MONGODB_URI is missing');
  process.exit(1);
}
