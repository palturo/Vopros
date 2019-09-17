const ChainUtil = require("../chain-util");

class Account {
    constructor() {
      this.users = ["null"];
      this.balance = {null: {VOPROS:500.00, VSC: 500.00, VPOWER: 500.00}};
      this.publicKey = {null:"f9297bcb8fa80ce2eb07c6b39c6ae17b4fa20402f23a5888bfbb8a3cc9138716"};
    }
  
    initialize(transaction) {
        var user = transaction.data.user;
        if (this.balance[user] == undefined) {
            this.balance[user] = {VOPROS: 100.00, VSC: 0.00, VPOWER: 15.00};
            this.publicKey[user] = transaction.data.wif;
            this.users.push(user);
        }
    }
  
    transfer(from, to, amount, currency) {
      if(this.users.includes(from) && this.users.includes(to)){
          if(this.balance[from][currency] >= amount){
            this.increment(to, amount,currency);
            this.decrement(from, amount, currency);
          }
      }
    }
  
    increment(to, amount, currency) {
      this.balance[to][currency] += amount;
    }
  
    decrement(from, amount, currency) {
      this.balance[from][currency] -= amount;
    }
  
    getBalance(user) {
      if(this.balance[user]){
        return this.balance[user];
      }
    }
  
    update(transaction) {
      let amount = parseFloat(transaction.data.amount);
      let from = transaction.input.from;
      let currency = transaction.data.currency.toUpperCase();
      let to = transaction.data.to;
      this.transfer(from, to, amount,currency);
    }
  
    transferFee(block) {
      let amount = 1;
      let from = "null";
      let to = block.validator;
      let currency = "VOPROS"
      this.transfer(from, to, amount,currency);
    }

    validUser(transaction){
        return true;
    }
  }
  
  module.exports = Account;