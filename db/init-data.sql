begin;

insert into "user"
(username, role, hash, salt)
values
( 'test', 'user',
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

insert into ledger (title) values ('night out');
insert into owner (user_id, ledger_id) values (1, 1);
insert into currency (code, rate, ledger_id) values ('€', 1.00000000, 1);
insert into ledger_settings (ledger_id, total_currency_id) values (1, 1);
insert into person (name, currency_id, user_id, ledger_id)
  values ('test', 1, 1, 1);
insert into transaction
  (description, "date", "type", location, transfer, ledger_id, currency_id)
  values ('beer', '2014-03-22T22:41:24+0200', 'beer', 'molotov', false, 1, 1);
insert into participant (share_debt, credit_currency_id, debit_currency_id,
  shared_debt_currency_id, transaction_id, person_id)
  values (true, 1, 1, 1, 1, 1);
insert into amount (amount, currency_id, participant_id)
  values (4.5, 1, 1);

commit;
