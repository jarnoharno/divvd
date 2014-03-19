begin;
insert into userdata
(username, pass, salt)
values
('test',
-- password 'test'
-- 256 bit pbkdf2-sha1 with 10000 iterations
E'\\x3dc3a79cdcab557a97e9c8bfa454dd7a5654547482f8704c52cded0e173a5070',
-- 64 bit random salt
E'\\x7a35a1922d341dad'
);
commit;
