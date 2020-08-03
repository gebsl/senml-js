const ErrVersionChange = { name: 'ErrVersionChange', message: 'version change' },
  ErrUnsuportedFormat = { name: 'ErrUnsupportedFormat', message: 'unsupported format' },
  ErrEmptyName = { name: 'ErrEmptyName', message: 'empty name' },
  ErrTooManyValues = { name: 'ErrTooManyValues', message: 'more than one value in the record' },
  ErrNoValues = { name: 'ErrNoValues', message: 'no value or sum field found' },
  ErrBadChar = { name: 'ErrBadChar', message: 'invalid char' };

const defaultVersion = 10;

// Record represents one senML record.
export interface SenMLRecord {
  XMLName?: boolean;
  Link?: string;
  BaseName?: string;
  BaseTime?: number;
  BaseUnit?: string;
  BaseVersion?: number;
  BaseValue?: number;
  BaseSum?: number;
  Name: string;
  Unit?: string;
  Time?: number;
  UpdateTime?: number;
  Value: number;
  StringValue?: string;
  DataValue?: string;
  BoolValue?: boolean;
  Sum?: number;
}

enum Format {
  JSON = 1,
  XML,
  CBOR,
}

// Pack consists of SenML records array.
export interface Pack {
  XMLName?: boolean;
  Xmlns?: string;
  Records: SenMLRecord[];
}

// Encode takes a SenML Pack and encodes it using the given format.
export function Decode(msg: string, format: Format): Pack | Error {
  let p: Pack;
  switch (format) {
    case Format.JSON:
      p = JSON.parse(msg);
    break;
    default:
      return ErrUnsuportedFormat;
  }

  let err = Validate(p);
  if (err !== null) return err;

  return p;
}

// Encode takes a SenML Pack and encodes it using the given format.
export function Encode(p: Pack, format: Format): string | Error {
  switch (format) {
    case Format.JSON:
      return JSON.stringify(p);
    default:
      return ErrUnsuportedFormat;
  }
}

// Normalize removes all the base values and expands records values with the base items.
// The base fields apply to the entries in the Record and also to all Records after
// it up to, but not including, the next Record that has that same base field.
export function Normalize(p: Pack): Pack | Error {
  let err = Validate(p);
  if (err !== null) {
    return err;
  }

  var bname: string | undefined = "";
  var btime: number | undefined = 0;
  var bsum: number | undefined = 0;
  var bunit: string | undefined = "";

  let records = new Array<SenMLRecord>();

  p.Records.forEach(function (r) {
    if (r.BaseTime != 0) btime = r.BaseTime;
    if (r.BaseSum != 0) bsum = r.BaseSum;
    if (r.BaseUnit != "") bunit = r.BaseUnit;
    if (r.BaseName && r.BaseName.length > 0) bname = r.BaseName;
    if (r.Time && btime) r.Time = r.Time + btime;

    r.Name = bname + r.Name;

    if (r.Sum && bsum) r.Sum = bsum + r.Sum;
    if (r.Unit == "" && bunit) r.Unit = bunit;
    if (r.Value && (r.BaseValue && r.BaseValue != 0)) r.Value = r.BaseValue + r.Value;

    // If the version is default, it must not be present in resolved records.
    // Validate method takes care that the version is the same on all the records.
    if (r.BaseVersion == defaultVersion) r.BaseVersion = 0;

    // Remove Base Values from the Record.
    r.BaseTime = 0
    r.BaseValue = 0
    r.BaseUnit = ""
    r.BaseName = ""
    r.BaseSum = 0

    // Add to the SenML array
    records.push(r);
  });

  p.Records = records;

  // TODO: Need to sort

  return p
}

// Validate validates SenML records.
export function Validate(p: Pack): Error | null {
  var bver: number | undefined = 0;
  var bname: string | undefined = "";
  var bsum: number | undefined = 0;

  p.Records.forEach(function (r) {
    // Check if version is the same for all the records.
    if (bver == 0 && r.BaseVersion != 0) {
      bver = r.BaseVersion;
    }
    if (bver != 0 && r.BaseVersion == 0) r.BaseVersion = bver;
    if (r.BaseVersion != bver) return ErrVersionChange;

    if (r.BaseName != '') bname = r.BaseName;
    if (r.BaseSum != 0) bsum = r.BaseSum;

    let name = bname + r.Name;
    if (name.length == 0) return ErrEmptyName;

    let valCnt: number = 0;
    if (r.Value != null) valCnt++;
    if (r.BoolValue != null) valCnt++;
    if (r.DataValue != null) valCnt++;
    if (r.StringValue != null) valCnt++;

    if (valCnt > 1) return ErrTooManyValues;
    if (r.Sum != null || bsum != 0) valCnt++;
    if (valCnt < 1) return ErrNoValues;

    let err = validateName(name);
    if (err != null) {
      return err;
    }
  });
  return null;
}

function validateName(name: string): Error | null {
  let l = name[0];
  if (l == '-' || l == ':' || l == '.' || l == '/' || l == '_') {
    return ErrBadChar;
  }

  for (const l of name) {
    if (
      (l < 'a' || l > 'z') &&
      (l < 'A' || l > 'Z') &&
      (l < '0' || l > '9') &&
      l != '-' &&
      l != ':' &&
      l != '.' &&
      l != '/' &&
      l != '_'
    ) {
      return ErrBadChar;
    }
  }
  return null;
}
