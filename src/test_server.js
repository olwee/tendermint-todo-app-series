import net from 'net';
import pino from 'pino';
import BL from 'bl';
import { decode as reqDecode, decodePadding } from './abci/msg_request';
import { encode as respEncode } from './abci/msg_response';

const logger = pino().child({ module: 'test-server' });

const ABCIHandler = (handlers) => {
  const route = async (msgType, msgVal) => {
    if (typeof handlers[msgType] === 'undefined') return {};
    try {
      const result = await handlers[msgType](msgVal);
      return result;
    } catch (handlerErr) {
      // Depending on msgType, we will handle errors differently
      throw handlerErr;
    }
  };
  return {
    route,
  };
};

const ABCIConnection = (msgHandler) => (c) => {
  const recvBuf = new BL();
  let isWaiting = false;

  const writeData = (dataBuf) => {
    c.write(dataBuf, (err) => {
      if (err) c.emit('error', err);
    });
  };

  const processRecvData = async () => {
    const { msgLen, msgLenRead } = decodePadding(recvBuf);
    const totalLen = msgLen + msgLenRead;
    if (recvBuf.length < totalLen) return; // Buffering
    const msgBytes = recvBuf.slice(msgLenRead, totalLen);
    recvBuf.consume(totalLen);
    const {
      msgType,
      msgVal,
    } = reqDecode(msgBytes, false);

    logger.info({ msgType, msgVal });

    c.pause();
    isWaiting = true;

    if (msgType === 'echo') {
      // Echo back the message
      const respBuf = respEncode({ msgType: 'echo', msgVal: { message: msgVal.message } });
      writeData(respBuf);
      isWaiting = false;
      c.resume();
      return;
    }

    if (msgType === 'flush') {
      // Reply Flush
      const respBuf = respEncode({ msgType: 'flush', msgVal: {} });
      writeData(respBuf);
      isWaiting = false;
      c.resume();
      return;
    }
    try {
      const handlerResp = await msgHandler.route(msgType, msgVal);
      console.log('---handlerResp---');
      console.log(handlerResp);
      const respBuf = respEncode({ msgType, msgVal: handlerResp });
      console.log('---respBuf---');
      console.log(respBuf);
      writeData(respBuf);
      isWaiting = false;
      c.resume();

      if (recvBuf.length > 0) {
        processRecvData();
      }
    } catch (handlerErr) {
      c.emit('error', handlerErr);
    }
  };


  c.on('data', (rawData) => {
    recvBuf.append(rawData);
    if (isWaiting === true) return;
    processRecvData()
      .catch((procErr) => {
        if (procErr) c.emit('error', procErr);
      });
  });

  return {
    writeData,
  };
};

const app = ABCIHandler({
  // Can be {}
  info: async (req) => {
    return {
      data: 'NodeJS ABCI App',
      appVersion: '1',
      lastBlockHeight: 0,
      lastBlockAppHash: Buffer.from(''),
    };
  },
  commit: async (req) => {
    return {
      data: Buffer.from('1234', 'hex'),
    };
  },
});

const connector = ABCIConnection(app);

const server = net.createServer(connector);

const portNum = 26658;

server.listen(portNum, () => {
  logger.info(`Listening on port ${portNum}`);
});
