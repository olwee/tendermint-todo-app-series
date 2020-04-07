import { varint } from 'protocol-buffers-encodings';

import {
  Response,
  ResponseEcho,
  ResponseFlush,
  ResponseInfo,
  ResponseCommit,
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
  if (msgType === 'info') abciResp.setInfo(abciMsg);
  if (msgType === 'commit') abciResp.setCommit(abciMsg);
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

const RespInfo = {};

RespInfo.encode = (msgVal = {}, wrapResp = true) => {
  const infoResp = new ResponseInfo();
  const {
    data,
    version,
    appVersion,
    lastBlockHeight,
    lastBlockAppHash,
  } = msgVal;
  if (typeof data !== 'undefined') infoResp.setData(data);
  if (typeof version !== 'undefined') infoResp.setVersion(version);
  if (typeof appVersion !== 'undefined') infoResp.setAppVersion(appVersion);
  if (typeof lastBlockHeight !== 'undefined') infoResp.setLastBlockHeight(lastBlockHeight);
  if (typeof lastBlockAppHash !== 'undefined') infoResp.setLastBlockAppHash(lastBlockAppHash);

  if (wrapResp === false) return infoResp;
  return wrapResponse('info', infoResp);
};

const RespCommit = {};

RespCommit.encode = (msgVal = {}, wrapResp = true) => {
  const commitResp = new ResponseCommit();
  const {
    data,
  } = msgVal;
  if (typeof data !== 'undefined') commitResp.setData(data);

  if (wrapResp === false) return commitResp;
  return wrapResponse('commit', commitResp);
};

const msgMap = {
  echo: RespEcho,
  flush: RespFlush,
  info: RespInfo,
  commit: RespCommit,
};

const caseMap = {
  2: 'echo',
  3: 'flush',
  4: 'info',
  5: 'setOption',
  6: 'initChain',
  7: 'query',
  8: 'beginBlock',
  9: 'checkTx',
  19: 'deliverTx',
  11: 'endBlock',
  12: 'commit',
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
