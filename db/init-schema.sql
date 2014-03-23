begin;

create type role as enum ('user', 'admin', 'debug');

create table "user" (
  username text unique not null
    check (length(username) > 1 and length(username) <= 80),
  role role not null,
  hash bytea not null, -- 256 bits
  salt bytea not null, -- 64 bits
  user_id serial primary key
);

create table currency (
  code text not null,
  rate numeric(16,8) not null,
  currency_id serial primary key
);

create table ledger (
  title text not null,
  -- currency for total value
  currency_id integer references currency not null,
  ledger_id serial primary key
);

create table owner (
  user_id integer references "user" not null,
  ledger_id integer references ledger not null,
  owner_id serial primary key,
  unique (user_id, ledger_id)
);

create table person (
  name text not null,
  -- curreny for total balance
  currency_id integer references currency not null,
  user_id integer references "user", -- null
  ledger_id integer references ledger not null,
  person_id serial primary key,
  unique (user_id, ledger_id)
);

create table transaction (
  description text not null,
  "date" timestamp with time zone, -- null
  "type" text, -- null
  location text, -- null
  transfer boolean default false not null,
  ledger_id integer references ledger not null,
  currency_id integer references currency not null,
  transaction_id serial primary key
);

create table participant (
  share_debt boolean default true not null,
  -- currency for total credit
  credit_currency_id integer references currency not null,
  -- currency for total debit
  debit_currency_id integer references currency not null,
  -- currency for shared debt
  shared_debt_currency_id integer references currency not null,
  transaction_id integer references transaction not null,
  person_id integer references person not null,
  participant_id serial primary key,
  unique (transaction_id, person_id)
);

create table amount (
  amount numeric(16,2) not null,
  currency_id integer references currency not null,
  transaction_id integer references transaction not null,
  participant_id integer references participant not null,
  amount_id serial primary key
);

commit;
