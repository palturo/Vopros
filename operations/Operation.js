const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet/wallet")
const { TRANSACTION_SYNTAX } = require('../config');
const Syntax = require('./syntax');

class Operation {
    constructor(wallet,data,type) {
      this.wallet = wallet;
      this.type = type;
      this.data = data;
    }

    //Create Operation
    createOP(transactionPool,blockchain){
        var syntax = new Syntax(this.data,this.type);
        if(syntax.checkSyntax(this.data,this.type)){
            var transaction = new Transaction();
            transaction.type = this.type;
            transaction.data = this.data;
            transaction = this.fixData(transaction,blockchain);
            if(transaction){
                transaction = Transaction.signTransaction(transaction,this.wallet);
                if(transactionPool.transactionExists(transaction) == undefined){
                    transactionPool.addTransaction(transaction);
                    return {error: null,result:this.resultMessage(transaction),data:transaction}
                }else{
                    return {error: "You can only submit one Transaction each Block",result:null,data:null}
                }
            }else{
                return {error: "creating Transaction failed",result:null,data:null}
            }
        }
        return {error: "creating Transaction failed",result:null,data:null}
    }

    //Correct data (Filter)
    fixData(transaction,blockchain){
        switch (transaction.type) {
            //Create Account
            case TRANSACTION_SYNTAX.createAccount.type:
                if(!blockchain.accounts.balance[transaction.data.user]){
                    transaction.data.wif = new Wallet(transaction.data.user,transaction.data.wif).getPublicKey();
                }else{
                    transaction = null;
                }
                return transaction;
                break;
        }
    }

    //Execute Operation on Server
    executeOP(blockchain,transaction){
        switch (transaction.type) {
            case TRANSACTION_SYNTAX.createAccount.type:
                blockchain.accounts.initialize(transaction);
                break;
        }
    }

    //Create Result Message
    resultMessage(transaction){
        switch (transaction.type) {
            case TRANSACTION_SYNTAX.createAccount.type:
                var result = {user:transaction.data.user,publicKey:transaction.data.wif};
                return result;
                break;
        }
    }
}

module.exports = Operation;