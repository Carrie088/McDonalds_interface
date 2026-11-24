import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Folder na pliki CSV z rejestrem zdarzeń (jeden plik na uczestnika i wersję)
const EVENTS_DIR = path.resolve(__dirname, 'zdarzenia');

// POST /api/zdarzenia  { nazwa, naglowek, wiersze } → dopisanie wierszy do zdarzenia/<nazwa>.
// Nowy plik dostaje BOM (UTF-8 z BOM, jak w słowniku) i wiersz nagłówka.
function eventLogWriter() {
  const safeName = (nazwa) => {
    const base = path.basename(String(nazwa || 'PUN_zdarzenia.csv')).replace(/[^A-Za-z0-9_.-]/g, '_');
    return base.endsWith('.csv') ? base : `${base}.csv`;
  };

  const handler = (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== '/api/zdarzenia') return next();

    // GET /api/zdarzenia?nazwa=... → czy plik uczestnika już istnieje (panel prowadzącego)
    if (req.method === 'GET') {
      const file = path.join(EVENTS_DIR, safeName(url.searchParams.get('nazwa')));
      const exists = fs.existsSync(file);
      const lines = exists ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).length - 1 : 0;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ istnieje: exists, wiersze: Math.max(lines, 0), folder: path.relative(__dirname, EVENTS_DIR) }));
      return;
    }
    if (req.method !== 'POST') return next();
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const { nazwa, naglowek, wiersze } = JSON.parse(body);
        if (typeof wiersze !== 'string' || typeof naglowek !== 'string') throw new Error('brak danych');
        // Tylko bezpieczne znaki w nazwie pliku, zawsze w folderze zdarzenia/
        const name = safeName(nazwa);
        fs.mkdirSync(EVENTS_DIR, { recursive: true });
        const file = path.join(EVENTS_DIR, name);
        if (!fs.existsSync(file)) fs.writeFileSync(file, `﻿${naglowek}\n`, 'utf8');
        fs.appendFileSync(file, wiersze, 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ plik: path.relative(__dirname, file) }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ blad: String(err.message || err) }));
      }
    });
  };
  return {
    name: 'zapis-zdarzen',
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}

export default defineConfig({
  plugins: [react(), eventLogWriter()],
  server: { port: 5173, open: false },
});
