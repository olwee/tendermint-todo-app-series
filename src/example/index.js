const crypto = require('crypto');
const fs = require('fs-extra');
const pino = require('pino');
const abciServer = require('../server').default;
const stringify = require('json-stable-stringify');
const TodoApp = require('./todo');

const logger = pino();

const State = () => {
  // Mempool always starts blank
  const mempool = [];
  // Read from file
  const cache = fs.readJsonSync('state.json');

  if (typeof cache.appData.todoList === 'undefined') cache.appData.todoList = [];

  const getAppHash = () => {
    if (cache.chainData.lastBlockHeight === 0) return '';
    const hash = crypto.createHash('sha256');
    hash.update(stringify(cache.appData));
    return hash.digest('hex');
  };

  const updateChainData = (k, v) => {
    cache.chainData[k] = v;
  };

  const persist = () => {
    fs.writeJsonSync('state.json', cache, { spaces: 2 });
    return getAppHash();
  };

  return {
    updateChainData,
    getAppHash,
    persist,
    cache,
    mempool,
  };
};

const state = State();

const todoApp = TodoApp(state);

const server = abciServer({
  info: async () => ({
    data: 'Node.Js Todo-App',
    version: '0.0.0',
    appVersion: 0,
    lastBlockHeight: state.cache.chainData.lastBlockHeight,
    lastBlockAppHash: Buffer.from(state.getAppHash(), 'hex'),
  }),
  beginBlock: async (request) => {
    const { header: { height: rawHeight } } = request;
    const nextHeight = Number(rawHeight.toString());
    state.updateChainData('lastBlockHeight', nextHeight);
    return {};
  },
  checkTx: (request) => {
    const { tx: txBytesRaw } = request; // Base64
    const txBytes = Buffer.from(txBytesRaw, 'base64');
    try {
      return todoApp.checkTx(txBytes);
    } catch (err) {
      console.log(err);
      return { code: 1, log: 'ABCI App Err' };
    }
  },
  deliverTx: (request) => {
    const { tx: txBytesRaw } = request; // Base64
    const txBytes = Buffer.from(txBytesRaw, 'base64');
    try {
      return todoApp.deliverTx(txBytes);
    } catch (err) {
      console.log(err);
      return { code: 1, log: 'ABCI App Err' };
    }
  },
  commit: () => {
    // Here we persist the state to disk
    const appHash = state.persist();
    logger.info(`Commited Height: ${state.cache.chainData.lastBlockHeight} AppHash: ${appHash}`);
    return {
      data: Buffer.from(appHash, 'hex'),
    };
  },
  query: (req) => todoApp.query(req),
});

server.listen(26658);
