const fs = require('fs');
const content = `MONGODB_URI=mongodb://localhost:27017/meme-generator
PORT=5000`;
fs.writeFileSync('.env', content);
console.log('.env reverted to local');
