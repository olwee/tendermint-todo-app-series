import * as net from 'net';
import { varint } from 'protocol-buffers-encodings';
import * as pino from 'pino';
import { Request, Response, ResponseEcho, ResponseFlush } from '../gen/types_pb.js';
import { EventEmitter } from 'events';

const logger = pino().child({ module: 'root-server' });

const getRespFlush = () => {
  const respFlush = new Response();
  respFlush.setFlush(new ResponseFlush());
  const respBytes: Buffer = Buffer.from(respFlush.serializeBinary());
  const msgLen: Buffer = Buffer.from(varint.encode(respBytes.length << 1));
  return Buffer.concat([msgLen, respBytes]);
}

const ABCIConnection = (c: net.Socket) => {
  let recvBuf: Buffer = Buffer.alloc(0);
  let isBlocked:boolean = false;

  const server: any = new EventEmitter();

  const readPrefixLen = () =>  {
    const maxLenBuf: Buffer = Buffer.alloc(8);
    recvBuf.copy(maxLenBuf, 0, 0, 8);
    const length: number = varint.decode(maxLenBuf, 0) >> 1;
    const lenLength: number = varint.decode.bytes;
    return { prefixLen: lenLength, msgLen: length };
  };

  const readNextMsg = (prefixLen: number, msgLen: number) => {
    const msgBuf: Buffer = Buffer.alloc(msgLen);
    recvBuf.copy(msgBuf, 0, prefixLen, msgLen + prefixLen);
    const msgRaw = Request.deserializeBinary(msgBuf).toObject();
    const msgType:string = Object.keys(msgRaw).find((msgName) => typeof msgRaw[msgName] !== 'undefined');
    const msgVal: any = msgRaw[msgType];
    if (msgType === 'echo') {
      // Echo back the message
      const { message: recvMsg } = msgVal;
      const respEcho: any = new ResponseEcho();
      respEcho.setMessage(recvMsg);

      const respABCI = new Response();
      respABCI.setEcho(respEcho);
      const abciRespBytes: Buffer = Buffer.from(respABCI.serializeBinary());

      const msgLen: Buffer = Buffer.from(varint.encode(abciRespBytes.length << 1));
      const abciRespMsg = Buffer.concat([msgLen, abciRespBytes]);

      const abciFlush = getRespFlush();
      c.write(abciRespMsg);
      // We should call this after reading the RequestFlush sent by the client
      c.write(abciFlush);

    }
  };
 
  const processRecvData = () => {
    const { prefixLen, msgLen } = readPrefixLen();
    const totalLen: number = prefixLen + msgLen;
    if (totalLen > recvBuf.length) return;
    readNextMsg(prefixLen, msgLen);
  };

  c.on('data', (rawData: Buffer) => {
    recvBuf = Buffer.concat([recvBuf, rawData]);
    if (isBlocked === true) return; // Busy reading another msg, queue incoming data
    processRecvData();
  });

  return server;
};


const server: net.Server = net.createServer(ABCIConnection);

const portNum: number = 26658;

server.listen(portNum, () => {
  logger.info(`Listening on ${portNum}`);
});
