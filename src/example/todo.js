const crypto = require('crypto');
const msgpack = require('msgpack');
const axios = require('axios');

const hashTx = (txBytes) => crypto.createHash('sha256').update(txBytes).digest('hex');

const encodeTx = (tx) => msgpack.pack(tx);

const decodeTx = (txBytes) => {
  try {
    const txObj = msgpack.unpack(Buffer.from(txBytes.toString('hex'), 'hex'));
    return txObj;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const isDef = (x) => typeof x !== 'undefined';

const addTodoTx = (name) => ({
  type: 'todo/StdTx',
  value: {
    msg: {
      type: 'todo/add',
      value: name,
    },
  },
});

const add = (state) => ({
  create: (name) => encodeTx(addTodoTx(name)),
  check: (msgVal) => typeof msgVal === 'string',
  deliver: (msgVal) => {
    // Mutate the state
    state.cache.todoList.push(msgVal);
    return true;
  },
});


const unpackTx = (txSwitch) => (txOp) => (txObj) => {
  const { type: txType, value: txVal } = txObj;
  if (!isDef(txType) || !isDef(txType)) return { code: 1, log: 'Fail to unpack tx contents' };
  if (txType === 'todo/StdTx') {
    const { msg } = txVal;
    if (!isDef(msg)) return { code: 1, log: 'todo/StdTx is missing parameter msg' };
    const { type: msgType, value: msgVal } = msg;
    const txRes = txSwitch[msgType][txOp](msgVal);
    if (txOp === 'check' && txRes === true) return { code: 0, log: '' };
    if (txOp === 'deliver' && txRes === true) return { code: 0, log: '' };
  }
  return { code: 1, log: `No Handler found for tx ${txType}` };
};

const txSwitch = {
  'todo/add': add,
};

const TodoApp = (state) => {
  const todoSwitch = Object.keys(txSwitch).reduce(
    (acc, txName) => ({ ...acc, [txName]: txSwitch[txName](state) }),
    {},
  );

  const checkTx = (txBytes) => {
    const txKey = hashTx(txBytes.toString('hex'));
    if (state.mempool.indexOf(txKey) === -1) {
      state.mempool.push(txKey);
      const txObj = decodeTx(txBytes);
      if (txObj === null) return { code: 1, log: 'Fail to unpack tx with msgpack' };
      return unpackTx(todoSwitch)('check')(txObj);
    }
    return { code: 1, log: 'Tx exists in Mempool' };
  };

  const deliverTx = (txBytes) => {
    const txKey = hashTx(txBytes);
    const memIdx = state.mempool.indexOf(txKey);
    state.mempool.splice(memIdx, 1);
    // Remove from mempool
    const txObj = decodeTx(txBytes);
    if (txObj === null) return { code: 1, log: 'Fail to unpack tx with msgpack' };
    return unpackTx(todoSwitch)('deliver')(txObj);
  };

  const broadcastTx = async (msgType, msgVal) => {
    const stdTx = todoSwitch[msgType].create(msgVal);
    const txQuery = `0x${stdTx.toString('hex')}`;
    const queryURL = `http://127.0.0.1:26657/broadcast_tx_commit?tx=${txQuery}`;
    console.log(queryURL);
    const broadcastResp = await axios({
      headers: { accept: 'application.json' },
      method: 'get',
      url: queryURL,
    });
    console.log(JSON.stringify(broadcastResp.data, null, 2));
  };

  const query = (req) => {
    console.log(req);
    return {};
  };

  return {
    checkTx,
    deliverTx,
    query,
    broadcastTx,
  };
};

module.exports = TodoApp;
