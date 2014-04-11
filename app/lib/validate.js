var jsonschema = require('jsonschema');

module.exports = validate;

var positive_integer_schema = {
  "id": "/positive_integer",
  "type": "integer",
  "minimum": 0,
  "exclusiveMinimum": true
};

var positive_number_schema = {
  "id": "/positive_number",
  "type": "number",
  "minimum": 0,
  "exclusiveMinimum": true
};

var validator = new jsonschema.Validator();
validator.addSchema(positive_integer_schema);
validator.addSchema(positive_number_schema);

function validate(json, schema) {
  var v = validator.validate(json, schema);
  return v.errors.length == 0;
}
