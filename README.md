# JSON endpoints

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

# JSON types

    User = {
      username: string
      role: string
      user_id: integer
    }

    Ledger = {
      title: string
      currency_id: integer
      currencies: [Currency]
      persons: [Person]
      owners: [User]
      ledger_id: integer
    }

    Currency = {
      code: string
      rate: number
      currency_id: integer
    }

    Person = {
      name: string
      currency_id: integer
      user_id: integer
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
      amount_id: integer
    }
