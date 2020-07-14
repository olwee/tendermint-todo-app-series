import abciUtils from 'abci-utils';
import pino from 'pino';
import fs from 'fs-extra';

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
  const store = fs.readJsonSync('state.json');

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
