const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const sourceFile = path.join(__dirname, 'meme.json');
const destFile = path.join(dataDir, 'memes.json');

console.log('Checking data directory...');
if (!fs.existsSync(dataDir)) {
  console.log('Creating src/data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Copying meme.json...');
if (fs.existsSync(sourceFile)) {
  fs.copyFileSync(sourceFile, destFile);
  console.log('Success: meme.json copied to src/data/memes.json');
} else {
  console.error('Error: Source meme.json not found!');
}
