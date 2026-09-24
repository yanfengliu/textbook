// Fixture for test/theme-early.test.js (review finding R3): a page's own script, loaded by a relative
// `src`, that reaches the shell. The bare specifier goes through the import map and must not be followed.
import 'three';
import '../src/components/index.js';
