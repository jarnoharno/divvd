module.exports = function() {
  var ret = {};
  Array.prototype.forEach.call(arguments, function(arg) {
    Object.keys(arg).forEach(function(key) {
      ret[key] = arg[key];
    });
  });
  return ret;
};
