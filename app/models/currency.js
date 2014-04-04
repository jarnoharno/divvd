module.exports = Currency;

function Currency(code, rate, ledger_id, currency_id) {
  if (code && typeof code !== 'string') {
    var o = code;
    code = o.code;
    rate = o.rate;
    ledger_id = o.ledger_id;
    currency_id = o.currency_id;
  }
  this.code = code || '€';
  this.rate = rate || 1.0;
  this.ledger_id = ledger_id || null;
  this.currency_id = currency_id || null;
}
