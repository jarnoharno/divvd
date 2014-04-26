var session = require('../lib/session');
var participant = require('../dao/participant');
var validate = require('../lib/validate');

// GET /api/participant/:participant_id
//
// Get requested participant

exports.get = function(req, db) {
  var participant_id = req.params.participant_id;
  return participant.owners(participant_id, db).
  then(session.auth(req, /debug|admin/)).
  then(close(participant.find)(participant_id, db));
};

// DELETE /api/participant/:participant
//
// Delete the requested participant

exports.del = function(req, db) {
  var participant_id = req.params.participant_id;
  return participant.owners(participant_id, db).
  then(session.auth(req, /admin/)).
  then(close(participant.del)(participant_id, db));
}

// PUT /api/participants/:t
//
// Update participant

var participant_arg_schema = {
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

exports.put = function(req, db) {
  var participant_id = req.params.participant_id;
  return validate.check(req.body, participant_arg_schema).
  then(close(participant.owners)(participant_id, db)).
  then(session.auth(req, /admin/)).
  then(close(participant.update)(req.params.participant_id, req.body, db));
};
