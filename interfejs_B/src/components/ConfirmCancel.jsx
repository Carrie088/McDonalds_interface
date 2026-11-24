import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useOverlayScreen } from '../logger.js';
import { useA11y } from '../a11y.js';

// Wersja B: potwierdzenie przed nieodwracalną czynnością (anulowanie zamówienia, usunięcie produktu).
// Bez `title`/`text`/`yes`/`no` pokazuje pytanie o anulowanie całego zamówienia.
export default function ConfirmCancel({ t, onKeep, onConfirm, title, text, yes, no, name = 'anuluj', ico = '🗑️' }) {
  const boxRef = useRef(null);
  const { say } = useA11y();
  const q = title ?? t('cancelQ');
  const sub = text ?? t('cancelQSub');
  useOverlayScreen(`${name}_potwierdzenie`, boxRef);
  useEffect(() => { say(`${q} ${sub}`); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onKeep}>
      <motion.div
        ref={boxRef}
        className="dialog"
        role="alertdialog"
        aria-label={q}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <div className="dialog-ico" aria-hidden>{ico}</div>
        <h2>{q}</h2>
        <p>{sub}</p>
        <div className="dialog-actions">
          <button className="btn-outline lg danger" data-log={`${name}_tak`} onClick={onConfirm}>✕ {yes ?? t('cancelYes')}</button>
          <button className="btn-yellow lg" data-aoi="AOI_wstecz" data-log={`${name}_nie`} onClick={onKeep}>{no ?? t('cancelNo')}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
