begin;

insert into "user"
(username, role, hash, salt)
values
( 'jlep', 'user',
  -- password 'test'
  -- 256 bit pbkdf2-sha1 with 10000 iterations
  E'\\x3dc3a79cdcab557a97e9c8bfa454dd7a5654547482f8704c52cded0e173a5070',
  -- 64 bit random salt
  E'\\x7a35a1922d341dad'
),
( 'debug', 'debug',
  -- password 'debug'
  E'\\xc0578d25dc68939293d094f99671a0b69e58d0ac5b76a7fe950dad95ccb299be',
  E'\\xf255aca0b9f53cd8'
),
( 'admin', 'admin',
  -- password 'debug'
  E'\\xc0578d25dc68939293d094f99671a0b69e58d0ac5b76a7fe950dad95ccb299be',
  E'\\xf255aca0b9f53cd8'
);
commit;
