import { assert } from 'chai';
import { encode, decode } from '../../abci/msg_request';

describe('# ABCI Request Messages', () => {
  describe('# echo Message', () => {
    it('should encode an echo message', () => {
      const encoded = encode({ msgType: 'echo', msgVal: { message: 'hi' } });
      assert.equal(encoded.toString('hex'), '0c12040a026869');
    });
    it('should encode an echo message w/o wrapReq', () => {
      const encoded = encode({ msgType: 'echo', msgVal: { message: 'hi' } }, false);
      assert.equal(encoded.toString('hex'), '0a026869');
    });
    it('should decode an echo message', () => {
      const decoded = decode(Buffer.from('0c12040a026869', 'hex'));
      assert.deepEqual(decoded, {
        msgType: 'echo',
        msgVal: { message: 'hi' },
      });
    });
    it('should decode an echo message w/o padding', () => {
      const decoded = decode(Buffer.from('12040a026869', 'hex'), false);
      assert.deepEqual(decoded, {
        msgType: 'echo',
        msgVal: { message: 'hi' },
      });
    });
  });
  describe('# flush Message', () => {
    it('should encode a flush message', () => {
      const encoded = encode({ msgType: 'flush', msgVal: {} });
      assert.equal(encoded.toString('hex'), '041a00');
    });
  });
});
