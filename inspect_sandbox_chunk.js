const https = require('https');

https.get('https://dev.zemenbank.et:3000/_next/static/chunks/3k7evwpjy2hvb.js', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    // Print all strings in chunk
    const matches = data.match(/"([^"\\]{4,80})"/g);
    if (matches) {
      console.log('Sample strings in sandbox chunk:', matches.slice(0, 50));
    }
  });
});
