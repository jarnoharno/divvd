module.exports = Participant;

function Participant(props) {
  if (props.shared_debt) {
    this.shared_debt = props.shared_debt;
  }
  this.currency_id = props.currency_id || null;
  this.person_id = props.person_id; // required
  this.transaction_id = props.transaction_id; // required
  if (props.participant_id) {
    this.participant_id = props.participant_id;
  }
}
