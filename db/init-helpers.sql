-- helper functions

-- here we have functions that are too tedious
-- to implement as transactions in the client (rest server) side

begin;

create type currency_rep as (
  code text,
  rate numeric(16,8)
);

create type ledger_rep as (
  title text,
  total_currency_id integer,
  ledger_id integer
);

-- functions are always executed within a transaction
-- variables are declared with suffix _v to prevent confusing them with
-- table, column or type names

-- create ledger
--
-- title_v ledger title
-- total_currency_v total currency
-- user_id_v initial owner user_id
-- return created ledger
create function create_ledger
  (title_v text, total_currency_v currency_rep, user_id_v integer)
  returns ledger_rep
as $$
declare
  ledger_id_v integer;
  currency_id_v integer;
begin
  insert into ledger (title) values (title_v)
    returning ledger_id into ledger_id_v;
  insert into owner (user_id, ledger_id) values (user_id_v, ledger_id_v);
  insert into currency (code, rate, ledger_id)
    values (total_currency_v.code, total_currency_v.rate, ledger_id_v)
    returning currency_id into currency_id_v;
  insert into ledger_settings (ledger_id, total_currency_id)
    values (ledger_id_v, currency_id_v);
  insert into person (name, currency_id, user_id, ledger_id)
    select username, currency_id_v, user_id_v, ledger_id_v from "user"
    where user_id = user_id_v limit 1;
  return row(title_v, currency_id_v, ledger_id_v)::ledger_rep;
end;
$$ language plpgsql;

commit;
