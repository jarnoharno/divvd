module.exports = Amount;

function Amount(props) {
  this.amount = props.amount || 0.0;
  this.currency_id = props.currency_id || null;
  this.transaction_id = props.transaction_id; // required
  this.person_id = props.person_id; // required
  this.amount_id = props.amount_id;
}
