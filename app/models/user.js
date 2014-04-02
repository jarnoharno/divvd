module.exports = User;

function User(username, role, user_id) {
  this.username = username || 'test';
  this.role = role || 'user';
  this.user_id = user_id || null;
}
