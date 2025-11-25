require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const logFile = 'cloud_diag_log.txt';
fs.writeFileSync(logFile, '--- Starting Cloud Diagnostic ---\n');

function log(message) {
  fs.appendFileSync(logFile, message + '\n');
  console.log(message);
}

log(`Time: ${new Date().toISOString()}`);

const uri = process.env.MONGODB_URI;
log(`URI defined: ${!!uri}`);
if (uri) {
  // Log masked URI to check for format issues
  const masked = uri.replace(/:([^:@]+)@/, ':****@');
  log(`URI: ${masked}`);
} else {
  log('ERROR: MONGODB_URI is missing');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => {
    log('✅ Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch((err) => {
    log('❌ Connection Error:');
    log(err.message);
    log('Code: ' + err.code);
    log('Name: ' + err.name);
    if (err.cause) log('Cause: ' + JSON.stringify(err.cause));
    process.exit(1);
  });
