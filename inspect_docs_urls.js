const https = require('https');

https.get('https://dev.zemenbank.et:3000/_next/static/chunks/01tfr1gd4ckfb.js', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    const urls = data.match(/(\/[a-zA-Z0-9_\-\.\/]+\.json|\/api[a-zA-Z0-9_\-\.\/]+)/g);
    console.log('URLs in chunk:', urls);
  });
});
