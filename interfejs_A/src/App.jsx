import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { translate } from './i18n.js';
import Stage from './components/Stage.jsx';
import IdleModal from './components/IdleModal.jsx';
import Attract from './screens/Attract.jsx';
import DineOption from './screens/DineOption.jsx';
import Menu from './screens/Menu.jsx';
import Cart from './screens/Cart.jsx';
import Payment from './screens/Payment.jsx';
import Confirmation from './screens/Confirmation.jsx';
import { endScenario, flush, isActive, logError, refreshAois, setResetHandler } from './logger.js';

const IDLE_MS = 60_000;

// Kolejność ekranów — decyduje o kierunku animacji przejścia
const ORDER = ['attract', 'dine', 'menu', 'cart', 'payment', 'done'];

const screenVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-30%', opacity: dir > 0 ? 1 : 0, scale: dir > 0 ? 1 : 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-30%' : '100%', opacity: dir > 0 ? 0 : 1, scale: dir > 0 ? 0.96 : 1 }),
};

export default function App() {
  const [screen, setScreen] = useState('attract');
  const [dir, setDir] = useState(1);
  const [lang, setLang] = useState('pl');
  const [dine, setDine] = useState(null);
  const [cart, setCart] = useState([]);
  const [donation, setDonation] = useState(null);
  const [a11y, setA11y] = useState(false);
  const [idle, setIdle] = useState(false);
  const [order, setOrder] = useState(null);
  const idleTimer = useRef();

  const t = useMemo(() => translate(lang), [lang]);

  const go = useCallback(
    (next) => {
      setDir(ORDER.indexOf(next) >= ORDER.indexOf(screen) ? 1 : -1);
      setScreen(next);
    },
    [screen]
  );

  // Powrót do ekranu startowego. Anulowanie zamówienia przez uczestnika nie kończy scenariusza
  // (koniec = potwierdzenie albo przerwanie przez prowadzącego), ale dopisuje rejestr do pliku.
  const reset = useCallback((reason) => {
    if (reason === 'limit_czasu') logError('LIMIT_CZASU', `${t('moreTimeSub')} 0 s`);
    setDir(-1);
    setScreen('attract');
    setCart([]);
    setDine(null);
    setDonation(null);
    setLang('pl');
    setA11y(false);
    setIdle(false);
    setOrder(null);
    if (reason !== 'scenariusz') setTimeout(() => flush(), 0);
  }, [t]);

  // Start scenariusza klawiszem prowadzącego → kiosk wraca na ekran startowy
  useEffect(() => { setResetHandler(() => reset('scenariusz')); }, [reset]);

  // Wykrywanie bezczynności
  const bump = useCallback(() => {
    clearTimeout(idleTimer.current);
    if (screen === 'attract' || screen === 'done') return;
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, [screen]);

  useEffect(() => {
    bump();
    return () => clearTimeout(idleTimer.current);
  }, [bump]);

  // Klawisz prowadzącego T: od razu pokazuje ostrzeżenie o bezczynności (test limitu czasu)
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.toLowerCase() !== 't') return;
      if (screen === 'attract' || screen === 'done') return;
      clearTimeout(idleTimer.current);
      setIdle(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen]);

  const addToCart = (item) => setCart((c) => [...c, { ...item, uid: crypto.randomUUID() }]);
  const replaceLine = (uid, item) => setCart((c) => c.map((i) => (i.uid === uid ? { ...item, uid } : i)));
  const updateQty = (uid, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => i.uid !== uid) : c.map((i) => (i.uid === uid ? { ...i, qty } : i))));

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const total = subtotal + (donation?.amount ?? 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const finishOrder = (method) => {
    const number = Math.floor(100 + Math.random() * 899);
    setOrder({ number, method, total });
    go('done');
  };

  // Potwierdzenie zamówienia = koniec scenariusza (po zalogowaniu ekranu potwierdzenia), zapis pliku
  useEffect(() => {
    if (screen === 'done' && order && isActive()) {
      const items = cart.map((l) => `${l.qty}x${l.product.id}`).join(',');
      endScenario({ sukces: 1, opis: `zamowienie=${order.number} platnosc=${order.method} suma_gr=${Math.round(order.total * 100)} na_wynos=${dine === 'out' ? 1 : 0} pozycje=${items}` });
    }
  }, [screen, order]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tryb dostępności przesuwa cały interfejs → AOI mają nowe położenie
  const prevA11y = useRef(a11y);
  useEffect(() => {
    if (prevA11y.current === a11y) return;
    prevA11y.current = a11y;
    refreshAois(`dostepnosc=${a11y ? 1 : 0}`);
  }, [a11y]);

  const shared = { t, lang, setLang, go, reset, a11y, setA11y };

  const screens = {
    attract: <Attract {...shared} />,
    dine: <DineOption {...shared} onPick={(d) => { setDine(d); go('menu'); }} />,
    menu: <Menu {...shared} cart={cart} count={count} subtotal={subtotal} addToCart={addToCart} />,
    cart: (
      <Cart
        {...shared}
        cart={cart}
        updateQty={updateQty}
        replaceLine={replaceLine}
        subtotal={subtotal}
        total={total}
        donation={donation}
        setDonation={setDonation}
      />
    ),
    payment: <Payment {...shared} total={total} onPaid={finishOrder} />,
    done: <Confirmation {...shared} order={order} dine={dine} />,
  };

  return (
    <Stage onPointerDown={bump}>
      <motion.div
        className="a11y-layer"
        animate={a11y ? { scale: 0.62, y: 365 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 24 }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={screen}
            className="screen"
            custom={dir}
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 220, damping: 30, mass: 0.9 }}
          >
            {screens[screen]}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {idle && (
          <IdleModal
            t={t}
            onContinue={() => { setIdle(false); bump(); }}
            onReset={(why) => reset(why)}
          />
        )}
      </AnimatePresence>
    </Stage>
  );
}
