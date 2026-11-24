import { motion } from 'framer-motion';
import { loop, useA11y, useStill } from '../a11y.js';

export function ScanBox({ t }) {
  const still = useStill();
  return (
    <motion.div className="scan-box" whileTap={{ scale: 0.95 }} data-log="zeskanuj_aplikacje" aria-label={t('scan')}>
      <span className="scan-ico">📱</span>
      <small>{t('haveApp')}</small>
      <b>{t('scan')}</b>
      <motion.span {...loop(still, { y: [0, 6, 0] }, { duration: 1.6 })}>⌄</motion.span>
    </motion.div>
  );
}

export function FooterButtons({ t, reset, a11y, setA11y, requestRestart }) {
  // Wersja B: te same przyciski co w A, ale „Zacznij od nowa” przy niepustym zamówieniu pyta o potwierdzenie
  return (
    <div className="footer-btns vb">
      <button className="btn-outline sm" data-log="zacznij_od_nowa" onClick={requestRestart}>{t('restart')}</button>
      <button className={`btn-outline sm ${a11y ? 'active' : ''}`} data-aoi="AOI_dostepnosc" data-log="dostepnosc" aria-label={t('a11y')} onClick={() => setA11y(!a11y)}>♿ {t('a11y')}</button>
      <div className="copyright">© 2026 Kiosk Demo</div>
    </div>
  );
}
