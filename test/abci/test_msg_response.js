import { assert } from 'chai';
import { encode, decode } from '../../abci/msg_response';

describe('# ABCI Response Messages', () => {
  describe('# echo Message', () => {
    it('should encode an echo message', () => {
      const encoded = encode({ msgType: 'echo', msgVal: { message: 'hi' } });
      assert.equal(encoded.toString('hex'), '0c12040a026869');
    });
    it('should decode an echo message');
  });
  describe('# flush Message', () => {
    it('should encode a flush message');
  });
});
