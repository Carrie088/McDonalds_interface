import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MEAL_SAVING, MEAL_UPGRADE, canCustomize, canMakeMeal, extras, formatPrice } from '../data.js';
import QtyStepper from './QtyStepper.jsx';
import CustomizeChips from './CustomizeChips.jsx';
import { tr, lineDetails } from '../menuI18n.js';
import { useOverlayScreen } from '../logger.js';
import { loop, useA11y, useStill } from '../a11y.js';

const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

// Okno pojedynczego produktu. Zestawy obsługuje MealWizard.
// `initial` = istniejąca pozycja koszyka → tryb edycji.
// `onMakeMeal(prefill)` = klient wybrał propozycję zestawu → otwieramy kreator z jego ustawieniami.
export default function ProductModal({ product, t, lang, onClose, onAdd, onMakeMeal, initial }) {
  const cfg = initial?.config;
  const editing = Boolean(initial);
  const [qty, setQty] = useState(initial?.qty ?? 1);
  const [info, setInfo] = useState(false);
  const [custom, setCustom] = useState(editing);
  const [removed, setRemoved] = useState(cfg?.removed ?? []);
  const [added, setAdded] = useState(cfg?.added ?? []);
  const boxRef = useRef(null);
  useOverlayScreen('produkt', boxRef, `produkt=${product.id}${editing ? ' edycja=1' : ''}`);
  const { say } = useA11y();
  const still = useStill();

  const customizable = canCustomize(product);
  const upsell = canMakeMeal(product) && onMakeMeal;
  const extrasPrice = extras.filter((e) => added.includes(e.id)).reduce((s, e) => s + e.price, 0);
  const unitPrice = product.price + extrasPrice;

  useEffect(() => { say(`${tr(product.name, lang)}, ${formatPrice(unitPrice)}. ${t('helpProduct')}`); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    const config = { removed, added };
    onAdd({ product, qty, unitPrice, details: lineDetails({ product, config }, lang, t), config });
  };

  return (
    <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        ref={boxRef}
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 200, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 160, scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <button className="close-x" data-aoi="AOI_wstecz" data-log="zamknij" aria-label={t('close')} onClick={onClose}>✕<span>{t('close')}</span></button>

        <div className="pm-scroll">
          <motion.div className="pm-image" style={{ background: product.bg }}>
            <motion.span
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            >
              {product.emoji}
            </motion.span>
          </motion.div>

          <h2 className="pm-name">{tr(product.name, lang)}</h2>
          <div className="pm-price">{formatPrice(unitPrice)}</div>

          <button className="btn-outline sm center" data-log="wartosci_odzywcze" onClick={() => setInfo(!info)}>{t('nutrition')}</button>
          <AnimatePresence initial={false}>
            {info && (
              <motion.div className="pm-info" data-log="wartosci_odzywcze_tresc" {...collapse}>
                <div className="pm-info-inner">
                  <div className="kcal"><b>{product.kcal}</b> kcal</div>
                  {product.ingredients.length > 0 && (
                    <p><b>{t('ingredients')}:</b> {product.ingredients.map((i) => tr(i, lang)).join(', ')}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {upsell && (
            <motion.button
              className="meal-upsell"
              data-log="propozycja_zestawu"
              onClick={() => onMakeMeal({ removed, added, qty })}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.25, type: 'spring', stiffness: 240, damping: 20 } }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="mu-art">
                <motion.span {...loop(still, { rotate: [-6, 6, -6] }, { duration: 2.4 })}>🍟</motion.span>
                <span>🥤</span>
              </span>
              <span className="mu-text">
                <b>{t('makeMeal')}</b>
                <span>{t('makeMealSub')}</span>
                <small>{t('youSave')} {formatPrice(MEAL_SAVING)}</small>
              </span>
              <span className="mu-cta">
                <b>+{formatPrice(MEAL_UPGRADE)}</b>
                <span className="mu-btn">{t('makeMealYes')}</span>
              </span>
            </motion.button>
          )}

          {customizable && (
            <>
              <button className={`btn-outline wide ${custom ? 'active' : ''}`} data-log="personalizuj" onClick={() => setCustom(!custom)}>
                {custom ? t('personalizeDone') : t('personalize')}
              </button>
              <AnimatePresence initial={false}>
                {custom && (
                  <motion.div className="pm-custom" {...collapse}>
                    <CustomizeChips product={product} removed={removed} setRemoved={setRemoved} added={added} setAdded={setAdded} t={t} lang={lang} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <QtyStepper value={qty} onChange={setQty} large t={t} />
        </div>

        <div className="pm-actions">
          <button className="btn-outline flat" data-aoi="AOI_wstecz" data-log="anuluj" onClick={onClose}>{t('cancel')}</button>
          <motion.button className="btn-yellow flat" data-aoi="AOI_cel" data-log={editing ? 'zapisz_zmiany' : 'dodaj_do_zamowienia'} whileTap={{ scale: 0.96 }} onClick={submit}>
            {editing ? t('saveChanges') : t('addToOrder')} · {formatPrice(unitPrice * qty)}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
