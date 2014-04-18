drop view if exists gen_amount cascade;

create view gen_amount as 
select amount * rate gen_amount, *
from amount 
natural join currency
natural join participant;

create view gen_credit as
select *
from gen_amount
where gen_amount > 0;

create view gen_debit as
select *
from gen_amount
where gen_amount < 0;

-- generalized total credit per person
create view gen_total_credit_person as
select sum(gen_amount) gen_total_credit, person_id
from gen_credit
group by person_id;

-- generalized explicit total credit per transaction
create view gen_total_credit_transaction as
select sum(gen_amount) gen_total_credit, transaction_id 
from gen_credit
group by transaction_id;

-- all generalized totals, even if there are rows in "amount" for a transaction
-- (even though that should not be legal)
create view all_gen_total_credit_transaction as
select coalesce(gen_total_credit, 0) gen_total_credit, transfer, ledger_id,
  transaction_id
from gen_total_credit_transaction
right join "transaction" using (transaction_id);

-- generalized total value per ledger
create view gen_total_ledger as
select sum(gen_total_credit) gen_total, ledger_id
from all_gen_total_credit_transaction
where transfer is false
group by ledger_id;


-- generalized explicit total debit per transaction
create view gen_total_explicit_debit_transaction as
select sum(gen_amount) gen_total_debit, transaction_id
from gen_debit
group by transaction_id;

-- generalized explicit total debit per person
create view gen_total_explicit_debit_person as
select sum(gen_amount) gen_total_debit, person_id
from gen_debit
group by person_id;

-- generalized residuals for all transactions
create view all_gen_residual as
select gen_total_credit + coalesce(gen_total_debit, 0) gen_residual,
  transaction_id
from all_gen_total_credit_transaction
left join gen_total_explicit_debit_transaction using (transaction_id);

drop view if exists debt_share_count cascade;

-- number of debt sharing participants in transaction
-- this should never be zero!
create view debt_share_count as
select greatest(count(*), 1) debt_share_count, transaction_id
from participant
where share_debt is true
group by transaction_id;

-- generalized shared debt per transaction
create view gen_shared_debt_transaction as
select gen_residual / coalesce(debt_share_count, 1) gen_shared_debt,
  transaction_id
from all_gen_residual
left join debt_share_count using (transaction_id);

-- generalized shared debt per participant
create view gen_shared_debt_participant as
select *
from gen_shared_debt_transaction
natural join participant
where share_debt is true;

-- generalized shared debt per person
create view gen_shared_debt_person as
select sum(gen_shared_debt) gen_shared_debt, person_id
from gen_shared_debt_participant
group by person_id;

-- generalized balance per person
create view gen_balance_person as
select
  coalesce(gen_total_credit, 0) gen_credit,
  coalesce(gen_total_debit, 0) - coalesce(gen_shared_debt, 0) gen_debit,
  coalesce(gen_total_credit, 0) + coalesce(gen_total_debit, 0)
  - coalesce(gen_shared_debt, 0) gen_balance,
  person.*
from person
left join gen_total_credit_person using (person_id)
left join gen_total_explicit_debit_person using (person_id)
left join gen_shared_debt_person using (person_id);

-- ledger balanced
create view balanced_ledger as
select every(gen_balance = 0) is_balanced, ledger_id
from gen_balance_person group by ledger_id;

-- ledgers view for web
create view ledgers_web_view as
select
t.ledger_id ledger_id,
title,
t.user_id user_id,
cast(gen_balance / bc.rate as numeric(16,2)) user_balance,
owner.currency_id user_balance_currency_id,
cast(gen_total / tc.rate as numeric(16,2)) total_value,
ls.total_currency_id total_value_currency_id,
is_balanced
from gen_balance_person as t
join owner on t.user_id = owner.ledger_id
join currency as bc on owner.currency_id = bc.currency_id
join gen_total_ledger on t.ledger_id = gen_total_ledger.ledger_id
join ledger_settings as ls on t.ledger_id = ls.ledger_id
join currency as tc on ls.total_currency_id = tc.currency_id
join ledger on t.ledger_id = ledger.ledger_id
join balanced_ledger as bl on t.ledger_id = bl.ledger_id;


-- transactions web view table
-- [{
--   ledger_id:integer
--   transaction_id:integer
--   description:integer
--   transfer:boolean
--   user_id:integer
--   user_balance:numeric
--   user_balance_currency_id:integer -- there is currently only one currency
--   total_value:numeric
--   total_value_currency_id:integer
--   user_credit:numeric
--   user_credit_currency_id:integer
-- }]

-- ledger summary web view table
-- [{
--   ledger_id:integer
--   title:string
--   user_id:integer
--   user_balance:numeric
--   user_balance_currency_id:integer
--   total_value:numeric
--   total_value_currency_id:integer
--   user_credit:numeric
--   user_credit_currency_id:integer -- this does not exist currently
-- }]

