import { useEffect } from "react";

const practicePath = /^\/practice\/(?:p[2-6]|s[1-3])/i;

export const formatQuestionProgress = (current: number, total: number) => `第 ${Math.min(Math.max(current, 1), total)} 題／共 ${total} 題`;

function findCurrentQuestion(text: string) {
  const numbered = text.match(/第\s*(\d+)\s*題/);
  if (numbered) return Number(numbered[1]);
  const station = text.match(/STATION\s*0?(\d+)/i);
  return station ? Number(station[1]) : 1;
}

function findTotalQuestions(root: ParentNode) {
  const steps = root.querySelectorAll(".mq-mission-steps span").length;
  if (steps > 0) return steps;
  const match = root.textContent?.match(/(?:共\s*)?(\d+)\s*題/) ?? root.textContent?.match(/\/(\d+)/);
  return match ? Number(match[1]) : 8;
}

function updateProgressLabels() {
  if (!practicePath.test(window.location.pathname)) return;
  document.querySelectorAll<HTMLElement>(".mq-question-head").forEach((head) => {
    const root = head.closest<HTMLElement>(".mq-practice") ?? document.body;
    const total = findTotalQuestions(root);
    const current = findCurrentQuestion(head.textContent ?? "");
    let label = head.querySelector<HTMLElement>(".mq-question-count");
    if (!label) {
      label = document.createElement("span");
      label.className = "mq-question-count";
      head.prepend(label);
    }
    const text = formatQuestionProgress(current, total);
    if (label.textContent !== text) label.textContent = text;
  });
  document.querySelectorAll<HTMLElement>("p").forEach((paragraph) => {
    const station = paragraph.textContent?.match(/STATION\s*0?(\d+)\s*·\s*(\d+)\s*\/\s*(\d+)/i);
    if (!station) return;
    let label = paragraph.querySelector<HTMLElement>(".mq-station-count");
    if (!label) {
      label = document.createElement("span");
      label.className = "mq-station-count";
      paragraph.append(label);
    }
    const text = formatQuestionProgress(Number(station[2]), Number(station[3]));
    if (label.textContent !== text) label.textContent = text;
  });
  document.querySelectorAll<HTMLElement>(".mq-practice").forEach((root) => {
    const summary = root.textContent?.match(/答對(?:了)?\s*(\d+)\s*\/\s*(\d+)\s*題/);
    const heading = Array.from(root.querySelectorAll("h2")).find((item) => /完成|過關|挑戰/.test(item.textContent ?? ""));
    if (!summary || !heading) return;
    const correct = Number(summary[1]);
    const total = Number(summary[2]);
    let accuracy = root.querySelector<HTMLElement>(".mq-accuracy-summary");
    if (!accuracy) {
      accuracy = document.createElement("p");
      accuracy.className = "mq-accuracy-summary";
      heading.insertAdjacentElement("afterend", accuracy);
    }
    const text = `答對率：${Math.round((correct / total) * 100)}%（${correct}／${total} 題）`;
    if (accuracy.textContent !== text) accuracy.textContent = text;
  });
}

/** 在保留各題庫既有互動邏輯下，統一展示目前題數。 */
export default function PracticeQuestionProgress() {
  useEffect(() => {
    updateProgressLabels();
    const observer = new MutationObserver(updateProgressLabels);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
