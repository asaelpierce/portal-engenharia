// ============================================================================
// PAINEL DO VENDEDOR — "Minha carteira" (link com chave, sem login, sem margem)
// …/?painel=vendedor&k=<chave>. Dados: fn_publico_vendedor (v_comercial_pipeline, 2026).
// Tudo clicável: estágio, situação, mês e cartões viram filtro.
// ============================================================================
import React, { useEffect, useMemo, useState } from 'react';

const NAVY = '#14324F', CINZA = '#7A8592', LINHA = '#E3E7EC';
const SIT = [
  { k: 'em aberto', rot: 'Em aberto', cor: '#2E75B6', dica: 'proposta enviada, aguardando o cliente' },
  { k: 'pedido confirmado', rot: 'Pedido confirmado', cor: '#4E9A3A', dica: 'virou pedido, ainda sem nota' },
  { k: 'faturado', rot: 'Faturado', cor: '#14324F', dica: 'nota fiscal emitida' },
  { k: 'perdido', rot: 'Perdido', cor: '#C62828', dica: 'cliente não fechou' },
];
const EST = [
  { k: 'avancado', rot: 'Avançado', cor: '#1B7F3B' }, { k: 'alto', rot: 'Alto', cor: '#4E9A3A' },
  { k: 'medio', rot: 'Médio', cor: '#E8B007' }, { k: 'baixo', rot: 'Baixo', cor: '#D2621A' }, { k: '-', rot: 'Sem classificação', cor: '#9AA5B1' },
];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const brl = v => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const mil = v => { const a = Math.abs(v || 0); return a >= 1e6 ? `${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi` : a >= 1e3 ? `${Math.round(v / 1e3).toLocaleString('pt-BR')} mil` : Math.round(v || 0).toLocaleString('pt-BR'); };
const dataBR = d => (d ? new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR') : '—');

export default function PainelVendedor({ supabase, chave }) {
  const [d, setD] = useState(null);
  const [erro, setErro] = useState(false);
  const [f, setF] = useState({ sit: null, est: null, mes: null });
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState({ col: 'valor', desc: true });
  const [dica, setDica] = useState(null);
  useEffect(() => { supabase.rpc('fn_publico_vendedor', { p_chave: chave }).then(({ data, error }) => { if (error || !data?.ok) setErro(true); else setD(data); }); }, [supabase, chave]);
  useEffect(() => { if (d) document.title = `Minha carteira · ${d.vendedor}`; }, [d]);
  const alt = (k, v) => setF(x => ({ ...x, [k]: x[k] === v ? null : v }));

  const L = useMemo(() => (d?.linhas || []).map(l => ({ ...l, valor: Number(l.valor) || 0, est: l.situacao === 'perdido' ? 'perdido' : (l.estagio || '-'), mes: String(l.criado_em || '').slice(0, 7) })), [d]);
  const passa = (l, ign = []) => (ign.includes('sit') || !f.sit || l.situacao === f.sit) && (ign.includes('est') || !f.est || (l.situacao === 'em aberto' && l.est === f.est)) && (ign.includes('mes') || !f.mes || l.mes === f.mes);
  const V = useMemo(() => {
    const porSit = Object.fromEntries(SIT.map(s => [s.k, { n: 0, v: 0 }]));
    L.filter(l => passa(l, ['sit'])).forEach(l => { if (porSit[l.situacao]) { porSit[l.situacao].n++; porSit[l.situacao].v += l.valor; } });
    const porEst = Object.fromEntries(EST.map(e => [e.k, { n: 0, v: 0 }]));
    L.filter(l => l.situacao === 'em aberto' && passa(l, ['est', 'sit'])).forEach(l => { const k = porEst[l.est] ? l.est : '-'; porEst[k].n++; porEst[k].v += l.valor; });
    const meses = [...new Set(L.map(l => l.mes))].filter(Boolean).sort();
    const porMes = Object.fromEntries(meses.map(m => [m, Object.fromEntries(SIT.map(s => [s.k, 0]))]));
    L.filter(l => passa(l, ['mes'])).forEach(l => { if (porMes[l.mes]) porMes[l.mes][l.situacao] = (porMes[l.mes][l.situacao] || 0) + l.valor; });
    const atencao = L.filter(l => l.situacao === 'em aberto' && (l.est === '-' || (l.dias || 0) > 90 || (l.proximo_contato && l.proximo_contato < new Date().toISOString().slice(0, 10))));
    return { porSit, porEst, meses, porMes, atencao, sel: L.filter(l => passa(l)) };
  }, [L, f]);  // eslint-disable-line

  const pagina = { minHeight: '100vh', background: '#EEF1F5', fontFamily: '"Segoe UI", Inter, Arial, sans-serif', color: '#1E2A36' };
  if (erro) return <div style={{ ...pagina, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>Link inválido ou expirado.</div>;
  if (!d) return <div style={{ ...pagina, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: CINZA }}>Carregando…</div>;

  const cartao = { background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(20,50,79,.07)', border: `1px solid ${LINHA}` };
  const titulo = t => <h2 style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>{t}</h2>;
  const mostrar = (e, linhas) => setDica({ x: e.clientX, y: e.clientY, linhas });
  const maxEst = Math.max(1, ...EST.map(e => V.porEst[e.k].v));
  const totSit = SIT.reduce((s, x) => s + V.porSit[x.k].v, 0) || 1;
  // rosca
  let ang = -Math.PI / 2; const R = 110, r = 66, C = 130;
  const arco = (a0, a1, rr) => { const g = a1 - a0 > Math.PI ? 1 : 0; const p = (q, a) => [C + q * Math.cos(a), C + q * Math.sin(a)];
    const [x0, y0] = p(rr, a0), [x1, y1] = p(rr, a1), [x2, y2] = p(r, a1), [x3, y3] = p(r, a0);
    return `M${x0},${y0} A${rr},${rr} 0 ${g} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${g} 0 ${x3},${y3} Z`; };
  // barras por mês
  const W = 1100, H = 300, ml = 56, mb = 34, mt = 22;
  const somaMes = V.meses.map(m => SIT.reduce((s, x) => s + V.porMes[m][x.k], 0));
  const topo = Math.max(1, ...somaMes) * 1.12; const y = v => mt + (H - mt - mb) * (1 - v / topo); const lg = (W - ml - 10) / Math.max(1, V.meses.length);
  const b = busca.trim().toLowerCase();
  const tabela = V.sel.filter(l => !b || `${l.br} ${l.cliente}`.toLowerCase().includes(b)).sort((x, z) => {
    const c = ordem.col; const a1 = c === 'valor' || c === 'dias' ? Number(x[c] || 0) : String(x[c] || ''); const a2 = c === 'valor' || c === 'dias' ? Number(z[c] || 0) : String(z[c] || '');
    return (a1 > a2 ? 1 : a1 < a2 ? -1 : 0) * (ordem.desc ? -1 : 1); });
  const th = (rot, col, al = 'left') => <th onClick={() => setOrdem(o => ({ col, desc: o.col === col ? !o.desc : true }))} style={{ textAlign: al, padding: '9px 10px', fontSize: 12, color: '#fff', background: NAVY, cursor: 'pointer', whiteSpace: 'nowrap', position: 'sticky', top: 0 }}>{rot}{ordem.col === col ? (ordem.desc ? ' ▼' : ' ▲') : ''}</th>;
  const td = { padding: '8px 10px', fontSize: 13, borderBottom: '1px solid #EEF1F4', verticalAlign: 'top' };
  const ativos = [f.sit && ['Situação', SIT.find(s => s.k === f.sit)?.rot, 'sit'], f.est && ['Estágio', EST.find(e => e.k === f.est)?.rot, 'est'], f.mes && ['Mês', `${MESES[Number(f.mes.slice(5)) - 1]}/${f.mes.slice(0, 4)}`, 'mes']].filter(Boolean);
  const nome = String(d.vendedor || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={pagina} onMouseMove={e => dica && setDica(x => x && { ...x, x: e.clientX, y: e.clientY })}>
      {dica && <div style={{ position: 'fixed', left: Math.min(dica.x + 14, window.innerWidth - 280), top: dica.y + 14, zIndex: 50, pointerEvents: 'none', background: '#0F2438', color: '#fff', borderRadius: 8, padding: '8px 11px', fontSize: 12.5 }}>
        {dica.linhas.map((t, i) => <div key={i} style={{ fontWeight: i ? 500 : 800 }}>{t}</div>)}</div>}
      <div style={{ background: `linear-gradient(120deg, ${NAVY}, #1F4E79)`, color: '#fff', padding: '18px 26px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: 2.5, fontWeight: 700, color: '#9CC3E6' }}>KALENBORN DO BRASIL · MINHA CARTEIRA</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginTop: 2 }}>{nome}</div>
          <div style={{ fontSize: 13, color: '#C9D8E6', marginTop: 4 }}>Propostas e pedidos de 2026 · atualizado em {new Date(d.gerado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · clique nos gráficos para filtrar</div>
        </div>
      </div>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '18px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ativos.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: CINZA }}>Filtros:</span>
            {ativos.map(([r2, v, k]) => <span key={k} style={{ background: NAVY, color: '#fff', borderRadius: 20, padding: '5px 6px 5px 12px', fontSize: 12.5, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: '#9CC3E6' }}>{r2}:</span><b>{v}</b><button onClick={() => setF(x => ({ ...x, [k]: null }))} style={{ border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', borderRadius: 20, width: 20, height: 20, cursor: 'pointer' }}>✕</button></span>)}
            <button onClick={() => setF({ sit: null, est: null, mes: null })} style={{ border: `1px solid ${NAVY}`, background: '#fff', color: NAVY, borderRadius: 20, padding: '5px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Limpar</button>
          </div>
        )}
        {/* cartões */}
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
          {SIT.map(s => (
            <div key={s.k} onClick={() => alt('sit', s.k)} style={{ ...cartao, cursor: 'pointer', borderTop: `5px solid ${s.cor}`, outline: f.sit === s.k ? `2px solid ${s.cor}` : 'none', opacity: f.sit && f.sit !== s.k ? 0.55 : 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: CINZA }}>{s.rot}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: NAVY, marginTop: 4 }}>R$ {mil(V.porSit[s.k].v)}</div>
              <div style={{ fontSize: 13, color: '#4A5663', marginTop: 2 }}><b>{V.porSit[s.k].n}</b> BR · {s.dica}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))' }}>
          {/* estágio */}
          <div style={cartao}>
            {titulo('Propostas em aberto por estágio')}
            {EST.map(e => { const x = V.porEst[e.k]; const on = f.est === e.k;
              return (
                <div key={e.k} onClick={() => alt('est', e.k)} onMouseEnter={ev => mostrar(ev, [e.rot, brl(x.v), `${x.n} proposta(s)`])} onMouseLeave={() => setDica(null)}
                  style={{ cursor: 'pointer', padding: '8px 6px', borderRadius: 8, background: on ? '#EEF3F8' : 'transparent', opacity: f.est && !on ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}><span>{e.rot}</span><span style={{ color: NAVY }}>{brl(x.v)} <span style={{ color: CINZA, fontWeight: 600 }}>· {x.n}</span></span></div>
                  <div style={{ height: 14, background: '#EEF1F4', borderRadius: 7, marginTop: 5, overflow: 'hidden' }}><div style={{ width: `${x.v / maxEst * 100}%`, minWidth: x.n ? 4 : 0, height: '100%', background: e.cor, borderRadius: 7 }} /></div>
                </div>); })}
            <div style={{ fontSize: 12, color: CINZA, marginTop: 8 }}>Classifique as propostas "sem classificação" no follow-up — é o que alimenta a previsão.</div>
          </div>
          {/* situação */}
          <div style={cartao}>
            {titulo('Para onde foi a carteira (valor)')}
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <svg viewBox="0 0 260 260" style={{ width: '100%', maxWidth: 270 }} onMouseLeave={() => setDica(null)}>
                {SIT.filter(s => V.porSit[s.k].v > 0).map(s => { const a0 = ang, a1 = ang + 2 * Math.PI * V.porSit[s.k].v / totSit; ang = a1; const on = f.sit === s.k; const pct = V.porSit[s.k].v / totSit; const m = (a0 + a1) / 2;
                  return (<g key={s.k} style={{ cursor: 'pointer' }} onClick={() => alt('sit', s.k)} onMouseMove={ev => mostrar(ev, [s.rot, brl(V.porSit[s.k].v), `${Math.round(pct * 100)}% · ${V.porSit[s.k].n} BR`])}>
                    <path d={arco(a0, Math.min(a1, a0 + 2 * Math.PI - 1e-4), on ? R + 8 : R)} fill={s.cor} stroke="#fff" strokeWidth="2" opacity={f.sit && !on ? 0.35 : 1} />
                    {pct > 0.05 && <text x={C + 88 * Math.cos(m)} y={C + 88 * Math.sin(m) + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" pointerEvents="none">{Math.round(pct * 100)}%</text>}</g>); })}
                <text x={C} y={C - 2} textAnchor="middle" fontSize="20" fontWeight="800" fill={NAVY}>R$ {mil(totSit)}</text>
                <text x={C} y={C + 18} textAnchor="middle" fontSize="12" fill={CINZA}>total 2026</text>
              </svg>
              <div style={{ minWidth: 220 }}>
                {SIT.map(s => <div key={s.k} onClick={() => alt('sit', s.k)} style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '7px 8px', borderRadius: 8, cursor: 'pointer', background: f.sit === s.k ? '#EEF3F8' : 'transparent' }}>
                  <span style={{ width: 13, height: 13, borderRadius: 4, background: s.cor }} /><span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{s.rot}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: NAVY }}>{Math.round(V.porSit[s.k].v / totSit * 100)}%</span></div>)}
              </div>
            </div>
          </div>
        </div>
        {/* atenção */}
        {V.atencao.length > 0 && (
          <div style={{ ...cartao, borderLeft: '6px solid #D2621A' }}>
            {titulo(`Precisa de atenção (${V.atencao.length})`)}
            <div style={{ fontSize: 13, color: '#4A5663', marginBottom: 8 }}>Em aberto sem classificação de estágio, há mais de 90 dias ou com o próximo contato vencido.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {V.atencao.sort((a, z) => z.valor - a.valor).slice(0, 24).map(l => (
                <span key={l.br} style={{ background: '#FDF3E7', color: '#8A4B08', borderRadius: 8, padding: '6px 10px', fontSize: 12.5 }}>
                  <b>{l.br}</b> · {l.cliente} · {brl(l.valor)} · {l.est === '-' ? 'sem estágio' : `${l.dias} dias`}</span>))}
            </div>
          </div>
        )}
        {/* tabela */}
        <div style={cartao}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: 0 }}>Meus projetos ({tabela.length})</h2>
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="buscar BR ou cliente" style={{ border: `1px solid ${LINHA}`, borderRadius: 8, padding: '8px 11px', fontSize: 13.5, width: 260 }} />
          </div>
          <div style={{ maxHeight: 560, overflow: 'auto', border: `1px solid ${LINHA}`, borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{th('BR', 'br')}{th('Cliente', 'cliente')}{th('Situação', 'situacao')}{th('Estágio', 'est')}{th('Valor', 'valor', 'right')}{th('Criado em', 'criado_em')}{th('Dias', 'dias', 'right')}{th('Expectativa', 'expectativa')}</tr></thead>
              <tbody>{tabela.map(l => { const s = SIT.find(x => x.k === l.situacao); const e = EST.find(x => x.k === l.est);
                return (<tr key={l.br}>
                  <td style={{ ...td, fontWeight: 800 }}>{l.br}</td><td style={td}>{l.cliente}</td>
                  <td style={td}><span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: s?.cor || CINZA, borderRadius: 5, padding: '2px 8px' }}>{s?.rot || l.situacao}</span></td>
                  <td style={td}>{l.situacao === 'em aberto' ? <span style={{ fontSize: 11.5, fontWeight: 700, color: e?.k === '-' ? '#5B6773' : '#fff', background: e?.cor || '#EEF1F4', borderRadius: 5, padding: '2px 8px' }}>{e?.rot}</span> : '—'}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>{brl(l.valor)}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{dataBR(l.criado_em)}</td><td style={{ ...td, textAlign: 'right' }}>{l.dias ?? '—'}</td>
                  <td style={{ ...td, fontSize: 12, color: '#4A5663' }}>{l.expectativa || '—'}</td></tr>); })}</tbody>
            </table>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: CINZA }}>Valores de proposta/pedido sem impostos, conforme o Sankhya. Projeto de estoque (Kalenborn do Brasil) não entra.</div>
      </div>
    </div>
  );
}
