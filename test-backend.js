// Simple test to check if backend is running
const http = require('http');

console.log('Testing backend server...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('✅ Backend server is running!');
  console.log('Response status:', res.statusCode);
});

req.on('error', (err) => {
  console.log('❌ Backend server is not running');
  console.log('This means you need to start the backend server');
  console.log('Run: node app/backend/server.js');
});

req.end();

