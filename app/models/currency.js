module.exports = Currency;

function Currency(props) {
  this.code = props.code || '€';
  this.rate = props.rate || 1.0;
  this.ledger_id = props.ledger_id || null;
  this.currency_id = props.currency_id || null;
  if (props.active !== undefined) {
    this.active = props.active;
  }
}
