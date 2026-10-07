// ============================================================================
// PAINEL PÚBLICO — FATURADO POR SEGMENTO (diretoria / Kalenborn Alemanha) — v2 interativo
// Abre sem login pelo link …/?painel=segmentos&k=<chave>. Dados: fn_publico_segmentos
// (notas de venda do Sankhya, Net Offer Value = valor da nota − todos os impostos), no nível
// de nota × cliente × BR × produto. Tudo é clicável: cada clique vira filtro e a tela inteira
// se recalcula (ano, mês, segmento, cliente, produto, projeto). Idioma PT/EN; moeda BRL/EUR/USD
// pela PTAX do Banco Central (média do ano ou cotação atual).
// ============================================================================
import React, { useEffect, useMemo, useState, useCallback } from 'react';

const SEGS = ['PG1', 'PG2 Pipes', 'PG2 Kalimpact', 'PG2 Outros', 'PG3', 'Serviço'];
const COR = { 'PG1': '#8E99A6', 'PG2 Pipes': '#2E75B6', 'PG2 Kalimpact': '#D2621A', 'PG2 Outros': '#E8B007', 'PG3': '#4E9A3A', 'Serviço': '#7A3FA0' };
const NAVY = '#14324F', AZUL = '#1F4E79', CINZA = '#7A8592', LINHA = '#E3E7EC';
const SIMB = { BRL: 'R$', EUR: '€', USD: 'US$' };
// segmento de mercado do cliente (Sankhya TGFPAR.AD_SEGMENTO)
const MERC = {
  A: ['Cimenteira', 'Cement Plant'], B: ['Termelétrica a carvão', 'Coal Fired Power Plants'], C: ['Construção', 'Construction'],
  D: ['Alimentos', 'Food processing'], E: ['Indústria', 'Industry'], F: ['Metalurgia', 'Metal Plant'], G: ['Mineração', 'Mining'],
  H: ['Outros', 'Other'], I: ['Pelotização', 'Pelletizing'], J: ['Porto', 'Port'], K: ['Refratário', 'Refractory'],
  L: ['Siderurgia', 'Steel Plant'], M: ['Transporte', 'Transport'], N: ['Fertilizantes', 'Fertilizer'],
};

const TXT = {
  pt: {
    titulo: 'Faturado por produto', empresa: 'KALENBORN DO BRASIL', base: 'Net Offer Value (valor da nota − todos os impostos)',
    atual: 'Atualizado em', ate: 'até', idioma: 'Idioma', moeda: 'Moeda', cambio: 'Câmbio', mediaAno: 'Média do ano', cotAtual: 'Cotação atual',
    mi: 'mi', mio: 'milhões', ytd: 'YTD', todos: 'Todos', ano: 'Ano', segmento: 'Produto', pg2todos: 'PG2 (todo)', merc: 'Segmento de mercado', semMerc: 'Sem segmento', gMerc: 'Faturado por segmento de mercado', gMercTab: 'Segmento de mercado × ano',
    filtros: 'Filtros', limpar: 'Limpar filtros', cliente: 'Cliente', produto: 'Item', projeto: 'Projeto (BR)', mes: 'Mês',
    dica: 'Clique em qualquer barra, fatia, linha ou cliente para filtrar. A tela inteira se recalcula.',
    kTotal: 'Faturado', kNotas: 'Notas fiscais', kClientes: 'Clientes', kProjetos: 'Projetos (BR)', kTicket: 'Ticket médio por nota',
    vsAnt: 'vs. mesmo período do ano anterior', semComp: 'sem comparação',
    gAnos: 'Evolução por ano', gMes: 'Mês a mês', gMix: 'Mix por produto', gTab: 'Produto × ano',
    rCli: 'Ranking de clientes', rProd: 'Ranking de itens', rBr: 'Ranking de projetos (BR)', agrupar: 'Agrupar por grupo econômico',
    kal: 'Kalimpact em todas as linhas (PG1, PG2, PG3)', kPG2: 'em PG2', kPG1: 'em PG1', kPG3: 'em projetos PG3', kTot: 'Kalimpact total', kPct: '% do faturado',
    notas: 'Notas fiscais', buscar: 'buscar NF, BR, cliente ou produto', exportar: 'Exportar CSV', nf: 'NF', data: 'Mês', valor: 'Valor',
    segs: 'Produtos', itens: 'Itens da nota', verMais: 'ver mais', verMenos: 'ver menos', semDados: 'Sem dados para esta seleção.',
    empilhado: 'Empilhado', lado: 'Lado a lado', participacao: 'Participação', total: 'Total',
    comoTit: 'Como os números são calculados', taxa: 'Taxa usada', carregando: 'Carregando…', invalido: 'Link inválido ou expirado.',
    como: [
      'Fonte: notas de venda emitidas no ERP Sankhya (somente operações de venda) — o que foi faturado, não pedidos nem carteira.',
      'Valor: Net Offer Value = valor da nota menos todos os impostos (ICMS, IPI, PIS, COFINS…), rateado entre os itens da nota.',
      'PG1 / PG2: classificação do cadastro do produto no Sankhya. PG2 Kalimpact = família Kalimpact; PG2 Pipes = tubulações, curvas e conexões; PG2 Outros = demais itens PG2.',
      'PG3: projetos específicos marcados como PG3 nos relatórios Incoming Orders. Serviço: serviços prestados e aplicados.',
      'Segmento de mercado: classificação do cliente no cadastro do Sankhya (Mineração, Siderurgia, Indústria, Porto, Cimenteira…).',
      'Câmbio: PTAX de venda do Banco Central do Brasil (fechamento) — média do respectivo ano, ou a última cotação para todos os anos.',
    ],
    meses: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
    seg: { 'PG1': 'PG1', 'PG2 Pipes': 'PG2 Pipes', 'PG2 Kalimpact': 'PG2 Kalimpact', 'PG2 Outros': 'PG2 Outros', 'PG3': 'PG3', 'Serviço': 'Serviço' },
  },
  en: {
    titulo: 'Invoiced sales by product', empresa: 'KALENBORN DO BRASIL', base: 'Net Offer Value (invoice value − all taxes)',
    atual: 'Updated', ate: 'until', idioma: 'Language', moeda: 'Currency', cambio: 'FX rate', mediaAno: 'Yearly average', cotAtual: 'Current rate',
    mi: 'm', mio: 'million', ytd: 'YTD', todos: 'All', ano: 'Year', segmento: 'Product', pg2todos: 'PG2 (all)', merc: 'Market segment', semMerc: 'Not classified', gMerc: 'Invoiced sales by market segment', gMercTab: 'Market segment × year',
    filtros: 'Filters', limpar: 'Clear filters', cliente: 'Customer', produto: 'Item', projeto: 'Project (BR)', mes: 'Month',
    dica: 'Click any bar, slice, row or customer to filter. The whole page recalculates.',
    kTotal: 'Invoiced', kNotas: 'Invoices', kClientes: 'Customers', kProjetos: 'Projects (BR)', kTicket: 'Average per invoice',
    vsAnt: 'vs. same period last year', semComp: 'no comparison',
    gAnos: 'Evolution by year', gMes: 'Month by month', gMix: 'Product mix', gTab: 'Product × year',
    rCli: 'Customer ranking', rProd: 'Item ranking', rBr: 'Project ranking (BR)', agrupar: 'Group by corporate group',
    kal: 'Kalimpact across all lines (PG1, PG2, PG3)', kPG2: 'in PG2', kPG1: 'in PG1', kPG3: 'in PG3 projects', kTot: 'Kalimpact total', kPct: '% of invoiced sales',
    notas: 'Invoices', buscar: 'search invoice, BR, customer or product', exportar: 'Export CSV', nf: 'Invoice', data: 'Month', valor: 'Value',
    segs: 'Products', itens: 'Invoice items', verMais: 'show more', verMenos: 'show less', semDados: 'No data for this selection.',
    empilhado: 'Stacked', lado: 'Side by side', participacao: 'Share', total: 'Total',
    comoTit: 'How the figures are calculated', taxa: 'Rate used', carregando: 'Loading…', invalido: 'Invalid or expired link.',
    como: [
      'Source: sales invoices issued in the Sankhya ERP (sales operations only) — what was invoiced, not orders or backlog.',
      'Value: Net Offer Value = invoice value minus all taxes (ICMS, IPI, PIS, COFINS…), allocated across the invoice items.',
      'PG1 / PG2: product master classification in Sankhya. PG2 Kalimpact = Kalimpact family; PG2 Pipes = pipes, bends and connections; PG2 Others = remaining PG2 items.',
      'PG3: specific projects flagged as PG3 in the Incoming Orders reports. Services: services rendered and applied.',
      'Market segment: customer classification in the Sankhya master data (Mining, Steel Plant, Industry, Port, Cement Plant…).',
      'FX: Central Bank of Brazil PTAX selling rate (closing) — average of each year, or the latest rate for all years.',
    ],
    meses: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    seg: { 'PG1': 'PG1', 'PG2 Pipes': 'PG2 Pipes', 'PG2 Kalimpact': 'PG2 Kalimpact', 'PG2 Outros': 'PG2 Others', 'PG3': 'PG3', 'Serviço': 'Services' },
  },
};

// grupo econômico aproximado pelo nome (VALE - CARAJAS → VALE; CVRD → VALE; ARCELORMITTAL…)
function grupoDe(nome) {
  const n = String(nome || '').toUpperCase().replace(/\s+/g, ' ').trim();
  if (/^(VALE\b|CVRD\b|CIA VALE|COMPANHIA VALE)/.test(n)) return 'VALE';
  if (/^ARCEL/.test(n)) return 'ARCELORMITTAL';
  if (/^ANGLO/.test(n)) return 'ANGLO AMERICAN';
  if (/^TERNIUM/.test(n)) return 'TERNIUM';
  if (/^USIMINAS|^USINAS SIDERURGICAS/.test(n)) return 'USIMINAS';
  if (/^SAMARCO/.test(n)) return 'SAMARCO';
  if (/^VOTORANTIM/.test(n)) return 'VOTORANTIM';
  if (/^MOSAIC/.test(n)) return 'MOSAIC';
  if (/^GERDAU/.test(n)) return 'GERDAU';
  if (/^KALENBORN/.test(n)) return 'KALENBORN (GRUPO)';
  return n.split(/ - | – /)[0];
}

// ------------------------------------------------------------------ dica flutuante
function useDica() {
  const [dica, setDica] = useState(null);
  const mostrar = useCallback((e, linhas) => setDica({ x: e.clientX, y: e.clientY, linhas }), []);
  const esconder = useCallback(() => setDica(null), []);
  const el = dica && (
    <div style={{ position: 'fixed', left: Math.min(dica.x + 14, window.innerWidth - 300), top: dica.y + 14, zIndex: 50, pointerEvents: 'none',
      background: '#0F2438', color: '#fff', borderRadius: 8, padding: '8px 11px', fontSize: 12.5, boxShadow: '0 6px 18px rgba(0,0,0,.25)', maxWidth: 290 }}>
      {dica.linhas.map((l, i) => <div key={i} style={{ fontWeight: i === 0 ? 800 : 500, marginTop: i ? 2 : 0 }}>{l}</div>)}
    </div>
  );
  return { mostrar, esconder, el };
}

// ------------------------------------------------------------------ barras (agrupadas ou empilhadas)
function Barras({ grupos, series, empilhado, rotulos, fmt, altura = 360, onClick, selGrupo, selSerie, dica, faixas }) {
  const W = 1200, H = altura, ml = 54, mr = 12, mt = 26, mb = faixas ? 52 : 34;
  const somas = grupos.map((_, i) => series.reduce((s, x) => s + (x.valores[i] || 0), 0));
  const max = Math.max(1e-9, ...(empilhado ? somas : series.flatMap(s => s.valores)));
  const ordem = Math.pow(10, Math.floor(Math.log10(max))); const passo = [1, 2, 2.5, 5, 10].map(k => k * ordem / 4).find(p => max / p <= 5) || ordem;
  const topo = Math.ceil(max / passo) * passo;
  const y = v => mt + (H - mt - mb) * (1 - v / topo);
  const larG = (W - ml - mr) / Math.max(1, grupos.length);
  const marcas = []; for (let v = 0; v <= topo + 1e-9; v += passo) marcas.push(v);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={dica.esconder}>
      {marcas.map((v, i) => (
        <g key={i}><line x1={ml} x2={W - mr} y1={y(v)} y2={y(v)} stroke={LINHA} />
          <text x={ml - 8} y={y(v) + 4} textAnchor="end" fontSize="12" fill={CINZA}>{fmt.curto(v)}</text></g>
      ))}
      {faixas && faixas.map((f, i) => (
        <g key={i}>
          {i > 0 && <line x1={ml + f.ini * larG} x2={ml + f.ini * larG} y1={mt - 10} y2={H - 8} stroke="#C9D2DC" strokeDasharray="4 4" />}
          <text x={ml + (f.ini + f.fim + 1) / 2 * larG} y={H - 10} textAnchor="middle" fontSize="14" fontWeight="800" fill={NAVY}>{f.rot}</text>
        </g>
      ))}
      {grupos.map((g, i) => {
        const x0 = ml + i * larG; const apagado = selGrupo != null && selGrupo !== i;
        if (empilhado) {
          let acc = 0; const bw = larG * (grupos.length > 24 ? 0.72 : 0.58); const bx = x0 + (larG - bw) / 2;
          return (
            <g key={i} opacity={apagado ? 0.35 : 1}>
              {series.map(s => {
                const v = s.valores[i] || 0; if (v <= 0) return null;
                const y1 = y(acc + v), y0 = y(acc); acc += v;
                const fraco = selSerie && selSerie !== s.chave;
                return (
                  <g key={s.chave} style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={() => onClick && onClick(i, s.chave)}
                    onMouseMove={e => dica.mostrar(e, [`${s.nome} · ${g}`, fmt.longo(v), `${fmt.pct(somas[i] ? v / somas[i] : 0)} ${'·'} ${fmt.longo(somas[i])}`])}>
                    <rect x={bx} y={y1} width={bw} height={Math.max(0, y0 - y1)} fill={s.cor} opacity={fraco ? 0.3 : 1} />
                    {rotulos && y0 - y1 > 16 && bw > 34 && <text x={bx + bw / 2} y={(y0 + y1) / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" pointerEvents="none">{fmt.curto(v)}</text>}
                  </g>
                );
              })}
              {(rotulos || grupos.length <= 24) && somas[i] > 0 && <text x={bx + bw / 2} y={y(somas[i]) - 7} textAnchor="middle" fontSize={grupos.length > 24 ? 10 : 14} fontWeight="800" fill={NAVY}>{fmt.curto(somas[i])}</text>}
              <text x={x0 + larG / 2} y={H - (faixas ? 32 : 12)} textAnchor="middle" fontSize={grupos.length > 24 ? 10.5 : 13.5} fontWeight="700" fill="#33404D">{g}</text>
            </g>
          );
        }
        const n = series.length; const pad = larG * 0.1; const bw = (larG - 2 * pad) / n;
        return (
          <g key={i} opacity={apagado ? 0.35 : 1}>
            {series.map((s, k) => {
              const v = s.valores[i] || 0; const bx = x0 + pad + k * bw; const fraco = selSerie && selSerie !== s.chave;
              return (
                <g key={s.chave} style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={() => onClick && onClick(i, s.chave)}
                  onMouseMove={e => dica.mostrar(e, [`${s.nome} · ${g}`, fmt.longo(v), `${fmt.pct(somas[i] ? v / somas[i] : 0)}`])}>
                  <rect x={bx + 2} y={y(v)} width={Math.max(1, bw - 4)} height={Math.max(0, y(0) - y(v))} fill={s.cor} rx="3" opacity={fraco ? 0.3 : 1} />
                  {rotulos && bw > 26 && v > 0 && <text x={bx + bw / 2} y={y(v) - 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#33404D" pointerEvents="none">{fmt.curto(v)}</text>}
                </g>
              );
            })}
            <text x={x0 + larG / 2} y={H - 12} textAnchor="middle" fontSize="14" fontWeight="800" fill="#33404D">{g}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ------------------------------------------------------------------ rosca grande com legenda clicável
function Rosca({ partes, total, fmt, onClick, sel, dica, t }) {
  const R = 130, r = 78, C = 150; let ang = -Math.PI / 2;
  const soma = partes.reduce((s, p) => s + p.valor, 0) || 1;
  const arco = (a0, a1, rr = R) => {
    const g = a1 - a0 > Math.PI ? 1 : 0; const p = (rad, a) => [C + rad * Math.cos(a), C + rad * Math.sin(a)];
    const [x0, y0] = p(rr, a0), [x1, y1] = p(rr, a1), [x2, y2] = p(r, a1), [x3, y3] = p(r, a0);
    return `M${x0},${y0} A${rr},${rr} 0 ${g} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${g} 0 ${x3},${y3} Z`;
  };
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg viewBox="0 0 300 300" style={{ width: '100%', maxWidth: 330 }} onMouseLeave={dica.esconder}>
        {partes.filter(p => p.valor > 0).map(p => {
          const a0 = ang, a1 = ang + 2 * Math.PI * p.valor / soma; ang = a1; const meio = (a0 + a1) / 2; const pct = p.valor / soma;
          const ativo = sel === p.chave; const fraco = sel && !ativo;
          return (
            <g key={p.chave} style={{ cursor: 'pointer' }} onClick={() => onClick(p.chave)} onMouseMove={e => dica.mostrar(e, [p.nome, fmt.longo(p.valor), fmt.pct(pct)])}>
              <path d={arco(a0, Math.min(a1, a0 + 2 * Math.PI - 1e-4), ativo ? R + 10 : R)} fill={p.cor} opacity={fraco ? 0.3 : 1} stroke="#fff" strokeWidth="2" />
              {pct >= 0.045 && <text x={C + 104 * Math.cos(meio)} y={C + 104 * Math.sin(meio) + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" pointerEvents="none">{Math.round(pct * 100)}%</text>}
            </g>
          );
        })}
        <text x={C} y={C - 4} textAnchor="middle" fontSize="26" fontWeight="800" fill={NAVY}>{fmt.curto(total)}</text>
        <text x={C} y={C + 20} textAnchor="middle" fontSize="13" fill={CINZA}>{fmt.unidade}</text>
      </svg>
      <div style={{ minWidth: 260, flex: '0 1 340px' }}>
        {partes.map(p => (
          <div key={p.chave} onClick={() => onClick(p.chave)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
            background: sel === p.chave ? '#EEF3F8' : 'transparent', opacity: sel && sel !== p.chave ? 0.5 : 1 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: p.cor, flex: 'none' }} />
            <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{p.nome}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{fmt.curto(p.valor)}</span>
            <span style={{ fontSize: 13, color: CINZA, width: 54, textAlign: 'right' }}>{fmt.pct(p.valor / soma)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, padding: '8px 10px', borderTop: `1px solid ${LINHA}`, marginTop: 4, fontWeight: 800 }}>
          <span style={{ flex: 1 }}>{t.total}</span><span style={{ color: NAVY }}>{fmt.curto(total)}</span><span style={{ width: 54, textAlign: 'right' }}>100%</span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ ranking em barras horizontais
function Ranking({ itens, fmt, onClick, sel, t, cor = AZUL, inicial = 12, extra }) {
  const [todos, setTodos] = useState(false);
  const max = Math.max(1e-9, ...itens.map(i => i.v)); const soma = itens.reduce((s, i) => s + i.v, 0) || 1;
  const vis = todos ? itens : itens.slice(0, inicial);
  if (!itens.length) return <div style={{ color: CINZA, fontSize: 13, padding: 12 }}>{t.semDados}</div>;
  return (
    <div>
      {vis.map((it, k) => (
        <div key={it.k} onClick={() => onClick(it.k)} title={it.rot} style={{ cursor: 'pointer', padding: '6px 6px', borderRadius: 7,
          background: sel === it.k ? '#EEF3F8' : 'transparent', opacity: sel != null && sel !== it.k ? 0.55 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span style={{ color: CINZA, fontWeight: 600, marginRight: 6 }}>{k + 1}.</span>{it.rot}</span>
            <span style={{ whiteSpace: 'nowrap', fontWeight: 800, color: NAVY }}>{fmt.curto(it.v)} <span style={{ color: CINZA, fontWeight: 600 }}>· {fmt.pct(it.v / soma)}</span></span>
          </div>
          <div style={{ height: 7, background: '#EEF1F4', borderRadius: 4, marginTop: 4, overflow: 'hidden', display: 'flex' }}>
            {it.partes ? SEGS.map(s => it.partes[s] ? <div key={s} style={{ width: `${it.partes[s] / max * 100}%`, background: COR[s] }} /> : null)
              : <div style={{ width: `${it.v / max * 100}%`, background: cor }} />}
          </div>
          {extra && <div style={{ fontSize: 11.5, color: CINZA, marginTop: 2 }}>{extra(it)}</div>}
        </div>
      ))}
      {itens.length > inicial && (
        <button onClick={() => setTodos(x => !x)} style={{ marginTop: 6, border: 'none', background: 'none', color: AZUL, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
          {todos ? t.verMenos : `${t.verMais} (${itens.length - inicial})`}
        </button>
      )}
    </div>
  );
}

// ================================================================== tela
export default function PainelSegmentos({ supabase, chave }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const ler = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
  const [lg, setLg] = useState(() => ler('painelSeg.lg', 'pt'));
  const [moeda, setMoeda] = useState(() => ler('painelSeg.moeda', 'BRL'));
  const [modo, setModo] = useState('media');
  const [f, setF] = useState({ ano: null, mes: null, seg: null, cli: null, prod: null, br: null, merc: null });
  const [agrupar, setAgrupar] = useState(false);
  const [empilhado, setEmpilhado] = useState(true);
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState({ col: 'v', desc: true });
  const [abertaNF, setAbertaNF] = useState(null);
  const dica = useDica();
  const t = TXT[lg];
  useEffect(() => { try { localStorage.setItem('painelSeg.lg', lg); localStorage.setItem('painelSeg.moeda', moeda); } catch { /* */ } }, [lg, moeda]);
  useEffect(() => { document.title = `Kalenborn · ${t.titulo}`; }, [t.titulo]);
  useEffect(() => {
    supabase.rpc('fn_publico_segmentos', { p_chave: chave }).then(({ data, error }) => { if (error || !data?.ok) setErro(true); else setDados(data); });
  }, [supabase, chave]);
  const alt = (campo, v) => setF(x => ({ ...x, [campo]: x[campo] === v ? null : v }));

  // linhas convertidas na moeda escolhida
  const base = useMemo(() => {
    if (!dados) return null;
    const anos = [...new Set(dados.linhas.map(l => l[0]))].sort();
    const ultimoAno = anos[anos.length - 1];
    const ultimoMes = Math.max(...dados.linhas.filter(l => l[0] === ultimoAno).map(l => l[1]));
    const cot = (dados.cambio || []).filter(c => c.moeda === moeda);
    const atual = cot.find(c => c.ano === ultimoAno) || cot[cot.length - 1];
    const taxa = {}; anos.forEach(a => { const c = cot.find(x => x.ano === a); taxa[a] = moeda === 'BRL' ? 1 : (modo === 'atual' ? Number(atual?.ultima) : Number(c?.media)) || null; });
    const linhas = dados.linhas.map(([a, m, s, c, br, p, nf, v]) => ({ a, m, s, c, br, p, nf, v: taxa[a] ? Number(v) / taxa[a] : 0, chM: `${a}-${String(m).padStart(2, '0')}` }));
    return { anos, ultimoAno, ultimoMes, taxa, atual, linhas };
  }, [dados, moeda, modo]);

  const fmt = useMemo(() => {
    const loc = lg === 'pt' ? 'pt-BR' : 'en-US';
    const n = (v, d) => v.toLocaleString(loc, { minimumFractionDigits: d, maximumFractionDigits: d });
    const curto = v => { const a = Math.abs(v); return a >= 1e6 ? n(v / 1e6, a >= 1e8 ? 0 : 1) : a >= 1e3 ? `${n(v / 1e3, 0)}k` : n(v, 0); };
    return {
      curto: v => (Math.abs(v) >= 1e6 ? curto(v) : curto(v)),
      longo: v => `${SIMB[moeda]} ${n(v, 0)}`,
      mi: v => `${SIMB[moeda]} ${n(v / 1e6, 2)} ${t.mi}`,
      pct: v => `${n((v || 0) * 100, 1)}%`,
      num: (v, d = 4) => n(Number(v), d),
      unidade: `${SIMB[moeda]} ${t.mio}`,
    };
  }, [lg, moeda, t.mi, t.mio]);

  const nomeCli = useCallback(i => (dados ? (Array.isArray(dados.clientes[i]) ? dados.clientes[i][0] : dados.clientes[i]) : ''), [dados]);
  const mercCli = useCallback(i => (dados && Array.isArray(dados.clientes[i]) ? dados.clientes[i][1] || '?' : '?'), [dados]);
  const rotMerc = useCallback(c => (c && MERC[c] ? MERC[c][lg === 'pt' ? 0 : 1] : TXT[lg].semMerc), [lg]);
  const chaveCli = useCallback(l => (agrupar ? grupoDe(nomeCli(l.c)) : String(l.c)), [agrupar, nomeCli]);
  const passa = useCallback((l, ignora = []) => {
    if (!ignora.includes('ano') && f.ano != null && l.a !== f.ano) return false;
    if (!ignora.includes('mes') && f.mes != null && l.chM !== f.mes) return false;
    if (!ignora.includes('seg') && f.seg != null && (f.seg === 'PG2*' ? !l.s.startsWith('PG2') : l.s !== f.seg)) return false;
    if (!ignora.includes('cli') && f.cli != null && chaveCli(l) !== f.cli) return false;
    if (!ignora.includes('prod') && f.prod != null && l.p !== f.prod) return false;
    if (!ignora.includes('br') && f.br != null && l.br !== f.br) return false;
    if (!ignora.includes('merc') && f.merc != null && mercCli(l.c) !== f.merc) return false;
    return true;
  }, [f, chaveCli, mercCli]);

  const V = useMemo(() => {
    if (!base) return null;
    const { anos, linhas, ultimoAno, ultimoMes } = base;
    const soma = (ls) => ls.reduce((s, l) => s + l.v, 0);
    const sel = linhas.filter(l => passa(l));
    // KPIs + comparação com o mesmo período do ano anterior
    const total = soma(sel);
    const nfs = new Set(sel.map(l => `${l.a}-${l.nf}`)); const clis = new Set(sel.map(chaveCli)); const brs = new Set(sel.filter(l => l.br).map(l => l.br));
    let comp = null;
    if (f.ano != null && anos.includes(f.ano - 1)) {
      const limite = f.ano === ultimoAno ? ultimoMes : 12;
      comp = soma(linhas.filter(l => l.a === f.ano - 1 && l.m <= limite && passa({ ...l, a: f.ano, chM: `${f.ano}-${String(l.m).padStart(2, '0')}` })));
    }
    // por ano × segmento (ignora o filtro de ano e de segmento)
    const ls1 = linhas.filter(l => passa(l, ['ano', 'seg', 'mes']));
    const anoSeg = Object.fromEntries(anos.map(a => [a, Object.fromEntries(SEGS.map(s => [s, 0]))]));
    ls1.forEach(l => { anoSeg[l.a][l.s] += l.v; });
    // mês a mês (ignora o filtro de mês; mostra o ano escolhido ou todos)
    const ls2 = linhas.filter(l => passa(l, ['mes', 'seg']));
    const mesesK = [...new Set(linhas.filter(l => f.ano == null || l.a === f.ano).map(l => l.chM))].sort();
    const mesSeg = Object.fromEntries(mesesK.map(k => [k, Object.fromEntries(SEGS.map(s => [s, 0]))]));
    ls2.forEach(l => { if (mesSeg[l.chM]) mesSeg[l.chM][l.s] += l.v; });
    // mix (ignora segmento)
    const mix = Object.fromEntries(SEGS.map(s => [s, 0]));
    linhas.filter(l => passa(l, ['seg'])).forEach(l => { mix[l.s] += l.v; });
    // rankings
    const rank = (ignora, chaveF, rotF) => {
      const m = new Map();
      linhas.filter(l => passa(l, ignora)).forEach(l => {
        const k = chaveF(l); const it = m.get(k) || { k, rot: rotF(l), v: 0, partes: {}, nfs: new Set(), anos: new Set() };
        it.v += l.v; it.partes[l.s] = (it.partes[l.s] || 0) + l.v; it.nfs.add(`${l.a}-${l.nf}`); it.anos.add(l.a); m.set(k, it);
      });
      return [...m.values()].filter(i => Math.abs(i.v) > 0.5).sort((a, b) => b.v - a.v);
    };
    const rCli = rank(['cli'], chaveCli, l => (agrupar ? grupoDe(nomeCli(l.c)) : nomeCli(l.c)));
    const rProd = rank(['prod'], l => l.p, l => { const p = dados.produtos[l.p]; return `${p[0]} · ${p[1]}`; });
    const rBr = rank(['br'], l => l.br, l => `${l.br || '—'} · ${nomeCli(l.c)}`).filter(i => i.k);
    const rMerc = rank(['merc'], l => mercCli(l.c), l => rotMerc(mercCli(l.c)));
    const mercAno = {}; linhas.filter(l => passa(l, ['merc', 'ano', 'mes'])).forEach(l => { const k = mercCli(l.c); mercAno[k] = mercAno[k] || {}; mercAno[k][l.a] = (mercAno[k][l.a] || 0) + l.v; });
    // Kalimpact em todos os segmentos (ignora segmento)
    const kal = Object.fromEntries(anos.map(a => [a, { 'PG2 Kalimpact': 0, 'PG1': 0, 'PG3': 0, outros: 0, tot: 0 }]));
    linhas.filter(l => passa(l, ['ano', 'seg', 'mes'])).forEach(l => {
      kal[l.a].tot += l.v;
      if (String(dados.produtos[l.p][2]).toUpperCase() === 'KALIMPACT') { if (l.s in kal[l.a]) kal[l.a][l.s] += l.v; else kal[l.a].outros += l.v; }
    });
    // notas fiscais
    const mNF = new Map();
    sel.forEach(l => {
      const k = `${l.a}-${l.nf}`; const it = mNF.get(k) || { k, nf: l.nf, a: l.a, m: l.m, chM: l.chM, cli: nomeCli(l.c), brs: new Set(), segs: {}, itens: [], v: 0 };
      it.v += l.v; if (l.br) it.brs.add(l.br); it.segs[l.s] = (it.segs[l.s] || 0) + l.v; it.itens.push(l); mNF.set(k, it);
    });
    return { total, nNF: nfs.size, nCli: clis.size, nBr: brs.size, comp, anoSeg, mesesK, mesSeg, mix, rCli, rProd, rBr, rMerc, mercAno, kal, nfs: [...mNF.values()] };
  }, [base, passa, f, chaveCli, agrupar, nomeCli, mercCli, rotMerc, dados]);

  const pagina = { minHeight: '100vh', background: '#EEF1F5', fontFamily: '"Segoe UI", Inter, Arial, sans-serif', color: '#1E2A36' };
  if (erro) return <div style={{ ...pagina, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.invalido}</div>;
  if (!V) return <div style={{ ...pagina, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: CINZA }}>{t.carregando}</div>;

  const { anos, ultimoAno, ultimoMes, taxa, atual } = base;
  const rotAno = a => (a === ultimoAno ? `${a} ${t.ytd}` : String(a));
  const rotMes = k => { const [a, m] = k.split('-'); return `${t.meses[Number(m) - 1]}${f.ano == null ? '' : ''}/${a.slice(2)}`; };
  const cartao = { background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 3px rgba(20,50,79,.07)', border: `1px solid ${LINHA}` };
  const titulo = (tx, extra) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: 0 }}>{tx} <span style={{ fontSize: 13, color: CINZA, fontWeight: 600 }}>({fmt.unidade})</span></h2>
      {extra}
    </div>
  );
  const chips = (atualV, opcoes, set, escuro) => (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', background: escuro ? 'rgba(255,255,255,.12)' : '#EEF2F6', borderRadius: 10, padding: 3, gap: 2 }}>
      {opcoes.map(([v, r, cor]) => {
        const on = atualV === v;
        return (
          <button key={String(v)} onClick={() => set(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '7px 13px', borderRadius: 8,
            background: on ? (escuro ? '#fff' : (cor || NAVY)) : 'transparent', color: on ? (escuro ? NAVY : '#fff') : (escuro ? '#DCE6F0' : '#33404D'),
            display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {cor && !on && <span style={{ width: 9, height: 9, borderRadius: 3, background: cor }} />}{r}
          </button>
        );
      })}
    </span>
  );
  const ativos = [
    f.ano != null && [t.ano, rotAno(f.ano), 'ano'],
    f.mes != null && [t.mes, rotMes(f.mes), 'mes'],
    f.seg != null && [t.segmento, f.seg === 'PG2*' ? t.pg2todos : t.seg[f.seg], 'seg'],
    f.cli != null && [t.cliente, agrupar ? f.cli : nomeCli(Number(f.cli)), 'cli'],
    f.prod != null && [t.produto, `${dados.produtos[f.prod][0]} · ${String(dados.produtos[f.prod][1]).slice(0, 48)}`, 'prod'],
    f.br != null && [t.projeto, f.br, 'br'],
    f.merc != null && [t.merc, rotMerc(f.merc), 'merc'],
  ].filter(Boolean);
  const series = SEGS.map(s => ({ chave: s, nome: t.seg[s], cor: COR[s], valores: anos.map(a => V.anoSeg[a][s]) }));
  const anoIdx = f.ano != null ? anos.indexOf(f.ano) : null;
  const segSel = f.seg && f.seg !== 'PG2*' ? f.seg : null;
  // mês a mês: faixas por ano quando "todos"
  const faixas = f.ano == null ? anos.map(a => { const idx = V.mesesK.map((k, i) => (k.startsWith(String(a)) ? i : -1)).filter(i => i >= 0); return { rot: rotAno(a), ini: idx[0], fim: idx[idx.length - 1] }; }).filter(x => x.ini != null) : null;
  const gruposMes = V.mesesK.map(k => { const [, m] = k.split('-'); return f.ano == null ? t.meses[Number(m) - 1].slice(0, 1).toUpperCase() : t.meses[Number(m) - 1]; });
  const atualizado = dados.atualizado_em ? new Date(dados.atualizado_em).toLocaleString(lg === 'pt' ? 'pt-BR' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  // notas: busca + ordenação
  const b = busca.trim().toLowerCase();
  const nfsF = V.nfs.filter(n => !b || String(n.nf).includes(b) || n.cli.toLowerCase().includes(b) || [...n.brs].some(x => x.toLowerCase().includes(b))
    || n.itens.some(i => String(dados.produtos[i.p][1]).toLowerCase().includes(b)));
  const nfsO = [...nfsF].sort((x, y) => {
    const c = ordem.col; const va = c === 'data' ? x.chM + String(x.nf).padStart(8, '0') : c === 'cli' ? x.cli : c === 'nf' ? x.nf : x.v;
    const vb = c === 'data' ? y.chM + String(y.nf).padStart(8, '0') : c === 'cli' ? y.cli : c === 'nf' ? y.nf : y.v;
    return (va > vb ? 1 : va < vb ? -1 : 0) * (ordem.desc ? -1 : 1);
  });
  const exportar = () => {
    const sep = ';'; const dec = v => String(Math.round(v * 100) / 100).replace('.', lg === 'pt' ? ',' : '.');
    const lin = [[t.data, t.nf, t.projeto, t.cliente, t.merc, t.segmento, t.produto, `${t.valor} (${moeda})`].join(sep)];
    nfsO.forEach(n => n.itens.forEach(i => lin.push([n.chM, n.nf, i.br, `"${n.cli}"`, rotMerc(mercCli(i.c)), t.seg[i.s], `"${dados.produtos[i.p][0]} ${String(dados.produtos[i.p][1]).replace(/"/g, "'")}"`, dec(i.v)].join(sep))));
    const blob = new Blob(['\ufeff' + lin.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `kalenborn_faturado_${moeda}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };
  const th = (rot, col, alinhar = 'left') => (
    <th onClick={col ? () => setOrdem(o => ({ col, desc: o.col === col ? !o.desc : col === 'v' })) : undefined}
      style={{ textAlign: alinhar, padding: '10px 12px', fontSize: 12.5, color: '#fff', background: NAVY, fontWeight: 700, whiteSpace: 'nowrap', position: 'sticky', top: 0, cursor: col ? 'pointer' : 'default' }}>
      {rot}{ordem.col === col ? (ordem.desc ? ' ▼' : ' ▲') : ''}
    </th>
  );
  const td = { padding: '9px 12px', fontSize: 13.5, borderBottom: '1px solid #EEF1F4', verticalAlign: 'top' };
  const delta = V.comp ? V.total / V.comp - 1 : null;

  return (
    <div style={pagina}>
      {dica.el}
      {/* ---------------- cabeçalho ---------------- */}
      <div style={{ background: `linear-gradient(120deg, ${NAVY}, ${AZUL})`, color: '#fff', padding: '18px 28px' }}>
        <div style={{ maxWidth: 1680, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2.5, fontWeight: 700, color: '#9CC3E6' }}>{t.empresa}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>{t.titulo} · {anos[0]}–{ultimoAno} {t.ytd}</div>
            <div style={{ fontSize: 13, color: '#C9D8E6', marginTop: 4 }}>{t.base} · {t.ate} {t.meses[ultimoMes - 1]}/{ultimoAno} · {t.atual} {atualizado}</div>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#C9D8E6' }}>{t.idioma} {chips(lg, [['pt', 'PT'], ['en', 'EN']], setLg, true)}</span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#C9D8E6' }}>{t.moeda} {chips(moeda, [['BRL', 'BRL'], ['EUR', 'EUR'], ['USD', 'USD']], setMoeda, true)}</span>
            {moeda !== 'BRL' && <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#C9D8E6' }}>{t.cambio} {chips(modo, [['media', t.mediaAno], ['atual', t.cotAtual]], setModo, true)}</span>}
          </div>
        </div>
      </div>

      {/* ---------------- barra de filtros (fixa) ---------------- */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(238,241,245,.96)', backdropFilter: 'blur(6px)', borderBottom: `1px solid ${LINHA}` }}>
        <div style={{ maxWidth: 1680, margin: '0 auto', padding: '10px 22px', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: CINZA }}>{t.ano}</span>
          {chips(f.ano, [[null, t.todos], ...anos.map(a => [a, rotAno(a)])], v => setF(x => ({ ...x, ano: v, mes: null })))}
          <span style={{ fontSize: 12, fontWeight: 800, color: CINZA, marginLeft: 6 }}>{t.segmento}</span>
          {chips(f.seg, [[null, t.todos], ...SEGS.slice(0, 1).map(s => [s, t.seg[s], COR[s]]), ['PG2*', t.pg2todos, '#264B6E'], ...SEGS.slice(1).map(s => [s, t.seg[s], COR[s]])], v => setF(x => ({ ...x, seg: v })))}
          <span style={{ fontSize: 12, fontWeight: 800, color: CINZA, marginLeft: 6 }}>{t.merc}</span>
          <select value={f.merc ?? ''} onChange={e => setF(x => ({ ...x, merc: e.target.value === '' ? null : e.target.value }))}
            style={{ border: `1px solid ${LINHA}`, borderRadius: 9, padding: '7px 10px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', color: NAVY, background: '#fff' }}>
            <option value="">{t.todos}</option>
            {V.rMerc.map(m => <option key={m.k} value={m.k}>{m.rot}</option>)}
          </select>
        </div>
        {ativos.length > 0 && (
          <div style={{ maxWidth: 1680, margin: '0 auto', padding: '0 22px 10px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: CINZA }}>{t.filtros}:</span>
            {ativos.map(([r, v, c]) => (
              <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: NAVY, color: '#fff', borderRadius: 20, padding: '5px 6px 5px 12px', fontSize: 12.5 }}>
                <span style={{ color: '#9CC3E6' }}>{r}:</span> <strong>{v}</strong>
                <button onClick={() => setF(x => ({ ...x, [c]: null }))} style={{ border: 'none', background: 'rgba(255,255,255,.18)', color: '#fff', borderRadius: 20, width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>✕</button>
              </span>
            ))}
            <button onClick={() => setF({ ano: null, mes: null, seg: null, cli: null, prod: null, br: null, merc: null })} style={{ border: `1px solid ${NAVY}`, background: '#fff', color: NAVY, borderRadius: 20, padding: '5px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t.limpar}</button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1680, margin: '0 auto', padding: '18px 22px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 13, color: CINZA }}>💡 {t.dica}</div>

        {/* ---------------- KPIs ---------------- */}
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ ...cartao, borderTop: `5px solid ${segSel ? COR[segSel] : '#D2621A'}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: CINZA }}>{t.kTotal}{f.ano != null ? ` · ${rotAno(f.ano)}` : ''}</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: NAVY, marginTop: 4 }}>{fmt.mi(V.total)}</div>
            <div style={{ fontSize: 13, marginTop: 4, fontWeight: 700, color: delta == null ? CINZA : delta >= 0 ? '#2E7D32' : '#C62828' }}>
              {delta == null ? t.semComp : `${delta >= 0 ? '▲' : '▼'} ${fmt.pct(Math.abs(delta))} ${t.vsAnt}`}
            </div>
          </div>
          {[[t.kNotas, V.nNF.toLocaleString()], [t.kClientes, V.nCli.toLocaleString()], [t.kProjetos, V.nBr.toLocaleString()], [t.kTicket, fmt.longo(V.nNF ? V.total / V.nNF : 0)]].map(([r, v]) => (
            <div key={r} style={cartao}>
              <div style={{ fontSize: 13, fontWeight: 700, color: CINZA }}>{r}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: NAVY, marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* ---------------- evolução por ano ---------------- */}
        <div style={cartao}>
          {titulo(t.gAnos, chips(empilhado, [[true, t.empilhado], [false, t.lado]], setEmpilhado))}
          <Barras grupos={anos.map(rotAno)} series={series} empilhado={empilhado} rotulos fmt={fmt} altura={420} dica={dica}
            selGrupo={anoIdx} selSerie={segSel}
            onClick={(i, s) => setF(x => ({ ...x, ano: x.ano === anos[i] && x.seg === s ? null : anos[i], seg: x.ano === anos[i] && x.seg === s ? null : s, mes: null }))} />
          <Legenda t={t} onClick={s => alt('seg', s)} sel={segSel} />
        </div>

        {/* ---------------- mês a mês ---------------- */}
        <div style={cartao}>
          {titulo(`${t.gMes}${f.ano != null ? ` · ${rotAno(f.ano)}` : ''}`, chips(f.ano, [[null, t.todos], ...anos.map(a => [a, String(a)])], v => setF(x => ({ ...x, ano: v, mes: null }))))}
          <Barras grupos={gruposMes} series={SEGS.map(s => ({ chave: s, nome: t.seg[s], cor: COR[s], valores: V.mesesK.map(k => V.mesSeg[k][s]) }))}
            empilhado rotulos={f.ano != null} fmt={fmt} altura={f.ano == null ? 400 : 420} dica={dica} faixas={faixas}
            selGrupo={f.mes ? V.mesesK.indexOf(f.mes) : null} selSerie={segSel}
            onClick={(i, s) => setF(x => ({ ...x, mes: x.mes === V.mesesK[i] ? null : V.mesesK[i], seg: s }))} />
          <Legenda t={t} onClick={s => alt('seg', s)} sel={segSel} />
        </div>

        {/* ---------------- mix + segmento × ano ---------------- */}
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(620px, 1fr))' }}>
          <div style={cartao}>
            {titulo(`${t.gMix}${f.ano != null ? ` · ${rotAno(f.ano)}` : ''}`)}
            <Rosca partes={SEGS.map(s => ({ chave: s, nome: t.seg[s], cor: COR[s], valor: V.mix[s] }))} total={Object.values(V.mix).reduce((a, x) => a + x, 0)}
              fmt={fmt} onClick={s => alt('seg', s)} sel={segSel} dica={dica} t={t} />
          </div>
          <div style={cartao}>
            {titulo(t.gTab)}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{th('', null)}{anos.map(a => <React.Fragment key={a}>{th(rotAno(a), null, 'right')}</React.Fragment>)}{th('Δ', null, 'right')}</tr></thead>
                <tbody>
                  {SEGS.map(s => {
                    const ult = V.anoSeg[anos[anos.length - 2]]?.[s] || 0, pen = V.anoSeg[anos[anos.length - 3]]?.[s] || 0;
                    return (
                      <tr key={s} style={{ opacity: segSel && segSel !== s ? 0.45 : 1 }}>
                        <td onClick={() => alt('seg', s)} style={{ ...td, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: COR[s], marginRight: 8 }} />{t.seg[s]}</td>
                        {anos.map(a => {
                          const v = V.anoSeg[a][s]; const totA = SEGS.reduce((x, k) => x + V.anoSeg[a][k], 0); const on = f.ano === a && f.seg === s;
                          return (
                            <td key={a} onClick={() => setF(x => ({ ...x, ano: on ? null : a, seg: on ? null : s, mes: null }))}
                              style={{ ...td, textAlign: 'right', cursor: 'pointer', background: on ? '#E3ECF5' : 'transparent', fontWeight: on ? 800 : 500 }}>
                              {fmt.curto(v)}<div style={{ fontSize: 11, color: CINZA }}>{fmt.pct(totA ? v / totA : 0)}</div>
                            </td>
                          );
                        })}
                        <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: pen ? (ult >= pen ? '#2E7D32' : '#C62828') : CINZA }}>
                          {pen ? `${ult >= pen ? '▲' : '▼'} ${fmt.pct(Math.abs(ult / pen - 1))}` : '—'}
                          <div style={{ fontSize: 10.5, color: CINZA, fontWeight: 500 }}>{anos[anos.length - 2]} vs {anos[anos.length - 3]}</div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ ...td, fontWeight: 800, background: '#E8EEF5' }}>Σ {t.total}</td>
                    {anos.map(a => <td key={a} style={{ ...td, textAlign: 'right', fontWeight: 800, background: '#E8EEF5' }}>{fmt.curto(SEGS.reduce((x, k) => x + V.anoSeg[a][k], 0))}</td>)}
                    <td style={{ ...td, background: '#E8EEF5' }} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ---------------- rankings ---------------- */}
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))' }}>
          <div style={cartao}>
            {titulo(t.rCli, <label style={{ fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={agrupar} onChange={e => { setAgrupar(e.target.checked); setF(x => ({ ...x, cli: null })); }} /> {t.agrupar}</label>)}
            <Ranking itens={V.rCli} fmt={fmt} t={t} sel={f.cli} onClick={k => alt('cli', k)} inicial={15}
              extra={it => `${agrupar ? '' : rotMerc(mercCli(Number(it.k))) + ' · '}${it.nfs.size} ${t.kNotas.toLowerCase()} · ${[...it.anos].sort().join(', ')}`} />
          </div>
          <div style={cartao}>
            {titulo(t.rProd)}
            <Ranking itens={V.rProd} fmt={fmt} t={t} sel={f.prod} onClick={k => alt('prod', k)} inicial={15}
              extra={it => `${t.seg[Object.keys(it.partes).sort((a, c) => it.partes[c] - it.partes[a])[0]]} · ${dados.produtos[it.k][2]}`} />
          </div>
          <div style={cartao}>
            {titulo(t.rBr)}
            <Ranking itens={V.rBr} fmt={fmt} t={t} sel={f.br} onClick={k => alt('br', k)} inicial={15}
              extra={it => `${Object.keys(it.partes).map(s => t.seg[s]).join(' · ')} · ${it.nfs.size} ${t.kNotas.toLowerCase()}`} />
          </div>
        </div>

        {/* ---------------- segmento de mercado ---------------- */}
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(620px, 1fr))' }}>
          <div style={cartao}>
            {titulo(t.gMerc)}
            <Ranking itens={V.rMerc} fmt={fmt} t={t} sel={f.merc} onClick={k => alt('merc', k)} inicial={14}
              extra={it => `${Object.keys(it.partes).sort((a, c) => it.partes[c] - it.partes[a]).slice(0, 3).map(s => `${t.seg[s]} ${fmt.pct(it.partes[s] / it.v)}`).join(' · ')}`} />
            <Legenda t={t} onClick={s => alt('seg', s)} sel={segSel} />
          </div>
          <div style={cartao}>
            {titulo(t.gMercTab)}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{th('', null)}{anos.map(a => <React.Fragment key={a}>{th(rotAno(a), null, 'right')}</React.Fragment>)}</tr></thead>
                <tbody>
                  {V.rMerc.map(m => (
                    <tr key={m.k} style={{ opacity: f.merc != null && f.merc !== m.k ? 0.45 : 1 }}>
                      <td onClick={() => alt('merc', m.k)} style={{ ...td, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>{m.rot}</td>
                      {anos.map(a => {
                        const v = V.mercAno[m.k]?.[a] || 0; const totA = Object.values(V.mercAno).reduce((x, o) => x + (o[a] || 0), 0); const on = f.ano === a && f.merc === m.k;
                        return (
                          <td key={a} onClick={() => setF(x => ({ ...x, ano: on ? null : a, merc: on ? null : m.k, mes: null }))}
                            style={{ ...td, textAlign: 'right', cursor: 'pointer', background: on ? '#E3ECF5' : 'transparent', fontWeight: on ? 800 : 500 }}>
                            {v ? fmt.curto(v) : '—'}<div style={{ fontSize: 11, color: CINZA }}>{v ? fmt.pct(totA ? v / totA : 0) : ''}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ---------------- Kalimpact em todos os segmentos ---------------- */}
        <div style={cartao}>
          {titulo(t.kal)}
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: `repeat(${anos.length}, minmax(0, 1fr))` }}>
            {anos.map(a => {
              const k = V.kal[a]; const kt = k['PG2 Kalimpact'] + k['PG1'] + k['PG3'] + k.outros; const pct = k.tot ? kt / k.tot : 0;
              return (
                <div key={a} onClick={() => setF(x => ({ ...x, ano: x.ano === a ? null : a, mes: null }))}
                  style={{ border: `2px solid ${f.ano === a ? '#D2621A' : LINHA}`, borderRadius: 14, padding: 16, cursor: 'pointer', background: f.ano === a ? '#FDF3EC' : '#fff' }}>
                  <div style={{ fontWeight: 800, color: CINZA, fontSize: 13 }}>{rotAno(a)}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#D2621A' }}>{fmt.mi(kt)}</div>
                  <div style={{ height: 10, background: '#F3E1D3', borderRadius: 6, margin: '8px 0', overflow: 'hidden' }}><div style={{ width: `${pct * 100}%`, height: '100%', background: '#D2621A' }} /></div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{fmt.pct(pct)} {t.kPct}</div>
                  <div style={{ fontSize: 12.5, color: '#4A5663', marginTop: 6, lineHeight: 1.6 }}>
                    {t.kPG2}: <strong>{fmt.curto(k['PG2 Kalimpact'])}</strong><br />{t.kPG1}: <strong>{fmt.curto(k['PG1'])}</strong><br />{t.kPG3}: <strong>{fmt.curto(k['PG3'])}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- notas fiscais ---------------- */}
        <div style={cartao}>
          {titulo(`${t.notas} (${nfsF.length})`, (
            <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder={t.buscar}
                style={{ border: `1px solid ${LINHA}`, borderRadius: 8, padding: '8px 11px', fontSize: 13.5, width: 300, fontFamily: 'inherit' }} />
              <button onClick={exportar} style={{ border: 'none', background: NAVY, color: '#fff', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>⬇ {t.exportar}</button>
            </span>
          ))}
          <div style={{ maxHeight: 560, overflow: 'auto', border: `1px solid ${LINHA}`, borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{th(t.data, 'data')}{th(t.nf, 'nf')}{th(t.cliente, 'cli')}{th(t.projeto, null)}{th(t.segs, null)}{th(t.valor, 'v', 'right')}</tr></thead>
              <tbody>
                {!nfsO.length && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: CINZA }}>{t.semDados}</td></tr>}
                {nfsO.slice(0, 400).map(n => (
                  <React.Fragment key={n.k}>
                    <tr onClick={() => setAbertaNF(x => (x === n.k ? null : n.k))} style={{ cursor: 'pointer', background: abertaNF === n.k ? '#F2F6FA' : 'transparent' }}>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{rotMes(n.chM)}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{abertaNF === n.k ? '▾' : '▸'} {n.nf}</td>
                      <td style={td}>{n.cli}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{[...n.brs].join(', ') || '—'}</td>
                      <td style={td}>{Object.keys(n.segs).map(s => <span key={s} style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 700, color: '#fff', background: COR[s], borderRadius: 5, padding: '2px 7px', margin: '1px 4px 1px 0' }}>{t.seg[s]}</span>)}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>{fmt.longo(n.v)}</td>
                    </tr>
                    {abertaNF === n.k && (
                      <tr><td colSpan={6} style={{ ...td, background: '#F8FAFC', padding: '10px 16px' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: CINZA, marginBottom: 6 }}>{t.itens}</div>
                        {[...n.itens].sort((x, y) => y.v - x.v).map((i, k) => (
                          <div key={k} style={{ display: 'flex', gap: 10, fontSize: 13, padding: '3px 0' }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: COR[i.s], marginTop: 4, flex: 'none' }} />
                            <span style={{ flex: 1 }}>{dados.produtos[i.p][0]} · {dados.produtos[i.p][1]} <span style={{ color: CINZA }}>({t.seg[i.s]})</span></span>
                            <strong style={{ whiteSpace: 'nowrap' }}>{fmt.longo(i.v)}</strong>
                          </div>
                        ))}
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {nfsO.length > 400 && <div style={{ fontSize: 12, color: CINZA, marginTop: 6 }}>{lg === 'pt' ? `Mostrando 400 de ${nfsO.length} — use os filtros, a busca ou exporte o CSV.` : `Showing 400 of ${nfsO.length} — use filters, search or export CSV.`}</div>}
        </div>

        {/* ---------------- metodologia ---------------- */}
        <div style={{ ...cartao, background: '#FAFBFC' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>{t.comoTit}</h2>
          {t.como.map((l, i) => <div key={i} style={{ fontSize: 13, color: '#4A5663', margin: '4px 0' }}>• {l}</div>)}
          {moeda !== 'BRL' && (
            <div style={{ fontSize: 13, color: '#4A5663', marginTop: 8 }}>
              <strong>{t.taxa} (BRL / {moeda}):</strong> {anos.map(a => `${a}: ${taxa[a] ? fmt.num(taxa[a]) : '—'}`).join(' · ')}
              {modo === 'atual' && atual?.data_ultima ? ` (PTAX ${new Date(atual.data_ultima + 'T12:00:00').toLocaleDateString(lg === 'pt' ? 'pt-BR' : 'en-GB')})` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Legenda({ t, onClick, sel }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
      {SEGS.map(s => (
        <button key={s} onClick={() => onClick(s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#33404D', fontWeight: 700, cursor: 'pointer',
          border: `1px solid ${sel === s ? COR[s] : 'transparent'}`, background: sel === s ? '#F4F7FA' : 'transparent', borderRadius: 8, padding: '5px 9px', fontFamily: 'inherit', opacity: sel && sel !== s ? 0.5 : 1 }}>
          <span style={{ width: 13, height: 13, borderRadius: 3, background: COR[s] }} />{t.seg[s]}
        </button>
      ))}
    </div>
  );
}
