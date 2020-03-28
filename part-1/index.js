const abciServer = require('abci');
const pino = require('pino');

const logger = pino();

const server = abciServer({
  info: (request) => {
    return {
      data: 'Node.Js Todo-App',
      version: '0.0.0',
      appVersion: '0.0.0',
      lastBlockHeight: 0,
      lastBlockAppHash: Buffer.from(''),
    };
  }, 
  endBlock: (request) => {
    const { height: rawHeight } = request;
    const newHeight = Number(rawHeight.toString());
    logger.info(`Synced height: ${newHeight}`); 
    return {};
  },
});

server.listen(26658);
