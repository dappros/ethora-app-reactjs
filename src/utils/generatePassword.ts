// Password generator for admin-provisioned accounts.
//
// Drawn from crypto.getRandomValues (not Math.random) and built to satisfy
// the usual "one of each class" policies: the result always contains a
// lowercase letter, an uppercase letter, a digit, and a symbol. Ambiguous
// glyphs (0/O, 1/l/I) are left out because these passwords get read off a
// screen or a spreadsheet and typed by hand.

const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*-_=+?';
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

const DEFAULT_LENGTH = 14;

function randomInt(maxExclusive: number): number {
  // Rejection sampling: discard values in the final partial bucket so every
  // index stays equally likely (a plain `% maxExclusive` would bias toward
  // the low indices).
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % maxExclusive;
}

function pick(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)];
}

export function generatePassword(length: number = DEFAULT_LENGTH): string {
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () =>
    pick(ALL)
  );
  const chars = [...required, ...rest];

  // Fisher-Yates, so the guaranteed classes aren't pinned to the first four
  // positions.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
