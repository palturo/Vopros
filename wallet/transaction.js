const ChainUtil = require("../chain-util");
const { TRANSACTION_TYPE } = require("../config");

class Transaction {
  constructor() {
    this.id = ChainUtil.id();
    this.type = null;
    this.input = null;
    this.data = null;
  }
  
  static newTransaction(senderWallet, blockchain, to, amount, currency, type) {
    if (amount + TRANSACTION_FEE > senderWallet.getBalance(blockchain)[currency.toUpperCase()]) {
      console.log(`Amount : ${amount} exceeds the balance`);
      return;
    }

    return Transaction.generateTransaction(senderWallet, to, amount, currency, type);
  }

  static generateTransaction(senderWallet, to, amount, currency, type) {
    if(type != null){
        var transaction = new this();
        transaction.type = type;
        transaction.data = {
            from: senderWallet.username,
            to: to,
            amount: amount.toFixed(2),
            currency: currency,
            fee: TRANSACTION_FEE
        };
        transaction = Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }
  }

  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      from: senderWallet.username,
      wif: senderWallet.publicKey,
      signatureData: senderWallet.sign(ChainUtil.hash(transaction.data)),
      signature: senderWallet.sign(ChainUtil.hash(senderWallet.publicKey))
    };
    return transaction;
  }

  static verifyTransaction(user,transaction,blockchain) {
    var pub = null;
    try{
      pub = blockchain.accounts.publicKey[user];
    }catch(error){

    }
    console.log(pub)

    var validData = false;
    var validUser = false;
    validData = ChainUtil.verifySignature(
      transaction.input.wif,
      transaction.input.signatureData,
      ChainUtil.hash(transaction.data)
    );

    validUser = ChainUtil.verifySignature(
      transaction.input.wif,
      transaction.input.signature,
      ChainUtil.hash(pub)
    );

    console.log("Valid Transaction " + transaction.id +":", validUser + " " + validData )
    if(validUser && validData){
      return true;
    }
    return false;
  }
}

module.exports = Transaction;