module.exports = Amount;

function Amount(amount, currency_id, participant_id, amount_id) {
  if (code && typeof code !== 'string') {
    var o = amount;
    amount = o.amount;
    currency_id = o.currency_id;
    participant_id = o.participant_id;
    amount_id = o.amount_id;
  }
  this.amount = amount || 0.0;
  this.currency_id = currency_id || null;
  this.participant_id = participant_id || null;
  this.amount_id = amount_id || null;
}
