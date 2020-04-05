import { varint } from 'protocol-buffers-encodings';

import {
  Response,
  ResponseEcho,
  ResponseFlush,
} from '../../gen/types_pb';

const encodePadding = (abciResp) => {
  const msgBytes = Buffer.from(abciResp.serializeBinary());
  const msgLenBytes = Buffer.from(varint.encode(msgBytes.length << 1));
  return Buffer.concat([msgLenBytes, msgBytes]);
};

const decodePadding = (rawBytes) => {
  const maxLenBuf = Buffer.alloc(8);
  rawBytes.copy(maxLenBuf, 0, 0, 8);
  const msgLen = varint.decode(maxLenBuf, 0) >> 1;
  const msgLenRead = varint.decode.bytes;
  return { msgLen, msgLenRead };
};

const wrapResponse = (msgType, abciMsg) => {
  const abciResp = new Response();
  if (msgType === 'echo') abciResp.setEcho(abciMsg);
  if (msgType === 'flush') abciResp.setFlush(abciMsg);
  return encodePadding(abciResp);
};

const RespEcho = {};

RespEcho.encode = (msgVal = {}, wrapResp = true) => {
  const echoResp = new ResponseEcho();
  if (typeof msgVal.message !== 'undefined') echoResp.setMessage(msgVal.message);
  if (wrapResp === false) return echoResp;
  return wrapResponse('echo', echoResp);
};

RespEcho.decode = (rawBytes) => {
  const abciResp = ResponseEcho.deserializeBinary(rawBytes);
  return { msgType: 'echo', msgVal: abciResp.toObject() };
};

RespEcho.decodeResp = (abciResp) => {
  const msgObj = abciResp.getEcho();
  return { msgType: 'echo', msgVal: msgObj.toObject() };
};

const RespFlush = {};

RespFlush.encode = (msgVal = {}, wrapResp = true) => {
  const flushResp = new ResponseFlush();
  if (wrapResp === false) return flushResp;
  return wrapResponse('flush', flushResp);
};

const msgMap = {
  echo: RespEcho,
  flush: RespFlush,
};

const caseMap = {
  2: 'echo',
};

const encode = ({
  msgType,
  msgVal = {},
}, wrapResp = true) => {
  const method = msgMap[msgType];
  if (method !== 'undefined') {
    const abciMsg = msgMap[msgType].encode(msgVal, false);
    if (wrapResp === true) return wrapResponse(msgType, abciMsg);
    return Buffer.from(abciMsg.serializeBinary());
  }
  return null;
};

const decode = (rawBytes, hasPadding = true) => {
  let msgBytes = Buffer.concat([rawBytes]);
  if (hasPadding === true) {
    const { msgLen, msgLenRead } = decodePadding(rawBytes);
    if (rawBytes.length < (msgLen + msgLenRead)) throw Error('Unable to decode incomplete msg');
    msgBytes = rawBytes.slice(msgLenRead, (msgLenRead + msgLen));
  }
  const abciResp = Response.deserializeBinary(msgBytes);
  const msgEnum = caseMap[abciResp.getValueCase()];
  return msgMap[msgEnum].decodeResp(abciResp, false);
};

export {
  encode,
  decode,
  decodePadding,
};
