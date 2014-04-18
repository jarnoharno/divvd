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
copy "transaction" (ledger_id, "date", description, currency_id) from stdin;
1	2013-08-01T12:00:00+0300	laivaliput	1
1	2013-08-01T12:00:00+0300	kaasu	1
1	2013-08-01T12:00:00+0300	bisset	1
1	2013-08-01T12:00:00+0300	reissujuomat	1
1	2013-08-01T12:00:00+0300	röökit	1
1	2013-08-02T12:00:00+0300	hodarit	1
1	2013-08-02T12:00:00+0300	kuivashampoo	2
1	2013-08-02T12:00:00+0300	chips + cola	2
1	2013-08-02T12:00:00+0300	pizzat	2
1	2013-08-02T12:00:00+0300	viini	2
1	2013-08-01T12:00:00+0300	laivafoto	1
1	2013-08-01T12:00:00+0300	sambuca	1
1	2013-08-01T12:00:00+0300	sambuca + lonkero	1
1	2013-08-01T12:00:00+0300	kelkat	1
1	2013-08-01T12:00:00+0300	booze + glow stick	1
1	2013-08-01T12:00:00+0300	sambuca	1
1	2013-08-01T12:00:00+0300	sambuca	1
1	2013-08-01T12:00:00+0300	breezer	1
1	2013-08-01T12:00:00+0300	satsi	1
1	2013-08-02T12:00:00+0300	ICA	2
1	2013-08-02T12:00:00+0300	ICA	2
1	2013-08-01T12:00:00+0300	viski	1
1	2013-08-01T12:00:00+0300	bisse	1
1	2013-08-02T12:00:00+0300	ICA	2
1	2013-08-02T12:00:00+0300	kiska	2
1	2013-08-03T12:00:00+0300	löpö	2
\.
copy owner_transaction_settings (transaction_id, owner_id,
	owner_balance_currency_id, total_value_currency_id,
	owner_total_credit_currency_id) from stdin;
1	1	1	1	1
2	1	1	1	1
3	1	1	1	1
4	1	1	1	1
5	1	1	1	1
6	1	1	1	1
7	1	2	2	2
8	1	2	2	2
9	1	2	2	2
10	1	2	2	2
11	1	1	1	1
12	1	1	1	1
13	1	1	1	1
14	1	1	1	1
15	1	1	1	1
16	1	1	1	1
17	1	1	1	1
18	1	1	1	1
19	1	1	1	1
20	1	2	2	2
21	1	2	2	2
22	1	1	1	1
23	1	1	1	1
24	1	2	2	2
25	1	2	2	2
26	1	2	2	2
\.
copy participant (credit_currency_id, debit_currency_id,
	shared_debt_currency_id, balance_currency_id, transaction_id, share_debt,
	person_id) from stdin;
1	1	1	1	1	TRUE	1
1	1	1	1	1	TRUE	2
1	1	1	1	1	TRUE	3
1	1	1	1	1	TRUE	4
1	1	1	1	2	TRUE	1
1	1	1	1	2	TRUE	2
1	1	1	1	2	TRUE	3
1	1	1	1	2	TRUE	4
1	1	1	1	3	TRUE	1
1	1	1	1	3	TRUE	2
1	1	1	1	3	TRUE	3
1	1	1	1	3	TRUE	4
1	1	1	1	4	TRUE	1
1	1	1	1	4	TRUE	2
1	1	1	1	4	TRUE	3
1	1	1	1	4	TRUE	4
1	1	1	1	4	TRUE	5
1	1	1	1	5	TRUE	2
1	1	1	1	5	FALSE	3
1	1	1	1	5	TRUE	4
1	1	1	1	6	TRUE	1
1	1	1	1	6	TRUE	2
1	1	1	1	6	TRUE	3
1	1	1	1	6	TRUE	4
2	2	2	2	7	TRUE	1
2	2	2	2	7	TRUE	2
2	2	2	2	7	TRUE	3
2	2	2	2	7	TRUE	4
2	2	2	2	7	TRUE	5
2	2	2	2	8	TRUE	1
2	2	2	2	8	TRUE	2
2	2	2	2	8	TRUE	3
2	2	2	2	8	TRUE	4
2	2	2	2	9	TRUE	1
2	2	2	2	9	TRUE	2
2	2	2	2	9	TRUE	3
2	2	2	2	9	TRUE	4
2	2	2	2	10	TRUE	1
2	2	2	2	10	TRUE	2
2	2	2	2	10	TRUE	3
2	2	2	2	10	TRUE	4
2	2	2	2	10	TRUE	5
1	1	1	1	11	TRUE	1
1	1	1	1	11	TRUE	2
1	1	1	1	11	TRUE	3
1	1	1	1	11	TRUE	4
1	1	1	1	11	TRUE	5
1	1	1	1	12	TRUE	1
1	1	1	1	12	TRUE	2
1	1	1	1	12	TRUE	3
1	1	1	1	12	TRUE	4
1	1	1	1	13	TRUE	1
1	1	1	1	13	TRUE	2
1	1	1	1	13	TRUE	3
1	1	1	1	13	TRUE	4
1	1	1	1	14	TRUE	1
1	1	1	1	14	TRUE	2
1	1	1	1	14	TRUE	3
1	1	1	1	14	TRUE	4
1	1	1	1	15	TRUE	1
1	1	1	1	15	TRUE	2
1	1	1	1	15	TRUE	3
1	1	1	1	15	TRUE	4
1	1	1	1	16	TRUE	1
1	1	1	1	16	TRUE	2
1	1	1	1	16	TRUE	3
1	1	1	1	16	TRUE	4
1	1	1	1	17	TRUE	1
1	1	1	1	17	TRUE	2
1	1	1	1	17	TRUE	3
1	1	1	1	17	TRUE	4
1	1	1	1	18	TRUE	1
1	1	1	1	18	TRUE	2
1	1	1	1	18	TRUE	3
1	1	1	1	18	TRUE	4
1	1	1	1	19	TRUE	1
1	1	1	1	19	TRUE	2
1	1	1	1	19	TRUE	3
1	1	1	1	19	TRUE	4
2	2	2	2	20	TRUE	1
2	2	2	2	20	TRUE	2
2	2	2	2	20	TRUE	3
2	2	2	2	20	TRUE	4
2	2	2	2	20	TRUE	5
2	2	2	2	21	TRUE	1
2	2	2	2	21	TRUE	2
2	2	2	2	21	TRUE	3
2	2	2	2	21	TRUE	4
2	2	2	2	21	TRUE	5
1	1	1	1	22	TRUE	1
1	1	1	1	22	TRUE	2
1	1	1	1	22	TRUE	3
1	1	1	1	22	TRUE	4
1	1	1	1	23	TRUE	1
1	1	1	1	23	TRUE	2
1	1	1	1	23	TRUE	3
1	1	1	1	23	TRUE	4
2	2	2	2	24	TRUE	1
2	2	2	2	24	TRUE	2
2	2	2	2	24	TRUE	3
2	2	2	2	24	TRUE	4
2	2	2	2	24	TRUE	5
2	2	2	2	25	TRUE	1
2	2	2	2	25	TRUE	2
2	2	2	2	26	TRUE	1
2	2	2	2	26	TRUE	2
2	2	2	2	26	TRUE	3
2	2	2	2	26	TRUE	4
2	2	2	2	26	TRUE	5
\.
copy amount (amount, currency_id, participant_id) from stdin;
279.00	1	1
30.00	1	6
62.30	1	10
233.10	1	15
-34.90	1	20
-60.30	1	18
95.20	1	19
7.00	1	21
249.00	2	25
35.80	2	30
435.00	2	34
-92.00	2	35
-92.00	2	37
-88.00	2	36
-88.00	2	34
175.00	2	38
11.90	1	44
22.00	1	49
18.50	1	53
28.10	1	57
18.40	1	61
13.00	1	65
8.30	1	69
5.00	1	74
29.80	1	78
1957.69	2	81
1827.35	2	85
5.90	1	90
4.90	1	94
101.40	2	100
98.00	2	103
-23.00	2	103
-75.00	2	104
511.00	2	106
\.
commit;
