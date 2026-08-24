import { CheckCircle2, ShieldAlert } from "lucide-react";
import { evaluatePasswordStrength } from "@/lib/passwordStrength";

export default function PasswordStrengthHint({ password }: { password: string }) {
  const strength = evaluatePasswordStrength(password);
  return <div className="rounded-xl border border-[#172b3f]/10 bg-[#fffdf8] p-4" aria-live="polite"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-[#617286]">密碼強度</span><span className="text-xs font-black" style={{ color: strength.color }}>{strength.label}</span></div><div className="mt-2 grid grid-cols-4 gap-1" aria-label={`密碼強度：${strength.label}`}>{[1, 2, 3, 4].map((step) => <span key={step} className="h-2 rounded-full" style={{ backgroundColor: step <= strength.score ? strength.color : "rgba(23,43,63,.1)" }} />)}</div><div className="mt-3 flex gap-2 text-xs leading-5 text-[#617286]">{strength.score >= 4 ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0e8b87]" /> : <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#c8811e]" />}<ul className="list-disc space-y-0.5 pl-4">{strength.suggestions.slice(0, 2).map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul></div></div>;
}
