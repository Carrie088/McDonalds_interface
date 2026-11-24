// Ustawienia dostępności wersji B (kontrast, większy tekst, ułatwiony zasięg, asystent głosowy).
import { createContext, useContext } from 'react';

// textSize: 0 = normalny, 1 = średni, 2 = duży
export const DEFAULT_OPTS = { contrast: false, textSize: 0, noMotion: false, moreTime: false, reach: false, audio: false };
export const TEXT_SIZES = ['textNormal', 'textMedium', 'textLarge'];

export const A11yContext = createContext({ opts: DEFAULT_OPTS, say: () => {} });
export const useA11y = () => useContext(A11yContext);

export const useStill = () => {
  const { opts } = useContext(A11yContext);
  return !!opts.noMotion;
};

// Zapętlona animacja dekoracyjna; w trybie „Bez animacji” element stoi w pozycji wyjściowej.
export const loop = (still, animate, transition) => (still
  ? { animate: Object.fromEntries(Object.entries(animate).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])), transition: { duration: 0 } }
  : { animate, transition: { repeat: Infinity, ...transition } });

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

const VOICE_LANG = { pl: 'pl-PL', en: 'en-GB', uk: 'uk-UA' };
const ICONS = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}✕✓✎文]/gu;

export const speechText = (s) =>
  String(s ?? '').replace(ICONS, ' ').replace(/\s*\n+\s*/g, '. ').replace(/\s+/g, ' ').replace(/^[.\s]+|[.\s]+$/g, '').trim();

let last = { s: '', at: 0 };

// `interrupt` = przerwij to, co jest czytane (np. kolejne dotknięcie); bez niego komunikat czeka w kolejce
export function speak(text, lang = 'pl', interrupt = false) {
  if (!canSpeak) return;
  const s = speechText(text);
  if (!s) return;
  // React StrictMode (npm run dev) montuje okna dwa razy — ten sam komunikat tuż po sobie czytamy raz
  const now = Date.now();
  if (s === last.s && now - last.at < 500) return;
  last = { s, at: now };
  if (interrupt) window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(s);
  u.lang = VOICE_LANG[lang] ?? 'pl-PL';
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith(u.lang.slice(0, 2)));
  if (voice) u.voice = voice;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

export const stopSpeaking = () => { if (canSpeak) window.speechSynthesis.cancel(); };
