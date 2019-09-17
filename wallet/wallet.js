const ChainUtil = require("../chain-util");
const Transaction = require("./transaction");

class Wallet {
  constructor(user,secret) {
    this.balance = 0;
    this.username = user;
    this.keyPair = ChainUtil.genKeyPair(user+secret);
    this.publicKey = this.keyPair.getPublic("hex");
  }

  toString() {
    return `Wallet - 
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`;
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash).toHex();
  }

  createTransaction(to, amount, currency, type, blockchain, transactionPool) {
    let transaction = Transaction.newTransaction(this, blockchain, to, amount, currency, type);
    if(transaction){
        transactionPool.addTransaction(transaction);
    }
    return transaction;
  }

  getBalance(blockchain) {
    return blockchain.getBalance(this.username);
  }

  getPublicKey() {
    return this.publicKey;
  }
}

module.exports = Wallet;