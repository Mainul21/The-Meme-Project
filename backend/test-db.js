require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
console.log('Port:', process.env.PORT || 5000);

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test creating a meme
    const Meme = require('./models/Meme');
    
    const testMeme = new Meme({
      name: 'Test Meme',
      imageData: 'data:image/png;base64,test',
      template: 'Test Template',
      captions: ['Test Caption 1', 'Test Caption 2']
    });
    
    return testMeme.save();
  })
  .then((savedMeme) => {
    console.log('✅ Test meme saved successfully!');
    console.log('Meme ID:', savedMeme._id);
    console.log('Meme Name:', savedMeme.name);
    
    // Fetch all memes
    const Meme = require('./models/Meme');
    return Meme.find();
  })
  .then((memes) => {
    console.log(`\n📊 Total memes in database: ${memes.length}`);
    memes.forEach((meme, index) => {
      console.log(`\nMeme ${index + 1}:`);
      console.log('  ID:', meme._id);
      console.log('  Name:', meme.name);
      console.log('  Template:', meme.template);
      console.log('  Captions:', meme.captions);
      console.log('  Created:', meme.createdAt);
    });
    
    console.log('\n✅ Database test completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });
