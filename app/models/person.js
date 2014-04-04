module.exports = Person;

function Person(props) {
  this.name = props.name || 'zalgo';
  this.user_id = props.user_id;
  this.currency_id = props.currency_id;
  this.ledger_id = props.ledger_id;
  this.person_id = props.person_id;
}
