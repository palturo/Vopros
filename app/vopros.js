const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const Operation = require('../operations/Operation')
const { TRANSACTION_SYNTAX, WITNESS_OWNERS, WITNESS_USER } = require('../config')

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

//create a new app
const app  = express();

//using the blody parser middleware
app.use(bodyParser.json());

// create a new blockchain instance
const blockchain = new Blockchain();

// Create Wallet
const Wallet = require('../wallet/wallet');
const wallet = {user:WITNESS_USER,keys:{owner:WITNESS_OWNERS}};

// TransactionsPool
const TransactionPool = require('../wallet/transaction-pool');
const transactionPool = new TransactionPool();

// create P2P Server
const P2pServer = require('./p2p-server.js');
const p2pserver = new P2pServer(blockchain,transactionPool,wallet);

// Transaction
const Transaction = require("../wallet/transaction")

//EXPOSED APIs

//api to get the blocks
app.get('/blocks',(req,res)=>{
    res.json(blockchain.chain);
});

// api to view transaction in the transaction pool
app.get('/transactions',(req,res)=>{
    res.json(transactionPool.transactions);
});

// Amount
app.get('/getBalance',(req,res)=>{
    const { user } = req.body;
    res.json(blockchain.getBalance(user));
});

// create transactions
app.post("/broadcast", (req, res) => {
    const { type, data, user, wif } = req.body;

    if(TRANSACTION_SYNTAX[type]){
        var uwallet = new Wallet(user, wif);
        if(blockchain.accounts.publicKey[user] == uwallet.getPublicKey()){
            var op = new Operation(uwallet,data,type)
            var result = op.createOP(transactionPool,blockchain);
            if(!result.error){
                p2pserver.broadcastTransaction(result.data);
                res.json({result:result.result,error:result.error});
            }else{
                res.json({result:result.result,error:result.error});
            }
        }else{
            res.json({result:null,error:"Wrong username or key. Orginal Publickey: "+blockchain.accounts.publicKey[user]+" got "+uwallet.getPublicKey()});
        }
    }
});

// create TMP Wallet
app.post("/tempwallet", (req, res) => {
    const { user, password } = req.body;
    var obj = {user:user};
    obj['publicKey'] = new Wallet(user, password).getPublicKey();
    res.json(obj);
});

// app server configurations
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})
p2pserver.listen();