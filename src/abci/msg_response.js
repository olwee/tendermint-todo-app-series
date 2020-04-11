import { varint } from 'protocol-buffers-encodings';

import {
  Response,
  ResponseEcho,
  ResponseFlush,
  ResponseInfo,
  ResponseCommit,
  ResponseCheckTx,
  ResponseDeliverTx,
  ResponseBeginBlock,
  ResponseInitChain,
  ResponseEndBlock,
  ResponseQuery,
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
  if (msgType === 'checkTx') abciResp.setCheckTx(abciMsg);
  if (msgType === 'deliverTx') abciResp.setDeliverTx(abciMsg);
  if (msgType === 'beginBlock') abciResp.setBeginBlock(abciMsg);
  if (msgType === 'initChain') abciResp.setInitChain(abciMsg);
  if (msgType === 'endBlock') abciResp.setEndBlock(abciMsg);
  if (msgType === 'query') abciResp.setQuery(abciMsg);
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

const RespCheckTx = {};

RespCheckTx.encode = (msgVal = {}, wrapResp = true) => {
  const checkTxResp = new ResponseCheckTx();
  const {
    code,
    data,
    log,
    info,
    gasWanted,
    gasUsed,
    events,
    codespace,
  } = msgVal;
  if (typeof code !== 'undefined') checkTxResp.setCode(code);
  if (typeof data !== 'undefined') checkTxResp.setData(data);
  if (typeof log !== 'undefined') checkTxResp.setLog(log);
  if (typeof info !== 'undefined') checkTxResp.setInfo(info);
  if (typeof gasWanted !== 'undefined') checkTxResp.setGasWanted(gasWanted);
  if (typeof gasUsed !== 'undefined') checkTxResp.setGasWanted(gasUsed);
  if (typeof events !== 'undefined') checkTxResp.setEvents(events);
  if (typeof codespace !== 'undefined') checkTxResp.setCodespace(codespace);

  if (wrapResp === false) return checkTxResp;
  return wrapResponse('checkTx', checkTxResp);
};

const RespDeliverTx = {};

RespDeliverTx.encode = (msgVal = {}, wrapResp = true) => {
  const deliverTxResp = new ResponseDeliverTx();
  const {
    code,
    data,
    log,
    info,
    gasWanted,
    gasUsed,
    events,
    codespace,
  } = msgVal;
  if (typeof code !== 'undefined') deliverTxResp.setCode(code);
  if (typeof data !== 'undefined') deliverTxResp.setData(data);
  if (typeof log !== 'undefined') deliverTxResp.setLog(log);
  if (typeof info !== 'undefined') deliverTxResp.setInfo(info);
  if (typeof gasWanted !== 'undefined') deliverTxResp.setGasWanted(gasWanted);
  if (typeof gasUsed !== 'undefined') deliverTxResp.setGasWanted(gasUsed);
  if (typeof events !== 'undefined') deliverTxResp.setEvents(events);
  if (typeof codespace !== 'undefined') deliverTxResp.setCodespace(codespace);

  if (wrapResp === false) return deliverTxResp;
  return wrapResponse('deliverTx', deliverTxResp);
};

const RespBeginBlock = {};

RespBeginBlock.encode = (msgVal = {}, wrapResp = true) => {
  const beginBlockResp = new ResponseBeginBlock();
  const {
    events,
  } = msgVal;
  if (typeof events !== 'undefined') beginBlockResp.setEvents(events);

  if (wrapResp === false) return beginBlockResp;
  return wrapResponse('beginBlock', beginBlockResp);
};

const RespInitChain = {};

RespInitChain.encode = (msgVal = {}, wrapResp = true) => {
  const initChainResp = new ResponseInitChain();
  const {
    consensusParams,
    validators,
  } = msgVal;
  if (typeof consensusParams !== 'undefined') initChainResp.setConsensusParams(consensusParams);
  if (typeof validators !== 'undefined') initChainResp.setValidators(validators);

  if (wrapResp === false) return initChainResp;
  return wrapResponse('initChain', initChainResp);
};

const RespEndBlock = {};

RespEndBlock.encode = (msgVal = {}, wrapResp = true) => {
  const endBlockResp = new ResponseEndBlock();
  const {
    consensusParams,
    validators,
    events,
  } = msgVal;
  if (typeof consensusParams !== 'undefined') endBlockResp.setConsensusParams(consensusParams);
  if (typeof validators !== 'undefined') endBlockResp.setValidators(validators);
  if (typeof events !== 'undefined') endBlockResp.setEvents(events);

  if (wrapResp === false) return endBlockResp;
  return wrapResponse('initChain', endBlockResp);
};

const RespQuery = {};

RespQuery.encode = (msgVal = {}, wrapResp = true) => {
  const queryResp = new ResponseQuery();
  const {
    code,
    log,
    info,
    index,
    key,
    value,
    proof,
    height,
    codespace,
  } = msgVal;
  if (typeof code !== 'undefined') queryResp.setCode(code);
  if (typeof log !== 'undefined') queryResp.setLog(log);
  if (typeof info !== 'undefined') queryResp.setInfo(info);
  if (typeof index !== 'undefined') queryResp.setIndex(index);
  if (typeof key !== 'undefined') queryResp.setKey(key);
  if (typeof value !== 'undefined') queryResp.setValue(value);
  if (typeof proof !== 'undefined') queryResp.setProof(proof);
  if (typeof height !== 'undefined') queryResp.setHeight(height);
  if (typeof codespace !== 'undefined') queryResp.setCodespace(codespace);

  if (wrapResp === false) return queryResp;
  return wrapResponse('query', queryResp);
};

const msgMap = {
  echo: RespEcho,
  flush: RespFlush,
  info: RespInfo,
  commit: RespCommit,
  checkTx: RespCheckTx,
  deliverTx: RespDeliverTx,
  beginBlock: RespBeginBlock,
  initChain: RespInitChain,
  endBlock: RespEndBlock,
  query: RespQuery,
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
