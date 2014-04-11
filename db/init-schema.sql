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

create table ledger (
  title text
    default 'New ledger'
    not null
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

create table currency (
  code text
    default '€'
    not null
    ,
  rate numeric(16,8)
    default 1.0
    check (rate > 0)
    not null
    ,
  ledger_id integer
    not null
    references ledger on delete cascade
    ,
  currency_id serial
    primary key
);

create table ledger_settings (
  ledger_id integer
    not null
    references ledger on delete cascade
    ,
  total_currency_id integer
    references currency on delete set null
    ,
  ledger_settings_id serial
    primary key
    ,
  -- ledger can have only one ledger_settings object
  unique (ledger_id, ledger_settings_id)
);

create table person (
  name text
    not null
    ,
  -- curreny for total balance
  currency_id integer
    -- null
    references currency on delete set null
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
    default 'New transaction'
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
    -- null
    references currency on delete set null
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
    -- null
    references currency on delete set null
    ,
  -- currency for total debit
  debit_currency_id integer
    -- null
    references currency on delete set null
    ,
  -- currency for shared debt
  shared_debt_currency_id integer
    -- null
    references currency on delete set null
    ,
  transaction_id integer
    not null
    references transaction on delete cascade
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
    default 0.0
    not null
    ,
  currency_id integer
    -- null
    references currency on delete set null
    ,
  participant_id integer
    not null
    references participant on delete cascade
    ,
  amount_id serial primary key
);

-- triggers

-- delete ledgers that are not owned by anyone
-- this cascades the deletion of a user to everything the user owns
--
-- this might be more efficient as a row level trigger that would get the
-- deleted owner row as a special variable instead of subquerying for the
-- entire owner table and comparing it to all ledger ids

create function owner_ledger_check() returns trigger as $$
begin
  delete from ledger where ledger_id not in (select ledger_id from owner);
  return null;
end;
$$ language plpgsql;

create trigger owner_ledger_trigger
after delete or update of ledger_id on owner
execute procedure owner_ledger_check();

-- constraint triggers

-- check that ledgers have owners and settings

create function ledger_constraint_check() returns trigger as $$
begin
	if (select exists(select 1 from owner as a
      where a.ledger_id = new.ledger_id limit 1)) then
    if (select exists(select 1 from ledger_settings as a
        where a.ledger_id = new.ledger_id limit 1)) then
  		return new;
    end if;
    raise exception '''%'' does not have settings', new.title;
	end if;
	raise exception '''%'' does not have any owners', new.title;
end;
$$ language plpgsql;

create constraint trigger ledger_constraint_trigger
after insert or update on ledger deferrable initially deferred
for each row execute procedure ledger_constraint_check();

-- we could have a constraint for preventing the destruction of ledger
-- settings...

-- mandatory data

commit;
