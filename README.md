# Divvd

Flexible multi-currency IOUs online. A course project for
[database project course](http://advancedkittenry.github.io/) at Helsinki
university.

## Resources

* [Deployed app](https://divvd.herokuapp.com)
* [Project report](https://divvd.herokuapp.com/doc/dokumentaatio.pdf)
(in Finnish)

## Installation

Clone this repository with

    $ git clone https://github.com/jlep/divvd.git

Run with

    $ make && make run

or just 

    $ make run

This will initialize a local database, install node dependencies, generate
a self-signed certificate for testing and run a test server locally. You need
Node.js, OpenSSH and PostgreSQL on your PATH for this to work.

## JSON endpoints

**This list is not up to date**

    POST    /api/login
    POST    /api/signup
    GET     /api/account
    GET     /api/logout
    DELETE  /api/account

    GET     /api/ledgers
    POST    /api/ledgers

    GET     /api/ledgers/:ledger_id
    PUT     /api/ledgers/:ledger_id
    DELETE  /api/ledgers/:ledger_id
    POST    /api/ledgers/:ledger_id/currencies
    POST    /api/ledgers/:ledger_id/persons
    POST    /api/ledgers/:ledger_id/transactions
    GET     /api/ledgers/:ledger_id/transactions

    PUT     /api/currencies/:currency_id
    DELETE  /api/currencies/:currency_id

    PUT     /api/persons/:person_id
    DELETE  /api/persons/:person_id

    PUT     /api/transactions/:transaction_id
    DELETE  /api/transactions/:transaction_id
    POST    /api/transactions/:transaction_id/participants

    PUT     /api/participants/:participant_id
    DELETE  /api/participants/:participant_id
    POST    /api/participants/:participant_id/amounts

    PUT     /api/amounts/:amount_id
    DELETE  /api/amounts/:amount_id

## JSON types

**This list is not up to date**

    User = {
      username: string
      role: string
      user_id: integer
    }

    Ledger = {
      title: string
      total_currency_id: integer
      currencies: [Currency]
      persons: [Person]
      owners: [User]
      ledger_id: integer
    }

    Currency = {
      code: string
      rate: number
      ledger_id: integer
      currency_id: integer
    }

    Person = {
      name: string
      currency_id: integer
      user_id: integer
      ledger_id: integer
      person_id: integer
    }

    Transaction = {
      description: string
      date: timestamp
      type: string
      location: string
      transfer: boolean
      currency_id: integer
      participants: [Participant]
      transaction_id: integer
    }

    Participant = {
      share_debt: boolean
      credit_currency_id: integer
      debit_currency_id: integer
      shared_debt_currency_id: integer
      person_id: integer
      amounts: [Amount]
    }

    Amount = {
      amount: number
      currency_id: integer
      participant_id: integer
      amount_id: integer
    }
