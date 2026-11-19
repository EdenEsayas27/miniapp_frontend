const https = require('https');

https.get('https://dev.zemenbank.et:3000/docs', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    // Print all chunks pushed to self.__next_f
    const lines = data.split('\n');
    lines.forEach((l) => {
      if (l.includes('self.__next_f.push')) {
        // extract the string
        console.log('--- NEXT STREAM CHUNK ---');
        console.log(l.substring(0, 500));
      }
    });
  });
});
