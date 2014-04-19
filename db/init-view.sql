drop view if exists gen_amount cascade;

create view gen_amount as 
select amount * rate gen_amount, *
from amount 
join currency using (currency_id)
join participant using (participant_id);

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

-- generalized total credit per transaction
create view gen_total_credit_transaction as
select sum(gen_amount) gen_total_credit, transaction_id 
from gen_credit
group by transaction_id;

-- generalized total credit per participant
create view gen_total_credit_participant as
select sum(gen_amount) gen_total_credit, participant_id
from gen_credit
group by participant_id;

-- generalized total value per ledger
create view gen_total_ledger as
select sum(gen_amount) gen_total, a.ledger_id
from gen_credit as a
join transaction using (transaction_id)
where transfer is false
group by a.ledger_id;

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

-- generalized explicit total debit per participant
create view gen_total_explicit_debit_participant as
select sum(gen_amount) gen_total_debit, participant_id
from gen_debit
group by participant_id;

-- all generalized totals, even if there are rows in "amount" for a transaction
-- (even though that should not be legal)
create view all_gen_total_credit_transaction as
select coalesce(gen_total_credit, 0) gen_total_credit, transfer, ledger_id,
  transaction_id
from gen_total_credit_transaction
right join "transaction" using (transaction_id);

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

-- generalized balance per participant
create view gen_balance_participant as
select
  coalesce(gen_total_credit, 0) gen_credit,
  coalesce(gen_total_debit, 0) - coalesce(gen_shared_debt, 0) gen_debit,
  coalesce(gen_total_credit, 0) + coalesce(gen_total_debit, 0)
  - coalesce(gen_shared_debt, 0) gen_balance,
  participant.*
from participant
left join gen_total_credit_participant using (participant_id)
left join gen_total_explicit_debit_participant using (participant_id)
left join gen_shared_debt_participant using (participant_id);

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


--drop view if exists ledgers_web_view cascade;

-- ledgers view for web
-- there should be a record for each owner
create view ledgers_web_view as
select b.ledger_id
     , title
     , user_id
     , cast(coalesce(gen_balance, 0) / f.rate as numeric(16,2)) user_balance
     , f.currency_id user_balance_currency_id
     , cast(coalesce(gen_total, 0) / g.rate as numeric(16,2)) total_value
     , g.currency_id total_value_currency_id
     , is_balanced
from owner                      as a
join ledger                     as b using (ledger_id)
join ledger_settings            as e using (ledger_id)
join balanced_ledger            as h using (ledger_id)
left join gen_total_ledger      as d using (ledger_id)
left join gen_balance_person    as c using (ledger_id, user_id)
join currency                   as f on f.currency_id = a.currency_id
join currency                   as g on g.currency_id = e.total_currency_id
;
--gen_balance_person as t
--join owner on t.user_id = owner.user_id and t.ledger_id = owner.ledger_id
--join currency as bc on owner.currency_id = bc.currency_id
--join gen_total_ledger on t.ledger_id = gen_total_ledger.ledger_id
--join ledger_settings as ls on t.ledger_id = ls.ledger_id
--join currency as tc on ls.total_currency_id = tc.currency_id
--join ledger on t.ledger_id = ledger.ledger_id
--join balanced_ledger as bl on t.ledger_id = bl.ledger_id;


-- transactions web view table
-- [{
--   ledger_id:integer
--   transaction_id:integer
--   description:integer
--   transfer:boolean
--   user_id:integer
--   user_balance:numeric
--   user_balance_currency_id:integer
--   total_value:numeric
--   total_value_currency_id:integer
--   user_credit:numeric
--   user_credit_currency_id:integer
-- }]

create view gen_balance_owner_participant as
select
gen_credit,
gen_debit,
gen_balance,
participant_id,
transaction_id,
owner_id,
o.user_id,
o.ledger_id
from gen_balance_participant
join person p using (person_id)
join owner o on p.user_id = o.user_id and p.ledger_id = o.ledger_id;

-- there should be a record for each transaction_id, owner.user_id pair
create view transactions_web_view as
select
a.ledger_id,
a.transaction_id,
a.description,
a.transfer,
b.user_id,
cast(coalesce(gen_balance, 0) / f.rate as numeric(16,2)) user_balance,
f.currency_id user_balance_currency_id,
cast(coalesce(gen_total_credit, 0) / h.rate as numeric(16,2)) total_value,
h.currency_id total_value_currency_id,
cast(coalesce(gen_credit, 0) / g.rate as numeric(16,2)) user_credit,
g.currency_id user_credit_currency_id
from transaction                        as a
join owner                              as b using (ledger_id)
left join gen_balance_owner_participant as c using (owner_id, transaction_id)
join gen_total_credit_transaction       as d using (transaction_id)
join owner_transaction_settings         as e using (transaction_id, owner_id)
join currency as f on e.owner_balance_currency_id       = f.currency_id
join currency as g on e.owner_total_credit_currency_id  = g.currency_id
join currency as h on e.total_value_currency_id         = h.currency_id
;
  
--join transaction as b using (transaction_id)


--join owner_transaction_settings as c using (transaction_id, owner_id)
--join currency as d on c.owner_balance_currency_id = d.currency_id
--join currency as e on c.owner_total_credit_currency_id = e.currency_id
--join gen_total_credit_transaction as f using (transaction_id)
--join currency as g on c.total_value_currency_id = g.currency_id;

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
--   user_credit_currency_id:integer
-- }]

-- generalized total credit per owner per transaction

create view ledger_summary_web_view as
select
a.ledger_id,
title,
user_id,
user_balance,
user_balance_currency_id,
total_value,
total_value_currency_id,
cast(coalesce(gen_total_credit, 0) / c.rate as numeric(16,2)) user_credit,
c.currency_id user_credit_currency_id
from ledgers_web_view as a
join person using (ledger_id, user_id)
left join gen_total_credit_person using (person_id)
join owner as o using (ledger_id, user_id)
join currency as c on o.total_credit_currency_id = c.currency_id;

