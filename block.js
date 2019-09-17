const SHA256 = require('crypto-js/sha256');
const ChainUtil = require("./chain-util");
const Wallet = require('./wallet/wallet');

class Block {
    constructor(timestamp, lastHash, hash, data, validator, witness, signature) {
      this.timestamp = timestamp;
      this.lastHash = lastHash;
      this.hash = hash;
      this.data = data;
      this.validator = validator;
      this.witness = witness;
      this.signature = signature;
    }
  
    toString() {
      return `Block - 
          Timestamp : ${this.timestamp}
          Last Hash : ${this.lastHash}
          Hash      : ${this.hash}
          Data      : ${this.data}
          Validator : ${this.validator}
          Signature : ${this.signature}`;
    }
    
    static genesis() {
        return new this(0, SHA256("bigbang").toString(), SHA256("genesis").toString(), []);
    }

    static hash(timestamp,lastHash,data){
        return SHA256(`${timestamp}${lastHash}${data}`).toString();
    }

    static blockHash(block) {
        const { timestamp, lastHash, data } = block;
        return Block.hash(timestamp, lastHash, data);
    }

    static signBlockHash(hash, wallet) {
        return wallet.sign(hash);
    }

    static verifyBlock(block) {
        return ChainUtil.verifySignature(
          block.validator,
          block.signature,
          Block.hash(block.timestamp, block.lastHash, block.data)
        );
    }

    static createBlock(lastBlock, data, nwallet) {
        var wallet = new Wallet(nwallet.user,nwallet.keys.owner);
        let hash;
        let timestamp = Date.now();
        const lastHash = lastBlock.hash;
        hash = Block.hash(timestamp, lastHash, data);
        let validator = wallet.getPublicKey();
        let witness = wallet.username;
        let signature = Block.signBlockHash(hash, wallet);
        return new this(timestamp, lastHash, hash, data, validator, witness, signature);
    }
}

module.exports = Block;