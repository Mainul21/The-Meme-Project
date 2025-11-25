require('dotenv').config();
const mongoose = require('mongoose');
const Meme = require('./models/Meme');

const fs = require('fs');

const logFile = 'verification_result.txt';
function log(msg) {
  fs.appendFileSync(logFile, msg + '\n');
  console.log(msg);
}

async function checkLatestMeme() {
  try {
    fs.writeFileSync(logFile, 'Starting verification...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    log('Connected to DB');

    const meme = await Meme.findOne().sort({ createdAt: -1 });
    
    if (meme) {
      log('Latest Meme Found:');
      log('ID: ' + meme._id);
      log('Name: ' + meme.name);
      log('Template: ' + meme.template);
      log('Captions: ' + meme.captions);
      log('Created At: ' + meme.createdAt);
    } else {
      log('No memes found in database.');
    }
  } catch (error) {
    log('Error: ' + error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkLatestMeme();
