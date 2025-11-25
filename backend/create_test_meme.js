require('dotenv').config();
const mongoose = require('mongoose');
const Meme = require('./models/Meme');

const fs = require('fs');
const logFile = 'creation_log.txt';
function log(msg) {
  fs.appendFileSync(logFile, msg + '\n');
  console.log(msg);
}

async function createTestMeme() {
  try {
    fs.writeFileSync(logFile, 'Starting creation...\n');
    log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connected to MongoDB');

    const testMeme = new Meme({
      name: 'Test Meme ' + new Date().toISOString(),
      imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // 1x1 pixel red dot
      template: 'Test Template',
      captions: ['Test Caption 1', 'Test Caption 2']
    });

    log('Saving test meme...');
    const savedMeme = await testMeme.save();
    log('✅ Test meme saved successfully!');
    log('Meme ID: ' + savedMeme._id);
    log('Database Name: ' + mongoose.connection.name);
    
  } catch (error) {
    log('❌ Error: ' + error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestMeme();
