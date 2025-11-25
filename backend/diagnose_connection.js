require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const logFile = 'diagnosis_log.txt';
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(msg);
}

async function diagnose() {
  fs.writeFileSync(logFile, 'Starting diagnosis...\n');
  
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      log('❌ MONGODB_URI is undefined in process.env');
      process.exit(1);
    }

    // Sanitize URI for logging
    const sanitizedUri = uri.replace(/:([^:@]+)@/, ':****@');
    log(`ℹ️  URI found: ${sanitizedUri}`);

    log('⏳ Connecting to MongoDB...');
    
    // Set a timeout for the connection attempt
    const timeout = setTimeout(() => {
        log('❌ Connection timed out after 10 seconds');
        process.exit(1);
    }, 10000);

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000 // Fail fast
    });
    
    clearTimeout(timeout);
    log('✅ Connected successfully!');
    log(`ℹ️  Database Name: ${mongoose.connection.name}`);
    log(`ℹ️  Host: ${mongoose.connection.host}`);
    
    await mongoose.disconnect();
    log('👋 Disconnected');

  } catch (error) {
    log(`❌ Connection failed: ${error.message}`);
    if (error.name === 'MongooseServerSelectionError') {
        log('ℹ️  Hint: This often means IP whitelist issues or incorrect hostname.');
    }
  }
}

diagnose();
