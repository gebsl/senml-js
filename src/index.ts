const ErrVersionChange = { name: 'ErrVersionChange', message: 'version change' },
  ErrEmptyName = { name: 'ErrEmptyName', message: 'empty name' },
  ErrTooManyValues = { name: 'ErrTooManyValues', message: 'more than one value in the record' },
  ErrNoValues = { name: 'ErrNoValues', message: 'no value or sum field found' },
  ErrBadChar = { name: 'ErrBadChar', message: 'invalid char' };

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

// Pack consists of SenML records array.
export interface Pack {
  XMLName?: boolean;
  Xmlns?: string;
  Records: SenMLRecord[];
}

// Validate validates SenML records.
export function Validate(p: Pack): Error | null {
  var bver: number | undefined;
  var bname: string | undefined;
  var bsum: number | undefined;

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
