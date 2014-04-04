module.exports = extend;

function extend(dst, src) {
  Object.keys(src).forEach(function(k) {
    dst[k] = src[k];
  });
}
