module.exports = Amount;

function Amount(props) {
  this.amount = props.amount || 0.0;
  this.currency_id = props.currency_id || null;
  this.participant_id = props.participant_id; // required
  this.amount_id = props.amount_id;
}
