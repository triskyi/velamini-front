const https = require('https');

console.log("Testing connection to accounts.google.com...");

const options = {
  hostname: 'accounts.google.com',
  port: 443,
  path: '/.well-known/openid-configuration',
  method: 'GET',
  timeout: 5000 // 5 seconds
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write("Received data (first 50 bytes): " + d.slice(0, 50) + "...\n");
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`PROBLEM WITH REQUEST: ${e.message}`);
  if (e.cause) console.error(`CAUSE: ${e.cause}`);
});

req.on('timeout', () => {
    console.error("REQUEST TIMED OUT");
    req.destroy();
});

req.end();
