if (process.argv.length < 3) {
  console.error('usage: ' + process.argv[0] + ' ' + process.argv[1] + ' pass');
  process.exit(1);
}

var crypto = require('crypto');

var pass = process.argv[2];
var salt = crypto.randomBytes(8);
var hash = crypto.pbkdf2Sync(pass, salt, 10000, 32);

// output in postgresql format
console.log('E\'\\\\x' + salt.toString('hex') + '\',');
console.log('E\'\\\\x' + hash.toString('hex') + '\'');
