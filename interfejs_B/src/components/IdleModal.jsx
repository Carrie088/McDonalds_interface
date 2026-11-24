import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useOverlayScreen } from '../logger.js';
import { useA11y } from '../a11y.js';

export default function IdleModal({ t, onContinue, onReset, onCancel, seconds = 15 }) {
  const [left, setLeft] = useState(seconds);
  const boxRef = useRef(null);
  const { say } = useA11y();
  useOverlayScreen('bezczynnosc', boxRef);

  useEffect(() => {
    if (left <= 0) { onReset('limit_czasu'); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onReset]);

  useEffect(() => { say(`${t('moreTime')} ${t('moreTimeSub')} ${seconds} s. ${t('idleExplain')}`, true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (left === 10) say(`${t('moreTimeSub')} 10 s.`, true); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        ref={boxRef}
        className="dialog"
        role="alertdialog"
        aria-label={t('moreTime')}
        initial={{ scale: 0.85, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <div className="idle-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" className="ring-bg" />
            <motion.circle
              cx="60" cy="60" r="52" className="ring-fg"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: left / seconds }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>
          <span>{left}</span>
        </div>
        <h2>{t('moreTime')}</h2>
        <p>{t('moreTimeSub')} {left} s</p>
        <p className="dialog-note">{t('idleExplain')}</p>
        <div className="dialog-actions">
          <button className="btn-outline lg" data-log="bezczynnosc_od_nowa" onClick={onCancel}>{t('noRestart')}</button>
          <button className="btn-yellow lg" data-log="bezczynnosc_kontynuuj" onClick={onContinue}>{t('yesMore')}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
