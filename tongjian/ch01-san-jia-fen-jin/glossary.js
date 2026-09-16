// 第一章的词条：本章当作「词」来读的两个单位。
//
// 《通鉴》这一句里，大夫与诸侯都是官爵名，各自有独立的义项与用例，所以它们是词条而不是两个字条；
// 原文里也用 <tb-term word="大夫"> 标出，一个元素同时担起词卡与本章术语两件事
// （docs/design/tongjian.md, "How a character on the page finds its entry"）。
//
// 词条的资料在 tongjian/words.js，这里只写本章自己的定义——一页的术语表。
// `npm run check` 要求：每一个 <tb-term ref> 都在这里有条目，每一个条目都必须被用到。

export const GLOSSARY = {
  dafu: {
    term: '大夫',
    def: '官名。诸侯之下、士之上的爵位。春秋以后，晋国国政多掌于大夫之手。',
  },
  zhuhou: {
    term: '諸侯',
    def: '天子所封的君，有封国、军队与社稷，须服从天子的政令。',
  },
};
