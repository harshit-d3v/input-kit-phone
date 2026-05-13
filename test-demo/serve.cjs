/**
 * Simple HTTP server to serve the demo HTML file
 * Run: node test-demo/serve.cjs
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const demoDir = __dirname;
const projectRoot = path.resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const relativePath = pathname.replace(/^\/+/, '');
  const baseDir = pathname.startsWith('/dist/') ? projectRoot : demoDir;
  const filePath = pathname === '/'
    ? path.join(demoDir, 'index.html')
    : path.resolve(baseDir, relativePath);

  if (!filePath.startsWith(baseDir)) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 Forbidden</h1>', 'utf-8');
    return;
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`
🚀 Server running at http://localhost:${PORT}

Open your browser and navigate to:
  http://localhost:${PORT}

Press Ctrl+C to stop the server.
`);
});
