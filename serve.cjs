const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'dist');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  const url = new URL(req.url, 'http://localhost');
  let name = decodeURIComponent(url.pathname);
  if(name === '/') name = '/index.html';
  const file = path.resolve(root, '.' + name);
  if(!file.startsWith(root + path.sep)){res.writeHead(403);res.end();return;}
  fs.stat(file,(err,stat)=>{
    if(err || !stat.isFile()){res.writeHead(404);res.end('Not found');return;}
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*'};
    const range=req.headers.range;
    if(range){const m=range.match(/bytes=(\d+)-(\d*)/);if(m){const start=+m[1],end=m[2]?+m[2]:stat.size-1;res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);return;}}
    res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(file).pipe(res);
  });
}).listen(4173,'127.0.0.1',()=>console.log('COPLAF preview: http://127.0.0.1:4173'));
