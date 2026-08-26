import { useEffect } from "react";
import { getDifficultyLabels, getSecondaryDifficulty, secondaryDifficultyOrder, type SecondaryDifficulty } from "@/lib/secondaryDifficulty";

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

function currentLanguage() {
  const englishButton = Array.from(document.querySelectorAll("button")).find((button) => button.textContent?.trim() === "EMI English");
  return englishButton?.className.includes("bg-[#172b3f]") ? "en" : "zh";
}

function applyDifficultyMode() {
  if (!secondaryPaths.has(location.pathname)) return;
  const difficulty = getSecondaryDifficulty();
  const language = currentLanguage();
  if (document.body.dataset.secondaryDifficulty !== difficulty) document.body.dataset.secondaryDifficulty = difficulty;

  document.querySelectorAll<HTMLElement>(".mq-concept-choices").forEach((group) => {
    const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>("button"));
    buttons.forEach((button, index) => {
      button.dataset.secondaryDifficultyOrder ??= String(index);
      const originalIndex = Number(button.dataset.secondaryDifficultyOrder);
      const hidden = difficulty === "basic" && originalIndex > 2;
      if (button.hidden !== hidden) button.hidden = hidden;
    });
    const originalOrder = difficulty === "challenge" ? [2, 0, 3, 1] : buttons.map((button) => Number(button.dataset.secondaryDifficultyOrder));
    const desired = originalOrder.map((originalIndex) => buttons.find((button) => Number(button.dataset.secondaryDifficultyOrder) === originalIndex)).filter(Boolean) as HTMLButtonElement[];
    if (desired.some((button, index) => group.children[index] !== button)) desired.forEach((button) => group.append(button));
  });

  document.querySelectorAll<HTMLElement>("p").forEach((paragraph) => {
    const text = paragraph.textContent?.trim() ?? "";
    if (text.startsWith("導師提示：") || text.startsWith("Mentor cue:")) {
      const hidden = difficulty === "challenge";
      if (paragraph.hidden !== hidden) paragraph.hidden = hidden;
    }
  });

  const header = document.querySelector<HTMLElement>("main header");
  if (!header) return;
  let control = header.querySelector<HTMLElement>(".secondary-difficulty-control");
  if (!control) {
    control = document.createElement("div");
    control.className = "secondary-difficulty-control flex w-full items-center gap-1 rounded-lg border border-[#172b3f]/15 bg-white/90 p-1 text-[11px] font-bold sm:ml-auto sm:w-auto";
    header.append(control);
  }
  if (control.dataset.difficulty === difficulty && control.dataset.language === language) return;
  control.dataset.difficulty = difficulty;
  control.dataset.language = language;
  control.textContent = "";
  secondaryDifficultyOrder.forEach((level) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rounded-md px-2 py-1.5 transition ${difficulty === level ? "bg-[#172b3f] text-white" : "text-[#172b3f] hover:bg-[#f8f5ed]"}`;
    button.textContent = getDifficultyLabels(level, language);
    button.setAttribute("aria-pressed", String(difficulty === level));
    button.addEventListener("click", () => {
      const next = new URL(location.href);
      next.searchParams.set("difficulty", level);
      window.location.assign(next.toString());
    });
    control?.append(button);
  });
}

export default function SecondaryDifficultyControl() {
  useEffect(() => {
    applyDifficultyMode();
    const observer = new MutationObserver(applyDifficultyMode);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
