const WebSocket = require('ws');
const { VERSION } = require('../config');
 
//declare the peer to peer server port 
const P2P_PORT = process.env.P2P_PORT || 5001;

//list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const MESSAGE_TYPE = {
    chain: "CHAIN",
    block: "BLOCK",
    transaction: "TRANSACTION"
};

class P2pserver{
    constructor(blockchain,transactionpool,wallet){
        this.blockchain = blockchain;
        this.transactionPool = transactionpool;
        this.wallet = wallet;
        this.sockets = [];
    }

    listen() {
        const server = new WebSocket.Server({ port: P2P_PORT });
        server.on("connection", socket => {
          socket.isAlive = true;
          this.connectSocket(socket);
        });
        this.connectToPeers();
        console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
    }

    // after making connection to a socket
    connectSocket(socket,peer){
        this.sockets.push(socket);
        console.log("Socket connected");

        this.messageHandler(socket);
        this.closeConnectionHandler(socket,peer);
        this.sendChain(socket);
    }

    connectToPeers(){
        peers.forEach(peer => {
            const socket = new WebSocket(peer);
            socket.on('open',() => this.connectSocket(socket,peer));
            socket.onerror = (error) => {

            }
        });
    }

    messageHandler(socket){
        socket.on('message',message =>{
            const data = JSON.parse(message);
            console.log("data ", data);

            if(data.version == VERSION){
                switch (data.type) {
                    //Type is Chain
                    case MESSAGE_TYPE.chain:
                        this.blockchain.replaceChain(data.chain);
                        break;

                    //Type is Transaction
                    case MESSAGE_TYPE.transaction:
                        if (!this.transactionPool.transactionExists(data.transaction)) {
                            let thresholdReached = this.transactionPool.addTransaction(
                                data.transaction
                            );
                            this.broadcastTransaction(data.transaction);
                            console.log("Check if Transaction pool is valid")
                            if(this.transactionPool.validTransactions(this.transactionPool.transactions,this.blockchain)){
                                if (thresholdReached) {
                                    console.log("Creating block");
                                    let block = this.blockchain.createBlock(
                                        this.transactionPool.transactions,
                                        this.wallet
                                    );
                                    this.broadcastBlock(block);
                                }
                            }
                        }
                        break;

                    case MESSAGE_TYPE.block:
                        if (this.blockchain.isValidBlock(data.block)) {
                            console.log("Valid Block")
                            this.broadcastBlock(data.block);
                            this.transactionPool.clear();
                        }
                        break;
                }
            }else{
                console.log("Recived Data from Node Ver. "+data.version+", Client Node Ver. "+VERSION);
            }
        });
    }

    closeConnectionHandler(socket) {
        socket.on("close", () => (socket.isAlive = false));
    }

    //Transaction Magic
    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => {
          this.sendTransaction(socket, transaction);
        });
      }
    
    sendTransaction(socket, transaction) {
        socket.send(
          JSON.stringify({
            version: VERSION,
            type: MESSAGE_TYPE.transaction,
            transaction: transaction
          })
        );
    }

    //Block Magic
    broadcastBlock(block) {
        this.sockets.forEach(socket => {
          this.sendBlock(socket, block);
        });
    }
    
    sendBlock(socket, block) {
        socket.send(
          JSON.stringify({
            version: VERSION,
            type: MESSAGE_TYPE.block,
            block: block
          })
        );
    }

    //Chain Magic
    sendChain(socket) {
        socket.send(
          JSON.stringify({
            version: VERSION,
            type: MESSAGE_TYPE.chain,
            chain: this.blockchain.chain
          })
        );
      }

    syncChain(){
        this.sockets.forEach(socket =>{
            this.sendChain(socket);
        });
    }

}

module.exports = P2pserver;