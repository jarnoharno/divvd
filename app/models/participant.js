module.exports = Participant;

function Participant(props) {
  this.share_debt = props.share_debt || true;
  this.credit_currency_id = props.credit_currency_id || null;
  this.debit_currency_id = props.debit_currency_id || null;
  this.shared_debt_currency_id = props.shared_debt_currency_id || null;
  this.person_id = props.person_id; // required
  this.transaction_id = props.transaction_id; // required
  this.participant_id = props.participant_id;
}
