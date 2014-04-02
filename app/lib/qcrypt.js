var crypto = require('crypto');
var Promise = require('bluebird');

module.exports = qcrypt;

var iterations = 10000;
var hashSize = 32;
var saltSize = 8;

function qcrypt(password) {
  return Promise.promisify(crypto.randomBytes)(saltSize).
  then(function(salt) {
    return Promise.promisify(crypto.pbkdf2)
        (password, salt, iterations, hashSize).
    then(function(hash) {
      return {
        hash: hash,
        salt: salt
      };
    });
  });
}
