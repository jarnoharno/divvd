module.exports = function(f) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return function() {
      return f.apply(undefined, args);
    }
  };
}
