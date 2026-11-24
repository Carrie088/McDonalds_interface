import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { attractSlides } from '../data.js';
import { LANGS } from '../i18n.js';
import { tr } from '../menuI18n.js';
import { useBaseScreen } from '../logger.js';
import Logo from '../components/Logo.jsx';
import { useA11y } from '../a11y.js';

export default function Attract({ t, lang, setLang, go, a11y, setA11y }) {
  const [i, setI] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const screenRef = useBaseScreen('start');
  const { opts } = useA11y();
  const still = opts.noMotion;

  useEffect(() => {
    if (still) return undefined;
    const id = setInterval(() => setI((x) => (x + 1) % attractSlides.length), 5000);
    return () => clearInterval(id);
  }, [still]);

  const slide = attractSlides[i];

  // Okienko języków otwiera się nad przyciskami, więc przy większym tekście nie wychodzi poza ekran
  const langPop = (
    <AnimatePresence>
      {langOpen && (
        <motion.div className="lang-pop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
          {LANGS.map((l) => (
            <button key={l.id} data-log={`jezyk_${l.id}`} className={`lang-btn ${lang === l.id ? 'on' : ''}`} onClick={() => { setLang(l.id); setLangOpen(false); }}>
              {lang === l.id && '✓ '}{l.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={screenRef} className="attract" onClick={() => go('dine')}>
      <div className="attract-hero" role="button" data-log="pokaz_slajdow" data-label={tr(slide.title, lang)}>
        <AnimatePresence initial={false}>
          <motion.div
            key={i}
            className="attract-slide"
            style={{ background: slide.bg }}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            <motion.div
              className="attract-emoji"
              initial={still ? false : { y: 120, scale: 0.6, rotate: -12 }}
              animate={{ y: still ? 0 : [0, -30, 0], scale: 1, rotate: 0 }}
              transition={still ? { duration: 0 } : { y: { repeat: Infinity, duration: 4, ease: 'easeInOut' }, scale: { duration: 0.9 }, rotate: { duration: 0.9 } }}
            >
              {slide.emoji}
            </motion.div>
            <motion.h1 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}>
              {tr(slide.title, lang)}
            </motion.h1>
            <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }}>
              {tr(slide.sub, lang)}
            </motion.p>
          </motion.div>
        </AnimatePresence>
        <div className="attract-logo"><Logo size={110} /></div>
        <div className="dots">
          {attractSlides.map((_, k) => (
            <span key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
      </div>

      <div className="attract-panel" onClick={(e) => e.stopPropagation()}>
        <motion.div className="app-tile" whileTap={{ scale: 0.97 }}>
          <h3>{t('haveApp')}</h3>
          <p>{t('scanHere')}</p>
          <motion.div className="phone-anim" animate={{ x: still ? 0 : [0, -18, 0] }} transition={still ? { duration: 0 } : { repeat: Infinity, duration: 2.2 }}>
            📲
          </motion.div>
          <motion.span className="chev" animate={{ y: still ? 0 : [0, 8, 0] }} transition={still ? { duration: 0 } : { repeat: Infinity, duration: 1.6 }}>⌄</motion.span>
        </motion.div>

        <div className="attract-right">
          <motion.button
            className="start-btn"
            data-aoi="AOI_cel"
            data-log="start"
            onClick={() => go('dine')}
            animate={still ? { boxShadow: '0 0 0 0 rgba(255,199,44,0)' } : { boxShadow: ['0 0 0 0 rgba(255,199,44,0.7)', '0 0 0 26px rgba(255,199,44,0)'] }}
            transition={still ? { duration: 0 } : { repeat: Infinity, duration: 1.8 }}
            whileTap={{ scale: 0.96 }}
          >
            <b>{t('clickHere')}</b>
            <span>{t('toStart')}</span>
          </motion.button>
          <div className="attract-small">
            <button className="btn-outline" data-log="jezyki" aria-label={t('languages')} onClick={() => setLangOpen(!langOpen)}>
              <span className="ico">文A</span>
              <span><small>{t('languages')}</small><br /><b>EN UA</b></span>
            </button>
            <button className={`btn-outline ${a11y ? 'active' : ''}`} data-aoi="AOI_dostepnosc" data-log="dostepnosc" aria-label={t('a11y')} onClick={() => setA11y(!a11y)}>♿ {t('a11y')}</button>
            {langPop}
          </div>
          <div className="copyright">© 2026 Kiosk Demo</div>
        </div>
      </div>
    </div>
  );
}
