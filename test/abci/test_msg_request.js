import { assert } from 'chai';
import { encode, decode } from '../abci/msg_request';

describe('# ABCI Request Messages', () => {
  describe('# Echo Message', () => {
    it('should encode an echo message', () => {
      const encoded = encode({ msgType: 'echo', msgVal: { message: 'hi', } });
      assert.equal(encoded, Buffer.from(''));
    });
  });
});
