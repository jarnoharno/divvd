exports.isArray = function(value) {
  return toString.call(value) === '[object Array]';
}
exports.appendTo = function(dst, src) {
  Array.prototype.splice.apply(dst, [dst.length, 0].concat(src))
}
exports.uniques = function(arr, accessor) {
  if (!accessor) {
    accessor = function(v) {
      return v;
    };
  }
  var dupl = {};
  var ret = [];
  arr.forEach(function(v, i) {
    var key = accessor(v);
    if (!dupl[key]) {
      ret.push(v);
      dupl[key] = true;
    }
  });
  return ret;
}
