import { useEffect } from "react";
import { localizeSecondaryOption } from "@/lib/secondaryBilingual";

const secondaryPaths = new Set([
  "/practice/s1",
  "/practice/s2",
  "/practice/s3",
  "/practice/s1-interactive",
  "/practice/s2-interactive",
  "/practice/s3-interactive",
  "/practice/s3-sim",
  "/practice/s3-deep",
  "/practice/s3-lab",
]);
const sourceText = new WeakMap<Text, string>();
const chineseInterfaceText: Record<string, string> = {
  "01 OBSERVE": "01 觀察",
  "02 SOLVE": "02 解題",
  "03 CHECK": "03 檢查",
  "01 MOVE": "01 操作",
  "02 MODEL": "02 建模",
  "01 MARK": "01 標記",
  "02 TRANSFORM": "02 變換",
  "02 PROVE": "02 證明",
  "OBSERVE": "觀察",
  "SOLVE": "解題",
  "CHECK": "檢查",
  "MOVE": "操作",
  "MODEL": "建模",
  "MARK": "標記",
  "TRANSFORM": "變換",
  "PROVE": "證明",
  "RULE": "規則",
  "FACTOR": "公因式",
  "BRACKET": "括號內式",
  "CHECKPOINT": "檢查點",
  "ANS": "答",
  "HANDS-ON MODEL": "互動模型",
  "S1 WORKSHOP": "中一練習站",
  "S2 WORKSHOP": "中二練習站",
  "S3 FIELD NOTE": "中三練習站",
  "S3 SIMULATION": "中三模擬站",
  "GEOMETRY PROOF": "幾何證明",
  "REASON → ISOSCELES": "理由 → 等腰三角形",
  "FAVOURABLE / TOTAL": "有利結果／所有結果",
};

function activeLanguage() {
  const englishButton = Array.from(document.querySelectorAll("button")).find((button) => button.textContent?.trim() === "EMI English");
  return englishButton?.className.includes("bg-[#172b3f]") ? "en" : "zh";
}

function applyLanguageQuery() {
  if (new URLSearchParams(location.search).get("lang") !== "en") return;
  const englishButton = Array.from(document.querySelectorAll("button")).find((button) => button.textContent?.trim() === "EMI English");
  if (englishButton && !englishButton.className.includes("bg-[#172b3f]")) englishButton.click();
}

function localizeChoices() {
  if (!secondaryPaths.has(location.pathname)) return;
  const language = activeLanguage();
  document.querySelectorAll<HTMLButtonElement>(".mq-concept-choices button").forEach((button) => {
    const source = button.dataset.secondarySource ?? button.textContent?.trim() ?? "";
    button.dataset.secondarySource = source;
    const translated = localizeSecondaryOption(source, language);
    if (button.textContent !== translated) button.textContent = translated;
  });
}

function localizeChrome() {
  if (!secondaryPaths.has(location.pathname)) return;
  const language = activeLanguage();
  Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href="/#path"]')).forEach((link) => {
    const text = `← ${language === "zh" ? "返回學習地圖" : "Back to map"}`;
    if (link.textContent !== text) link.textContent = text;
  });
  Array.from(document.querySelectorAll<HTMLElement>(".mq-question-count")).forEach((badge) => {
    const match = badge.textContent?.match(/第\s*(\d+)\s*題\s*[／/]\s*共\s*(\d+)\s*題/);
    if (match) {
      const text = language === "zh" ? `第 ${match[1]} 題／共 ${match[2]} 題` : `Question ${match[1]} of ${match[2]}`;
      if (badge.textContent !== text) badge.textContent = text;
    }
  });
  Array.from(document.querySelectorAll<HTMLParagraphElement>("p")).forEach((paragraph) => {
    const textNode = paragraph.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
    const source = sourceText.get(textNode as Text) ?? textNode.nodeValue ?? "";
    const trimmed = source.trim();
    if (!trimmed.startsWith("STATION")) return;
    const numbers = trimmed.match(/(\d+)\s*\/\s*(\d+)/);
    const mode = Object.keys(chineseInterfaceText).find((key) => trimmed.endsWith(key));
    const output = language === "zh" && numbers && mode
      ? `第 ${numbers[1]} 題／共 ${numbers[2]} 題 · ${chineseInterfaceText[mode]}`
      : source;
    sourceText.set(textNode as Text, source);
    if (textNode.nodeValue !== output) textNode.nodeValue = output;
  });
}

function localizeBilingualTextNodes() {
  if (!secondaryPaths.has(location.pathname)) return;
  const language = activeLanguage();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }
  textNodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) return;
    const source = sourceText.get(textNode) ?? textNode.nodeValue ?? "";
    const trimmed = source.trim();
    if (trimmed.includes("CMI") || trimmed.includes("EMI")) return;
    const station = trimmed.startsWith("STATION") ? trimmed.match(/(\d+)\s*\/\s*(\d+)/) : null;
    const stationMode = Object.keys(chineseInterfaceText).find((key) => trimmed.endsWith(key));
    const localized = station && stationMode && language === "zh"
      ? `第 ${station[1]} 題／共 ${station[2]} 題 · ${chineseInterfaceText[stationMode]}`
      : trimmed.includes(" / ")
        ? localizeSecondaryOption(trimmed, language)
        : language === "zh"
          ? chineseInterfaceText[trimmed] ?? trimmed
          : trimmed;
    if (localized === trimmed && textNode.nodeValue === source) return;
    sourceText.set(textNode, source);
    const leading = source.slice(0, source.indexOf(trimmed));
    const trailing = source.slice(source.indexOf(trimmed) + trimmed.length);
    const output = `${leading}${localized}${trailing}`;
    if (textNode.nodeValue !== output) textNode.nodeValue = output;
  });
}

export default function SecondaryOptionLanguageSync() {
  useEffect(() => {
    applyLanguageQuery();
    localizeChoices();
    localizeChrome();
    localizeBilingualTextNodes();
    const observer = new MutationObserver(() => {
      localizeChoices();
      localizeChrome();
      localizeBilingualTextNodes();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
