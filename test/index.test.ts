import { SenMLRecord, Pack, Validate } from '../src/index'
import { describe, it } from 'mocha'

import { expect } from 'chai'

describe('Validate SenML record', () => {
  it('should be able to validate senML record', () => {
    const record: SenMLRecord[] = [{
      BaseTime: 100,
      BaseUnit: 'base-unit',
      BaseVersion: 11,
      BaseSum: 100,
      BaseValue: 34,
      Name: 'name',
      Unit: 'unit',
      Time: 150,
      UpdateTime: 300,
      Value: 43.0,
      Sum: 20.0
    }]

    const packRecord: Pack = {
      Records: record
    }

    expect(Validate(packRecord)).to.equal(null)
  })
})
