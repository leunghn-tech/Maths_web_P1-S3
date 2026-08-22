/** Maths Quest 小學生語音：使用裝置內建語音朗讀，不需上傳學生資料。 */
export function speakCantonese(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-HK";
  utterance.rate = 0.82;
  utterance.pitch = 1.08;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => voice.lang.toLowerCase().startsWith("zh-hk")) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("zh")) ?? null;
  window.speechSynthesis.speak(utterance);
  return true;
}
