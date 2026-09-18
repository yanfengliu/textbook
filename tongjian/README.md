# 《資治通鑑》 卷一 周紀一 — the scholarly data layer

This directory holds the text the book reads and the lexicon that explains it. Three files carry data, two tests hold them:

| File | What it is |
|---|---|
| `corpus.js` | The passages the book quotes, verbatim from fetched sources, one entry per 句-group. |
| `lexicon.js` | One entry per 字 of that text: reading, part of speech, senses, and the sentences in the same text that attest them. |
| `words.js` | The 詞 a reader needs: the cast, the places, the offices, and 通鑑's own terms. |
| `../test/corpus.test.js` | Fails when a quotation is not in the corpus, when an entry names no source, or when a chapter page's 原文 is not the corpus entry it claims. |
| `../test/lexicon.test.js` | Fails when a character of the 原文 has no entry, when an entry is incomplete, or when a 多音字 the text reads two ways declares one reading. |

The design of record is [docs/design/tongjian.md](../../docs/design/tongjian.md); the frozen data shapes are [docs/work/4_zizhi-tongjian/contracts.md](../../docs/work/4_zizhi-tongjian/contracts.md) §3.

## The corpus

### Scope, stated because a file like this invites overreach

`corpus.js` holds **the 威烈王二十三年 entry of 卷001 and nothing else** — 13 entries partitioning its 116 句, from 「初命晉大夫魏斯、趙籍、韓虔為諸侯」 to 「武子生虔，是為景侯」, in 通鑑's own order, with no gap. It is contiguous: the 禮論 臣光曰 that sits between the opening line and the 智伯 narrative is in, because leaving it out would make the corpus three disjoint excerpts rather than one year of the book.

It is **not an edition of 通鑑**, it is not a critical edition, and it covers no other 卷. The 句-splitting, the section names and the ids are this book's editorial layer; the characters and the punctuation are the source's.

Note on the design doc's three chapters: 通鑑's order inside this entry is 開篇 → 禮論 → 智宣子立後 … 唯輔果在 → 才德論 → 豫讓 → 趙魏韓世系. A reading order of 三家分晉 → 智伯之亡 → 才德論 reorders the second and third items, which is fine for a book but is not 通鑑's order. The corpus keeps 通鑑's.

### The transcription source

**`url` for every entry: [zh.wikisource.org/wiki/資治通鑑/卷001](https://zh.wikisource.org/wiki/%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91/%E5%8D%B7001)**, fetched 2026-09-15 (raw wikitext and rendered page both), and transcribed with the edition's own collation marks resolved:

- `〔X〕(Y)` — the editor changed the received text's Y to X. The corpus prints **X**.
- `〔X〕` — X was supplied by the editor from another edition. The corpus prints **X** and says so in the entry's `note` (`不可`, `嘉`, `啟章`), except for `〔九鼎震〕`, which is not 司馬光's text at all and is excluded — see below.
- `〔紀〕綱(紀)` — a transposition, the one non-adjacent case: the received text read 綱紀 and the editor moved 紀 to match 「紀綱是也」 two sentences earlier. The corpus prints 紀綱.
- `<ref>` notes, item numbers (`'''1'''`), `::` indents and the `'''` bold markers are the page's apparatus, not the text, and are stripped.

`punctuation` records the one editorial layer this rests on: the page's modern 整理 punctuation.

The generator that did this is not in the repository — it was a scratch script — but every rule it applied is above, and the check a reader can run is: resolve the four marks the same way and compare against the file.

### The witnesses, all fetched 2026-09-15

Each corpus entry names them in `verifiedAgainst`, and each Song-print page that carries a given entry is cited by its own URL.

| # | Witness | URL | What it is | Standing |
|---|---|---|---|---|
| W1 | 章鈺-corrected modern text | [資治通鑑/卷001](https://zh.wikisource.org/wiki/%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91/%E5%8D%B7001) | The transcription source: modern punctuation, 章鈺《胡刻通鑑正文校宋記》 corrections applied, collation marks inline | Modern editorial text; its emendations are checked against W5 |
| W2 | 胡三省音注本 | [資治通鑒 (胡三省音注)/卷001](https://zh.wikisource.org/wiki/%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%92_(%E8%83%A1%E4%B8%89%E7%9C%81%E9%9F%B3%E6%B3%A8)/%E5%8D%B7001) | The 胡刻本 base text with 胡三省's 音注 and 章鈺's notes as `【章︰…】` | Gives the *received* reading wherever W1 emended, plus 330 aligned 反切 notes used to check the lexicon |
| W3 | 四庫全書本 | [資治通鑑 (四庫全書本)/卷001](https://zh.wikisource.org/wiki/%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91_(%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC)/%E5%8D%B7001) | 四庫 text, essentially the 胡注 edition again | Same textual line as W2, so it corroborates W2 rather than adding an independent one |
| W4 | 識典古籍 | [shidianguji.com … 1lukf3u9ipovf](https://www.shidianguji.com/zh/book/NGJ89241199903213511134/chapter/1lukf3u9ipovf) | 胡三省音注／陳仁錫評閱 line, OCR | **OCR-damaged**: drops whole clauses and garbles characters. Used only to record variants, never to correct the text |
| W5 | 四部叢刊景宋刊本 | [Index:Sibu Congkan0099-司馬光-資治通鑑-80-01.djvu](https://zh.wikisource.org/wiki/Index:Sibu_Congkan0099-%E5%8F%B8%E9%A6%AC%E5%85%89-%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91-80-01.djvu), pages [8](https://zh.wikisource.org/wiki/Page:Sibu_Congkan0099-%E5%8F%B8%E9%A6%AC%E5%85%89-%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91-80-01.djvu/8)…[37](https://zh.wikisource.org/wiki/Page:Sibu_Congkan0099-%E5%8F%B8%E9%A6%AC%E5%85%89-%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91-80-01.djvu/37) | A Song print — 「景上海涵芬樓藏宋刊本」 — transcribed page by page and marked 100% proofread | **The decisive witness.** It is the oldest text fetched and it is not the 胡刻本 line, so where W1 and W2–W4 disagree it breaks the tie |

Four of the five are hosted on zh.wikisource, and W2/W3/W4 descend from the same 胡刻本 line. That is the honest shape of the evidence: one modern corrected text, one received text in three copies, and one Song print.

### How the comparison was done

Every witness was reduced to its bare character stream (markup, commentary, page furniture and running heads stripped; the woodblock's own glyph forms canonicalised, so 爲/為, 羣/群, 旣/既, 别/別 and the rest do not read as disagreements) and aligned against W1's stream with a longest-common-subsequence diff over the whole 2,906-character region. Substantive differences — a character substituted, added or dropped, as opposed to a glyph form — were then read back in the raw witness text one by one, because an LCS diff can represent one real difference as two phantom ones. The Song-print readings below were confirmed by searching the transcribed pages directly, not inferred from the diff.

### Every disagreement, and what was taken

The corpus prints **W1's reading** in every case below except the three marked **TAKEN**. A reader can re-derive each row from the two sources named.

| # | Sentence | W1 (printed) | Other witnesses | Note in the entry |
|---|---|---|---|---|
| 1 | 莫**敢**不奔走而服役者 | 敢 | W2 W3 W4 lack 敢 | 章校: 十二行本、乙十一行本、孔本 have 敢; W5 agrees with W1 |
| 2 | 以禮為之**紀綱**哉 | 紀綱 | W5 綱紀; W2 W3 紀綱 | W1's 校記: 據上文乙正; 章校 records the transposition in 十二行本、乙十一行本、孔本 |
| 3 | 尊**周**室 | 周 | W2 W3 W4 王 | 章校: 十二行本「王」作「周」; W5 agrees with W1 |
| 4 | 惟**器與名** | 器與名 | W2 W3 W4 名與器 | W5 agrees with W1 |
| 5 | 上下無以**相有**故也 | 相有 | W2 W3 W4 相保 | W5 agrees with W1; no 章校 entry either way |
| 6 | 文公於是**乎**懼 | 乎 | W2 W3 W4 lack 乎 | W5 agrees with W1 |
| 7 | 田**恆**之於齊 | 恆 | 田常 in W2 W3 W4 W5 | 司馬光避宋真宗諱改恆為常; the taboo substitution is the received text |
| 8 | 生民之**類**糜滅幾盡 | 類 | W5 W2 W3 W4 類 | **TAKEN** — W1's page printed 害; see below |
| 9 | 巧文辯**慧** | 慧 | W2 惠 | W5 W3 agree with W1 |
| 10 | 宴於藍**臺** | 臺 | W2 W3 W4 W5 臺 | **TAKEN** — W1's page printed 台; see below |
| 11 | 主不備**，**難必至矣 | one 難 | W2 W3 主不備難，難必至矣 | 章校: 十二行本無「難」字; W5 agrees with W1 |
| 12 | **蜹**、蟻、蜂、蠆 | 蜹 | W4 蚋 | W5 W2 W3 agree with W1 |
| 13 | 必向之以兵，**然則**我得免於患 | 然則 | W2 W3 然後 | 章校: 十二行本「後」作「則」; W5 agrees with W1 |
| 14 | 智伯又求**藺**、皋狼之地 | 藺 | 蔡 in W5 W2 W3 W4 | W1's 校記: 據《史記·趙世家》武靈王十九年條及《通鑑》周烈王四年條改; 胡注 argues 蔡 is 藺's graphical corruption |
| 15 | 桓子**欲**弗與 | 欲 | W5 故 | W2 W3 W4 agree with W1 |
| 16 | 夫從韓、魏之兵**以**攻趙 | 以 | W5 而 | W2 W3 agree with W1 |
| 17 | 二子乃**陰**與張孟談約 | 陰 | W2 W3 W4 潛 | W5 agrees with W1 |
| 18 | **譬之**乳狗搏人 | 譬之 | W2 W3 譬如 | W5 agrees with W1 |
| 19 | 恐事**未**遂而謀洩 | 未 | W5 W2 W3 W4 未 | **TAKEN** — W1's page printed 末; see below |
| 20 | 此夫讒**臣**欲為趙氏游說 | 讒臣 | W2 W3 W4 讒人 | W5 agrees with W1 |
| 21 | 世俗莫之能**辨** | 辨 | W3 辯 | W5 W2 agree with W1 |
| 22 | 不**熔范** | 熔范 | W5 W2 鎔範 | W1 unemended |
| 23 | 豫讓曰**「不可」** | 不可 | absent in W5 W2 W3 W4 | 章校: 十二行本「曰」下有「不可」二字, 據補 — a modern restoration |
| 24 | 乃**捨**之 | 捨 | W5 W3 W2 舍 | W1 unemended |
| 25 | 弟桓子**嘉**逐浣 | 嘉 | absent in W5 W2 W3 W4 | 校記: 據《史記·魏世家》索隱引《世本》補 |
| 26 | 韓康子生武子**啟章** | 啟章 | absent in W5 W2 W3 W4 | 校記: 據《史記·韓世家》索隱增補 |
| 27 | 魏斯者，桓子之**孫**也 | 孫 | 世本 makes him 桓子之子 | 校記 records the conflict; 通鑑's 孫 is printed |
| 28 | 田恆之於齊**，，**白公之於楚 | one comma | W1's page carries two | the doubled comma is on the page itself, raw and rendered alike — a transcription slip |
| 29 | 夫禮，**辨**貴賤 | 辨 | W3 W4 辯 | 底本作「辨貴賤」; W5 W2 agree with W1 |
| 30 | 美**鬢**長大則賢 | 鬢 | W5 鬚 | 胡注: 「《通鑑》俗傳寫者多作『美鬚』，非也，《國語》作『美鬢』，今從之」; 章校: 乙十一行本作「鬚」 |
| 31 | 《夏書》有之**曰** | 曰 | W2 W3 W4 lack 曰 | W5 agrees with W1 |
| 32 | 譬之乳狗**搏**人 | 搏 | W3 W5 摶 | 胡注「搏，伯各翻」; W2 agrees with W1 |
| 33 | 魏斯者，桓子之孫也 | no 魏 before 桓子 | W2 W3 W4 魏 | 底本作「魏斯者，桓子之孫也」; W5 agrees with W1 |

One further difference was examined and **not** recorded as a variant, because it is a slip in an electronic transcription rather than a reading of any edition: W3 prints 闈 for 圍 in 「三家以國人圍而灌之」. 摶 for 搏 is not in that class and now has its own row (32): W5 prints 摶 as well, and W5 is a different digitisation from W3, so 「a slip in W3's transcription」 is not what the fetched text establishes. 摶 may be the Song print's own reading or an error both transcriptions share, and telling those apart needs the page image, which this fetch did not open.

### The three readings taken against the transcription source

| Reading | W1's page | All four other witnesses | Why it was taken |
|---|---|---|---|
| 生民之**類** | 害 | 類 | 「生民之害糜滅幾盡」 cannot be construed: 糜滅 takes the thing destroyed as its subject, and 類 — the people as a kind — is what the Song print, the 胡刻本 and the 四庫本 all read. 害 is one character from 類 in no script; this is a transcription error on W1's page |
| 恐事**未**遂 | 末 | 未 | 「事末遂」 is not construable and 「事未遂而謀洩」 is exactly the sense the passage needs (the plot not yet carried out, and already leaked). All four other witnesses read 未 |
| 藍**臺** | 台 | 臺 | 臺 is the traditional form and the reading of W5, W2, W3 and W4; 胡三省 glosses it from the 爾雅 (「四方而高曰臺」). The book sets 繁體, so 台 is also the wrong character for this page |

Plus one punctuation repair: W1's page carries 「田恆之於齊，，白公之於楚」 with a doubled comma, in the raw wikitext and the rendered page alike. The corpus prints one comma.

Each of these is stated in the `note` of the entry that contains it, and the file header names all four.

### What was left out, and why

- **〔九鼎震〕** — W1's page prefixes the year's first line with it in collation brackets. Its own 校記 says 「據《史記·周本紀》及《六國年表》增補」: a modern editor supplied it from 史記. Printing it inside the 原文 would put a 20th-century supplement into 司馬光's text. Entry `zj-001-wei-lie-23`'s `note` says so.
- **The 卷首 起訖 line** (「起著雍攝提格，盡玄黓困敦，凡三十五年」) — 司馬光's own, but it heads the 卷, not this entry.
- **The rest of 卷001** — the 魏文侯 and 吳起 narratives that follow the 世系 notice belong to later chapters of the book, not this prototype.

## The 字 and the 詞

### What is in the two files, as measured

| | Count |
|---|---|
| Corpus entries / 句 / characters | 13 / 116 / 3,557 |
| Distinct characters of the 原文 | **640** |
| `lexicon.js` entries | **640** — one per character, none missing |
| … uses / examples | 924 / 976 |
| … uses carrying no example, each with a stated reason | 306 |
| … uses declaring their own 词性 | 113 |
| … entries declaring two readings | 15 (`test/lexicon.test.js` reports 15; this table said 17 until 2026-09-18, and the number is the test's) |
| … entries carrying 異體字 | 47 |
| `words.js` entries / examples | 143 / 190 |
| `<tb-term word="…">` keys the three chapter pages mark | 104, all resolved |
| `<tb-char>` elements on those pages, all resolved | 1,405 |

`lexicon.js` is 268 KiB, over the fleet's 256 KiB blob ceiling, and the reason is stated here as that ceiling asks: it is not generated output but the book's central authored asset — 640 hand-reviewed entries, each with its senses, notes and attestations, at about 430 bytes an entry. Compacting it further would cost the one-line-per-field shape a reviewer reads it in.

### How the lexicon was made — and which parts are model-drafted

This is the part a reader should be sceptical about, so it is stated plainly.

1. **The character list is derived, not chosen.** It is every character of `corpus.js` that is not one of the ten punctuation marks the corpus uses (`、。：，？；！《》「」『』`) — 640 of them. `test/lexicon.test.js` recomputes that set from the corpus and fails on any character without an entry, so the list cannot silently shrink.
2. **The glosses and notes were drafted by a language model** (in eight parallel lanes, each given the corpus, its characters, and the 胡三省 音注 note aligned to each character), against a written brief requiring that every example be copied from the corpus and that a character with one occurrence carry `examples: []` and say so.
3. **What was checked mechanically**, and by what:
   - every example is a verbatim substring of **one 句** of the corpus, character for character. One 句, not two: an example that joins 「何則？」 to the sentence after it exists nowhere in the book and is a composed sentence however verbatim its halves are. The rule is in `test/corpus.test.js` and it was proved red by changing one character of one quotation (`out/tongjian-w2/mutation-quotation-one-character.txt`), by removing an example's `at`, and on the three chapter-page cases;
   - **no example is the sentence the reader is looking at.** A card shows a 通鑑用例 and then the chapter's own uses under 在這一章, so when a chapter's 原文 is a single 句 — chapter 1's is 「初命晉大夫魏斯、趙籍、韓虔為諸侯。」 — an example drawn from it prints the same sentence twice and teaches nothing. Fifteen uses across fourteen entries (初 命 晉 大 夫 魏 籍 虔 為 侯, and 大夫 諸侯 魏斯 趙籍 韓虔) shipped that way and were moved to another 句; the gate that holds it is `no example is the whole 原文 of a chapter the reader could be on`, and it was proved red by putting chapter 1's sentence back (`out/tongjian-w2/mutation-rule5-readers-own-sentence.txt`). **Its limit, stated rather than hidden:** this is decidable exactly for a one-句 passage. For a long passage the shared lexicon cannot satisfy rule 5 for every character — an entry drawn from chapter 2's text is that reader's own passage too — and the design's escape is the entry's own note. There are 722 such examples against the long chapters, which is a property of one lexicon over one continuous reading, not a defect the data can absorb;
   - **a 多音字 says, per sense, which reading the card must show.** `uses[].reading` is part of the shape for that reason (contracts.md §3 gains the field): the entry's `pinyin` is only the default, and `uses[0]` is what the card falls back to when a chapter binds nothing. Every use of the fifteen entries this volume reads two ways declares its own reading, taken from 胡三省's 反切 — 夫 fū (大夫) against fú (句首語氣詞), 使 shǐ (派遣) against shì (出使), 難 nán against nàn, and the rest — and no entry may declare a reading that no use takes, because a reading the card can never show is a claim the data does not support. `test/lexicon.test.js` holds both halves. A second test holds the chapter side: **every 多音字 a page renders must be bound in that chapter's `chars.js` to a use that declares a reading**, since an unbound character silently shows `uses[0]` and the reader gets a reading nobody chose;
   - every example is free of Latin letters and ASCII punctuation;
   - every entry is complete: pinyin with a tone, a part of speech, and at least one use with an id, a gloss and a note; a use with no example must say why;
   - **every pinyin was checked against the Unicode Unihan database** (`Unihan_Readings.txt`, Unicode 17.0.0, fetched from [unicode.org/Public/UCD/latest/ucd/Unihan.zip](https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip) on 2026-09-15) by converting each declared reading to base syllable plus tone and requiring Unihan to list it for that character (`kMandarin`, `kHanyuPinyin`, `kXHC1983`, `kHanyuPinlu`, `kTGHZ2013`). The check reads **every syllable the data declares — 1,025 of them, across each entry's `pinyin`, its `readings`, and each use's `reading`** — and four characters are exceptions. All four are readings 胡三省 gives by 反切 on this very volume and none is listed in Unihan's fields for that character:
     - **說 shuì** — 「欲為趙氏游說」; 胡注「說，式芮翻」
     - **勝 shēng** — 「力不能勝」; 胡注「勝，音升」
     - **使 shì** — 「絺疵請使於齊」; 胡注「使，疏吏翻」，並云「疵請出使以避禍也」
     - **先 xiàn** — 「孔子先之」; 胡注「先，悉薦翻」
     Unihan gives the modern default for each (shuō, shèng, shǐ, xiān) and does not carry the 舊讀. The lexicon keeps 胡三省's reading because the chapters print it — chapter 2's own 字詞 table reads 使 shì and 難 nàn, and a lexicon that disagreed with the page beside it would be the defect, not the correction. Two further entries, 壞 and 行, had a second reading declared on the same kind of evidence and **no use in this volume takes it** (行's 下孟翻 belongs to 「行不合」 in the 魏文侯 passage, which is not in this corpus), so those declarations were dropped rather than left unclaimed; the 反切 stays in the entry's note.
   - the six 多音字 the corpus genuinely reads two ways — 為, 分, 勝, 見, 相, 惡 — must declare both, and `test/lexicon.test.js` holds a table of the two quotations that force each reading. Five of the six are 胡三省's own 反切 on this very passage: 「分，扶問翻」, 「勝，音升」, 「見，賢遍翻」, 「相，息亮翻」, 「惡，烏路翻」. Eleven further entries declare a second reading on 胡三省's 反切 (治 chí, 使 shì, 將 jiàng, 識 zhì, 長 zhǎng, 奸 gān, 夫 fú and the rest); a reader who wants the narrower test — modern 普通話 only — can delete those eleven and every note still reads;
   - **every gate was proved red by mutation before it was believed.** The mutation, the failing assertion and the byte-for-byte restore are in `out/tongjian-w2/mutation-*.txt` (ignored by Git; they are this round's task evidence, not a repository input). Eight data mutations — one character changed in a quotation, an example with no `at`, an entry deleted, a 多音字 given one reading, an empty-example use with no note, a word's card-facing gloss drifted from its uses, the reader's own sentence put back as an example, and the whole lexicon emptied — and three page mutations — a 原文 with one character different, a 原文 block with no `data-corpus`, and a `data-corpus` naming no entry. The emptied-lexicon run is the one that answers the denominator question: it fails with 「640 character(s) of the 原文 have no entry」 and 「LEXICON is empty — checked zero entries」, so a run that finds nothing cannot pass as one that found everything.
4. **What was checked by reading, and how far it went.** The 胡三省 音注 (W2) is a fetched annotation source that covers this passage, and 330 of the 640 characters have a note aligned to them; the drafters were given those notes and told to use them. The glosses were then read against the sentence each character stands in. **This is not a dictionary check.** No entry's gloss was verified against a fetched dictionary entry of its own, and a wrong gloss is a well-formed entry that every gate here passes. The independent review in the round's plan is what that check is for, and it has not happened yet at the time of writing.

`pos` is one value per entry **and may also be declared per use**, which is the one schema limit this round lifted. A character can genuinely be two parts of speech in one volume — 周 is 專名 for the dynasty and 动 in 「智不能周」; 相 is 副 in 「相親」 and 名 in 「君相」; 眾 is 形 in 「眾人之識」 and 名 in 「部眾」 — and a card that printed the entry's class over another sense's gloss contradicted itself in one popover: 「相 xiàng」 above 「辅佐之臣；国相」 labelled 副, 「難 nàn」 above 「灾难；祸患。」 labelled 形, 「將 jiàng」 above 「率领。」 labelled 副. So **113 uses declare their own `pos`**, and the card prints the shown use's class, falling back to the entry's only where the use declares none — which is where the two agree. What remains of the limit, stated rather than hidden: `pos` is still one value per entry, so an entry asserts that its dominant use's class is the entry's class and cannot assert anything else about it; the vocabulary is the twelve classes `test/lexicon.test.js` holds in `POS`, which has no 兼词 slot (諸 = 之于 is given 介 here) and no 助动词 slot (敢 「助动词，敢；有胆量」 is given 动); and the declaration is a judgement about a sense, so the gate holds it only where the use's own gloss or note names a class in words — 60 uses, 24 of which contradict their entry's. `docs/work/4_zizhi-tongjian/contracts.md` §3's shape was written before either `uses[].reading` or `uses[].pos` existed and sketches neither.

### The 異體字

`variants` lists the other form of a character that a fetched witness actually prints, and only that: all 47 declared pairs are printed by a fetched witness (46 of them in W1, W2, W3 or W5; 蜹/蚋 in W4). The 47 are 為/爲, 群/羣, 既/旣, 別/别, 遠/逺, 真/眞, 喪/䘮, 綿/緜, 絕/絶, 衛/衞, 眾/衆, 德/徳, 寧/寜, 強/彊, 苟/茍, 說/説, 決/决, 沒/没, 潛/潜, 廁/厠, 宮/宫, 奸/姧, 將/将, 瑤/瑶, 戶/戸, 歷/歴, 虔/䖍, 侯/矦, 世/丗, 簡/𥳑, 嘗/甞, 伎/𠆸, 悅/恱, 陰/隂, 疏/踈, 聰/聦, 顛/顚, 洩/𣳘, 他/佗, 備/僃, 奈/柰, 寬/寛, 產/産, 段/叚, 嗚/烏, 捨/舍, 蜹/蚋. **The list is attested but not exhaustive, and this file does not claim it is.** The comparison above is not what produced it: that comparison canonicalised the woodblock's glyph forms before it diffed — which is how 爲/為, 羣/群, 旣/既 and the rest escaped being read as disagreements — so a form outside this list is missing from it rather than denied by it. Eleven pairs a fetched witness prints **inside this passage** are known to be missing: 隄/堤 (W2 W3 W5), 谿/溪 (W2 W3 W5), 泄/洩 (W2 W3), 姦/奸 (W2 W5), 幷/並 (W2), 嚮/向 (W2 W3 W5), 况/況 (W3), 疎/疏 (W3), 悦/悅 (W3), 䟽/疏 (W5), 𣈆/晉 (W5). (A twelfth of that shape, 岀/出, is printed by W5 only on page 30, outside the passage this corpus covers, so it is not counted here.) They are named so the gap is visible rather than silent: until `variants` carries them, that field is a partial list. Two pairs that look similar were deliberately **not** recorded: 於/于 and 巳/已 are different characters, not forms of one, and 鼃, the corpus's form of 蛙, has no witness in this fetch printing 蛙.

### The 詞

`words.js` holds 143 terms. It covers the cast (with the collisions a reader will hit — 智伯 = 智襄子 = 瑤; 智果 becomes 輔果 after 別族; 智國 is not 智果; 趙孟 is 趙襄子, not 趙簡子; and there are two different 桓子), the places, the offices and titles, and the words 通鑑 uses in its own way (名分, 紀綱, 名器, 才德, 委質, 繭絲, 保障).

Its key list came from two places, and the second is the one that keeps the cards working: **105 terms were chosen by reading the corpus** (one of them, 藺, turned out to be a single character and belongs to `lexicon.js`, so 104 of them are here) and **39 more were derived from the pages** — a scratch pass collected every `word="…"` the three chapter pages actually mark and wrote the entries no list had reached. 104 + 39 = 143.

**39 of the 143 entries are marked by no page.** That is allowed — the shared layer is allowed to be ahead of the chapters — but it is stated here rather than left to be discovered, and the two sets of 39 are not the same set: the 39 derived from the pages are all reachable, and the 39 reachable from nothing are 繼承人 晉國 趙籍 韓虔 為後 天子 名分 名器 紀綱 君相 卿大夫 四海 兆民 智力 智宗 智宵 智瑤 三公 三晉 士庶人 王人 周室 守堤 血食 別族 請地 繁纓 德勝才 社稷 置後 訓戒 倉庫 脣亡則齒寒 決水 才勝德 才德全盡 漆身 吞炭 委質.

Entries carry the contract's card-facing `gloss`/`note`/`examples` **and** a `uses` list; `test/lexicon.test.js` fails when the card-facing gloss is not one of the entry's own senses, or when its examples differ from the use they come from — a card showing a merged sense the entry does not carry says something the data does not support.

Three keys — 智宵, 智瑤, 繼承人 — do not occur verbatim in the 原文 (the text says 「不如宵也」 and calls 瑤 by the bare name; 繼承人 is the modern word for 「後」). Their `note` says what the text actually calls them. 藺 is deliberately **not** a 詞: it is one character, it belongs to `lexicon.js`, and its fact (底本作「蔡」，校記據《史記》改為「藺」) sits in the 皋狼 note as well.

### The two scripts, and what was converted

The book sets two, and which is which is a rule rather than a habit. The owner read the published version and said so in two steps: *"我是说这本书一律用简体中文"*, and then, on hearing how the 原文 is set, *"If the original text is in traditional chinese character that is fine. I just need the rest of the textbook and especially the translation to be in simplified chinese."*

| What | Script | Which is |
|---|---|---|
| The 原文 — every sentence inside `<ol class="zj-src">` | **Traditional** | the received text, as the witnesses print it |
| Every quotation of 通鑑: a card's 通鑑用例, a quotation in the chapters' prose, a figure's `quote`, the `.zj-trans__src` copy beside the 譯文, the 字詞 tables' glyph and example columns | **Traditional** | the text |
| Everything else: 譯文, 背景, 思考, headings, captions, the citation line, the figures' labels, a card's `gloss` and `note` and its labels (通鉴用例, 在这一章, 又读, 异体, 本章字词), the notes in this file | **Simplified** | the book's own voice |

**What the conversion was, and what it was not.** On 2026-09-18 every reader-visible file was converted to Simplified with OpenCC's character table `TSCharacters.txt` (fetched that day from [the OpenCC repository](https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary/TSCharacters.txt), the first candidate per character), and the Traditional layer was then put back — the 原文 and the quotations — **from commit `6d854cf`, not by re-converting**. A blanket 简→繁 pass is ambiguous in exactly the characters this book is about: 干 is 乾 in 乾坤 and 干 in 干戈, 后 is 後 and 后, 里 is 裡 and 里, and OpenCC's own phrase table maps 乾坤 to 干坤. The committed tree holds the received text itself, so the restoration is a lookup rather than a decision: the conversion is a per-character map, so `TSCharacters` applied to the committed file and the committed file agree index by index, and any Simplified run that came from it can be read back out of it exactly. Three regions were held out of the conversion and survive from `6d854cf` unchanged:

- **`work`** — the catalogued title, kept in its own form (docs/design/tongjian.md).
- **`variants`** — the glyph a fetched witness prints (爲, 羣, 戸 …). The field's whole content is "this other form exists in the collation", so converting it would empty it. All 47 are here.
- **乾坤 and 絺** — 乾 is Simplified already in 乾坤, and OpenCC's Simplified form of 絺 is 𫄨 (U+2B128), an astral-plane glyph the book's webfont subsets do not carry; 絺 is also a man's surname here.

Four decisions inside the conversion that were **not** mechanical, recorded because a reader may disagree with any of them:

- **`藉`** is a character both scripts print (狼藉, 慰藉), so the table leaves it; `藉此` is `借此` in Simplified and was changed by hand. `憑藉` stays `凭借` (the 藉 is correct there).
- **`著`** likewise exists in both scripts, and the table does not touch it: the particle is `着` in Simplified (接著 → 接着, 帶著 → 带着), while the `zhù` senses stay 著 (非名不著, 著雍攝提格, 著稱). Each occurrence was decided by reading it.
- **`乾`** is `干` where it means dry or 幹 (抽乾 → 抽干, 才幹 → 才干) and stays 乾 in 乾坤 — the table's single mapping cannot tell the two apart.
- **Names inside Simplified prose**: a quoted 通鑑 word keeps its Traditional form (「晉大夫」), while the same word used as the book's own subject stays Simplified — so a `def` can read 「与「敗子」并举」. The rule is that the quotation is the text and the sentence around it is the book.

**What holds it.** `test/lexicon.test.js`, *the 原文 and its quotations are Traditional, and everything else is Simplified*, scans the eighteen files a reader sees (the four pages, `corpus.js`, `lexicon.js`, `words.js`, `data/card.js`, the three chapters' `glossary.js` and `chars.js`, the three figures and the registry) against `test/fixtures/traditional-only.txt` — 3,222 characters, OpenCC's table reduced to the ones whose Simplified form differs, checked in rather than fetched. It then compares each page's 原文 block against its corpus entry character for character, and each run marked `lang="zh-Hant"` (222 of them) against the corpus, so a quotation cannot be Simplified or invented. Held out, with the reason in the test's header: the corpus's own transcription record (`juan`, `section`, `punctuation`, `note`) and this file's script discussion, which have to be able to name a received form; and the two characters above.

**Where the `lang` attributes are.** The page declares `<html lang="zh-Hans">`, and every element that carries the text declares `lang="zh-Hant"`: each `<ol class="zj-src">` block in the markup, each `.zj-trans__src` copy, each `.zj-quote` example, each prose quotation the book sets off with 「」, and — built by `tongjian/data/card.js` — the card's glyph, its 通鑑用例 and its 在這一章 clauses. A screen reader is the reader this is for: without the attribute it reads 為 with a Mandarin-Simplified voice, and the two-script page is exactly the case the attribute exists for.

### Which words are 通鑑's, and what makes that visible

The script rule above is half an answer, and the owner said so: *"Just make it perfectly clear what came from the book what didn't it, everywhere."* `lang="zh-Hant"` records which run is 通鑑's, but an attribute is invisible, so a quotation in 背景 was Traditional and otherwise identical to the sentence around it.

Three things carry it now, and `test/provenance.test.js` holds all three:

1. **The setting.** `tongjian/zj.css` sets every `lang="zh-Hant"` run inside the book's prose at `--zj-quoted-size` (0.95em) in `--ink-soft` — the treatment `docs/design/tongjian.md` specified for a quotation inside an argument and nothing had implemented. The rule reaches **by exclusion, not by a whitelist of containers**: the 原文, the lexicon card, the figures and the citation line above the 原文 are the regions it does not touch, and every other run a marked quotation can sit in is reached — including the ones inside a `<tb-check>` option or a `<tb-sort>` card, which `src/components/check.js` and `sort.js` rebuild as buttons and which a container whitelist missed. The 原文 is one of the excluded regions and keeps full ink and full size, so a reader sees the text the book reads and the text the book quotes at two different weights. There is **no size floor**: a 註 is 16 px at 390 px and at 1440 px alike, so a run in one is 15.2 px everywhere, and the floor that used to stand here raised chapter 3's 11.52 px citation line's run to 13 px — a step up on the one line that is pure citation. Where the container is already `--ink-soft` — a 註, a check's explanation — the mark **inverts to full ink at the container's own size**, because quieter is unavailable there; and inside a textual note (異文, 異說, 底本) the run keeps the note's 青 and is marked by weight 500 instead, so the note's own statement survives. No underline (that already means "a 詞 you can open"), no tint, no colour.
2. **Every quotation, not most of them, and a quotation need not be bracketed.** Twenty-one runs that were 通鑑's own words printed as the book's own sentence — 「臣光曰」, 「以人事知之」, 「城不浸者三版」, 「三家分智氏之田」, 「智伯之臣」, 「才德兼亡」, 「保障」 and the rest — now carry the mark, and the gate that finds them compares every 「…」 run in a page's prose against `corpus.js`. **That was only half the hole**, because both checks were bounded by the book's own brackets: a run of 通鑑's words the book printed bare, in its own sentence, was invisible. A second claim now covers it — a maximal run of a page's prose that is verbatim `corpus.js` and holds ≥ 6 Han characters must carry the mark — and it found five more: chapter 2's opener dek, chapter 2's `q-chici` explanation, chapter 3's `q-yuren` option and explanation, and a sort item. Above that, **chapter 3's sort card prints its received-text clauses Traditional and marked** (才德全盡, 德勝才, 才德兼亡, 才勝德, 挾才以為善, 挾才以為惡, 智不能周，力不能勝), because the card's intro calls the items 每一句 and every `data-why` says 原文：. The floor is measured, not chosen, and the check prints the populations it read; **a 通鑑 run the book prints in Simplified is the stated bound**, because comparing in normalised script was measured and cannot separate a quotation from the book's own narration.
3. **The key**, one sentence on `tongjian/index.html`: 繁体字都是《资治通鉴》自己的话，简体字都是本书自己的话，而原文各节只读本书选定的段落，别处引到的《通鉴》是证据，不是读物. A chapter does not repeat it. A mark whose meaning is never stated is decoration.

**A prose quotation carries its citation.** `.zj .tb-text .zj-at` is the rubric the card already hangs on its 通鑑用例 and each figure on its `quoteAt` — Hei, `--zj-rubric-size`, `--ink-faint`, tracked, `nowrap` — spent once so far, on chapter 2's 背景, on the year the 前376 entry is filed under. It answers a question the mark alone cannot: not whose words the quotation is, but why the book quotes it instead of reading it in the 原文.

**The figures declare their own.** 通鑑 quoted inside a figure is built by JavaScript, where no page-side scan can see it, so each `src/figures/zj-*.js` exports `QUOTED_FIELDS` — the names of the object fields that hold whole 通鑑 句 — and the gate checks the declaration in both directions: a field holding a 句 must be named, and a named field must hold one. `quote` is 通鑑's sentence and `quoteAt`/`source` is its citation; `zj-split`'s `aside` is declared because one step's aside is 司馬光's own 臣光曰; a year's `season` (著雍攝提格) is a **name** of the year rather than a sentence of the book's, and is deliberately not declared. The element each module builds for the text carries `lang="zh-Hant"` too, for the stylesheet and for a screen reader.

**What is not gated, and why.** A quotation from another work — 史記, 戰國策, 胡三省注, 韋昭注 — carries no attribute, because each one is named in the sentence that quotes it (《史記·刺客列傳》作「豫让拔剑三跃而击之」…). That is a property of the prose, not of an attribute a checker can read, and it is stated rather than implied. A one-character quotation is outside the gate's bound: a single Han character in 「」 is far more often the book naming a word it is about (「命」, 「恒」, 「版」) than quoting 通鑑.

### Note length, because the card has to fit

The card worker measured every card on the three chapters at 1440 px and 390 px by opening it. Thirty-two still scrolled at 1440 px, and the cause was not the layout but `note` length: the notes behind those cards ran to 107, 63, 57, 53 characters against a lexicon whose median is far shorter. The 32 shown notes were rewritten — **428 characters cut, worst first** — keeping every source attribution, every 反切 and every variant reading, and cutting only words:

| | before | after |
|---|---|---|
| 段規 (worst: 95 px over) | note 107, gloss 37 | note 49, gloss 16 |
| the other 31 | 4–63 characters | 4–33 characters |

One note is still longer than the rest: 段規's 49 characters, because it carries a genuine disagreement between commentators that the book prints rather than resolves, and cutting it further would drop one of the two readings. Everything else is at 33 or under. These are measured on the data, not on rendered cards — the card worker's instrument is what confirms the heights, and its next pass is the one that says whether 32 goes to 0.

### One disagreement the book prints instead of resolving

段規's office is not in 通鑑's text — the 正文 calls him 段規 and nothing else. 胡三省 gives him one: 「段規，韓康子之相也」. But the commentator's tradition disagrees with itself, and the disagreement is inside 韋昭's own apparatus rather than between two authors. Fetched for this file on 2026-09-15 from [國語 (四庫全書本)/卷十四](https://zh.wikisource.org/wiki/%E5%9C%8B%E8%AA%9E_(%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC)/%E5%8D%B714), the two notes read:

- at 「知襄子戲韓康子而侮段規」: 「康子韓宣子之曾孫莊子之子虎也，**段規魏桓子之相也**」
- five sentences later, at 「今主一宴而恥人之君相」: 「**君康子，相段規**」

So one note makes him 魏桓子's 相 and the next makes him 韓康子's. `words.js` records both, chapter 2's margin note says the same on the page, and neither picks a winner. Recorded here because the first pass at this file checked only 胡三省's 音注 — where the note occurs twice, both times as the 韓康子 reading — and wrongly concluded that the page's claim about 韋昭 had no source. It had one; the search was too narrow, which is the failure this section exists to prevent.

## What could not be verified

Stated so that no reader mistakes silence for coverage.

1. **No print edition was fetched.** No 中華書局標點本, no 胡刻本 facsimile, no 百衲本. Where the 校記 cites 十二行本, 乙十一行本, 孔本, 張校 and 退齋校, this file reports *what the 校記 says*, not what those editions say. Rows 1, 3, 11, 13, 23 above rest on that report plus W5's agreement. A reviewer with the 中華書局本 should confirm 藺/蔡, the 「不可」 restoration, 蜹/蚋 and 未/末.
2. **ctext.org refused to serve.** Every request returned an anti-scraping page stating that LLMs and scrapers are not authorised and that the site will deliberately return corrupted data to them. Nothing here rests on ctext, and no attempt was made to work around it.
3. **W5 is a transcription of a scan, not the scan.** The 四部叢刊 pages on Wikisource are marked 100% proofread, but proofreading is a claim by an editor, and this fetch did not open the page images. Where W5 alone decides a reading (rows 15, 16, 22), the text rests on that transcription.
4. **Glosses are unchecked against a dictionary** — see above. They are consistent with the passage and with 胡三省; they are not certified.
5. **The 胡注 snippets are the notes on this page only.** 330 characters have an aligned note; the rest were drafted from the passage alone.
6. **Senses outside this 卷 are not claimed.** The corpus is one year of one 卷. A character's commonest classical sense may simply not occur in it; where a drafter knew of one, the honest place for it is the note, and the notes are not exhaustive.
7. **The length of one 版 is given in 尺, not in metres.** 胡三省's 音注 on 「城不浸者三版」 reads 「高二尺爲一版；三版，六尺」 (W2): one 版 is two 尺 high, so three are six. The 版 and 浸 cards quote that note. The chapter prints the figure and does not convert it to metres, because no fetched witness gives the 尺 a modern equivalent.
8. **董安于 does not appear in 卷001.** 通鑑 gives 晉陽's administration to 尹鐸 alone. If any draft credits 董安于 with 晉陽, that comes from another text.
9. **「通鑑三家注」 does not exist.** 三家注 is a 史記 term. The attested commentary layers are 胡三省《資治通鑑音注》, 陳仁錫 評閱, and 司馬光's own 《考異》 and 《目錄》.
10. **The historical dating is out of scope here.** The corpus carries no Western years and no 干支: W1's headings carry them as modern additions, and 胡三省 supplies the 干支 as commentary. Whatever the chapters say about 403 BC, 453 BC and 376 BC belongs to the chapter prose, not to this file.
11. **The independent review of the glosses has not happened.** The drafting lanes flagged their own soft spots in writing — among them 智宣子 being called 智瑤's and 智宵's father, which the corpus only implies and never states; 安邑、平陽、晉陽、邯鄲、長子 and 皋狼 identified with modern places, which is conventional geography and not in any source fetched here; 尹鐸's 「損其戶數」 read as under-reporting households, which is 韋昭's gloss rather than something the passage spells out; and 繁讀 pán in 繁纓, which follows 胡注「音蒲官翻」 against the character's common reading.
12. **Eleven of the seventeen `readings` declarations are the entries' own judgement**, resting on 胡三省 giving two 反切 for that character in this volume rather than on a modern dictionary's two readings. They are named in the section above; deleting them leaves every note coherent.

## Re-deriving this directory

1. Fetch W1 (raw and rendered) and W2, W3, W5 pages 8–37, all at the URLs above.
2. Strip markup, commentary and page furniture; resolve `〔X〕(Y)` → X, `〔X〕` → X, and `〔紀〕綱(紀)` → 紀綱.
3. Canonicalise the woodblock's glyph forms (the 異體字 list above), then diff character by character against W1's stream.
4. Take W1's reading except for rows 8, 10 and 19 in the disagreement table, which are the three where all other witnesses agree against it and its reading is not construable.
5. Split into the 13 句-groups in `corpus.js`; add the sources, the fetch date and the note each entry needs.
6. Check it. `node --test` spawns one child per file, which this session's process policy refuses with `spawn EPERM` — an environment fact, not a red suite. Run the two data gates in one process:

```sh
node --test --experimental-test-isolation=none test/corpus.test.js test/lexicon.test.js
```

Their bound, stated in both file headers: they prove the quotations are real, the data is complete and the pages print what the corpus holds. They cannot tell whether a gloss is *right*, whether a pinyin is the reading the sentence requires, or whether a sense list is complete — a wrong gloss is a well-formed entry and both gates pass it. That is what the round's independent review is for.

Fetch dates throughout are local dates at UTC−07:00.
