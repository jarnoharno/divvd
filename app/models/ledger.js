module.exports = Ledger;

function Ledger(props) {
  this.title = props.title || 'New ledger';
  this.ledger_id = props.ledger_id;
}
