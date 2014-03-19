module.exports = function(port) {
  return function(req, res, next) {
    if (!req.secure) {
      if (port == 443) {
        res.redirect('https://' + req.host + req.originalUrl);
      } else {
        res.redirect('https://' + req.host + ':' + port + req.originalUrl);
      }
    } else {
      next();
    }
  };
};
