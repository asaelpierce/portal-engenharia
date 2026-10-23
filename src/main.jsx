import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import PortalEngenharia from './PortalEngenharia.jsx';

// Aviso de versão nova (23/10/2026): o portal fica carregado no navegador; quem deixa a aba aberta continuava
// com a versão antiga depois de uma publicação (ex.: lista do Fluxo Conhecimento -> OP com 3 cards em vez de 18).
// A cada 5 min (e ao voltar para a aba) compara o arquivo principal publicado com o que está rodando; se mudou,
// mostra a faixa "Há uma versão nova do portal — Atualizar agora".
const scriptAtual = () => {
  const s = [...document.querySelectorAll('script[type="module"][src]')].map(x => x.getAttribute('src')).find(x => /\/assets\/index-[^/]+\.js$/.test(x || ''));
  return s || null;
};
function AvisoNovaVersao() {
  const [nova, setNova] = useState(false);
  useEffect(() => {
    const atual = scriptAtual();
    if (!atual) return undefined;   // ambiente de desenvolvimento
    let parado = false;
    const verificar = async () => {
      try {
        const r = await fetch(`/index.html?v=${Date.now()}`, { cache: 'no-store' });
        const html = await r.text();
        const m = html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/);
        if (!parado && m && m[0] !== atual) setNova(true);
      } catch { /* sem rede: tenta de novo depois */ }
    };
    const t = setInterval(verificar, 5 * 60 * 1000);
    const aoVoltar = () => { if (document.visibilityState === 'visible') verificar(); };
    document.addEventListener('visibilitychange', aoVoltar);
    verificar();
    return () => { parado = true; clearInterval(t); document.removeEventListener('visibilitychange', aoVoltar); };
  }, []);
  if (!nova) return null;
  return (
    <div role="status" style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#0F2340', color: '#fff',
      borderRadius: 12, padding: '10px 14px 10px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 12px 32px rgba(0,0,0,.28)',
      fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13.5, maxWidth: 'calc(100vw - 24px)' }}>
      <span><strong>Há uma versão nova do portal.</strong> Atualize para ver as últimas mudanças.</span>
      <button onClick={() => window.location.reload()} style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#fff', color: '#0F2340', cursor: 'pointer', whiteSpace: 'nowrap' }}>Atualizar agora</button>
      <button onClick={() => setNova(false)} aria-label="Depois" style={{ fontFamily: 'inherit', fontSize: 12, padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,.3)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>depois</button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PortalEngenharia />
    <AvisoNovaVersao />
  </React.StrictMode>
);
