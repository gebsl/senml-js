import { Pack, Decode, Encode, Validate, Normalize, Format, ErrEmptyName, ErrBadChar, ErrNoValues, ErrTooManyValues, ErrVersionChange } from '../src/index'
import { fromHex } from '../src/utils'
import { describe, it } from 'mocha'

import { expect } from 'chai'


const value = 42.0
const sum = 10.0
const boolV = true
const jsonEncoded = "5b7b22626e223a22626173652d6e616d65222c226274223a3130302c226275223a22626173652d756e6974222c2262766572223a31312c226276223a33342c226273223a3130302c226e223a226e616d65222c2275223a22756e6974222c2274223a3135302c227574223a3330302c2276223a34322c2273223a31307d2c7b22626e223a22626173652d6e616d65222c226274223a3130302c226275223a22626173652d756e6974222c2262766572223a31312c226273223a3130302c226e223a226e616d652d31222c2275223a22756e6974222c2274223a3135302c227574223a3330302c227662223a747275652c2273223a31307d5d"

function pack(): Pack {
  return {
    Records: [
      {
        bn: "base-name",
        bt: 100,
        bu: "base-unit",
        bver: 11,
        bv: 34,
        bs: 100,
        n: "name",
        u: "unit",
        t: 150,
        ut: 300,
        v: value,
        s: sum,
      },
      {
        bn: "base-name",
        bt: 100,
        bu: "base-unit",
        bver: 11,
        bs: 100,
        n: "name-1",
        u: "unit",
        t: 150,
        ut: 300,
        vb: boolV,
        s: sum,
      },
    ]
  }
}

describe('Decode SenML record', () => {
  const jsnVal = fromHex(jsonEncoded)

  it('should be able to decode JSON successfully', () => {
    expect(Decode(jsnVal, Format.JSON)).to.eql(pack())
  })
})

describe('Encode SenML record', () => {
  const jsnVal = fromHex(jsonEncoded)

  it('should be able to encode JSON successfully', () => {
    expect(Encode(pack(), Format.JSON)).to.equal(jsnVal)
  })
})

describe('Validate SenML record', () => {

  const emptyName = pack()

  emptyName.Records[0].bn = ""
  emptyName.Records[0].n = ""

  const invalidName = pack()
  invalidName.Records[0].bn = `\\o/`

  const invalidNameStart = pack()
  invalidNameStart.Records[0].bn = `/`

  const multiValue = pack()
  multiValue.Records[0].vb = boolV

  const noValue = pack()
  noValue.Records[0].v = undefined
  noValue.Records[0].bs = 0
  noValue.Records[0].s = undefined

  const validVersion = pack()
  validVersion.Records[1].bver = 0

  const multiVersion = pack()
  multiVersion.Records[1].bver = 3

  it('should be able to validate record', () => {
    expect(Validate(pack())).to.equal(null)
  })

  it('should be able to validate empty record', () => {
    expect(Validate(emptyName)).to.equal(ErrEmptyName)
  })

  it('should be able to validate invalid name', () => {
    expect(Validate(invalidName)).to.equal(ErrBadChar)
  })

  it('should be able to validate invalid first char in name', () => {
    expect(Validate(invalidNameStart)).to.equal(ErrBadChar)
  })

  it('should be able to validate multiple values fields', () => {
    expect(Validate(multiValue)).to.equal(ErrTooManyValues)
  })

  it('should be able to validate no values', () => {
    expect(Validate(noValue)).to.equal(ErrNoValues)
  })

  it('should be able to validate version', () => {
    expect(Validate(validVersion)).to.equal(null)
  })

  it('should be able to validate multiple versions', () => {
    expect(Validate(multiVersion)).to.equal(ErrVersionChange)
  })
})

describe('Normalize SenML record', () => {

  const p = pack()
  if (p.Records[1].t) p.Records[1].t -= 10
  if (p.Records[0].u) p.Records[0].u = ""

  const norm = pack()

  const r0 = norm.Records[0]
  const r1 = norm.Records[1]

  r0.n = (r0.bn || '') + (r0.n || '')
  r0.bn = ''
  r0.t = (r0.bt || 0) + (r0.t || 0)
  r0.bt = 0
  r0.v = (r0.v || 0) + (r0.bv || 0)
  r0.bv = 0
  r0.u = r0.bu
  r0.bu = ''
  r0.s = (r0.bs || 0) + (r0.s || 0)
  r0.bs = 0

  r1.n = (r1.bn || '') + (r1.n || '')
  r1.bn = ''
  r1.t = (r1.bt || 0) + (r1.t || 0) - 10
  r1.bt = 0
  r1.bv = 0
  r1.bu = ''
  r1.s = (r1.bs || 0) + (r1.s || 0)
  r1.bs = 0

  norm.Records = [{
    ...r0,
  }, {
    ...r1,
  }]

  const emptyName = pack()
  emptyName.Records[0].bn = ""
  emptyName.Records[0].n = ""

  it('should be able to normalize senML record', () => {
    expect(Normalize(p)).to.eql(norm)
  })

  it('should be able to normalize senML record with error', () => {
    expect(Normalize(emptyName)).to.equal(ErrEmptyName)
  })
})