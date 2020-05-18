import { SenMLRecord, Pack, Validate } from './index';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
describe('Validate SenML record', () => {

  it('should be able to validate senML record' , () => {
    let record: SenMLRecord[] = [{
        Name: "Bananas",
        Value: 5
    }]

    let packRecord: Pack = {
        Records: record,
    }

    expect(Validate(packRecord)).to.equal(null);
  });

});