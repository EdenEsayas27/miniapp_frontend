const https = require('https');

https.get('https://dev.zemenbank.et:3000/sandbox', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    // Print all chunks
    console.log('Sandbox length:', data.length);
    // Find text inside
    const clean = data.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Clean sandbox text:', clean);
  });
});
