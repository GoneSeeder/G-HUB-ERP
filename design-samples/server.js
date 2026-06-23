// Tiny static server for previewing the standalone design sample.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 7351;
http.createServer((req, res) => {
  let f = req.url === '/' ? '/holiday-management.html' : req.url.split('?')[0];
  fs.readFile(path.join(__dirname, f), (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(f);
    const type = ext === '.html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}).listen(PORT, () => console.log('serving design sample on ' + PORT));
