// 第一章的詞條：本章當作「詞」來讀的兩個單位。
//
// 《通鑑》這一句裡，大夫與諸侯都是官爵名，各自有獨立的義項與用例，所以它們是詞條而不是兩個字條；
// 原文裡也用 <tb-term word="大夫"> 標出，一個元素同時擔起詞卡與本章術語兩件事
// （docs/design/tongjian.md, "How a character on the page finds its entry"）。
//
// 詞條的資料在 tongjian/words.js，這裡只寫本章自己的定義——一頁的術語表。
// `npm run check` 要求：每一個 <tb-term ref> 都在這裡有條目，每一個條目都必須被用到。

export const GLOSSARY = {
  dafu: {
    term: '大夫',
    def: '官名。諸侯之下、士之上的爵位。春秋以後，晉國國政多掌於大夫之手。',
  },
  zhuhou: {
    term: '諸侯',
    def: '天子所封的君，有封國、軍隊與社稷，須服從天子的政令。',
  },
};
