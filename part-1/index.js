const crypto = require('crypto');
const fs = require('fs-extra');
const pino = require('pino');
const abciServer = require('abci');
const stringify = require('json-stable-stringify');

const logger = pino();

const State = () => {
  // Read from file
  const cache = fs.readJsonSync('state.json');

  const getAppHash = () => {
    if (cache.chainData.lastBlockHeight === 0) return '';
    const hash = crypto.createHash('sha256');
    hash.update(stringify(cache));
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
  };
};

const state = State();

const server = abciServer({
  info: (request) => {
    return {
      data: 'Node.Js Todo-App',
      version: '0.0.0',
      appVersion: '0.0.0',
      lastBlockHeight: state.cache.chainData.lastBlockHeight,
      lastBlockAppHash: Buffer.from(state.getAppHash(), 'hex'),
    };
  }, 
  beginBlock: (request) => {
    const { header: { height: rawHeight, appHash } } = request;
    const nextHeight = Number(rawHeight.toString());
    console.log(`Height: ${nextHeight} Block AppHash: ${appHash.toString('hex')}`);
    state.updateChainData('lastBlockHeight', nextHeight);
    return {};
  },
  commit: (request) => {
    console.log('Commit called...');
    // Here we persist the state to disk
    const appHash = state.persist();
    logger.info(`Commited Height: ${state.cache.chainData.lastBlockHeight} AppHash: ${appHash}`); 
    return {
      data: Buffer.from(appHash, 'hex'),
    };
  },
});

server.listen(26658);
