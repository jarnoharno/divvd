var fs          = require('fs');
var path        = require('path');
var crypto      = require('crypto');
var httpProxy   = require('http-proxy');

if (process.argv.length < 4) {
  console.error('usage: node proxy.js key.pem cert.pem');
  process.exit(1);
}

var key = process.argv[2];
var cert = process.argv[3];
var host = process.env.HOST || 'localhost';
var port = process.env.PORT || 80;
var ssl_port = process.env.SSL_PORT || 443;

httpProxy.createServer({
  target: {
    host: host,
    port: port
  },
  ssl: {
    key: fs.readFileSync(key, 'utf8'),
    cert: fs.readFileSync(cert, 'utf8')
  },
  xfwd: true
}).listen(ssl_port);
console.log('proxying ssl port ' + ssl_port + ' to ' + host + ':' + port);
