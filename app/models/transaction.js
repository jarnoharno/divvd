module.exports = Transaction;

function Transaction(props) {
  this.description = props.description || 'New transaction';
  this.date = props.date || new Date();
  this.type = props.type || null;
  this.location = props.location || null;
  this.transfer = props.transfer || false;
  this.currency_id = props.currency_id || null;
  this.ledger_id = props.ledger_id; // required
  this.transaction_id = props.transaction_id;
  if (props.total_credit) {
    this.total_credit = props.total_credit;
  }
}
