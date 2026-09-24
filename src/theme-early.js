// The reader's theme, applied before the page is first styled.
//
// src/shell.js applies `?theme=` or the reader's stored choice while its module evaluates, and a module
// script runs only after the whole document has been parsed. By then the browser has already styled the
// markup once, in the theme a page with no `data-theme` is: the one the system prefers. So a reader
// whose stored choice differed from their system saw one to three frames of the whole page in the other
// theme, and then every title that carries a colour `transition` faded across over 240 ms — on Today, the
// book contents pages, the chapters and the library (docs/learning/defect-register.md, 2026-09-22).
//
// So every page that loads the shell carries THEME_BLOCK in its <head>, before its first stylesheet: a
// classic inline script, which runs while the parser is still in <head>, before <body> exists and before
// anything is styled. Before the first stylesheet, not merely somewhere in <head>, because a classic
// script placed after a stylesheet that is still loading waits for it. It resolves exactly as the shell
// does: `?theme=dark|light` wins and is not stored; otherwise the stored choice; otherwise nothing, so
// the CSS follows the system. Every storage access is inside the `try`, as the shell's are, because a
// browser that blocks site data throws on it, and the function wrapper keeps `t` off the global object,
// where a module naming an undeclared `t` would find it instead of throwing. The shell still applies the
// same value afterwards; setting an attribute to the value it already holds changes no style, starts no
// transition, and the shell's `tb-theme-change` is still dispatched.
//
// One source. The shell imports THEME_KEY from here, and test/theme-early.test.js compares every page
// that loads the shell against THEME_BLOCK character for character, so a page cannot drift from this file
// without that test naming it. The block cannot be imported by a page, because it must run before any
// module could, so each page carries a copy, and the copy is what the test holds. `npm run theme` loads
// every one of those pages in a browser and checks the attribute is on <html> before <body> exists.
export const THEME_KEY = 'tb-theme';

export const THEME_BLOCK = [
  '<!-- The reader\'s theme, before the page is first styled: THEME_BLOCK from src/theme-early.js, copied verbatim. test/theme-early.test.js holds every page to it. -->',
  `<script>(function () { try { var t = new URLSearchParams(location.search).get('theme'); if (t !== 'dark' && t !== 'light') t = localStorage.getItem('${THEME_KEY}'); if (t) document.documentElement.dataset.theme = t; } catch (e) {} })();</script>`,
].join('\n');
