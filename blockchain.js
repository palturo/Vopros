const Block = require('./block');
const Account = require("./blockchain/account");
const Transaction = require("./wallet/transaction")
const { TRANSACTION_SYNTAX } = require("./config");
const Operation = require('./operations/Operation')


class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
        this.accounts = new Account();
    }

    addBlock(block) {
        this.chain.push(block);
        console.log("NEW BLOCK ADDED");
        return block;
    }
    
    createBlock(data, wallet) {
        const block = Block.createBlock(
          this.chain[this.chain.length - 1],
          data,
          wallet
        );
        return block;
    }

    static blockHash(block){
        //destructuring
        const { timestamp, lastHash, data } = block;
        return Block.hash(timestamp,lastHash,data);
    }

    isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;

        for(let i = 1 ; i<chain.length; i++){
            const block = chain[i];
            const lastBlock = chain[i-1];
            if((block.lastHash !== lastBlock.hash) || (
                block.hash !== Block.blockHash(block)))
            return false;
        }

        return true;
    }

    isValidBlock(block) {
        const lastBlock = this.chain[this.chain.length - 1];
        if (
          block.lastHash === lastBlock.hash &&
          block.hash === Block.blockHash(block) &&
          Block.verifyBlock(block) &&
          this.verifyTransaction(block)
        ) {
          console.log("block valid");
          this.addBlock(block);
          this.executeTransactions(block);
          return true;
        } else {
          return false;
        }
    }

    replaceChain(newChain){
        if(newChain.length <= this.chain.length){
            console.log("Recieved chain is not longer than the current chain");
            return;
        }else if(!this.isValidChain(newChain)){
            console.log("Recieved chain is invalid");
            return;
        }
        
        console.log("Replacing the current chain with new chain");
        this.resetState();
        this.executeChain(newChain);
        this.chain = newChain; 
    }

    getBalance(user) {
        return this.accounts.getBalance(user);
    }

    userExist(user){
        if(this.accounts.balance[user] == undefined){
            return false;
        }
        return false;
    }

    verifyTransaction(block){
        var valid = true;
        block.data.forEach(transaction => {
            if(!Transaction.verifyTransaction(transaction.input.from,transaction,this)){
                valid = false;
            }
        });
        return valid;
    }

    executeTransactions(block) {
        block.data.forEach(transaction => {
            //General Transactions
            if(Transaction.verifyTransaction(transaction.input.from,transaction,this)){
                if(this.accounts.validUser(transaction)){
                    var op = new Operation();
                    op.executeOP(this,transaction);
                }
            }
        });
    }

    executeChain(chain) {
        chain.forEach(block => {
          this.executeTransactions(block);
        });
    }

    resetState() {
        this.chain = [Block.genesis()];
        this.accounts = new Account();
    }
}

module.exports = Blockchain;