import Logo from './Logo.jsx';

// Wersja B, tryb ułatwionego zasięgu: górna część ekranu to strefa informacyjna, wszystkie przyciski są pod nią.
const TITLES = { dine: 'progDine', menu: 'progMenu', cart: 'progCart', payment: 'progPay', done: 'progDone' };
export const hasTopZone = (screen) => screen in TITLES;

export default function TopBar({ t, screen, height }) {
  if (!hasTopZone(screen)) return null;

  return (
    <header className="topbar reach" style={{ height }}>
      <div className="tb-head">
        <Logo size={90} />
        <b>{t(TITLES[screen])}</b>
      </div>
    </header>
  );
}
