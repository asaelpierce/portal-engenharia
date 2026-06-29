import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  LayoutGrid, FileStack, ClipboardCheck, Gauge, SlidersHorizontal, Workflow,
  Plus, Search, UploadCloud, AlertTriangle, Clock3, Check, X, LogOut,
  ChevronRight, ChevronDown, Building2, CalendarDays, Link2, DownloadCloud,
  Filter, FileWarning, Stamp, ArrowUpRight, ArrowDownRight, Minus, Zap,
  CircleDot, ShieldCheck, MessageSquareWarning, ListFilter, Webhook, Users,
  RefreshCw, TrendingUp, DollarSign, CheckCircle2,
} from 'lucide-react';
import { PROPOSTAS_REAIS } from './propostas_data.js';

/* ============================================================================
   SUPABASE CLIENT — projeto portal-engenharia
============================================================================ */
const SUPABASE_URL = 'https://sieztnpchjjmrwrmrhoa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s_xxUVnOpstaW7p8ngxfXw_OoXDfBXi'; // anon/public key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================================
   DESIGN TOKENS — tema claro
   Paleta ancorada no domínio: cerâmica/refratário industrial.
   Fundo claro neutro + terracota de cerâmica queimada + âmbar-aço + verde-óxido.
============================================================================ */
const T = {
  bg: '#F7F5F1',
  panel: '#FFFFFF',
  panelAlt: '#FBFAF8',
  line: '#E5E1D8',
  lineSoft: '#EFEBE3',
  ink: '#211D17',
  inkDim: '#6B6356',
  inkFaint: '#9B9384',
  terracotta: '#B6502B',
  terracottaSoft: '#F5E4DA',
  terracottaText: '#7A3318',
  amber: '#A9761B',
  amberSoft: '#F6EAD2',
  amberText: '#6B4A0F',
  olive: '#52713E',
  oliveSoft: '#E6EEDD',
  oliveText: '#34481F',
  rust: '#A23A28',
  rustSoft: '#F5DDD6',
  rustText: '#732012',
  blue: '#33618E',
  blueSoft: '#E1EBF3',
  blueText: '#1F4566',
  slate: '#736C5E',
};

const FONT_DISPLAY = "'Barlow Condensed', 'Archivo Narrow', sans-serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

/* ============================================================================
   POOL DE APROVADORES — qualquer um dos três aprova, sem ordem fixa
============================================================================ */
const APROVADORES_POOL = ['João Victor', 'Felipe', 'Edson'];

const USUARIOS = [
  { id: 'u1', nome: 'Sidimar', iniciais: 'SD', papel: 'engenheiro' },
  { id: 'u2', nome: 'Carlos Mendes', iniciais: 'CM', papel: 'revisor_tecnico' },
  { id: 'u3', nome: 'João Victor', iniciais: 'JV', papel: 'analista_aprovador' },
  { id: 'u4', nome: 'Felipe', iniciais: 'FE', papel: 'analista_aprovador' },
  { id: 'u5', nome: 'Edson', iniciais: 'ED', papel: 'analista_aprovador' },
  { id: 'u6', nome: 'Luciene Batista', iniciais: 'LB', papel: 'gestor' },
];

const ESCOPOS_TOP = ['KALIMPACT KALOCER', 'TUBO REVESTIDO - KALOCER', 'TUBO REVESTIDO - ABRESIST', 'EQUIPAMENTO REVESTIDO - KALOCER', 'KALOCER', 'KALFIX'];

const STATUS_META = {
  rascunho: { label: 'Rascunho', color: T.slate, bg: T.lineSoft },
  em_revisao_tecnica: { label: 'Revisão técnica', color: T.amberText, bg: T.amberSoft },
  aguardando_aprovacao: { label: 'Aguardando aprovação', color: T.blueText, bg: T.blueSoft },
  aprovada: { label: 'Aprovada', color: T.oliveText, bg: T.oliveSoft },
  reprovada: { label: 'Reprovada', color: T.rustText, bg: T.rustSoft },
  concluida: { label: 'Concluída', color: '#fff', bg: T.ink },
};

const FLUXO_ORDEM = ['rascunho', 'em_revisao_tecnica', 'aguardando_aprovacao', 'concluida'];

const MESES_ORDEM = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO'];
const MESES_LABEL = { JANEIRO: 'Jan', FEVEREIRO: 'Fev', MARÇO: 'Mar', ABRIL: 'Abr', MAIO: 'Mai', JUNHO: 'Jun' };

/* ============================================================================
   UTILS
============================================================================ */
const calcularAtraso = (prevista, conclusao) => {
  if (!prevista) return 0;
  const dPrev = new Date(prevista);
  const dFim = conclusao ? new Date(conclusao) : new Date('2026-06-26');
  return Math.round((dFim - dPrev) / 86400000);
};

const fmtData = (iso) => !iso ? '—' : new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const fmtMoeda = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
const fmtMoedaCompacta = (v) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(v);

/* ============================================================================
   APP ROOT
============================================================================ */
export default function PortalEngenharia() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const [currentUser, setCurrentUser] = useState(USUARIOS[0]);
  const [view, setView] = useState('dashboard');
  const [propostas, setPropostas] = useState(PROPOSTAS_REAIS);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mesFiltro, setMesFiltro] = useState('JUNHO');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const propostasMes = useMemo(() => propostas.filter(p => p.mes === mesFiltro), [propostas, mesFiltro]);

  const pendencias = useMemo(() => propostas.filter(p => {
    if (currentUser.papel === 'engenheiro') {
      return p.responsavel === currentUser.nome && (p.status === 'rascunho' || p.status === 'reprovada' || p.status === 'aprovada');
    }
    if (currentUser.papel === 'revisor_tecnico') return p.status === 'em_revisao_tecnica';
    if (currentUser.papel === 'analista_aprovador') return p.status === 'aguardando_aprovacao' && APROVADORES_POOL.includes(currentUser.nome);
    return false;
  }), [propostas, currentUser]);

  const stats = useMemo(() => {
    const base = propostasMes;
    const word = base.filter(p => p.origem_dados === 'manual_word');
    const sankhya = base.filter(p => p.origem_dados === 'sankhya');
    const atrasadas = base.filter(p => p.status !== 'concluida' && calcularAtraso(p.data_entrega_prevista, p.data_conclusao) > 0);
    const ativas = base.filter(p => p.status !== 'concluida');
    const valorMes = base.reduce((s, p) => s + (p.valor_liquido || 0), 0);
    return {
      total: base.length, ativas: ativas.length, atrasadas: atrasadas.length,
      percWord: base.length ? Math.round((word.length / base.length) * 100) : 0,
      wordCount: word.length, sankhyaCount: sankhya.length, valorMes,
    };
  }, [propostasMes]);

  const handleAcaoFluxo = (propostaId, acao, comentario = '') => {
    const agora = '2026-06-26';
    setPropostas(prev => prev.map(p => {
      if (p.id !== propostaId) return p;
      let next = { ...p };
      switch (acao) {
        case 'enviar_revisao': next.status = 'em_revisao_tecnica'; break;
        case 'aprovar_revisao': next.status = 'aguardando_aprovacao'; break;
        case 'reprovar_revisao': next.status = 'reprovada'; next.comentario_reprovacao = comentario; break;
        case 'aprovar_final':
          next.status = 'aprovada'; next.aprovador_pool = currentUser.nome; next.data_aprovacao = agora; break;
        case 'reprovar_final': next.status = 'reprovada'; next.comentario_reprovacao = comentario; break;
        case 'concluir': next.status = 'concluida'; next.data_conclusao = agora; break;
        case 'validar_sankhya': next.validado_pelo_engenheiro = true; break;
        default: break;
      }
      setSelected(next);
      return next;
    }));
  };

  return (
    <div style={{ fontFamily: FONT_BODY, background: T.bg, color: T.ink, minHeight: '100vh', display: 'flex' }}>
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: ${T.terracotta}33; }
        button { font-family: inherit; cursor: pointer; }
        input, select, textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 4px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp .35s ease both; }
        .scale-in { animation: scaleIn .2s ease both; }
        .spin { animation: spin 1s linear infinite; }
        .focus-ring:focus-visible { outline: 2px solid ${T.terracotta}; outline-offset: 2px; }
      `}</style>

      <Sidebar view={view} setView={setView} pendCount={pendencias.length} papel={currentUser.papel} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          view={view} mesFiltro={mesFiltro} setMesFiltro={setMesFiltro}
          currentUser={currentUser} setCurrentUser={setCurrentUser}
          userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen}
          onNova={() => setModal('nova')}
        />

        <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
          {view === 'dashboard' && <Dashboard stats={stats} propostas={propostasMes} todasPropostas={propostas} mesFiltro={mesFiltro} />}
          {view === 'propostas' && (
            <PropostasTable propostas={propostas} titulo="Todas as propostas" onRowClick={p => { setSelected(p); setModal('detalhe'); }} />
          )}
          {view === 'pendencias' && (
            <PropostasTable propostas={pendencias} titulo="Aguardando sua ação" empty="Nenhuma pendência — tudo em dia." onRowClick={p => { setSelected(p); setModal('detalhe'); }} />
          )}
          {view === 'produtividade' && <Produtividade propostas={propostas} mesFiltro={mesFiltro} />}
          {view === 'faturamento' && <Faturamento />}
          {view === 'integracao' && <Integracao />}
          {view === 'admin' && <Admin />}
        </main>
      </div>

      {modal === 'detalhe' && selected && (
        <ModalDetalhe proposta={selected} usuario={currentUser} onClose={() => { setModal(null); setSelected(null); }} onAction={handleAcaoFluxo} />
      )}
    </div>
  );
}

/* ============================================================================
   SIDEBAR
============================================================================ */
function Sidebar({ view, setView, pendCount, papel }) {
  const items = [
    { id: 'dashboard', label: 'Visão geral', icon: LayoutGrid },
    { id: 'pendencias', label: 'Minhas pendências', icon: ClipboardCheck, badge: pendCount },
    { id: 'propostas', label: 'Todas as propostas', icon: FileStack },
    { id: 'produtividade', label: 'Produtividade', icon: Gauge },
    { id: 'faturamento', label: 'Faturamento (Sankhya)', icon: DollarSign },
    { id: 'integracao', label: 'Integrações', icon: Workflow },
  ];
  return (
    <div style={{ width: 248, background: T.panel, borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '22px 22px 20px', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 4, background: T.terracotta, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: '#fff'
          }}>K</div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, letterSpacing: '0.02em', color: T.ink }}>KALENBORN</div>
            <div style={{ fontSize: 11, color: T.inkFaint, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>Engenharia · Orçamentos</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const active = view === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setView(it.id)} className="focus-ring"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                padding: '10px 12px', borderRadius: 6, border: 'none', textAlign: 'left',
                background: active ? T.terracottaSoft : 'transparent',
                color: active ? T.terracottaText : T.inkDim,
                borderLeft: active ? `2px solid ${T.terracotta}` : '2px solid transparent',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.panelAlt; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={17} strokeWidth={2} />
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{it.label}</span>
              </span>
              {!!it.badge && (
                <span style={{ background: T.terracotta, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}

        {papel === 'gestor' && (
          <button onClick={() => setView('admin')} className="focus-ring"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6,
              border: 'none', textAlign: 'left', background: view === 'admin' ? T.terracottaSoft : 'transparent',
              color: view === 'admin' ? T.terracottaText : T.inkDim, marginTop: 8, borderTop: `1px solid ${T.lineSoft}`, paddingTop: 18,
            }}>
            <SlidersHorizontal size={17} />
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>Administração</span>
          </button>
        )}
      </nav>

      <div style={{ padding: 16, borderTop: `1px solid ${T.line}` }}>
        <div style={{ fontSize: 11, color: T.inkFaint, lineHeight: 1.6 }}>
          547 propostas · Jan–Jun 2026<br />Migrado da planilha de controle
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   TOPBAR
============================================================================ */
const VIEW_TITLES = {
  dashboard: 'Visão geral', propostas: 'Todas as propostas', pendencias: 'Minhas pendências',
  produtividade: 'Produtividade da equipe', faturamento: 'Faturamento (Sankhya)', integracao: 'Integrações', admin: 'Administração',
};

function Topbar({ view, mesFiltro, setMesFiltro, currentUser, setCurrentUser, userMenuOpen, setUserMenuOpen, onNova }) {
  return (
    <header style={{
      height: 64, background: T.panel, borderBottom: `1px solid ${T.line}`, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 21, fontWeight: 600, margin: 0, letterSpacing: '0.01em', color: T.ink }}>{VIEW_TITLES[view]}</h1>
        {(view === 'dashboard' || view === 'produtividade') && (
          <div style={{ position: 'relative' }}>
            <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} className="focus-ring"
              style={{
                appearance: 'none', background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 5,
                color: T.inkDim, fontSize: 12.5, padding: '6px 28px 6px 10px', fontWeight: 500,
              }}>
              {MESES_ORDEM.map(m => <option key={m} value={m}>{MESES_LABEL[m]} 2026</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: 9, color: T.inkFaint, pointerEvents: 'none' }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {currentUser.papel === 'engenheiro' && (
          <button onClick={onNova} className="focus-ring" style={{
            display: 'flex', alignItems: 'center', gap: 7, background: T.terracotta, color: '#fff', border: 'none',
            borderRadius: 6, padding: '9px 16px', fontSize: 13, fontWeight: 600,
          }}>
            <Plus size={15} /> Nova proposta
          </button>
        )}

        <div style={{ position: 'relative' }}>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="focus-ring" style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none',
            borderLeft: `1px solid ${T.line}`, paddingLeft: 16,
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{currentUser.nome}</div>
              <div style={{ fontSize: 11, color: T.inkFaint, textTransform: 'capitalize' }}>{currentUser.papel.replace(/_/g, ' ')}</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: T.terracottaSoft, color: T.terracottaText,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
            }}>{currentUser.iniciais}</div>
          </button>

          {userMenuOpen && (
            <div className="scale-in" style={{
              position: 'absolute', right: 0, top: 48, background: T.panel, border: `1px solid ${T.line}`,
              borderRadius: 8, width: 250, boxShadow: '0 12px 28px rgba(0,0,0,.12)', zIndex: 30, overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 14px', fontSize: 11, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${T.line}` }}>
                Simular perfil de acesso
              </div>
              {USUARIOS.map(u => (
                <button key={u.id} onClick={() => { setCurrentUser(u); setUserMenuOpen(false); }}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    background: u.id === currentUser.id ? T.terracottaSoft : 'transparent', border: 'none', color: T.ink,
                  }}
                  onMouseEnter={e => { if (u.id !== currentUser.id) e.currentTarget.style.background = T.panelAlt; }}
                  onMouseLeave={e => { if (u.id !== currentUser.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.lineSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>{u.iniciais}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.nome}</div>
                    <div style={{ fontSize: 11, color: T.inkFaint, textTransform: 'capitalize' }}>{u.papel.replace(/_/g, ' ')}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   DASHBOARD
============================================================================ */
function Dashboard({ stats, propostas, todasPropostas, mesFiltro }) {
  const porEscopo = useMemo(() => {
    const map = {};
    propostas.forEach(p => { map[p.escopo] = (map[p.escopo] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [propostas]);

  const porStatus = useMemo(() => {
    const map = {};
    propostas.forEach(p => { map[p.status] = (map[p.status] || 0) + 1; });
    return FLUXO_ORDEM.concat(['reprovada']).map(s => [s, map[s] || 0]);
  }, [propostas]);

  const evolucaoMensal = useMemo(() => {
    return MESES_ORDEM.map(mes => {
      const doMes = todasPropostas.filter(p => p.mes === mes);
      return { mes, count: doMes.length, valor: doMes.reduce((s, p) => s + (p.valor_liquido || 0), 0) };
    });
  }, [todasPropostas]);

  const porAprovador = useMemo(() => {
    const map = {};
    APROVADORES_POOL.forEach(a => map[a] = 0);
    propostas.forEach(p => { if (p.aprovador_pool) map[p.aprovador_pool] = (map[p.aprovador_pool] || 0) + 1; });
    return Object.entries(map);
  }, [propostas]);

  const maxEscopo = Math.max(...porEscopo.map(([, v]) => v), 1);
  const maxMensal = Math.max(...evolucaoMensal.map(m => m.count), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1320 }}>
      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <Kpi label="Propostas no mês" value={stats.total} icon={FileStack} />
        <Kpi label="Em andamento" value={stats.ativas} icon={Clock3} tone="amber" />
        <Kpi label="Em atraso" value={stats.atrasadas} icon={AlertTriangle} tone="rust" />
        <Kpi label="Valor em fluxo" value={fmtMoedaCompacta(stats.valorMes)} icon={ShieldCheck} />
        <OrigemCard percWord={stats.percWord} wordCount={stats.wordCount} sankhyaCount={stats.sankhyaCount} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <Panel title="Volume de propostas — Jan a Jun" subtitle="Total mensal, planilha histórica completa">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 150, padding: '8px 4px 0' }}>
            {evolucaoMensal.map(m => {
              const h = Math.max((m.count / maxMensal) * 110, 4);
              const isActive = m.mes === mesFiltro;
              return (
                <div key={m.mes} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: isActive ? T.terracotta : T.inkDim, fontFamily: FONT_DISPLAY }}>{m.count}</div>
                  <div style={{ width: '100%', maxWidth: 40, height: h, background: isActive ? T.terracotta : T.line, borderRadius: '3px 3px 0 0', transition: 'height .4s ease' }} />
                  <div style={{ fontSize: 10.5, color: isActive ? T.terracottaText : T.inkFaint, marginTop: 8, fontWeight: isActive ? 700 : 400 }}>{MESES_LABEL[m.mes]}</div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Volume por escopo" subtitle="Itens cadastrados no mês selecionado">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 4 }}>
            {porEscopo.map(([escopo, count]) => (
              <div key={escopo} style={{ display: 'flex', alignItems: 'center', fontSize: 12, gap: 10 }}>
                <span style={{ width: 130, color: T.inkDim, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={escopo}>{escopo}</span>
                <div style={{ flex: 1, background: T.lineSoft, height: 7, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(count / maxEscopo) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 4 }} />
                </div>
                <span style={{ width: 20, textAlign: 'right', fontWeight: 600, color: T.ink, fontFamily: FONT_DISPLAY }}>{count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Status do fluxo" subtitle="Propostas do mês selecionado, por etapa">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 140, padding: '8px 6px 0' }}>
            {porStatus.map(([status, count]) => {
              const meta = STATUS_META[status];
              const max = Math.max(...porStatus.map(([, v]) => v), 1);
              const h = Math.max((count / max) * 100, count > 0 ? 8 : 2);
              return (
                <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: meta.bg === T.ink ? T.ink : meta.color, fontFamily: FONT_DISPLAY }}>{count}</div>
                  <div style={{ width: '100%', maxWidth: 36, height: h, background: meta.bg === T.ink ? T.ink : meta.color, borderRadius: '3px 3px 0 0', transition: 'height .4s ease' }} />
                  <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 8, textAlign: 'center', lineHeight: 1.3 }}>{meta.label}</div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Aprovações por pessoa" subtitle="Pool fixo — qualquer um dos três decide" right={
          <span style={{ fontSize: 10.5, color: T.inkFaint, display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {APROVADORES_POOL.length} aprovadores</span>
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {porAprovador.map(([nome, count]) => {
              const maxA = Math.max(...porAprovador.map(([, v]) => v), 1);
              return (
                <div key={nome} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.terracottaSoft, color: T.terracottaText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span style={{ fontSize: 13, width: 90, color: T.ink, fontWeight: 500 }}>{nome}</span>
                  <div style={{ flex: 1, background: T.lineSoft, height: 7, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxA) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 4 }} />
                  </div>
                  <span style={{ width: 18, textAlign: 'right', fontWeight: 600, fontFamily: FONT_DISPLAY }}>{count}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {stats.atrasadas > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, background: T.rustSoft, border: `1px solid ${T.rust}33`,
          borderRadius: 8, padding: '13px 16px',
        }}>
          <AlertTriangle size={18} color={T.rust} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: T.ink }}>
            <strong style={{ color: T.rustText }}>{stats.atrasadas} proposta{stats.atrasadas > 1 ? 's' : ''}</strong> com entrega prevista vencida e ainda não concluída.
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone }) {
  const toneColor = tone === 'amber' ? T.amberText : tone === 'rust' ? T.rustText : T.ink;
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11.5, color: T.inkFaint, fontWeight: 500 }}>{label}</span>
        <Icon size={15} color={toneColor} strokeWidth={2} />
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: toneColor, marginTop: 10, fontSize: 26, letterSpacing: '0.01em' }}>{value}</div>
    </div>
  );
}

function OrigemCard({ percWord, wordCount, sankhyaCount }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11.5, color: T.inkFaint, fontWeight: 500 }}>Origem dos dados</span>
        <FileWarning size={15} color={T.terracotta} />
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: T.terracotta, marginTop: 10 }}>{percWord}%</div>
      <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>fora do Sankhya (Word/e-mail)</div>
      <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 10 }}>
        <div style={{ width: `${percWord}%`, background: T.terracotta }} />
        <div style={{ width: `${100 - percWord}%`, background: T.lineSoft }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.inkFaint, marginTop: 6 }}>
        <span>{wordCount} manual</span><span>{sankhyaCount} ERP</span>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children, right }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: T.ink }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '3px 0 0' }}>{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ============================================================================
   TABELA DE PROPOSTAS — dataset real completo, com filtro e busca
============================================================================ */
function PropostasTable({ propostas, titulo, onRowClick, empty = 'Nenhuma proposta encontrada.' }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const filtradas = useMemo(() => {
    return propostas.filter(p => {
      const matchBusca = p.br.toLowerCase().includes(busca.toLowerCase()) || p.cliente.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
      const matchMes = filtroMes === 'todos' || p.mes === filtroMes;
      return matchBusca && matchStatus && matchMes;
    });
  }, [propostas, busca, filtroStatus, filtroMes]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / PER_PAGE));
  const pageClamped = Math.min(page, totalPages);
  const paginadas = filtradas.slice((pageClamped - 1) * PER_PAGE, pageClamped * PER_PAGE);

  return (
    <div className="fade-up" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '15px 18px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: T.ink }}>{titulo} <span style={{ color: T.inkFaint, fontWeight: 400 }}>({filtradas.length})</span></h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: T.inkFaint }} />
            <input value={busca} onChange={e => { setBusca(e.target.value); setPage(1); }} placeholder="Buscar BR ou cliente…" className="focus-ring"
              style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 12px 7px 30px', fontSize: 12.5, color: T.ink, width: 200, outline: 'none' }} />
          </div>
          <select value={filtroMes} onChange={e => { setFiltroMes(e.target.value); setPage(1); }} className="focus-ring"
            style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 10px', fontSize: 12.5, color: T.inkDim }}>
            <option value="todos">Todos os meses</option>
            {MESES_ORDEM.map(m => <option key={m} value={m}>{MESES_LABEL[m]}</option>)}
          </select>
          <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPage(1); }} className="focus-ring"
            style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 10px', fontSize: 12.5, color: T.inkDim }}>
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.line}` }}>
              {['BR / Ref', 'Cliente', 'Escopo', 'Origem', 'Entrega prev.', 'Atraso', 'Valor', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginadas.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.inkFaint, fontSize: 13 }}>{empty}</td></tr>
            ) : paginadas.map(p => {
              const atraso = calcularAtraso(p.data_entrega_prevista, p.data_conclusao);
              const isAtrasado = atraso > 0 && p.status !== 'concluida';
              const meta = STATUS_META[p.status];
              return (
                <tr key={p.id} onClick={() => onRowClick(p)} style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: FONT_DISPLAY, fontSize: 13.5 }}>{p.br}</td>
                  <td style={{ padding: '12px 16px', color: T.inkDim, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.cliente}</td>
                  <td style={{ padding: '12px 16px', color: T.inkDim, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.escopo}>{p.escopo}</td>
                  <td style={{ padding: '12px 16px' }}><OrigemBadge origem={p.origem_dados} /></td>
                  <td style={{ padding: '12px 16px', color: T.inkDim, fontSize: 12.5 }}>{fmtData(p.data_entrega_prevista)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5 }}>
                    {p.status === 'concluida' ? <span style={{ color: T.inkFaint }}>—</span> :
                      isAtrasado ? <span style={{ color: T.rustText, fontWeight: 600 }}>+{atraso}d</span> :
                        <span style={{ color: T.oliveText, fontWeight: 600 }}>no prazo</span>}
                  </td>
                  <td style={{ padding: '12px 16px', color: T.inkDim, fontSize: 12.5, fontFamily: FONT_DISPLAY }}>{fmtMoeda(p.valor_liquido)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 11.5, color: T.inkFaint }}>Página {pageClamped} de {totalPages}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button disabled={pageClamped === 1} onClick={() => setPage(p => p - 1)} style={pagerBtn(pageClamped === 1)}>Anterior</button>
            <button disabled={pageClamped === totalPages} onClick={() => setPage(p => p + 1)} style={pagerBtn(pageClamped === totalPages)}>Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
}

function pagerBtn(disabled) {
  return { background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '6px 12px', fontSize: 12, color: disabled ? T.inkFaint : T.ink, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer' };
}

function OrigemBadge({ origem }) {
  const isSankhya = origem === 'sankhya';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
      padding: '4px 8px', borderRadius: 4,
      color: isSankhya ? T.blueText : T.amberText,
      background: isSankhya ? T.blueSoft : T.amberSoft,
    }}>
      {isSankhya ? <Link2 size={11} /> : <FileWarning size={11} />}
      {isSankhya ? 'ERP Sankhya' : 'Word / e-mail'}
    </span>
  );
}

/* ============================================================================
   PRODUTIVIDADE — dados reais do Sankhya (TGFCAB+TSIUSU / AD_ORCPRECO)
   Botão "Atualizar" dispara sankhya-produtividade-sync.
============================================================================ */
function Produtividade() {
  const hoje = '2026-06-26';
  const [periodo, setPeriodo] = useState({ dataIni: '2026-06-01', dataFim: hoje });
  const [pedidos, setPedidos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    const [r1, r2, r3] = await Promise.all([
      supabase.from('produtividade_pedidos').select('*').eq('data_ini', periodo.dataIni).eq('data_fim', periodo.dataFim).order('total_pedidos', { ascending: false }),
      supabase.from('produtividade_orcamentos').select('*').eq('data_ini', periodo.dataIni).eq('data_fim', periodo.dataFim).order('total_geral', { ascending: false }),
      supabase.from('sankhya_sync_log').select('*').eq('tipo', 'produtividade').order('finalizado_em', { ascending: false }).limit(1),
    ]);
    setPedidos(r1.data || []);
    setOrcamentos(r2.data || []);
    setLastSync((r3.data || [])[0] || null);
    setLoading(false);
  }, [periodo]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleAtualizar = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sankhya-produtividade-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataIni: periodo.dataIni, dataFim: periodo.dataFim }),
      });
      const data = await res.json();
      if (data.ok) {
        setSyncStatus({ ok: true, message: `Sincronizado: ${data.pedidos} vendedores com pedidos, ${data.orcamentos} orçamentistas no período.` });
        await carregarDados();
      } else {
        setSyncStatus({ ok: false, message: data.erro || 'Erro desconhecido na sincronização.' });
      }
    } catch (err) {
      setSyncStatus({ ok: false, message: String(err) });
    } finally {
      setSyncing(false);
    }
  };

  const maxPedidos = Math.max(...pedidos.map(p => p.total_pedidos), 1);
  const maxOrc = Math.max(...orcamentos.map(o => o.total_geral), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1280 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Data início">
            <input type="date" value={periodo.dataIni} onChange={e => setPeriodo(p => ({ ...p, dataIni: e.target.value }))} style={{ ...selectStyleFat(150), appearance: 'auto' }} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Data fim">
            <input type="date" value={periodo.dataFim} onChange={e => setPeriodo(p => ({ ...p, dataFim: e.target.value }))} style={{ ...selectStyleFat(150), appearance: 'auto' }} />
          </FiltroCampoFat>
        </div>
        <button onClick={handleAtualizar} disabled={syncing} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: T.terracotta, color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, opacity: syncing ? 0.7 : 1,
        }}>
          <RefreshCw size={15} className={syncing ? 'spin' : ''} />
          {syncing ? 'Atualizando do Sankhya…' : 'Atualizar do Sankhya'}
        </button>
      </div>

      {syncStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 8,
          background: syncStatus.ok ? T.oliveSoft : T.rustSoft, border: `1px solid ${syncStatus.ok ? T.olive : T.rust}33`,
        }}>
          {syncStatus.ok ? <CheckCircle2 size={16} color={T.oliveText} /> : <AlertTriangle size={16} color={T.rustText} />}
          <span style={{ fontSize: 13, color: syncStatus.ok ? T.oliveText : T.rustText }}>{syncStatus.message}</span>
        </div>
      )}

      {lastSync && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.inkFaint, marginTop: -8 }}>
          <Clock3 size={12} />
          Última sincronização: {new Date(lastSync.finalizado_em).toLocaleString('pt-BR')}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: T.inkFaint, fontSize: 13 }}>Carregando dados…</div>
      ) : (
        <>
          <Panel title="Conhecimento de Pedido por vendedor" subtitle="TGFCAB / TSIUSU (TIPMOV='P') — pedido de venda confirmado, por semana do período">
            <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '4px 0 10px' }}>Esta é a confirmação do negócio (Conhecimento de Pedido), diferente da Proposta abaixo.</p>
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                    <th style={thFat()}>Vendedor</th>
                    <th style={thFat(160)}>Volume</th>
                    <th style={thFat(0, 'right')}>Sem 1</th>
                    <th style={thFat(0, 'right')}>Sem 2</th>
                    <th style={thFat(0, 'right')}>Sem 3</th>
                    <th style={thFat(0, 'right')}>Sem 4</th>
                    <th style={thFat(0, 'right')}>Sem 5</th>
                    <th style={thFat(0, 'right')}>Total</th>
                    <th style={thFat(0, 'right')}>Valor vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: T.inkFaint, fontSize: 12.5 }}>Sem dados — clique em "Atualizar do Sankhya".</td></tr>
                  ) : pedidos.map(p => (
                    <tr key={p.vendedor_nome} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                      <td style={{ padding: '11px 12px', fontWeight: 600 }}>{p.vendedor_nome}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ background: T.lineSoft, height: 7, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${(p.total_pedidos / maxPedidos) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 4 }} />
                        </div>
                      </td>
                      <td style={tdFat()}>{p.semana_1}</td>
                      <td style={tdFat()}>{p.semana_2}</td>
                      <td style={tdFat()}>{p.semana_3}</td>
                      <td style={tdFat()}>{p.semana_4}</td>
                      <td style={tdFat()}>{p.semana_5}</td>
                      <td style={{ ...tdFat(), fontWeight: 700, color: T.terracotta }}>{p.total_pedidos}</td>
                      <td style={tdFat()}>{fmtMoedaCompacta(p.valor_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Propostas por orçamentista" subtitle="AD_ORCPRECO — proposta técnica/comercial, projetos novos vs. revisões, por semana do período">
            <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '4px 0 10px' }}>Esta é a entrada do funil (Proposta), ainda sem confirmação de venda.</p>
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                    <th style={thFat()}>Orçamentista</th>
                    <th style={thFat(140)}>Volume</th>
                    <th style={thFat(0, 'right')}>Novos</th>
                    <th style={thFat(0, 'right')}>Revisões</th>
                    <th style={thFat(0, 'right')}>Sem 1</th>
                    <th style={thFat(0, 'right')}>Sem 2</th>
                    <th style={thFat(0, 'right')}>Sem 3</th>
                    <th style={thFat(0, 'right')}>Sem 4</th>
                    <th style={thFat(0, 'right')}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamentos.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: T.inkFaint, fontSize: 12.5 }}>Sem dados — clique em "Atualizar do Sankhya".</td></tr>
                  ) : orcamentos.map(o => (
                    <tr key={o.orcamentista_nome} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                      <td style={{ padding: '11px 12px', fontWeight: 600 }}>{o.orcamentista_nome}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ background: T.lineSoft, height: 7, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${(o.total_geral / maxOrc) * 100}%`, height: '100%', background: T.blue, borderRadius: 4 }} />
                        </div>
                      </td>
                      <td style={tdFat()}>{o.projetos_novos}</td>
                      <td style={tdFat()}>{o.revisoes}</td>
                      <td style={tdFat()}>{o.semana_1}</td>
                      <td style={tdFat()}>{o.semana_2}</td>
                      <td style={tdFat()}>{o.semana_3}</td>
                      <td style={tdFat()}>{o.semana_4}</td>
                      <td style={{ ...tdFat(), fontWeight: 700, color: T.blueText }}>{o.total_geral}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

function thFat(width, align = 'left') {
  return { textAlign: align, padding: '8px 12px', fontSize: 10, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', width: width || undefined };
}
function tdFat() {
  return { padding: '11px 12px', textAlign: 'right', color: T.inkDim, fontFamily: FONT_DISPLAY };
}

/* ============================================================================
   FATURAMENTO — dados reais do Sankhya (TGFCAB/TGFITE/TGFPAR)
   Botão "Atualizar" dispara a edge function sankhya-faturamento-sync.
============================================================================ */
const MESES_FAT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function Faturamento() {
  const anoAtual = new Date().getFullYear();
  const [filtros, setFiltros] = useState({ anoIni: anoAtual, anoFim: anoAtual, mesIni: 1, mesFim: 12, vendedor: '' });
  const [mensal, setMensal] = useState([]);
  const [notaVenda, setNotaVenda] = useState([]);
  const [pedidosMensal, setPedidosMensal] = useState([]);
  const [pedidosDetalhe, setPedidosDetalhe] = useState([]);
  const [porKaleng, setPorKaleng] = useState([]);
  const [porSegmento, setPorSegmento] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [drillDownAberto, setDrillDownAberto] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    const vendCod = filtros.vendedor ? Number(filtros.vendedor) : null;

    let q1 = supabase.from('faturamento_mensal').select('*').gte('ano', filtros.anoIni).lte('ano', filtros.anoFim);
    q1 = vendCod ? q1.eq('vendedor_codigo', vendCod) : q1.is('vendedor_codigo', null);

    let q2 = supabase.from('faturamento_por_kaleng').select('*').gte('ano', filtros.anoIni).lte('ano', filtros.anoFim);
    q2 = vendCod ? q2.eq('vendedor_codigo', vendCod) : q2.is('vendedor_codigo', null);

    let q3 = supabase.from('faturamento_por_segmento').select('*').gte('ano', filtros.anoIni).lte('ano', filtros.anoFim);
    q3 = vendCod ? q3.eq('vendedor_codigo', vendCod) : q3.is('vendedor_codigo', null);

    const q4 = supabase.from('nota_venda_mensal').select('*').gte('ano', filtros.anoIni).lte('ano', filtros.anoFim);
    const q5 = supabase.from('pedidos_venda_mensal').select('*').gte('ano', filtros.anoIni).lte('ano', filtros.anoFim);

    const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
      q1, q2, q3, q4, q5,
      supabase.from('sankhya_vendedores').select('*').order('nome'),
      supabase.from('sankhya_sync_log').select('*').eq('tipo', 'faturamento_completo').order('finalizado_em', { ascending: false }).limit(1),
    ]);

    setMensal((r1.data || []).filter(d => d.mes >= filtros.mesIni && d.mes <= filtros.mesFim));
    setPorKaleng((r2.data || []).filter(d => d.mes >= filtros.mesIni && d.mes <= filtros.mesFim));
    setPorSegmento((r3.data || []).filter(d => d.mes >= filtros.mesIni && d.mes <= filtros.mesFim));
    setNotaVenda((r4.data || []).filter(d => d.mes >= filtros.mesIni && d.mes <= filtros.mesFim));
    setPedidosMensal((r5.data || []).filter(d => d.mes >= filtros.mesIni && d.mes <= filtros.mesFim));
    setVendedores(r6.data || []);
    setLastSync((r7.data || [])[0] || null);
    setLoading(false);
  }, [filtros]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const carregarDetalhePedidos = useCallback(async () => {
    const ini = `${filtros.anoIni}-${String(filtros.mesIni).padStart(2, '0')}-01`;
    const ultimoDia = new Date(filtros.anoFim, filtros.mesFim, 0).getDate();
    const fim = `${filtros.anoFim}-${String(filtros.mesFim).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    const { data } = await supabase.from('pedidos_venda_detalhe').select('*')
      .gte('data_neg', ini).lte('data_neg', fim).order('data_neg', { ascending: false });
    setPedidosDetalhe(data || []);
  }, [filtros]);

  const handleAtualizar = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const vendCod = filtros.vendedor ? Number(filtros.vendedor) : null;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sankhya-faturamento-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anoIni: filtros.anoIni, anoFim: filtros.anoFim, mesIni: filtros.mesIni, mesFim: filtros.mesFim, vendedor: vendCod }),
      });
      const data = await res.json();
      if (data.ok) {
        setSyncStatus({ ok: true, message: `Sincronizado: ${data.net_value_mensal} meses (net value), ${data.nota_venda_mensal} (nota de venda), ${data.pedidos_venda_mensal} (pedidos de venda).` });
        await carregarDados();
      } else {
        setSyncStatus({ ok: false, message: data.erro || 'Erro desconhecido na sincronização.' });
      }
    } catch (err) {
      setSyncStatus({ ok: false, message: String(err) });
    } finally {
      setSyncing(false);
    }
  };

  const totalPeriodo = useMemo(() => mensal.reduce((s, m) => s + Number(m.valor_liquido || 0), 0), [mensal]);
  const totalNotaVenda = useMemo(() => notaVenda.reduce((s, m) => s + Number(m.valor_bruto || 0), 0), [notaVenda]);
  const totalPedidos = useMemo(() => pedidosMensal.reduce((s, m) => s + Number(m.valor_total || 0), 0), [pedidosMensal]);
  const qtdPedidos = useMemo(() => pedidosMensal.reduce((s, m) => s + Number(m.total_pedidos || 0), 0), [pedidosMensal]);
  const mediaMensal = mensal.length ? totalPeriodo / mensal.length : 0;

  const evolucaoMensal = useMemo(() => {
    const map = {};
    mensal.forEach(m => { map[`${m.ano}-${m.mes}`] = Number(m.valor_liquido || 0); });
    const out = [];
    for (let ano = filtros.anoIni; ano <= filtros.anoFim; ano++) {
      const mIni = ano === filtros.anoIni ? filtros.mesIni : 1;
      const mFim = ano === filtros.anoFim ? filtros.mesFim : 12;
      for (let mes = mIni; mes <= mFim; mes++) out.push({ ano, mes, valor: map[`${ano}-${mes}`] || 0 });
    }
    return out;
  }, [mensal, filtros]);

  const kalengAgregado = useMemo(() => {
    const map = {};
    porKaleng.forEach(k => { map[k.segmento_kaleng] = (map[k.segmento_kaleng] || 0) + Number(k.valor_liquido || 0); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [porKaleng]);

  const segmentoAgregado = useMemo(() => {
    const map = {};
    porSegmento.forEach(s => {
      const key = s.segmento_descricao || 'Sem Segmento';
      map[key] = (map[key] || 0) + Number(s.valor_liquido || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [porSegmento]);

  const maxMensal = Math.max(...evolucaoMensal.map(m => m.valor), 1);
  const maxKaleng = Math.max(...kalengAgregado.map(([, v]) => v), 1);
  const maxSegmento = Math.max(...segmentoAgregado.map(([, v]) => v), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: T.inkFaint, fontSize: 12.5, margin: 0, maxWidth: 520 }}>
          Dados puxados direto do ERP (TGFCAB/TGFITE/TGFPAR). TOPs de venda validados manualmente: 3100, 3101, 3102, 3103, 3106, 3107, 3110, 3200, 3213, 3214, 3220.
        </p>
        <button onClick={handleAtualizar} disabled={syncing} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: T.terracotta, color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, opacity: syncing ? 0.7 : 1, flexShrink: 0,
        }}>
          <RefreshCw size={15} className={syncing ? 'spin' : ''} />
          {syncing ? 'Atualizando do Sankhya…' : 'Atualizar do Sankhya'}
        </button>
      </div>

      {syncStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 8,
          background: syncStatus.ok ? T.oliveSoft : T.rustSoft, border: `1px solid ${syncStatus.ok ? T.olive : T.rust}33`,
        }}>
          {syncStatus.ok ? <CheckCircle2 size={16} color={T.oliveText} /> : <AlertTriangle size={16} color={T.rustText} />}
          <span style={{ fontSize: 13, color: syncStatus.ok ? T.oliveText : T.rustText }}>{syncStatus.message}</span>
        </div>
      )}

      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Filter size={15} color={T.terracotta} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: T.inkDim, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filtros</span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Ano inicial"><SelectAnoFat value={filtros.anoIni} onChange={v => setFiltros(f => ({ ...f, anoIni: v }))} /></FiltroCampoFat>
          <FiltroCampoFat label="Mês inicial"><SelectMesFat value={filtros.mesIni} onChange={v => setFiltros(f => ({ ...f, mesIni: v }))} /></FiltroCampoFat>
          <FiltroCampoFat label="Ano final"><SelectAnoFat value={filtros.anoFim} onChange={v => setFiltros(f => ({ ...f, anoFim: v }))} /></FiltroCampoFat>
          <FiltroCampoFat label="Mês final"><SelectMesFat value={filtros.mesFim} onChange={v => setFiltros(f => ({ ...f, mesFim: v }))} /></FiltroCampoFat>
          <FiltroCampoFat label="Vendedor">
            <div style={{ position: 'relative' }}>
              <select value={filtros.vendedor} onChange={e => setFiltros(f => ({ ...f, vendedor: e.target.value }))} style={selectStyleFat(170)}>
                <option value="">Todos os vendedores</option>
                {vendedores.map(v => <option key={v.codigo} value={v.codigo}>{v.nome}</option>)}
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
        </div>
        {lastSync && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 11, color: T.inkFaint }}>
            <Clock3 size={12} />
            Última sincronização: {new Date(lastSync.finalizado_em).toLocaleString('pt-BR')} · {lastSync.registros_sincronizados} registros
          </div>
        )}
      </Panel>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: T.inkFaint, fontSize: 13 }}>Carregando dados…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <Kpi label="Net Value (líquido)" value={fmtMoedaCompacta(totalPeriodo)} icon={DollarSign} />
            <Kpi label="Nota de Venda (bruto faturado)" value={fmtMoedaCompacta(totalNotaVenda)} icon={TrendingUp} />
            <button
              onClick={() => { setDrillDownAberto(true); carregarDetalhePedidos(); }}
              style={{ textAlign: 'left', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
            >
              <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '16px 18px', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.terracotta}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.line}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11.5, color: T.inkFaint, fontWeight: 500 }}>Pedidos de Venda ({qtdPedidos})</span>
                  <Search size={13} color={T.terracotta} />
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.ink, marginTop: 10, fontSize: 26 }}>{fmtMoedaCompacta(totalPedidos)}</div>
                <div style={{ fontSize: 10.5, color: T.terracottaText, marginTop: 4 }}>Clique para ver os projetos →</div>
              </div>
            </button>
          </div>

          <Panel title="Evolução mensal" subtitle={filtros.anoIni === filtros.anoFim ? `${filtros.anoIni}` : `${filtros.anoIni}–${filtros.anoFim}`}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 170, padding: '10px 4px 0', overflowX: 'auto' }}>
              {evolucaoMensal.map((m, i) => {
                const h = Math.max((m.valor / maxMensal) * 130, m.valor > 0 ? 4 : 2);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', minWidth: 54 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6, color: T.terracottaText, fontFamily: FONT_DISPLAY, whiteSpace: 'nowrap' }}>{fmtMoedaCompacta(m.valor)}</div>
                    <div style={{ width: 34, height: h, background: T.terracotta, borderRadius: '3px 3px 0 0', transition: 'height .4s ease' }} />
                    <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 8 }}>{MESES_FAT[m.mes - 1]}/{String(m.ano).slice(2)}</div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Panel title="Por segmento Kalenborn" subtitle="AD_KALENG — classificação interna de produto">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {kalengAgregado.length === 0 ? <EmptyStateFat /> : kalengAgregado.map(([nome, valor]) => (
                  <BarraFat key={nome} nome={nome} valor={valor} max={maxKaleng} cor={T.terracotta} />
                ))}
              </div>
            </Panel>
            <Panel title="Por segmento de mercado" subtitle="AD_SEGMENTO — Cement Plant, Mining, Steel Plant...">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {segmentoAgregado.length === 0 ? <EmptyStateFat /> : segmentoAgregado.map(([nome, valor]) => (
                  <BarraFat key={nome} nome={nome} valor={valor} max={maxSegmento} cor={T.blue} />
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}

      {drillDownAberto && (
        <DrillDownPedidos pedidos={pedidosDetalhe} onClose={() => setDrillDownAberto(false)} />
      )}
    </div>
  );
}

function DrillDownPedidos({ pedidos, onClose }) {
  const total = pedidos.reduce((s, p) => s + Number(p.valor_nota || 0), 0);
  return (
    <Overlay onClose={onClose}>
      <div className="scale-in" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 820,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, margin: 0 }}>Pedidos de Venda — detalhe</h2>
            <p style={{ fontSize: 12, color: T.inkFaint, margin: '3px 0 0' }}>{pedidos.length} pedidos · {fmtMoedaCompacta(total)} no total</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.inkFaint }}><X size={20} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                <th style={thFat()}>Data</th>
                <th style={thFat()}>Cliente</th>
                <th style={thFat()}>Vendedor</th>
                <th style={thFat(0, 'right')}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando ou sem pedidos no período…</td></tr>
              ) : pedidos.map(p => (
                <tr key={p.nunota} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '9px 12px', color: T.inkDim }}>{fmtData(p.data_neg)}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.cliente_nome}>{p.cliente_nome}</td>
                  <td style={{ padding: '9px 12px', color: T.inkDim }}>{p.vendedor_nome}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{fmtMoeda(p.valor_nota)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Overlay>
  );
}

function BarraFat({ nome, valor, max, cor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
      <span style={{ width: 130, color: T.inkDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={nome}>{nome}</span>
      <div style={{ flex: 1, background: T.lineSoft, height: 8, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${(valor / max) * 100}%`, height: '100%', background: cor, borderRadius: 4 }} />
      </div>
      <span style={{ width: 64, textAlign: 'right', fontWeight: 600, fontFamily: FONT_DISPLAY, fontSize: 11.5 }}>{fmtMoedaCompacta(valor)}</span>
    </div>
  );
}

function FiltroCampoFat({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.inkFaint, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function SelectAnoFat({ value, onChange }) {
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => anoAtual - 4 + i);
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(Number(e.target.value))} style={selectStyleFat(90)}>
        {anos.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <ChevronDown size={13} style={chevronStyleFat} />
    </div>
  );
}

function SelectMesFat({ value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(Number(e.target.value))} style={selectStyleFat(100)}>
        {MESES_FAT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
      </select>
      <ChevronDown size={13} style={chevronStyleFat} />
    </div>
  );
}

function EmptyStateFat() {
  return <p style={{ fontSize: 12, color: T.inkFaint, textAlign: 'center', padding: '16px 0', margin: 0 }}>Sem dados — clique em "Atualizar do Sankhya".</p>;
}

function selectStyleFat(width) {
  return { appearance: 'none', background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, color: T.ink, fontSize: 12.5, padding: '7px 26px 7px 10px', fontWeight: 500, width };
}
const chevronStyleFat = { position: 'absolute', right: 8, top: 10, color: T.inkFaint, pointerEvents: 'none' };

/* ============================================================================
   INTEGRAÇÕES — ponte com Power Automate
============================================================================ */
function Integracao() {
  const eventos = [
    { evento: 'proposta.enviada_revisao', desc: 'Disparado quando o engenheiro envia para revisão técnica', destino: 'Teams — canal Engenharia' },
    { evento: 'proposta.aprovada', desc: 'Disparado quando qualquer aprovador do pool decide', destino: 'Teams — DM do responsável' },
    { evento: 'proposta.reprovada', desc: 'Disparado em reprovação, em qualquer etapa', destino: 'Teams — DM do responsável + comentário' },
    { evento: 'sankhya.sincronizar', desc: 'Job periódico que busca pedidos novos no Sankhya', destino: 'Atualiza tabela `propostas`' },
    { evento: 'planilha.exportar', desc: 'Disparo manual ou agendado para gerar a planilha de controle no formato legado', destino: 'OneDrive / SharePoint' },
  ];

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1100 }}>
      <Panel title="Ponte com o Power Automate" subtitle="O portal expõe webhooks de saída e aceita gatilhos de entrada — mão dupla com Teams, Sankhya e a planilha legada">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {eventos.map(ev => (
            <div key={ev.evento} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: T.panelAlt, border: `1px solid ${T.lineSoft}`, borderRadius: 8 }}>
              <Webhook size={16} color={T.terracotta} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <code style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, background: T.lineSoft, padding: '2px 6px', borderRadius: 4 }}>{ev.evento}</code>
                <div style={{ fontSize: 12, color: T.inkDim, marginTop: 4 }}>{ev.desc}</div>
              </div>
              <span style={{ fontSize: 11.5, color: T.inkFaint, whiteSpace: 'nowrap', textAlign: 'right' }}>{ev.destino}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Payload de exemplo — proposta.aprovada" subtitle="Schema enviado ao webhook do Power Automate, mesmo formato {to, subject, body} já usado no K.RH">
        <pre style={{
          background: T.ink, color: '#E8E4DA', fontSize: 12, padding: 16, borderRadius: 8, overflow: 'auto',
          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6, margin: 0,
        }}>{`{
  "to": "joao.victor@kalenborn.com.br",
  "subject": "Proposta BR13855/26 aprovada",
  "body": "A proposta da Gerdau — Ouro Branco foi aprovada por Felipe.",
  "evento": "proposta.aprovada",
  "proposta": {
    "br": "BR13855/26",
    "cliente": "Gerdau — Ouro Branco",
    "aprovador": "Felipe",
    "valor_liquido": 155000
  }
}`}</pre>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Entrada — Sankhya → Portal" subtitle="Power Automate consulta o ERP e grava na tabela de propostas">
          <FluxoMini steps={['Agendamento (hourly)', 'Consulta Sankhya', 'Upsert em `propostas`', 'Marca como pendente de validação']} />
        </Panel>
        <Panel title="Saída — Portal → Teams" subtitle="Mudança de status dispara notificação no canal certo">
          <FluxoMini steps={['Trigger de status change', 'Resolve destinatário pelo papel', 'Monta payload', 'Posta no Teams via webhook']} />
        </Panel>
      </div>
    </div>
  );
}

function FluxoMini({ steps }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', gap: 12, position: 'relative' }}>
          {i < steps.length - 1 && <div style={{ position: 'absolute', left: 9, top: 20, bottom: -4, width: 1.5, background: T.line }} />}
          <div style={{ width: 19, height: 19, borderRadius: '50%', background: T.terracottaSoft, color: T.terracottaText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, zIndex: 1 }}>{i + 1}</div>
          <div style={{ paddingBottom: 18, fontSize: 12.5, color: T.ink, paddingTop: 1 }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   ADMIN
============================================================================ */
function Admin() {
  return (
    <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 1100 }}>
      <Panel title="Pool de aprovadores" subtitle="Qualquer um dos três decide — sem ordem fixa, sem fila">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {APROVADORES_POOL.map(nome => (
            <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: T.panelAlt, borderRadius: 6 }}>
              <span style={{ fontSize: 13 }}>{nome}</span>
              <span style={{ fontSize: 11, color: T.inkFaint }}>analista aprovador</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Catálogo de escopos" subtitle="Domínio editável — usado em formulário de cadastro">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {ESCOPOS_TOP.map(e => (
            <span key={e} style={{ fontSize: 12, padding: '5px 10px', background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 5, color: T.inkDim }}>{e}</span>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ============================================================================
   MODAL: DETALHE
============================================================================ */
function ModalDetalhe({ proposta, usuario, onClose, onAction }) {
  const [comentario, setComentario] = useState('');
  const isRascunho = proposta.status === 'rascunho' || proposta.status === 'reprovada';
  const sankhyaPendente = proposta.origem_dados === 'sankhya' && !proposta.validado_pelo_engenheiro;

  const canSendToReview = isRascunho && usuario.papel === 'engenheiro' && !sankhyaPendente;
  const canValidateSankhya = sankhyaPendente && usuario.papel === 'engenheiro';
  const canReview = proposta.status === 'em_revisao_tecnica' && usuario.papel === 'revisor_tecnico';
  const canApprove = proposta.status === 'aguardando_aprovacao' && usuario.papel === 'analista_aprovador' && APROVADORES_POOL.includes(usuario.nome);
  const canFinish = proposta.status === 'aprovada' && usuario.papel === 'engenheiro';

  const meta = STATUS_META[proposta.status];

  return (
    <Overlay onClose={onClose}>
      <div className="scale-in" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 920,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
      }}>
        <div style={{ padding: '20px 24px', background: T.panelAlt, borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, margin: 0, color: T.ink }}>{proposta.br}</h2>
              <span style={{ background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {meta.label}
              </span>
            </div>
            <p style={{ color: T.inkFaint, fontSize: 13, margin: '4px 0 0' }}>{proposta.cliente} · {proposta.escopo}</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.inkFaint, padding: 4 }}><X size={22} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
          <div style={{ flex: '2 1 0', padding: 24, borderRight: `1px solid ${T.line}` }}>
            <SectionLabel>Informações da proposta</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: 13, marginTop: 12, marginBottom: 22 }}>
              <Detail label="Origem dos dados" value={proposta.origem_dados === 'sankhya' ? 'ERP Sankhya' : 'Manual (Word/e-mail)'} />
              <Detail label="Tipo de proposta" value={proposta.tipo_proposta.replace(/_/g, ' ')} />
              <Detail label="Abertura" value={fmtData(proposta.data_abertura)} />
              <Detail label="Entrega prevista" value={fmtData(proposta.data_entrega_prevista)} />
              <Detail label="Classificação" value={proposta.classificacao} />
              <Detail label="Valor líquido" value={fmtMoeda(proposta.valor_liquido)} />
              <Detail label="Responsável" value={proposta.responsavel} />
              <Detail label="Mês" value={MESES_LABEL[proposta.mes]} />
            </div>

            {proposta.origem_dados === 'manual_word' && (
              <EvidenceBox icon={Stamp} tone="amber" title="Arquivo original anexado" sub={proposta.arquivo_word_url}
                action={<button style={ghostBtn(T.amberText)}><DownloadCloud size={14} /> Baixar .docx</button>} />
            )}
            {proposta.origem_dados === 'sankhya' && (
              <EvidenceBox
                icon={proposta.validado_pelo_engenheiro ? Check : AlertTriangle}
                tone={proposta.validado_pelo_engenheiro ? 'olive' : 'amber'}
                title="Integração Sankhya"
                sub={proposta.validado_pelo_engenheiro ? 'Dados validados pelo engenheiro responsável.' : 'Aguardando validação dos dados importados.'}
                action={canValidateSankhya && (
                  <button onClick={() => onAction(proposta.id, 'validar_sankhya')} style={solidBtn(T.amberText)}>Validar dados</button>
                )}
              />
            )}
          </div>

          <div style={{ flex: '1 1 0', padding: 24, background: T.panelAlt, display: 'flex', flexDirection: 'column' }}>
            <SectionLabel>Fluxo & aprovação</SectionLabel>
            <div style={{ flex: 1, marginTop: 14 }}>
              <Timeline label="Cadastro" done={proposta.status !== 'rascunho'} active date={proposta.data_abertura} />
              <Timeline label="Revisão técnica" active={proposta.status === 'em_revisao_tecnica'} done={['aguardando_aprovacao', 'aprovada', 'concluida'].includes(proposta.status)} rejected={proposta.status === 'reprovada' && !proposta.aprovador_pool} />
              <PoolTimeline status={proposta.status} aprovador={proposta.aprovador_pool} />
              <Timeline label="Concluída" active={proposta.status === 'concluida'} done={proposta.status === 'concluida'} date={proposta.data_conclusao} last />
            </div>

            <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16, marginTop: 8 }}>
              {(canReview || canApprove) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {canApprove ? `Sua decisão como ${usuario.nome} (pool de aprovação)` : 'Sua ação é necessária'}
                  </span>
                  <textarea rows={2} placeholder="Comentário (obrigatório ao reprovar)…" value={comentario} onChange={e => setComentario(e.target.value)}
                    style={{ ...inputStyle(), fontSize: 12.5 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onAction(proposta.id, canReview ? 'reprovar_revisao' : 'reprovar_final', comentario)} style={{ ...ghostBtn(T.rustText), flex: 1, justifyContent: 'center' }}>Reprovar</button>
                    <button onClick={() => onAction(proposta.id, canReview ? 'aprovar_revisao' : 'aprovar_final', comentario)} style={{ ...solidBtn(T.oliveText), flex: 1, justifyContent: 'center' }}>Aprovar</button>
                  </div>
                </div>
              )}
              {canSendToReview && <button onClick={() => onAction(proposta.id, 'enviar_revisao')} style={{ ...solidBtn(T.terracotta, true), width: '100%', justifyContent: 'center' }}>Enviar para revisão técnica</button>}
              {canFinish && <button onClick={() => onAction(proposta.id, 'concluir')} style={{ ...solidBtn(T.ink, true), width: '100%', justifyContent: 'center' }}>Marcar como concluída</button>}
              {!canReview && !canApprove && !canSendToReview && !canFinish && !canValidateSankhya && (
                <p style={{ fontSize: 12, color: T.inkFaint, textAlign: 'center', margin: 0 }}>Nenhuma ação pendente para o seu perfil neste momento.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function PoolTimeline({ status, aprovador }) {
  const isPending = status === 'aguardando_aprovacao';
  const isDone = status === 'aprovada' || status === 'concluida';
  const isRejected = status === 'reprovada' && !!aprovador === false && status === 'reprovada';
  let dot = T.line, ic = T.inkFaint;
  if (isDone) { dot = T.oliveText; ic = '#fff'; }
  else if (isPending) { dot = T.amberText; ic = '#fff'; }

  return (
    <div style={{ display: 'flex', gap: 13, position: 'relative' }}>
      <div style={{ position: 'absolute', left: 10, top: 24, bottom: -6, width: 1.5, background: T.line }} />
      <div style={{ width: 21, height: 21, borderRadius: '50%', background: dot, color: ic, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
        {isDone ? <Check size={12} strokeWidth={3} /> : <Users size={11} />}
      </div>
      <div style={{ paddingBottom: 22, opacity: (!isPending && !isDone) ? 0.45 : 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>Aprovação final</div>
        <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 1 }}>
          {aprovador ? `Decidido por ${aprovador}` : `Pool: ${APROVADORES_POOL.join(', ')}`}
        </div>
      </div>
    </div>
  );
}

function Timeline({ label, active, done, rejected, date, last }) {
  let dot = T.line, ic = T.inkFaint;
  if (done) { dot = T.oliveText; ic = '#fff'; }
  else if (rejected) { dot = T.rustText; ic = '#fff'; }
  else if (active) { dot = T.amberText; ic = '#fff'; }
  return (
    <div style={{ display: 'flex', gap: 13, position: 'relative' }}>
      {!last && <div style={{ position: 'absolute', left: 10, top: 24, bottom: -6, width: 1.5, background: T.line }} />}
      <div style={{ width: 21, height: 21, borderRadius: '50%', background: dot, color: ic, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
        {done ? <Check size={12} strokeWidth={3} /> : rejected ? <X size={12} strokeWidth={3} /> : <CircleDot size={10} />}
      </div>
      <div style={{ paddingBottom: 22, opacity: (!active && !done && !rejected) ? 0.45 : 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: rejected ? T.rustText : T.ink }}>{label}</div>
        {date && <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 1 }}>{fmtData(date)}</div>}
      </div>
    </div>
  );
}

function EvidenceBox({ icon: Icon, tone, title, sub, action }) {
  const colors = { amber: [T.amberText, T.amberSoft], olive: [T.oliveText, T.oliveSoft], rust: [T.rustText, T.rustSoft] };
  const [c, bg] = colors[tone];
  return (
    <div style={{ background: bg, border: `1px solid ${c}33`, borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        <Icon size={19} color={c} style={{ marginTop: 1, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{title}</div>
          <div style={{ fontSize: 11.5, color: T.inkDim, marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

/* ============================================================================
   PRIMITIVES
============================================================================ */
function Overlay({ onClose, children }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, background: 'rgba(33,29,23,.45)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
    }}>{children}</div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${T.lineSoft}`, paddingBottom: 8 }}>{children}</div>;
}

function Detail({ label, value }) {
  return (
    <div>
      <span style={{ display: 'block', fontSize: 11, color: T.inkFaint, marginBottom: 2 }}>{label}</span>
      <span style={{ fontWeight: 600, color: T.ink, textTransform: 'capitalize' }}>{value}</span>
    </div>
  );
}

function inputStyle() {
  return { width: '100%', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6, padding: '9px 11px', color: T.ink, fontSize: 13, outline: 'none' };
}

function solidBtn(color, dark) {
  return { background: color, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 16px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 };
}
function ghostBtn(color) {
  return { background: 'transparent', color, border: `1px solid ${color}55`, borderRadius: 6, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 };
}
