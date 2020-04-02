const crypto = require('crypto');
const msgpack = require('msgpack');


const encodeTx = (tx) => msgpack.pack(tx);

const decodeTx = (txBytes) => {
  try {
    const txObj = msgpack.unpack(txBytes);
    return txObj;
  } catch (err) {
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
  check: (msgVal) => {

  },
  deliver: (msgVal) => {

  },
});


const unpackTx = (txSwitch) => (txOp) => (txObj) => {
  const { type: txType, value: txVal } = txObj;
  if (!isDef(txType) || !isDef(txType)) return { code: 1, log: 'Fail to unpack tx contents' };
  if (txType === 'todo/StdTx') {
    const { msg } = value;
    if (!isDef(msg)) return { code: 1, log: 'todo/StdTx is missing parameter msg' };
    const { type: msgType, value: msgVal } = msg;
    return txSwitch[msgType][txOp](msgVal);
  }
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
    const txObj = decodeTx(txBytes);
    if (txObj === null) return { code: 1, log: 'Fail to unpack tx with msgpack' };
    return unpackTx(todoSwitch)('check')(txObj);
  };
};
