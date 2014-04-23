begin;
copy ledger (title) from stdin;
Gotlanti
\.
copy currency (code, rate, ledger_id) from stdin;
€	1.00000	1
SEK	0.11693	1
\.
copy owner (user_id, ledger_id, currency_id,
total_credit_currency_id) from stdin;
1	1	1	1
\.
copy ledger_settings (ledger_id, total_currency_id) from stdin;
1	1
\.
copy person (name, currency_id, user_id, ledger_id)
from stdin;
Jarno	1	1	1
Tommi	1	\N	1
Niki	1	\N	1
Hartsi	1	\N	1
Petteri	1	\N	1
\.
copy "transaction" (ledger_id, currency_id, "date", description) from stdin;
1	1	2013-08-01T12:00:00+0300	laivaliput
1	1	2013-08-01T12:00:00+0300	kaasu
1	1	2013-08-01T12:00:00+0300	bisset
1	1	2013-08-01T12:00:00+0300	reissujuomat
1	1	2013-08-01T12:00:00+0300	röökit
1	1	2013-08-02T12:00:00+0300	hodarit
1	2	2013-08-02T12:00:00+0300	kuivashampoo
1	2	2013-08-02T12:00:00+0300	chips + cola
1	2	2013-08-02T12:00:00+0300	pizzat
1	2	2013-08-02T12:00:00+0300	viini
1	1	2013-08-01T12:00:00+0300	laivafoto
1	1	2013-08-01T12:00:00+0300	sambuca
1	1	2013-08-01T12:00:00+0300	sambuca + lonkero
1	1	2013-08-01T12:00:00+0300	kelkat
1	1	2013-08-01T12:00:00+0300	booze + glow stick
1	1	2013-08-01T12:00:00+0300	sambuca
1	1	2013-08-01T12:00:00+0300	sambuca
1	1	2013-08-01T12:00:00+0300	breezer
1	1	2013-08-01T12:00:00+0300	satsi
1	2	2013-08-02T12:00:00+0300	ICA
1	2	2013-08-02T12:00:00+0300	ICA
1	1	2013-08-01T12:00:00+0300	viski
1	1	2013-08-01T12:00:00+0300	bisse
1	2	2013-08-02T12:00:00+0300	ICA
1	2	2013-08-02T12:00:00+0300	kiska
1	2	2013-08-03T12:00:00+0300	löpö
\.
copy owner_transaction_settings (owner_id,
	owner_balance_currency_id, total_value_currency_id,
	owner_total_credit_currency_id, transaction_id) from stdin;
1	1	1	1	1
1	1	1	1	2
1	1	1	1	3
1	1	1	1	4
1	1	1	1	5
1	1	1	1	6
1	2	2	2	7
1	2	2	2	8
1	2	2	2	9
1	2	2	2	10
1	1	1	1	11
1	1	1	1	12
1	1	1	1	13
1	1	1	1	14
1	1	1	1	15
1	1	1	1	16
1	1	1	1	17
1	1	1	1	18
1	1	1	1	19
1	2	2	2	20
1	2	2	2	21
1	1	1	1	22
1	1	1	1	23
1	2	2	2	24
1	2	2	2	25
1	2	2	2	26
\.
copy participant (currency_id, person_id, transaction_id) from stdin;
1	1	1
1	2	1
1	3	1
1	4	1
1	1	2
1	2	2
1	3	2
1	4	2
1	1	3
1	2	3
1	3	3
1	4	3
1	1	4
1	2	4
1	3	4
1	4	4
1	5	4
1	2	5
1	4	5
1	1	6
1	2	6
1	3	6
1	4	6
2	1	7
2	2	7
2	3	7
2	4	7
2	5	7
2	1	8
2	2	8
2	3	8
2	4	8
2	1	9
2	2	9
2	3	9
2	4	9
2	1	10
2	2	10
2	3	10
2	4	10
2	5	10
1	1	11
1	2	11
1	3	11
1	4	11
1	5	11
1	1	12
1	2	12
1	3	12
1	4	12
1	1	13
1	2	13
1	3	13
1	4	13
1	1	14
1	2	14
1	3	14
1	4	14
1	1	15
1	2	15
1	3	15
1	4	15
1	1	16
1	2	16
1	3	16
1	4	16
1	1	17
1	2	17
1	3	17
1	4	17
1	1	18
1	2	18
1	3	18
1	4	18
1	1	19
1	2	19
1	3	19
1	4	19
2	1	20
2	2	20
2	3	20
2	4	20
2	5	20
2	1	21
2	2	21
2	3	21
2	4	21
2	5	21
1	1	22
1	2	22
1	3	22
1	4	22
1	1	23
1	2	23
1	3	23
1	4	23
2	1	24
2	2	24
2	3	24
2	4	24
2	5	24
2	3	25
2	4	25
2	1	26
2	2	26
2	3	26
2	4	26
2	5	26
\.
copy amount (currency_id, person_id, transaction_id, amount) from stdin;
1	1	1	279.00
1	2	2	30.00
1	2	3	62.30
1	3	4	233.10
1	4	5	-34.90
1	2	5	-60.30
1	3	5	95.20
1	1	6	7.00
2	1	7	249.00
2	1	8	35.80
2	1	9	435.00
2	2	9	-92.00
2	4	9	-92.00
2	3	9	-88.00
2	1	9	-88.00
2	1	10	175.00
1	2	11	11.90
1	2	12	22.00
1	2	13	18.50
1	2	14	28.10
1	2	15	18.40
1	2	16	13.00
1	2	17	8.30
1	3	18	5.00
1	3	19	29.80
2	2	20	1957.69
2	1	21	1827.35
1	1	22	5.90
1	1	23	4.90
2	3	24	101.40
2	3	25	98.00
2	3	25	-23.00
2	4	25	-75.00
2	2	26	511.00
\.
commit;
