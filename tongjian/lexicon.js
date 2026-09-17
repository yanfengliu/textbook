// 字 — one entry for every character of the passages in ./corpus.js (640 of them).
//
// Each entry gives the character's reading here, its part of speech, and the senses the
// passage shows, each with the corpus sentence that attests it. A character with only one
// occurrence in the volume carries `examples: []` and a note saying so: an honest gap beats
// a sentence someone composed.
//
// How it was made: the glosses were drafted from the passage, then checked against the
// passage and against the fetched 胡三省 音注 (see README.md, "How the lexicon was made").
// Every example is a verbatim substring of ./corpus.js, which test/corpus.test.js enforces,
// and every character of the corpus has an entry, which test/lexicon.test.js enforces.
//
// Bound: this is not a dictionary of classical Chinese and does not claim to be. It covers
// the characters of 卷一 周纪一's 威烈王二十三年 entry; a sense that only appears in another
// 卷 is not claimed here. It proves nothing about whether a gloss is right — review does.

export const LEXICON = {
  '初': {
    pinyin: 'chū',
    pos: '副',
    uses: [
      { id: 'chu1-at-first', gloss: '起初；当初', note: '追叙往事的发端之词，置于句首，其后用逗号点断。',
        examples: [{ text: '初，智宣子將以瑤為後。', at: '周紀一' }] },
      { id: 'chu1-first-time', gloss: '开始；首次', note: '「初命」谓初次以天子之命任命晋大夫为诸侯，是这一卷的起笔。本卷用「首次」义的只有这一句，而这一句就是第一章的整段原文，卡片不把读者正在读的那一句当用例印出来，所以此处不举用例。',
        examples: [] },
    ],
  },
  '命': {
    pinyin: 'mìng',
    pos: '动',
    uses: [
      { id: 'ming4-order', gloss: '命令；下令册命。', note: '周天子下令册命晋大夫为诸侯，是本卷开篇的第一件事，也是本卷唯一一例动词的「命」。这一句就是第一章的整段原文，卡片不把读者正在读的那一句当用例印出来，所以此处不举用例。',
        examples: [] },
      { id: 'ming4-name', gloss: '命名；称呼。', note: '「名以命之」是用名号来称呼事物，与下句「器以别之」相对。',
        examples: [{ text: '名以命之，器以別之', at: '周紀一' }] },
      { id: 'ming4-mandate', pos: '名', gloss: '天命；气运。', note: '名词。「天命之」是上天授命，「智氏之命」是气数。',
        examples: [{ text: '人歸之，天命之', at: '周紀一' }, { text: '智氏之命必不長矣', at: '周紀一' }] },
      { id: 'ming4-decree', pos: '名', gloss: '诏命；册命。', note: '名词，指天子所下的册命。',
        examples: [{ text: '是受天子之命而為諸侯也', at: '周紀一' }] },
    ],
  },
  '晉': {
    pinyin: 'jìn',
    pos: '专名',
    uses: [
      { id: 'jin4-state', gloss: '国名。周初所封，春秋时为大国，地在今山西一带', note: '本卷开篇的三家分晋，分的就是晋国。',
        examples: [{ text: '今晉大夫暴蔑其君，剖分晉國', at: '周紀一' }] },
      { id: 'jin4-san-jin', gloss: '「三晋」，指由晋国分出的赵、魏、韩三家', note: '胡三省注：三家分晋国，当时因称之为三晋，犹如后来的三秦、三齐。',
        examples: [{ text: '故三晉之列於諸侯', at: '周紀一' }] },
    ],
  },
  '大': {
    pinyin: 'dà',
    pos: '形',
    uses: [
      { id: 'da4-great', gloss: '大；重大。', note: '用于比较：没有比礼更大的，即礼最重大。',
        examples: [{ text: '天子之職莫大於禮', at: '周紀一' }, { text: '是故以周之地則不大於曹、滕', at: '周紀一' }] },
      { id: 'da4-dafu', gloss: '「大夫」的大，官名用字。', note: '与「夫」合成官名「大夫」，是诸侯之下的大臣。',
        examples: [{ text: '公、侯、卿、大夫是也。', at: '周紀一' }] },
    ],
  },
  '夫': {
    pinyin: 'fū',
    readings: ['fū', 'fú'],
    pos: '名',
    uses: [
      { id: 'fu1-dafu', gloss: '与「大」合成「大夫」，官名。', note: '读 fū。本卷的「大夫」指晋国掌政的卿大夫之家。',
        reading: 'fū',
        examples: [{ text: '公、侯、卿、大夫是也。', at: '周紀一' }] },
      { id: 'fu2-initial', pos: '语气', gloss: '句首语气词，表示要发议论。', note: '读 fú，胡注「夫以，音扶」。本卷作发语词的最多；「丈夫」义本卷未见。',
        reading: 'fú',
        examples: [{ text: '夫事未有不生於微而成於著。', at: '周紀一' }, { text: '夫禮，辨貴賤，序親疏', at: '周紀一' }] },
    ],
  },
  '魏': {
    pinyin: 'wèi',
    pos: '专名',
    uses: [
      { id: 'wei4-shi', gloss: '氏名，亦国名。晋国大夫魏氏，即后来的战国魏国。', note: '本卷十二见，皆指魏氏及其宗主：魏斯（即魏文侯）、魏桓子。',
        examples: [{ text: '帥韓、魏之甲以攻趙氏', at: '周紀一' }] },
    ],
  },
  '斯': {
    pinyin: 'sī',
    pos: '专名',
    uses: [
      { id: 'si1-name', gloss: '人名用字。魏斯，即魏文侯。', note: '本卷三见，其中两见是晋大夫魏斯的名字；另一见是代词「此」。',
        examples: [{ text: '魏斯者，桓子之孫也，是為文侯。', at: '周紀一' }] },
      { id: 'si1-this', pos: '代', gloss: '此；这里。', note: '代词，用在介词之后，指「这个时候」。',
        examples: [{ text: '先王之禮於斯盡矣。', at: '周紀一' }] },
    ],
  },
  '趙': {
    pinyin: 'zhào',
    pos: '专名',
    uses: [
      { id: 'zhao4-clan', gloss: '氏名。晋国大夫赵氏，也是战国赵国之氏。', note: '赵籍是晋国赵氏之长，即后来的赵烈侯；赵简子、赵襄子都出自此氏。',
        examples: [{ text: '趙簡子之子，長曰伯魯', at: '周紀一' }] },
      { id: 'zhao4-state', gloss: '指赵氏之国、赵氏政权。', note: '「攻赵」「赵亡」都是就赵氏而言。胡注引《史记·六国年表》，说赵、魏、韩灭智伯而三分晋国。',
        examples: [{ text: '今智伯帥韓、魏而攻趙', at: '周紀一' }] },
    ],
  },
  '籍': {
    pinyin: 'jí',
    pos: '专名',
    uses: [
      { id: 'ji2-name', gloss: '人名。赵籍，赵献子之子，即赵烈侯。', note: '本卷两见皆指此人：开篇以「赵籍」与魏斯、韩虔同列，末句「献子生籍」补出其世系。本卷未见「书籍、登记」义。',
        examples: [{ text: '獻子生籍，是為烈侯。', at: '周紀一' }] },
    ],
  },
  '韓': {
    pinyin: 'hán',
    pos: '专名',
    uses: [
      { id: 'han2-clan', gloss: '晋国韩氏；也指韩氏后来所建的国。', note: '本卷或指韩康子、韩虔等韩氏之人，或与赵、魏并举。',
        examples: [{ text: '智伯請地於韓康子', at: '周紀一' }, { text: '帥韓、魏之甲以攻趙氏', at: '周紀一' }, { text: '韓康子生武子啟章', at: '周紀一' }] },
    ],
  },
  '虔': {
    pinyin: 'qián',
    pos: '专名',
    uses: [
      { id: 'qian2-name', gloss: '人名。韩虔，韩康子之孙，即韩景侯', note: '字义本为恭敬，本卷只作人名用字；他与魏斯、赵籍同被周天子命为诸侯。',
        examples: [{ text: '韓康子生武子啟章，武子生虔，是為景侯。', at: '周紀一' }] },
    ],
    variants: ['䖍'],
  },
  '為': {
    pinyin: 'wéi',
    readings: ['wéi', 'wèi'],
    pos: '动',
    uses: [
      { id: 'wei2-become', gloss: '做；成为。', note: '通用义。「为诸侯」即成为诸侯。',
        reading: 'wéi',
        examples: [{ text: '魏斯者，桓子之孫也，是為文侯。', at: '周紀一' }] },
      { id: 'wei2-as', gloss: '作为；当作。', note: '「以乾坤为首」即把乾坤两卦放在首位；「以礼为之纪纲」即把礼当作纪纲。',
        reading: 'wéi',
        examples: [{ text: '文王序《易》，以乾坤為首。', at: '周紀一' }, { text: '豈非以禮為之紀綱哉', at: '周紀一' }] },
      { id: 'wei2-called', gloss: '叫做；是。', note: '用于说明某人是某位，如「是为文侯」。',
        reading: 'wéi',
        examples: [{ text: '魏斯者，桓子之孫也，是為文侯。', at: '周紀一' }] },
      { id: 'wei2-govern', gloss: '治理；主持。', note: '「为政」即执掌政事。',
        reading: 'wéi',
        examples: [{ text: '智襄子為政，與韓康子、魏桓子宴於藍臺。', at: '周紀一' }] },
      { id: 'wei4-for', pos: '介', gloss: '替；给。', note: '读 wèi。「为之报仇」即替他报仇。',
        reading: 'wèi',
        examples: [{ text: '智伯之臣豫讓欲為之報仇', at: '周紀一' }] },
    ],
    variants: ['爲'],
  },
  '諸': {
    pinyin: 'zhū',
    pos: '形',
    uses: [
      { id: 'zhu1-all', gloss: '众；各。', note: '本卷多与「侯」合成「诸侯」，即众诸侯；单用的「诸大夫」是众大夫。',
        examples: [{ text: '無故索地，諸大夫必懼', at: '周紀一' }] },
      { id: 'zhu1-zhiyu', pos: '介', gloss: '「之于」的合音，等于「之于」。', note: '「出诸袖中」即「出之于袖中」。胡注引毛晃曰：奏，进上也。',
        examples: [{ text: '出諸袖中而奏之', at: '周紀一' }] },
    ],
  },
  '侯': {
    pinyin: 'hóu',
    pos: '名',
    uses: [
      { id: 'hou2-lord', gloss: '诸侯；受天子册命的国君。', note: '本卷「诸侯」凡十余见，皆指受周天子册命之国君。',
        examples: [{ text: '是故天子統三公，三公率諸侯', at: '周紀一' }] },
      { id: 'hou2-rank', gloss: '爵位名，公、侯、伯、子、男五等中的第二等。', note: '本卷仅此一见作爵位，与卿、大夫并举。',
        examples: [{ text: '公、侯、卿、大夫是也。', at: '周紀一' }] },
      { id: 'hou2-title', gloss: '诸侯谥称的末字，如文侯、烈侯、景侯。', note: '魏斯为文侯、赵籍为烈侯、韩虔为景侯，皆战国初封之诸侯。',
        examples: [{ text: '魏斯者，桓子之孫也，是為文侯。', at: '周紀一' }] },
    ],
    variants: ['矦'],
  },
  '臣': {
    pinyin: 'chén',
    pos: '名',
    uses: [
      { id: 'chen2-minister', gloss: '臣子；君主手下的官员。', note: '与「君」相对。「悖逆之臣」即叛逆的臣子。',
        examples: [{ text: '不請於天子而自立，則為悖逆之臣。', at: '周紀一' }] },
      { id: 'chen2-self', gloss: '臣下对君主的自称。', note: '司马光自称「臣光」，絺疵对智伯自称「臣」。',
        examples: [{ text: '臣光曰：臣聞天子之職莫大於禮', at: '周紀一' }, { text: '臣見其視臣端而趨疾', at: '周紀一' }] },
    ],
  },
  '光': {
    pinyin: 'guāng',
    pos: '专名',
    uses: [
      { id: 'guang1-sima', gloss: '人名。司马光自称，是《通鉴》史臣议论的发端。', note: '「臣光曰」是司马光在叙事之后发议论的固定开头，全卷两见。本卷未见「光明」义。',
        examples: [{ text: '臣光曰：臣聞天子之職莫大於禮', at: '周紀一' }, { text: '臣光曰：智伯之亡也', at: '周紀一' }] },
    ],
  },
  '曰': {
    pinyin: 'yuē',
    pos: '动',
    uses: [
      { id: 'yue1-say', gloss: '说；说道', note: '引出所说的话，其后多用冒号或引号。全卷四十九见，「臣光曰」「故曰」皆此义。',
        examples: [{ text: '臣光曰：臣聞天子之職莫大於禮', at: '周紀一' }, { text: '故曰：天子之職莫大於禮也。', at: '周紀一' }] },
      { id: 'yue1-call', gloss: '叫做；称为', note: '用于称名，如「长曰伯鲁，幼曰无恤」；「是为某」句式与此相近。',
        examples: [{ text: '長曰伯魯，幼曰無恤。', at: '周紀一' }] },
    ],
  },
  '聞': {
    pinyin: 'wén',
    pos: '动',
    uses: [
      { id: 'wen2-hear', gloss: '听到；听说。', note: '「臣闻」是臣下进言的套语，「智国闻之」是听到这件事。',
        examples: [{ text: '臣聞天子之職莫大於禮', at: '周紀一' }, { text: '智國聞之，諫曰', at: '周紀一' }, { text: '臣聞脣亡則齒寒', at: '周紀一' }] },
    ],
  },
  '天': {
    pinyin: 'tiān',
    pos: '名',
    uses: [
      { id: 'tian1-sky', gloss: '天空；与「地」相对的自然之天', note: '《易经》以乾象天、坤象地，天在这里有尊崇之位。',
        examples: [{ text: '天尊地卑，乾坤定矣', at: '周紀一' }, { text: '猶天地之不可易也', at: '周紀一' }] },
      { id: 'tian1-son-of-heaven', gloss: '「天子」，指周王', note: '「天子之职」即周天子之职守，全卷议论都从这里立论。',
        examples: [{ text: '臣聞天子之職莫大於禮', at: '周紀一' }, { text: '是故天子統三公', at: '周紀一' }] },
      { id: 'tian1-ming', gloss: '天命；天神', note: '「天命之」的「天」是名词作主语；「配天」指配享于天。',
        examples: [{ text: '人歸之，天命之', at: '周紀一' }, { text: '則成湯配天矣', at: '周紀一' }] },
    ],
  },
  '子': {
    pinyin: 'zǐ',
    pos: '名',
    uses: [
      { id: 'zi3-child', gloss: '儿子；孩子。', note: '与「父」相对。',
        examples: [{ text: '趙簡子之子，長曰伯魯，幼曰無恤。', at: '周紀一' }, { text: '立其子浣為趙氏後', at: '周紀一' }] },
      { id: 'zi3-you', pos: '代', gloss: '对人的尊称，等于「您」。', note: '对话中称对方为「子」。',
        examples: [{ text: '子何以知之？', at: '周紀一' }] },
      { id: 'zi3-master', gloss: '加在氏或人名之后的尊称。', note: '如智宣子、赵简子、孔子的「子」，是对贵族、师长的尊称，不是儿子。',
        examples: [{ text: '初，智宣子將以瑤為後。', at: '周紀一' }, { text: '衛君待孔子而為政', at: '周紀一' }] },
    ],
  },
  '之': {
    pinyin: 'zhī',
    pos: '助',
    uses: [
      { id: 'zhi1-of', gloss: '的。', note: '定语的标志，如「天子之职」。本卷「之」用例最多的是这一种。',
        examples: [{ text: '臣聞天子之職莫大於禮', at: '周紀一' }] },
      { id: 'zhi1-pronoun', pos: '代', gloss: '他；它，作宾语。', note: '第三人称代词，指上文已出现的人或事。',
        examples: [{ text: '乃畏奸名犯分而天下共誅之也', at: '周紀一' }] },
      { id: 'zhi1-nominalizer', gloss: '用在主语和谓语之间，取消句子的独立性。', note: '「智伯之亡」即「智伯亡」作主语。本卷未见动词「之」（往）的用例。',
        examples: [{ text: '智伯之亡也，才勝德也', at: '周紀一' }] },
    ],
  },
  '職': {
    pinyin: 'zhí',
    pos: '名',
    uses: [
      { id: 'zhi2-duty', gloss: '职分；职责。', note: '本卷两见，皆作「天子之职」，指天子分内应尽的职责。本卷未见「官职」义。',
        examples: [{ text: '臣聞天子之職莫大於禮', at: '周紀一' }, { text: '天子之職莫大於禮也', at: '周紀一' }] },
    ],
  },
  '莫': {
    pinyin: 'mò',
    pos: '代',
    uses: [
      { id: 'mo4-none', gloss: '没有谁；没有什么。', note: '无定代词。「莫大于礼」即没有什么比礼更大。',
        examples: [{ text: '臣聞天子之職莫大於禮', at: '周紀一' }, { text: '莫敢不奔走而服役者', at: '周紀一' }] },
      { id: 'mo4-not', pos: '副', gloss: '不。', note: '副词，用在动词之前表示否定。',
        examples: [{ text: '而世俗莫之能辨', at: '周紀一' }] },
    ],
  },
  '於': {
    pinyin: 'yú',
    pos: '介',
    uses: [
      { id: 'yu2-at', gloss: '介词，在。', note: '引出动作的处所；「别族于太史」即在太史那里别立族氏。',
        examples: [{ text: '智果別族於太史為輔氏', at: '周紀一' }] },
      { id: 'yu2-to', gloss: '介词，向；对。', note: '引出动作的接受者，「请地于韩康子」即向韩康子索地。',
        examples: [{ text: '智伯請地於韓康子', at: '周紀一' }] },
      { id: 'yu2-than', gloss: '介词，用于比较，相当于「比」。', note: '「莫大于礼」即没有比礼更大的。',
        examples: [{ text: '臣聞天子之職莫大於禮', at: '周紀一' }] },
      { id: 'yu2-by', gloss: '介词，引出动作的主动者，表被动。', note: '「受制于一人」即受一人控制。',
        examples: [{ text: '兆民之眾，受制於一人', at: '周紀一' }] },
    ],
  },
  '禮': {
    pinyin: 'lǐ',
    pos: '名',
    uses: [
      { id: 'li3-order', gloss: '礼制；礼教', note: '指维系尊卑贵贱的典章制度，是全卷议论的纲领：「天子之职莫大于礼」。',
        examples: [{ text: '臣聞天子之職莫大於禮', at: '周紀一' }, { text: '故曰：禮莫大於分也。', at: '周紀一' }] },
      { id: 'li3-rites', gloss: '礼仪；礼节', note: '指具体的礼数、仪节，如「君臣之礼」「先王之礼」。',
        examples: [{ text: '君臣之禮既壞矣', at: '周紀一' }, { text: '先王之禮於斯盡矣。', at: '周紀一' }] },
    ],
  },
  '分': {
    pinyin: 'fēn',
    readings: ['fēn', 'fèn'],
    pos: '名',
    uses: [
      { id: 'fen4-limit', gloss: '名分；职分。', note: '读 fèn。胡注：「分，扶问翻。」这是全卷立论的根本，指君臣上下各守其位。',
        reading: 'fèn',
        examples: [{ text: '禮莫大於分，分莫大於名', at: '周紀一' }, { text: '人歸之，天命之，君臣之分', at: '周紀一' }] },
      { id: 'fen1-divide', pos: '动', gloss: '分割；瓜分。', note: '读 fēn。指瓜分晋国的土地。',
        reading: 'fēn',
        examples: [{ text: '三家分智氏之田', at: '周紀一' }, { text: '今晉大夫暴蔑其君，剖分晉國', at: '周紀一' }] },
    ],
  },
  '名': {
    pinyin: 'míng',
    pos: '名',
    uses: [
      { id: 'ming2-rank', gloss: '名分；名号', note: '这是全卷的骨干概念，与「器」相对，指名位与名号所系的等级。',
        examples: [{ text: '禮莫大於分，分莫大於名', at: '周紀一' }, { text: '名器既亡，則禮安得獨在哉？', at: '周紀一' }] },
      { id: 'ming2-name', gloss: '名称；命名', note: '「名以命之」谓用名号来称呼事物；「正名」谓端正名分。',
        examples: [{ text: '名以命之，器以別之', at: '周紀一' }, { text: '孔子欲先正名', at: '周紀一' }] },
    ],
  },
  '何': {
    pinyin: 'hé',
    pos: '代',
    uses: [
      { id: 'he2-what', gloss: '什么。', note: '「何谓」即什么叫做，用来追问定义。',
        examples: [{ text: '紀綱是也；何謂分？', at: '周紀一' }] },
      { id: 'he2-why', gloss: '为什么。', note: '「何哉」表询问原因。',
        examples: [{ text: '不敢加者，何哉？', at: '周紀一' }] },
      { id: 'he2-where', gloss: '哪里。', note: '「何走」即逃到哪里去。',
        examples: [{ text: '襄子將出，曰：「吾何走乎？」', at: '周紀一' }] },
      { id: 'he2-heyi', gloss: '凭什么；用什么。', note: '「何以」是介宾倒装，即「以何」。',
        examples: [{ text: '主何以臣之言告二子也？', at: '周紀一' }] },
      { id: 'he2-naihe', gloss: '奈何：怎么办；为什么竟。', note: '「奈何」是固定格式，此处作反诘。',
        examples: [{ text: '奈何獨以吾為智氏質乎！', at: '周紀一' }] },
    ],
  },
  '謂': {
    pinyin: 'wèi',
    pos: '动',
    uses: [
      { id: 'wei4-say-to', gloss: '对……说。', note: '「谓……曰」是史书叙言的常式。',
        examples: [{ text: '簡子謂無恤曰', at: '周紀一' }, { text: '絺疵謂智伯曰', at: '周紀一' }] },
      { id: 'wei4-call', gloss: '叫做；称为。', note: '「谓之」即称之为。',
        examples: [{ text: '是故才德全盡謂之聖人', at: '周紀一' }, { text: '夫聰察強毅之謂才', at: '周紀一' }] },
      { id: 'wei4-refer', gloss: '说的就是；指。', note: '用于总结上文所引的话。',
        examples: [{ text: '《書》曰：「一日二日萬幾」，謂此類也', at: '周紀一' }] },
    ],
  },
  '紀': {
    pinyin: 'jì',
    pos: '名',
    uses: [
      { id: 'ji4-order', gloss: '纲纪；法度。', note: '本卷三见，或作「纪纲」，或作「纲纪」，义同，皆指维系上下的法度。',
        examples: [{ text: '紀綱是也；何謂分？', at: '周紀一' }, { text: '周道日衰，綱紀散壞', at: '周紀一' }] },
    ],
  },
  '綱': {
    pinyin: 'gāng',
    pos: '名',
    uses: [
      { id: 'gang1-order', gloss: '提网的总绳；与「纪」连用，指法度、秩序。', note: '本卷三见，或作「纪纲」，或作「纲纪」，义同。',
        examples: [{ text: '紀綱是也；何謂分？', at: '周紀一' }, { text: '綱紀散壞，下陵上替', at: '周紀一' }] },
    ],
  },
  '是': {
    pinyin: 'shì',
    pos: '代',
    uses: [
      { id: 'shi4-this', gloss: '代词，此；这。', note: '复指上文，构成判断：「纪纲是也」即说的就是纪纲。',
        examples: [{ text: '公、侯、卿、大夫是也。', at: '周紀一' }] },
      { id: 'shi4-is', gloss: '用于判断，说明某人即是某位。', note: '「是为景侯」即此人就是韩景侯。',
        examples: [{ text: '武子生虔，是為景侯。', at: '周紀一' }] },
      { id: 'shi4-therefore', gloss: '与「故」「以」合成「是故」「是以」，表因此。', note: '「是故」「是以」都是因此的意思，是文言里最常见的承接语。',
        examples: [{ text: '是故天子統三公', at: '周紀一' }, { text: '是以察者多蔽於才而遺於德', at: '周紀一' }] },
    ],
  },
  '也': {
    pinyin: 'yě',
    pos: '语气',
    uses: [
      { id: 'ye3-judgment', gloss: '句末语气词，表判断', note: '用于「……是也」句式，构成判断句，回答「何谓」之问。',
        examples: [{ text: '紀綱是也；何謂分？', at: '周紀一' }, { text: '公、侯、卿、大夫是也。', at: '周紀一' }] },
      { id: 'ye3-declarative', gloss: '句末语气词，表陈述、论断', note: '用于陈述句末，肯定所言，语气舒缓。全卷五十见，以此类为多。',
        examples: [{ text: '故曰：天子之職莫大於禮也。', at: '周紀一' }, { text: '言君臣之位，猶天地之不可易也。', at: '周紀一' }] },
    ],
  },
  '君': {
    pinyin: 'jūn',
    pos: '名',
    uses: [
      { id: 'jun1-ruler', gloss: '君主；国君。', note: '本卷多指诸侯国的国君，如「逐君」「暴蔑其君」。',
        examples: [{ text: '君臣是也；何謂名？', at: '周紀一' }, { text: '惟器與名，不可以假人，君之所司也', at: '周紀一' }] },
      { id: 'jun1-junzi', gloss: '「君子」指有德的人。', note: '本卷「君子」与「小人」对举，是才德论四个等级之一。',
        examples: [{ text: '德勝才謂之君子', at: '周紀一' }, { text: '凡取人之術，苟不得聖人、君子而與之', at: '周紀一' }] },
    ],
  },
  '公': {
    pinyin: 'gōng',
    pos: '名',
    uses: [
      { id: 'gong1-rank', gloss: '五等爵位的第一等', note: '「公、侯、卿、大夫」是名分上的等级次序。',
        examples: [{ text: '公、侯、卿、大夫是也。', at: '周紀一' }] },
      { id: 'gong1-three-dukes', gloss: '「三公」，天子之下最高的官职', note: '「天子统三公」谓天子统率三公，层层而下。',
        examples: [{ text: '是故天子統三公，三公率諸侯', at: '周紀一' }] },
      { id: 'gong1-title', gloss: '诸侯的尊称，多见于谥号', note: '晋文公、白公都是谥号或称号，不是爵位。',
        examples: [{ text: '昔晉文公有大功於王室', at: '周紀一' }, { text: '白公之於楚，智伯之於晉', at: '周紀一' }] },
    ],
  },
  '卿': {
    pinyin: 'qīng',
    pos: '名',
    uses: [
      { id: 'qing1-minister', gloss: '官名，卿；古代高级官职。', note: '「公、侯、卿、大夫」是等级次序；诸侯之下的重臣称卿。',
        examples: [{ text: '公、侯、卿、大夫是也。', at: '周紀一' }, { text: '諸侯制卿大夫，卿大夫治士庶人。', at: '周紀一' }] },
    ],
  },
  '以': {
    pinyin: 'yǐ',
    pos: '介',
    uses: [
      { id: 'yi3-take', gloss: '把；拿。', note: '介词，把宾语提到动词之前。',
        examples: [{ text: '智宣子將以瑤為後', at: '周紀一' }, { text: '文王序《易》，以乾坤為首', at: '周紀一' }] },
      { id: 'yi3-by', gloss: '凭；靠；用。', note: '引进动作所凭借的事物。',
        examples: [{ text: '以智力相雄長', at: '周紀一' }] },
      { id: 'yi3-because', gloss: '因为。', note: '「诚以」「盖以」的「以」都表原因；「是以」「以是」则当「因此」讲。',
        examples: [{ text: '誠以禮之大節不可亂也', at: '周紀一' }] },
    ],
  },
  '四': {
    pinyin: 'sì',
    pos: '数',
    uses: [
      { id: 'si4-four', gloss: '数词，四。', note: '全卷仅一见，即「四海」之四，泛指天下。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '海': {
    pinyin: 'hǎi',
    pos: '名',
    uses: [
      { id: 'hai3-sea', gloss: '海。「四海」指天下。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '廣': {
    pinyin: 'guǎng',
    pos: '形',
    uses: [
      { id: 'guang3-wide', gloss: '广大；辽阔。', note: '全卷仅一见，无第二处用例，故不举例。「四海之广」指天下地域之广。',
        examples: [] },
    ],
  },
  '兆': {
    pinyin: 'zhào',
    pos: '数',
    uses: [
      { id: 'zhao4-myriad', gloss: '数目单位，百万为兆；「兆民」谓万民、众民', note: '全卷仅一见，无第二处用例，故不举例。「兆民之众」与「四海之广」对举，极言人之多。',
        examples: [] },
    ],
  },
  '民': {
    pinyin: 'mín',
    pos: '名',
    uses: [
      { id: 'min2-people', gloss: '百姓；人民。', note: '本卷或泛指天下之人，或指晋阳一邑之民。',
        examples: [{ text: '夫以四海之廣，兆民之眾', at: '周紀一' }, { text: '尹鐸之所寬也，民必和矣', at: '周紀一' }, { text: '沈竈產鼃，民無叛意', at: '周紀一' }] },
    ],
  },
  '眾': {
    pinyin: 'zhòng',
    pos: '形',
    uses: [
      { id: 'zhong4-many', gloss: '多；众多', note: '本卷最常用义，可作定语也可作谓语。',
        examples: [{ text: '夫以四海之廣，兆民之眾', at: '周紀一' }, { text: '以周之民則不眾於邾、莒', at: '周紀一' }] },
      { id: 'zhong4-people', pos: '名', gloss: '众人；一般人', note: '此为名词用法，与「圣人」相对。',
        examples: [{ text: '眾人之識近，故必待其著而後救之', at: '周紀一' }] },
      { id: 'zhong4-troops', pos: '名', gloss: '部众；兵众', note: '此义指军队，见晋阳之战。',
        examples: [{ text: '大敗智伯之眾。', at: '周紀一' }] },
    ],
    variants: ['衆'],
  },
  '受': {
    pinyin: 'shòu',
    pos: '动',
    uses: [
      { id: 'shou4-endure', gloss: '承受；遭受。', note: '「受制于一人」是被动句式，「于」引出施动者。',
        examples: [{ text: '兆民之眾，受制於一人', at: '周紀一' }] },
      { id: 'shou4-receive', gloss: '接受。', note: '「受天子之命」即接受天子的任命。',
        examples: [{ text: '是受天子之命而為諸侯也', at: '周紀一' }] },
    ],
  },
  '制': {
    pinyin: 'zhì',
    pos: '动',
    uses: [
      { id: 'zhi4-control', gloss: '控制；统属；制伏。', note: '「受制于一人」是受控制，「制支叶」「制卿大夫」是统属。',
        examples: [{ text: '根本之制支葉', at: '周紀一' }, { text: '人得而制之。', at: '周紀一' }] },
      { id: 'zhi4-enact', gloss: '裁制；制定。', note: '「制庶事」与上文「裁群物」对举。',
        examples: [{ text: '裁群物，制庶事', at: '周紀一' }] },
    ],
  },
  '一': {
    pinyin: 'yī',
    pos: '数',
    uses: [
      { id: 'yi1-one', gloss: '数词，一。', note: '本卷七见，或为实数，或与「万」相对。无「统一」「专一」义。',
        examples: [{ text: '兆民之眾，受制於一人', at: '周紀一' }, { text: '其不逮者一也', at: '周紀一' }, { text: '一日二日萬幾', at: '周紀一' }] },
    ],
  },
  '人': {
    pinyin: 'rén',
    pos: '名',
    uses: [
      { id: 'ren2-person', gloss: '人；人们。', note: '本卷最常见的用法，可泛指人，也可指别人。',
        examples: [{ text: '譬之乳狗搏人，人得而制之。', at: '周紀一' }, { text: '受制於一人，雖有絕倫之力', at: '周紀一' }] },
      { id: 'ren2-talent', gloss: '人才；贤才。', note: '《才德论》论「取人之术」，「人」指所取的人才，「失人」即失掉人才。',
        examples: [{ text: '凡取人之術，苟不得聖人', at: '周紀一' }, { text: '此其所以失人也。', at: '周紀一' }] },
    ],
  },
  '雖': {
    pinyin: 'suī',
    pos: '连',
    uses: [
      { id: 'sui1-although', gloss: '连词，虽然。', note: '用于事实上的让步。',
        examples: [{ text: '王人雖微，序於諸侯之上', at: '周紀一' }] },
      { id: 'sui1-even-if', gloss: '连词，即使。', note: '用于假设性的让步。',
        examples: [{ text: '雖有絕倫之力，高世之智', at: '周紀一' }] },
    ],
  },
  '有': {
    pinyin: 'yǒu',
    pos: '动',
    uses: [
      { id: 'you3-have', gloss: '有；具有；领有', note: '表领有或存在。全卷十七见，此举两处。',
        examples: [{ text: '昔仲叔於奚有功於衛', at: '周紀一' }, { text: '天下苟有桓、文之君', at: '周紀一' }] },
      { id: 'you3-there-is', gloss: '有（表存在）；发生', note: '「未有不生于微」谓没有不是从细微处发生的，「有」表存在。',
        examples: [{ text: '夫事未有不生於微而成於著。', at: '周紀一' }] },
    ],
  },
  '絕': {
    pinyin: 'jué',
    pos: '动',
    uses: [
      { id: 'jue2-unsurpassed', gloss: '极；无人能比。', note: '「绝伦」指无人可比。',
        examples: [{ text: '雖有絕倫之力', at: '周紀一' }] },
      { id: 'jue2-extinguish', gloss: '断绝；灭绝。', note: '「泯绝」指覆亡断绝。胡注：「泯，弥忍翻，尽也。」',
        examples: [{ text: '社稷無不泯絕', at: '周紀一' }] },
    ],
    variants: ['絶'],
  },
  '倫': {
    pinyin: 'lún',
    pos: '名',
    uses: [
      { id: 'lun2-peer', gloss: '同辈；匹比', note: '「绝伦之力」谓力气无人可比。',
        examples: [{ text: '雖有絕倫之力，高世之智', at: '周紀一' }] },
      { id: 'lun2-order', gloss: '条理；次序', note: '「粲然有伦」谓上下分明而有条理。',
        examples: [{ text: '然後上下粲然有倫', at: '周紀一' }] },
    ],
  },
  '力': {
    pinyin: 'lì',
    pos: '名',
    uses: [
      { id: 'li4-strength', gloss: '力量；体力。', note: '「绝伦之力」即无人能比的力量；「足力」指脚力。',
        examples: [{ text: '雖有絕倫之力', at: '周紀一' }, { text: '射御足力則賢', at: '周紀一' }] },
      { id: 'li4-effort', gloss: '用力；尽力。', note: '「用力寡而功多」即用力少而收效多。',
        examples: [{ text: '治其微，則用力寡而功多', at: '周紀一' }] },
      { id: 'li4-power', gloss: '实力；兵力。', note: '「力不足」指实力不够；「智力」指智谋与实力。',
        examples: [{ text: '豈其力不足而心不忍哉？', at: '周紀一' }, { text: '則天下以智力相雄長', at: '周紀一' }] },
    ],
  },
  '高': {
    pinyin: 'gāo',
    pos: '形',
    uses: [
      { id: 'gao1-high', gloss: '高，与「卑」相对。', note: '「卑高以陈」谓地卑天高，各得其位。',
        examples: [{ text: '卑高以陳，貴賤位矣', at: '周紀一' }] },
      { id: 'gao1-surpass', pos: '动', gloss: '高出；超过。', note: '「高世之智」谓高出当世的智慧。',
        examples: [{ text: '雖有絕倫之力，高世之智', at: '周紀一' }] },
    ],
  },
  '世': {
    pinyin: 'shì',
    pos: '名',
    uses: [
      { id: 'shi4-world', gloss: '世间；当世之人。', note: '「高世之智」谓高出世人，「世俗」谓世间流俗。',
        examples: [{ text: '雖有絕倫之力，高世之智', at: '周紀一' }, { text: '夫才與德異，而世俗莫之能辨', at: '周紀一' }] },
      { id: 'shi4-generation', gloss: '后代；后世。', note: '「后世」指后代之人。',
        examples: [{ text: '將以愧天下後世之為人臣懷二心者也', at: '周紀一' }] },
    ],
    variants: ['丗'],
  },
  '智': {
    pinyin: 'zhì',
    pos: '专名',
    uses: [
      { id: 'zhi4-clan', gloss: '智氏，晋国大夫的家族，智伯出于此族。', note: '本卷多作氏族名，如智宣子、智襄子、智伯、智果、智国、智宗。',
        examples: [{ text: '初，智宣子將以瑤為後。', at: '周紀一' }, { text: '智伯請地於韓康子', at: '周紀一' }] },
      { id: 'zhi4-wisdom', pos: '名', gloss: '智慧；智谋。', note: '与「力」并举，如「智力」「智不能周」。',
        examples: [{ text: '雖有絕倫之力，高世之智', at: '周紀一' }, { text: '智不能周，力不能勝', at: '周紀一' }] },
    ],
  },
  '敢': {
    pinyin: 'gǎn',
    pos: '动',
    uses: [
      { id: 'gan3-dare', gloss: '助动词，敢；有胆量。', note: '「莫敢不奔走而服役者」用双重否定强调无人敢不听命。',
        examples: [{ text: '莫敢不奔走而服役者', at: '周紀一' }, { text: '我不為難，誰敢興之', at: '周紀一' }] },
      { id: 'gan3-resolute', pos: '形', gloss: '与「果」合成「果敢」，果断勇敢。', note: '这是形容词性的复合词，与「敢于」的助动词用法不同。',
        examples: [{ text: '強毅果敢則賢', at: '周紀一' }] },
    ],
  },
  '不': {
    pinyin: 'bù',
    pos: '副',
    uses: [
      { id: 'bu4-not', gloss: '不；没有', note: '否定副词，修饰动词与形容词。全卷七十三见，此举两处。',
        examples: [{ text: '非名不著，非器不形。', at: '周紀一' }, { text: '莫敢不奔走而服役者', at: '周紀一' }] },
    ],
  },
  '奔': {
    pinyin: 'bēn',
    pos: '动',
    uses: [
      { id: 'ben1-run', gloss: '奔跑；奔走。', note: '全卷仅一见（「奔走」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '走': {
    pinyin: 'zǒu',
    pos: '动',
    uses: [
      { id: 'zou3-run', gloss: '跑；疾行', note: '古汉语的「走」是跑，不是今语的行走。',
        examples: [{ text: '莫敢不奔走而服役者', at: '周紀一' }] },
      { id: 'zou3-flee', gloss: '逃往；投奔', note: '胡三省注：「走，则豆翻，疾趋之也。」「乃走晋阳」谓赵襄子退保晋阳。',
        examples: [{ text: '曰：「吾何走乎？」', at: '周紀一' }, { text: '民必和矣。」乃走晉陽。', at: '周紀一' }] },
    ],
  },
  '而': {
    pinyin: 'ér',
    pos: '连',
    uses: [
      { id: 'er2-and', gloss: '连词，并列或承接。', note: '可译作「并且」「然后」，也可不译。',
        examples: [{ text: '莫敢不奔走而服役者', at: '周紀一' }, { text: '故能謹其微而治之', at: '周紀一' }] },
      { id: 'er2-but', gloss: '连词，表转折：却；但是。', note: '连接相反或相对的两事。',
        examples: [{ text: '而以不仁行之', at: '周紀一' }, { text: '夫繁纓，小物也，而孔子惜之', at: '周紀一' }] },
      { id: 'er2-then', gloss: '「而后」：然后。', note: '表时间先后，先有前事才有后事。',
        examples: [{ text: '故必待其著而後救之', at: '周紀一' }] },
      { id: 'er2-you', pos: '代', gloss: '代词：你；你的。', note: '旧注以「而」为第二人称代词，等于「汝」。此句是赵简子嘱咐无恤。',
        examples: [{ text: '晉國有難，而無以尹鐸為少', at: '周紀一' }] },
    ],
  },
  '服': {
    pinyin: 'fú',
    pos: '动',
    uses: [
      { id: 'fu2-serve', gloss: '服事；服役。', note: '「服役」即服事役使。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '役': {
    pinyin: 'yì',
    pos: '动',
    uses: [
      { id: 'yi4-serve', gloss: '服役；供人驱使。', note: '全卷仅一见，即「服役者」，谓奔走供职之人。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '者': {
    pinyin: 'zhě',
    pos: '助',
    uses: [
      { id: 'zhe3-nominaliser', gloss: '附在动词、形容词之后，构成「……的人」「……的事物」。', note: '本卷最常见的用法，常与「莫」「有」等相呼应。',
        examples: [{ text: '莫敢不奔走而服役者', at: '周紀一' }, { text: '夫德者人之所嚴', at: '周紀一' }] },
      { id: 'zhe3-topic', gloss: '用在主语之后表示停顿，下文加以判断。', note: '「……者，……也」是判断句的常式。',
        examples: [{ text: '魏斯者，桓子之孫也', at: '周紀一' }, { text: '才者，德之資也', at: '周紀一' }] },
      { id: 'zhe3-cause', gloss: '用在结果分句之末，引出下文的原因。', note: '「……者，……故也」即「……，是因为……」。',
        examples: [{ text: '然文、武之祀猶綿綿相屬者', at: '周紀一' }, { text: '然而卒不敢者', at: '周紀一' }] },
    ],
  },
  '豈': {
    pinyin: 'qǐ',
    pos: '副',
    uses: [
      { id: 'qi3-rhetorical', gloss: '副词，表反问：难道。', note: '常与句末的「哉」呼应。',
        examples: [{ text: '豈非以禮為之紀綱哉', at: '周紀一' }, { text: '其為害豈不多哉', at: '周紀一' }] },
      { id: 'qi3-could-it-be', gloss: '与「其」连用，「岂其……哉」，表推测性的反问。', note: '「岂其力不足而心不忍哉」即难道是力量不够、于心不忍吗。',
        examples: [{ text: '豈其力不足而心不忍哉', at: '周紀一' }] },
    ],
  },
  '非': {
    pinyin: 'fēi',
    pos: '副',
    uses: [
      { id: 'fei1-not-be', gloss: '不是；并非', note: '否定判断，常与「乃」对举：「非三晋之坏礼，乃天子自坏之也」。',
        examples: [{ text: '非三晉之壞禮，乃天子自壞之也', at: '周紀一' }] },
      { id: 'fei1-without', pos: '动', gloss: '无；若无', note: '用于假设性的没有：「非名不著」谓没有名就不能显现。',
        examples: [{ text: '非名不著，非器不形。', at: '周紀一' }, { text: '非有桀、紂之暴，湯、武之仁', at: '周紀一' }] },
    ],
  },
  '哉': {
    pinyin: 'zāi',
    pos: '语气',
    uses: [
      { id: 'zai1-exclaim', gloss: '句末语气词，表感叹。', note: '常与「岂」呼应，构成反问式的感叹。',
        examples: [{ text: '糜滅幾盡，豈不哀哉', at: '周紀一' }, { text: '其為害豈不多哉', at: '周紀一' }, { text: '豈非以禮為之紀綱哉', at: '周紀一' }] },
      { id: 'zai1-question', gloss: '句末语气词，表反问或疑问。', note: '与「安得」「何」等疑问词呼应。',
        examples: [{ text: '則禮安得獨在哉', at: '周紀一' }, { text: '不敢加者，何哉', at: '周紀一' }] },
    ],
  },
  '故': {
    pinyin: 'gù',
    pos: '连',
    uses: [
      { id: 'gu4-therefore', gloss: '所以；因此', note: '承接上文推出结论，全卷「故曰」「是故」屡见。',
        examples: [{ text: '故曰：天子之職莫大於禮也。', at: '周紀一' }, { text: '是故天子統三公', at: '周紀一' }] },
      { id: 'gu4-reason', pos: '名', gloss: '缘故；原因', note: '此为名词用法，句末的「故也」就是解释原因的判断。',
        examples: [{ text: '則上下無以相有故也', at: '周紀一' }, { text: '徒以名分尚存故也。', at: '周紀一' }] },
    ],
  },
  '統': {
    pinyin: 'tǒng',
    pos: '动',
    uses: [
      { id: 'tong3-command', gloss: '统领；总领。', note: '全卷仅一见，指天子统领三公，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '三': {
    pinyin: 'sān',
    pos: '数',
    uses: [
      { id: 'san1-three', gloss: '三，数目。', note: '本卷「三版」「三年」「三公」都是实数；「一人三失」的「三」是虚指多次。',
        examples: [{ text: '城不浸者三版', at: '周紀一' }, { text: '是故天子統三公', at: '周紀一' }] },
      { id: 'san1-sanjin', gloss: '「三晋」，指韩、赵、魏三家。', note: '胡注：三家分晋国，时因谓之「三晋」，犹后之三秦、三齐也。',
        examples: [{ text: '故三晉之列於諸侯', at: '周紀一' }] },
    ],
  },
  '率': {
    pinyin: 'shuài',
    pos: '动',
    uses: [
      { id: 'shuai4-lead', gloss: '率领；统率。', note: '全卷仅一见，即「三公率诸侯」。胡注于「帅韩、魏之甲」下云「帅，读曰率」，可与此互证。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '治': {
    pinyin: 'zhì',
    readings: ['zhì', 'chí'],
    pos: '动',
    uses: [
      { id: 'zhi4-govern', gloss: '治理；管理。', note: '胡注：「治，直之翻。」古平声一读 chí；今普通话治理读 zhì。',
        reading: 'chí',
        examples: [{ text: '卿大夫治士庶人', at: '周紀一' }, { text: '故能謹其微而治之', at: '周紀一' }] },
      { id: 'zhi4-peace', pos: '形', gloss: '安定；太平。', note: '胡注：「治，直吏翻。」即今 zhì；「治安」谓上下相保而国家安定。',
        reading: 'zhì',
        examples: [{ text: '上下相保而國家治安', at: '周紀一' }] },
    ],
  },
  '士': {
    pinyin: 'shì',
    pos: '名',
    uses: [
      { id: 'shi4-gentry', gloss: '士人；古代介于大夫与庶人之间的一级。', note: '「士庶人」即士人与庶人。',
        examples: [{ text: '卿大夫治士庶人', at: '周紀一' }] },
      { id: 'shi4-steadfast', gloss: '有节操的人。', note: '「义士」指持守节义之人。',
        examples: [{ text: '而此人欲為報仇，真義士也', at: '周紀一' }] },
    ],
  },
  '庶': {
    pinyin: 'shù',
    pos: '形',
    uses: [
      { id: 'shu4-commoner', pos: '名', gloss: '平民；百姓', note: '「庶人」为名词性成分，取其众多之义，指平民百姓；「士庶人」谓士与庶人。胡注：「治，直之翻。」',
        examples: [{ text: '卿大夫治士庶人', at: '周紀一' }] },
      { id: 'shu4-many', gloss: '众多；各种', note: '「庶事」谓众事、各种事务，与「群物」对举。',
        examples: [{ text: '裁群物，制庶事', at: '周紀一' }] },
    ],
  },
  '貴': {
    pinyin: 'guì',
    pos: '形',
    uses: [
      { id: 'gui4-noble', gloss: '尊贵；地位高。', note: '与「贱」对举。',
        examples: [{ text: '貴以臨賤，賤以承貴', at: '周紀一' }, { text: '卑高以陳，貴賤位矣', at: '周紀一' }] },
      { id: 'gui4-nobles', pos: '名', gloss: '指尊贵的人；尊卑的等级。', note: '「辨贵贱」的「贵贱」是名词性的，指尊卑的等级。',
        examples: [{ text: '夫禮，辨貴賤，序親疏', at: '周紀一' }] },
    ],
  },
  '臨': {
    pinyin: 'lín',
    pos: '动',
    uses: [
      { id: 'lin2-overlook', gloss: '居高临下；此谓以尊位对待', note: '全卷仅一见，无第二处用例，故不举例。「贵以临贱」谓贵者居上而临贱者。',
        examples: [] },
    ],
  },
  '賤': {
    pinyin: 'jiàn',
    pos: '形',
    uses: [
      { id: 'jian4-lowly', gloss: '卑贱；地位低。', note: '与「贵」相对。',
        examples: [{ text: '貴以臨賤，賤以承貴。', at: '周紀一' }, { text: '卑高以陳，貴賤位矣', at: '周紀一' }, { text: '夫禮，辨貴賤，序親疏', at: '周紀一' }] },
    ],
  },
  '承': {
    pinyin: 'chéng',
    pos: '动',
    uses: [
      { id: 'cheng2-serve', gloss: '承奉；在下位者侍奉在上位者。', note: '与上句「贵以临贱」的「临」相对：临是上对下，承是下对上。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '上': {
    pinyin: 'shàng',
    pos: '名',
    uses: [
      { id: 'shang4-superior', gloss: '在上位的人；君上。', note: '与「下」相对，指居上位者；「上下」即上下各级。',
        examples: [{ text: '上之使下，猶心腹之運手足', at: '周紀一' }, { text: '下之事上，猶手足之衛心腹', at: '周紀一' }] },
      { id: 'shang4-above', gloss: '上面；之上（方位）。', note: '「序于诸侯之上」谓位次排在各诸侯之上。',
        examples: [{ text: '序於諸侯之上', at: '周紀一' }] },
    ],
  },
  '使': {
    pinyin: 'shǐ',
    readings: ['shǐ', 'shì'],
    pos: '动',
    uses: [
      { id: 'shi3-send', gloss: '派遣；命令某人去做某事。', note: '读 shǐ，是被派遣的人或所做的事跟在后面。',
        reading: 'shǐ',
        examples: [{ text: '簡子使尹鐸為晉陽。', at: '周紀一' }, { text: '趙襄子使張孟談潛出見二子', at: '周紀一' }] },
      { id: 'shi3-cause', gloss: '致使；使得。', note: '读 shǐ，后面接动作所造成的结果。',
        reading: 'shǐ',
        examples: [{ text: '又寵秩之，使列於諸侯', at: '周紀一' }, { text: '遂使聖賢之後為諸侯者', at: '周紀一' }] },
      { id: 'shi4-envoy', gloss: '出使。', note: '读 shì。胡注：「使，疏吏翻。」絺疵请求出使齐国以避祸。',
        reading: 'shì',
        examples: [{ text: '絺疵請使於齊。', at: '周紀一' }] },
      { id: 'shi4-messenger', pos: '名', gloss: '使者。', note: '读 shì。「使使者」前一字是动词「派遣」（读 shǐ），后一字是名词「使者」，与「出使」同读 shì。',
        reading: 'shì',
        examples: [{ text: '使使者致萬家之邑於智伯', at: '周紀一' }] },
    ],
  },
  '下': {
    pinyin: 'xià',
    pos: '名',
    uses: [
      { id: 'xia4-below', gloss: '方位词，下面。', note: '「桥下」即桥的下面。',
        examples: [{ text: '襄子出，豫讓伏於橋下', at: '周紀一' }] },
      { id: 'xia4-subordinate', gloss: '名，在下位的人；臣下。', note: '与「上」相对：「上之使下」即在上位的支使在下位的。',
        examples: [{ text: '上之使下，猶心腹之運手足', at: '周紀一' }, { text: '綱紀散壞，下陵上替', at: '周紀一' }] },
      { id: 'xia4-tianxia', gloss: '与「天」合成「天下」，指普天之下。', note: '全卷「天下」多见。',
        examples: [{ text: '而天下共誅之也', at: '周紀一' }, { text: '則天下以智力相雄長', at: '周紀一' }] },
    ],
  },
  '猶': {
    pinyin: 'yóu',
    pos: '副',
    uses: [
      { id: 'you2-like', pos: '动', gloss: '如同；好像', note: '表比喻，以彼喻此。全卷四见，此举两处。',
        examples: [{ text: '猶心腹之運手足', at: '周紀一' }, { text: '猶手足之衛心腹', at: '周紀一' }] },
      { id: 'you2-still', gloss: '仍然；还', note: '表情况持续不断：「犹绵绵相属」谓仍然绵延相连。',
        examples: [{ text: '然文、武之祀猶綿綿相屬者', at: '周紀一' }] },
    ],
  },
  '心': {
    pinyin: 'xīn',
    pos: '名',
    uses: [
      { id: 'xin1-heart', gloss: '心；心腹。', note: '「心腹」指要害与亲信，「心动」指心里忽然不安。',
        examples: [{ text: '猶心腹之運手足', at: '周紀一' }, { text: '襄子如廁心動', at: '周紀一' }] },
      { id: 'xin1-mind', gloss: '心意；想法。', note: '「心不忍」指于心不忍，「二心」指不忠之心。',
        examples: [{ text: '豈其力不足而心不忍哉', at: '周紀一' }, { text: '而又求殺之，是二心也', at: '周紀一' }] },
    ],
  },
  '腹': {
    pinyin: 'fù',
    pos: '名',
    uses: [
      { id: 'fu4-belly', gloss: '腹部；此喻君主的近亲与心腹', note: '「心腹」与「手足」对举，喻上下相依；全卷两见同在一句。',
        examples: [{ text: '猶心腹之運手足', at: '周紀一' }, { text: '猶手足之衛心腹', at: '周紀一' }] },
    ],
  },
  '運': {
    pinyin: 'yùn',
    pos: '动',
    uses: [
      { id: 'yun4-move', gloss: '运转；运动。', note: '全卷仅一见，指心腹运转手足，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '手': {
    pinyin: 'shǒu',
    pos: '名',
    uses: [
      { id: 'shou3-hand', gloss: '手。', note: '本卷两处都作「手足」；「民无所措手足」谓百姓不知如何安放手脚。',
        examples: [{ text: '猶心腹之運手足', at: '周紀一' }, { text: '則民無所措手足', at: '周紀一' }] },
    ],
  },
  '足': {
    pinyin: 'zú',
    pos: '名',
    uses: [
      { id: 'zu2-foot', gloss: '脚；手足之足。', note: '本卷「手足」两见、「措手足」一见，皆用本义。',
        examples: [{ text: '上之使下，猶心腹之運手足', at: '周紀一' }, { text: '以為名不正則民無所措手足', at: '周紀一' }] },
      { id: 'zu2-sufficient', pos: '动', gloss: '足够；足以。', note: '「足以」「不足」皆此义，表力量或德行够得上。',
        examples: [{ text: '其勢皆足以逐君而自為', at: '周紀一' }, { text: '豈其力不足而心不忍哉', at: '周紀一' }] },
      { id: 'zu2-worth', pos: '动', gloss: '值得；够得上（多用于反问）。', note: '「又何失人之足患哉」谓又何须忧虑失去人才。',
        examples: [{ text: '又何失人之足患哉', at: '周紀一' }] },
    ],
  },
  '根': {
    pinyin: 'gēn',
    pos: '名',
    uses: [
      { id: 'gen1-root', gloss: '树根；根本。', note: '「本根」即根，与「支叶」相对，用来比喻君上。',
        examples: [{ text: '根本之制支葉', at: '周紀一' }, { text: '支葉之庇本根', at: '周紀一' }] },
    ],
  },
  '本': {
    pinyin: 'běn',
    pos: '名',
    uses: [
      { id: 'ben3-root', gloss: '树根；根本。', note: '「根本」与「支叶」对举，比喻事物的根基；「本根」是同义的倒文。全卷两见都在这一句里。',
        examples: [{ text: '根本之制支葉', at: '周紀一' }, { text: '支葉之庇本根', at: '周紀一' }] },
    ],
  },
  '支': {
    pinyin: 'zhī',
    pos: '名',
    uses: [
      { id: 'zhi1-branch', gloss: '分支；旁支（同「枝」）', note: '「支叶」即枝叶，喻宗族的旁支，与「根本」相对。全卷两见，皆在此句。',
        examples: [{ text: '根本之制支葉', at: '周紀一' }, { text: '支葉之庇本根', at: '周紀一' }] },
    ],
  },
  '葉': {
    pinyin: 'yè',
    pos: '名',
    uses: [
      { id: 'ye4-leaf', gloss: '叶子；枝叶。', note: '全卷两见，都在「枝叶」一词里，与「本根」对举。',
        examples: [{ text: '根本之制支葉', at: '周紀一' }, { text: '支葉之庇本根', at: '周紀一' }] },
    ],
  },
  '事': {
    pinyin: 'shì',
    pos: '名',
    uses: [
      { id: 'shi4-affair', gloss: '事情；事务', note: '本卷多数用例是此义。',
        examples: [{ text: '夫事未有不生於微而成於著。', at: '周紀一' }, { text: '恐事未遂而謀洩', at: '周紀一' }] },
      { id: 'shi4-serve', pos: '动', gloss: '侍奉；事奉', note: '此为动词用法，「事上」即侍奉上位者。',
        examples: [{ text: '下之事上，猶手足之衛心腹', at: '周紀一' }, { text: '臣事趙孟，必得近幸', at: '周紀一' }] },
    ],
  },
  '衛': {
    pinyin: 'wèi',
    pos: '动',
    uses: [
      { id: 'wei4-guard', gloss: '保卫；护卫。', note: '「手足之卫心腹」即手足护卫心腹。',
        examples: [{ text: '猶手足之衛心腹', at: '周紀一' }] },
      { id: 'wei4-state', pos: '专名', gloss: '国名，卫国。', note: '周初所封的诸侯国，在今河南一带；仲叔于奚、孔子都与卫有关。',
        examples: [{ text: '昔仲叔於奚有功於衛', at: '周紀一' }, { text: '衛君待孔子而為政', at: '周紀一' }] },
    ],
    variants: ['衞'],
  },
  '庇': {
    pinyin: 'bì',
    pos: '动',
    uses: [
      { id: 'bi4-shelter', gloss: '遮蔽；庇护。', note: '「支叶之庇本根」谓枝叶遮蔽树根。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '然': {
    pinyin: 'rán',
    pos: '连',
    uses: [
      { id: 'ran2-so', pos: '代', gloss: '这样；如此。', note: '「不然」即不是这样，「知其然」即知道事情是这样；「然则」即既然如此、那么。',
        examples: [{ text: '我心知其然也', at: '周紀一' }, { text: '不然，夫二家豈不利朝夕分趙氏之田', at: '周紀一' }] },
      { id: 'ran2-however', gloss: '然而；可是。', note: '用于转折；本卷「然」「然而」并见。',
        examples: [{ text: '然二子寧亡國而不為者', at: '周紀一' }, { text: '然而卒不敢者，豈其力不足而心不忍哉', at: '周紀一' }] },
      { id: 'ran2-then', gloss: '然后：这样以后。', note: '「然后」是固定结构，表承接。',
        examples: [{ text: '然後能上下相保而國家治安', at: '周紀一' }, { text: '然後上下粲然有倫', at: '周紀一' }] },
      { id: 'ran2-suffix', pos: '助', gloss: '形容词词尾，表状态。', note: '「粲然」即鲜明整齐的样子；本卷此类用法仅一见。',
        examples: [{ text: '上下粲然有倫', at: '周紀一' }] },
    ],
  },
  '後': {
    pinyin: 'hòu',
    pos: '名',
    uses: [
      { id: 'hou4-heir', gloss: '继承人；嗣子。', note: '「为后」「置后」都是立继承人的意思。',
        examples: [{ text: '初，智宣子將以瑤為後。', at: '周紀一' }, { text: '將置後，不知所立。', at: '周紀一' }] },
      { id: 'hou4-after', gloss: '之后；然后。', note: '表示时间或次序在后。胡注于「知所先后」下注「后，户遘翻」。',
        examples: [{ text: '然後上下粲然有倫', at: '周紀一' }, { text: '故必待其著而後救之', at: '周紀一' }] },
      { id: 'hou4-descendants', gloss: '后代；子孙。', note: '「无后」即没有子孙。',
        examples: [{ text: '智伯死無後，而此人欲為報仇', at: '周紀一' }, { text: '遂使聖賢之後為諸侯者', at: '周紀一' }] },
    ],
  },
  '能': {
    pinyin: 'néng',
    pos: '动',
    uses: [
      { id: 'neng2-can', gloss: '助动词，能够。', note: '表有能力做到；「不能」表做不到。本卷无「能力」的名词用法。',
        examples: [{ text: '然後能上下相保而國家治安', at: '周紀一' }, { text: '故能謹其微而治之', at: '周紀一' }, { text: '伯魯不能舉其辭', at: '周紀一' }] },
    ],
  },
  '相': {
    pinyin: 'xiāng',
    readings: ['xiāng', 'xiàng'],
    pos: '副',
    uses: [
      { id: 'xiang1-mutual', gloss: '互相；递相', note: '读平声，表双方交互，如「相保」「相雄长」。',
        reading: 'xiāng',
        examples: [{ text: '然後能上下相保', at: '周紀一' }, { text: '則天下以智力相雄長', at: '周紀一' }] },
      { id: 'xiang4-minister', pos: '名', gloss: '辅佐之臣；国相', note: '读去声，名词用法，指辅相、执政之臣。胡注：「相，息酱翻。」',
        reading: 'xiàng',
        examples: [{ text: '今主一宴而恥人之君相', at: '周紀一' }] },
    ],
  },
  '保': {
    pinyin: 'bǎo',
    pos: '动',
    uses: [
      { id: 'bao3-protect', gloss: '保全；互相保全。', note: '「上下相保」指上与下彼此保全。',
        examples: [{ text: '然後能上下相保而國家治安', at: '周紀一' }] },
      { id: 'bao3-shelter', gloss: '「保障」指可作屏障、赖以保障之地。', note: '尹铎问治晋阳是抽茧丝（取赋税）还是作保障（筑屏障），简子选了后者。',
        examples: [{ text: '以為繭絲乎？抑為保障乎', at: '周紀一' }] },
    ],
  },
  '國': {
    pinyin: 'guó',
    pos: '名',
    uses: [
      { id: 'guo2-state', gloss: '国家；封国', note: '本卷未见国都义的「国」；「剖分晋国」谓瓜分晋国。',
        examples: [{ text: '政亡，則國家從之。', at: '周紀一' }, { text: '今晉大夫暴蔑其君，剖分晉國', at: '周紀一' }] },
      { id: 'guo2-people', gloss: '「国人」，指国中之人', note: '「三家以国人围而灌之」谓三家率领国中之人围城灌水。',
        examples: [{ text: '三家以國人圍而灌之', at: '周紀一' }] },
    ],
  },
  '家': {
    pinyin: 'jiā',
    pos: '名',
    uses: [
      { id: 'jia1-household', gloss: '家户；人家。', note: '「万家之邑」即有一万户的城邑。',
        examples: [{ text: '使使者致萬家之邑於智伯', at: '周紀一' }, { text: '復與之萬家之邑一', at: '周紀一' }] },
      { id: 'jia1-clan', gloss: '卿大夫的家族与封邑。', note: '与「国」相对；「国家」在文中是「国」与「家」两层，不是现代汉语的国家。',
        examples: [{ text: '然後能上下相保而國家治安。', at: '周紀一' }, { text: '政亡，則國家從之。', at: '周紀一' }, { text: '故為國為家者', at: '周紀一' }] },
    ],
  },
  '安': {
    pinyin: 'ān',
    pos: '形',
    uses: [
      { id: 'an1-stable', gloss: '安定；太平。', note: '「国家治安」谓国家安定太平。',
        examples: [{ text: '然後能上下相保而國家治安', at: '周紀一' }] },
      { id: 'an1-how', pos: '副', gloss: '怎么；哪里。', note: '疑问副词，用于反问。「礼安得独在哉」谓礼怎能独自存在。',
        examples: [{ text: '則禮安得獨在哉', at: '周紀一' }] },
      { id: 'an1-yi', pos: '专名', gloss: '安邑，魏氏的都邑。', note: '与下文「平阳」并提，都是引水灌城的去处。',
        examples: [{ text: '以汾水可以灌安邑', at: '周紀一' }] },
    ],
  },
  '文': {
    pinyin: 'wén',
    pos: '专名',
    uses: [
      { id: 'wen2-king', gloss: '人名。周文王，与武王并称「文、武」。', note: '「文王序《易》」「文、武之祀」皆指周文王。',
        examples: [{ text: '文王序《易》，以乾坤為首。', at: '周紀一' }, { text: '然文、武之祀猶綿綿相屬者', at: '周紀一' }] },
      { id: 'wen2-duke', gloss: '人名。晋文公，春秋霸主，与齐桓公并称「桓、文」。', note: '「请隧于襄王」即晋文公事。',
        examples: [{ text: '昔晉文公有大功於王室', at: '周紀一' }, { text: '天下苟有桓、文之君，必奉禮義而征之', at: '周紀一' }] },
      { id: 'wen2-title', gloss: '谥号用字。文侯，即魏斯。', note: '魏斯为魏氏宗主，受封为诸侯。',
        examples: [{ text: '魏斯者，桓子之孫也，是為文侯。', at: '周紀一' }] },
      { id: 'wen2-adorn', pos: '动', gloss: '文饰；文采。', note: '「巧文辩慧」谓善于文饰、能言善辩。本卷未见「文章」「文字」义。',
        examples: [{ text: '巧文辯慧則賢', at: '周紀一' }] },
    ],
  },
  '王': {
    pinyin: 'wáng',
    pos: '名',
    uses: [
      { id: 'wang2-king', gloss: '天子；君王。', note: '「王人」是天子的使者，「王室」是周王室。本卷未见读 wàng 的「称王」义。',
        examples: [{ text: '王人雖微，序於諸侯之上', at: '周紀一' }, { text: '昔晉文公有大功於王室', at: '周紀一' }] },
      { id: 'wang2-title', gloss: '周天子的称号，也用于谥号，如文王、襄王。', note: '文王即周文王，襄王即周襄王。',
        examples: [{ text: '文王序《易》，以乾坤為首。', at: '周紀一' }, { text: '請隧於襄王，襄王不許', at: '周紀一' }] },
    ],
  },
  '序': {
    pinyin: 'xù',
    pos: '动',
    uses: [
      { id: 'xu4-order', gloss: '动，排列次序；使有次序。', note: '「文王序《易》」是为《易》编次；「序亲疏」是排列亲疏的次第。',
        examples: [{ text: '文王序《易》，以乾坤為首。', at: '周紀一' }, { text: '夫禮，辨貴賤，序親疏', at: '周紀一' }] },
      { id: 'xu4-rank', gloss: '动，排在某个位次上。', note: '「序于诸侯之上」即排在诸侯之上。',
        examples: [{ text: '序於諸侯之上', at: '周紀一' }] },
    ],
  },
  '易': {
    pinyin: 'yì',
    pos: '形',
    uses: [
      { id: 'yi4-easy', gloss: '容易', note: '读去声。胡注：「易，以豉翻。」「易亲」「易疏」谓容易亲近、容易疏远。',
        examples: [{ text: '愛者易親，嚴者易疏', at: '周紀一' }] },
      { id: 'yi4-change', pos: '动', gloss: '改变；变易', note: '「不可易」谓不可颠倒改易，此处就君臣之位而言。',
        examples: [{ text: '猶天地之不可易也', at: '周紀一' }] },
      { id: 'yi4-book', pos: '专名', gloss: '《易》，书名，五经之一', note: '专名用法。本卷两见，一为「文王序《易》」，一为引《易》之辞。',
        examples: [{ text: '文王序《易》，以乾坤為首。', at: '周紀一' }] },
    ],
  },
  '乾': {
    pinyin: 'qián',
    pos: '名',
    uses: [
      { id: 'qian2-hexagram', gloss: '《易》卦名，乾卦，象天。', note: '「乾坤」连用指天地；本卷两见，都在论君臣之位的不可易。',
        examples: [{ text: '文王序《易》，以乾坤為首', at: '周紀一' }, { text: '天尊地卑，乾坤定矣', at: '周紀一' }] },
    ],
  },
  '坤': {
    pinyin: 'kūn',
    pos: '名',
    uses: [
      { id: 'kun1-earth', gloss: '八卦之一，象地；与「乾」相对', note: '《易》以乾坤为首，坤是纯阴之卦。',
        examples: [{ text: '文王序《易》，以乾坤為首。', at: '周紀一' }, { text: '天尊地卑，乾坤定矣', at: '周紀一' }] },
    ],
  },
  '首': {
    pinyin: 'shǒu',
    pos: '名',
    uses: [
      { id: 'shou3-first', gloss: '首位；开头。', note: '「以乾坤为首」即把乾坤两卦列在首位。',
        examples: [{ text: '文王序《易》，以乾坤為首。', at: '周紀一' }] },
      { id: 'shou3-dagger', gloss: '「匕首」的首；短剑名。', note: '匕首是短剑，头像匕，故称匕首。',
        examples: [{ text: '挾匕首，入襄子宮中塗廁', at: '周紀一' }] },
    ],
  },
  '孔': {
    pinyin: 'kǒng',
    pos: '专名',
    uses: [
      { id: 'kong3-confucius', gloss: '孔子，名丘，春秋鲁国人。', note: '本卷「孔」只作姓氏用，都见于「孔子」；无「孔穴」义。',
        examples: [{ text: '衛君待孔子而為政', at: '周紀一' }, { text: '孔子以為不如多與之邑', at: '周紀一' }] },
    ],
  },
  '繫': {
    pinyin: 'xì',
    pos: '动',
    uses: [
      { id: 'xi4-attach', gloss: '系辞；附系文辞于卦爻之下。', note: '全卷仅一见，即「孔子系之曰」，谓孔子为《易》作系辞。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '尊': {
    pinyin: 'zūn',
    pos: '动',
    uses: [
      { id: 'zun1-honour', gloss: '尊崇；使地位高。', note: '与「抑」相对：《春秋》抑诸侯而尊周室。',
        examples: [{ text: '《春秋》抑諸侯，尊周室', at: '周紀一' }] },
      { id: 'zun1-high', pos: '形', gloss: '高（与「卑」相对）。', note: '这一义是形容词，用于天与地的对比。',
        examples: [{ text: '天尊地卑，乾坤定矣', at: '周紀一' }] },
    ],
  },
  '地': {
    pinyin: 'dì',
    pos: '名',
    uses: [
      { id: 'di4-heaven-earth', gloss: '名，与「天」相对的地。', note: '「天尊地卑」以天地比喻君臣。',
        examples: [{ text: '天尊地卑，乾坤定矣', at: '周紀一' }] },
      { id: 'di4-land', gloss: '名，土地；领地。', note: '全卷多指可以割让、赐予的土地。',
        examples: [{ text: '叔父有地而隧', at: '周紀一' }, { text: '是故以周之地則不大於曹、滕', at: '周紀一' }] },
    ],
  },
  '卑': {
    pinyin: 'bēi',
    pos: '形',
    uses: [
      { id: 'bei1-low', gloss: '低；卑下', note: '与「尊」「高」相对，本卷两见皆在孔子系《易》之辞中。',
        examples: [{ text: '天尊地卑，乾坤定矣', at: '周紀一' }, { text: '卑高以陳，貴賤位矣', at: '周紀一' }] },
    ],
  },
  '定': {
    pinyin: 'dìng',
    pos: '动',
    uses: [
      { id: 'ding4-settle', gloss: '确定；安定。', note: '全卷仅一见（「乾坤定矣」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '矣': {
    pinyin: 'yǐ',
    pos: '语气',
    uses: [
      { id: 'yi3-final', gloss: '句末语气词，表陈述、肯定的语气', note: '现代汉语没有对应的虚词。',
        examples: [{ text: '先王之禮於斯盡矣。', at: '周紀一' }, { text: '卑高以陳，貴賤位矣。', at: '周紀一' }, { text: '禮之大體，什喪七八矣。', at: '周紀一' }] },
      { id: 'yi3-er-yi', gloss: '与「而已」连用，表限止，犹「罢了」', note: '全卷只有「当守节伏死而已矣」一处是这种连用。',
        examples: [{ text: '君臣之分，當守節伏死而已矣。', at: '周紀一' }] },
    ],
  },
  '陳': {
    pinyin: 'chén',
    pos: '动',
    uses: [
      { id: 'chen2-display', gloss: '陈列；排列。', note: '全卷仅一见，指天地卑高既已陈列，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '位': {
    pinyin: 'wèi',
    pos: '名',
    uses: [
      { id: 'wei4-position', gloss: '位置；地位；名位。', note: '「贵贱位矣」谓贵贱各安其位；「君臣之位」谓君臣的名位。',
        examples: [{ text: '卑高以陳，貴賤位矣', at: '周紀一' }, { text: '言君臣之位，猶天地之不可易也', at: '周紀一' }] },
    ],
  },
  '言': {
    pinyin: 'yán',
    pos: '动',
    uses: [
      { id: 'yan2-say', gloss: '说；说明。', note: '「何以言之」的言同此义，句仅五字，不足六字之例，故不举为例。',
        examples: [{ text: '言君臣之位，猶天地之不可易也', at: '周紀一' }] },
      { id: 'yan2-words', pos: '名', gloss: '话；言语（名词）。', note: '「絺疵之言」「臣之言」皆指所说的话。',
        examples: [{ text: '智伯以絺疵之言告二子', at: '周紀一' }, { text: '主何以臣之言告二子也？', at: '周紀一' }] },
    ],
  },
  '可': {
    pinyin: 'kě',
    pos: '动',
    uses: [
      { id: 'ke3-can', gloss: '可以；能够。', note: '本卷十一见，多与「不」「得」连用。',
        examples: [{ text: '猶天地之不可易也', at: '周紀一' }, { text: '雖欲勿許，其可得乎？', at: '周紀一' }] },
    ],
  },
  '春': {
    pinyin: 'chūn',
    pos: '专名',
    uses: [
      { id: 'chun1-spring', gloss: '书名用字。《春秋》，鲁国编年史，孔子所修。', note: '全卷仅一见，无第二处用例，故不举例；且仅见于书名《春秋》。本卷未见「春季」义。',
        examples: [] },
    ],
  },
  '秋': {
    pinyin: 'qiū',
    pos: '专名',
    uses: [
      { id: 'qiu1-chunqiu', gloss: '《春秋》，书名，儒家五经之一', note: '全卷仅一见，无第二处用例，故不举例。此处为书名《春秋》的一半，割裂举例则不成词，故从阙。',
        examples: [] },
    ],
  },
  '抑': {
    pinyin: 'yì',
    pos: '动',
    uses: [
      { id: 'yi4-restrain', gloss: '抑制；压低。', note: '「抑诸侯」指《春秋》压低诸侯的僭越，以尊周室。',
        examples: [{ text: '《春秋》抑諸侯', at: '周紀一' }] },
      { id: 'yi4-or', pos: '连', gloss: '或者；还是。', note: '连词，表选择，「抑为保障乎」即还是作保障呢。',
        examples: [{ text: '以為繭絲乎？抑為保障乎', at: '周紀一' }] },
    ],
  },
  '周': {
    pinyin: 'zhōu',
    pos: '专名',
    uses: [
      { id: 'zhou1-dynasty', gloss: '朝代名，此指东周王室', note: '全卷议论都环绕周天子与周室。',
        examples: [{ text: '《春秋》抑諸侯，尊周室', at: '周紀一' }, { text: '幽、厲失德，周道日衰', at: '周紀一' }] },
      { id: 'zhou1-book', gloss: '《周书》，《尚书》的一部分', note: '任章引《周书》以劝魏桓子。',
        examples: [{ text: '《周書》曰：『將欲敗之', at: '周紀一' }] },
      { id: 'zhou1-complete', pos: '动', gloss: '周全；完备', note: '此义为动词，「智不能周」谓智虑不能周全；本卷只此一见。',
        examples: [{ text: '智不能周，力不能勝', at: '周紀一' }] },
    ],
  },
  '室': {
    pinyin: 'shì',
    pos: '名',
    uses: [
      { id: 'shi4-royal-house', gloss: '王室；朝廷。', note: '「周室」「王室」都指周天子的朝廷。',
        examples: [{ text: '《春秋》抑諸侯，尊周室', at: '周紀一' }, { text: '昔晉文公有大功於王室', at: '周紀一' }, { text: '或者以為當是之時，周室微弱', at: '周紀一' }] },
    ],
  },
  '微': {
    pinyin: 'wēi',
    pos: '形',
    uses: [
      { id: 'wei1-slight', gloss: '微弱；微小；细微。', note: '本卷既指人的地位微贱（王人虽微），也指事情的细微开端（生于微）。',
        examples: [{ text: '王人雖微，序於諸侯之上', at: '周紀一' }, { text: '夫事未有不生於微而成於著', at: '周紀一' }] },
      { id: 'wei1-weizi', pos: '专名', gloss: '微子，商纣王的庶兄。', note: '胡注引《史记》述帝乙欲立微子启而太史争之之事。',
        examples: [{ text: '以微子而代紂', at: '周紀一' }] },
    ],
  },
  '見': {
    pinyin: 'jiàn',
    readings: ['jiàn', 'xiàn'],
    pos: '动',
    uses: [
      { id: 'jian4-see', gloss: '看见；见到。', note: '读 jiàn。「臣见其视臣端而趋疾」即我看见他看我时目光端正、步履急促。',
        reading: 'jiàn',
        examples: [{ text: '臣見其視臣端而趨疾', at: '周紀一' }, { text: '行見其友，其友識之', at: '周紀一' }] },
      { id: 'jian4-meet', gloss: '会见；拜见。', note: '读 jiàn。「潜出见二子」谓张孟谈潜出城会见韩、魏二子。',
        reading: 'jiàn',
        examples: [{ text: '趙襄子使張孟談潛出見二子', at: '周紀一' }] },
      { id: 'jian4-perceive', gloss: '看出；可见。', note: '读 jiàn。「以是见圣人于君臣之际」谓由此可见圣人对君臣之际的用心。',
        reading: 'jiàn',
        examples: [{ text: '以是見聖人於君臣之際', at: '周紀一' }] },
      { id: 'xian4-appear', gloss: '通「现」，显现；显露。', note: '读 xiàn。胡注：「见，贤遍翻，发见也，著也，形也。」',
        reading: 'xiàn',
        examples: [{ text: '怨豈在明，不見是圖', at: '周紀一' }] },
    ],
  },
  '聖': {
    pinyin: 'shèng',
    pos: '名',
    uses: [
      { id: 'sheng4-sage', gloss: '圣人；才德极高的人。', note: '《礼论》以圣人为能见微知著的人，《才德论》则定义为「才德全尽」。',
        examples: [{ text: '聖人之慮遠，故能謹其微而治之', at: '周紀一' }, { text: '才德全盡謂之聖人', at: '周紀一' }] },
    ],
  },
  '際': {
    pinyin: 'jì',
    pos: '名',
    uses: [
      { id: 'ji4-between', gloss: '交界；彼此之间。', note: '全卷仅一见，无第二处用例，故不举例。「君臣之际」指君臣相与之间。',
        examples: [] },
    ],
  },
  '未': {
    pinyin: 'wèi',
    pos: '副',
    uses: [
      { id: 'wei4-not-yet', gloss: '没有；不曾', note: '否定副词，表未曾发生或未成之事。全卷四见，此举两处；「未尝不惓惓」是双重否定。',
        examples: [{ text: '未嘗不惓惓也', at: '周紀一' }, { text: '恐事未遂而謀洩', at: '周紀一' }] },
    ],
  },
  '嘗': {
    pinyin: 'cháng',
    pos: '副',
    uses: [
      { id: 'chang2-ever', gloss: '曾经。', note: '全卷仅一见（「未尝不惓惓也」），无第二处用例，故不举例。胡注：「惓惓，犹言勤勤也。」',
        examples: [] },
    ],
    variants: ['甞'],
  },
  '惓': {
    pinyin: 'quán',
    pos: '形',
    uses: [
      { id: 'quan2-earnest', gloss: '恳切；勤恳', note: '胡三省注：「惓惓，犹言勤勤也。」全卷两见都在同一句的「惓惓」里。',
        examples: [{ text: '未嘗不惓惓也', at: '周紀一' }] },
    ],
  },
  '桀': {
    pinyin: 'jié',
    pos: '专名',
    uses: [
      { id: 'jie2-king', gloss: '人名，夏朝末代君主桀。', note: '全卷仅一见，与商纣并举为暴君，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '紂': {
    pinyin: 'zhòu',
    pos: '专名',
    uses: [
      { id: 'zhou4-king', gloss: '商朝末代君主帝辛，谥纣。', note: '本卷以「桀、纣」为暴君的代表，与「汤、武」对举。',
        examples: [{ text: '非有桀、紂之暴', at: '周紀一' }, { text: '以微子而代紂', at: '周紀一' }] },
    ],
  },
  '暴': {
    pinyin: 'bào',
    pos: '名',
    uses: [
      { id: 'bao4-cruelty', gloss: '暴虐；暴行。', note: '「桀、纣之暴」指暴虐之政，「决其暴」指逞其暴行。',
        examples: [{ text: '非有桀、紂之暴，湯、武之仁', at: '周紀一' }, { text: '勇足以決其暴', at: '周紀一' }] },
      { id: 'bao4-outrage', pos: '动', gloss: '欺凌；轻蔑。', note: '「暴蔑其君」即欺凌轻蔑其君。',
        examples: [{ text: '今晉大夫暴蔑其君', at: '周紀一' }] },
    ],
  },
  '湯': {
    pinyin: 'tāng',
    pos: '专名',
    uses: [
      { id: 'tang1-king', gloss: '商汤，商朝的开国君主，又称成汤。', note: '本卷两见，都指商汤；「热水」义本卷未见。',
        examples: [{ text: '非有桀、紂之暴，湯、武之仁', at: '周紀一' }, { text: '則成湯配天矣', at: '周紀一' }] },
    ],
  },
  '武': {
    pinyin: 'wǔ',
    pos: '专名',
    uses: [
      { id: 'wu3-king-wu', gloss: '专名。周武王。', note: '与「汤」并举，指商汤、周武王；「文、武之祀」则指周文王、周武王。',
        examples: [{ text: '非有桀、紂之暴，湯、武之仁', at: '周紀一' }, { text: '然文、武之祀猶綿綿相屬者', at: '周紀一' }] },
      { id: 'wu3-posthumous', gloss: '专名。谥号用字：韩武子启章。', note: '韩武子是韩康子之子、韩虔之父。',
        examples: [{ text: '韓康子生武子啟章', at: '周紀一' }] },
    ],
  },
  '仁': {
    pinyin: 'rén',
    pos: '名',
    uses: [
      { id: 'ren2-benevolence', gloss: '仁爱；仁德', note: '儒家德目。本卷三见，或指汤、武之仁，或以「不仁」状智伯之失。',
        examples: [{ text: '非有桀、紂之暴，湯、武之仁', at: '周紀一' }, { text: '以不仁行之，其誰能待之', at: '周紀一' }] },
    ],
  },
  '歸': {
    pinyin: 'guī',
    pos: '动',
    uses: [
      { id: 'gui1-submit', gloss: '归附；归向。', note: '「人归之」指人心归附。',
        examples: [{ text: '湯、武之仁，人歸之', at: '周紀一' }] },
      { id: 'gui1-return', gloss: '归宿；归依。', note: '「必以为归」指一定以晋阳为归宿。',
        examples: [{ text: '無以晉陽為遠，必以為歸', at: '周紀一' }] },
    ],
  },
  '當': {
    pinyin: 'dāng',
    pos: '动',
    uses: [
      { id: 'dang1-should', gloss: '应当；应该', note: '「当守节伏死」谓应当守节而死。',
        examples: [{ text: '君臣之分，當守節伏死而已矣', at: '周紀一' }] },
      { id: 'dang1-at-time', gloss: '正值；在某个时候', note: '「当是之时」是时间词，「当」后带宾语「是时」。',
        examples: [{ text: '或者以為當是之時', at: '周紀一' }] },
    ],
  },
  '守': {
    pinyin: 'shǒu',
    pos: '动',
    uses: [
      { id: 'shou3-keep', gloss: '守持；保持。', note: '「守节」即守住臣节；「守其名分」即守住名分。',
        examples: [{ text: '君臣之分，當守節伏死而已矣。', at: '周紀一' }, { text: '蓋以周之子孫尚能守其名分故也', at: '周紀一' }] },
      { id: 'shou3-defend', gloss: '防守；守卫。', note: '「守之」即守城；「守堤之吏」即看守堤防的官吏。',
        examples: [{ text: '又斃死以守之', at: '周紀一' }, { text: '襄子夜使人殺守堤之吏', at: '周紀一' }] },
    ],
  },
  '節': {
    pinyin: 'jié',
    pos: '名',
    uses: [
      { id: 'jie2-integrity', gloss: '节操；原则。', note: '「守节伏死」谓守住节操、伏地而死；「礼之大节」谓礼的大原则。',
        examples: [{ text: '當守節伏死而已矣', at: '周紀一' }, { text: '誠以禮之大節不可亂也', at: '周紀一' }] },
    ],
  },
  '伏': {
    pinyin: 'fú',
    pos: '动',
    uses: [
      { id: 'fu2-die', gloss: '伏死：就死；甘心受死。', note: '「当守节伏死而已矣」谓为臣当守节而死。',
        examples: [{ text: '當守節伏死而已矣', at: '周紀一' }] },
      { id: 'fu2-hide', gloss: '潜伏；藏身。', note: '「豫让伏于桥下」谓豫让藏身在桥下。',
        examples: [{ text: '豫讓伏於橋下', at: '周紀一' }] },
    ],
  },
  '死': {
    pinyin: 'sǐ',
    pos: '动',
    uses: [
      { id: 'si3-die', gloss: '死；死亡。', note: '本卷三见，或指臣为君死节，或指人死无后。',
        examples: [{ text: '又斃死以守之，其誰與我', at: '周紀一' }, { text: '智伯死無後，而此人欲為報仇', at: '周紀一' }] },
    ],
  },
  '已': {
    pinyin: 'yǐ',
    pos: '副',
    uses: [
      { id: 'yi3-eryi', pos: '语气', gloss: '与「而」合成「而已」，表限止：罢了。', note: '句末「而已矣」是两层语气叠用。',
        examples: [{ text: '當守節伏死而已矣', at: '周紀一' }] },
      { id: 'yi3-already', gloss: '副，已经。', note: '「既已」连用，强调动作已经完成。',
        examples: [{ text: '求其簡，已失之矣', at: '周紀一' }, { text: '既已委質為臣', at: '周紀一' }] },
    ],
  },
  '代': {
    pinyin: 'dài',
    pos: '动',
    uses: [
      { id: 'dai4-replace', gloss: '替代；取代', note: '「代纣」谓取代纣王；「代德」谓足以上代周室之德。',
        examples: [{ text: '是故以微子而代紂', at: '周紀一' }, { text: '未有代德而有二王', at: '周紀一' }] },
      { id: 'dai4-place', pos: '专名', gloss: '地名。代，战国时国名，在今河北蔚县一带', note: '赵襄子灭代而有其地，故封伯鲁之子于此，号代成君。胡注：「代国在夏屋句注之北，赵襄子灭之。」',
        examples: [{ text: '封伯魯之子於代', at: '周紀一' }] },
    ],
  },
  '則': {
    pinyin: 'zé',
    pos: '连',
    uses: [
      { id: 'ze2-then', gloss: '就；那么。', note: '连词，表承接或推论，本卷最常见。',
        examples: [{ text: '政亡，則國家從之', at: '周紀一' }, { text: '治其微，則用力寡而功多', at: '周紀一' }, { text: '名器既亡，則禮安得獨在哉', at: '周紀一' }] },
      { id: 'ze2-contrast', gloss: '却；倒是。', note: '用在主语之后，表转折或强调。',
        examples: [{ text: '是故以周之地則不大於曹、滕', at: '周紀一' }] },
    ],
  },
  '成': {
    pinyin: 'chéng',
    pos: '动',
    uses: [
      { id: 'cheng2-complete', gloss: '完成；成就', note: '「成于著」谓在显著处完成。',
        examples: [{ text: '夫事未有不生於微而成於著。', at: '周紀一' }, { text: '而欲為危難不可成之事乎？', at: '周紀一' }] },
      { id: 'cheng2-tang', pos: '专名', gloss: '成汤，商朝开国之君', note: '此为专名用字；同卷的「代成君」也是称号。',
        examples: [{ text: '則成湯配天矣', at: '周紀一' }] },
    ],
  },
  '配': {
    pinyin: 'pèi',
    pos: '动',
    uses: [
      { id: 'pei4-match', gloss: '配享；与天相配。', note: '全卷仅一见，指商汤配天而受祭，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '季': {
    pinyin: 'jì',
    pos: '专名',
    uses: [
      { id: 'ji4-zha', gloss: '季札，吴王寿梦之子。', note: '本卷借他让国之事说明礼不可乱。本卷「季」只作人名、氏名，无「季节」「末年」义。',
        examples: [{ text: '以季札而君吳', at: '周紀一' }] },
      { id: 'ji4-shi', gloss: '季氏，鲁国大夫之家。', note: '胡注以「鲁三家」与晋六卿、齐田氏并举。',
        examples: [{ text: '至於季氏之於魯', at: '周紀一' }] },
    ],
  },
  '札': {
    pinyin: 'zhá',
    pos: '专名',
    uses: [
      { id: 'zha2-jizha', gloss: '人名。季札，吴国公子，吴王寿梦之少子。', note: '全卷仅一见，即「以季札而君吴」，谓若季札为吴君，则太伯之祀不至断绝。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '吳': {
    pinyin: 'wú',
    pos: '专名',
    uses: [
      { id: 'wu2-state', gloss: '国名。周初太伯所建，地在今江苏一带。', note: '全卷仅一见，无第二处用例，故不举例。此句假设季札为吴君。',
        examples: [] },
    ],
  },
  '太': {
    pinyin: 'tài',
    pos: '形',
    uses: [
      { id: 'tai4-great', gloss: '大；对居首者的尊称。', note: '胡注引范宁：太者，善大之称。「太伯」是周太王长子、吴国始祖。',
        examples: [{ text: '則太伯血食矣', at: '周紀一' }] },
      { id: 'tai4-office', gloss: '官名用字：「太史」，掌史之官。', note: '「别族于太史」是说在太史那里别立族氏。',
        examples: [{ text: '智果別族於太史為輔氏', at: '周紀一' }] },
    ],
  },
  '伯': {
    pinyin: 'bó',
    pos: '专名',
    uses: [
      { id: 'bo2-zhibo', gloss: '人名。智伯，名瑶，智宣子之子，谥襄子。', note: '本卷出现最多的人名，晋阳之战败死，其亡是全卷「才胜德」之戒。',
        examples: [{ text: '智伯請地於韓康子', at: '周紀一' }, { text: '臣光曰：智伯之亡也', at: '周紀一' }] },
      { id: 'bo2-bolu', gloss: '人名。伯鲁，赵简子之长子。', note: '赵简子本欲立之而终立无恤；襄子后以伯鲁之不立为憾，不肯置后。',
        examples: [{ text: '長曰伯魯，幼曰無恤。', at: '周紀一' }, { text: '襄子為伯魯之不立也', at: '周紀一' }] },
      { id: 'bo2-taibo', gloss: '人名。太伯，周太王之长子，吴国立国之君。', note: '胡注引范宁：「太者，善大之称；伯者，长也。」',
        examples: [{ text: '則太伯血食矣', at: '周紀一' }] },
    ],
  },
  '血': {
    pinyin: 'xuè',
    pos: '名',
    uses: [
      { id: 'xue4-blood', gloss: '血；牲血。', note: '全卷仅一见（「血食」），无第二处用例，故不举例。胡注：「宗庙之祭用牲，故曰血食。」',
        examples: [] },
    ],
  },
  '食': {
    pinyin: 'shí',
    pos: '动',
    uses: [
      { id: 'shi2-eat', gloss: '吃', note: '「人马相食」谓围城中人马互相为食。',
        examples: [{ text: '城不沒者三版，人馬相食', at: '周紀一' }] },
      { id: 'shi2-sacrifice', gloss: '「血食」，指受宗庙祭祀', note: '胡三省注：宗庙之祭用牲，故曰血食。',
        examples: [{ text: '則太伯血食矣', at: '周紀一' }] },
    ],
  },
  '二': {
    pinyin: 'èr',
    pos: '数',
    uses: [
      { id: 'er4-two', gloss: '数目二；两个。', note: '「二子」指伯鲁与无恤。',
        examples: [{ text: '然二子寧亡國而不為者', at: '周紀一' }, { text: '乃書訓戒之辭於二簡', at: '周紀一' }, { text: '一日二日萬幾', at: '周紀一' }] },
      { id: 'er4-two-minds', gloss: '「二心」：不专一，怀有二意。', note: '指臣事其主而又有杀主之心。',
        examples: [{ text: '而又求殺之，是二心也', at: '周紀一' }, { text: '將以愧天下後世之為人臣懷二心者也', at: '周紀一' }] },
    ],
  },
  '寧': {
    pinyin: 'nìng',
    pos: '副',
    uses: [
      { id: 'ning4-rather', gloss: '宁可；宁愿。', note: '读 nìng。「宁亡国而不为」谓宁可亡国也不做。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['寜'],
  },
  '亡': {
    pinyin: 'wáng',
    pos: '动',
    uses: [
      { id: 'wang2-perish', gloss: '灭亡；使灭亡。', note: '「亡国」「亡人国」皆此义。本卷未见「逃亡」义。',
        examples: [{ text: '然二子寧亡國而不為者', at: '周紀一' }, { text: '吾乃今知水可以亡人國也', at: '周紀一' }] },
      { id: 'wang2-lose', gloss: '失去；消亡。', note: '「名器既亡」「政亡」指名器、政令丧失。',
        examples: [{ text: '名器既亡，則禮安得獨在哉', at: '周紀一' }, { text: '政亡，則國家從之', at: '周紀一' }] },
      { id: 'wang2-none', gloss: '通「无」，没有。', note: '「才德兼亡」即才与德都没有。此义旧读 wú，今从通行读 wáng。',
        examples: [{ text: '才德兼亡謂之愚人', at: '周紀一' }] },
    ],
  },
  '誠': {
    pinyin: 'chéng',
    pos: '副',
    uses: [
      { id: 'cheng2-indeed', gloss: '实在；的确。', note: '本卷两见，都作「诚以……」，用来点出真正的原因。',
        examples: [{ text: '誠以禮之大節不可亂也', at: '周紀一' }, { text: '誠以名器既亂', at: '周紀一' }] },
    ],
  },
  '亂': {
    pinyin: 'luàn',
    pos: '动',
    uses: [
      { id: 'luan4-disrupt', gloss: '动，扰乱；破坏。', note: '「礼之大节不可乱」即礼的大节不可败坏。',
        examples: [{ text: '誠以禮之大節不可亂也', at: '周紀一' }] },
      { id: 'luan4-disorder', gloss: '动、形，混乱；溃乱。', note: '「名器既乱」指名器紊乱；「救水而乱」指军队因救水而溃乱。',
        examples: [{ text: '誠以名器既亂', at: '周紀一' }, { text: '智伯軍救水而亂', at: '周紀一' }] },
      { id: 'luan4-rebellious', pos: '形', gloss: '形，叛乱的；作乱的。', note: '「乱臣」与「败子」对举。',
        examples: [{ text: '國之亂臣，家之敗子', at: '周紀一' }] },
    ],
  },
  '辨': {
    pinyin: 'biàn',
    pos: '动',
    uses: [
      { id: 'bian4-distinguish', gloss: '辨别；区分', note: '本卷两见，一为礼之「辨贵贱」，一为世俗之不能辨才德。',
        examples: [{ text: '夫禮，辨貴賤，序親疏', at: '周紀一' }, { text: '而世俗莫之能辨', at: '周紀一' }] },
    ],
  },
  '親': {
    pinyin: 'qīn',
    pos: '动',
    uses: [
      { id: 'qin1-close', gloss: '亲近；亲密。', note: '「相亲」指彼此亲近，「易亲」指容易亲近。',
        examples: [{ text: '愛者易親，嚴者易疏', at: '周紀一' }, { text: '彼驕而輕敵，此懼而相親', at: '周紀一' }] },
      { id: 'qin1-kin', pos: '名', gloss: '亲属；亲疏的亲。', note: '「序亲疏」指排定亲疏的次序。',
        examples: [{ text: '夫禮，辨貴賤，序親疏', at: '周紀一' }] },
    ],
  },
  '疏': {
    pinyin: 'shū',
    pos: '形',
    uses: [
      { id: 'shu1-distant', gloss: '关系远的；不亲近', note: '「序亲疏」谓排列亲疏的次序。',
        examples: [{ text: '夫禮，辨貴賤，序親疏', at: '周紀一' }] },
      { id: 'shu1-alienate', pos: '动', gloss: '疏远；被疏远', note: '此为动词用法，「严者易疏」谓威严的人容易被人疏远。',
        examples: [{ text: '愛者易親，嚴者易疏', at: '周紀一' }] },
    ],
    variants: ['踈'],
  },
  '裁': {
    pinyin: 'cái',
    pos: '动',
    uses: [
      { id: 'cai2-judge', gloss: '裁断；裁制。', note: '全卷仅一见，指礼能裁制万物，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '群': {
    pinyin: 'qún',
    pos: '形',
    uses: [
      { id: 'qun2-many', gloss: '众；各种。', note: '「裁群物」谓裁度众物。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['羣'],
  },
  '物': {
    pinyin: 'wù',
    pos: '名',
    uses: [
      { id: 'wu4-thing', gloss: '事物；万物。', note: '「裁群物」即裁断各种事物。',
        examples: [{ text: '夫禮，辨貴賤，序親疏，裁群物，制庶事。', at: '周紀一' }, { text: '夫繁纓，小物也', at: '周紀一' }] },
      { id: 'wu4-matter', gloss: '小事；细务。', note: '「勤小物」谓勤于细小之事，故无大患。',
        examples: [{ text: '夫君子能勤小物，故無大患', at: '周紀一' }] },
    ],
  },
  '著': {
    pinyin: 'zhù',
    pos: '动',
    uses: [
      { id: 'zhu4-show', gloss: '显明；显现出来。', note: '「非名不著」即没有名分就显不出来。',
        examples: [{ text: '非名不著，非器不形。', at: '周紀一' }] },
      { id: 'zhu4-evident', pos: '形', gloss: '显著；明显（与「微」相对）。', note: '本卷用它讲事变由微到著的道理，「救其著」即事已显著才去挽救。',
        examples: [{ text: '夫事未有不生於微而成於著。', at: '周紀一' }, { text: '故必待其著而後救之', at: '周紀一' }, { text: '救其著，則竭力而不能及也', at: '周紀一' }] },
    ],
  },
  '器': {
    pinyin: 'qì',
    pos: '名',
    uses: [
      { id: 'qi4-ritual-vessel', gloss: '名，象征名分等级的器物。', note: '「名器」连用，指名分与器物；「惟器与名，不可以假人」即器物与名分不可借给他人。',
        examples: [{ text: '非名不著，非器不形。', at: '周紀一' }, { text: '名器既亡，則禮安得獨在哉', at: '周紀一' }] },
      { id: 'qi4-vessel', gloss: '名，器具。', note: '「饮器」指盛饮料的器具。',
        examples: [{ text: '趙襄子漆智伯之頭，以為飲器。', at: '周紀一' }] },
    ],
  },
  '形': {
    pinyin: 'xíng',
    pos: '动',
    uses: [
      { id: 'xing2-manifest', gloss: '显现；表现出来', note: '全卷仅一见，无第二处用例，故不举例。「非器不形」谓没有器物，名就显现不出来。',
        examples: [] },
    ],
  },
  '別': {
    pinyin: 'bié',
    pos: '动',
    uses: [
      { id: 'bie2-distinguish', gloss: '区别；分辨。', note: '「器以别之」是用器物区别等级。胡注：「别，彼列翻。」',
        examples: [{ text: '名以命之，器以別之', at: '周紀一' }] },
      { id: 'bie2-separate', gloss: '分离；分出另立。', note: '「别族」指从本族分出，另立一族。',
        examples: [{ text: '智果別族於太史為輔氏', at: '周紀一' }] },
    ],
    variants: ['别'],
  },
  '粲': {
    pinyin: 'càn',
    pos: '形',
    uses: [
      { id: 'can4-distinct', gloss: '鲜明；分明的样子', note: '全卷仅一见，无第二处用例，故不举例。「粲然有伦」谓上下分明而有条理。',
        examples: [] },
    ],
  },
  '此': {
    pinyin: 'cǐ',
    pos: '代',
    uses: [
      { id: 'ci3-this', gloss: '这；这个。', note: '指代上文所说的事或人。',
        examples: [{ text: '此禮之大經也', at: '周紀一' }, { text: '此其所以失人也', at: '周紀一' }, { text: '而此人欲為報仇', at: '周紀一' }] },
    ],
  },
  '經': {
    pinyin: 'jīng',
    pos: '名',
    uses: [
      { id: 'jing1-great-principle', gloss: '常道；大纲。', note: '「此礼之大经也」谓这是礼的大纲。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '既': {
    pinyin: 'jì',
    pos: '副',
    uses: [
      { id: 'ji4-already', gloss: '已经。', note: '「既亡」「既乱」「既坏」皆表已然。',
        examples: [{ text: '名器既亡，則禮安得獨在哉', at: '周紀一' }, { text: '誠以名器既亂', at: '周紀一' }] },
      { id: 'ji4-both', gloss: '既……又……：表两事并存。', note: '「既不能讨，又宠秩之」谓既不能讨伐，又加以封赏。',
        examples: [{ text: '天子既不能討，又寵秩之', at: '周紀一' }] },
      { id: 'ji4-since', gloss: '既然；已经（用于让步）。', note: '「既已委质为臣」谓既然已经委身做人家的臣子。',
        examples: [{ text: '既已委質為臣，而又求殺之', at: '周紀一' }] },
    ],
    variants: ['旣'],
  },
  '得': {
    pinyin: 'dé',
    pos: '动',
    uses: [
      { id: 'de2-obtain', gloss: '得到；获得。', note: '可指得地，也可指得人才。',
        examples: [{ text: '彼狃於得地，必請於他人', at: '周紀一' }, { text: '凡取人之術，苟不得聖人', at: '周紀一' }] },
      { id: 'de2-can', gloss: '能；能够。', note: '用在动词之前，多与「岂」「安」「谁」相呼应，表示反问。',
        examples: [{ text: '則禮安得獨在哉', at: '周紀一' }, { text: '是受天子之命而為諸侯也，誰得而討之', at: '周紀一' }] },
    ],
  },
  '獨': {
    pinyin: 'dú',
    pos: '副',
    uses: [
      { id: 'du2-alone', gloss: '副，独自；单独。', note: '「礼安得独在哉」即礼哪里能独自存在呢。',
        examples: [{ text: '則禮安得獨在哉', at: '周紀一' }] },
      { id: 'du2-only', gloss: '副，唯独；偏偏。', note: '「奈何独以吾为智氏质乎」即为什么偏偏拿我们魏国当智氏的靶子。胡注释「质」为椹质、质的，即箭靶。',
        examples: [{ text: '奈何獨以吾為智氏質乎', at: '周紀一' }] },
    ],
  },
  '在': {
    pinyin: 'zài',
    pos: '动',
    uses: [
      { id: 'zai4-exist', gloss: '存在；留存', note: '「礼安得独在哉」谓礼又怎能独自存在。本卷三见，此举一处。',
        examples: [{ text: '則禮安得獨在哉', at: '周紀一' }] },
      { id: 'zai4-lie-in', gloss: '在于；取决于', note: '「怨岂在明」谓怨恨哪里在于显露，用于引《夏书》论防微。',
        examples: [{ text: '怨豈在明，不見是圖', at: '周紀一' }] },
    ],
  },
  '昔': {
    pinyin: 'xī',
    pos: '名',
    uses: [
      { id: 'xi1-formerly', gloss: '从前；往日。', note: '多用于句首追叙旧事；「自古昔以来」则用作名词。',
        examples: [{ text: '昔仲叔於奚有功於衛', at: '周紀一' }, { text: '昔晉文公有大功於王室', at: '周紀一' }] },
    ],
  },
  '仲': {
    pinyin: 'zhòng',
    pos: '专名',
    uses: [
      { id: 'zhong4-name', gloss: '人名用字。仲叔于奚，卫国大夫，有功于卫而辞邑请繁缨', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '叔': {
    pinyin: 'shū',
    pos: '名',
    uses: [
      { id: 'shu1-uncle', gloss: '叔父；天子对同姓诸侯的尊称。', note: '此句是周襄王对晋文公说，称他为叔父。',
        examples: [{ text: '亦叔父之所惡也', at: '周紀一' }, { text: '叔父有地而隧', at: '周紀一' }] },
      { id: 'shu1-name', pos: '专名', gloss: '人名用字：仲叔于奚。', note: '卫国大夫仲叔于奚，因救孙桓子有功。',
        examples: [{ text: '昔仲叔於奚有功於衛', at: '周紀一' }] },
    ],
  },
  '奚': {
    pinyin: 'xī',
    pos: '专名',
    uses: [
      { id: 'xi1-name', gloss: '人名用字：仲叔于奚，卫国有功之臣。', note: '本卷「奚」只作人名，不作疑问代词「何」讲。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '功': {
    pinyin: 'gōng',
    pos: '名',
    uses: [
      { id: 'gong1-merit', gloss: '功劳；功绩。', note: '本卷三见，皆指对国家或他人的功劳。',
        examples: [{ text: '昔仲叔於奚有功於衛', at: '周紀一' }, { text: '治其微，則用力寡而功多', at: '周紀一' }] },
    ],
  },
  '辭': {
    pinyin: 'cí',
    pos: '名',
    uses: [
      { id: 'ci2-words', gloss: '言辞；文辞。', note: '指赵简子写在两片竹简上的训戒之辞。',
        examples: [{ text: '乃書訓戒之辭於二簡', at: '周紀一' }, { text: '問無恤，誦其辭甚習', at: '周紀一' }] },
      { id: 'ci2-decline', pos: '动', gloss: '推辞；辞让。', note: '仲叔于奚辞去城邑而请求繁缨。',
        examples: [{ text: '辭邑而請繁纓', at: '周紀一' }] },
    ],
  },
  '邑': {
    pinyin: 'yì',
    pos: '名',
    uses: [
      { id: 'yi4-city', gloss: '名，城邑；封邑。', note: '「万家之邑」指有万户人家的封邑；胡注引毛晃、项安世详辨周制之邑与战国之邑不同。',
        examples: [{ text: '辭邑而請繁纓', at: '周紀一' }, { text: '使使者致萬家之邑於智伯', at: '周紀一' }] },
      { id: 'yi4-place-name', gloss: '名，地名用字：安邑。', note: '胡注谓桓子、康子肘足相接，是各为自己的都邑担忧；安邑即魏氏所居。',
        examples: [{ text: '以汾水可以灌安邑', at: '周紀一' }] },
    ],
  },
  '請': {
    pinyin: 'qǐng',
    pos: '动',
    uses: [
      { id: 'qing3-request', gloss: '请求；求取', note: '向对方求取器物、土地或名位。全卷十见。',
        examples: [{ text: '辭邑而請繁纓', at: '周紀一' }, { text: '請隧於襄王，襄王不許', at: '周紀一' }, { text: '智伯請地於韓康子', at: '周紀一' }] },
    ],
  },
  '繁': {
    pinyin: 'pán',
    pos: '名',
    uses: [
      { id: 'pan2-tassel', gloss: '「繁缨」是马的饰物，繁为马鬣上的装饰。', note: '胡注：「繁，音蒲官翻。」这是本字作马饰时的读法，与「繁多」的读法不同。本卷未见「繁多」义。',
        examples: [{ text: '辭邑而請繁纓', at: '周紀一' }, { text: '夫繁纓，小物也', at: '周紀一' }] },
    ],
  },
  '纓': {
    pinyin: 'yīng',
    pos: '名',
    uses: [
      { id: 'ying1-tassel', gloss: '「繁缨」，马胸前后的饰物', note: '胡三省注：繁是马鬣上的饰物，缨是马胸前的饰物。',
        examples: [{ text: '昔仲叔於奚有功於衛，辭邑而請繁纓', at: '周紀一' }, { text: '夫繁纓，小物也', at: '周紀一' }] },
    ],
  },
  '如': {
    pinyin: 'rú',
    pos: '动',
    uses: [
      { id: 'ru2-like', gloss: '像；如同。', note: '「如是」即像这样。',
        examples: [{ text: '如是而甚不仁', at: '周紀一' }] },
      { id: 'ru2-not-as-good', gloss: '「不如」：比不上；最好还是。', note: '用于比较取舍。',
        examples: [{ text: '孔子以為不如多與之邑', at: '周紀一' }, { text: '智果曰：「不如宵也。', at: '周紀一' }, { text: '不與，將伐我；不如與之', at: '周紀一' }] },
      { id: 'ru2-go', gloss: '往；到。', note: '「如厕」即上厕所。',
        examples: [{ text: '襄子如廁心動', at: '周紀一' }] },
    ],
  },
  '多': {
    pinyin: 'duō',
    pos: '形',
    uses: [
      { id: 'duo1-many', gloss: '多，与「寡」相对。', note: '「功多」「多矣」都是此义。',
        examples: [{ text: '其為害豈不多哉', at: '周紀一' }, { text: '以至於顛覆者多矣', at: '周紀一' }] },
      { id: 'duo1-give-more', pos: '副', gloss: '多加，多给。', note: '「不如多与之邑」谓不如多给他城邑。',
        examples: [{ text: '孔子以為不如多與之邑', at: '周紀一' }] },
      { id: 'duo1-often', pos: '副', gloss: '大多；往往。', note: '副词用法。',
        examples: [{ text: '是以察者多蔽於才而遺於德', at: '周紀一' }] },
    ],
  },
  '與': {
    pinyin: 'yǔ',
    pos: '连',
    uses: [
      { id: 'yu3-and', gloss: '和；跟（连接名词，表并列）。', note: '「与其得小人，不若得愚人」中「与其」则表比较取舍。本卷未见「参与」义。',
        examples: [{ text: '惟器與名，不可以假人', at: '周紀一' }, { text: '夫才與德異，而世俗莫之能辨', at: '周紀一' }] },
      { id: 'yu3-with', pos: '介', gloss: '跟；同（介词，引出动作的对象）。', note: '「与韩康子、魏桓子宴于蓝台」「阴与张孟谈约」皆此用法。',
        examples: [{ text: '與韓康子、魏桓子宴於藍臺', at: '周紀一' }, { text: '二子乃陰與張孟談約', at: '周紀一' }] },
      { id: 'yu3-give', pos: '动', gloss: '给；给予。', note: '「多与之邑」「弗与」「必姑与之」皆此义。',
        examples: [{ text: '孔子以為不如多與之邑', at: '周紀一' }, { text: '將欲取之，必姑與之', at: '周紀一' }] },
      { id: 'yu3-follow', pos: '动', gloss: '亲附；拥护。', note: '「其谁与我」即谁会亲附我、为我所用。',
        examples: [{ text: '又斃死以守之，其誰與我', at: '周紀一' }, { text: '又因而殺之，其誰與我', at: '周紀一' }] },
    ],
  },
  '惟': {
    pinyin: 'wéi',
    pos: '副',
    uses: [
      { id: 'wei2-only', gloss: '只有；唯独。', note: '全卷仅一见，无第二处用例，故不举例。胡三省音注本此句作「惟名与器」。',
        examples: [] },
    ],
  },
  '假': {
    pinyin: 'jiǎ',
    pos: '动',
    uses: [
      { id: 'jia3-lend', gloss: '借；给予。', note: '全卷仅一见，无第二处用例，故不举例。「不可以假人」即不可借给别人。本卷未见「虚假」义。',
        examples: [] },
    ],
  },
  '所': {
    pinyin: 'suǒ',
    pos: '助',
    uses: [
      { id: 'suo3-nominalizer', gloss: '助词，与动词组成「所」字结构，指称动作的对象、处所', note: '如「所司」谓所掌管，「所属」谓所隶属，「无所措手足」谓没处放手脚。',
        examples: [{ text: '先主之所屬也', at: '周紀一' }, { text: '尹鐸之所寬也', at: '周紀一' }, { text: '則民無所措手足', at: '周紀一' }] },
      { id: 'suo3-suo-yi', gloss: '「所以」：……的原因；用来……的', note: '「此其所以失人也」谓这正是失去人才的原因。',
        examples: [{ text: '此其所以失人也', at: '周紀一' }, { text: '然所以為此者', at: '周紀一' }] },
    ],
  },
  '司': {
    pinyin: 'sī',
    pos: '动',
    uses: [
      { id: 'si1-manage', gloss: '主管；掌管。', note: '全卷仅一见（「君之所司也」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '政': {
    pinyin: 'zhèng',
    pos: '名',
    uses: [
      { id: 'zheng4-government', gloss: '政权；政事', note: '「政亡，则国家从之」谓政权一失，国家随之而亡。',
        examples: [{ text: '政亡，則國家從之。', at: '周紀一' }] },
      { id: 'zheng4-rule', pos: '动', gloss: '执政；主持政事', note: '此为动词用法，「为政」「擅政」都是。',
        examples: [{ text: '衛君待孔子而為政', at: '周紀一' }, { text: '諸侯專征，大夫擅政', at: '周紀一' }] },
    ],
  },
  '從': {
    pinyin: 'cóng',
    pos: '动',
    uses: [
      { id: 'cong2-follow', gloss: '跟随；率领。', note: '「从者」即随从的人；「从韩、魏之兵」即率领韩、魏的军队。',
        examples: [{ text: '夫從韓、魏之兵以攻趙', at: '周紀一' }, { text: '從者曰：「長子近，且城厚完。」', at: '周紀一' }] },
      { id: 'cong2-ensue', gloss: '随之而来；跟着。', note: '「国家从之」即国与家随之而亡。',
        examples: [{ text: '政亡，則國家從之。', at: '周紀一' }] },
    ],
  },
  '待': {
    pinyin: 'dài',
    pos: '动',
    uses: [
      { id: 'dai4-wait', gloss: '等待。', note: '本卷「待孔子」「待其著」「待事之变」都是等待。',
        examples: [{ text: '故必待其著而後救之', at: '周紀一' }, { text: '衛君待孔子而為政', at: '周紀一' }] },
      { id: 'dai4-treat', gloss: '对待；对付。', note: '「以相亲之兵待轻敌之人」谓用相亲的兵对付轻敌的人。',
        examples: [{ text: '以相親之兵待輕敵之人', at: '周紀一' }] },
      { id: 'dai4-bear', gloss: '宽容；容得下。', note: '胡注引韦昭曰：待，犹假也。「其谁能待之」谓谁能容得下他。',
        examples: [{ text: '而以不仁行之，其誰能待之', at: '周紀一' }] },
    ],
  },
  '欲': {
    pinyin: 'yù',
    pos: '动',
    uses: [
      { id: 'yu4-want', gloss: '想要；打算。', note: '本卷十余见，皆表意愿。',
        examples: [{ text: '孔子欲先正名', at: '周紀一' }, { text: '豫讓欲為之報仇', at: '周紀一' }] },
      { id: 'yu4-about', gloss: '将要；快要。', note: '「将欲败之」「将欲取之」与「将」连用，表将要。',
        examples: [{ text: '將欲敗之，必姑輔之', at: '周紀一' }, { text: '將欲取之，必姑與之', at: '周紀一' }] },
      { id: 'yu4-desire', pos: '名', gloss: '所想要的；欲望（名词性结构）。', note: '「子乃为所欲为」中「所欲」指想做的事。',
        examples: [{ text: '子乃為所欲為', at: '周紀一' }] },
    ],
  },
  '先': {
    pinyin: 'xiān',
    readings: ['xiān', 'xiàn'],
    pos: '副',
    uses: [
      { id: 'xian1-first', gloss: '先；首先。', note: '读 xiān（如字），用在动词之前，表示次序在前。',
        reading: 'xiān',
        examples: [{ text: '孔子欲先正名', at: '周紀一' }] },
      { id: 'xian1-put-first', pos: '动', gloss: '把……放在前头；先做。', note: '胡注：「先，悉荐翻。」古去声一读 xiàn；今普通话仍读 xiān。本卷「知所先后」的「先」胡注也读去声。',
        reading: 'xiàn',
        examples: [{ text: '正名，細務也，而孔子先之', at: '周紀一' }] },
      { id: 'xian1-late', pos: '形', gloss: '已故的；上代的。', note: '读 xiān（如字）。「先王」指已故的周天子；「先主」是家臣对已故主君的称呼，胡注：「死则曰先主。」',
        reading: 'xiān',
        examples: [{ text: '先王之禮於斯盡矣。', at: '周紀一' }, { text: '先主之所屬也', at: '周紀一' }] },
    ],
  },
  '正': {
    pinyin: 'zhèng',
    pos: '动',
    uses: [
      { id: 'zheng4-rectify', gloss: '动，纠正；使端正。', note: '「正名」是端正名分，孔子认为这是为政的先务。',
        examples: [{ text: '孔子欲先正名', at: '周紀一' }, { text: '正名，細務也', at: '周紀一' }] },
      { id: 'zheng4-proper', pos: '形', gloss: '形，正当；端正。', note: '「名不正」即名分不正当。',
        examples: [{ text: '以為名不正則民無所措手足', at: '周紀一' }] },
      { id: 'zheng4-upright', pos: '形', gloss: '形，正直。', note: '「正直中和」是司马光给「德」下的定义。',
        examples: [{ text: '正直中和之謂德', at: '周紀一' }] },
    ],
  },
  '無': {
    pinyin: 'wú',
    pos: '动',
    uses: [
      { id: 'wu2-not-have', gloss: '没有；无有', note: '表不存在或领有之否定。全卷十八见，此举两处。',
        examples: [{ text: '而二子無喜志', at: '周紀一' }, { text: '沈竈產鼃，民無叛意', at: '周紀一' }] },
      { id: 'wu2-do-not', pos: '副', gloss: '不要；通「毋」', note: '表禁止：「无以尹铎为少」谓不要因为尹铎是小臣而轻视他。',
        examples: [{ text: '無以尹鐸為少，無以晉陽為遠', at: '周紀一' }] },
    ],
  },
  '措': {
    pinyin: 'cuò',
    pos: '动',
    uses: [
      { id: 'cuo4-place', gloss: '安放；安置。', note: '全卷仅一见（「民无所措手足」），无第二处用例，故不举例。胡注：「见《论语》。」',
        examples: [] },
    ],
  },
  '小': {
    pinyin: 'xiǎo',
    pos: '形',
    uses: [
      { id: 'xiao3-small', gloss: '小；微小', note: '「小物」谓小事小物。',
        examples: [{ text: '夫繁纓，小物也', at: '周紀一' }, { text: '夫君子能勤小物', at: '周紀一' }] },
      { id: 'xiao3-petty', gloss: '「小人」，指才胜德的人', note: '〈才德论〉把人为圣人、君子、小人、愚人四等。',
        examples: [{ text: '才勝德謂之小人。', at: '周紀一' }, { text: '君子挾才以為善，小人挾才以為惡。', at: '周紀一' }] },
    ],
  },
  '惜': {
    pinyin: 'xī',
    pos: '动',
    uses: [
      { id: 'xi1-pity', gloss: '可惜；惋惜。', note: '全卷仅一见，指孔子惋惜繁缨这件小物，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '細': {
    pinyin: 'xì',
    pos: '形',
    uses: [
      { id: 'xi4-petty', gloss: '细小；微不足道。', note: '「正名，细务也」与上文「夫繁缨，小物也」对举。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '務': {
    pinyin: 'wù',
    pos: '名',
    uses: [
      { id: 'wu4-affair', gloss: '事情；事务。', note: '全卷仅一见，即「正名，细务也」，指细小的事务。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '生': {
    pinyin: 'shēng',
    pos: '动',
    uses: [
      { id: 'sheng1-bear', gloss: '生育；出生。', note: '本卷用于篇末世系，如「献子生籍」。',
        examples: [{ text: '獻子生籍，是為烈侯。', at: '周紀一' }, { text: '韓康子生武子啟章', at: '周紀一' }] },
      { id: 'sheng1-arise', gloss: '产生；发生。', note: '「生于微」即从细微处发生。',
        examples: [{ text: '夫事未有不生於微而成於著。', at: '周紀一' }] },
      { id: 'sheng1-people', pos: '形', gloss: '「生民」指百姓、人民。', note: '「生民之类糜灭几尽」谓百姓几乎死绝。',
        examples: [{ text: '生民之類糜滅幾盡', at: '周紀一' }] },
    ],
  },
  '慮': {
    pinyin: 'lǜ',
    pos: '名',
    uses: [
      { id: 'lü4-thought', gloss: '思虑；谋虑。', note: '全卷仅一见，无第二处用例，故不举例。「虑远」是说思虑深远。',
        examples: [] },
    ],
  },
  '遠': {
    pinyin: 'yuǎn',
    pos: '形',
    uses: [
      { id: 'yuan3-far', gloss: '遥远；路远', note: '「无以晋阳为远」谓不要嫌晋阳路远而不往。',
        examples: [{ text: '無以晉陽為遠', at: '周紀一' }] },
      { id: 'yuan3-farsighted', gloss: '深远；长远', note: '「虑远」谓思虑深远，与下文「识近」相对。',
        examples: [{ text: '聖人之慮遠，故能謹其微而治之', at: '周紀一' }] },
    ],
    variants: ['逺'],
  },
  '謹': {
    pinyin: 'jǐn',
    pos: '副',
    uses: [
      { id: 'jin3-careful', gloss: '谨慎；小心。', note: '「谨其微」指在细微处谨慎下手。胡注：「治，直之翻；下同。」',
        examples: [{ text: '故能謹其微而治之', at: '周紀一' }] },
      { id: 'jin3-earnestly', gloss: '恭敬地；郑重地。', note: '「谨识之」是告诫儿子好好记住，「谨避之」是说自己小心避开。',
        examples: [{ text: '以授二子曰：「謹識之。」', at: '周紀一' }, { text: '真義士也！吾謹避之耳', at: '周紀一' }] },
    ],
  },
  '其': {
    pinyin: 'qí',
    pos: '代',
    uses: [
      { id: 'qi2-his', gloss: '他的；它的；他们的', note: '第三人称领格，本卷最常见的用法。',
        examples: [{ text: '故能謹其微而治之', at: '周紀一' }, { text: '今晉大夫暴蔑其君', at: '周紀一' }] },
      { id: 'qi2-that', gloss: '那；那个', note: '指示代词。',
        examples: [{ text: '其晉陽乎，先主之所屬也', at: '周紀一' }] },
      { id: 'qi2-rhetorical', pos: '副', gloss: '表反诘，犹「岂」、「难道」', note: '此为语气副词用法，本卷两见。',
        examples: [{ text: '雖欲勿許，其可得乎？', at: '周紀一' }, { text: '其誰能待之？', at: '周紀一' }] },
    ],
  },
  '識': {
    pinyin: 'shí',
    readings: ['shí', 'zhì'],
    pos: '动',
    uses: [
      { id: 'shi2-know', gloss: '认识；知道。', note: '「不识」即认不出；「识之」即认出他。',
        reading: 'shí',
        examples: [{ text: '行乞於市，其妻不識也', at: '周紀一' }, { text: '行見其友，其友識之', at: '周紀一' }] },
      { id: 'shi2-insight', pos: '名', gloss: '见识；认识。', note: '「众人之识近」即众人的见识短浅。',
        reading: 'shí',
        examples: [{ text: '眾人之識近，故必待其著而後救之。', at: '周紀一' }] },
      { id: 'zhi4-remember', gloss: '记住。', note: '读 zhì。「谨识之」即牢牢记住它。',
        reading: 'zhì',
        examples: [{ text: '以授二子曰：「謹識之。」', at: '周紀一' }] },
    ],
  },
  '近': {
    pinyin: 'jìn',
    pos: '形',
    uses: [
      { id: 'jin4-near', gloss: '近，距离短。', note: '「长子近」谓长子城离得近。',
        examples: [{ text: '長子近，且城厚完', at: '周紀一' }] },
      { id: 'jin4-shortsighted', gloss: '浅近；眼前。', note: '「众人之识近」谓众人的见识短浅，与「圣人之虑远」相对。',
        examples: [{ text: '眾人之識近，故必待其著而後救之', at: '周紀一' }] },
      { id: 'jin4-close', pos: '动', gloss: '亲近；宠幸。', note: '「近幸」即亲近宠幸。',
        examples: [{ text: '臣事趙孟，必得近幸', at: '周紀一' }] },
    ],
  },
  '必': {
    pinyin: 'bì',
    pos: '副',
    uses: [
      { id: 'bi4-certainly', gloss: '一定；必然（表推断）。', note: '「智宗必灭」「难必至矣」皆表推断之必然。',
        examples: [{ text: '若果立瑤也，智宗必滅', at: '周紀一' }, { text: '主不備，難必至矣', at: '周紀一' }] },
      { id: 'bi4-must', gloss: '必须；一定要（表决心或义务）。', note: '「必以为归」谓一定要把晋阳作为归宿。',
        examples: [{ text: '無以晉陽為遠，必以為歸', at: '周紀一' }, { text: '必奉禮義而征之', at: '周紀一' }] },
    ],
  },
  '救': {
    pinyin: 'jiù',
    pos: '动',
    uses: [
      { id: 'jiu4-rescue', gloss: '挽救；补救。', note: '与「治」相对：治其微是及早治理，救其著是事已显著才挽救。',
        examples: [{ text: '故必待其著而後救之', at: '周紀一' }, { text: '救其著，則竭力而不能及也', at: '周紀一' }] },
      { id: 'jiu4-fight', gloss: '抢救；止住水患。', note: '「救水」即忙着治水。',
        examples: [{ text: '智伯軍救水而亂', at: '周紀一' }] },
    ],
  },
  '用': {
    pinyin: 'yòng',
    pos: '动',
    uses: [
      { id: 'yong4-use', gloss: '使用；付出。', note: '全卷仅一见，无第二处用例，故不举例。「用力寡」即所费的力气少。',
        examples: [] },
    ],
  },
  '寡': {
    pinyin: 'guǎ',
    pos: '形',
    uses: [
      { id: 'gua3-few', gloss: '少', note: '全卷仅一见，无第二处用例，故不举例。「用力寡而功多」谓用力少而收效多。',
        examples: [] },
    ],
  },
  '竭': {
    pinyin: 'jié',
    pos: '动',
    uses: [
      { id: 'jie2-exhaust', gloss: '竭尽；用尽。', note: '全卷仅一见（「竭力」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '及': {
    pinyin: 'jí',
    pos: '动',
    uses: [
      { id: 'ji2-reach', gloss: '赶上；够得上', note: '「竭力而不能及也」谓尽力也来不及。',
        examples: [{ text: '救其著，則竭力而不能及也', at: '周紀一' }] },
      { id: 'ji2-when', pos: '连', gloss: '等到；到了', note: '「及智宣子卒」是时间从句的起头。',
        examples: [{ text: '及智宣子卒，智襄子為政', at: '周紀一' }] },
      { id: 'ji2-affect', gloss: '波及；累及', note: '「难必及韩、魏矣」谓祸难必将波及韩、魏。',
        examples: [{ text: '趙亡，難必及韓、魏矣', at: '周紀一' }] },
    ],
  },
  '履': {
    pinyin: 'lǚ',
    pos: '动',
    uses: [
      { id: 'lu3-tread', gloss: '踩；踏。', note: '「履霜」即踩到霜；「履桓子之跗」即踩魏桓子的脚背。',
        examples: [{ text: '《易》曰：「履霜，堅冰至」', at: '周紀一' }, { text: '康子履桓子之跗', at: '周紀一' }] },
    ],
  },
  '霜': {
    pinyin: 'shuāng',
    pos: '名',
    uses: [
      { id: 'shuang1-frost', gloss: '霜。', note: '引《易》「履霜，坚冰至」，谓踩到霜便知坚冰将至。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '堅': {
    pinyin: 'jiān',
    pos: '形',
    uses: [
      { id: 'jian1-hard', gloss: '坚硬；结实。', note: '「履霜，坚冰至」谓踏霜而知坚冰将至。',
        examples: [{ text: '《易》曰：「履霜，堅冰至」', at: '周紀一' }] },
      { id: 'jian1-solid', pos: '名', gloss: '坚硬之物；指箭矢所射的坚固目标。', note: '「则不能以入坚」谓箭不能射入坚硬之物。',
        examples: [{ text: '不矯揉，不羽括，則不能以入堅', at: '周紀一' }] },
    ],
  },
  '冰': {
    pinyin: 'bīng',
    pos: '名',
    uses: [
      { id: 'bing1-ice', gloss: '冰。', note: '全卷仅一见，无第二处用例，故不举例。此句引《易》「履霜，坚冰至」。',
        examples: [] },
    ],
  },
  '至': {
    pinyin: 'zhì',
    pos: '动',
    uses: [
      { id: 'zhi4-arrive', gloss: '动，到；来到。', note: '可以指人到了某处，也可以指事情临头。',
        examples: [{ text: '履霜，堅冰至', at: '周紀一' }, { text: '主不備，難必至矣', at: '周紀一' }] },
      { id: 'zhi4-reach', gloss: '动，达到某种程度。', note: '「善无不至」即善没有做不到的；「以至于颠覆」即到了倾覆的地步。',
        examples: [{ text: '挾才以為善者，善無不至矣', at: '周紀一' }, { text: '以至於顛覆者多矣', at: '周紀一' }] },
      { id: 'zhi4-as-for', pos: '介', gloss: '介，至于；说到。', note: '用于另起一端。',
        examples: [{ text: '至於季氏之於魯，田恆之於齊', at: '周紀一' }] },
    ],
  },
  '書': {
    pinyin: 'shū',
    pos: '名',
    uses: [
      { id: 'shu1-write', pos: '动', gloss: '书写；写', note: '动词用法，本卷一见于「书训戒之辞于二简」，谓把训戒之辞写在两片竹简上。胡注引孔颖达：「书者，舒也。」',
        examples: [{ text: '乃書訓戒之辭於二簡', at: '周紀一' }] },
      { id: 'shu1-classic', pos: '专名', gloss: '《书》，即《尚书》；亦指其篇目', note: '专名用法，本卷有《书》《夏书》《周书》。',
        examples: [{ text: '《書》曰：「一日二日萬幾」', at: '周紀一' }, { text: '《周書》曰：『將欲敗之', at: '周紀一' }] },
    ],
  },
  '日': {
    pinyin: 'rì',
    pos: '名',
    uses: [
      { id: 'ri4-day', gloss: '日子；日期。', note: '「一日二日」出自《书》，指日复一日；「期日」是约定的日期。',
        examples: [{ text: '一日二日萬幾', at: '周紀一' }, { text: '為之期日而遣之', at: '周紀一' }] },
      { id: 'ri4-daily', pos: '副', gloss: '一天天地；日益。', note: '作状语。',
        examples: [{ text: '幽、厲失德，周道日衰', at: '周紀一' }] },
    ],
  },
  '萬': {
    pinyin: 'wàn',
    pos: '数',
    uses: [
      { id: 'wan4-ten-thousand', gloss: '数目，十千', note: '「万家之邑」谓有万户的城邑。',
        examples: [{ text: '使使者致萬家之邑於智伯', at: '周紀一' }, { text: '復與之萬家之邑一。', at: '周紀一' }] },
      { id: 'wan4-myriad', gloss: '泛指众多；万事', note: '胡三省注引孔安国：几，微也，言当戒惧万事之微。',
        examples: [{ text: '一日二日萬幾', at: '周紀一' }] },
    ],
  },
  '幾': {
    pinyin: 'jī',
    pos: '副',
    uses: [
      { id: 'ji1-nearly', gloss: '几乎；将近。', note: '「糜灭几尽」即几乎灭尽。',
        examples: [{ text: '生民之類糜滅幾盡', at: '周紀一' }] },
      { id: 'ji1-subtle', pos: '形', gloss: '细微；隐微。', note: '「万几」指万事的细微之处，胡三省注以「微」解之。',
        examples: [{ text: '《書》曰：「一日二日萬幾」', at: '周紀一' }] },
    ],
  },
  '類': {
    pinyin: 'lèi',
    pos: '名',
    uses: [
      { id: 'lei4-kind', gloss: '种类；这一类。', note: '「谓此类也」谓说的就是这一类事。',
        examples: [{ text: '《書》曰：「一日二日萬幾」，謂此類也', at: '周紀一' }] },
      { id: 'lei4-clan', gloss: '族类；同属一类的人。', note: '「生民之类」即生民之属，指百姓。胡注：《说文》曰：糜，糁也，取糜烂之义。',
        examples: [{ text: '生民之類糜滅幾盡', at: '周紀一' }] },
    ],
  },
  '嗚': {
    pinyin: 'wū',
    pos: '语气',
    uses: [
      { id: 'wu1-alas', gloss: '呜呼：感叹词，表哀叹。', note: '本卷两见，皆单作「呜呼！」成句，全句仅三字，不足六字之例，前后又无可截取之文，故不举例。',
        examples: [] },
    ],
    variants: ['烏'],
  },
  '呼': {
    pinyin: 'hū',
    pos: '语气',
    uses: [
      { id: 'hu1-oh', gloss: '叹词「呜呼」的用字，表感叹。', note: '全卷两见，都作「呜呼」；该句连标点只有三字，不足六字的例句，故不举例。',
        examples: [] },
    ],
  },
  '幽': {
    pinyin: 'yōu',
    pos: '专名',
    uses: [
      { id: 'you1-king-you', gloss: '专名。周幽王。', note: '全卷仅一见，无第二处用例，故不举例。与「厉」并举，指周幽王、周厉王两个失德之君。',
        examples: [] },
    ],
  },
  '厲': {
    pinyin: 'lì',
    pos: '专名',
    uses: [
      { id: 'li4-zhou-li-wang', gloss: '人名。周厉王，西周暴君。', note: '全卷仅一见，无第二处用例，故不举例。此处与「幽」连举，「幽、厉失德」指周幽王与周厉王。',
        examples: [] },
    ],
  },
  '失': {
    pinyin: 'shī',
    pos: '动',
    uses: [
      { id: 'shi1-lose', gloss: '丧失；丢失。', note: '「失德」指丧失德行，「已失之矣」指已经把它丢了。',
        examples: [{ text: '幽、厲失德，周道日衰', at: '周紀一' }, { text: '求其簡，已失之矣', at: '周紀一' }] },
      { id: 'shi1-miss', gloss: '错失；失去（人才）。', note: '「失人」指错失人才，是才德论的着眼处。',
        examples: [{ text: '此其所以失人也', at: '周紀一' }, { text: '又何失人之足患哉', at: '周紀一' }] },
      { id: 'shi1-fault', gloss: '过失；失误。', note: '名词，「一人三失」指一人屡有过失。',
        examples: [{ text: '一人三失，怨豈在明', at: '周紀一' }] },
    ],
  },
  '德': {
    pinyin: 'dé',
    pos: '名',
    // 本卷的「德」只有「品德；德行」一义：幽、厲失德是失其德行，未有代德是代周之德，〈才德论〉
    // 通篇以德与才对举。原先另立一义「恩德；德政」，两条用例（幽、厲失德／未有代德）却都是在说
    // 德行，恩德在整卷里一次也没有出现——没有用例的义项就是卡片会说出来而语料不支持的话，所以删去。
    uses: [
      { id: 'de2-virtue', gloss: '品德；德行', note: '〈才德论〉以德与才对举，德是正直中和。',
        examples: [{ text: '夫聰察強毅之謂才，正直中和之謂德。', at: '周紀一' }, { text: '才勝德謂之小人。', at: '周紀一' }] },
    ],
    variants: ['徳'],
  },
  '道': {
    pinyin: 'dào',
    pos: '名',
    uses: [
      { id: 'dao4-way', gloss: '正道；王道。', note: '全卷仅一见，指周朝的王道日益衰微，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '衰': {
    pinyin: 'shuāi',
    pos: '动',
    uses: [
      { id: 'shuai1-decline', gloss: '衰微；衰落。', note: '「周道日衰」谓周室之道一天天衰微。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '散': {
    pinyin: 'sàn',
    pos: '动',
    uses: [
      { id: 'san4-scatter', gloss: '散乱；解体。', note: '全卷仅一见，即「纲纪散坏」，谓法度解体败坏。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '壞': {
    pinyin: 'huài',
    pos: '动',
    uses: [
      { id: 'huai4-collapse', gloss: '败坏；崩坏。', note: '读 huài（如字）。本卷四见，两见是「纲纪散坏」「君臣之礼既坏」，指礼制自己崩坏。',
        examples: [{ text: '綱紀散壞，下陵上替', at: '周紀一' }, { text: '君臣之禮既壞矣', at: '周紀一' }] },
      { id: 'huai4-destroy', gloss: '毁坏；破坏。', note: '胡注：「坏，音怪，人毁之也。」指人有意去毁，古去声一读 guài；今普通话一律读 huài。',
        examples: [{ text: '非三晉之壞禮', at: '周紀一' }, { text: '乃天子自壞之也', at: '周紀一' }] },
    ],
  },
  '陵': {
    pinyin: 'líng',
    pos: '动',
    uses: [
      { id: 'ling2-encroach', gloss: '动，侵犯；欺凌。', note: '「下陵上替」是在下位的侵陵在上位的，在上位的废弛。',
        examples: [{ text: '綱紀散壞，下陵上替', at: '周紀一' }] },
      { id: 'ling2-overwhelm', gloss: '动，凌驾；压倒。', note: '「五贤陵人」是仗着五项过人之处压过别人；「陵」通「凌」。',
        examples: [{ text: '夫以其五賢陵人', at: '周紀一' }] },
    ],
  },
  '替': {
    pinyin: 'tì',
    pos: '动',
    uses: [
      { id: 'ti4-decline', gloss: '衰败；废弛', note: '全卷仅一见，无第二处用例，故不举例。「下陵上替」谓在下者欺凌在上者，在上者反而衰微。',
        examples: [] },
    ],
  },
  '專': {
    pinyin: 'zhuān',
    pos: '副',
    uses: [
      { id: 'zhuan1-monopolize', gloss: '专擅；独自。', note: '全卷仅一见（「诸侯专征」），无第二处用例，故不举例。胡注认为此句指齐桓公、晋文公一类的霸主。',
        examples: [] },
    ],
  },
  '征': {
    pinyin: 'zhēng',
    pos: '动',
    uses: [
      { id: 'zheng1-punitive', gloss: '征伐；讨伐', note: '胡三省注：「诸侯专征」指齐桓公、晋文公之类。',
        examples: [{ text: '諸侯專征，大夫擅政', at: '周紀一' }] },
      { id: 'zheng1-attack', gloss: '出兵讨伐', note: '「必奉礼义而征之」谓必奉礼义之名讨伐悖逆之臣。',
        examples: [{ text: '必奉禮義而征之。', at: '周紀一' }] },
    ],
  },
  '擅': {
    pinyin: 'shàn',
    pos: '动',
    uses: [
      { id: 'shan4-monopolize', gloss: '专擅；独揽。', note: '全卷仅一见，指大夫擅自执掌国政，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '體': {
    pinyin: 'tǐ',
    pos: '名',
    uses: [
      { id: 'ti3-substance', gloss: '大体；要点；根本。', note: '「礼之大体」谓礼的要点；「什丧七八」谓丧失了十分之七八。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '什': {
    pinyin: 'shí',
    pos: '数',
    uses: [
      { id: 'shi2-ten', gloss: '十；十分之……。', note: '全卷仅一见，即「什丧七八矣」，谓十成中丧失七八成。胡注：「丧，息浪翻。」无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '喪': {
    pinyin: 'sàng',
    pos: '动',
    uses: [
      { id: 'sang4-lose', gloss: '丧失；失去。', note: '全卷仅一见，无第二处用例，故不举例。胡注：「丧，息浪翻。」读 sàng，不是丧事的 sāng。',
        examples: [] },
    ],
    variants: ['䘮'],
  },
  '七': {
    pinyin: 'qī',
    pos: '数',
    uses: [
      { id: 'qi1-seven', gloss: '数词，七。', note: '全卷仅一见，无第二处用例，故不举例。「什丧七八」是说失去了十分之七八。',
        examples: [] },
    ],
  },
  '八': {
    pinyin: 'bā',
    pos: '数',
    uses: [
      { id: 'ba1-eight', gloss: '数词，七、八', note: '全卷仅一见，无第二处用例，故不举例。「什丧七八」谓十成之中丧失七八成。胡注：「丧，息浪翻。」',
        examples: [] },
    ],
  },
  '祀': {
    pinyin: 'sì',
    pos: '名',
    uses: [
      { id: 'si4-sacrifice', gloss: '祭祀；此指宗庙的香火。', note: '全卷仅一见（「文、武之祀」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '綿': {
    pinyin: 'mián',
    pos: '形',
    uses: [
      { id: 'mian2-continuous', gloss: '连续不断的样子；「绵绵」谓接连相续', note: '全卷两见都在「绵绵相属」一语的叠字里。',
        examples: [{ text: '然文、武之祀猶綿綿相屬者', at: '周紀一' }] },
    ],
    variants: ['緜'],
  },
  '屬': {
    pinyin: 'zhǔ',
    pos: '动',
    uses: [
      { id: 'zhu3-continuous', gloss: '连接；连续。', note: '读 zhǔ。「绵绵相属」即接连不断。',
        examples: [{ text: '然文、武之祀猶綿綿相屬者', at: '周紀一' }] },
      { id: 'zhu3-entrust', gloss: '托付；嘱托。', note: '读 zhǔ。「先主之所属」指晋阳是先主托付的地方。',
        examples: [{ text: '先主之所屬也', at: '周紀一' }] },
    ],
  },
  '蓋': {
    pinyin: 'gài',
    pos: '副',
    uses: [
      { id: 'gai4-presumably', gloss: '大概；想来是。', note: '表示推测，并引出下文的解释。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '孫': {
    pinyin: 'sūn',
    pos: '名',
    uses: [
      { id: 'sun1-descendant', gloss: '孙；后代子孙。', note: '「周之子孙」指周室后代；「桓子之孙」指魏斯为桓子之孙。',
        examples: [{ text: '蓋以周之子孫尚能守其名分故也', at: '周紀一' }, { text: '魏斯者，桓子之孫也', at: '周紀一' }] },
    ],
  },
  '尚': {
    pinyin: 'shàng',
    pos: '副',
    uses: [
      { id: 'shang4-still', gloss: '还；尚且。', note: '本卷两见，都说明名分那时还没有完全丧失。',
        examples: [{ text: '尚能守其名分故也', at: '周紀一' }, { text: '徒以名分尚存故也。', at: '周紀一' }] },
    ],
  },
  '隧': {
    pinyin: 'suì',
    pos: '名',
    uses: [
      { id: 'sui4-tunnel-noun', gloss: '名，地下通道；天子葬礼掘地通路。', note: '胡注引杜预：阙地通路曰隧，此乃王者葬礼也。晋文公请隧，是求用天子的葬礼。',
        examples: [{ text: '昔晉文公有大功於王室，請隧於襄王', at: '周紀一' }] },
      { id: 'sui4-tunnel-verb', pos: '动', gloss: '动，修隧道。', note: '「叔父有地而隧」是说叔父若在自己的土地上自行掘隧道，又何必请示。',
        examples: [{ text: '不然，叔父有地而隧', at: '周紀一' }] },
    ],
  },
  '襄': {
    pinyin: 'xiāng',
    pos: '专名',
    uses: [
      { id: 'xiang1-xiang-wang', gloss: '人名。周襄王，东周天子，名郑。', note: '晋文公请隧于襄王而襄王不许，是全卷论名分尚存的一处关键。',
        examples: [{ text: '請隧於襄王，襄王不許', at: '周紀一' }] },
      { id: 'xiang1-zhao-xiang-zi', gloss: '人名。赵襄子，名无恤，赵简子之子，赵氏宗主。', note: '晋阳之战的主角，其后与韩、魏共灭智氏，三家分智氏之田。',
        examples: [{ text: '智伯又求藺、皋狼之地於趙襄子', at: '周紀一' }, { text: '趙襄子漆智伯之頭', at: '周紀一' }] },
      { id: 'xiang1-zhi-xiang-zi', gloss: '人名。智襄子，即智伯，名瑶。', note: '「智襄子为政」承智宣子之后，是全卷智氏灭亡的起点。',
        examples: [{ text: '及智宣子卒，智襄子為政', at: '周紀一' }] },
    ],
  },
  '許': {
    pinyin: 'xǔ',
    pos: '动',
    uses: [
      { id: 'xu3-permit', gloss: '允许；答应。', note: '本卷三见，都是答应或不答应请求。',
        examples: [{ text: '請隧於襄王，襄王不許', at: '周紀一' }, { text: '今請於天子而天子許之', at: '周紀一' }] },
    ],
  },
  '章': {
    pinyin: 'zhāng',
    pos: '名',
    uses: [
      { id: 'zhang1-statute', gloss: '典章；制度', note: '胡三省注：「王章者，章显王者异于诸侯。」',
        examples: [{ text: '襄王不許，曰：「王章也。', at: '周紀一' }] },
      { id: 'zhang1-name', pos: '专名', gloss: '人名用字：任章、启章', note: '任章是魏桓子的相，启章是韩武子。',
        examples: [{ text: '任章曰：「何故弗與？」', at: '周紀一' }, { text: '韓康子生武子啟章', at: '周紀一' }] },
    ],
  },
  '亦': {
    pinyin: 'yì',
    pos: '副',
    uses: [
      { id: 'yi4-also', gloss: '也；也是。', note: '「不亦难乎」是反问，即不也是很难吗。',
        examples: [{ text: '亦叔父之所惡也', at: '周紀一' }, { text: '惡亦無不至矣', at: '周紀一' }, { text: '求以報仇，不亦難乎？', at: '周紀一' }] },
    ],
  },
  '父': {
    pinyin: 'fù',
    pos: '名',
    uses: [
      { id: 'fu4-uncle', gloss: '父辈；周天子对同姓诸侯的称呼，即「叔父」。', note: '此为周襄王称晋文公。本卷「父」两见，都在「叔父」一语之中。',
        examples: [{ text: '亦叔父之所惡也', at: '周紀一' }, { text: '叔父有地而隧', at: '周紀一' }] },
    ],
  },
  '惡': {
    pinyin: 'è',
    readings: ['è', 'wù'],
    pos: '名',
    uses: [
      { id: 'e4-evil', gloss: '罪恶；坏事。与「善」相对。', note: '读 è。「挟才以为恶」谓仗着才能做坏事。',
        reading: 'è',
        examples: [{ text: '君子挾才以為善，小人挾才以為惡。', at: '周紀一' }, { text: '挾才以為惡者，惡亦無不至矣', at: '周紀一' }] },
      { id: 'wu4-hate', pos: '动', gloss: '厌恶；不喜欢。', note: '读 wù。胡注：「恶，乌路翻。」「亦叔父之所恶也」谓这也是叔父所厌恶的。',
        reading: 'wù',
        examples: [{ text: '亦叔父之所惡也', at: '周紀一' }] },
    ],
  },
  '又': {
    pinyin: 'yòu',
    pos: '副',
    uses: [
      { id: 'you4-again', gloss: '又；再一次。', note: '用于动作的重复，如智伯两次求地。',
        examples: [{ text: '又求地於魏桓子', at: '周紀一' }, { text: '智伯又求藺、皋狼之地於趙襄子', at: '周紀一' }] },
      { id: 'you4-moreover', gloss: '而且；另外。', note: '用于把另一层意思加上去。',
        examples: [{ text: '天子既不能討，又寵秩之', at: '周紀一' }, { text: '又何失人之足患哉', at: '周紀一' }] },
    ],
  },
  '焉': {
    pinyin: 'yān',
    pos: '语气',
    uses: [
      { id: 'yan1-final', gloss: '句末语气词，表反问。', note: '全卷仅一见，无第二处用例，故不举例。「又何请焉」即又何必请示呢。',
        examples: [] },
    ],
  },
  '乎': {
    pinyin: 'hū',
    pos: '语气',
    uses: [
      { id: 'hu1-question', gloss: '句末语气词，表疑问', note: '「其可得乎」谓难道办得到吗，是反问而实为否定。',
        examples: [{ text: '雖欲勿許，其可得乎', at: '周紀一' }] },
      { id: 'hu1-rhetorical', gloss: '句末语气词，表反诘、感叹', note: '「况君相乎」谓何况是国君与国相呢。全卷十一见，此类最多。',
        examples: [{ text: '皆能害人，況君相乎', at: '周紀一' }] },
      { id: 'hu1-mid-sentence', gloss: '语气词，用于句中，舒缓语气', note: '「于是乎」为固定结构，「乎」缀于介词之后，不表疑问。',
        examples: [{ text: '文公於是乎懼而不敢違', at: '周紀一' }] },
    ],
  },
  '懼': {
    pinyin: 'jù',
    pos: '动',
    uses: [
      { id: 'ju4-fear', gloss: '害怕；恐惧。', note: '本卷三见，都是畏惧之义。',
        examples: [{ text: '文公於是乎懼而不敢違', at: '周紀一' }, { text: '無故索地，諸大夫必懼', at: '周紀一' }, { text: '彼驕而輕敵，此懼而相親', at: '周紀一' }] },
    ],
  },
  '違': {
    pinyin: 'wéi',
    pos: '动',
    uses: [
      { id: 'wei2-disobey', gloss: '违背；违抗', note: '全卷仅一见，无第二处用例，故不举例。「惧而不敢违」谓畏惧而不敢违抗王命。',
        examples: [] },
    ],
  },
  '曹': {
    pinyin: 'cáo',
    pos: '专名',
    uses: [
      { id: 'cao2-state', gloss: '国名，曹国。', note: '全卷仅一见，与滕、邾、莒并举，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '滕': {
    pinyin: 'téng',
    pos: '专名',
    uses: [
      { id: 'teng2-state', gloss: '国名，滕国，与曹国同为小国。', note: '「不大于曹、滕」谓周的土地方圆不如曹、滕。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '邾': {
    pinyin: 'zhū',
    pos: '专名',
    uses: [
      { id: 'zhu1-state', gloss: '国名。邾国，曹姓小国，在今山东邹城一带。', note: '全卷仅一见，与莒并举，以言周室地狭民少。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '莒': {
    pinyin: 'jǔ',
    pos: '专名',
    uses: [
      { id: 'ju3-state', gloss: '国名。周代小国，地在今山东莒县一带。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '歷': {
    pinyin: 'lì',
    pos: '动',
    uses: [
      { id: 'li4-pass', gloss: '经历；经过。', note: '全卷仅一见，无第二处用例，故不举例。「历数百年」即经过数百年。',
        examples: [] },
    ],
    variants: ['歴'],
  },
  '數': {
    pinyin: 'shù',
    pos: '名',
    uses: [
      { id: 'shu4-number', gloss: '数目；数量', note: '「户数」谓户口数目。胡注引韦昭：「损其户，则民优而税少。」',
        examples: [{ text: '尹鐸損其戶數', at: '周紀一' }] },
      { id: 'shu4-several', pos: '数', gloss: '几；几个', note: '表不定的多数：「数百年」谓几百年。',
        examples: [{ text: '然歷數百年，宗主天下', at: '周紀一' }] },
    ],
  },
  '百': {
    pinyin: 'bǎi',
    pos: '数',
    uses: [
      { id: 'bai3-hundred', gloss: '百；数目字。', note: '全卷仅一见（「数百年」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '年': {
    pinyin: 'nián',
    pos: '名',
    uses: [
      { id: 'nian2-year', gloss: '年岁；年份', note: '「历数百年」谓经过数百年。',
        examples: [{ text: '然歷數百年，宗主天下', at: '周紀一' }, { text: '三年而問之，伯魯不能舉其辭', at: '周紀一' }] },
      { id: 'nian2-one-year', gloss: '一年；满一年', note: '「一年卒」谓过一年就死了，是编年体的常语。',
        examples: [{ text: '弟桓子嘉逐浣而自立，一年卒。', at: '周紀一' }] },
    ],
  },
  '宗': {
    pinyin: 'zōng',
    pos: '名',
    uses: [
      { id: 'zong1-clan', gloss: '宗族。', note: '「智宗」即智氏宗族。',
        examples: [{ text: '若果立瑤也，智宗必滅。', at: '周紀一' }] },
      { id: 'zong1-suzerain', gloss: '宗主；为天下所宗。', note: '「宗主天下」即被天下奉为宗主。',
        examples: [{ text: '然歷數百年，宗主天下', at: '周紀一' }] },
    ],
  },
  '主': {
    pinyin: 'zhǔ',
    pos: '名',
    uses: [
      { id: 'zhu3-lord', gloss: '主上；君主。', note: '胡注：春秋以来，大夫的家臣称大夫为「主」。本卷的「主」多指智伯。',
        examples: [{ text: '主不備，難必至矣', at: '周紀一' }, { text: '主不如與之以驕智伯', at: '周紀一' }] },
      { id: 'zhu3-late-lord', gloss: '已故的家主，即「先主」。', note: '胡注：家臣称死去的家主为「先主」。此指赵简子。',
        examples: [{ text: '先主之所屬也', at: '周紀一' }] },
      { id: 'zhu3-suzerain', gloss: '宗主；盟主。', note: '「宗主天下」谓做天下的宗主。',
        examples: [{ text: '然歷數百年，宗主天下', at: '周紀一' }] },
    ],
  },
  '楚': {
    pinyin: 'chǔ',
    pos: '专名',
    uses: [
      { id: 'chu3-state', gloss: '国名。楚国。', note: '本卷两见，一与晋、齐、秦并举，一见于「白公之于楚」。',
        examples: [{ text: '雖以晉、楚、齊、秦之強', at: '周紀一' }, { text: '田恆之於齊，白公之於楚', at: '周紀一' }] },
    ],
  },
  '齊': {
    pinyin: 'qí',
    pos: '专名',
    uses: [
      { id: 'qi2-state', gloss: '国名。周初封姜太公于齐，地在今山东北部。', note: '本卷三见，都指齐国。',
        examples: [{ text: '田恆之於齊，白公之於楚', at: '周紀一' }, { text: '絺疵請使於齊。', at: '周紀一' }] },
    ],
  },
  '秦': {
    pinyin: 'qín',
    pos: '专名',
    uses: [
      { id: 'qin2-state', gloss: '专名。国名，秦国。', note: '全卷仅一见，无第二处用例，故不举例。此句举晋、楚、齐、秦四强，说明周室虽弱而诸侯不敢加兵。',
        examples: [] },
    ],
  },
  '強': {
    pinyin: 'qiáng',
    pos: '形',
    uses: [
      { id: 'qiang2-strong', gloss: '强大；强盛', note: '本卷或指三晋，或指晋、楚、齐、秦。胡注：「时因谓之三晋。」',
        examples: [{ text: '三晉強盛，雖欲勿許', at: '周紀一' }, { text: '夫三晉雖強，苟不顧天下之誅', at: '周紀一' }] },
      { id: 'qiang2-resolute', gloss: '刚强；坚毅', note: '「强毅」谓刚强果决，是智果所举智伯五贤之一，也是《才德论》所谓「才」。',
        examples: [{ text: '夫聰察強毅之謂才', at: '周紀一' }, { text: '強毅果敢則賢', at: '周紀一' }] },
      { id: 'qiang2-the-strong', pos: '名', gloss: '名词用法：强者；强敌', note: '「击强」谓攻击强敌，与「入坚」对举。',
        examples: [{ text: '不砥礪，則不能以擊強', at: '周紀一' }] },
    ],
    variants: ['彊'],
  },
  '加': {
    pinyin: 'jiā',
    pos: '动',
    uses: [
      { id: 'jia1-impose', gloss: '加；施加（兵威）。', note: '全卷仅一见（「不敢加者」），无第二处用例，故不举例。此指诸侯不敢对周室用兵。',
        examples: [] },
    ],
  },
  '徒': {
    pinyin: 'tú',
    pos: '副',
    uses: [
      { id: 'tu2-merely', gloss: '只；仅仅', note: '全卷仅一见，无第二处用例，故不举例。「徒以名分尚存故也」谓只因名分还存在。',
        examples: [] },
    ],
  },
  '存': {
    pinyin: 'cún',
    pos: '动',
    uses: [
      { id: 'cun2-remain', gloss: '存在；留存。', note: '全卷仅一见，指名分尚且存在，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '氏': {
    pinyin: 'shì',
    pos: '名',
    uses: [
      { id: 'shi4-clan', gloss: '姓氏；家族。用在姓或封邑之后，指某一家族。', note: '本卷的「氏」都指晋国大夫之家，如智氏、赵氏、魏氏、韩氏，以及鲁的季氏。',
        examples: [{ text: '至於季氏之於魯', at: '周紀一' }, { text: '遂殺智伯，盡滅智氏之族', at: '周紀一' }] },
    ],
  },
  '魯': {
    pinyin: 'lǔ',
    pos: '专名',
    uses: [
      { id: 'lu3-state', gloss: '国名。鲁国。', note: '「季氏之于鲁」谓鲁国季氏专权。',
        examples: [{ text: '至於季氏之於魯，田恆之於齊', at: '周紀一' }] },
      { id: 'lu3-bolu', gloss: '人名。伯鲁，赵简子长子，赵襄子之兄。', note: '本卷四见，皆作「伯鲁」；未立为后，故襄子不肯置后。',
        examples: [{ text: '趙簡子之子，長曰伯魯，幼曰無恤。', at: '周紀一' }, { text: '襄子為伯魯之不立也', at: '周紀一' }] },
    ],
  },
  '田': {
    pinyin: 'tián',
    pos: '名',
    uses: [
      { id: 'tian2-field', gloss: '田地。', note: '本卷指智氏的田邑。',
        examples: [{ text: '三家分智氏之田。', at: '周紀一' }, { text: '朝夕分趙氏之田', at: '周紀一' }] },
      { id: 'tian2-clan', gloss: '田氏，齐国大夫之家。', note: '胡注：田氏本陈氏，温公避宋讳改「恒」为「常」，故本卷作「田恒」。',
        examples: [{ text: '田恆之於齊，白公之於楚', at: '周紀一' }] },
    ],
  },
  '恆': {
    pinyin: 'héng',
    pos: '专名',
    uses: [
      { id: 'heng2-tian-heng', gloss: '专名。人名：田恒，齐国大夫，即田常。', note: '全卷仅一见，无第二处用例，故不举例。司马光避宋真宗讳，改「恒」为「常」，所以别本多作「田常」。',
        examples: [] },
    ],
  },
  '白': {
    pinyin: 'bái',
    pos: '专名',
    uses: [
      { id: 'bai2-bai-gong', gloss: '人名。白公，名胜，楚平王之孙，封于白邑。', note: '全卷仅一见，无第二处用例，故不举例。胡注谓白公胜杀楚令尹子西、司马子期而不肯自立，与季氏、田恒、智伯并举为「势足以逐君而自为」者。',
        examples: [] },
    ],
  },
  '勢': {
    pinyin: 'shì',
    pos: '名',
    uses: [
      { id: 'shi4-power', gloss: '势力；形势。', note: '全卷仅一见（「其势皆足以逐君而自为」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '皆': {
    pinyin: 'jiē',
    pos: '副',
    uses: [
      { id: 'jie1-all', gloss: '都；全', note: '总括全体，本卷两见。',
        examples: [{ text: '其勢皆足以逐君而自為', at: '周紀一' }, { text: '蜹、蟻、蜂、蠆，皆能害人', at: '周紀一' }] },
    ],
  },
  '逐': {
    pinyin: 'zhú',
    pos: '动',
    uses: [
      { id: 'zhu2-expel', gloss: '驱逐；赶走。', note: '「逐君」即赶走国君；「逐浣」即赶走赵浣。',
        examples: [{ text: '其勢皆足以逐君而自為', at: '周紀一' }, { text: '弟桓子嘉逐浣而自立', at: '周紀一' }] },
    ],
  },
  '自': {
    pinyin: 'zì',
    pos: '代',
    uses: [
      { id: 'zi4-self', gloss: '自己。', note: '「自为」谓自立为君，「自坏」谓自己毁坏。',
        examples: [{ text: '其勢皆足以逐君而自為', at: '周紀一' }, { text: '乃天子自壞之也', at: '周紀一' }] },
      { id: 'zi4-from', pos: '介', gloss: '从；由。', note: '介词，表示时间或处所的起点。',
        examples: [{ text: '自古昔以來，國之亂臣', at: '周紀一' }] },
    ],
  },
  '卒': {
    pinyin: 'zú',
    pos: '动',
    uses: [
      { id: 'zu2-die', gloss: '死。', note: '胡注：「卒，子恤翻。」',
        examples: [{ text: '及智宣子卒，智襄子為政', at: '周紀一' }, { text: '襄子卒，弟桓子嘉逐浣而自立', at: '周紀一' }] },
      { id: 'zu2-finally', pos: '副', gloss: '终于；到底（副词）。', note: '胡注：「卒，子恤翻，终也。」',
        examples: [{ text: '然而卒不敢者', at: '周紀一' }] },
      { id: 'zu2-soldier', pos: '名', gloss: '士兵。', note: '胡注：「卒，臧没翻。」《说文》：「吏人给事者衣为卒。」',
        examples: [{ text: '襄子將卒犯其前', at: '周紀一' }] },
    ],
  },
  '忍': {
    pinyin: 'rěn',
    pos: '动',
    uses: [
      { id: 'ren3-bear', gloss: '忍心；狠心。', note: '全卷仅一见，无第二处用例，故不举例。「心不忍」谓于心不忍。',
        examples: [] },
    ],
  },
  '乃': {
    pinyin: 'nǎi',
    pos: '副',
    uses: [
      { id: 'nai3-then', gloss: '副，于是；就。', note: '承接前事，表先后相因。',
        examples: [{ text: '乃書訓戒之辭於二簡', at: '周紀一' }, { text: '乃共殺其子，復迎浣而立之', at: '周紀一' }] },
      { id: 'nai3-but', gloss: '副，是；就是，用于「非……乃……」的辨正。', note: '「非三晋之坏礼，乃天子自坏之也」即不是三晋坏了礼，而是天子自己坏了礼。',
        examples: [{ text: '乃天子自壞之也', at: '周紀一' }] },
      { id: 'nai3-only-now', gloss: '副，才。', note: '「乃今」连用，表直到此时才明白。',
        examples: [{ text: '吾乃今知水可以亡人國也', at: '周紀一' }] },
      { id: 'nai3-wunai', gloss: '与「无」合成「无乃……乎」，表揣测：恐怕……吧。', note: '「无乃不可乎」即恐怕不可以吧。',
        examples: [{ text: '曰不敢興難，無乃不可乎', at: '周紀一' }] },
    ],
  },
  '畏': {
    pinyin: 'wèi',
    pos: '动',
    uses: [
      { id: 'wei4-fear', gloss: '畏惧；害怕', note: '全卷仅一见，无第二处用例，故不举例。「畏奸名犯分」谓畏惧触犯名分而遭天下共诛。',
        examples: [] },
    ],
  },
  '奸': {
    pinyin: 'jiān',
    readings: ['jiān', 'gān'],
    pos: '动',
    uses: [
      { id: 'gan1-violate', gloss: '冒犯；干犯。', note: '读 gān。胡注：「奸，居寒翻，亦犯也。」「奸名犯分」就是冒犯名分。',
        reading: 'gān',
        examples: [{ text: '乃畏奸名犯分', at: '周紀一' }] },
      { id: 'jian1-evil', pos: '名', gloss: '奸邪；奸谋。', note: '读 jiān。「遂其奸」指实现他的奸谋。',
        reading: 'jiān',
        examples: [{ text: '小人智足以遂其奸', at: '周紀一' }] },
    ],
    variants: ['姧'],
  },
  '犯': {
    pinyin: 'fàn',
    pos: '动',
    uses: [
      { id: 'fan4-violate', gloss: '触犯；违犯', note: '「奸名犯分」「犯义侵礼」都是此义。',
        examples: [{ text: '乃畏奸名犯分而天下共誅之也', at: '周紀一' }, { text: '苟不顧天下之誅而犯義侵禮', at: '周紀一' }] },
      { id: 'fan4-attack', gloss: '进犯；冲击', note: '「犯其前」谓从正面冲击。',
        examples: [{ text: '襄子將卒犯其前', at: '周紀一' }] },
    ],
  },
  '共': {
    pinyin: 'gòng',
    pos: '副',
    uses: [
      { id: 'gong4-jointly', gloss: '共同；一起。', note: '「共诛之」即一同讨伐他。',
        examples: [{ text: '而天下共誅之也', at: '周紀一' }, { text: '乃共殺其子，復迎浣而立之', at: '周紀一' }] },
    ],
  },
  '誅': {
    pinyin: 'zhū',
    pos: '动',
    uses: [
      { id: 'zhu1-punish', gloss: '讨伐；诛杀。', note: '「天下之诛」是名词性用法，指天下的讨伐。',
        examples: [{ text: '天下共誅之也', at: '周紀一' }, { text: '不顧天下之誅', at: '周紀一' }] },
    ],
  },
  '今': {
    pinyin: 'jīn',
    pos: '副',
    uses: [
      { id: 'jin1-now', gloss: '现在；如今。', note: '本卷六见，皆指说话时的当下。',
        examples: [{ text: '今晉大夫暴蔑其君', at: '周紀一' }, { text: '吾乃今知水可以亡人國也', at: '周紀一' }] },
    ],
  },
  '蔑': {
    pinyin: 'miè',
    pos: '动',
    uses: [
      { id: 'mie4-slight', gloss: '轻视；欺凌。「暴蔑」即欺凌。', note: '全卷仅一见，无第二处用例，故不举例。此句指晋大夫欺凌其君。',
        examples: [] },
    ],
  },
  '剖': {
    pinyin: 'pōu',
    pos: '动',
    uses: [
      { id: 'pou1-split', gloss: '剖开；分割。', note: '全卷仅一见，无第二处用例，故不举例。「剖分晋国」即把晋国分割开来；胡注引《史记·六国年表》，系于周定王十六年。',
        examples: [] },
    ],
  },
  '討': {
    pinyin: 'tǎo',
    pos: '动',
    uses: [
      { id: 'tao3-punish', gloss: '讨伐；声讨', note: '本卷两见，皆就天子对晋大夫而言：一为不能讨，一为问谁得而讨之。',
        examples: [{ text: '剖分晉國，天子既不能討', at: '周紀一' }, { text: '誰得而討之！', at: '周紀一' }] },
    ],
  },
  '寵': {
    pinyin: 'chǒng',
    pos: '动',
    uses: [
      { id: 'chong3-favor', gloss: '宠爱；加恩。', note: '全卷仅一见（「又宠秩之」），无第二处用例，故不举例。此指周天子反加恩宠、提升其秩位。',
        examples: [] },
    ],
  },
  '秩': {
    pinyin: 'zhì',
    pos: '动',
    uses: [
      { id: 'zhi4-rank', gloss: '本指官秩、爵禄，此作动词，谓授以秩位', note: '全卷仅一见，无第二处用例，故不举例。「宠秩之」谓宠爱他而给他秩位。',
        examples: [] },
    ],
  },
  '列': {
    pinyin: 'liè',
    pos: '动',
    uses: [
      { id: 'lie4-rank', gloss: '位列；列名其中。', note: '「列于诸侯」即位列诸侯之中。',
        examples: [{ text: '又寵秩之，使列於諸侯', at: '周紀一' }, { text: '故三晉之列於諸侯', at: '周紀一' }] },
    ],
  },
  '區': {
    pinyin: 'qū',
    pos: '形',
    uses: [
      { id: 'qu1-petty', gloss: '小；微小，「区区」即小小。', note: '本卷「区」两见，都在「区区」一词之中，指那一点名分。',
        examples: [{ text: '是區區之名分', at: '周紀一' }] },
    ],
  },
  '復': {
    pinyin: 'fù',
    pos: '副',
    uses: [
      { id: 'fu4-again', gloss: '又；再。', note: '胡注：「复，扶又翻。」本卷三见，皆表动作重复。',
        examples: [{ text: '是區區之名分復不能守而並棄之也', at: '周紀一' }, { text: '乃共殺其子，復迎浣而立之', at: '周紀一' }] },
    ],
  },
  '並': {
    pinyin: 'bìng',
    pos: '副',
    uses: [
      { id: 'bing4-together', gloss: '一并；一起。', note: '全卷仅一见，无第二处用例，故不举例。「并弃之」谓连名分也一并丢掉。',
        examples: [] },
    ],
  },
  '棄': {
    pinyin: 'qì',
    pos: '动',
    uses: [
      { id: 'qi4-discard', gloss: '抛弃；舍弃。', note: '全卷仅一见，无第二处用例，故不举例。「并弃之」是说连区区之名分也一并丢掉。',
        examples: [] },
    ],
  },
  '盡': {
    pinyin: 'jìn',
    pos: '动',
    uses: [
      { id: 'jin4-exhausted', gloss: '穷尽；完结', note: '「先王之礼于斯尽矣」谓先王的礼制到此完结。',
        examples: [{ text: '先王之禮於斯盡矣。', at: '周紀一' }] },
      { id: 'jin4-all', pos: '副', gloss: '全部；全都；完全', note: '「尽灭」谓全部消灭，「几尽」谓几乎尽绝，「全尽」谓完全具备。胡注：「几，居依翻，又渠希翻，近也。」',
        examples: [{ text: '遂殺智伯，盡滅智氏之族', at: '周紀一' }, { text: '生民之類糜滅幾盡', at: '周紀一' }, { text: '是故才德全盡謂之聖人', at: '周紀一' }] },
    ],
  },
  '或': {
    pinyin: 'huò',
    pos: '代',
    uses: [
      { id: 'huo4-someone', gloss: '有人；或者。', note: '全卷仅一见（「或者以为」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '時': {
    pinyin: 'shí',
    pos: '名',
    uses: [
      { id: 'shi2-time', gloss: '时候；时期', note: '全卷仅一见，无第二处用例，故不举例。「当是之时」谓在那时候。',
        examples: [] },
    ],
  },
  '弱': {
    pinyin: 'ruò',
    pos: '形',
    uses: [
      { id: 'ruo4-weak', gloss: '弱小；衰弱。', note: '全卷仅一见，指周室微弱，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '盛': {
    pinyin: 'shèng',
    pos: '形',
    uses: [
      { id: 'sheng4-flourishing', gloss: '强盛；盛大。', note: '「三晋强盛」与上文「周室微弱」对举。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '勿': {
    pinyin: 'wù',
    pos: '副',
    uses: [
      { id: 'wu4-not', gloss: '不；不要。', note: '全卷仅一见，即「虽欲勿许」，谓即使想不答应。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '苟': {
    pinyin: 'gǒu',
    pos: '连',
    uses: [
      { id: 'gou3-if', gloss: '如果；假使。', note: '本卷四见，皆提出一个假设。',
        examples: [{ text: '苟不顧天下之誅而犯義侵禮', at: '周紀一' }, { text: '天下苟有桓、文之君', at: '周紀一' }, { text: '苟能審於才德之分而知所先後', at: '周紀一' }] },
    ],
    variants: ['茍'],
  },
  '顧': {
    pinyin: 'gù',
    pos: '动',
    uses: [
      { id: 'gu4-consider', gloss: '动，顾念；顾及。', note: '「不顾天下之诛」即不顾忌天下的诛讨。',
        examples: [{ text: '苟不顧天下之誅', at: '周紀一' }] },
      { id: 'gu4-on-the-contrary', pos: '副', gloss: '副，反而；却。', note: '「顾不易邪」即岂不更容易吗，是反诘的语气。',
        examples: [{ text: '子乃為所欲為，顧不易邪', at: '周紀一' }] },
    ],
  },
  '義': {
    pinyin: 'yì',
    pos: '名',
    uses: [
      { id: 'yi4-righteousness', gloss: '道义；礼义', note: '本卷与「礼」并举：「犯义侵礼」「奉礼义而征之」。',
        examples: [{ text: '苟不顧天下之誅而犯義侵禮', at: '周紀一' }, { text: '必奉禮義而征之', at: '周紀一' }] },
      { id: 'yi4-righteous-man', pos: '形', gloss: '形容词用法：有节义的', note: '「义士」谓有节义之人，是襄子称豫让之语。',
        examples: [{ text: '而此人欲為報仇，真義士也', at: '周紀一' }] },
    ],
  },
  '侵': {
    pinyin: 'qīn',
    pos: '动',
    uses: [
      { id: 'qin1-encroach', gloss: '侵犯；侵越。', note: '全卷仅一见（「犯义侵礼」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '立': {
    pinyin: 'lì',
    pos: '动',
    uses: [
      { id: 'li4-stand', pos: '副', gloss: '立；即刻', note: '「祸立至矣」谓祸患立刻到来。',
        examples: [{ text: '恐事未遂而謀洩，則禍立至矣', at: '周紀一' }] },
      { id: 'li4-enthrone', gloss: '立为君；确立继承人', note: '「立以为后」「逐浣而自立」都是此义，本卷最多。',
        examples: [{ text: '於是簡子以無恤為賢，立以為後。', at: '周紀一' }, { text: '弟桓子嘉逐浣而自立', at: '周紀一' }] },
    ],
  },
  '悖': {
    pinyin: 'bèi',
    pos: '形',
    uses: [
      { id: 'bei4-perverse', gloss: '悖逆；违背。', note: '全卷仅一见，指不请命而自立是悖逆之臣，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '逆': {
    pinyin: 'nì',
    pos: '形',
    uses: [
      { id: 'ni4-rebellious', gloss: '违背；叛逆。', note: '「悖逆之臣」谓违逆的臣子。胡注：悖，蒲内翻，又蒲没翻。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '桓': {
    pinyin: 'huán',
    pos: '专名',
    uses: [
      { id: 'huan2-duke', gloss: '人名。齐桓公，春秋霸主，与晋文公并称「桓、文」。', note: '「天下苟有桓、文之君」之桓即齐桓公。',
        examples: [{ text: '天下苟有桓、文之君，必奉禮義而征之', at: '周紀一' }] },
      { id: 'huan2-weihuanzi', gloss: '人名。魏桓子，魏氏宗主，名驹。', note: '胡注：「魏桓子，魏献子之子曼多之孙驹也。」本卷多见，或省称「桓子」。',
        examples: [{ text: '與韓康子、魏桓子宴於藍臺', at: '周紀一' }, { text: '又求地於魏桓子，桓子欲弗與', at: '周紀一' }] },
      { id: 'huan2-zhaohuanzi', gloss: '人名。赵桓子嘉，赵襄子之弟。', note: '「襄子卒，弟桓子嘉逐浣而自立」。胡注引《史记》六国表系其事于威烈王二年。',
        examples: [{ text: '襄子卒，弟桓子嘉逐浣而自立', at: '周紀一' }, { text: '趙氏之人曰：「桓子立，非襄主意。」', at: '周紀一' }] },
    ],
  },
  '奉': {
    pinyin: 'fèng',
    pos: '动',
    uses: [
      { id: 'feng4-honour', gloss: '奉行；遵奉。', note: '全卷仅一见，无第二处用例，故不举例。「奉礼义而征之」谓遵奉礼义去讨伐。',
        examples: [] },
    ],
  },
  '誰': {
    pinyin: 'shuí',
    pos: '代',
    uses: [
      { id: 'shui2-who', gloss: '代，谁；哪个人。', note: '用于反问。',
        examples: [{ text: '我不為難，誰敢興之', at: '周紀一' }, { text: '而為諸侯也，誰得而討之', at: '周紀一' }] },
      { id: 'shui2-qi', gloss: '与「其」连用，「其谁……」，表反问：还有谁。', note: '「其谁能待之」即谁还能容得下他；「其谁与我」即谁还肯跟我，胡注引韦昭：谓谁与我同力也。',
        examples: [{ text: '而以不仁行之，其誰能待之', at: '周紀一' }, { text: '又斃死以守之，其誰與我', at: '周紀一' }] },
    ],
  },
  '雄': {
    pinyin: 'xióng',
    pos: '动',
    uses: [
      { id: 'xiong2-vie-for-power', gloss: '称雄；争雄。「雄长」谓以智力相争而居长', note: '全卷仅一见，无第二处用例，故不举例。胡注：「长，知两翻。」',
        examples: [] },
    ],
  },
  '長': {
    pinyin: 'cháng',
    readings: ['cháng', 'zhǎng'],
    pos: '形',
    uses: [
      { id: 'chang2-long', gloss: '长；长久。', note: '读 cháng。「命必不长」指国运不长久；「美鬓长大」指身材高大。',
        reading: 'cháng',
        examples: [{ text: '智氏之命必不長矣', at: '周紀一' }, { text: '美鬢長大則賢', at: '周紀一' }] },
      { id: 'zhang3-eldest', gloss: '年长的；排行第一的。', note: '读 zhǎng。胡注：「长，知两翻。」「长曰伯鲁」指长子伯鲁。',
        reading: 'zhǎng',
        examples: [{ text: '趙簡子之子，長曰伯魯', at: '周紀一' }, { text: '長子近，且城厚完', at: '周紀一' }] },
      { id: 'zhang3-superior', pos: '动', gloss: '居首位；争雄长。', note: '读 zhǎng。胡注：「长，知两翻。」「相雄长」指互争雄长。',
        reading: 'zhǎng',
        examples: [{ text: '則天下以智力相雄長', at: '周紀一' }] },
    ],
  },
  '遂': {
    pinyin: 'suì',
    pos: '副',
    uses: [
      { id: 'sui4-then', gloss: '于是；就', note: '表承接，用于叙事。',
        examples: [{ text: '遂殺智伯，盡滅智氏之族。', at: '周紀一' }, { text: '遂使聖賢之後為諸侯者', at: '周紀一' }] },
      { id: 'sui4-accomplish', pos: '动', gloss: '成；达到；逞', note: '此为动词用法，「事未遂」谓事情未成，「遂其奸」谓逞其奸计。',
        examples: [{ text: '恐事未遂而謀洩', at: '周紀一' }, { text: '小人智足以遂其奸', at: '周紀一' }] },
    ],
  },
  '賢': {
    pinyin: 'xián',
    pos: '形',
    uses: [
      { id: 'xian2-virtuous', gloss: '贤能；有德才。', note: '「以为贤」即认为他贤；「则贤」即算作一项长处。',
        examples: [{ text: '於是簡子以無恤為賢', at: '周紀一' }, { text: '美鬢長大則賢', at: '周紀一' }] },
      { id: 'xian2-the-wise', pos: '名', gloss: '名词：贤人；有德才的人。', note: '「通谓之贤」即笼统地称他为贤人。',
        examples: [{ text: '而世俗莫之能辨，通謂之賢', at: '周紀一' }, { text: '遂使聖賢之後為諸侯者', at: '周紀一' }] },
      { id: 'xian2-surpass', pos: '动', gloss: '胜过；超过。', note: '「贤于人者五」即超过别人的地方有五处。',
        examples: [{ text: '瑤之賢於人者五', at: '周紀一' }] },
    ],
  },
  '社': {
    pinyin: 'shè',
    pos: '名',
    uses: [
      { id: 'she4-earth-god', gloss: '土神；「社稷」连用指国家。', note: '「社稷无不泯绝」谓国家无不灭亡。胡注：泯，尽也，又没也、灭也。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '稷': {
    pinyin: 'jì',
    pos: '名',
    uses: [
      { id: 'ji4-sheji', gloss: '社稷：土神与谷神，代指国家。', note: '全卷仅一见，即「社稷无不泯绝」，谓诸侯之国无不灭亡。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '泯': {
    pinyin: 'mǐn',
    pos: '动',
    uses: [
      { id: 'min3-extinct', gloss: '消灭；尽。「泯绝」即灭绝。', note: '全卷仅一见，无第二处用例，故不举例。胡注：「泯，弥忍翻，尽也。」',
        examples: [] },
    ],
  },
  '糜': {
    pinyin: 'mí',
    pos: '动',
    uses: [
      { id: 'mi2-mash', gloss: '糜烂；碎。', note: '全卷仅一见，无第二处用例，故不举例。胡注引《说文》：糜，糁也，取糜烂之义；「糜灭几尽」即几乎消亡殆尽。',
        examples: [] },
    ],
  },
  '滅': {
    pinyin: 'miè',
    pos: '动',
    uses: [
      { id: 'mie4-destroy', gloss: '灭亡；消灭', note: '本卷三见：智宗之必灭、智氏之族之尽灭、生民之类之糜灭，皆此义。',
        examples: [{ text: '若果立瑤也，智宗必滅', at: '周紀一' }, { text: '遂殺智伯，盡滅智氏之族', at: '周紀一' }, { text: '生民之類糜滅幾盡', at: '周紀一' }] },
    ],
  },
  '哀': {
    pinyin: 'āi',
    pos: '形',
    uses: [
      { id: 'ai1-sorrow', gloss: '悲哀；可哀。', note: '全卷仅一见（「岂不哀哉」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '宣': {
    pinyin: 'xuān',
    pos: '专名',
    uses: [
      { id: 'xuan1-name', gloss: '人名用字。智宣子，智伯之父', note: '本卷未见宣布、宣示义的「宣」；两见都在「智宣子」这一称号里。',
        examples: [{ text: '初，智宣子將以瑤為後。', at: '周紀一' }, { text: '及智宣子卒，智襄子為政', at: '周紀一' }] },
    ],
  },
  '將': {
    pinyin: 'jiāng',
    readings: ['jiāng', 'jiàng'],
    pos: '副',
    uses: [
      { id: 'jiang1-about-to', gloss: '将要；快要。', note: '表将来。',
        reading: 'jiāng',
        examples: [{ text: '初，智宣子將以瑤為後。', at: '周紀一' }, { text: '將置後，不知所立。', at: '周紀一' }, { text: '智伯曰：「難將由我。', at: '周紀一' }] },
      { id: 'jiang1-want', gloss: '「将欲」：想要。', note: '引《周书》语，「将欲败之」「将欲取之」即想要败坏他、想要夺取他。',
        reading: 'jiāng',
        examples: [{ text: '將欲敗之，必姑輔之', at: '周紀一' }, { text: '將欲取之，必姑與之', at: '周紀一' }] },
      { id: 'jiang4-lead', pos: '动', gloss: '率领。', note: '读 jiàng。「将卒犯其前」即率领士兵冲击敌军前阵。',
        reading: 'jiàng',
        examples: [{ text: '襄子將卒犯其前', at: '周紀一' }] },
    ],
    variants: ['将'],
  },
  '瑤': {
    pinyin: 'yáo',
    pos: '专名',
    uses: [
      { id: 'yao2-name', gloss: '智瑶，智宣子之子，即智伯。', note: '本卷只作人名，不作「美玉」讲。智宣子立他为后，智果以为智宗必灭。',
        examples: [{ text: '初，智宣子將以瑤為後。', at: '周紀一' }, { text: '若果立瑤也，智宗必滅', at: '周紀一' }] },
    ],
    variants: ['瑶'],
  },
  '果': {
    pinyin: 'guǒ',
    pos: '专名',
    uses: [
      { id: 'guo3-zhiguo', gloss: '人名。智果，智氏之族；别族之后为辅果。', note: '胡注引韦昭曰：「智果，智氏之族也。」',
        examples: [{ text: '智果曰：「不如宵也', at: '周紀一' }, { text: '智果別族於太史為輔氏', at: '周紀一' }] },
      { id: 'guo3-bold', pos: '形', gloss: '果敢；果决。', note: '「强毅果敢则贤」谓刚强坚毅、果断勇敢是其一长。',
        examples: [{ text: '強毅果敢則賢', at: '周紀一' }] },
      { id: 'guo3-really', pos: '副', gloss: '果真；当真（副词）。', note: '「若果立瑶也」谓如果真立了瑶。',
        examples: [{ text: '若果立瑤也，智宗必滅', at: '周紀一' }] },
    ],
  },
  '宵': {
    pinyin: 'xiāo',
    pos: '专名',
    uses: [
      { id: 'xiao1-name', gloss: '人名。智宣子的庶子，智果主张立他为后。', note: '胡注引韦昭：「宵，宣子之庶子也。」本卷只此一见。',
        examples: [] },
    ],
  },
  '五': {
    pinyin: 'wǔ',
    pos: '数',
    uses: [
      { id: 'wu3-five', gloss: '数词，五。', note: '可以数德性，也可以数人。',
        examples: [{ text: '瑤之賢於人者五', at: '周紀一' }, { text: '夫以其五賢陵人', at: '周紀一' }, { text: '有子五人，不肯置後', at: '周紀一' }] },
    ],
  },
  '逮': {
    pinyin: 'dài',
    pos: '动',
    uses: [
      { id: 'dai4-reach', gloss: '及；赶上。「不逮」谓不及、不如', note: '全卷仅一见，无第二处用例，故不举例。此语出智果论智伯「贤于人者五，其不逮者一」，即五长而一短。胡注引韦昭曰：「不仁也。」',
        examples: [] },
    ],
  },
  '美': {
    pinyin: 'měi',
    pos: '形',
    uses: [
      { id: 'mei3-beautiful', gloss: '美好；美观。', note: '全卷仅一见（「美鬓长大」），无第二处用例，故不举例。胡注引《国语》作「美鬓」，并说俗本多误作「美须」。',
        examples: [] },
    ],
  },
  '鬢': {
    pinyin: 'bìn',
    pos: '名',
    uses: [
      { id: 'bin4-hair', gloss: '鬓发；耳前的头发', note: '全卷仅一见，无第二处用例，故不举例。胡三省注：《通鉴》俗传写者多作「美须」，非也，《国语》作「美鬓」。',
        examples: [] },
    ],
  },
  '射': {
    pinyin: 'shè',
    pos: '动',
    uses: [
      { id: 'she4-archery', gloss: '射箭。', note: '全卷仅一见，指智瑶擅长射箭驾车，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '御': {
    pinyin: 'yù',
    pos: '动',
    uses: [
      { id: 'yu4-drive', gloss: '驾车；驾驭。', note: '胡注：兵车尊者居左，御者居中。「射御」是六艺之二，指射箭与驾车。',
        examples: [{ text: '智伯行水，魏桓子御', at: '周紀一' }, { text: '射御足力則賢', at: '周紀一' }] },
    ],
  },
  '伎': {
    pinyin: 'jì',
    pos: '名',
    uses: [
      { id: 'ji4-skill', gloss: '技艺；才能。', note: '全卷仅一见，即「伎艺毕给则贤」，谓技艺才能兼备。无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['𠆸'],
  },
  '藝': {
    pinyin: 'yì',
    pos: '名',
    uses: [
      { id: 'yi4-skill', gloss: '技艺；技能。「伎艺」即技能。', note: '全卷仅一见，无第二处用例，故不举例。「伎艺毕给」谓技能都具备。',
        examples: [] },
    ],
  },
  '畢': {
    pinyin: 'bì',
    pos: '副',
    uses: [
      { id: 'bi4-all', gloss: '全部；完全。', note: '全卷仅一见，无第二处用例，故不举例。「伎艺毕给」是说技艺样样具备。',
        examples: [] },
    ],
  },
  '給': {
    pinyin: 'jǐ',
    pos: '动',
    uses: [
      { id: 'ji3-sufficient', gloss: '丰足；具备。「毕给」谓完全具备', note: '全卷仅一见，无第二处用例，故不举例。此处读上声，取「足备」之义，非今「给予」之义。',
        examples: [] },
    ],
  },
  '巧': {
    pinyin: 'qiǎo',
    pos: '形',
    uses: [
      { id: 'qiao3-clever', gloss: '巧；机巧。', note: '全卷仅一见（「巧文辩慧」），无第二处用例，故不举例。此指文辞巧饰。',
        examples: [] },
    ],
  },
  '辯': {
    pinyin: 'biàn',
    pos: '形',
    uses: [
      { id: 'bian4-eloquent', gloss: '有口才；能言善辩', note: '全卷仅一见，无第二处用例，故不举例。「巧文辩慧」谓善于文辞、口才聪慧。',
        examples: [] },
    ],
  },
  '慧': {
    pinyin: 'huì',
    pos: '形',
    uses: [
      { id: 'hui4-clever', gloss: '聪慧；机敏。', note: '全卷仅一见，与「巧文辩」连用，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '毅': {
    pinyin: 'yì',
    pos: '形',
    uses: [
      { id: 'yi4-resolute', gloss: '刚强；果决。', note: '本卷「强毅」两见，都指刚强果决的才性。',
        examples: [{ text: '強毅果敢則賢', at: '周紀一' }, { text: '夫聰察強毅之謂才', at: '周紀一' }] },
    ],
  },
  '甚': {
    pinyin: 'shèn',
    pos: '副',
    uses: [
      { id: 'shen4-very', gloss: '很；非常。', note: '本卷两见，皆作程度副词。胡注于「诵其辞甚习」下云：「习，熟也。」',
        examples: [{ text: '如是而甚不仁', at: '周紀一' }, { text: '誦其辭甚習，求其簡', at: '周紀一' }] },
    ],
  },
  '行': {
    pinyin: 'xíng',
    pos: '动',
    uses: [
      { id: 'xing2-practise', gloss: '实行；做。', note: '读 xíng（如字）。「以不仁行之」谓用不仁之心去做。',
        examples: [{ text: '夫以其五賢陵人，而以不仁行之', at: '周紀一' }] },
      { id: 'xing2-walk', gloss: '走；行走。', note: '读 xíng（如字）。「行乞」即沿途乞讨，「行见其友」即路上遇见朋友。',
        examples: [{ text: '行乞於市，其妻不識也', at: '周紀一' }, { text: '行見其友，其友識之', at: '周紀一' }] },
      { id: 'xing2-tour', gloss: '巡行；视察。', note: '胡注：「凡巡行之行，音下孟翻。」古去声一读 xìng，指巡行视察；今普通话读 xíng。本卷未见「行列」的 háng 一读。',
        examples: [{ text: '智伯行水，魏桓子御', at: '周紀一' }] },
    ],
  },
  '若': {
    pinyin: 'ruò',
    pos: '连',
    uses: [
      { id: 'ruo4-if', gloss: '连，如果。', note: '「若果立瑶也」即如果真的立了瑶。',
        examples: [{ text: '若果立瑤也，智宗必滅', at: '周紀一' }] },
      { id: 'ruo4-not-as-good', pos: '动', gloss: '动，及；比得上，多用于「不若」。', note: '「不若得愚人」即不如得到愚人。',
        examples: [{ text: '與其得小人，不若得愚人', at: '周紀一' }] },
    ],
  },
  '弗': {
    pinyin: 'fú',
    pos: '副',
    uses: [
      { id: 'fu2-not', gloss: '不', note: '否定副词，多修饰及物动词而省宾语，如「弗听」。全卷八见。',
        examples: [{ text: '弗聽，智果別族於太史為輔氏', at: '周紀一' }, { text: '智伯請地於韓康子，康子欲弗與', at: '周紀一' }, { text: '又弗備，曰不敢興難', at: '周紀一' }] },
    ],
  },
  '聽': {
    pinyin: 'tīng',
    pos: '动',
    uses: [
      { id: 'ting1-heed', gloss: '听从；接受劝谏。', note: '「弗听」是《通鉴》记言的套语；本卷两见，一在智果谏智宣子，一在智国谏智伯。',
        examples: [{ text: '弗聽，智果別族於太史為輔氏', at: '周紀一' }, { text: '況君相乎！」弗聽', at: '周紀一' }] },
    ],
  },
  '族': {
    pinyin: 'zú',
    pos: '名',
    uses: [
      { id: 'zu2-clan', gloss: '宗族；家族', note: '「智氏之族」谓智氏一族。',
        examples: [{ text: '遂殺智伯，盡滅智氏之族。', at: '周紀一' }] },
      { id: 'zu2-branch', pos: '动', gloss: '「别族」，别立一族', note: '「智果别族于太史为辅氏」谓智果向太史登记，别立为辅氏。',
        examples: [{ text: '智果別族於太史為輔氏', at: '周紀一' }] },
    ],
  },
  '史': {
    pinyin: 'shǐ',
    pos: '名',
    uses: [
      { id: 'shi3-historian', gloss: '史官；太史。', note: '全卷仅一见，指智果到太史那里登记别族，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '輔': {
    pinyin: 'fǔ',
    pos: '动',
    uses: [
      { id: 'fu3-assist', gloss: '辅助；帮助。', note: '《周书》引语的「辅之」即帮助他。',
        examples: [{ text: '將欲敗之，必姑輔之', at: '周紀一' }] },
      { id: 'fu3-clan', pos: '专名', gloss: '姓氏用字：辅氏、辅果。', note: '智果谏而不听，别族于太史，为辅氏，故灭族之后独有辅果得存。胡注：以别族也。',
        examples: [{ text: '智果別族於太史為輔氏', at: '周紀一' }] },
    ],
  },
  '簡': {
    pinyin: 'jiǎn',
    pos: '专名',
    uses: [
      { id: 'jian3-zhaojianzi', gloss: '人名。赵简子，名鞅，晋国正卿，赵襄子之父。', note: '胡注引《谥法》：「一德不懈曰简。」本卷或省称「简子」。',
        examples: [{ text: '趙簡子之子，長曰伯魯，幼曰無恤。', at: '周紀一' }, { text: '於是簡子以無恤為賢，立以為後。', at: '周紀一' }] },
      { id: 'jian3-slip', pos: '名', gloss: '竹简；写字用的竹片。', note: '胡注：「简，竹策也。」赵简子书训戒之辞于二简以授二子。',
        examples: [{ text: '乃書訓戒之辭於二簡', at: '周紀一' }, { text: '求其簡，出諸袖中而奏之', at: '周紀一' }] },
    ],
    variants: ['𥳑'],
  },
  '幼': {
    pinyin: 'yòu',
    pos: '形',
    uses: [
      { id: 'you4-young', gloss: '年幼的；小的（与「长」相对）。', note: '全卷仅一见，无第二处用例，故不举例。此句谓伯鲁年长、无恤年幼。',
        examples: [] },
    ],
  },
  '恤': {
    pinyin: 'xù',
    pos: '专名',
    uses: [
      { id: 'xu4-name', gloss: '专名。人名用字：无恤，赵简子之子，即赵襄子。', note: '全卷四见都在「无恤」这个名字里。胡注：赵简子，文子之孙鞅也。单用的「忧恤」义本卷未见。',
        examples: [{ text: '於是簡子以無恤為賢', at: '周紀一' }, { text: '問無恤，誦其辭甚習', at: '周紀一' }] },
    ],
  },
  '置': {
    pinyin: 'zhì',
    pos: '动',
    uses: [
      { id: 'zhi4-establish-heir', gloss: '设立；确立（继承人）', note: '本卷两见皆作「置后」，谓确立继承人：一为赵简子之犹豫，一为赵襄子之不肯。',
        examples: [{ text: '將置後，不知所立', at: '周紀一' }, { text: '有子五人，不肯置後', at: '周紀一' }] },
    ],
  },
  '知': {
    pinyin: 'zhī',
    pos: '动',
    uses: [
      { id: 'zhi1-know', gloss: '知道；明白。', note: '本卷「知」都读 zhī，未见通「智」的用法。',
        examples: [{ text: '將置後，不知所立', at: '周紀一' }, { text: '我心知其然也', at: '周紀一' }] },
      { id: 'zhi1-perceive', gloss: '察知；看出。', note: '「以人事知之」指从人情事理上看出来。',
        examples: [{ text: '智伯曰：「子何以知之？」', at: '周紀一' }, { text: '知臣得其情故也', at: '周紀一' }] },
    ],
  },
  '訓': {
    pinyin: 'xùn',
    pos: '名',
    uses: [
      { id: 'xun4-instruction', gloss: '教诲；训诫的话', note: '全卷仅一见，无第二处用例，故不举例。「训戒之辞」谓告戒的言辞。',
        examples: [] },
    ],
  },
  '戒': {
    pinyin: 'jiè',
    pos: '名',
    uses: [
      { id: 'jie4-admonition', gloss: '训戒；告诫之辞。', note: '全卷仅一见，指赵简子写在竹简上的训戒之辞，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '授': {
    pinyin: 'shòu',
    pos: '动',
    uses: [
      { id: 'shou4-give', gloss: '交给；授予。', note: '「以授二子」谓把训戒之辞交给两个儿子。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '問': {
    pinyin: 'wèn',
    pos: '动',
    uses: [
      { id: 'wen4-ask', gloss: '询问；考问。', note: '本卷两见，皆指赵简子三年后考问二子所记的训辞。',
        examples: [{ text: '三年而問之，伯魯不能舉其辭', at: '周紀一' }, { text: '問無恤，誦其辭甚習', at: '周紀一' }] },
    ],
  },
  '舉': {
    pinyin: 'jǔ',
    pos: '动',
    uses: [
      { id: 'ju3-recite', gloss: '列举；说出来。', note: '全卷仅一见，无第二处用例，故不举例。「不能举其辞」谓背不出那些话。本卷未见「举起」「推举」义。',
        examples: [] },
    ],
  },
  '求': {
    pinyin: 'qiú',
    pos: '动',
    uses: [
      { id: 'qiu2-seek', gloss: '动，寻找。', note: '「求其简」即找那两片竹简。',
        examples: [{ text: '求其簡，已失之矣', at: '周紀一' }, { text: '求其簡，出諸袖中而奏之', at: '周紀一' }] },
      { id: 'qiu2-demand', gloss: '动，索求；要求。', note: '「求地」即索要土地。',
        examples: [{ text: '又求地於魏桓子', at: '周紀一' }, { text: '智伯又求藺、皋狼之地於趙襄子', at: '周紀一' }] },
      { id: 'qiu2-strive', gloss: '动，谋求；希求。', note: '「求以报仇」即希望借此报仇。',
        examples: [{ text: '求以報仇，不亦難乎', at: '周紀一' }] },
    ],
  },
  '誦': {
    pinyin: 'sòng',
    pos: '动',
    uses: [
      { id: 'song4-recite', gloss: '背诵；诵读', note: '全卷仅一见，无第二处用例，故不举例。胡注：「习，熟也。」谓无恤背诵训辞极熟。',
        examples: [] },
    ],
  },
  '習': {
    pinyin: 'xí',
    pos: '形',
    uses: [
      { id: 'xi2-practiced', gloss: '熟习；熟练。', note: '全卷仅一见（「诵其辞甚习」），无第二处用例，故不举例。胡注：「习，熟也。」',
        examples: [] },
    ],
  },
  '出': {
    pinyin: 'chū',
    pos: '动',
    uses: [
      { id: 'chu1-go-out', gloss: '出来；退出', note: '「二子出」谓二人退出，「襄子出」谓襄子出门。',
        examples: [{ text: '二子出，絺疵入曰', at: '周紀一' }, { text: '襄子出，豫讓伏於橋下。', at: '周紀一' }] },
      { id: 'chu1-take-out', gloss: '拿出；取出', note: '「出诸袖中」谓从袖中取出。',
        examples: [{ text: '求其簡，出諸袖中而奏之', at: '周紀一' }] },
      { id: 'chu1-from', gloss: '出自；出于', note: '「谋出二主之口」谓计谋出自二位主君之口。',
        examples: [{ text: '謀出二主之口，入臣之耳', at: '周紀一' }] },
    ],
  },
  '袖': {
    pinyin: 'xiù',
    pos: '名',
    uses: [
      { id: 'xiu4-sleeve', gloss: '衣袖。', note: '全卷仅一见，指无恤从袖中取出竹简，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '中': {
    pinyin: 'zhōng',
    pos: '名',
    uses: [
      { id: 'zhong1-inside', gloss: '里面；中间。', note: '本卷「袖中」「宫中」都是此义。',
        examples: [{ text: '出諸袖中而奏之', at: '周紀一' }, { text: '入襄子宮中塗廁', at: '周紀一' }] },
      { id: 'zhong1-balanced', pos: '形', gloss: '中正；适中。', note: '「正直中和」谓正直而中正平和。',
        examples: [{ text: '正直中和之謂德', at: '周紀一' }] },
    ],
  },
  '奏': {
    pinyin: 'zòu',
    pos: '动',
    uses: [
      { id: 'zou4-present', gloss: '进献；呈上。', note: '全卷仅一见。胡注引毛晃曰：「奏，进上也。」无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '尹': {
    pinyin: 'yǐn',
    pos: '专名',
    uses: [
      { id: 'yin3-duo', gloss: '人名。尹铎，赵简子的家臣，受命治理晋阳。', note: '本卷四见，都指尹铎一人。',
        examples: [{ text: '簡子使尹鐸為晉陽。', at: '周紀一' }, { text: '尹鐸損其戶數。', at: '周紀一' }] },
    ],
  },
  '鐸': {
    pinyin: 'duó',
    pos: '专名',
    uses: [
      { id: 'duo2-name', gloss: '专名。人名：尹铎，赵简子的家臣，受命治理晋阳。', note: '全卷四见都是此名。胡注引韦昭：损其户，则民优而税少。单用的「大铃」义本卷未见。',
        examples: [{ text: '簡子使尹鐸為晉陽', at: '周紀一' }, { text: '尹鐸損其戶數', at: '周紀一' }] },
    ],
  },
  '陽': {
    pinyin: 'yáng',
    pos: '专名',
    uses: [
      { id: 'yang2-jinyang', gloss: '地名。晋阳，赵氏之邑，在今山西太原一带。', note: '赵简子使尹铎治晋阳，其后襄子走晋阳而赖以存，是本卷赵氏存亡所系之地。全卷五见，四处指晋阳。',
        examples: [{ text: '簡子使尹鐸為晉陽。', at: '周紀一' }, { text: '其晉陽乎，先主之所屬也', at: '周紀一' }] },
      { id: 'yang2-pingyang', gloss: '地名。平阳，韩氏之邑，在今山西临汾一带。', note: '胡注谓平阳为韩武子玄孙贞子始居之地，故康子闻「水可以亡人国」而履桓子之跗。',
        examples: [{ text: '絳水可以灌平陽也', at: '周紀一' }] },
    ],
  },
  '繭': {
    pinyin: 'jiǎn',
    pos: '名',
    uses: [
      { id: 'jian3-cocoon', gloss: '蚕茧；「茧丝」指像抽丝一样取赋税。', note: '全卷仅一见（「以为茧丝乎」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '絲': {
    pinyin: 'sī',
    pos: '名',
    uses: [
      { id: 'si1-silk', gloss: '蚕丝；「茧丝」喻抽尽民力如抽丝', note: '全卷仅一见，无第二处用例，故不举例。「以为茧丝乎？抑为保障乎？」以茧丝与保障对举。',
        examples: [] },
    ],
  },
  '障': {
    pinyin: 'zhàng',
    pos: '名',
    uses: [
      { id: 'zhang4-barrier', gloss: '屏障；保障。', note: '「保障」指筑起屏障保护百姓，与「茧丝」相对。',
        examples: [{ text: '抑為保障乎？', at: '周紀一' }, { text: '簡子曰：「保障哉！」', at: '周紀一' }] },
    ],
  },
  '損': {
    pinyin: 'sǔn',
    pos: '动',
    uses: [
      { id: 'sun3-reduce', gloss: '减少。', note: '胡注引韦昭曰：损其户，则民优而税少。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '戶': {
    pinyin: 'hù',
    pos: '名',
    uses: [
      { id: 'hu4-household', gloss: '户口；民户。', note: '全卷仅一见，即「尹铎损其户数」。胡注引韦昭曰：「损其户，则民优而税少。」无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['戸'],
  },
  '難': {
    pinyin: 'nán',
    readings: ['nán', 'nàn'],
    pos: '形',
    uses: [
      { id: 'nan2-hard', gloss: '困难；不容易。', note: '读 nán。胡注于「危难」下注「如字」，即读本音。',
        reading: 'nán',
        examples: [{ text: '求以報仇，不亦難乎', at: '周紀一' }, { text: '凡吾所為者，極難耳', at: '周紀一' }] },
      { id: 'nan4-calamity', pos: '名', gloss: '灾难；祸患。', note: '读 nàn。胡注：「难，乃旦翻。」多指兵难、国难。',
        reading: 'nàn',
        examples: [{ text: '晉國有難，而無以尹鐸為少', at: '周紀一' }, { text: '主不備，難必至矣', at: '周紀一' }, { text: '趙亡，難必及韓、魏矣', at: '周紀一' }] },
    ],
  },
  '少': {
    pinyin: 'shǎo',
    pos: '形',
    uses: [
      { id: 'shao3-few', gloss: '少；不多。', note: '全卷仅一见，无第二处用例，故不举例。「无以尹铎为少」即不要嫌尹铎所治的规模小。此读上声 shǎo；本卷未见去声 shào（年少）之义，故不列两读。',
        examples: [] },
    ],
  },
  '康': {
    pinyin: 'kāng',
    pos: '专名',
    uses: [
      { id: 'kang1-han-kang-zi', gloss: '人名。韩康子，晋卿，韩氏宗主，韩武子启章之父。', note: '本卷与魏桓子同受智伯之陵，后共灭智氏。全卷九见皆指此人。',
        examples: [{ text: '智伯請地於韓康子', at: '周紀一' }, { text: '與韓康子、魏桓子宴於藍臺', at: '周紀一' }, { text: '智伯行水，魏桓子御，韓康子驂乘。', at: '周紀一' }] },
    ],
  },
  '宴': {
    pinyin: 'yàn',
    pos: '动',
    uses: [
      { id: 'yan4-feast', gloss: '宴饮；设宴。', note: '「宴于蓝台」指在蓝台宴会。胡注引《尔雅》：「四方而高曰台。」',
        examples: [{ text: '與韓康子、魏桓子宴於藍臺', at: '周紀一' }] },
      { id: 'yan4-banquet', pos: '名', gloss: '宴会。', note: '名词，「一宴」指一次宴会。',
        examples: [{ text: '今主一宴而恥人之君相', at: '周紀一' }] },
    ],
  },
  '藍': {
    pinyin: 'lán',
    pos: '专名',
    uses: [
      { id: 'lan2-terrace', gloss: '地名。蓝台，晋国之台', note: '全卷仅一见，无第二处用例，故不举例。胡三省注引《尔雅》：四方而高曰台。',
        examples: [] },
    ],
  },
  '臺': {
    pinyin: 'tái',
    pos: '名',
    uses: [
      { id: 'tai2-platform', gloss: '高台；四方而高的建筑。', note: '全卷仅一见，指蓝台，智襄子与韩康子、魏桓子在此宴饮，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '戲': {
    pinyin: 'xì',
    pos: '动',
    uses: [
      { id: 'xi4-joke', gloss: '戏弄；开玩笑。', note: '「智伯戏康子而侮段规」谓智伯戏弄韩康子、侮辱段规。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '侮': {
    pinyin: 'wǔ',
    pos: '动',
    uses: [
      { id: 'wu3-insult', gloss: '轻慢；侮辱。', note: '全卷仅一见，即「智伯戏康子而侮段规」。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '段': {
    pinyin: 'duàn',
    pos: '专名',
    uses: [
      { id: 'duan4-gui', gloss: '人名。段规，韩康子的相。', note: '本卷两见，都是段规其人。胡注引《姓谱》：「段，郑共叔段之后。」',
        examples: [{ text: '智伯戲康子而侮段規', at: '周紀一' }, { text: '而侮段規，智國聞之', at: '周紀一' }] },
    ],
    variants: ['叚'],
  },
  '規': {
    pinyin: 'guī',
    pos: '专名',
    uses: [
      { id: 'gui1-name', gloss: '专名。人名：段规，韩康子的家臣。', note: '全卷两见都是此名。胡注引《姓谱》：段，郑共叔段之后。单用的「规劝」「法度」义本卷未见。',
        examples: [{ text: '智伯戲康子而侮段規', at: '周紀一' }, { text: '段規曰：「智伯好利而愎', at: '周紀一' }] },
    ],
  },
  '諫': {
    pinyin: 'jiàn',
    pos: '动',
    uses: [
      { id: 'jian4-admonish', gloss: '规劝；劝谏（下对上）', note: '全卷仅一见，无第二处用例，故不举例。此处为智国谏智伯，智伯弗听。',
        examples: [] },
    ],
  },
  '備': {
    pinyin: 'bèi',
    pos: '动',
    uses: [
      { id: 'bei4-guard', gloss: '防备；戒备。', note: '「主不备」指主上不加防备。胡注：「春秋以来，大夫之家臣谓大夫曰主。」',
        examples: [{ text: '主不備，難必至矣', at: '周紀一' }, { text: '又弗備，曰不敢興難', at: '周紀一' }] },
    ],
    variants: ['僃'],
  },
  '由': {
    pinyin: 'yóu',
    pos: '介',
    uses: [
      { id: 'you2-from', gloss: '从；自', note: '全卷仅一见，无第二处用例，故不举例。「难将由我」谓祸难将从我这里起来。',
        examples: [] },
    ],
  },
  '我': {
    pinyin: 'wǒ',
    pos: '代',
    uses: [
      { id: 'wo3-i', gloss: '我；我们。', note: '第一人称代词，可指自己，也可指自己一方。',
        examples: [{ text: '智伯曰：「難將由我。', at: '周紀一' }, { text: '不與，將伐我', at: '周紀一' }, { text: '又斃死以守之，其誰與我！', at: '周紀一' }] },
    ],
  },
  '興': {
    pinyin: 'xīng',
    pos: '动',
    uses: [
      { id: 'xing1-raise', gloss: '兴起；发动。', note: '读 xīng。本卷两处都指发动祸难。',
        examples: [{ text: '我不為難，誰敢興之', at: '周紀一' }, { text: '又弗備，曰不敢興難', at: '周紀一' }] },
    ],
  },
  '對': {
    pinyin: 'duì',
    pos: '动',
    uses: [
      { id: 'dui4-reply', gloss: '回答；应对。', note: '本卷两见，皆作「对曰」，记臣下回答君上。',
        examples: [{ text: '對曰：「不然。', at: '周紀一' }, { text: '對曰：「臣見其視臣端而趨疾', at: '周紀一' }] },
    ],
  },
  '夏': {
    pinyin: 'xià',
    pos: '专名',
    uses: [
      { id: 'xia4-dynasty', gloss: '朝代名，夏代。《夏书》是《尚书》中记夏代的一部分。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '怨': {
    pinyin: 'yuàn',
    pos: '名',
    uses: [
      { id: 'yuan4-resentment', gloss: '怨恨；怨仇。', note: '全卷仅一见，无第二处用例，故不举例。此语出《夏书》「一人三失，怨岂在明」，是说怨仇不必等到显露才要计较。',
        examples: [] },
    ],
  },
  '明': {
    pinyin: 'míng',
    pos: '形',
    uses: [
      { id: 'ming2-obvious', gloss: '明显；显露', note: '「怨岂在明」谓怨恨何须显露，是《夏书》论防微之语。',
        examples: [{ text: '怨豈在明，不見是圖', at: '周紀一' }] },
      { id: 'ming2-next-day', gloss: '「明日」：第二天', note: '时间词，本卷一见于叙智伯以絺疵之言告二子之事。',
        examples: [{ text: '明日，智伯以絺疵之言告二子', at: '周紀一' }] },
    ],
  },
  '圖': {
    pinyin: 'tú',
    pos: '动',
    uses: [
      { id: 'tu2-plan', gloss: '图谋；打算。', note: '「不见是图」是在事态未显露时就作打算，「图智氏」是谋取智氏。胡注说这是《书》五子之歌的句子。',
        examples: [{ text: '怨豈在明，不見是圖', at: '周紀一' }, { text: '然後可以擇交而圖智氏矣', at: '周紀一' }] },
    ],
  },
  '勤': {
    pinyin: 'qín',
    pos: '动',
    uses: [
      { id: 'qin2-diligent', gloss: '勤勉；在小处用心', note: '全卷仅一见，无第二处用例，故不举例。「能勤小物」谓能在小事上用心。',
        examples: [] },
    ],
  },
  '患': {
    pinyin: 'huàn',
    pos: '名',
    uses: [
      { id: 'huan4-calamity', gloss: '祸患；灾难。', note: '「无大患」即没有大的祸患；「免于患」即免于祸患。',
        examples: [{ text: '夫君子能勤小物，故無大患。', at: '周紀一' }, { text: '然則我得免於患而待事之變矣', at: '周紀一' }] },
      { id: 'huan4-worry', pos: '动', gloss: '忧虑；担忧。', note: '「何失人之足患哉」即哪里还怕失去人才呢。',
        examples: [{ text: '又何失人之足患哉！', at: '周紀一' }] },
    ],
  },
  '恥': {
    pinyin: 'chǐ',
    pos: '动',
    uses: [
      { id: 'chi3-shame', gloss: '羞辱；使……受辱。', note: '「耻人之君相」谓羞辱人家的国君与国相。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '蜹': {
    pinyin: 'ruì',
    pos: '名',
    uses: [
      { id: 'rui4-gnat', gloss: '蜹：小飞虫，即蚋，似蚊而小，能叮人吸血。', note: '全卷仅一见。胡注引宋祁曰：「蜹，如锐翻。」又《字林》：「人劣翻」，秦人谓蚊为蜹。无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['蚋'],
  },
  '蟻': {
    pinyin: 'yǐ',
    pos: '名',
    uses: [
      { id: 'yi3-ant', gloss: '蚂蚁。', note: '全卷仅一见，无第二处用例，故不举例。「蜹、蚁、蜂、虿，皆能害人」谓小虫也能害人。',
        examples: [] },
    ],
  },
  '蜂': {
    pinyin: 'fēng',
    pos: '名',
    uses: [
      { id: 'feng1-bee', gloss: '蜂；细腰能螫人的毒虫。', note: '全卷仅一见，无第二处用例，故不举例。胡注：蜂，细腰而能螫人。与蚁、虿并举，喻小物也能害人。',
        examples: [] },
    ],
  },
  '蠆': {
    pinyin: 'chài',
    pos: '名',
    uses: [
      { id: 'chai4-scorpion', gloss: '蝎子一类的毒虫，尾长而有毒', note: '全卷仅一见，无第二处用例，故不举例。句中与蚋、蚁、蜂并举，谓小虫也能害人。胡注：「虿亦毒虫，长尾，音丑迈翻。」',
        examples: [] },
    ],
  },
  '害': {
    pinyin: 'hài',
    pos: '动',
    uses: [
      { id: 'hai4-harm', gloss: '伤害；危害。', note: '「皆能害人」指蚊蜂一类小虫都能伤人。',
        examples: [{ text: '蜹、蟻、蜂、蠆，皆能害人', at: '周紀一' }] },
      { id: 'hai4-injury', pos: '名', gloss: '祸害；害处。', note: '名词，「其为害」指它造成的祸害。',
        examples: [{ text: '其為害豈不多哉', at: '周紀一' }] },
    ],
  },
  '況': {
    pinyin: 'kuàng',
    pos: '连',
    uses: [
      { id: 'kuang4-how-much-more', gloss: '何况；况且', note: '全卷仅一见，无第二处用例，故不举例。「况君相乎」谓何况是国君与国相。',
        examples: [] },
    ],
  },
  '好': {
    pinyin: 'hào',
    pos: '动',
    uses: [
      { id: 'hao4-like', gloss: '喜好；贪求。', note: '读 hào，是喜好、贪求的意思；全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '利': {
    pinyin: 'lì',
    pos: '名',
    uses: [
      { id: 'li4-profit', gloss: '利益；好处。', note: '「好利而愎」谓贪利而固执。',
        examples: [{ text: '智伯好利而愎', at: '周紀一' }] },
      { id: 'li4-sharp', pos: '形', gloss: '锋利。', note: '「天下之利也」谓是天下最锋利的金属。',
        examples: [{ text: '棠溪之金，天下之利也', at: '周紀一' }] },
      { id: 'li4-consider-profitable', pos: '动', gloss: '以……为利；贪图。', note: '「岂不利朝夕分赵氏之田」谓难道不想早晚就瓜分赵氏的田地。',
        examples: [{ text: '夫二家豈不利朝夕分趙氏之田', at: '周紀一' }] },
    ],
  },
  '愎': {
    pinyin: 'bì',
    pos: '形',
    uses: [
      { id: 'bi4-stubborn', gloss: '固执任性；不听劝谏。', note: '全卷仅一见，即「智伯好利而愎」。胡注：「愎，弼力翻，狠也。」无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '伐': {
    pinyin: 'fá',
    pos: '动',
    uses: [
      { id: 'fa2-attack', gloss: '讨伐；攻打。', note: '全卷仅一见，无第二处用例，故不举例。「不与，将伐我」是段规料智伯必来攻打。',
        examples: [] },
    ],
  },
  '彼': {
    pinyin: 'bǐ',
    pos: '代',
    uses: [
      { id: 'bi3-he', gloss: '代，他；那个人，指智伯。', note: '「彼狃于得地」是说智伯惯于得地。',
        examples: [{ text: '彼狃於得地，必請於他人', at: '周紀一' }] },
      { id: 'bi3-that-side', gloss: '代，与「此」对举，指那一方。', note: '「彼骄而轻敌，此惧而相亲」以彼指智伯，以此指诸大夫。',
        examples: [{ text: '彼驕而輕敵，此懼而相親', at: '周紀一' }] },
    ],
  },
  '狃': {
    pinyin: 'niǔ',
    pos: '动',
    uses: [
      { id: 'niu3-accustomed', gloss: '习惯；惯于。「狃于得地」谓惯于得地而生骄', note: '全卷仅一见，无第二处用例，故不举例。胡注：「狃，女九翻，骄忲也，又相狎也。」',
        examples: [] },
    ],
  },
  '他': {
    pinyin: 'tā',
    pos: '代',
    uses: [
      { id: 'ta1-other', gloss: '别的；其他。', note: '本卷两见，都在「他人」一词里，指别的大夫。',
        examples: [{ text: '必請於他人；他人不與', at: '周紀一' }] },
    ],
    variants: ['佗'],
  },
  '向': {
    pinyin: 'xiàng',
    pos: '动',
    uses: [
      { id: 'xiang4-aim-at', gloss: '朝向；此谓把兵锋指向', note: '全卷仅一见，无第二处用例，故不举例。「必向之以兵」谓必将以兵相加。',
        examples: [] },
    ],
  },
  '兵': {
    pinyin: 'bīng',
    pos: '名',
    uses: [
      { id: 'bing1-weapons', gloss: '兵器；武力。', note: '「向之以兵」即用武力对付他。',
        examples: [{ text: '他人不與，必向之以兵', at: '周紀一' }] },
      { id: 'bing1-troops', gloss: '军队。', note: '「相亲之兵」即相互亲近的军队；「韩、魏之兵」即韩、魏的军队。',
        examples: [{ text: '以相親之兵待輕敵之人', at: '周紀一' }, { text: '夫從韓、魏之兵以攻趙', at: '周紀一' }] },
    ],
  },
  '免': {
    pinyin: 'miǎn',
    pos: '动',
    uses: [
      { id: 'mian3-avoid', gloss: '免除；避免。', note: '「我得免于患」谓我能免于祸患。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '變': {
    pinyin: 'biàn',
    pos: '名',
    uses: [
      { id: 'bian4-change', gloss: '变故；事变。', note: '全卷仅一见，即「待事之变」，谓等待局势生变。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '善': {
    pinyin: 'shàn',
    pos: '形',
    uses: [
      { id: 'shan4-good', gloss: '好；善事（与「恶」相对）。', note: '《才德论》说君子挟才以为善，小人挟才以为恶。',
        examples: [{ text: '君子挾才以為善', at: '周紀一' }, { text: '挾才以為善者，善無不至矣', at: '周紀一' }] },
      { id: 'shan4-agree', gloss: '表示应允、赞同，犹今言「好」。', note: '本卷两见，都是臣下进言之后主上的答语。',
        examples: [{ text: '康子曰：「善。」', at: '周紀一' }, { text: '桓子曰：「善。」', at: '周紀一' }] },
    ],
  },
  '致': {
    pinyin: 'zhì',
    pos: '动',
    uses: [
      { id: 'zhi4-deliver', gloss: '送致；致送。', note: '全卷仅一见，无第二处用例，故不举例。「致万家之邑于智伯」即把万户之邑送给智伯。',
        examples: [] },
    ],
  },
  '悅': {
    pinyin: 'yuè',
    pos: '形',
    uses: [
      { id: 'yue4-pleased', gloss: '高兴；喜悦', note: '全卷仅一见，无第二处用例，故不举例。此处写智伯得万家之邑而喜，正见段规所料其骄。',
        examples: [] },
    ],
    variants: ['恱'],
  },
  '任': {
    pinyin: 'rèn',
    pos: '专名',
    uses: [
      { id: 'ren4-surname', gloss: '姓氏；任章，魏桓子的家相。', note: '胡注引《姓谱》说任氏出自黄帝之后。本卷「任」只作姓氏，未见「担任」「任凭」等义。',
        examples: [{ text: '任章曰：「何故弗與？」', at: '周紀一' }, { text: '任章曰：「無故索地，諸大夫必懼', at: '周紀一' }] },
    ],
  },
  '索': {
    pinyin: 'suǒ',
    pos: '动',
    uses: [
      { id: 'suo3-demand', gloss: '索取；求取', note: '胡三省注：「索，山客翻，求也。」',
        examples: [{ text: '無故索地，故弗與。', at: '周紀一' }, { text: '無故索地，諸大夫必懼', at: '周紀一' }] },
      { id: 'suo3-search', gloss: '搜索；寻找', note: '「索之」谓搜查，两见都在豫让的段落。',
        examples: [{ text: '襄子如廁心動，索之，獲豫讓。', at: '周紀一' }, { text: '襄子至橋，馬驚，索之，得豫讓', at: '周紀一' }] },
    ],
  },
  '吾': {
    pinyin: 'wú',
    pos: '代',
    uses: [
      { id: 'wu2-i', gloss: '我；我们。', note: '第一人称代词。',
        examples: [{ text: '吾與之地，智伯必驕', at: '周紀一' }, { text: '奈何獨以吾為智氏質乎！', at: '周紀一' }, { text: '真義士也！吾謹避之耳。', at: '周紀一' }] },
    ],
  },
  '驕': {
    pinyin: 'jiāo',
    pos: '形',
    uses: [
      { id: 'jiao1-arrogant', gloss: '骄傲；自满。', note: '「智伯必骄」谓智伯必定自满。',
        examples: [{ text: '吾與之地，智伯必驕', at: '周紀一' }, { text: '彼驕而輕敵，此懼而相親', at: '周紀一' }] },
      { id: 'jiao1-make-arrogant', gloss: '使……骄傲，是使动用法。', note: '「以骄智伯」谓用这办法让智伯骄横。',
        examples: [{ text: '主不如與之以驕智伯', at: '周紀一' }] },
    ],
  },
  '輕': {
    pinyin: 'qīng',
    pos: '动',
    uses: [
      { id: 'qing1-underestimate', gloss: '轻视；看不起。', note: '本卷两见，皆作「轻敌」，即轻视敌人。',
        examples: [{ text: '彼驕而輕敵，此懼而相親', at: '周紀一' }, { text: '以相親之兵待輕敵之人', at: '周紀一' }] },
    ],
  },
  '敵': {
    pinyin: 'dí',
    pos: '名',
    uses: [
      { id: 'di2-enemy', gloss: '敌人；敌手。「轻敌」即轻视敌人。', note: '本卷两见，都在「轻敌」一语中。',
        examples: [{ text: '智伯必驕。彼驕而輕敵', at: '周紀一' }, { text: '以相親之兵待輕敵之人', at: '周紀一' }] },
    ],
  },
  '敗': {
    pinyin: 'bài',
    pos: '动',
    uses: [
      { id: 'bai4-defeat-someone', gloss: '动，使失败；破坏。', note: '「将欲败之，必姑辅之」出《周书》，是说将要败坏他，必先辅助他。',
        examples: [{ text: '將欲敗之，必姑輔之', at: '周紀一' }] },
      { id: 'bai4-rout', gloss: '动，打败。', note: '「大败智伯之众」即把智伯的军队打得大败。',
        examples: [{ text: '大敗智伯之眾', at: '周紀一' }] },
      { id: 'bai4-degenerate', pos: '形', gloss: '形，败坏的；堕落的。', note: '「败子」与「乱臣」并举，指败家之子。',
        examples: [{ text: '國之亂臣，家之敗子', at: '周紀一' }] },
    ],
  },
  '姑': {
    pinyin: 'gū',
    pos: '副',
    uses: [
      { id: 'gu1-for-the-moment', gloss: '姑且；暂且', note: '本卷两见，皆在任章所引《周书》中，谓姑且顺其所欲以促其败。胡注：「逸《书》也。」',
        examples: [{ text: '將欲敗之，必姑輔之', at: '周紀一' }, { text: '將欲取之，必姑與之', at: '周紀一' }] },
    ],
  },
  '取': {
    pinyin: 'qǔ',
    pos: '动',
    uses: [
      { id: 'qu3-take', gloss: '夺取；取得。', note: '「将欲取之，必姑与之」是《周书》里的话，任章引来劝桓子。',
        examples: [{ text: '將欲取之，必姑與之', at: '周紀一' }] },
      { id: 'qu3-choose', gloss: '选取；取用。', note: '「取人之术」指选取人才的方法。',
        examples: [{ text: '凡取人之術，苟不得聖人、君子而與之', at: '周紀一' }] },
    ],
  },
  '擇': {
    pinyin: 'zé',
    pos: '动',
    uses: [
      { id: 'ze2-choose', gloss: '选择；择取', note: '全卷仅一见，无第二处用例，故不举例。「可以择交而图智氏」谓可选择盟交而图谋智氏。',
        examples: [] },
    ],
  },
  '交': {
    pinyin: 'jiāo',
    pos: '动',
    uses: [
      { id: 'jiao1-friend', gloss: '结交；交往。', note: '全卷仅一见，指任章劝魏桓子选择结交的对象，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '奈': {
    pinyin: 'nài',
    pos: '动',
    uses: [
      { id: 'nai4-how', gloss: '与「何」合成「奈何」，表示怎么办、如何。', note: '「奈何独以吾为智氏质乎」谓为什么偏偏拿我当智氏的抵押。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['柰'],
  },
  '質': {
    pinyin: 'zhì',
    pos: '名',
    uses: [
      { id: 'zhi4-target', gloss: '质的；箭靶，喻受攻击的对象。', note: '胡注：「质，脂利翻，物相缀当也。……质，谓椹质也，质的也。椹质受斧，质的受矢。」「为智氏质」谓成为智氏加兵的对象。',
        examples: [{ text: '奈何獨以吾為智氏質乎', at: '周紀一' }] },
      { id: 'zhi4-submit', pos: '动', gloss: '委质：委身事人，献身为臣。', note: '「既已委质为臣」谓既已委身做人家的臣子。',
        examples: [{ text: '既已委質為臣，而又求殺之', at: '周紀一' }] },
    ],
  },
  '藺': {
    pinyin: 'lìn',
    pos: '专名',
    uses: [
      { id: 'lin4-place', gloss: '地名。蔺与皋狼都是赵氏的地邑。', note: '全卷仅一见，无第二处用例，故不举例。底本作「蔡」，校记据《史记·赵世家》改作「蔺」。',
        examples: [] },
    ],
  },
  '皋': {
    pinyin: 'gāo',
    pos: '专名',
    uses: [
      { id: 'gao1-place', gloss: '专名。地名用字：皋狼，赵氏邑名。', note: '全卷仅一见，无第二处用例，故不举例。胡注引康氏「皋，姑劳切」，并据《汉书·地理志》西河郡有皋狼县，疑旧说以皋狼为蔡地之误。',
        examples: [] },
    ],
  },
  '狼': {
    pinyin: 'láng',
    pos: '专名',
    uses: [
      { id: 'lang2-gaolang', gloss: '地名用字。「皋狼」，春秋晋地，汉属西河郡，在今山西吕梁一带。', note: '全卷仅一见，无第二处用例，故不举例。智伯所求蔺、皋狼二地，即赵氏所不肯与者，遂启晋阳之战。',
        examples: [] },
    ],
  },
  '怒': {
    pinyin: 'nù',
    pos: '动',
    uses: [
      { id: 'nu4-anger', gloss: '发怒；震怒。', note: '全卷仅一见（「智伯怒」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '帥': {
    pinyin: 'shuài',
    pos: '动',
    uses: [
      { id: 'shuai4-lead', gloss: '率领；统率', note: '胡三省注音「所类翻」。',
        examples: [{ text: '智伯怒，帥韓、魏之甲以攻趙氏。', at: '周紀一' }, { text: '今智伯帥韓、魏而攻趙', at: '周紀一' }] },
      { id: 'shuai4-commander', pos: '名', gloss: '统帅；主帅', note: '此为名词用法，「德者，才之帅也」谓德是才的统帅。',
        examples: [{ text: '德者，才之帥也。', at: '周紀一' }] },
    ],
  },
  '甲': {
    pinyin: 'jiǎ',
    pos: '名',
    uses: [
      { id: 'jia3-armour', gloss: '铠甲；借指军队。', note: '全卷仅一见，指智伯率领韩、魏的甲兵攻赵，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '攻': {
    pinyin: 'gōng',
    pos: '动',
    uses: [
      { id: 'gong1-attack', gloss: '攻打；进攻。', note: '本卷「攻赵」四见，都指智伯率韩、魏之兵攻赵氏。',
        examples: [{ text: '帥韓、魏之甲以攻趙氏', at: '周紀一' }, { text: '夫從韓、魏之兵以攻趙', at: '周紀一' }] },
    ],
  },
  '且': {
    pinyin: 'qiě',
    pos: '连',
    uses: [
      { id: 'qie3-moreover', gloss: '而且；并且。', note: '全卷仅一见，即「长子近，且城厚完」，谓长子城近，而且城墙厚实完整。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '城': {
    pinyin: 'chéng',
    pos: '名',
    uses: [
      { id: 'cheng2-wall', gloss: '城墙；城邑。', note: '本卷四见：或指城墙，或指城中之人（「城降」）。',
        examples: [{ text: '長子近，且城厚完', at: '周紀一' }, { text: '城不浸者三版。', at: '周紀一' }, { text: '城降有日，而二子無喜志', at: '周紀一' }] },
    ],
  },
  '厚': {
    pinyin: 'hòu',
    pos: '形',
    uses: [
      { id: 'hou4-thick', gloss: '厚；厚实。', note: '全卷仅一见，无第二处用例，故不举例。「城厚完」是说城墙厚而完好。',
        examples: [] },
    ],
  },
  '完': {
    pinyin: 'wán',
    pos: '形',
    uses: [
      { id: 'wan2-sound', gloss: '完好；坚固', note: '「城厚完」谓城墙厚而完好，是从者劝襄子走长子之语。',
        examples: [{ text: '長子近，且城厚完', at: '周紀一' }] },
      { id: 'wan2-repair', pos: '动', gloss: '修治使完整；修筑', note: '「完之」谓把城修治好。胡注：「罢，读曰疲。」谓民疲力以完城。',
        examples: [{ text: '民罷力以完之', at: '周紀一' }] },
    ],
  },
  '罷': {
    pinyin: 'pí',
    pos: '动',
    uses: [
      { id: 'pi2-weary', gloss: '通「疲」，疲惫。', note: '全卷仅一见（「民罢力以完之」），无第二处用例，故不举例。胡注：「罢，读曰疲。」',
        examples: [] },
    ],
  },
  '斃': {
    pinyin: 'bì',
    pos: '动',
    uses: [
      { id: 'bi4-die', gloss: '死；仆倒而死', note: '全卷仅一见，无第二处用例，故不举例。「毙死以守之」谓拼死守城。',
        examples: [] },
    ],
  },
  '邯': {
    pinyin: 'hán',
    pos: '专名',
    uses: [
      { id: 'han2-handan', gloss: '地名用字：邯郸，赵氏城邑。', note: '全卷仅一见，指邯郸的仓库充实，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '鄲': {
    pinyin: 'dān',
    pos: '专名',
    uses: [
      { id: 'dan1-handan', gloss: '地名用字：邯郸，赵氏的城邑。', note: '胡注：邯，音寒；郸，音丹。「邯郸之仓库实」谓邯郸的仓库充实。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '倉': {
    pinyin: 'cāng',
    pos: '名',
    uses: [
      { id: 'cang1-granary', gloss: '粮仓；仓库。', note: '全卷仅一见，即「邯郸之仓库实」，谓邯郸的仓库充实。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '庫': {
    pinyin: 'kù',
    pos: '名',
    uses: [
      { id: 'ku4-store', gloss: '库房；仓库。「仓库」即粮仓与库房。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '實': {
    pinyin: 'shí',
    pos: '形',
    uses: [
      { id: 'shi2-full', gloss: '形，充实；满。', note: '「仓库实」即仓库充实。',
        examples: [{ text: '邯鄲之倉庫實', at: '周紀一' }] },
      { id: 'shi2-fill', pos: '动', gloss: '动，使充实；填满。', note: '「以实之」即用搜刮来的财货充实仓库。',
        examples: [{ text: '浚民之膏澤以實之', at: '周紀一' }] },
    ],
  },
  '浚': {
    pinyin: 'jùn',
    pos: '动',
    uses: [
      { id: 'jun4-drain', gloss: '榨取；搜刮（本义为疏浚、淘深）', note: '全卷仅一见，无第二处用例，故不举例。胡注：「浚者，疏瀹也，淘也，深也。」此处谓搜刮民脂以实仓库。',
        examples: [] },
    ],
  },
  '膏': {
    pinyin: 'gāo',
    pos: '名',
    uses: [
      { id: 'gao1-fat', gloss: '油脂；「膏泽」指民脂民膏。', note: '全卷仅一见（「浚民之膏泽」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '澤': {
    pinyin: 'zé',
    pos: '名',
    uses: [
      { id: 'ze2-marsh', gloss: '本指水泽，此「膏泽」喻民脂民膏', note: '全卷仅一见，无第二处用例，故不举例。胡三省注引韦昭「浚，煎也」，「浚民之膏泽」谓榨取百姓的膏血。',
        examples: [] },
    ],
  },
  '因': {
    pinyin: 'yīn',
    pos: '副',
    uses: [
      { id: 'yin1-thereupon', gloss: '于是；趁势。', note: '全卷仅一见，「因而杀之」即趁势杀掉他们，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '殺': {
    pinyin: 'shā',
    pos: '动',
    uses: [
      { id: 'sha1-kill', gloss: '杀死。', note: '本卷七见，都是杀死：杀守堤之吏、杀智伯、杀豫让、共杀桓子之子。',
        examples: [{ text: '遂殺智伯，盡滅智氏之族', at: '周紀一' }, { text: '襄子夜使人殺守堤之吏', at: '周紀一' }] },
    ],
  },
  '寬': {
    pinyin: 'kuān',
    pos: '动',
    uses: [
      { id: 'kuan1-lenient', gloss: '宽缓；宽恤（指减轻赋税）。', note: '全卷仅一见，即「尹铎之所宽也」，谓晋阳是尹铎行宽缓之政的地方。无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['寛'],
  },
  '和': {
    pinyin: 'hé',
    pos: '形',
    uses: [
      { id: 'he2-harmony', gloss: '和睦；和顺。', note: '此句说尹铎对晋阳百姓宽厚，百姓必然和顺。',
        examples: [{ text: '尹鐸之所寬也，民必和矣', at: '周紀一' }] },
      { id: 'he2-balanced', gloss: '「中和」谓中正平和。', note: '《才德论》以正直中和为德。',
        examples: [{ text: '正直中和之謂德', at: '周紀一' }] },
    ],
  },
  '圍': {
    pinyin: 'wéi',
    pos: '动',
    uses: [
      { id: 'wei2-besiege', gloss: '包围。', note: '全卷仅一见，无第二处用例，故不举例。「围而灌之」即围城并引水灌城。',
        examples: [] },
    ],
  },
  '灌': {
    pinyin: 'guàn',
    pos: '动',
    uses: [
      { id: 'guan4-flood', gloss: '灌注；引水淹灌', note: '本卷四见，皆引水灌城。胡注：「高二尺为一版；三版，六尺。」',
        examples: [{ text: '三家以國人圍而灌之', at: '周紀一' }, { text: '以汾水可以灌安邑', at: '周紀一' }, { text: '而決水灌智伯軍', at: '周紀一' }] },
    ],
  },
  '浸': {
    pinyin: 'jìn',
    pos: '动',
    uses: [
      { id: 'jin4-flood', gloss: '浸没；淹没。', note: '全卷仅一见（「城不浸者三版」），无第二处用例，故不举例。胡注：「高二尺为一版；三版，六尺。」',
        examples: [] },
    ],
  },
  '版': {
    pinyin: 'bǎn',
    pos: '量',
    uses: [
      { id: 'ban3-measure', gloss: '筑墙的夹板；版是计算城墙高度的单位', note: '胡三省注：高二尺为一版，三版就是六尺。',
        examples: [{ text: '城不浸者三版', at: '周紀一' }, { text: '城不沒者三版', at: '周紀一' }] },
    ],
  },
  '沈': {
    pinyin: 'chén',
    pos: '动',
    uses: [
      { id: 'chen2-sink', gloss: '同「沉」，沉没；被水淹没。', note: '读 chén；全卷仅一见，指灶被水淹没而生出蛙，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '竈': {
    pinyin: 'zào',
    pos: '名',
    uses: [
      { id: 'zao4-stove', gloss: '灶，炊灶。', note: '「沈灶产蛙」谓锅灶沉在水里，生出青蛙。胡注：沈，持林翻。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '產': {
    pinyin: 'chǎn',
    pos: '动',
    uses: [
      { id: 'chan3-produce', gloss: '生出；产生。', note: '全卷仅一见，谓灶沉入水中而生出青蛙。无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['産'],
  },
  '鼃': {
    pinyin: 'wā',
    pos: '名',
    uses: [
      { id: 'wa1-frog', gloss: '同「蛙」，青蛙。', note: '全卷仅一见，无第二处用例，故不举例。胡注：「鼃，与蛙同。」',
        examples: [] },
    ],
  },
  '叛': {
    pinyin: 'pàn',
    pos: '动',
    uses: [
      { id: 'pan4-rebel', gloss: '背叛；反叛。', note: '全卷仅一见，无第二处用例，故不举例。「民无叛意」是说城中百姓没有背叛之心。',
        examples: [] },
    ],
  },
  '意': {
    pinyin: 'yì',
    pos: '名',
    uses: [
      { id: 'yi4-intention', gloss: '心意；念头', note: '本卷两见：一为「民无叛意」，一为「非襄主意」，皆指心中所存。',
        examples: [{ text: '沈竈產鼃，民無叛意', at: '周紀一' }, { text: '桓子立，非襄主意', at: '周紀一' }] },
    ],
  },
  '水': {
    pinyin: 'shuǐ',
    pos: '名',
    uses: [
      { id: 'shui3-water', gloss: '水；水势。', note: '「决水灌智伯军」是决堤放水，「行水」是巡视水势。',
        examples: [{ text: '而決水灌智伯軍', at: '周紀一' }, { text: '智伯軍救水而亂', at: '周紀一' }, { text: '智伯行水，魏桓子御', at: '周紀一' }] },
      { id: 'shui3-river', gloss: '河流名中的「水」，如汾水、绛水。', note: '本卷用来指可供灌城的河流。',
        examples: [{ text: '以汾水可以灌安邑，絳水可以灌平陽也', at: '周紀一' }] },
    ],
  },
  '驂': {
    pinyin: 'cān',
    pos: '动',
    uses: [
      { id: 'can1-carriage', gloss: '在车右陪乘；「骖乘」谓三人同车', note: '全卷仅一见，无第二处用例，故不举例。胡三省注：骖与参同，参者三也，三人同车则曰骖乘。',
        examples: [] },
    ],
  },
  '乘': {
    pinyin: 'shèng',
    pos: '动',
    uses: [
      { id: 'sheng4-ride', gloss: '乘车；陪乘。', note: '「骖乘」读 cān shèng，指在车右陪乘；全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '肘': {
    pinyin: 'zhǒu',
    pos: '动',
    uses: [
      { id: 'zhou3-elbow', gloss: '用胳膊肘碰，是名词活用为动词。', note: '「桓子肘康子」谓魏桓子用肘碰韩康子，暗中示意。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '跗': {
    pinyin: 'fū',
    pos: '名',
    uses: [
      { id: 'fu1-instep', gloss: '脚背；足背。', note: '全卷仅一见，即「康子履桓子之跗」，谓康子踩桓子的脚背以示意。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '汾': {
    pinyin: 'fén',
    pos: '专名',
    uses: [
      { id: 'fen2-river', gloss: '水名。汾水，在今山西，可以灌安邑。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '絳': {
    pinyin: 'jiàng',
    pos: '专名',
    uses: [
      { id: 'jiang4-river', gloss: '专名。水名：绛水。', note: '全卷仅一见，无第二处用例，故不举例。胡注引应劭：绛水出河东绛县西南。',
        examples: [] },
    ],
  },
  '平': {
    pinyin: 'píng',
    pos: '专名',
    uses: [
      { id: 'ping2-pingyang', gloss: '地名用字。「平阳」，春秋晋地，韩氏之邑，在今山西临汾一带。', note: '全卷仅一见，无第二处用例，故不举例。此句与「安邑」对举，写桓、康二子肘足相接，各为都邑之虑。',
        examples: [] },
    ],
  },
  '絺': {
    pinyin: 'chī',
    pos: '专名',
    uses: [
      { id: 'chi1-surname', gloss: '姓氏；絺疵，智伯的臣子。', note: '胡注：「絺，抽迟翻，姓也。」胡三省又引《姓谱》说絺姓出自周苏忿生的支子。本卷「絺」只作姓氏。',
        examples: [{ text: '絺疵謂智伯曰', at: '周紀一' }, { text: '絺疵請使於齊', at: '周紀一' }] },
    ],
  },
  '疵': {
    pinyin: 'cī',
    pos: '专名',
    uses: [
      { id: 'ci1-name', gloss: '人名用字。絺疵，智伯之臣', note: '胡三省注：「絺，抽迟翻，姓也。」疵是名；本卷未见毛病、缺点义的「疵」。',
        examples: [{ text: '絺疵謂智伯曰：「韓、魏必反矣。」', at: '周紀一' }, { text: '絺疵請使於齊。', at: '周紀一' }] },
    ],
  },
  '反': {
    pinyin: 'fǎn',
    pos: '动',
    uses: [
      { id: 'fan3-rebel', gloss: '反叛；造反。', note: '「必反」即一定会反叛；「是非反而何」即这不是反叛又是什么。',
        examples: [{ text: '絺疵謂智伯曰：「韓、魏必反矣。」', at: '周紀一' }, { text: '是非反而何？', at: '周紀一' }] },
    ],
  },
  '約': {
    pinyin: 'yuē',
    pos: '动',
    uses: [
      { id: 'yue1-agree', gloss: '约定；订约。', note: '本卷两处都作动词：「约胜赵而三分其地」是约定，「阴与张孟谈约」是订约。',
        examples: [{ text: '今約勝趙而三分其地', at: '周紀一' }, { text: '二子乃陰與張孟談約', at: '周紀一' }] },
    ],
  },
  '勝': {
    pinyin: 'shèng',
    readings: ['shèng', 'shēng'],
    pos: '动',
    uses: [
      { id: 'sheng4-exceed', gloss: '超过；胜过。', note: '读 shèng。「才胜德」「德胜才」皆此义。',
        reading: 'shèng',
        examples: [{ text: '臣光曰：智伯之亡也，才勝德也。', at: '周紀一' }, { text: '德勝才謂之君子', at: '周紀一' }] },
      { id: 'sheng4-win', gloss: '战胜；打赢。', note: '读 shèng。「今约胜赵而三分其地」谓约定战胜赵国后三分其地。',
        reading: 'shèng',
        examples: [{ text: '今約勝趙而三分其地', at: '周紀一' }] },
      { id: 'sheng1-bear', gloss: '承受；禁得起。', note: '读 shēng。胡注：「胜，音升。」「力不能胜」谓力量承受不住。',
        reading: 'shēng',
        examples: [{ text: '智不能周，力不能勝', at: '周紀一' }] },
    ],
  },
  '沒': {
    pinyin: 'mò',
    pos: '动',
    uses: [
      { id: 'mo4-submerge', gloss: '淹没；沉没。', note: '全卷仅一见，无第二处用例，故不举例。「城不没者三版」谓城墙只剩三版没有淹到。本卷未见「没有」的 méi 一读。',
        examples: [] },
    ],
    variants: ['没'],
  },
  '馬': {
    pinyin: 'mǎ',
    pos: '名',
    uses: [
      { id: 'ma3-horse', gloss: '名，马。', note: '全卷两见：一在「人马相食」，一在「马惊」。',
        examples: [{ text: '人馬相食，城降有日', at: '周紀一' }, { text: '襄子至橋，馬驚', at: '周紀一' }] },
    ],
  },
  '降': {
    pinyin: 'xiáng',
    pos: '动',
    uses: [
      { id: 'xiang2-surrender', gloss: '投降；归降', note: '全卷仅一见，无第二处用例，故不举例。胡注：「降，户江翻，下也，服也。」「城降有日」谓城破投降指日可待。',
        examples: [] },
    ],
  },
  '喜': {
    pinyin: 'xǐ',
    pos: '形',
    uses: [
      { id: 'xi3-joy', gloss: '喜悦；高兴。', note: '全卷仅一见（「二子无喜志」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '志': {
    pinyin: 'zhì',
    pos: '名',
    uses: [
      { id: 'zhi4-intent', gloss: '心意；神情', note: '全卷仅一见，无第二处用例，故不举例。「二子无喜志，有忧色」谓二人没有喜色而有忧容。',
        examples: [] },
    ],
  },
  '憂': {
    pinyin: 'yōu',
    pos: '名',
    uses: [
      { id: 'you1-worry', gloss: '忧虑；忧愁之色。', note: '全卷仅一见，指二人面有忧色，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '色': {
    pinyin: 'sè',
    pos: '名',
    uses: [
      { id: 'se4-countenance', gloss: '脸色；神色。', note: '「有忧色」与上句「无喜志」对举，谓面带忧色。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '告': {
    pinyin: 'gào',
    pos: '动',
    uses: [
      { id: 'gao4-tell', gloss: '告诉；告知。', note: '本卷两见，皆指智伯把絺疵的话告诉韩、魏二子。',
        examples: [{ text: '智伯以絺疵之言告二子', at: '周紀一' }, { text: '主何以臣之言告二子也？', at: '周紀一' }] },
    ],
  },
  '讒': {
    pinyin: 'chán',
    pos: '动',
    uses: [
      { id: 'chan2-slander', gloss: '说人坏话；谗毁。「谗臣」即进谗言的臣子。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '游': {
    pinyin: 'yóu',
    pos: '动',
    uses: [
      { id: 'you2-persuade', gloss: '游说；往来劝说使人听从。', note: '全卷仅一见，无第二处用例，故不举例。「欲为赵氏游说」是说想替赵氏游说。',
        examples: [] },
    ],
  },
  '說': {
    pinyin: 'shuì',
    pos: '动',
    uses: [
      { id: 'shui4-persuade', gloss: '劝说；游说', note: '全卷仅一见，无第二处用例，故不举例。胡注：「说，输芮翻。」即劝人以言，与「喜悦」之说不同。',
        examples: [] },
    ],
    variants: ['説'],
  },
  '疑': {
    pinyin: 'yí',
    pos: '动',
    uses: [
      { id: 'yi2-doubt', gloss: '怀疑；使……疑心。', note: '全卷仅一见（「使主疑于二家」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '懈': {
    pinyin: 'xiè',
    pos: '动',
    uses: [
      { id: 'xie4-slacken', gloss: '松懈；懈怠', note: '全卷仅一见，无第二处用例，故不举例。胡三省注：「懈，居隘翻，怠也。」',
        examples: [] },
    ],
  },
  '朝': {
    pinyin: 'zhāo',
    pos: '名',
    uses: [
      { id: 'zhao1-morning', gloss: '早晨。', note: '读 zhāo；全卷仅一见，与「夕」连用为「朝夕」，指随时，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '夕': {
    pinyin: 'xī',
    pos: '名',
    uses: [
      { id: 'xi1-evening', gloss: '傍晚；「朝夕」指从早到晚，极言时间之短。', note: '「不利朝夕分赵氏之田」谓不希望早晚之间就瓜分赵氏的田地。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '危': {
    pinyin: 'wēi',
    pos: '形',
    uses: [
      { id: 'wei1-perilous', gloss: '危险；艰难。', note: '全卷仅一见，即「欲为危难不可成之事」。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '入': {
    pinyin: 'rù',
    pos: '动',
    uses: [
      { id: 'ru4-enter', gloss: '进入；进去。', note: '本卷四见，可用于人，也可用于话（入臣之耳）、箭（入坚）。',
        examples: [{ text: '二子出，絺疵入曰', at: '周紀一' }, { text: '則不能以入堅', at: '周紀一' }, { text: '入臣之耳，何傷也', at: '周紀一' }] },
    ],
  },
  '視': {
    pinyin: 'shì',
    pos: '动',
    uses: [
      { id: 'shi4-look', gloss: '看；注视。', note: '全卷仅一见，无第二处用例，故不举例。「其视臣端而趋疾」是说他们看我的眼神端正、走路急促。',
        examples: [] },
    ],
  },
  '端': {
    pinyin: 'duān',
    pos: '形',
    uses: [
      { id: 'duan1-upright', gloss: '端正；端直（此处谓正视不避）', note: '全卷仅一见，无第二处用例，故不举例。「视臣端而趋疾」是絺疵自说其见二子神色。',
        examples: [] },
    ],
  },
  '趨': {
    pinyin: 'qū',
    pos: '动',
    uses: [
      { id: 'qu1-hurry', gloss: '快步走；疾行。', note: '全卷仅一见（「视臣端而趋疾」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '疾': {
    pinyin: 'jí',
    pos: '形',
    uses: [
      { id: 'ji2-fast', gloss: '快；急速', note: '全卷仅一见，无第二处用例，故不举例。「视臣端而趋疾」谓看着我的目光端直而走得很快；本卷未见疾病的「疾」。',
        examples: [] },
    ],
  },
  '情': {
    pinyin: 'qíng',
    pos: '名',
    uses: [
      { id: 'qing2-truth', gloss: '实情；内情。', note: '全卷仅一见，指看出二人已得其实情，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '悛': {
    pinyin: 'quān',
    pos: '动',
    uses: [
      { id: 'quan1-repent', gloss: '悔改；停止。', note: '胡注：悛，丑缘翻，改也，止也。「智伯不悛」谓智伯不肯悔改。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '張': {
    pinyin: 'zhāng',
    pos: '专名',
    uses: [
      { id: 'zhang1-mengtan', gloss: '人名。张孟谈，赵襄子之臣。', note: '本卷三见，皆作「张孟谈」。他潜出说服韩、魏反智伯。本卷未见「张开」义。',
        examples: [{ text: '趙襄子使張孟談潛出見二子', at: '周紀一' }, { text: '二子乃陰與張孟談約', at: '周紀一' }] },
    ],
  },
  '孟': {
    pinyin: 'mèng',
    pos: '专名',
    uses: [
      { id: 'meng4-tan', gloss: '人名用字。张孟谈，赵襄子的家臣。', note: '本卷四见，其中三见是张孟谈。',
        examples: [{ text: '趙襄子使張孟談潛出見二子', at: '周紀一' }, { text: '二子乃陰與張孟談約', at: '周紀一' }] },
      { id: 'meng4-zhao', gloss: '「赵孟」是对赵氏宗主的称呼，此指赵襄子。', note: '胡注：「自春秋之时，赵宣子谓之宣孟，赵文子谓之赵孟，其后遂袭而呼为赵孟。孟，长也。」',
        examples: [{ text: '臣事趙孟，必得近幸', at: '周紀一' }] },
    ],
  },
  '談': {
    pinyin: 'tán',
    pos: '专名',
    uses: [
      { id: 'tan2-name', gloss: '专名。人名用字：张孟谈，赵襄子的家臣。', note: '全卷三见都是此名。单用的「谈论」义本卷未见。',
        examples: [{ text: '趙襄子使張孟談潛出見二子', at: '周紀一' }, { text: '張孟談曰：「謀出二主之口', at: '周紀一' }] },
    ],
  },
  '潛': {
    pinyin: 'qián',
    pos: '副',
    uses: [
      { id: 'qian2-secretly', gloss: '暗中；秘密地', note: '全卷仅一见，无第二处用例，故不举例。「潜出见二子」谓张孟谈暗中出城见韩、魏二子。',
        examples: [] },
    ],
    variants: ['潜'],
  },
  '脣': {
    pinyin: 'chún',
    pos: '名',
    uses: [
      { id: 'chun2-lips', gloss: '嘴唇。', note: '全卷仅一见（「唇亡则齿寒」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '齒': {
    pinyin: 'chǐ',
    pos: '名',
    uses: [
      { id: 'chi3-tooth', gloss: '牙齿', note: '全卷仅一见，无第二处用例，故不举例。「唇亡则齿寒」是当时谚语，喻赵亡则韩、魏亦危。',
        examples: [] },
    ],
  },
  '寒': {
    pinyin: 'hán',
    pos: '形',
    uses: [
      { id: 'han2-cold', gloss: '寒冷。', note: '全卷仅一见，即「唇亡齿寒」的寒，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '次': {
    pinyin: 'cì',
    pos: '名',
    uses: [
      { id: 'ci4-next', gloss: '次序；下一个。', note: '「韩、魏为之次矣」谓韩、魏就是下一个被灭的。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '恐': {
    pinyin: 'kǒng',
    pos: '动',
    uses: [
      { id: 'kong3-fear', gloss: '担心；恐怕。', note: '全卷仅一见，即「恐事未遂而谋泄」，谓担心事情未成而谋划泄露。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '謀': {
    pinyin: 'móu',
    pos: '名',
    uses: [
      { id: 'mou2-plan', gloss: '计谋；谋划。', note: '本卷两见，都是张孟谈与韩、魏二子密谋之事。',
        examples: [{ text: '恐事未遂而謀洩', at: '周紀一' }, { text: '謀出二主之口', at: '周紀一' }] },
    ],
  },
  '洩': {
    pinyin: 'xiè',
    pos: '动',
    uses: [
      { id: 'xie4-leak', gloss: '泄露。', note: '全卷仅一见，无第二处用例，故不举例。「谋泄」即计谋泄露。',
        examples: [] },
    ],
    variants: ['𣳘'],
  },
  '禍': {
    pinyin: 'huò',
    pos: '名',
    uses: [
      { id: 'huo4-disaster', gloss: '灾祸；祸患', note: '全卷仅一见，无第二处用例，故不举例。「则祸立至矣」是二子虑谋泄之语。',
        examples: [] },
    ],
  },
  '口': {
    pinyin: 'kǒu',
    pos: '名',
    uses: [
      { id: 'kou3-mouth', gloss: '嘴；口中。', note: '全卷仅一见（「谋出二主之口」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '耳': {
    pinyin: 'ěr',
    pos: '语气',
    uses: [
      { id: 'er3-ear', pos: '名', gloss: '耳朵', note: '此为名词用法；本卷另一用法是句末语气词。',
        examples: [{ text: '謀出二主之口，入臣之耳', at: '周紀一' }] },
      { id: 'er3-only', gloss: '句末语气词，表限止，犹「罢了」', note: '本卷两见：「吾谨避之耳」「极难耳」，都是此用法。',
        examples: [{ text: '吾謹避之耳。', at: '周紀一' }, { text: '凡吾所為者，極難耳。', at: '周紀一' }] },
    ],
  },
  '傷': {
    pinyin: 'shāng',
    pos: '动',
    uses: [
      { id: 'shang1-harm', gloss: '妨害；损害。', note: '全卷仅一见，「何伤」即有什么妨害，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '陰': {
    pinyin: 'yīn',
    pos: '副',
    uses: [
      { id: 'yin1-secretly', gloss: '暗中；私下。', note: '底本作「阴与」，胡三省音注本、四库全书本作「潜与」。「二子乃阴与张孟谈约」谓二人暗中与张孟谈订约。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['隂'],
  },
  '期': {
    pinyin: 'qī',
    pos: '名',
    uses: [
      { id: 'qi1-date', gloss: '约定的日期；期限。', note: '全卷仅一见，即「为之期日而遣之」，谓约定日期后送他回去。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '遣': {
    pinyin: 'qiǎn',
    pos: '动',
    uses: [
      { id: 'qian3-send-away', gloss: '打发走；送走。', note: '全卷仅一见，无第二处用例，故不举例。「为之期日而遣之」谓约定日期之后送他回去。',
        examples: [] },
    ],
  },
  '夜': {
    pinyin: 'yè',
    pos: '名',
    uses: [
      { id: 'ye4-night', gloss: '夜间。', note: '全卷仅一见，无第二处用例，故不举例。这里是名词作状语，「襄子夜使人」即赵襄子夜里派人。',
        examples: [] },
    ],
  },
  '堤': {
    pinyin: 'dī',
    pos: '名',
    uses: [
      { id: 'di1-dike', gloss: '堤防；河堤', note: '全卷仅一见，无第二处用例，故不举例。襄子使人杀守堤之吏而决水反灌智伯军，是晋阳之战的转折。',
        examples: [] },
    ],
  },
  '吏': {
    pinyin: 'lì',
    pos: '名',
    uses: [
      { id: 'li4-official', gloss: '官吏；小吏。', note: '全卷仅一见（「守堤之吏」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '決': {
    pinyin: 'jué',
    pos: '动',
    uses: [
      { id: 'jue2-break-open', gloss: '开决；掘开', note: '「决水灌智伯军」谓掘开堤防放水灌敌军。',
        examples: [{ text: '而決水灌智伯軍。', at: '周紀一' }] },
      { id: 'jue2-vent', gloss: '决断；施展', note: '「勇足以决其暴」谓勇足以施展其暴行。',
        examples: [{ text: '勇足以決其暴', at: '周紀一' }] },
    ],
    variants: ['决'],
  },
  '軍': {
    pinyin: 'jūn',
    pos: '名',
    uses: [
      { id: 'jun1-army', gloss: '军队。', note: '「智伯军」即智伯的军队。',
        examples: [{ text: '而決水灌智伯軍', at: '周紀一' }, { text: '智伯軍救水而亂', at: '周紀一' }] },
    ],
  },
  '翼': {
    pinyin: 'yì',
    pos: '名',
    uses: [
      { id: 'yi4-wing', gloss: '翅膀。', note: '「是虎而翼者也」谓这是长了翅膀的老虎。胡注：虎而傅翼，其为害也愈甚。',
        examples: [{ text: '是虎而翼者也', at: '周紀一' }] },
      { id: 'yi4-flank', pos: '动', gloss: '从两侧夹击，是名词活用为动词。', note: '「韩、魏翼而击之」谓韩、魏从两翼夹击智伯军。',
        examples: [{ text: '韓、魏翼而擊之', at: '周紀一' }] },
    ],
  },
  '擊': {
    pinyin: 'jī',
    pos: '动',
    uses: [
      { id: 'ji1-strike', gloss: '攻击；击打。', note: '「翼而击之」为夹击智伯军；「以击强」为击打坚强之物。',
        examples: [{ text: '韓、魏翼而擊之', at: '周紀一' }, { text: '不熔范，不砥礪，則不能以擊強', at: '周紀一' }] },
    ],
  },
  '前': {
    pinyin: 'qián',
    pos: '名',
    uses: [
      { id: 'qian2-front', gloss: '前面；正面。', note: '全卷仅一见，无第二处用例，故不举例。「犯其前」谓迎击其正面。',
        examples: [] },
    ],
  },
  '唯': {
    pinyin: 'wéi',
    pos: '副',
    uses: [
      { id: 'wei2-only', gloss: '只有；唯独。', note: '全卷仅一见，无第二处用例，故不举例。智氏灭族之后，只有早已别族的辅果还在，即前文的智果；胡注：以别族也。',
        examples: [] },
    ],
  },
  '才': {
    pinyin: 'cái',
    pos: '名',
    uses: [
      { id: 'cai2-ability', gloss: '才能；才干', note: '本卷十八见，皆在《才德论》中，与「德」对举。',
        examples: [{ text: '臣光曰：智伯之亡也，才勝德也', at: '周紀一' }, { text: '夫聰察強毅之謂才', at: '周紀一' }, { text: '才者，德之資也', at: '周紀一' }] },
    ],
  },
  '異': {
    pinyin: 'yì',
    pos: '形',
    uses: [
      { id: 'yi4-differ', gloss: '不同；有分别。', note: '全卷仅一见（「才与德异」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '俗': {
    pinyin: 'sú',
    pos: '名',
    uses: [
      { id: 'su2-secular', gloss: '世俗；流俗', note: '全卷仅一见，无第二处用例，故不举例。「世俗莫之能辨」谓世俗之人不能辨别才与德。',
        examples: [] },
    ],
  },
  '通': {
    pinyin: 'tōng',
    pos: '副',
    uses: [
      { id: 'tong1-generally', gloss: '普遍；一概。', note: '全卷仅一见，「通谓之贤」即笼统地都称他为贤，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '聰': {
    pinyin: 'cōng',
    pos: '形',
    uses: [
      { id: 'cong1-perceptive', gloss: '听力好；聪敏。', note: '「聪察强毅之谓才」谓耳聪目明、明察强毅叫做才。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
    variants: ['聦'],
  },
  '察': {
    pinyin: 'chá',
    pos: '形',
    uses: [
      { id: 'cha2-shrewd', gloss: '精明；苛察。', note: '「夫聪察强毅之谓才」谓耳聪目明、精明强毅叫作才。',
        examples: [{ text: '夫聰察強毅之謂才', at: '周紀一' }] },
      { id: 'cha2-observer', pos: '名', gloss: '明察的人；善于审察的人。', note: '「是以察者多蔽于才而遗于德」谓明察之士往往为才所蔽而忽略其德。',
        examples: [{ text: '是以察者多蔽於才而遺於德', at: '周紀一' }] },
    ],
  },
  '直': {
    pinyin: 'zhí',
    pos: '形',
    uses: [
      { id: 'zhi2-upright', gloss: '正直；公正。', note: '全卷仅一见，无第二处用例，故不举例。「正直中和」是《才德论》给德下的定义。',
        examples: [] },
    ],
  },
  '資': {
    pinyin: 'zī',
    pos: '名',
    uses: [
      { id: 'zi1-reliance', gloss: '凭借；所依仗的根本。', note: '全卷仅一见，无第二处用例，故不举例。「才者，德之资也」是说才是德所凭借的。',
        examples: [] },
    ],
  },
  '雲': {
    pinyin: 'yún',
    pos: '专名',
    uses: [
      { id: 'yun2-yunmeng', gloss: '地名用字。「云梦」，古代大泽名，在今湖北一带。', note: '全卷仅一见，无第二处用例，故不举例。此处以云梦之竹喻才，谓不矫揉羽括则不能入坚。',
        examples: [] },
    ],
  },
  '夢': {
    pinyin: 'mèng',
    pos: '专名',
    uses: [
      { id: 'meng4-marsh', gloss: '「云梦」是楚地大泽之名。', note: '全卷仅一见（「云梦之竹」），无第二处用例，故不举例。胡注引《汉阳志》说云在江北、梦在江南，是两处泽。',
        examples: [] },
    ],
  },
  '竹': {
    pinyin: 'zhú',
    pos: '名',
    uses: [
      { id: 'zhu2-bamboo', gloss: '竹子；此指竹箭之材', note: '全卷仅一见，无第二处用例，故不举例。胡三省注引《禹贡》以云梦之竹为荆楚良产。',
        examples: [] },
    ],
  },
  '勁': {
    pinyin: 'jìng',
    pos: '形',
    uses: [
      { id: 'jing4-strong', gloss: '强劲；坚韧。', note: '全卷仅一见，指云梦之竹是天下最坚韧的，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '矯': {
    pinyin: 'jiǎo',
    pos: '动',
    uses: [
      { id: 'jiao3-straighten', gloss: '矫正；使弯曲。', note: '「不矫揉」谓不把竹材烤揉矫正，便做不成箭。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '揉': {
    pinyin: 'róu',
    pos: '动',
    uses: [
      { id: 'rou2-bend', gloss: '揉曲使直；用火烤使竹木弯曲或平直。', note: '全卷仅一见。胡注引康曰：「揉曲为矫，揉所以桡曲而使之直也。」无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '羽': {
    pinyin: 'yǔ',
    pos: '名',
    uses: [
      { id: 'yu3-feather', gloss: '羽毛，此指箭翎。', note: '全卷仅一见，无第二处用例，故不举例。胡注：「羽者，箭翎。」「羽括」是给箭装上羽毛并修治箭尾。',
        examples: [] },
    ],
  },
  '括': {
    pinyin: 'kuò',
    pos: '名',
    uses: [
      { id: 'kuo4-nock', gloss: '箭的末端受弦处。', note: '全卷仅一见，无第二处用例，故不举例。胡注：括者，箭窟受弦处；括，音聒，通作「筈」。「羽括」指装上箭翎与箭括。',
        examples: [] },
    ],
  },
  '棠': {
    pinyin: 'táng',
    pos: '专名',
    uses: [
      { id: 'tang2-tangxi', gloss: '地名用字。「棠溪」，古地名，以出产金属著名。', note: '全卷仅一见，无第二处用例，故不举例。此处以棠溪之金喻才，谓不熔范砥砺则不能击强。',
        examples: [] },
    ],
  },
  '溪': {
    pinyin: 'xī',
    pos: '专名',
    uses: [
      { id: 'xi1-stream', gloss: '「棠溪」是产精铁的地方。', note: '全卷仅一见（「棠溪之金」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '金': {
    pinyin: 'jīn',
    pos: '名',
    uses: [
      { id: 'jin1-metal', gloss: '金属；此指棠溪所产的铁，可以作剑', note: '全卷仅一见，无第二处用例，故不举例。胡三省注引《左传》说棠溪之地出金甚精利。',
        examples: [] },
    ],
  },
  '熔': {
    pinyin: 'róng',
    pos: '动',
    uses: [
      { id: 'rong2-melt', gloss: '熔铸；熔化。', note: '全卷仅一见，与「范」连用，指用模子熔铸，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '范': {
    pinyin: 'fàn',
    pos: '名',
    uses: [
      { id: 'fan4-mould', gloss: '铸器的模子；「熔范」谓用模子熔铸。', note: '底本作「熔范」，胡三省音注本作「镕范」，是异写。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '砥': {
    pinyin: 'dǐ',
    pos: '动',
    uses: [
      { id: 'di3-whet', gloss: '磨；用磨石磨利。', note: '全卷仅一见。胡注：「砥，轸氏翻，柔石也。砺，力制翻。」无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '礪': {
    pinyin: 'lì',
    pos: '动',
    uses: [
      { id: 'li4-whet', gloss: '磨；磨利。「砥砺」本是磨刀石，也指磨炼。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '全': {
    pinyin: 'quán',
    pos: '副',
    uses: [
      { id: 'quan2-fully', gloss: '完全；齐备。', note: '全卷仅一见，无第二处用例，故不举例。「才德全尽」是说才与德完全具备。',
        examples: [] },
    ],
  },
  '兼': {
    pinyin: 'jiān',
    pos: '动',
    uses: [
      { id: 'jian1-both', gloss: '同时具有；兼备', note: '全卷仅一见，无第二处用例，故不举例。「才德兼亡」谓才与德两者都没有，是《才德论》所谓愚人。',
        examples: [] },
    ],
  },
  '愚': {
    pinyin: 'yú',
    pos: '形',
    uses: [
      { id: 'yu2-foolish', gloss: '愚笨；愚昧。', note: '「愚者」指愚笨的人。',
        examples: [{ text: '愚者雖欲為不善', at: '周紀一' }] },
      { id: 'yu2-fool', gloss: '「愚人」指才德兼无的人。', note: '《通鉴》按才德把人分为圣人、愚人、君子、小人四等。',
        examples: [{ text: '才德兼亡謂之愚人', at: '周紀一' }, { text: '與其得小人，不若得愚人', at: '周紀一' }] },
    ],
  },
  '凡': {
    pinyin: 'fán',
    pos: '副',
    uses: [
      { id: 'fan2-all', gloss: '凡是；所有的', note: '总括之辞，本卷两见。',
        examples: [{ text: '凡取人之術，苟不得聖人、君子而與之', at: '周紀一' }, { text: '凡吾所為者，極難耳。', at: '周紀一' }] },
    ],
  },
  '術': {
    pinyin: 'shù',
    pos: '名',
    uses: [
      { id: 'shu4-method', gloss: '方法；办法。', note: '全卷仅一见，「取人之术」即选拔人才的方法，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '挾': {
    pinyin: 'xié',
    pos: '动',
    uses: [
      { id: 'xie2-hold', gloss: '夹持；携带。', note: '「挟匕首」谓怀里藏着匕首。',
        examples: [{ text: '乃詐為刑人，挾匕首', at: '周紀一' }] },
      { id: 'xie2-rely', gloss: '怀有；倚仗。', note: '胡注引朱元晦曰：挟者，兼有而恃之之称。「挟才以为善」谓仗着才能做好事。',
        examples: [{ text: '君子挾才以為善', at: '周紀一' }, { text: '挾才以為善者', at: '周紀一' }] },
    ],
  },
  '譬': {
    pinyin: 'pì',
    pos: '动',
    uses: [
      { id: 'pi4-compare', gloss: '譬如；打比方。', note: '全卷仅一见，即「譬之乳狗搏人」，谓譬如育子的母狗搏人。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '乳': {
    pinyin: 'rǔ',
    pos: '动',
    uses: [
      { id: 'ru3-nurse', gloss: '喂奶；哺育。「乳狗」即育子的母狗。', note: '全卷仅一见，无第二处用例，故不举例。胡注：「乳狗，育子之狗也。」',
        examples: [] },
    ],
  },
  '狗': {
    pinyin: 'gǒu',
    pos: '名',
    uses: [
      { id: 'gou3-dog', gloss: '狗。', note: '全卷仅一见，无第二处用例，故不举例。胡注：乳，儒遇翻，乳育也；乳狗，育子之狗也。',
        examples: [] },
    ],
  },
  '搏': {
    pinyin: 'bó',
    pos: '动',
    uses: [
      { id: 'bo2-strike', gloss: '扑击；抓咬', note: '全卷仅一见，无第二处用例，故不举例。胡注：「搏，伯各翻。」「乳狗搏人」喻愚者虽欲为不善而力不能胜。',
        examples: [] },
    ],
  },
  '勇': {
    pinyin: 'yǒng',
    pos: '名',
    uses: [
      { id: 'yong3-courage', gloss: '勇气；胆量。', note: '全卷仅一见（「勇足以决其暴」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '虎': {
    pinyin: 'hǔ',
    pos: '名',
    uses: [
      { id: 'hu3-tiger', gloss: '老虎', note: '全卷仅一见，无第二处用例，故不举例。「是虎而翼者也」谓如虎添翼。',
        examples: [] },
    ],
  },
  '嚴': {
    pinyin: 'yán',
    pos: '动',
    uses: [
      { id: 'yan2-respect', gloss: '敬畏；尊敬。', note: '「德者人之所严」即有德的人受人敬畏。',
        examples: [{ text: '夫德者人之所嚴', at: '周紀一' }] },
      { id: 'yan2-austere', pos: '形', gloss: '令人敬畏的；威严。', note: '「严者」指令人敬畏的人，与「爱者」相对。',
        examples: [{ text: '愛者易親，嚴者易疏', at: '周紀一' }] },
    ],
  },
  '愛': {
    pinyin: 'ài',
    pos: '动',
    uses: [
      { id: 'ai4-love', gloss: '喜爱；爱护。', note: '「才者人之所爱」谓才能是人们所喜爱的；「爱者易亲」谓所爱的人容易亲近。本卷「爱」不作「吝惜」讲。',
        examples: [{ text: '而才者人之所愛', at: '周紀一' }, { text: '愛者易親，嚴者易疏', at: '周紀一' }] },
    ],
  },
  '蔽': {
    pinyin: 'bì',
    pos: '动',
    uses: [
      { id: 'bi4-obscure', gloss: '蒙蔽；遮蔽。', note: '全卷仅一见，即「多蔽于才而遗于德」，谓为才所蒙蔽而忽略其德。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '遺': {
    pinyin: 'yí',
    pos: '动',
    uses: [
      { id: 'yi2-omit', gloss: '遗漏；忽略。', note: '全卷仅一见，无第二处用例，故不举例。「蔽于才而遗于德」谓只看重才而漏掉了德。本卷未见「赠送」的 wèi 一读。',
        examples: [] },
    ],
  },
  '古': {
    pinyin: 'gǔ',
    pos: '名',
    uses: [
      { id: 'gu3-ancient', gloss: '古代；古时。', note: '全卷仅一见，无第二处用例，故不举例。「自古昔以来」即从古以来。',
        examples: [] },
    ],
  },
  '來': {
    pinyin: 'lái',
    pos: '助',
    uses: [
      { id: 'lai2-since', gloss: '「以来」：表示从某时起直至现在', note: '全卷仅一见，无第二处用例，故不举例。「自古昔以来」总束《才德论》所举乱臣败子。本卷未见「来」作「到来」的动词义。',
        examples: [] },
    ],
  },
  '餘': {
    pinyin: 'yú',
    pos: '形',
    uses: [
      { id: 'yu2-surplus', gloss: '剩余；多余。', note: '全卷仅一见（「才有余而德不足」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '顛': {
    pinyin: 'diān',
    pos: '动',
    uses: [
      { id: 'dian1-overturn', gloss: '「颠覆」，倾覆；灭亡', note: '全卷仅一见，无第二处用例，故不举例。「以至于颠覆者多矣」谓因此倾覆的很多。',
        examples: [] },
    ],
    variants: ['顚'],
  },
  '覆': {
    pinyin: 'fù',
    pos: '动',
    uses: [
      { id: 'fu4-overturn', gloss: '颠覆；倾覆。', note: '全卷仅一见，「颠覆」指国家倾覆，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '特': {
    pinyin: 'tè',
    pos: '副',
    uses: [
      { id: 'te4-only', gloss: '只；仅。', note: '「岂特智伯哉」谓岂只智伯一人。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '審': {
    pinyin: 'shěn',
    pos: '动',
    uses: [
      { id: 'shen3-examine', gloss: '明察；审辨。', note: '全卷仅一见，即「苟能审于才德之分」，谓能明辨才与德的分际。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '漆': {
    pinyin: 'qī',
    pos: '动',
    uses: [
      { id: 'qi1-lacquer', gloss: '涂漆；用漆涂物。', note: '本卷两见，一见是赵襄子漆智伯的头骨，一见是豫让漆身毁容。',
        examples: [{ text: '趙襄子漆智伯之頭', at: '周紀一' }, { text: '豫讓又漆身為癩', at: '周紀一' }] },
    ],
  },
  '頭': {
    pinyin: 'tóu',
    pos: '名',
    uses: [
      { id: 'tou2-head', gloss: '头；头颅。', note: '全卷仅一见，无第二处用例，故不举例。「漆智伯之头，以为饮器」写赵襄子怨智伯之深。',
        examples: [] },
    ],
  },
  '飲': {
    pinyin: 'yǐn',
    pos: '动',
    uses: [
      { id: 'yin3-drink', gloss: '喝。「饮器」谓饮酒之器', note: '全卷仅一见，无第二处用例，故不举例。赵襄子漆智伯之头以为饮器，是豫让报仇之由。',
        examples: [] },
    ],
  },
  '豫': {
    pinyin: 'yù',
    pos: '专名',
    uses: [
      { id: 'yu4-name', gloss: '人名用字；豫让，智伯的臣子。', note: '本卷「豫」只作人名。单用可作安乐、预先讲，本卷未见。',
        examples: [{ text: '智伯之臣豫讓欲為之報仇', at: '周紀一' }, { text: '得豫讓，遂殺之', at: '周紀一' }] },
    ],
  },
  '讓': {
    pinyin: 'ràng',
    pos: '专名',
    uses: [
      { id: 'rang4-name', gloss: '人名。豫让，智伯之臣', note: '智伯死后，豫让漆身吞炭为他报仇，是〈周纪一〉末段的义士；本卷未见谦让义的「让」。',
        examples: [{ text: '智伯之臣豫讓欲為之報仇', at: '周紀一' }, { text: '襄子如廁心動，索之，獲豫讓。', at: '周紀一' }] },
    ],
  },
  '報': {
    pinyin: 'bào',
    pos: '动',
    uses: [
      { id: 'bao4-revenge', gloss: '报答；报仇。', note: '「报仇」即为智伯报仇。',
        examples: [{ text: '智伯之臣豫讓欲為之報仇', at: '周紀一' }, { text: '而此人欲為報仇', at: '周紀一' }, { text: '求以報仇，不亦難乎？', at: '周紀一' }] },
    ],
  },
  '仇': {
    pinyin: 'chóu',
    pos: '名',
    uses: [
      { id: 'chou2-foe', gloss: '仇怨；仇恨。', note: '本卷三处都在「报仇」一语之中，指豫让要为智伯报仇。',
        examples: [{ text: '智伯之臣豫讓欲為之報仇', at: '周紀一' }, { text: '而此人欲為報仇', at: '周紀一' }] },
    ],
  },
  '詐': {
    pinyin: 'zhà',
    pos: '动',
    uses: [
      { id: 'zha4-feign', gloss: '假装；欺诈。', note: '全卷仅一见，即「乃诈为刑人」，谓豫让假扮受刑之人。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '刑': {
    pinyin: 'xíng',
    pos: '名',
    uses: [
      { id: 'xing2-punishment', gloss: '刑罚；受过刑的人。「刑人」即受过刑的罪人。', note: '全卷仅一见，无第二处用例，故不举例。豫让假扮受过刑的人混进赵襄子宫中。',
        examples: [] },
    ],
  },
  '匕': {
    pinyin: 'bǐ',
    pos: '名',
    uses: [
      { id: 'bi3-dagger', gloss: '匕。与「首」合成「匕首」，指短剑。', note: '全卷仅一见，无第二处用例，故不举例。「挟匕首」即怀揣短剑。匕的本义是取食的勺匙，本卷未见。',
        examples: [] },
    ],
  },
  '宮': {
    pinyin: 'gōng',
    pos: '名',
    uses: [
      { id: 'gong1-palace', gloss: '宫室；住宅（先秦为贵族居所的通称）', note: '全卷仅一见，无第二处用例，故不举例。「入襄子宫中涂厕」谓豫让诈为刑人，混入襄子宫中粉刷厕所。',
        examples: [] },
    ],
    variants: ['宫'],
  },
  '塗': {
    pinyin: 'tú',
    pos: '动',
    uses: [
      { id: 'tu2-smear', gloss: '涂抹；粉刷。', note: '全卷仅一见（「入襄子宫中涂厕」），无第二处用例，故不举例。此指豫让假扮刑人，以粉刷厕所为由入宫。',
        examples: [] },
    ],
  },
  '廁': {
    pinyin: 'cè',
    pos: '名',
    uses: [
      { id: 'ce4-toilet', gloss: '厕所', note: '胡三省注：「厕，初吏翻，圊也。」本卷两见。',
        examples: [{ text: '入襄子宮中塗廁', at: '周紀一' }, { text: '襄子如廁心動', at: '周紀一' }] },
    ],
    variants: ['厠'],
  },
  '動': {
    pinyin: 'dòng',
    pos: '动',
    uses: [
      { id: 'dong4-stir', gloss: '触动；心动。', note: '全卷仅一见，「心动」指心里忽然有感，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '獲': {
    pinyin: 'huò',
    pos: '动',
    uses: [
      { id: 'huo4-capture', gloss: '捕获；捉到。', note: '「索之，获豫让」谓搜查之中捉到豫让。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '左': {
    pinyin: 'zuǒ',
    pos: '名',
    uses: [
      { id: 'zuo3-attendants', gloss: '左右：身边的侍从。', note: '全卷仅一见，即「左右欲杀之」。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '右': {
    pinyin: 'yòu',
    pos: '名',
    uses: [
      { id: 'you4-right', gloss: '右边；「左右」指身边的侍从。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '真': {
    pinyin: 'zhēn',
    pos: '副',
    uses: [
      { id: 'zhen1-truly', gloss: '真；确实。', note: '全卷仅一见，无第二处用例，故不举例。「真义士也」是赵襄子对豫让的赞语。',
        examples: [] },
    ],
    variants: ['眞'],
  },
  '避': {
    pinyin: 'bì',
    pos: '动',
    uses: [
      { id: 'bi4-avoid', gloss: '躲避；回避', note: '全卷仅一见，无第二处用例，故不举例。「吾谨避之耳」是襄子不欲杀豫让之语。',
        examples: [] },
    ],
  },
  '捨': {
    pinyin: 'shě',
    pos: '动',
    uses: [
      { id: 'she3-release', gloss: '舍弃；放过。', note: '全卷仅一见（「乃舍之」），无第二处用例，故不举例。此指襄子放过了豫让。',
        examples: [] },
    ],
    variants: ['舍'],
  },
  '身': {
    pinyin: 'shēn',
    pos: '名',
    uses: [
      { id: 'shen1-body', gloss: '身体；自身', note: '全卷仅一见，无第二处用例，故不举例。「漆身为癞」谓用漆涂身使生癞疮。',
        examples: [] },
    ],
  },
  '癩': {
    pinyin: 'lài',
    pos: '名',
    uses: [
      { id: 'lai4-leprosy', gloss: '癞病；恶疮。', note: '全卷仅一见，指豫让漆身装作癞病，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '吞': {
    pinyin: 'tūn',
    pos: '动',
    uses: [
      { id: 'tun1-swallow', gloss: '吞下。', note: '「吞炭为哑」谓吞下炭火，使嗓子变哑。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '炭': {
    pinyin: 'tàn',
    pos: '名',
    uses: [
      { id: 'tan4-charcoal', gloss: '木炭。', note: '全卷仅一见，即「吞炭为哑」，谓豫让吞炭使声音变哑。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '啞': {
    pinyin: 'yǎ',
    pos: '形',
    uses: [
      { id: 'ya3-mute', gloss: '哑；不能说话。', note: '全卷仅一见，无第二处用例，故不举例。「吞炭为哑」谓吞炭弄坏嗓子，装成哑巴。',
        examples: [] },
    ],
  },
  '乞': {
    pinyin: 'qǐ',
    pos: '动',
    uses: [
      { id: 'qi3-beg', gloss: '乞求；讨。', note: '全卷仅一见，无第二处用例，故不举例。「行乞于市」即在市上乞讨。胡注引郑氏《周礼注》：市，杂聚之处。',
        examples: [] },
    ],
  },
  '市': {
    pinyin: 'shì',
    pos: '名',
    uses: [
      { id: 'shi4-market', gloss: '集市；市场', note: '全卷仅一见，无第二处用例，故不举例。胡注引郑氏《周礼注》：「市，杂聚之处。」豫让漆身吞炭而行乞于市。',
        examples: [] },
    ],
  },
  '妻': {
    pinyin: 'qī',
    pos: '名',
    uses: [
      { id: 'qi1-wife', gloss: '妻子。', note: '全卷仅一见（「其妻不识也」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '友': {
    pinyin: 'yǒu',
    pos: '名',
    uses: [
      { id: 'you3-friend', gloss: '朋友', note: '全卷两见都在「行见其友，其友识之」一句里。',
        examples: [{ text: '行見其友，其友識之', at: '周紀一' }] },
    ],
  },
  '泣': {
    pinyin: 'qì',
    pos: '动',
    uses: [
      { id: 'qi4-weep', gloss: '哭泣；流泪。', note: '全卷仅一见，「为之泣」即为他流泪，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '幸': {
    pinyin: 'xìng',
    pos: '动',
    uses: [
      { id: 'xing4-favor', gloss: '宠幸；宠爱。', note: '「近幸」即亲近宠幸，「必得近幸」谓一定能得到亲近宠幸。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '邪': {
    pinyin: 'yé',
    pos: '语气',
    uses: [
      { id: 'ye2-question', gloss: '句末疑问语气词，通「耶」。', note: '全卷仅一见，即「顾不易邪？」，谓难道不容易吗。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '苦': {
    pinyin: 'kǔ',
    pos: '动',
    uses: [
      { id: 'ku3-afflict', gloss: '使受苦；折磨。', note: '全卷仅一见，无第二处用例，故不举例。「自苦如此」谓这样折磨自己。',
        examples: [] },
    ],
  },
  '委': {
    pinyin: 'wěi',
    pos: '动',
    uses: [
      { id: 'wei3-submit', gloss: '致送；委身。', note: '全卷仅一见，无第二处用例，故不举例。「委质为臣」是说委身而为人臣。',
        examples: [] },
    ],
  },
  '極': {
    pinyin: 'jí',
    pos: '副',
    uses: [
      { id: 'ji2-extremely', gloss: '极其；非常', note: '全卷仅一见，无第二处用例，故不举例。「极难耳」谓极其困难，是豫让自道其报仇之难。',
        examples: [] },
    ],
  },
  '愧': {
    pinyin: 'kuì',
    pos: '动',
    uses: [
      { id: 'kui4-shame', gloss: '使……惭愧。', note: '全卷仅一见（「将以愧天下后世之为人臣怀二心者也」），无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '懷': {
    pinyin: 'huái',
    pos: '动',
    uses: [
      { id: 'huai2-harbour', gloss: '怀藏；心存', note: '全卷仅一见，无第二处用例，故不举例。「怀二心」谓心里藏着二心。',
        examples: [] },
    ],
  },
  '橋': {
    pinyin: 'qiáo',
    pos: '名',
    uses: [
      { id: 'qiao2-bridge', gloss: '桥；桥梁。', note: '指豫让埋伏的桥，即后世所称的豫让桥。',
        examples: [{ text: '豫讓伏於橋下', at: '周紀一' }, { text: '襄子至橋，馬驚', at: '周紀一' }] },
    ],
  },
  '驚': {
    pinyin: 'jīng',
    pos: '动',
    uses: [
      { id: 'jing1-startle', gloss: '受惊；惊动。', note: '「马惊」谓马受惊，襄子因此起疑搜查。全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '肯': {
    pinyin: 'kěn',
    pos: '动',
    uses: [
      { id: 'ken3-willing', gloss: '肯；愿意。', note: '全卷仅一见，即「有子五人，不肯置后」，谓赵襄子因伯鲁未立而不肯立继承人。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '封': {
    pinyin: 'fēng',
    pos: '动',
    uses: [
      { id: 'feng1-enfeoff', gloss: '封赐土地；分封。', note: '全卷仅一见，无第二处用例，故不举例。「封伯鲁之子于代」谓把代地封给伯鲁的儿子。',
        examples: [] },
    ],
  },
  '早': {
    pinyin: 'zǎo',
    pos: '副',
    uses: [
      { id: 'zao3-early', gloss: '早；提早。', note: '全卷仅一见，无第二处用例，故不举例。「早卒」即早死。',
        examples: [] },
    ],
  },
  '浣': {
    pinyin: 'huàn',
    pos: '专名',
    uses: [
      { id: 'huan4-name', gloss: '人名。浣，赵襄子之孙、伯鲁之子，后立为赵献子。', note: '本卷三见，皆叙赵氏立后。胡注引《史记·六国表》：《索隐》作「晚」。',
        examples: [{ text: '立其子浣為趙氏後', at: '周紀一' }, { text: '弟桓子嘉逐浣而自立', at: '周紀一' }, { text: '復迎浣而立之', at: '周紀一' }] },
    ],
  },
  '弟': {
    pinyin: 'dì',
    pos: '名',
    uses: [
      { id: 'di4-brother', gloss: '弟弟；同辈中年幼的男子。', note: '全卷仅一见（「弟桓子嘉逐浣而自立」），无第二处用例，故不举例。胡注引《史记》说《世本》以桓子为襄子之子，与此处「弟」字不合。',
        examples: [] },
    ],
  },
  '嘉': {
    pinyin: 'jiā',
    pos: '专名',
    uses: [
      { id: 'jia1-name', gloss: '人名。赵桓子嘉，赵襄子之弟', note: '全卷仅一见，无第二处用例，故不举例。此字底本原无，是校勘者据《史记》索隐所引《世本》补的。',
        examples: [] },
    ],
  },
  '迎': {
    pinyin: 'yíng',
    pos: '动',
    uses: [
      { id: 'ying2-welcome', gloss: '迎接；迎立。', note: '全卷仅一见，指赵氏族人迎回赵浣而立之，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '獻': {
    pinyin: 'xiàn',
    pos: '专名',
    uses: [
      { id: 'xian4-posthumous', gloss: '谥号用字：献子，即赵献子，名浣。', note: '赵氏之人杀桓子之子，迎浣而立之，是为献子；其子籍即赵烈侯。本卷「献」只作谥号用字。',
        examples: [{ text: '復迎浣而立之，是為獻子', at: '周紀一' }, { text: '獻子生籍，是為烈侯', at: '周紀一' }] },
    ],
  },
  '烈': {
    pinyin: 'liè',
    pos: '专名',
    uses: [
      { id: 'lie4-liehou', gloss: '谥号用字。烈侯，即赵籍，赵献子之子。', note: '全卷仅一见，即「献子生籍，是为烈侯」，赵籍与魏斯、韩虔同年受封为诸侯。无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '啟': {
    pinyin: 'qǐ',
    pos: '专名',
    uses: [
      { id: 'qi3-name', gloss: '人名用字。启章，韩武子的名字。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
  '景': {
    pinyin: 'jǐng',
    pos: '专名',
    uses: [
      { id: 'jing3-posthumous', gloss: '专名。谥号用字：韩景侯。', note: '全卷仅一见，无第二处用例，故不举例。',
        examples: [] },
    ],
  },
};
