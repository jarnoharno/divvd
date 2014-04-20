module.exports = User;

function User(username, role, user_id, currency_id, total_credit_currency_id) {
  if (username && typeof username !== 'string') {
    var o = username;
    username = o.username;
    role = o.role;
    user_id = o.user_id;
    currency_id = o.currency_id;
  }
  this.username = username || 'test';
  this.role = role || 'user';
  this.user_id = user_id || null;
  // per ledger setting
  if (currency_id) {
    this.currency_id = currency_id;
  }
  if (total_credit_currency_id) {
    this.total_credit_currency_id = total_credit_currency_id;
  }
}
