import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useOverlayScreen } from '../logger.js';
import { TEXT_SIZES, canSpeak } from '../a11y.js';

// Wersja B: panel ułatwień dostępu, wysuwany od dołu ekranu (w zasięgu osoby siedzącej)
const OPTIONS = [
  { id: 'contrast', ico: '◐', title: 'optContrast', sub: 'optContrastSub' },
  { id: 'textSize', ico: 'A+', title: 'optText', sub: 'optTextSub', sizes: true },
  { id: 'noMotion', ico: '⏸', title: 'optMotion', sub: 'optMotionSub' },
  { id: 'moreTime', ico: '⏱', title: 'optTime', sub: 'optTimeSub' },
  { id: 'reach', ico: '♿', title: 'optReach', sub: 'optReachSub' },
  { id: 'audio', ico: '🔊', title: 'optAudio', sub: 'optAudioSub', na: !canSpeak },
];

export default function A11yPanel({ t, opts, setOpt, resetOpts, onClose }) {
  const boxRef = useRef(null);
  useOverlayScreen('dostepnosc_ustawienia', boxRef);
  const anyOn = Object.values(opts).some(Boolean);

  return (
    <motion.div className="backdrop sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        ref={boxRef}
        className="a11y-sheet"
        role="dialog"
        aria-label={t('a11yTitle')}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      >
        <h2><span aria-hidden>♿</span> {t('a11yTitle')}</h2>
        <p className="a11y-sub">{t('a11ySub')}</p>
        <div className="a11y-opts">
          {OPTIONS.map((o) => (o.sizes ? (
            <div key={o.id} className={`a11y-opt ${opts[o.id] ? 'on' : ''}`} role="radiogroup" aria-label={t(o.title)}>
              <span className="a11y-ico" aria-hidden>{o.ico}</span>
              <span className="a11y-text">
                <b>{t(o.title)}</b>
                <small>{t(o.sub)}</small>
              </span>
              <span className="a11y-sizes">
                {TEXT_SIZES.map((key, n) => (
                  <button
                    key={key}
                    role="radio"
                    aria-checked={opts[o.id] === n}
                    data-log={`dostepnosc_tekst_${n}`}
                    data-speak="off"
                    className={`a11y-size ${opts[o.id] === n ? 'on' : ''}`}
                    onClick={() => setOpt(o.id, n)}
                  >
                    <i aria-hidden>A</i>
                    {t(key)}
                  </button>
                ))}
              </span>
            </div>
          ) : (
            <button
              key={o.id}
              role="switch"
              aria-checked={opts[o.id]}
              data-log={`dostepnosc_${o.id}`}
              data-speak="off"
              className={`a11y-opt ${opts[o.id] ? 'on' : ''}`}
              disabled={o.na}
              onClick={() => setOpt(o.id, !opts[o.id])}
            >
              <span className="a11y-ico" aria-hidden>{o.ico}</span>
              <span className="a11y-text">
                <b>{t(o.title)}</b>
                <small>{o.na ? t('optAudioNA') : t(o.sub)}</small>
              </span>
              <span className="a11y-switch" aria-hidden>
                <span className="a11y-knob" />
                <span className="a11y-state">{opts[o.id] ? t('on') : t('off')}</span>
              </span>
            </button>
          )))}
        </div>
        <div className="a11y-actions">
          <button className="btn-outline lg" data-log="dostepnosc_wylacz_wszystkie" disabled={!anyOn} onClick={resetOpts}>{t('a11yReset')}</button>
          <button className="btn-yellow lg" data-log="dostepnosc_gotowe" onClick={onClose}>{t('a11yDone')}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
