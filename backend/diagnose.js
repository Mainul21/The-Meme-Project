const fs = require('fs');
const { exec } = require('child_process');

console.log('Starting diagnostic...');

// Dump .env
try {
  if (fs.existsSync('.env')) {
    const env = fs.readFileSync('.env', 'utf8');
    fs.writeFileSync('env_dump_final.txt', env);
    console.log('Dumped .env');
  } else {
    fs.writeFileSync('env_dump_final.txt', '.env file does not exist');
    console.log('.env missing');
  }
} catch (e) {
  fs.writeFileSync('env_dump_final.txt', 'Error reading .env: ' + e.message);
}

// Run test-db.js and capture output
exec('node test-db.js', (err, stdout, stderr) => {
  const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${err ? err.message : 'None'}`;
  fs.writeFileSync('error_dump_final.txt', output);
  console.log('Finished running test-db.js');
});
