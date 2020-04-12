const crypto = require('crypto');
const msgpack = require('msgpack');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const hashTx = (txBytes) => crypto.createHash('sha256').update(txBytes).digest('hex');

// const encodeTx = (tx) => msgpack.pack(tx);
const encodeTx = (txName, txVal) => {
  const txBody = {
    type: 'todo/StdTx',
    value: {
      msg: {
        type: txName,
        value: txVal,
      },
    },
  };
  return msgpack.pack(txBody);
};

const decodeTx = (txBytes) => {
  try {
    const txObj = msgpack.unpack(Buffer.from(txBytes.toString('hex'), 'hex'));
    return txObj;
  } catch (err) {
    return null;
  }
};

const isDef = (x) => typeof x !== 'undefined';

const Todo = (appData) => {
  const add = ({
    create: (name) => encodeTx('add', name),
    check: (msgVal) => typeof msgVal === 'string',
    deliver: (msgVal) => {
      // Mutate the state
      const todoId = uuidv4();
      appData.todoList.push({ id: todoId, name: msgVal, complete: false });
      return true;
    },
  });
  const edit = () => {};

  const remove = () => {};

  const complete = ({
    create: (name) => encodeTx('complete', name),
    check: () => true,
    deliver: (msgVal) => {
      // Mutate the state
      const txIdx = appData.todoList.findIndex((todo) => todo.id === msgVal);
      if (txIdx === -1) return false;
      // eslint-disable-next-line
      appData.todoList[txIdx] = { ...appData.todoList[txIdx], complete: true };
      return true;
    },
  });

  return {
    add,
    edit,
    remove,
    complete,
  };
};


const unpackTx = (txObj) => {
  const { type: txType, value: txVal } = txObj;
  if (!isDef(txType) || !isDef(txType)) return { code: 1, log: 'Fail to unpack tx contents' };
  if (txType === 'todo/StdTx') {
    const { msg } = txVal;
    if (!isDef(msg)) return { code: 1, log: 'todo/StdTx is missing parameter msg' };
    const { type: msgType, value: msgVal } = msg;
    return { msgType, msgVal };
    /*
    const txRes = txSwitch[msgType][txOp](msgVal);
    if (txOp === 'check' && txRes === true) return { code: 0, log: '' };
    if (txOp === 'deliver' && txRes === true) return { code: 0, log: '' };
    */
  }
  return null;
  // return { code: 1, log: `No Handler found for tx ${txType}` };
};

const TodoApp = (state) => {
  const todo = Todo(state.cache.appData);

  const checkTx = (txBytes) => {
    const txKey = hashTx(txBytes.toString('hex'));
    if (state.mempool.indexOf(txKey) === -1) {
      state.mempool.push(txKey);
      const txObj = decodeTx(txBytes);
      if (txObj === null) return { code: 1, log: 'Fail to unpack tx with msgpack' };
      const { msgType, msgVal } = unpackTx(txObj);
      const txRes = todo[msgType].check(msgVal);
      if (txRes === true) return { code: 0, log: '' };
      return { code: 1, log: 'Tx Check Failed' };
    }
    return { code: 1, log: 'Tx Exists In Mempool' };
  };

  const deliverTx = (txBytes) => {
    const txKey = hashTx(txBytes);
    const memIdx = state.mempool.indexOf(txKey);
    state.mempool.splice(memIdx, 1);
    // Remove from mempool
    const txObj = decodeTx(txBytes);
    if (txObj === null) return { code: 1, log: 'Fail to unpack tx with msgpack' };
    const { msgType, msgVal } = unpackTx(txObj);
    const txRes = todo[msgType].deliver(msgVal);
    if (txRes === true) return { code: 0, log: '' };
    return { code: 1, log: 'Tx Deliver Failed' };
  };

  const broadcastTx = async (msgType, msgVal) => {
    const stdTx = todo[msgType].create(msgVal);
    const txQuery = `0x${stdTx.toString('hex')}`;
    const queryURL = `http://127.0.0.1:26657/broadcast_tx_commit?tx=${txQuery}`;
    const broadcastResp = await axios({
      headers: { accept: 'application/json' },
      method: 'get',
      url: queryURL,
    });
    console.log(JSON.stringify(broadcastResp.data, null, 2));
  };

  const queryCLI = async ({
    path,
    height,
    data,
  }) => {
    const queryURL = 'http://127.0.0.1:26657/abci_query';
    const queryResp = await axios({
      headers: { accept: 'application/json' },
      method: 'get',
      params: {
        path: `"${path}"`,
        height,
        data,
      },
      url: queryURL,
    });
    console.log(JSON.stringify(queryResp.data, null, 2));
  };

  const query = ({
    data,
    path,
    height,
    prove,
  }) => {
    console.log(req);
    if (path === '/todo') {

    }
    return {};
  };

  return {
    checkTx,
    deliverTx,
    query,
    broadcastTx,
    queryCLI,
  };
};

module.exports = TodoApp;
