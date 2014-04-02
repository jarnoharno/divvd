// Models an error in user input
//
// code is a suggested http status code

module.exports = Hox;

function Hox(code, message) {
    this.code = code;
    this.message = message;
    this.name = "Hox";
    Error.captureStackTrace(this, Hox);
}
Hox.prototype = Object.create(Error.prototype);
Hox.prototype.constructor = Hox;

// A helper function to easily send http error message in json format
// with express

Hox.prototype.send = function(res) {
  res.json(this.code, {
    message: this.message
  });
};
