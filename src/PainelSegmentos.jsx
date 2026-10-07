// ============================================================================
// PAINEL PÚBLICO — FATURADO POR SEGMENTO (diretoria / Kalenborn Alemanha)
// Abre sem login pelo link …/?painel=segmentos&k=<chave>. Dados: fn_publico_segmentos
// (notas de venda do Sankhya, Net Offer Value = valor da nota − todos os impostos).
// Idioma PT/EN, moeda BRL/EUR/USD (PTAX do Banco Central: média do ano ou cotação atual).
// ============================================================================
import React, { useEffect, useMemo, useState } from 'react';

const SEGS = ['PG1', 'PG2 Pipes', 'PG2 Kalimpact', 'PG2 Outros', 'PG3', 'Serviço'];
const COR = { 'PG1': '#9AA3AD', 'PG2 Pipes': '#2E75B6', 'PG2 Kalimpact': '#C55A11', 'PG2 Outros': '#E8B007', 'PG3': '#5E9E3A', 'Serviço': '#7A3FA0' };
const NAVY = '#14324F';

const TXT = {
  pt: {
    titulo: 'Faturado por segmento', sub: 'Kalenborn do Brasil · notas de venda emitidas',
    base: 'Net Offer Value (valor da nota − todos os impostos)', atual: 'Atualizado em', ate: 'até',
    idioma: 'Idioma', moeda: 'Moeda', cambio: 'Câmbio', mediaAno: 'Média de cada ano', cotAtual: 'Cotação atual',
    mio: 'milhões', total: 'Total', vsAnt: 'vs. ano anterior', ytd: 'YTD',
    tabTitulo: 'Faturado por segmento e ano', tabPct: 'Participação no total',
    g1: 'Comparativo por segmento', g2: 'Composição de cada ano', g3: 'Mix por ano', g4: 'Mês a mês',
    kTit: 'Kalimpact em todos os segmentos', kPG2: 'Kalimpact em PG2', kPG1: 'Kalimpact em PG1', kPG3: 'Kalimpact em projetos PG3', kTot: 'Kalimpact total', kPct: '% do faturado',
    pg3Tit: 'PG3 — projetos', br: 'BR', cliente: 'Cliente', ano: 'Ano', valor: 'Valor',
    todos: 'Todos', comoTit: 'Como os números são calculados',
    como: [
      'Fonte: notas de venda emitidas no ERP Sankhya (somente operações de venda) — o que foi faturado, não pedidos nem carteira.',
      'Valor: Net Offer Value = valor da nota menos todos os impostos (ICMS, IPI, PIS, COFINS…), rateado entre os itens da nota.',
      'PG1 / PG2: classificação do cadastro do produto no Sankhya. PG2 Kalimpact = família Kalimpact; PG2 Pipes = tubulações, curvas e conexões; PG2 Outros = demais itens PG2.',
      'PG3: projetos específicos marcados como PG3 nos relatórios de pedidos (Incoming Orders). Serviço: serviços prestados e aplicados.',
      'Câmbio: PTAX de venda do Banco Central do Brasil (boletim de fechamento) — média do respectivo ano, ou a última cotação para todos os anos.',
    ],
    taxa: 'Taxa usada', carregando: 'Carregando…', invalido: 'Link inválido ou expirado.', semDados: 'Sem dados',
    meses: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
    seg: { 'PG1': 'PG1', 'PG2 Pipes': 'PG2 Pipes', 'PG2 Kalimpact': 'PG2 Kalimpact', 'PG2 Outros': 'PG2 Outros', 'PG3': 'PG3', 'Serviço': 'Serviço' },
    destaque: 'Kalimpact representa {p} do faturado em {a}.',
  },
  en: {
    titulo: 'Invoiced sales by segment', sub: 'Kalenborn do Brasil · issued sales invoices',
    base: 'Net Offer Value (invoice value − all taxes)', atual: 'Updated', ate: 'until',
    idioma: 'Language', moeda: 'Currency', cambio: 'FX rate', mediaAno: 'Yearly average', cotAtual: 'Current rate',
    mio: 'million', total: 'Total', vsAnt: 'vs. previous year', ytd: 'YTD',
    tabTitulo: 'Invoiced sales by segment and year', tabPct: 'Share of total',
    g1: 'Segment comparison', g2: 'Composition per year', g3: 'Mix per year', g4: 'Month by month',
    kTit: 'Kalimpact across all segments', kPG2: 'Kalimpact in PG2', kPG1: 'Kalimpact in PG1', kPG3: 'Kalimpact in PG3 projects', kTot: 'Kalimpact total', kPct: '% of invoiced sales',
    pg3Tit: 'PG3 — projects', br: 'BR', cliente: 'Customer', ano: 'Year', valor: 'Value',
    todos: 'All', comoTit: 'How the figures are calculated',
    como: [
      'Source: sales invoices issued in the Sankhya ERP (sales operations only) — what was invoiced, not orders or backlog.',
      'Value: Net Offer Value = invoice value minus all taxes (ICMS, IPI, PIS, COFINS…), allocated across the invoice items.',
      'PG1 / PG2: product master classification in Sankhya. PG2 Kalimpact = Kalimpact family; PG2 Pipes = pipes, bends and connections; PG2 Others = remaining PG2 items.',
      'PG3: specific projects flagged as PG3 in the Incoming Orders reports. Services: services rendered and applied.',
      'FX: Central Bank of Brazil PTAX selling rate (closing bulletin) — average of each year, or the latest rate for all years.',
    ],
    taxa: 'Rate used', carregando: 'Loading…', invalido: 'Invalid or expired link.', semDados: 'No data',
    meses: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    seg: { 'PG1': 'PG1', 'PG2 Pipes': 'PG2 Pipes', 'PG2 Kalimpact': 'PG2 Kalimpact', 'PG2 Outros': 'PG2 Others', 'PG3': 'PG3', 'Serviço': 'Services' },
    destaque: 'Kalimpact accounts for {p} of invoiced sales in {a}.',
  },
};
const SIMB = { BRL: 'R$', EUR: '€', USD: 'US$' };

// ---------------------------------------------------------------- gráficos SVG
function Barras({ grupos, series, empilhado, rotulos, fmt, altura = 300 }) {
  // grupos = rótulos do eixo X; series = [{ chave, nome, cor, valores[] }]
  const W = 900, H = altura, ml = 46, mr = 10, mt = 14, mb = 34;
  const somas = grupos.map((_, i) => series.reduce((s, x) => s + (x.valores[i] || 0), 0));
  const max = Math.max(1e-9, ...(empilhado ? somas : series.flatMap(s => s.valores)));
  const passo = Math.pow(10, Math.floor(Math.log10(max))); const topo = Math.ceil(max / passo) * passo;
  const y = v => mt + (H - mt - mb) * (1 - v / topo);
  const larG = (W - ml - mr) / grupos.length;
  const linhas = [0, .25, .5, .75, 1].map(f => topo * f);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {linhas.map((v, i) => (
        <g key={i}>
          <line x1={ml} x2={W - mr} y1={y(v)} y2={y(v)} stroke="#E3E7EC" />
          <text x={ml - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#7A8592">{fmt(v, true)}</text>
        </g>
      ))}
      {grupos.map((g, i) => {
        const x0 = ml + i * larG;
        if (empilhado) {
          let acc = 0; const bw = larG * 0.56; const bx = x0 + (larG - bw) / 2;
          return (
            <g key={g}>
              {series.map(s => {
                const v = s.valores[i] || 0; const y1 = y(acc + v), y0 = y(acc); acc += v;
                return (
                  <g key={s.chave}>
                    <rect x={bx} y={y1} width={bw} height={Math.max(0, y0 - y1)} fill={s.cor}><title>{`${s.nome} · ${g}: ${fmt(v)}`}</title></rect>
                    {rotulos && y0 - y1 > 15 && <text x={bx + bw / 2} y={(y0 + y1) / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{fmt(v, true)}</text>}
                  </g>
                );
              })}
              <text x={bx + bw / 2} y={y(somas[i]) - 6} textAnchor="middle" fontSize="13" fontWeight="800" fill={NAVY}>{fmt(somas[i], true)}</text>
              <text x={x0 + larG / 2} y={H - 12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#33404D">{g}</text>
            </g>
          );
        }
        const n = series.length; const pad = larG * 0.12; const bw = (larG - 2 * pad) / n;
        return (
          <g key={g}>
            {series.map((s, k) => {
              const v = s.valores[i] || 0; const bx = x0 + pad + k * bw;
              return (
                <g key={s.chave}>
                  <rect x={bx + 1} y={y(v)} width={Math.max(1, bw - 2)} height={Math.max(0, y(0) - y(v))} fill={s.cor} rx="2"><title>{`${s.nome} · ${g}: ${fmt(v)}`}</title></rect>
                  {rotulos && bw > 22 && v > 0 && <text x={bx + bw / 2} y={y(v) - 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#33404D">{fmt(v, true)}</text>}
                </g>
              );
            })}
            <text x={x0 + larG / 2} y={H - 12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#33404D">{g}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Rosca({ partes, titulo, total, fmt }) {
  const R = 70, r = 42, C = 90; let ang = -Math.PI / 2;
  const soma = partes.reduce((s, p) => s + p.valor, 0) || 1;
  const arco = (a0, a1) => {
    const g = a1 - a0 > Math.PI ? 1 : 0;
    const p = (rad, a) => [C + rad * Math.cos(a), C + rad * Math.sin(a)];
    const [x0, y0] = p(R, a0), [x1, y1] = p(R, a1), [x2, y2] = p(r, a1), [x3, y3] = p(r, a0);
    return `M${x0},${y0} A${R},${R} 0 ${g} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${g} 0 ${x3},${y3} Z`;
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 800, color: NAVY, marginBottom: 4 }}>{titulo}</div>
      <svg viewBox="0 0 180 180" style={{ width: '100%', maxWidth: 210 }}>
        {partes.filter(p => p.valor > 0).map(p => {
          const a0 = ang, a1 = ang + 2 * Math.PI * p.valor / soma; ang = a1;
          const meio = (a0 + a1) / 2; const pct = p.valor / soma;
          return (
            <g key={p.chave}>
              <path d={arco(a0, Math.min(a1, a0 + 2 * Math.PI - 1e-4))} fill={p.cor}><title>{`${p.nome}: ${(pct * 100).toFixed(1)}%`}</title></path>
              {pct >= 0.06 && <text x={C + 56 * Math.cos(meio)} y={C + 56 * Math.sin(meio) + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">{Math.round(pct * 100)}%</text>}
            </g>
          );
        })}
        <text x={C} y={C - 2} textAnchor="middle" fontSize="15" fontWeight="800" fill={NAVY}>{fmt(total, true)}</text>
        <text x={C} y={C + 14} textAnchor="middle" fontSize="9.5" fill="#7A8592">{fmt.unidade}</text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------- tela
export default function PainelSegmentos({ supabase, chave }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [lg, setLg] = useState(() => { try { return localStorage.getItem('painelSeg.lg') || 'pt'; } catch { return 'pt'; } });
  const [moeda, setMoeda] = useState(() => { try { return localStorage.getItem('painelSeg.moeda') || 'BRL'; } catch { return 'BRL'; } });
  const [modo, setModo] = useState('media');   // 'media' | 'atual'
  const [anoMes, setAnoMes] = useState('todos');
  const t = TXT[lg];
  useEffect(() => { try { localStorage.setItem('painelSeg.lg', lg); localStorage.setItem('painelSeg.moeda', moeda); } catch { /* sem storage */ } }, [lg, moeda]);
  useEffect(() => { document.title = `Kalenborn · ${t.titulo}`; }, [t.titulo]);
  useEffect(() => {
    supabase.rpc('fn_publico_segmentos', { p_chave: chave }).then(({ data, error }) => {
      if (error || !data?.ok) setErro(true); else setDados(data);
    });
  }, [supabase, chave]);

  const calc = useMemo(() => {
    if (!dados) return null;
    const anos = [...new Set(dados.mensal.map(r => r[0]))].sort();
    const ultimoAno = anos[anos.length - 1];
    const ultimoMes = Math.max(...dados.mensal.filter(r => r[0] === ultimoAno).map(r => r[1]));
    const taxa = {};   // taxa[ano] = BRL por 1 unidade da moeda
    const cot = (dados.cambio || []).filter(c => c.moeda === moeda);
    const atual = cot.find(c => c.ano === ultimoAno) || cot[cot.length - 1];
    anos.forEach(a => { const c = cot.find(x => x.ano === a); taxa[a] = moeda === 'BRL' ? 1 : (modo === 'atual' ? Number(atual?.ultima) : Number(c?.media)) || null; });
    const conv = (v, a) => (taxa[a] ? v / taxa[a] : 0);
    const porAnoSeg = {}; anos.forEach(a => { porAnoSeg[a] = Object.fromEntries(SEGS.map(s => [s, 0])); });
    const mensal = {};
    dados.mensal.forEach(([a, m, c, v]) => {
      const x = conv(Number(v), a); porAnoSeg[a][c] = (porAnoSeg[a][c] || 0) + x;
      const k = `${a}-${String(m).padStart(2, '0')}`; mensal[k] = mensal[k] || {}; mensal[k][c] = (mensal[k][c] || 0) + x;
    });
    const tot = Object.fromEntries(anos.map(a => [a, SEGS.reduce((s, c) => s + porAnoSeg[a][c], 0)]));
    const kal = Object.fromEntries(anos.map(a => [a, { 'PG2 Kalimpact': 0, 'PG1': 0, 'PG3': 0 }]));
    dados.grupos.forEach(([a, c, g, v]) => { if (String(g).toUpperCase() === 'KALIMPACT' && kal[a] && c in kal[a]) kal[a][c] += conv(Number(v), a); });
    const pg3 = dados.pg3.map(([br, cli, a, v]) => ({ br, cli, a, v: conv(Number(v), a) }));
    return { anos, ultimoAno, ultimoMes, taxa, atual, porAnoSeg, tot, mensal, kal, pg3 };
  }, [dados, moeda, modo]);

  const fmt = useMemo(() => {
    const loc = lg === 'pt' ? 'pt-BR' : 'en-US';
    const f = (v, curto) => curto
      ? (v / 1e6).toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : `${SIMB[moeda]} ${(v / 1e6).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${lg === 'pt' ? 'mi' : 'm'}`;
    f.unidade = `${SIMB[moeda]} ${t.mio}`;
    f.pct = v => (v * 100).toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
    f.num = (v, d = 4) => Number(v).toLocaleString(loc, { minimumFractionDigits: d, maximumFractionDigits: d });
    return f;
  }, [lg, moeda, t.mio]);

  const pagina = { minHeight: '100vh', background: '#F3F5F8', fontFamily: '"Segoe UI", Inter, Arial, sans-serif', color: '#1E2A36' };
  if (erro) return <div style={{ ...pagina, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.invalido}</div>;
  if (!calc) return <div style={{ ...pagina, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#7A8592' }}>{t.carregando}</div>;

  const { anos, ultimoAno, ultimoMes, taxa, atual, porAnoSeg, tot, mensal, kal, pg3 } = calc;
  const rotAno = a => (a === ultimoAno ? `${a} ${t.ytd}` : String(a));
  const series = SEGS.map(s => ({ chave: s, nome: t.seg[s], cor: COR[s], valores: anos.map(a => porAnoSeg[a][s]) }));
  const cartao = { background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(20,50,79,.08)', border: '1px solid #E3E7EC' };
  const tituloSec = { fontSize: 17, fontWeight: 800, color: NAVY, margin: '0 0 12px' };
  const th = { textAlign: 'right', padding: '9px 12px', fontSize: 13, color: '#fff', background: NAVY, fontWeight: 700, whiteSpace: 'nowrap' };
  const td = { textAlign: 'right', padding: '9px 12px', fontSize: 14, borderBottom: '1px solid #EEF1F4', whiteSpace: 'nowrap' };
  const botoes = (atualV, opcoes, set) => (
    <span style={{ display: 'inline-flex', background: 'rgba(255,255,255,.12)', borderRadius: 9, padding: 3 }}>
      {opcoes.map(([v, r]) => (
        <button key={v} onClick={() => set(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 7,
          background: atualV === v ? '#fff' : 'transparent', color: atualV === v ? NAVY : '#DCE6F0' }}>{r}</button>
      ))}
    </span>
  );
  const kalTot = a => kal[a]['PG2 Kalimpact'] + kal[a]['PG1'] + kal[a]['PG3'];
  const anoDestaque = anos.length > 1 ? anos[anos.length - 2] : ultimoAno;
  const chavesMes = Object.keys(mensal).sort().filter(k => anoMes === 'todos' || k.startsWith(anoMes));
  const rotMes = k => { const [a, m] = k.split('-'); return anoMes === 'todos' ? `${t.meses[Number(m) - 1]}/${a.slice(2)}` : t.meses[Number(m) - 1]; };
  const atualizado = dados.atualizado_em ? new Date(dados.atualizado_em).toLocaleString(lg === 'pt' ? 'pt-BR' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div style={pagina}>
      {/* cabeçalho */}
      <div style={{ background: `linear-gradient(120deg, ${NAVY}, #1F4E79)`, color: '#fff', padding: '20px 28px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, fontWeight: 700, color: '#9CC3E6' }}>KALENBORN DO BRASIL</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>{t.titulo} · {anos[0]}–{ultimoAno} {t.ytd}</div>
            <div style={{ fontSize: 13, color: '#C9D8E6', marginTop: 4 }}>{t.base} · {t.ate} {t.meses[ultimoMes - 1]}/{ultimoAno} · {t.atual} {atualizado}</div>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#C9D8E6' }}>{t.idioma} {botoes(lg, [['pt', 'PT'], ['en', 'EN']], setLg)}</span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#C9D8E6' }}>{t.moeda} {botoes(moeda, [['BRL', 'BRL'], ['EUR', 'EUR'], ['USD', 'USD']], setMoeda)}</span>
            {moeda !== 'BRL' && <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#C9D8E6' }}>{t.cambio} {botoes(modo, [['media', t.mediaAno], ['atual', t.cotAtual]], setModo)}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '22px 22px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* cartões por ano */}
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: `repeat(${anos.length}, minmax(0, 1fr))` }}>
          {anos.map((a, i) => {
            const v = tot[a]; const ant = i > 0 ? tot[anos[i - 1]] : null; const d = ant ? v / ant - 1 : null;
            return (
              <div key={a} style={{ ...cartao, borderTop: `4px solid ${a === ultimoAno ? '#C55A11' : NAVY}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7A8592' }}>{rotAno(a)}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginTop: 4 }}>{fmt(v)}</div>
                <div style={{ fontSize: 12.5, marginTop: 4, color: d == null ? '#7A8592' : a === ultimoAno ? '#7A8592' : d >= 0 ? '#2E7D32' : '#C62828', fontWeight: 700 }}>
                  {d == null || a === ultimoAno ? (a === ultimoAno ? `${t.ate} ${t.meses[ultimoMes - 1]}` : '—') : `${d >= 0 ? '▲' : '▼'} ${fmt.pct(Math.abs(d))} ${t.vsAnt}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* tabela */}
        <div style={cartao}>
          <h2 style={tituloSec}>{t.tabTitulo} <span style={{ fontSize: 13, color: '#7A8592', fontWeight: 600 }}>({fmt.unidade})</span></h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ ...th, textAlign: 'left' }} />
                {anos.map(a => <th key={a} style={th}>{rotAno(a)}</th>)}
                {anos.map(a => <th key={`p${a}`} style={{ ...th, background: '#2F5D86' }}>% {rotAno(a)}</th>)}
              </tr></thead>
              <tbody>
                {SEGS.map(s => (
                  <tr key={s}>
                    <td style={{ ...td, textAlign: 'left', fontWeight: 700 }}><span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: COR[s], marginRight: 8 }} />{t.seg[s]}</td>
                    {anos.map(a => <td key={a} style={{ ...td, fontWeight: s === 'PG2 Kalimpact' ? 800 : 400 }}>{fmt(porAnoSeg[a][s], true)}</td>)}
                    {anos.map(a => <td key={`p${a}`} style={{ ...td, color: '#5B6773', background: '#F8FAFC' }}>{fmt.pct(tot[a] ? porAnoSeg[a][s] / tot[a] : 0)}</td>)}
                  </tr>
                ))}
                <tr>
                  <td style={{ ...td, textAlign: 'left', fontWeight: 800, background: '#E8EEF5' }}>Σ {t.total}</td>
                  {anos.map(a => <td key={a} style={{ ...td, fontWeight: 800, background: '#E8EEF5' }}>{fmt(tot[a], true)}</td>)}
                  {anos.map(a => <td key={`p${a}`} style={{ ...td, fontWeight: 800, background: '#E8EEF5' }}>100%</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* gráficos de barras */}
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))' }}>
          <div style={cartao}>
            <h2 style={tituloSec}>{t.g1} <span style={{ fontSize: 13, color: '#7A8592', fontWeight: 600 }}>({fmt.unidade})</span></h2>
            <Barras grupos={anos.map(rotAno)} series={series} fmt={fmt} rotulos />
            <Legenda t={t} />
          </div>
          <div style={cartao}>
            <h2 style={tituloSec}>{t.g2} <span style={{ fontSize: 13, color: '#7A8592', fontWeight: 600 }}>({fmt.unidade})</span></h2>
            <Barras grupos={anos.map(rotAno)} series={series} fmt={fmt} empilhado rotulos />
            <Legenda t={t} />
          </div>
        </div>

        {/* roscas */}
        <div style={cartao}>
          <h2 style={tituloSec}>{t.g3}</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: `repeat(${anos.length}, minmax(0, 1fr))` }}>
            {anos.map(a => <Rosca key={a} titulo={rotAno(a)} total={tot[a]} fmt={fmt}
              partes={SEGS.map(s => ({ chave: s, nome: t.seg[s], cor: COR[s], valor: porAnoSeg[a][s] }))} />)}
          </div>
          <Legenda t={t} />
          {tot[anoDestaque] > 0 && (
            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 15, color: NAVY }}>
              {t.destaque.replace('{p}', fmt.pct(kalTot(anoDestaque) / tot[anoDestaque])).replace('{a}', anoDestaque)}
            </div>
          )}
        </div>

        {/* Kalimpact + PG3 */}
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))' }}>
          <div style={cartao}>
            <h2 style={tituloSec}>{t.kTit} <span style={{ fontSize: 13, color: '#7A8592', fontWeight: 600 }}>({fmt.unidade})</span></h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={{ ...th, textAlign: 'left' }} />{anos.map(a => <th key={a} style={th}>{rotAno(a)}</th>)}</tr></thead>
              <tbody>
                {[['PG2 Kalimpact', t.kPG2], ['PG1', t.kPG1], ['PG3', t.kPG3]].map(([c, r]) => (
                  <tr key={c}><td style={{ ...td, textAlign: 'left' }}>{r}</td>{anos.map(a => <td key={a} style={td}>{fmt(kal[a][c], true)}</td>)}</tr>
                ))}
                <tr><td style={{ ...td, textAlign: 'left', fontWeight: 800, background: '#FBEDE3' }}>{t.kTot}</td>{anos.map(a => <td key={a} style={{ ...td, fontWeight: 800, background: '#FBEDE3' }}>{fmt(kalTot(a), true)}</td>)}</tr>
                <tr><td style={{ ...td, textAlign: 'left', color: '#7A8592' }}>{t.kPct}</td>{anos.map(a => <td key={a} style={{ ...td, color: '#C55A11', fontWeight: 800 }}>{fmt.pct(tot[a] ? kalTot(a) / tot[a] : 0)}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <div style={cartao}>
            <h2 style={tituloSec}>{t.pg3Tit} <span style={{ fontSize: 13, color: '#7A8592', fontWeight: 600 }}>({fmt.unidade})</span></h2>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{[t.br, t.cliente, t.ano, t.valor].map((h, i) => <th key={h} style={{ ...th, textAlign: i < 2 ? 'left' : 'right', position: 'sticky', top: 0 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {!pg3.length && <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: '#7A8592' }}>{t.semDados}</td></tr>}
                  {pg3.map((p, i) => (
                    <tr key={i}>
                      <td style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{p.br}</td>
                      <td style={{ ...td, textAlign: 'left', whiteSpace: 'normal' }}>{p.cli}</td>
                      <td style={td}>{p.a}</td>
                      <td style={td}>{fmt(p.v, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* mensal */}
        <div style={cartao}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ ...tituloSec, margin: 0 }}>{t.g4} <span style={{ fontSize: 13, color: '#7A8592', fontWeight: 600 }}>({fmt.unidade})</span></h2>
            <span style={{ display: 'inline-flex', background: '#EEF2F6', borderRadius: 9, padding: 3 }}>
              {[['todos', t.todos], ...anos.map(a => [String(a), String(a)])].map(([v, r]) => (
                <button key={v} onClick={() => setAnoMes(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 7,
                  background: anoMes === v ? NAVY : 'transparent', color: anoMes === v ? '#fff' : '#33404D' }}>{r}</button>
              ))}
            </span>
          </div>
          <div style={{ marginTop: 10 }}>
            <Barras grupos={chavesMes.map(rotMes)} empilhado rotulos={anoMes !== 'todos'} fmt={fmt} altura={anoMes === 'todos' ? 300 : 280}
              series={SEGS.map(s => ({ chave: s, nome: t.seg[s], cor: COR[s], valores: chavesMes.map(k => mensal[k]?.[s] || 0) }))} />
          </div>
          <Legenda t={t} />
        </div>

        {/* metodologia */}
        <div style={{ ...cartao, background: '#FAFBFC' }}>
          <h2 style={{ ...tituloSec, fontSize: 15 }}>{t.comoTit}</h2>
          {t.como.map((l, i) => <div key={i} style={{ fontSize: 13, color: '#4A5663', margin: '4px 0' }}>• {l}</div>)}
          {moeda !== 'BRL' && (
            <div style={{ fontSize: 13, color: '#4A5663', marginTop: 8 }}>
              <strong>{t.taxa} (BRL / {moeda}):</strong>{' '}
              {anos.map(a => `${a}: ${taxa[a] ? fmt.num(taxa[a]) : '—'}`).join(' · ')}
              {modo === 'atual' && atual?.data_ultima ? ` (PTAX ${new Date(atual.data_ultima + 'T12:00:00').toLocaleDateString(lg === 'pt' ? 'pt-BR' : 'en-GB')})` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Legenda({ t }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
      {SEGS.map(s => (
        <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#33404D', fontWeight: 600 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: COR[s] }} />{t.seg[s]}
        </span>
      ))}
    </div>
  );
}
