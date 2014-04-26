exports.currency = {
  "id": "/currency_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
  "code": {
      "type": "string"
    },
    "rate": {
      "$ref": "/positive_number"
    },
    "ledger_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.participant = {
  "id": "/participant_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "currency_id": {
      "$ref": "/positive_integer"
    },
    "person_id": {
      "$ref": "/positive_integer"
    },
    "transaction_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.amount = {
  "id": "/amount_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "amount": {
      "type": "number"
    },
    "currency_id": {
      "$ref": "/positive_integer"
    },
    "person_id": {
      "$ref": "/positive_integer"
    },
    "transaction_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.person = {
  "id": "/person_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "name": {
      "type": "string"
    },
    "currency_id": {
      "$ref": "/positive_integer"
    },
    "user_id": {
      "$ref": "/positive_integer"
    },
    "ledger_id": {
      "$ref": "/positive_integer"
    }
  }
};
