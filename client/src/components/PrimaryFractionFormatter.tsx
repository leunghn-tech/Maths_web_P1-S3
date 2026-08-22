/** Maths Quest 小學分數格式器：把題庫中的 a/b 自動轉為手帳題面上的上下分子／分母。 */
import { useEffect } from "react";

const fractionPattern = /(\d+)\/(\d+)/g;
const protectedSelector = ".mq-fraction, script, style, textarea, input, code, pre, [data-no-fraction-format]";

function formatTextNode(node: Text) {
  const source = node.nodeValue ?? "";
  fractionPattern.lastIndex = 0;
  if (!fractionPattern.test(source)) return;
  fractionPattern.lastIndex = 0;
  const fragment = document.createDocumentFragment();
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = fractionPattern.exec(source)) !== null) {
    const [notation, numerator, denominator] = match;
    const position = match.index;
    fragment.append(source.slice(cursor, position));
    const fraction = document.createElement("span");
    fraction.className = "mq-fraction";
    fraction.setAttribute("aria-label", `${denominator} 分之 ${numerator}`);
    const top = document.createElement("sup");
    top.textContent = numerator;
    const bottom = document.createElement("sub");
    bottom.textContent = denominator;
    fraction.append(top, bottom);
    fragment.append(fraction);
    cursor = position + notation.length;
  }
  fragment.append(source.slice(cursor));
  node.replaceWith(fragment);
}

function formatFractions(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      fractionPattern.lastIndex = 0;
      const containsFraction = fractionPattern.test(node.nodeValue ?? "");
      fractionPattern.lastIndex = 0;
      return parent && !parent.closest(protectedSelector) && containsFraction ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  fractionPattern.lastIndex = 0;
  nodes.forEach(formatTextNode);
}

export default function PrimaryFractionFormatter() {
  useEffect(() => {
    let queued = false;
    const scheduleFormat = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => { queued = false; formatFractions(document.body); });
    };
    scheduleFormat();
    const observer = new MutationObserver(scheduleFormat);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
