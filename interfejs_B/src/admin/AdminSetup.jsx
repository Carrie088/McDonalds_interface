import { useEffect, useMemo, useState } from 'react';
import { DEFAULTS, fileNameFor } from '../logger.js';

// Ten projekt to wyłącznie wersja B interfejsu (wersja A jest w osobnym projekcie interfejs_A)
const WERSJA = 'B';
import './admin.css';

// Panel prowadzącego: dane uczestnika przed uruchomieniem kiosku.
// Wartości startowe: parametry adresu (?interfejs=…&uczestnik=…) → ostatnio użyte → DEFAULTS.
const STORAGE_KEY = 'pun_panel_ostatnie';

const readStored = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; } catch { return {}; }
};
const writeStored = (v) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch { /* tryb prywatny itp. */ }
};

// „2”, „p2”, „P02” → „P02”
const normalizeCode = (v) => {
  const s = String(v ?? '').trim().toUpperCase();
  const digits = s.replace(/^P/, '');
  return /^\d{1,2}$/.test(digits) ? `P${digits.padStart(2, '0')}` : s;
};

const validate = (f) => {
  const e = {};
  const n = Number(f.interfejs);
  if (!Number.isInteger(n) || n < 1 || n > 10) e.interfejs = 'Numer interfejsu z Tabeli 1: od 1 do 10.';
  if (!/^P(0[1-9]|[1-9]\d)$/.test(f.uczestnik)) e.uczestnik = 'Kod uczestnika w formacie P01–P99 (nadaje prowadzący).';
  return e;
};

function Segmented({ value, options, onChange, name }) {
  return (
    <div className="adm-seg" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          type="button"
          key={o}
          role="radio"
          aria-checked={value === o}
          className={value === o ? 'on' : ''}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function AdminSetup({ onStart }) {
  const initial = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    const stored = readStored();
    const pick = (k) => q.get(k) ?? stored[k] ?? DEFAULTS[k];
    return {
      interfejs: String(pick('interfejs')),
      uczestnik: normalizeCode(q.get('uczestnik') ?? stored.uczestnik ?? ''),
      wersja: WERSJA,
      kolejnosc: pick('kolejnosc'),
      scenariusz: q.get('scenariusz') ?? 'S1',
    };
  }, []);

  const [form, setForm] = useState(initial);
  const [fullscreen, setFullscreen] = useState(true);
  const [touched, setTouched] = useState(false);
  const [fileInfo, setFileInfo] = useState(null); // { istnieje, wiersze } | { blad: true }
  const [starting, setStarting] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const errors = validate(form);
  const valid = Object.keys(errors).length === 0;
  const fileName = valid ? fileNameFor(form) : null;

  // Czy plik tego uczestnika i wersji już istnieje (serwer Vite)
  useEffect(() => {
    if (!fileName) { setFileInfo(null); return undefined; }
    let cancelled = false;
    const id = setTimeout(() => {
      fetch(`/api/zdarzenia?nazwa=${encodeURIComponent(fileName)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
        .then((info) => { if (!cancelled) setFileInfo(info); })
        .catch(() => { if (!cancelled) setFileInfo({ blad: true }); });
    }, 200);
    return () => { cancelled = true; clearTimeout(id); };
  }, [fileName]);

  const scaling = Math.round(window.devicePixelRatio * 100);
  const screenSize = `${window.screen.width} × ${window.screen.height}`;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || starting) return;
    setStarting(true);
    writeStored({ interfejs: form.interfejs, uczestnik: form.uczestnik, wersja: form.wersja, kolejnosc: form.kolejnosc });
    await onStart({ ...form, interfejs: Number(form.interfejs) }, fullscreen);
  };

  const showErr = (k) => touched && errors[k];

  return (
    <div className="adm">
      <form className="adm-card" onSubmit={submit} noValidate>
        <header className="adm-head">
          <span className="adm-badge">Panel prowadzącego · wersja B</span>
          <h1>Nowa sesja badania — interfejs B</h1>
          <p>Wpisz dane uczestnika. Kiosk uruchomi się po zatwierdzeniu, a od tej chwili każde dotknięcie trafia do pliku zdarzeń.</p>
        </header>

        <div className="adm-grid">
          <label className="adm-field">
            <span>Numer interfejsu</span>
            <input
              type="number"
              min="1"
              max="10"
              inputMode="numeric"
              value={form.interfejs}
              onChange={(e) => set('interfejs')(e.target.value)}
              aria-invalid={Boolean(showErr('interfejs'))}
            />
            <small className={showErr('interfejs') ? 'adm-err' : ''}>{showErr('interfejs') || 'Z Tabeli 1 harmonogramu (1–10).'}</small>
          </label>

          <label className="adm-field">
            <span>Kod uczestnika</span>
            <input
              type="text"
              placeholder="np. P07"
              autoFocus={!initial.uczestnik}
              autoComplete="off"
              spellCheck={false}
              value={form.uczestnik}
              onChange={(e) => set('uczestnik')(e.target.value.toUpperCase())}
              onBlur={(e) => set('uczestnik')(normalizeCode(e.target.value))}
              aria-invalid={Boolean(showErr('uczestnik'))}
            />
            <small className={showErr('uczestnik') ? 'adm-err' : ''}>{showErr('uczestnik') || 'Globalny kod P01–P99, ten sam we wszystkich grupach.'}</small>
          </label>

          <div className="adm-field">
            <span>Badana wersja</span>
            <div className="adm-fixed">B <small>(ten projekt uruchamia tylko wersję B)</small></div>
          </div>

          <div className="adm-field">
            <span>Kolejność wersji w sesji</span>
            <Segmented name="Kolejność" value={form.kolejnosc} options={['AB', 'BA']} onChange={set('kolejnosc')} />
          </div>

          <div className="adm-field adm-wide">
            <span>Pierwszy scenariusz</span>
            <Segmented name="Scenariusz" value={form.scenariusz} options={['S1', 'S2', 'S3']} onChange={set('scenariusz')} />
            <small>Kolejne scenariusze numerują się same. Zwykle zaczynasz od S1.</small>
          </div>
        </div>

        <section className="adm-status" aria-live="polite">
          <div className="adm-row">
            <span>Plik zdarzeń</span>
            <b className="adm-mono">{fileName ? `zdarzenia/${fileName}` : '—'}</b>
          </div>
          {fileInfo && !fileInfo.blad && (
            <p className={`adm-note ${fileInfo.istnieje ? 'warn' : 'ok'}`}>
              {fileInfo.istnieje
                ? `Ten plik już istnieje (${fileInfo.wiersze} zdarzeń). Nowa sesja zostanie dopisana na jego końcu — sprawdź, czy kod uczestnika i wersja są poprawne.`
                : 'Nowy plik — zostanie utworzony przy pierwszym zapisie.'}
            </p>
          )}
          {fileInfo?.blad && (
            <p className="adm-note bad">Brak serwera zapisu (uruchom kiosk przez „npm run dev”). Bez niego plik pobierze się przez przeglądarkę.</p>
          )}
          <div className="adm-checks">
            <span className={scaling === 100 ? 'ok' : 'warn'}>
              Skalowanie systemu: {scaling}%{scaling !== 100 && ' — ustaw 100%, inaczej współrzędne nie zgodzą się z eyetrackerem'}
            </span>
            <span className="ok">Rozdzielczość ekranu: {screenSize}</span>
          </div>
        </section>

        <section className="adm-keys">
          <h2>Sterowanie w trakcie sesji (klawiatura)</h2>
          <ul>
            <li><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> start scenariusza S1/S2/S3 (kiosk wraca na ekran startowy)</li>
            <li><kbd>0</kbd> przerwanie bieżącego scenariusza (sukces = 0)</li>
            <li><kbd>T</kbd> natychmiastowe ostrzeżenie o bezczynności (test limitu czasu)</li>
            <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> powrót do tego panelu (zapisuje plik)</li>
          </ul>
          <p>Bez klawiatury scenariusz startuje pierwszym dotknięciem ekranu startowego i kończy się potwierdzeniem zamówienia.</p>
        </section>

        <footer className="adm-foot">
          <label className="adm-check">
            <input type="checkbox" checked={fullscreen} onChange={(e) => setFullscreen(e.target.checked)} />
            Pełny ekran (wymagany do poprawnych współrzędnych)
          </label>
          <button type="submit" className="adm-start" disabled={starting}>
            {starting ? 'Uruchamianie…' : 'Uruchom kiosk'}
          </button>
        </footer>
      </form>
    </div>
  );
}
