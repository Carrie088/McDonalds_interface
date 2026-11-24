import { AnimatePresence, motion } from 'framer-motion';
import { useA11y } from '../a11y.js';

export default function QtyStepper({ value, onChange, min = 1, large = false, t }) {
  const { say } = useA11y();
  const label = (key, sign) => (t ? t(key) : sign);
  const change = (q) => {
    onChange(q);
    if (t) say(`${t('quantity')}: ${q}`);
  };
  return (
    <div className={`qty ${large ? 'qty-lg' : ''}`}>
      <button className="qty-btn" data-log="ilosc_minus" aria-label={label('decrease', '−')} disabled={value <= min} onClick={() => change(value - 1)}>−</button>
      <div className="qty-val">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <button className="qty-btn" data-log="ilosc_plus" aria-label={label('increase', '+')} onClick={() => change(value + 1)}>+</button>
    </div>
  );
}
