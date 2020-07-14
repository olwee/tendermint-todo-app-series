import crypto from 'crypto';
import pino from 'pino';
import fs from 'fs-extra';
import stringify from 'json-stable-stringify';
import abciUtils from 'abci-utils';

/* FileState

*/

/*
{
  "syncData": {
    "blockHeight": 0,
  },
  "appData": {},
}
*/

const State = () => {
  // Mempool always starts blank
  const mempool = [];

  // Ensure 'state.json' exists
  fs.ensureFileSync('state.json');
  // Load state from file
  let store = {
    syncData: { blockHeight: 0 },
    appData: {},
  };
  try {
    store = fs.readJsonSync('state.json');
  } catch (err) {
    if (!(err instanceof SyntaxError)) {
      throw err;
    }
  }

  const getAppHash = () => {
    const { syncData: { blockHeight }, appData } = store;
    if (blockHeight === 0) return '';
    const hash = crypto.createHash('sha256');
    hash.update(stringify(appData));
    return hash.digest('hex');
  };

  const commit = () => {
    fs.writeJsonSync('state.json', store, { spaces: 2 });
  };

  return {
    commit,
    getAppHash,
  };
};

const state = State();

const server = abciUtils.Server({

});

server.listen(26658);
