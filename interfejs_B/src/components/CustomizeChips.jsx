import { extras, formatPrice } from '../data.js';
import { tr } from '../menuI18n.js';
import { slug } from '../logger.js';

// Wybór składników do usunięcia i płatnych dodatków — wspólny dla okna produktu i kreatora zestawu
export default function CustomizeChips({ product, removed, setRemoved, added, setAdded, t, lang }) {
  const toggle = (setList, id) => setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className="pm-section">
      <h4>{t('without')}</h4>
      <div className="chip-row wrap">
        {product.ingredients.map((ing) => (
          <button key={ing} data-log={`bez_${slug(ing)}`} className={`chip ${removed.includes(ing) ? 'off' : ''}`} onClick={() => toggle(setRemoved, ing)}>
            {removed.includes(ing) ? '✕ ' : ''}{tr(ing, lang)}
          </button>
        ))}
      </div>
      <h4>{t('extra')}</h4>
      <div className="chip-row wrap">
        {extras.map((e) => (
          <button key={e.id} data-log={`dodatek_${e.id}`} className={`chip ${added.includes(e.id) ? 'on' : ''}`} onClick={() => toggle(setAdded, e.id)}>
            {added.includes(e.id) ? '✓' : '+'} {tr(e.name, lang)} <small>{formatPrice(e.price)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
