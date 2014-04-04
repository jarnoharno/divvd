module.exports = Ledger;

function Ledger(props) {
  this.title = props.title || 'New ledger';
  if (props.total_currency_id) {
    this.total_currency_id = props.total_currency_id;
  }
  this.ledger_id = props.ledger_id;
}
