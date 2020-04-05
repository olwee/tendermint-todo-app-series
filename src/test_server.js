import net from 'net';
import pino from 'pino';
import BL from 'bl';
import { decode as reqDecode, decodePadding } from './abci/msg_request';
import { encode as respEncode } from './abci/msg_response';

const logger = pino().child({ module: 'test-server' });

const server = net.createServer((c) => {
  const recvBuf = new BL();
  let isWaiting = false;

  const writeData = (dataBuf) => {
    c.write(dataBuf, (err) => {
      if (err) c.emit('error', err);
      isWaiting = false;
      c.resume();
      if (recvBuf.length > 0) {
        processRecvData();
      }
    });
  };

  const processRecvData = () => {
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
      return;
    }

    if (msgType === 'flush') {
      // Reply Flush
      const respBuf = respEncode({ msgType: 'flush', msgVal: {} });
      writeData(respBuf);
      return;
    }
  };


  c.on('data', (rawData) => {
    recvBuf.append(rawData);
    if (isWaiting === true) return;
    processRecvData();
  });
});

const portNum = 26658;

server.listen(portNum, () => {
  logger.info(`Listening on port ${portNum}`);
});
