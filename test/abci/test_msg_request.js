import { assert } from 'chai';
import { encode, decode } from '../abci/msg_request';

describe('# ABCI Request Messages', () => {
  describe('# Echo Message', () => {
    it('should encode an echo message', () => {
      const encoded = encode({ msgType: 'echo', msgVal: { message: 'hi', } });
      assert.equal(encoded, Buffer.from('0c12040a026869', 'hex'));
    });
    it('should encode a flush message', () => {
      const encoded = encode({ msgType: 'flush', msgVal: {} });
      assert.equal(encoded, Buffer.from('041a00', 'hex'));
    });
  });
});
