const https = require('https');

https.get('https://dev.zemenbank.et:3000/_next/static/chunks/01tfr1gd4ckfb.js', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    // Find all readable English text phrases
    const regex = /[A-Z][a-zA-Z0-9\s,\.:;'"\(\)\/]{12,120}/g;
    const matches = data.match(regex);
    if (matches) {
      console.log('--- FOUND TEXT IN DOCS OVERVIEW ---');
      matches.slice(0, 40).forEach(m => console.log(m.trim()));
    } else {
      console.log('No matches');
    }
  });
});
