export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "尚未輸入" | "較弱" | "普通" | "良好" | "強健";
  color: string;
  suggestions: string[];
};

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "尚未輸入", color: "#9aa7b5", suggestions: ["建議使用至少 12 個字元的獨特密碼。"] };
  const suggestions: string[] = [];
  let score = 0;
  if (password.length >= 8) score += 1;
  else suggestions.push("增加至至少 8 個字元。");
  if (password.length >= 12) score += 1;
  else suggestions.push("建議使用 12 個或以上字元，會更安全。");
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else suggestions.push("混合英文大寫及小寫字母。");
  if (/\d/.test(password)) score += 1;
  else suggestions.push("加入至少一個數字。");
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else suggestions.push("加入符號，例如 !、? 或 #。");
  if (/^(password|123456|qwerty|abc123|letmein)/i.test(password) || /(.)\1{3,}/.test(password)) {
    score = Math.min(score, 1);
    suggestions.unshift("避免常見字詞、連續數字或重複字元。");
  }
  const clamped = Math.min(4, score) as PasswordStrength["score"];
  const levels: Record<PasswordStrength["score"], Pick<PasswordStrength, "label" | "color">> = {
    0: { label: "尚未輸入", color: "#9aa7b5" }, 1: { label: "較弱", color: "#f05a3c" }, 2: { label: "普通", color: "#c8811e" }, 3: { label: "良好", color: "#4f6eae" }, 4: { label: "強健", color: "#0e8b87" },
  };
  return { score: clamped, ...levels[clamped], suggestions: suggestions.length ? suggestions : ["密碼強健。請勿重複使用於其他網站，也不要分享給任何人。"] };
}
