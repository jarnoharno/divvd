module.exports = User;

function User(username, role, user_id) {
  if (username && typeof username !== 'string') {
    var o = username;
    username = o.username;
    role = o.role;
    user_id = o.user_id;
  }
  this.username = username || 'test';
  this.role = role || 'user';
  this.user_id = user_id || null;
}
