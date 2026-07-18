/* =========================================================
   i18n — Chinese / English switching
   ---------------------------------------------------------
   UI            : dictionary of interface strings { key: {zh, en} }
   LangContext   : current language ("zh" | "en")
   useLangState(): App-level state hook (persists to localStorage)
   useLang()     : read current language inside any component
   useT()        : returns t(key) -> localized UI string
   pick(lang,obj): localize a content object { zh, en } (or a plain string)
   ========================================================= */

const LANG_KEY = "hw_book_lang";

const LangContext = React.createContext("zh");

function useLangState() {
  const [lang, setLangRaw] = React.useState(() => {
    try { return localStorage.getItem(LANG_KEY) || "zh"; } catch (e) { return "zh"; }
  });
  React.useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);
  const setLang = (l) => {
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    setLangRaw(l);
  };
  const toggle = () => setLang(lang === "zh" ? "en" : "zh");
  return [lang, setLang, toggle];
}

function useLang() { return React.useContext(LangContext); }

function useT() {
  const lang = React.useContext(LangContext);
  return (key) => {
    const e = UI[key];
    if (e === undefined) return key;
    if (typeof e === "object") return e[lang] !== undefined ? e[lang] : e.zh;
    return e;
  };
}

// Localize a { zh, en } object; a bare string is returned as-is.
function pick(lang, obj) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] !== undefined ? obj[lang] : (obj.zh !== undefined ? obj.zh : obj.en);
}
// The "other" language for a content object (used for the sub-title lines).
function other(lang, obj) { return pick(lang === "zh" ? "en" : "zh", obj); }

// "{n} 章" -> fmt("{n} 章", {n: 3})
function fmt(str, map) {
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (map[k] !== undefined ? map[k] : `{${k}}`));
}

const UI = {
  /* nav */
  nav_home:    { zh: "首页", en: "Home" },
  nav_about:   { zh: "关于", en: "About" },
  nav_bom:     { zh: "清单", en: "BOM" },
  lang_title:  { zh: "切换语言", en: "Switch language" },
  theme_title: { zh: "切换主题", en: "Toggle theme" },

  /* hero */
  hero_badge:  { zh: "开源 · 中英双语 · 硬件自学", en: "Open · bilingual · self-taught hardware" },
  hero_l1:     { zh: "从一颗 LED,", en: "From one LED" },
  hero_l2a:    { zh: "到掌握", en: "to mastering" },
  hero_l2b:    { zh: "硬件原理。", en: "hardware." },
  hero_sub:    {
    zh: "一站式电子与嵌入式硬件自学地图:欧姆定律、分压、RC 滤波,数字与模拟 I/O、PWM 与 ADC,再到微控制器、传感器、执行器与 UART/I²C/SPI 通信。每一章都配可交互的电路波形图,让你先看懂「为什么」,再动手写代码。共 {M} 个模块、{C} 章。",
    en: "A single self-study map for electronics and embedded hardware: Ohm's law, dividers and RC filtering; digital & analog I/O, PWM and ADC; then microcontrollers, sensors, actuators and UART/I²C/SPI buses. Every chapter ships an interactive circuit or waveform so you grasp the \"why\" before you write a line of code. {M} modules, {C} chapters.",
  },
  cta_start:   { zh: "从第一章开始 →", en: "Start chapter 1 →" },
  cta_howto:   { zh: "如何使用", en: "How it works" },
  cta_roadmap: { zh: "查看路线图", en: "See the roadmap" },

  meta_modules:  { zh: "模块", en: "Modules" },
  meta_chapters: { zh: "章", en: "Chapters" },
  meta_parts:    { zh: "元件", en: "Parts" },
  meta_hours:    { zh: "小时", en: "Hours" },

  your_progress: { zh: "你的进度", en: "Your progress" },
  synced:        { zh: "本地保存 · 无需登录", en: "Saved locally · no login" },

  /* sections */
  sec01:       { zh: "学习路线图", en: "Learning roadmap" },
  sec01_aside: { zh: "从基础电学一路到通信总线", en: "From basic circuits to communication buses" },
  sec02:       { zh: "八大模块", en: "Eight modules" },
  sec02_aside: { zh: "点击进入任意模块", en: "Click any module to enter" },
  sec03:       { zh: "学习方法", en: "The method" },
  sec03_aside: { zh: "先原理,再仿真,后硬件", en: "Principle, then simulation, then silicon" },

  rm_notstarted: { zh: "未开始", en: "Not started" },
  rm_done:       { zh: "已完成", en: "Done" },
  rm_track:      { zh: "先修依赖", en: "Prerequisite link" },

  hours_unit:    { zh: "小时", en: "h" },
  modules_count: { zh: "章", en: "chapters" },
  done_word:     { zh: "完成", en: "done" },
  enter_word:    { zh: "进入 →", en: "Enter →" },

  phil1_zh: { zh: "看懂原理", en: "See the principle" },
  phil1_b:  {
    zh: "每一章先讲清物理:电压推动电流、电阻限制电流、电容储存电荷。可交互图让你亲手拖动参数,观察波形与数值如何变化。",
    en: "Each chapter starts with the physics: voltage pushes current, resistance limits it, capacitance stores charge. Interactive figures let you drag the parameters and watch the numbers and waveforms respond.",
  },
  phil2_zh: { zh: "先仿真,零风险", en: "Simulate first, zero risk" },
  phil2_b:  {
    zh: "内容取材自 Wokwi 在线仿真所覆盖的元件与开发板:Arduino、ESP32、树莓派 Pico、DHT22、HC-SR04、SSD1306……先在浏览器里接线,不会烧板、不缺元件。",
    en: "Content is grounded in the parts and boards you can simulate on Wokwi — Arduino, ESP32, Raspberry Pi Pico, DHT22, HC-SR04, SSD1306 and more. Wire it up in the browser first: nothing to burn out, nothing missing from the drawer.",
  },
  phil3_zh: { zh: "再上真硬件", en: "Then reach for silicon" },
  phil3_b:  {
    zh: "原理与仿真打底之后,同一份电路和代码可以直接搬到面包板上。每章的引脚表、限流电阻计算和时序图都以实际器件为准。",
    en: "With principle and simulation in hand, the same circuit and sketch drop straight onto a breadboard. Every chapter's pinout, current-limiting math and timing diagram matches real parts.",
  },

  footer_tag:  { zh: "self-taught hardware · 硬件自学 · 2026", en: "self-taught hardware · 2026" },
  footer_sync: { zh: "进度本地保存", en: "progress saved locally" },

  /* module page */
  bc_home:    { zh: "首页", en: "Home" },
  bc_modules: { zh: "模块", en: "Modules" },
  module_word:{ zh: "模块", en: "Module" },
  of_word:    { zh: "共", en: "of" },
  m_meta_chapters: { zh: "章数", en: "Chapters" },
  m_meta_hours:    { zh: "预计小时", en: "Est. hours" },
  m_meta_level:    { zh: "难度", en: "Level" },
  m_meta_progress: { zh: "进度", en: "Progress" },
  chapter_list: { zh: "本模块章节", en: "Chapters in this module" },
  click_enter:  { zh: "点击任意章节进入", en: "Click a chapter to enter" },
  no_prereq:    { zh: "无先修", en: "No prereq" },
  prereq_n:     { zh: "{n} 项先修", en: "{n} prereq" },
  not_found_m:  { zh: "未找到该模块。", en: "Module not found." },

  diff_1: { zh: "入门", en: "Intro" },
  diff_2: { zh: "进阶", en: "Core" },
  diff_3: { zh: "挑战", en: "Advanced" },

  /* chapter page */
  bc_chapter:   { zh: "章节", en: "Chapter" },
  ch_sec_intro:   { zh: "本章导读", en: "Overview" },
  ch_sec_obj:     { zh: "学习目标", en: "Objectives" },
  ch_sec_outline: { zh: "内容大纲", en: "Outline" },
  ch_sec_viz:     { zh: "交互演示", en: "Interactive demo" },
  ch_sec_notes:   { zh: "核心讲义", en: "Core notes" },
  viz_hint:     { zh: "拖动滑块,观察数值与波形随参数实时变化。", en: "Drag the sliders and watch the numbers and waveform respond in real time." },
  key_badge:    { zh: "重点", en: "Key" },
  loading_notes:{ zh: "正在加载讲义……", en: "Loading notes…" },
  notes_soon:   { zh: "本章深度讲义正在编写中。以上目标与大纲即为本章脉络,先动手在仿真里接线试试。", en: "The deep-dive notes for this chapter are being written. Use the objectives and outline above as your map — and try wiring it in the simulator first." },
  back_to:      { zh: "返回", en: "Back to" },
  est_word:     { zh: "预计", en: "Est." },
  level_word:   { zh: "难度", en: "Level" },
  parts_word:   { zh: "涉及元件", en: "Parts" },
  prereq_word:  { zh: "先修", en: "Prereq" },
  mark_done_btn:{ zh: "标记为已完成", en: "Mark as complete" },
  marked_done:  { zh: "已完成", en: "Completed" },
  not_found_c:  { zh: "未找到该章节。", en: "Chapter not found." },

  /* about */
  about_kicker: { zh: "关于本站", en: "About" },
  about_q:      { zh: "为什么造这个站?", en: "Why this site?" },
  about_sub:    { zh: "把硬件原理讲清楚,而不只是照抄接线。", en: "Teach the principle, not just the wiring." },
  about_h1: { zh: "这是什么", en: "What this is" },
  about_p1: {
    zh: "一个面向自学者的电子与嵌入式硬件教程,共 {M} 个模块、{C} 章。从最基础的电压/电流/电阻,到微控制器、传感器与通信总线,循序渐进。",
    en: "A self-study course in electronics and embedded hardware — {M} modules and {C} chapters. It builds from the very basics of voltage, current and resistance up to microcontrollers, sensors and communication buses.",
  },
  about_p1b: { zh: "全部内容中英双语,支持浅色/深色主题,进度保存在你自己的浏览器里,无需注册。", en: "Everything is bilingual (Chinese/English), supports light and dark themes, and keeps your progress in your own browser — no signup." },
  about_h2: { zh: "为什么配可交互图", en: "Why interactive figures" },
  about_p2: {
    zh: "硬件的难点常在「看不见」:电流多大、电容充到几伏、PWM 占空比如何决定亮度。每章的交互图把这些不可见的量画出来,拖动滑块即可建立直觉。",
    en: "The hard part of hardware is that it's invisible: how much current flows, how far a capacitor charges, how a PWM duty cycle sets brightness. The interactive figures draw those hidden quantities so you can build intuition by dragging a slider.",
  },
  about_h3: { zh: "内容取材", en: "Where the content comes from" },
  about_p3: {
    zh: "模块与元件选型参考了 Wokwi 在线仿真平台所覆盖的开发板与器件,便于你「读完即可仿真」。你可以把每章电路复制到仿真器里立即运行,再迁移到真实面包板。",
    en: "The choice of modules and parts follows what the Wokwi online simulator covers, so you can read a chapter and immediately simulate it. Copy a chapter's circuit into the simulator, run it, then move it onto a real breadboard.",
  },
  about_h4: { zh: "如何使用", en: "How to use it" },
  about_p4: {
    zh: "按路线图从上到下学:先打好模块一、二的电学与 I/O 基础,再进入微控制器与外设。读完一章就点「标记为已完成」,进度会保存在本地。",
    en: "Follow the roadmap top to bottom: lay the circuit and I/O foundations in modules one and two, then move on to microcontrollers and peripherals. Mark a chapter complete when you finish — progress is stored locally.",
  },

  /* printable BOM shopping-list page */
  bom_kicker:   { zh: "物料清单 · 采购单", en: "Bill of Materials · Shopping List" },
  bom_title:    { zh: "智能护理床 · 采购清单", en: "Smart Care Bed · Shopping List" },
  bom_sub:      { zh: "研究/原型级 BOM,均为现货,可从 Digi-Key、Mouser、亚马逊、Adafruit、SparkFun 采购。", en: "Research / prototype-grade BOM — all off-the-shelf from Digi-Key, Mouser, Amazon, Adafruit, SparkFun." },
  bom_print:    { zh: "🖨 打印 / 存为 PDF", en: "🖨 Print / Save as PDF" },
  bom_disclaimer: { zh: "⚠ 本清单为原型级器件,非医疗器械。走向受监管产品需替换为医疗级隔离器件并通过 IEC 60601 认证(见 CB5)。", en: "⚠ This list is prototype-grade and not a medical device. A regulated product needs medical-grade isolated parts and IEC 60601 certification (see CB5)." },
  bom_col_item:  { zh: "元件", en: "Item" },
  bom_col_model: { zh: "示例型号", en: "Example model" },
  bom_col_qty:   { zh: "数量", en: "Qty" },
  bom_col_note:  { zh: "用途 / 备注", en: "Purpose / Notes" },
  bom_starter_only: { zh: "只看最小入门套件", en: "Starter kit only" },
  bom_show_all:  { zh: "显示全部", en: "Show all" },
  bom_starter_tag: { zh: "入门套件", en: "starter" },
  bom_tier_optional: { zh: "可选", en: "optional" },
  bom_tier_product:  { zh: "产品级", en: "product-grade" },
  bom_starter_note: { zh: "「入门套件」是成本最低的可运行原型;带标记的行即属于它。", en: "The starter kit is the cheapest runnable prototype; tagged rows belong to it." },
  bom_footer:   { zh: "硬件自学 · 智能护理床采购清单 · 原型级 · 非医疗器械", en: "self-taught hardware · Smart Care Bed shopping list · prototype-grade · not a medical device" },
};

window.LangContext = LangContext;
window.useLangState = useLangState;
window.useLang = useLang;
window.useT = useT;
window.pick = pick;
window.other = other;
window.fmt = fmt;
window.UI = UI;
