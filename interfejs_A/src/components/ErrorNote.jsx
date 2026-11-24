import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { logError } from '../logger.js';

// Komunikat o błędzie pokazany uczestnikowi (np. „Wybierz dodatek”). Rejestruje wiersz `blad`,
// a sam komunikat jest obszarem AOI_blad (wiersz `aoi` przy pojawieniu się, `aoi_znika` po zniknięciu).
export function useErrorNote(ms = 3500) {
  const [err, setErr] = useState(null);
  const timer = useRef();
  const show = useCallback((code, text) => {
    logError(code, text);
    setErr({ code, text, key: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setErr(null), ms);
  }, [ms]);
  const hide = useCallback(() => { clearTimeout(timer.current); setErr(null); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [err, show, hide];
}

// Wyświetla się nad rodzicem (rodzic musi mieć position: relative), więc nie przesuwa innych AOI
export default function ErrorNote({ err }) {
  return (
    <div className="error-wrap">
      <AnimatePresence>
        {err && (
          <motion.div
            key={err.key}
            className="error-note"
            role="alert"
            data-aoi="AOI_blad"
            data-log="komunikat_bledu"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <span aria-hidden>⚠️</span> {err.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
