begin;

create type role as enum ('user', 'admin', 'debug');

create table "user" (
  username text
    unique
    not null
    check (length(username) > 1 and length(username) <= 80)
    ,
  role role
    default 'user'
    not null
    ,
  hash bytea
    -- 256 bits
    not null
    ,
  salt bytea
    -- 64 bits
    not null
    ,
  user_id serial
    primary key
);

create table currency (
  code text
    not null
    ,
  rate numeric(16,8)
    check (rate > 0)
    not null
    ,
  currency_id serial
    primary key
);

create table ledger (
  title text
    not null
    ,
  -- currency for total value
  currency_id integer
    default 1
    not null
    references currency on delete set default
    ,
  ledger_id serial
    primary key
);

create table owner (
  user_id integer
    not null
    references "user" on delete cascade
    ,
  ledger_id integer
    not null
    references ledger on delete cascade
    ,
  owner_id serial
    primary key
    ,
  unique (user_id, ledger_id)
);

create table person (
  name text
    not null
    ,
  -- curreny for total balance
  currency_id integer
    default 1
    not null
    references currency on delete set default
    ,
  user_id integer
    -- null
    references "user" on delete set null
    ,
  ledger_id integer
    not null
    references ledger on delete cascade
    ,
  person_id serial
    primary key
    ,
  unique (user_id, ledger_id)
);

create table transaction (
  description text
    not null
    ,
  "date" timestamp with time zone
    -- null
    ,
  "type" text
    -- null
    ,
  location text
    -- null
    ,
  transfer boolean
    default false
    not null
    ,
  ledger_id integer
    not null
    references ledger on delete cascade
    ,
  currency_id integer
    default 1
    not null
    references currency on delete set default
    ,
  transaction_id serial
    primary key
);

create table participant (
  share_debt boolean
    default true
    not null
    ,
  -- currency for total credit
  credit_currency_id integer
    default 1
    not null
    references currency on delete set default
    ,
  -- currency for total debit
  debit_currency_id integer
    default 1
    not null
    references currency on delete set default
    ,
  -- currency for shared debt
  shared_debt_currency_id integer
    default 1
    not null
    references currency on delete set default
    ,
  transaction_id integer
    not null
    references transaction
    ,
  person_id integer
    not null
    references person on delete cascade
    ,
  participant_id serial
    primary key
    ,
  unique (transaction_id, person_id)
);

create table amount (
  amount numeric(16,2)
    not null
    ,
  currency_id integer
    default 1
    not null
    references currency on delete set default
    ,
  transaction_id integer
    not null
    references transaction on delete cascade
    ,
  participant_id integer
    not null
    references participant
    ,
  amount_id serial primary key
);

-- triggers

-- delete ledgers that are not owned by anyone
--
-- this might be more efficient as a row level trigger
-- that would get the deleted owner row as a special variable

create function ledger_owner_check() returns trigger as $$
begin
  delete from ledger where ledger_id not in (select ledger_id from owner);
  return null;
end;
$$ language plpgsql;

create trigger ledger_owner_trigger
  after delete on owner
  execute procedure ledger_owner_check();

-- mandatory data

insert into currency (code, rate) values ('€', 1.00000000);

commit;
