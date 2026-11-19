const https = require('https');

https.get('https://dev.zemenbank.et:3000/docs', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    // Find all headings, paragraphs, and sections
    const matches = data.match(/<(h[1-6]|p|li|span|a|strong)[^>]*>([^<]+)<\/\1>/g);
    console.log('--- FOUND ELEMENTS ---');
    if (matches) {
      matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 5).slice(0, 50).forEach(t => console.log(t));
    }
  });
});
