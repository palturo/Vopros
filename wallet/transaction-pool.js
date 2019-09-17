const Transaction = require("./transaction");
const { TRANSACTION_THRESHOLD } = require("../config");

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    if (this.transactions.length >= TRANSACTION_THRESHOLD) {
        return true;
    } else {
        return false;
    }
  }

  validTransactions(transactions,blockchain) {
    return transactions.filter(transaction => {
      if (!Transaction.verifyTransaction(transaction.input.from,transaction,blockchain)) {
        console.log(`Invalid signature from ${transaction.input.from}`);
        return false;
      }

      return true;
    });
  }

  transactionExists(transaction) {
    let exists = this.transactions.find(t => t.input.from === transaction.input.from);
    return exists;
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;