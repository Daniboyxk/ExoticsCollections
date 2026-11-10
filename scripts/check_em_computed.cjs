const http = require('http');

http.get('http://localhost:4000/importacion.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    const matches = data.match(/<h2[^>]*>[\s\S]*?<\/h2>/g);
    if (matches) {
      matches.forEach(m => {
        if (m.includes('<em>')) {
          console.log('MATCH:', m.replace(/\s+/g, ' '));
        }
      });
    }
  });
}).on('error', err => console.error(err));

