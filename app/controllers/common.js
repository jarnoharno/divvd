exports.requireAuth = function(req, res) {
  // user is not authenticated, require basic auth
  res.statusCode = 401;
  // Browsers will only generate default auth dialog when WWW-Authenticate
  // method is either 'Basic' or 'Digest'. From web clients we can suppress
  // this by attaching ?error=hidden querystring to requests.
  if (req.query && req.query.error === 'hidden') {
    res.setHeader('WWW-Authenticate', 'Custom realm="Authorization Required"');
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Required"');
  }
  res.json({ message: "unauthorized" });
};
