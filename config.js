const VERSION = 0.1;

const TRANSACTION_THRESHOLD = 5;

const FIRST_LEADER = "";

const TRANSACTION_FEE = 0;

const TRANSACTION_SYNTAX = {
  createAccount:{type:'createAccount',structure:['user','wif']},
  transfer:{type:'transfer'}
};

//WITNESS SETTINGS
const WITNESS_USER = "";
const WITNESS_OWNERS = "";

module.exports = {
  TRANSACTION_THRESHOLD,
  FIRST_LEADER,
  TRANSACTION_FEE,
  TRANSACTION_SYNTAX,
  WITNESS_OWNERS,
  WITNESS_USER
};