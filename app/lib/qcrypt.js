var crypto = require('crypto');
var Promise = require('bluebird');

module.exports = crypt;

var iterations = 10000;
var hash_size = 32;
var salt_size = 8;

function crypt(password, salt) {
  if (!salt) {
    return Promise.promisify(crypto.randomBytes)(salt_size).
    then(function(salt) {
      return crypt(password, salt);
    });
  }
  return Promise.promisify(crypto.pbkdf2)
      (password, salt, iterations, hash_size).
  then(function(hash) {
    return {
      hash: hash,
      salt: salt
    };
  });
}
