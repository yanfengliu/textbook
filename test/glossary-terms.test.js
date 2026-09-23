// checkGlossaryTerms (tools/check-content.js) must fail a glossary term that carries markup, name the
// entry and the line it is on, and say what would pass; and it must pass a term that is plain text, so a
// green run is a verdict and not a rule that never fired.
//
// Why it exists: a term is set as text wherever the book shows it (src/components/term.js escapes it),
// so on 2026-09-23 chapter 5's glossary printed "Maximum rate (V<sub>max</sub>)" with the tags on the
// page, and two more headings like it. The fixtures below are those headings as they shipped.
//
// Bound: fixtures, not the real glossaries; `npm run check` reads the real ones. A term that is plain
// text and still renders badly (a precomposed "⁺" drawn smaller and lighter than the bold letters beside
// it) passes here by design, and the last test pins that, so the bound is demonstrated and not asserted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkGlossaryTerms } from '../tools/check-content.js';

const SOURCE = [
  'export const GLOSSARY = {',
  "  'maximum-rate': { term: 'Maximum rate (V<sub>max</sub>)', def: 'The ceiling.' },",
  "  nad: { term: 'NAD<sup>+</sup>', def: 'A carrier.' },",
  "  'alpha-helix': { term: 'α-&#8288;helix', def: 'A coil.' },",
  '};',
].join('\n');

test('a term with a tag in it fails, naming the entry, its line, the tags and what would pass', () => {
  const fails = checkGlossaryTerms({ 'maximum-rate': { term: 'Maximum rate (V<sub>max</sub>)', def: 'The ceiling.' } }, { file: 'ch/glossary.js', source: SOURCE });
  assert.equal(fails.length, 1, fails.join('\n'));
  assert.match(fails[0], /^ch\/glossary\.js:2: glossary entry "maximum-rate" has markup in its term, "<sub>", "<\/sub>"/);
  assert.match(fails[0], /put the full name in the term and the symbol, with its markup, in the definition/);
  // The term is "Name (symbol)", so the fix it is given is its own, not the worked example.
  assert.match(fails[0], /term "Maximum rate", and a definition that says it is written V<sub>max<\/sub>/);
});

test('an unquoted key is found on its own line, and each failing entry is reported once', () => {
  const glossary = {
    'maximum-rate': { term: 'Maximum rate (V<sub>max</sub>)', def: 'The ceiling.' },
    nad: { term: 'NAD<sup>+</sup>', def: 'A carrier.' },
  };
  const fails = checkGlossaryTerms(glossary, { file: 'ch/glossary.js', source: SOURCE });
  assert.equal(fails.length, 2, fails.join('\n'));
  assert.match(fails[1], /^ch\/glossary\.js:3: glossary entry "nad" has markup in its term, "<sup>", "<\/sup>"/);
  // "NAD<sup>+</sup>" has no "Name (symbol)" shape to take a fix from, so it gets the worked example.
  assert.match(fails[1], /\(term "Maximum rate", and a definition that says it is written V<sub>max<\/sub>\)/);
});

test('a "Name (symbol)" term is told its own fix', () => {
  const fails = checkGlossaryTerms({ 'solute-potential': { term: 'Solute potential (Ψ<sub>s</sub>)', def: 'x' } }, { file: 'ch/glossary.js' });
  assert.equal(fails.length, 1);
  assert.match(fails[0], /\(term "Solute potential", and a definition that says it is written Ψ<sub>s<\/sub>\)/);
});

test('an entity in a term fails too, and is told to write the character itself', () => {
  const fails = checkGlossaryTerms({ 'alpha-helix': { term: 'α-&#8288;helix', def: 'A coil.' } }, { file: 'ch/glossary.js', source: SOURCE });
  assert.equal(fails.length, 1, fails.join('\n'));
  assert.match(fails[0], /^ch\/glossary\.js:4: glossary entry "alpha-helix" has markup in its term, "&#8288;"/);
  assert.match(fails[0], /write the character itself in the term, as a \\u escape in the string \(a word joiner is \\u2060\)/);
});

test('with no source the failure still names the file and the entry, without a line', () => {
  const fails = checkGlossaryTerms({ nad: { term: 'NAD<sup>+</sup>', def: 'A carrier.' } }, { file: 'ch/glossary.js' });
  assert.equal(fails.length, 1);
  assert.match(fails[0], /^ch\/glossary\.js: glossary entry "nad"/);
});

test('plain terms pass: a name, a bare ampersand, Greek with a real word joiner, and markup kept in the definition', () => {
  const glossary = {
    'maximum-rate': { term: 'Maximum rate', def: 'The ceiling, written V<sub>max</sub>.' },
    'pits-and-pores': { term: 'Pits & pores', def: 'Holes.' },
    'alpha-helix': { term: 'α-\u2060helix', def: 'A coil.' },
    nad: { term: 'Nicotinamide adenine dinucleotide', def: 'Written NAD<sup>+</sup>.' },
  };
  assert.deepEqual(checkGlossaryTerms(glossary, { file: 'ch/glossary.js', source: SOURCE }), []);
  assert.deepEqual(checkGlossaryTerms({}, { file: 'ch/glossary.js' }), []);
  assert.deepEqual(checkGlossaryTerms(undefined, { file: 'ch/glossary.js' }), []);
});

test('the bound: a precomposed superscript is plain text and passes, although it does not look right', () => {
  // Tried on chapter 5 on 2026-09-23 as the NAD+ heading: the bold face has no "⁺", so Libertinus Serif
  // draws it, visibly smaller and lighter at 3x. This rule reads strings and cannot see that.
  assert.deepEqual(checkGlossaryTerms({ nad: { term: 'NAD⁺', def: 'A carrier.' } }, { file: 'ch/glossary.js' }), []);
});
