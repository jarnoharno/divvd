var util = require('util');

module.exports = function inspect(obj) {
  var str = util.inspect(obj, { depth: null, colors: true });
  console.log(str);
}
