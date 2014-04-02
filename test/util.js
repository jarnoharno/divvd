// extend object

exports.extend = function(ret, base) {
  for (key in base) {
    if (base.hasOwnProperty(key)) {
      ret[key] = base[key];
    }
  }
  return ret;
}


