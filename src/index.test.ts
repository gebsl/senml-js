import { SenMLRecord, Pack, Validate } from './index';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
describe('Validate SenML record', () => {

  it('should be able to validate senML record', () => {
    let record: SenMLRecord[] = [{
      BaseTime: 100,
      BaseUnit: "base-unit",
      BaseVersion: 11,
      BaseSum: 100,
      BaseValue: 34,
      Name: "name",
      Unit: "unit",
      Time: 150,
      UpdateTime: 300,
      Value: 43.0,
      Sum: 20.0,
    }]

    let packRecord: Pack = {
      Records: record,
    }

    expect(Validate(packRecord)).to.equal(null);
  });

});