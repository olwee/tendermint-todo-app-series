import { varint } from 'protocol-buffers-encodings';

import {
  Request,
  RequestEcho,
  RequestFlush,
} from '../../gen/types_pb';

const encodePadding = (abciReq) => {
  const msgBytes = Buffer.from(abciReq.serializeBinary());
  const msgLenBytes = Buffer.from(varint.encode(msgBytes.length << 1));
  return Buffer.concat([msgLenBytes, msgBytes]);
};

const decodePadding = (rawBytes) => {
  const maxLenBuf = Buffer.alloc(8);
  rawBytes.copy(maxLenBuf, 0, 0, 8);
  const msgLen = varint.decode(maxLenBuf, 0) >> 1;
  const msgLenRead = varint.decode.bytes;
  const readStop = msgLen + msgLenRead;
  return { msgLen, msgLenRead };
};

const wrapRequest = (msgType, abciMsg) => {
  const abciReq = new Request();
  if (msgType === 'echo') abciReq.setEcho(abciMsg);
  if (msgType === 'flush') abciReq.setFlush(abciMsg);
  return encodePadding(abciReq);
};


const ReqEcho = {};

ReqEcho.encode = (msgVal = {}, wrapReq = true) => {
  const echoReq = new RequestEcho();
  if (typeof msgVal.message !== 'undefined') echoReq.setMessage(msgVal.message);
  if (wrapReq === false) return echoReq;
  return wrapRequest('echo', echoReq);
};

ReqEcho.decode = (rawBytes) => {
  const abciReq = RequestEcho.deserializeBinary(rawBytes);
  return { msgType: 'echo', msgVal: abciReq.toObject() };
};

ReqEcho.decodeReq = (abciReq) => {
  const msgObj = abciReq.getEcho();
  return { msgType: 'echo', msgVal: msgObj.toObject() }; 
};

const ReqFlush = {};

ReqFlush.encode = (msgVal = {}, wrapReq = true) => {
  const flushReq = new RequestFlush();
  if (wrapReq === false) return flushReq;
  return wrapRequest('flush', flushReq);
};

const msgMap = {
  'echo': ReqEcho,
  'flush': ReqFlush,
};

const caseMap = {
  2: 'echo',
};

const encode = ({
  msgType,
  msgVal = {},
}, wrapReq = true) => {
  const method = msgMap[msgType];
  if (method !== 'undefined') {
    const abciMsg = msgMap[msgType].encode(msgVal, false);
    if (wrapReq == true) return wrapRequest(msgType, abciMsg);
    return Buffer.from(abciMsg.serializeBinary());
  }
  return null;
};

const decode = (rawBytes, hasPadding = true) => {
  let msgBytes = Buffer.concat([rawBytes]);
  if (hasPadding === true) {
    const { msgLen, msgLenRead } = decodePadding(rawBytes);
    if (rawBytes.length < (msgLen + msgLenRead)) throw Error(`Unable to decode incomplete msg`);
    msgBytes = rawBytes.slice(msgLenRead, (msgLenRead + msgLen));
  }
  const abciReq = Request.deserializeBinary(msgBytes);
  const msgEnum = caseMap[abciReq.getValueCase()];
  return msgMap[msgEnum].decodeReq(abciReq, false);
};

export {
  encode,
  decode,
};
