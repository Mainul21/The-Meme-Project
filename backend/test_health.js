require('dotenv').config();
const http = require('http');
http.get('http://localhost:5000/api/health', (res) => {
  let data='';
  res.on('data', chunk=> data+=chunk);
  res.on('end',()=> console.log('Health response:', data));
}).on('error', err=> console.error('Health request error:', err.message));
