import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { createClient } from '@supabase/supabase-js';
import {
  LayoutGrid, FileStack, ClipboardCheck, Gauge, SlidersHorizontal, Workflow,
  Plus, Search, UploadCloud, AlertTriangle, Clock3, Check, X, LogOut,
  ChevronRight, ChevronDown, Building2, CalendarDays, Link2, DownloadCloud,
  Filter, FileWarning, Stamp, ArrowUpRight, ArrowDownRight, Minus, Zap,
  CircleDot, ShieldCheck, MessageSquareWarning, ListFilter, Webhook, Users,
  RefreshCw, TrendingUp, DollarSign, CheckCircle2, Package, Layers, Bell, BarChart2, Download,
} from 'lucide-react';

/* ============================================================================
   SUPABASE CLIENT — projeto portal-engenharia
============================================================================ */
const SUPABASE_URL = 'https://sieztnpchjjmrwrmrhoa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s_xxUVnOpstaW7p8ngxfXw_OoXDfBXi';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================================
   SUPABASE CLIENT — SGQ / Sistema de Industrialização (projeto separado)
   Lê v_consumo_mp, estoque_mp, remessas e produtos
============================================================================ */
const SUPABASE_SGQ_URL = 'https://mdsxiijlkruqnhbyxbhe.supabase.co';
const SUPABASE_SGQ_KEY = 'sb_publishable_6vD-Jyf4pIJdOpvzXKDCOw_YUcX3TcG';
const supabaseSGQ = createClient(SUPABASE_SGQ_URL, SUPABASE_SGQ_KEY);

/* ============================================================================
   DESIGN TOKENS — identidade Kalenborn, nível diretoria
   Vermelho de marca (Kalenborn red) sobre grafite/branco, com camadas de
   elevação (sombra) para profundidade e hierarquia visual mais sofisticada.
============================================================================ */
const T = {
  bg: '#F6F4F0',
  panel: '#FFFFFF',
  panelAlt: '#FBFAF9',
  line: '#E7E2D8',
  lineSoft: '#F0ECE3',
  ink: '#1C1A17',
  inkDim: '#615A4F',
  inkFaint: '#9A917F',
  terracotta: '#C8261C',
  terracottaSoft: '#FBE6E3',
  terracottaText: '#8A170F',
  terracottaDeep: '#8F1109',
  amber: '#B07F1A',
  amberSoft: '#F8EDD6',
  amberText: '#6E4B0C',
  olive: '#3D7A4A',
  oliveSoft: '#E2F0E4',
  oliveText: '#1F5429',
  rust: '#A23A28',
  rustSoft: '#F5DDD6',
  rustText: '#732012',
  blue: '#2D5F8A',
  blueSoft: '#E1ECF5',
  blueText: '#173F60',
  slate: '#6E665A',
  gold: '#C9971E',
  goldSoft: '#FBF1DA',
};

const FONT_DISPLAY = "'Barlow Condensed', 'Archivo Narrow', sans-serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

// Camadas de elevação — substitui bordas planas por sombra sutil em
// pontos de destaque (cards de KPI, modais, hover de linhas clicáveis).
const SHADOW_SM = '0 1px 2px rgba(28,26,23,.04), 0 1px 1px rgba(28,26,23,.03)';
const SHADOW_MD = '0 2px 8px rgba(28,26,23,.06), 0 1px 3px rgba(28,26,23,.04)';
const SHADOW_LG = '0 8px 24px rgba(28,26,23,.10), 0 2px 6px rgba(28,26,23,.05)';
const SHADOW_XL = '0 24px 64px rgba(28,26,23,.16), 0 4px 12px rgba(28,26,23,.06)';

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
const fmtMoeda = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtMoedaCompacta = (v) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(v);

/* ── Exportação CSV ─────────────────────────────────────────────────────────── */
function exportCSV(rows, filename, colunas) {
  if (!rows?.length) return;
  const cols = colunas || Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(';'), ...rows.map(r => cols.map(c => esc(r[c])).join(';'))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel BR
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function BotaoExportar({ onClick, small }) {
  return (
    <button onClick={onClick} title="Exportar CSV" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6,
      padding: small ? '5px 10px' : '7px 13px', fontSize: 12, fontWeight: 600,
      color: T.inkDim, cursor: 'pointer',
    }}
      onMouseEnter={e => e.currentTarget.style.background = T.lineSoft}
      onMouseLeave={e => e.currentTarget.style.background = T.panelAlt}
    >
      <Download size={13} /> CSV
    </button>
  );
}

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

  const [session, setSession] = useState(undefined); // undefined = carregando, null = sem sessão
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.email) { setCurrentUser(null); return; }
    supabase.from('colaboradores').select('*').eq('email', session.user.email).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCurrentUser({
            id: data.id, nome: data.nome, papel: data.papel,
            email: session.user.email,
            iniciais: data.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          });
        }
      });
  }, [session]);

  if (session === undefined) {
    return <TelaCarregando />;
  }
  if (!session) {
    return <TelaLogin />;
  }
  if (!currentUser) {
    return <TelaCarregando texto="Carregando seu perfil…" />;
  }

  return <PortalConteudo currentUser={currentUser} session={session} />;
}

function TelaCarregando({ texto = 'Carregando…' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: FONT_BODY, color: T.inkFaint, fontSize: 13 }}>
      {texto}
    </div>
  );
}

function PortalConteudo({ currentUser, session }) {
  const [view, setView] = useState('dashboard');
  const [propostas, setPropostas] = useState([]);
  const [propostasLoading, setPropostasLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mesFiltro, setMesFiltro] = useState('JUNHO');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const carregarPropostas = useCallback(async () => {
    setPropostasLoading(true);
    const { data, error } = await supabase.from('v_propostas_completo').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao carregar propostas:', error.message);
      setPropostas([]);
    } else {
      // Normaliza nomes de campo para o formato que o resto da tela espera
      // (responsavel/aprovador_pool como string, não UUID).
      setPropostas((data || []).map(p => ({
        ...p,
        responsavel: p.responsavel_nome,
        aprovador_pool: p.aprovador_pool_nome,
      })));
    }
    setPropostasLoading(false);
  }, []);

  useEffect(() => { carregarPropostas(); }, [carregarPropostas]);

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

  const handleAcaoFluxo = async (propostaId, acao, comentario = '') => {
    const agora = new Date().toISOString().slice(0, 10);
    const update = {};

    switch (acao) {
      case 'enviar_revisao': update.status = 'em_revisao_tecnica'; break;
      case 'aprovar_revisao': update.status = 'aguardando_aprovacao'; break;
      case 'reprovar_revisao': update.status = 'reprovada'; update.comentario_decisao = comentario; break;
      case 'aprovar_final': {
        const aprovador = USUARIOS.find(u => u.nome === currentUser.nome);
        update.status = 'aprovada';
        update.data_decisao_final = agora;
        update.comentario_decisao = comentario;
        // Resolve o UUID do aprovador a partir da tabela colaboradores real.
        const { data: colab } = await supabase.from('colaboradores').select('id').eq('nome', currentUser.nome).maybeSingle();
        if (colab) update.aprovador_pool_id = colab.id;
        break;
      }
      case 'reprovar_final': update.status = 'reprovada'; update.comentario_decisao = comentario; break;
      case 'concluir': update.status = 'concluida'; update.data_conclusao = agora; break;
      case 'validar_sankhya': update.validado_pelo_engenheiro = true; break;
      default: return;
    }

    const { error } = await supabase.from('propostas').update(update).eq('id', propostaId);
    if (error) {
      console.error('Erro ao atualizar proposta:', error.message);
      return;
    }
    await carregarPropostas();
    // Atualiza o "selected" (modal aberto) com os dados recém-recarregados.
    const { data: atualizado } = await supabase.from('v_propostas_completo').select('*').eq('id', propostaId).maybeSingle();
    if (atualizado) setSelected({ ...atualizado, responsavel: atualizado.responsavel_nome, aprovador_pool: atualizado.aprovador_pool_nome });
  };

  return (
    <div style={{ fontFamily: FONT_BODY, background: T.bg, color: T.ink, height: '100vh', display: 'flex', overflow: 'hidden' }}>
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

        /* Responsividade: grids colapsam via auto-fit */
        .grid-kpis-5 { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
        .grid-kpis-7 { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 10px; }
        .grid-kpis-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
        .grid-2col   { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
        .grid-2col-wide { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
        .grid-3col   { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }

        /* Todas as tabelas têm scroll horizontal automático */
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        @media (max-width: 768px) {
          main { padding: 14px 12px !important; }
          .grid-kpis-5, .grid-kpis-7 { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
          .grid-2col-wide { grid-template-columns: 1fr; }
          table { font-size: 11px; }
          .hide-mobile { display: none !important; }
        }

        /* Sidebar: desktop expandida, mobile ícones */
        .sidebar-responsive { width: 248px; flex-shrink: 0; }
        @media (max-width: 900px) {
          .sidebar-responsive { width: 60px; }
          .sidebar-brand-text, .sidebar-item-label { display: none; }
          .sidebar-header { padding: 16px 10px !important; justify-content: center; }
          .sidebar-item { justify-content: center !important; padding: 12px 8px !important; }
          .topbar-user-text { display: none; }
        }
      `}</style>

      <Sidebar view={view} setView={setView} pendCount={pendencias.length} papel={currentUser.papel} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar
          view={view} mesFiltro={mesFiltro} setMesFiltro={setMesFiltro}
          currentUser={currentUser}
          userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen}
          userEmail={currentUser.email}
          onNova={() => setModal('nova')}
          onTrocarSenha={() => setModal('trocarSenha')}
        />

        <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
          {view === 'dashboard' && <Dashboard stats={stats} propostas={propostasMes} todasPropostas={propostas} mesFiltro={mesFiltro} onNovaProposta={() => setModal('nova')} onNavigate={setView} />}
          {view === 'propostas' && (
            <PropostasTable propostas={propostas} titulo="Todas as propostas" onRowClick={p => { setSelected(p); setModal('detalhe'); }} />
          )}
          {view === 'pendencias' && (
            <PropostasTable propostas={pendencias} titulo="Aguardando sua ação" empty="Nenhuma pendência — tudo em dia." onRowClick={p => { setSelected(p); setModal('detalhe'); }} />
          )}
          {view === 'metricas' && <Metricas propostas={propostas} />}
          {view === 'produtividade' && <Produtividade propostas={propostas} mesFiltro={mesFiltro} />}
          {view === 'faturamento' && <Faturamento />}
          {view === 'consumo_mp' && <TabErrorBoundary tab="Consumo de MP"><ConsumoMP /></TabErrorBoundary>}
          {view === 'almoxarifado' && <TabErrorBoundary tab="Almoxarifado"><Almoxarifado /></TabErrorBoundary>}
          {view === 'pedidosvale' && <PedidosVale />}
          {view === 'integracao' && <Integracao />}
          {view === 'admin' && <Admin />}
        </main>
      </div>

      {modal === 'detalhe' && selected && (
        <ModalDetalhe proposta={selected} usuario={currentUser} onClose={() => { setModal(null); setSelected(null); }} onAction={handleAcaoFluxo} />
      )}
      {modal === 'nova' && (
        <ModalNovaProposta currentUser={currentUser} onClose={() => setModal(null)} onCreated={async () => { setModal(null); await carregarPropostas(); }} />
      )}
      {modal === 'trocarSenha' && (
        <ModalTrocarSenha onClose={() => setModal(null)} />
      )}
    </div>
  );
}

/* ============================================================================
   SIDEBAR
============================================================================ */
function Sidebar({ view, setView, pendCount, papel }) {
  const items = [
    { id: 'dashboard',    label: 'Visão geral',           icon: LayoutGrid },
    { id: 'pendencias',   label: 'Minhas pendências',      icon: ClipboardCheck, badge: pendCount },
    { id: 'propostas',    label: 'Todas as propostas',     icon: FileStack },
    { id: 'metricas',     label: 'Métricas',               icon: BarChart2 },
    { id: 'produtividade',label: 'Produtividade',          icon: Gauge },
    { id: 'faturamento',  label: 'Faturamento (Sankhya)',  icon: DollarSign },
    { id: 'consumo_mp',   label: 'Consumo de MP',          icon: Layers },
    { id: 'almoxarifado', label: 'Almoxarifado',           icon: Package },
    { id: 'pedidosvale',  label: 'Pedidos Vale',           icon: FileWarning },
    { id: 'integracao',   label: 'Integrações',            icon: Workflow },
  ];
  return (
    <div className="sidebar-responsive" style={{ background: T.panel, borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '1px 0 0 rgba(28,26,23,.02), 2px 0 8px rgba(28,26,23,.03)' }}>
      <div className="sidebar-header" style={{ padding: '24px 22px 22px', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.terracotta} 0%, ${T.terracottaDeep} 100%)`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0,
            boxShadow: '0 2px 6px rgba(143,17,9,.35)',
          }}>K</div>
          <div className="sidebar-brand-text">
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: '0.01em', color: T.ink }}>KALENBORN</div>
            <div style={{ fontSize: 10.5, color: T.inkFaint, letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 2, fontWeight: 600 }}>Engenharia · Orçamentos</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const active = view === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setView(it.id)} className="focus-ring sidebar-item" title={it.label}
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
                <Icon size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span className="sidebar-item-label" style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{it.label}</span>
              </span>
              {!!it.badge && (
                <span className="sidebar-item-label" style={{ background: T.terracotta, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}

        {papel === 'gestor' && (
          <button onClick={() => setView('admin')} className="focus-ring sidebar-item" title="Administração"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6,
              border: 'none', textAlign: 'left', background: view === 'admin' ? T.terracottaSoft : 'transparent',
              color: view === 'admin' ? T.terracottaText : T.inkDim, marginTop: 8, borderTop: `1px solid ${T.lineSoft}`, paddingTop: 18,
            }}>
            <SlidersHorizontal size={17} style={{ flexShrink: 0 }} />
            <span className="sidebar-item-label" style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap' }}>Administração</span>
          </button>
        )}
      </nav>

      <div className="sidebar-item-label" style={{ padding: 16, borderTop: `1px solid ${T.line}` }}>
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
  metricas: 'Métricas da equipe',
  produtividade: 'Produtividade da equipe', faturamento: 'Faturamento (Sankhya)',
  consumo_mp: 'Consumo de Matéria-Prima — SGQ',
  almoxarifado: 'Almoxarifado — Estoque & Movimentação',
  pedidosvale: 'Pedidos Vale', integracao: 'Integrações', admin: 'Administração',
};

function Topbar({ view, mesFiltro, setMesFiltro, currentUser, userEmail, userMenuOpen, setUserMenuOpen, onNova, onTrocarSenha }) {
  const fazerLogout = async () => { await supabase.auth.signOut(); };

  return (
    <header className="topbar-responsive" style={{
      minHeight: 64, background: T.panel, borderBottom: `1px solid ${T.line}`, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', padding: '10px 28px', flexShrink: 0, flexWrap: 'wrap', gap: 10,
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {currentUser.papel === 'engenheiro' && (
          <button onClick={onNova} className="focus-ring" style={{
            display: 'flex', alignItems: 'center', gap: 7, background: T.terracotta, color: '#fff', border: 'none',
            borderRadius: 6, padding: '9px 16px', fontSize: 13, fontWeight: 600,
          }}>
            <Plus size={15} /> Nova proposta
          </button>
        )}
        <NotificacoesButton userEmail={userEmail} />

        <div style={{ position: 'relative' }}>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="focus-ring" style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none',
            borderLeft: `1px solid ${T.line}`, paddingLeft: 16,
          }}>
            <div className="topbar-user-text" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{currentUser.nome}</div>
              <div style={{ fontSize: 11, color: T.inkFaint, textTransform: 'capitalize' }}>{currentUser.papel.replace(/_/g, ' ')}</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: T.terracottaSoft, color: T.terracottaText,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>{currentUser.iniciais}</div>
          </button>

          {userMenuOpen && (
            <div className="scale-in" style={{
              position: 'absolute', right: 0, top: 48, background: T.panel, border: `1px solid ${T.line}`,
              borderRadius: 10, width: 230, boxShadow: SHADOW_LG, zIndex: 30, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{currentUser.nome}</div>
                <div style={{ fontSize: 11, color: T.inkFaint, textTransform: 'capitalize', marginTop: 1 }}>{currentUser.papel.replace(/_/g, ' ')}</div>
              </div>
              <button onClick={() => { onTrocarSenha(); setUserMenuOpen(false); }} style={{
                width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px',
                background: 'transparent', border: 'none', color: T.ink, fontSize: 13, fontWeight: 500,
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <SlidersHorizontal size={14} color={T.inkFaint} /> Alterar senha
              </button>
              <button onClick={fazerLogout} style={{
                width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px',
                background: 'transparent', border: 'none', color: T.rustText, fontSize: 13, fontWeight: 500, borderTop: `1px solid ${T.lineSoft}`,
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.rustSoft}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   DASHBOARD — v2 · produtividade + pedidos Sankhya + registro manual
============================================================================ */
function Dashboard({ stats, propostas, todasPropostas, mesFiltro, onNovaProposta, onNavigate }) {
  /* ── dados derivados das propostas ── */
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

  const manuaisAbertas = useMemo(() => propostas.filter(p => p.origem_dados === 'manual_word' && p.status !== 'concluida'), [propostas]);

  /* ── dados de produtividade do Sankhya — sempre o sync mais recente ── */
  const [prodPedidos, setProdPedidos] = useState([]);
  const [prodOrc, setProdOrc] = useState([]);
  const [prodPeriodo, setProdPeriodo] = useState(null); // { data_ini, data_fim }
  const [prodLoading, setProdLoading] = useState(true);

  useEffect(() => {
    // Passo 1: descobre qual foi o último período sincronizado consultando a
    // própria tabela (data_fim mais recente). Assim evita somar syncs distintos.
    setProdLoading(true);
    supabase
      .from('produtividade_orcamentos')
      .select('data_ini, data_fim')
      .order('data_fim', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data: latest }) => {
        if (!latest) {
          // Tenta fallback na tabela de pedidos
          return supabase
            .from('produtividade_pedidos')
            .select('data_ini, data_fim')
            .order('data_fim', { ascending: false })
            .limit(1)
            .maybeSingle()
            .then(({ data }) => data);
        }
        return latest;
      })
      .then(async (periodo) => {
        if (!periodo) {
          setProdPedidos([]);
          setProdOrc([]);
          setProdPeriodo(null);
          setProdLoading(false);
          return;
        }
        // Passo 2: usa eq exato no período encontrado — evita somar syncs diferentes
        const [r1, r2] = await Promise.all([
          supabase.from('produtividade_pedidos').select('*')
            .eq('data_ini', periodo.data_ini).eq('data_fim', periodo.data_fim)
            .order('total_pedidos', { ascending: false }),
          supabase.from('produtividade_orcamentos').select('*')
            .eq('data_ini', periodo.data_ini).eq('data_fim', periodo.data_fim)
            .order('total_geral', { ascending: false }),
        ]);
        setProdPedidos(r1.data || []);
        setProdOrc(r2.data || []);
        setProdPeriodo(periodo);
        setProdLoading(false);
      });
  }, []); // roda uma vez — produtividade é independente do mesFiltro de propostas

  const totalPedidosSankhya = prodPedidos.reduce((s, p) => s + (p.total_pedidos || 0), 0);
  const valorPedidosSankhya = prodPedidos.reduce((s, p) => s + (Number(p.valor_total) || 0), 0);
  const totalOrcSankhya = prodOrc.reduce((s, o) => s + (o.total_geral || 0), 0);

  const maxEscopo = Math.max(...porEscopo.map(([, v]) => v), 1);
  const maxMensal = Math.max(...evolucaoMensal.map(m => m.count), 1);
  const maxProd = Math.max(...prodOrc.map(o => o.total_geral || 0), ...prodPedidos.map(p => p.total_pedidos || 0), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1400 }}>

      {/* ── BANNER: propostas manuais sem registro formal ── */}
      {manuaisAbertas.length > 0 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          background: T.amberSoft, border: `1px solid ${T.amber}44`, borderRadius: 10, padding: '13px 18px',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <FileWarning size={17} color={T.amberText} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: T.ink }}>
              <strong style={{ color: T.amberText }}>{manuaisAbertas.length} proposta{manuaisAbertas.length > 1 ? 's' : ''} manual{manuaisAbertas.length > 1 ? 'is' : ''}</strong>{' '}
              (Word/e-mail) em aberto — registre no portal para manter o controle atualizado.
            </span>
          </div>
          <button onClick={onNovaProposta} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, background: T.amberText, color: '#fff',
            border: 'none', borderRadius: 6, padding: '8px 15px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            <Plus size={14} /> Registrar proposta
          </button>
        </div>
      )}

      {/* ── KPI ROW (7 cards) ── */}
      <div className="grid-kpis-7">
        <Kpi label="Propostas no mês" value={stats.total} icon={FileStack} />
        <Kpi label="Em andamento" value={stats.ativas} icon={Clock3} tone="amber" />
        <Kpi label="Em atraso" value={stats.atrasadas} icon={AlertTriangle} tone="rust" />
        <Kpi label="Valor em fluxo" value={fmtMoedaCompacta(stats.valorMes)} icon={DollarSign} />
        <Kpi
          label="Pedidos confirmados"
          value={prodLoading ? '…' : totalPedidosSankhya}
          icon={CheckCircle2} tone="olive"
          sub={prodLoading || totalPedidosSankhya === 0 ? null : fmtMoedaCompacta(valorPedidosSankhya)}
        />
        <Kpi
          label="Orçamentos gerados"
          value={prodLoading ? '…' : totalOrcSankhya}
          icon={TrendingUp} tone="blue"
          sub={prodLoading ? null : 'via Sankhya'}
        />
        <OrigemCard percWord={stats.percWord} wordCount={stats.wordCount} sankhyaCount={stats.sankhyaCount} />
      </div>

      {/* ── ROW 2: Volume mensal + Produtividade da equipe ── */}
      <div className="grid-2col-wide">
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

        <Panel
          title="Produtividade da equipe"
          subtitle={
            prodLoading ? 'Carregando…'
            : prodPeriodo ? `Último sync: ${fmtData(prodPeriodo.data_ini)} → ${fmtData(prodPeriodo.data_fim)}`
            : 'Sem dados sincronizados'
          }
          right={
            <button onClick={() => onNavigate('produtividade')} style={{
              display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 600,
              color: T.blueText, background: T.blueSoft, border: 'none', borderRadius: 5, padding: '4px 9px',
            }}>
              Ver tudo <ArrowUpRight size={12} />
            </button>
          }
        >
          {prodLoading ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
          ) : prodOrc.length === 0 && prodPedidos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: T.inkFaint, fontSize: 12.5 }}>
              Sem dados — sincronize na aba <strong>Produtividade</strong>.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 6 }}>
              {prodOrc.length > 0 && (
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: T.blueText, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Orçamentistas — propostas
                  </div>
                  {prodOrc.slice(0, 4).map(o => (
                    <div key={o.orcamentista_nome} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.blueSoft, color: T.blueText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {(o.orcamentista_nome || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 12.5, width: 100, color: T.ink, fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.orcamentista_nome}</span>
                      <div style={{ flex: 1, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${((o.total_geral || 0) / maxProd) * 100}%`, height: '100%', background: T.blue, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.blueText, fontFamily: FONT_DISPLAY, width: 22, textAlign: 'right' }}>{o.total_geral}</span>
                    </div>
                  ))}
                </div>
              )}
              {prodPedidos.length > 0 && (
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: T.oliveText, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Vendedores — pedidos confirmados
                  </div>
                  {prodPedidos.slice(0, 4).map(p => (
                    <div key={p.vendedor_nome} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.oliveSoft, color: T.oliveText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {(p.vendedor_nome || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 12.5, width: 100, color: T.ink, fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.vendedor_nome}</span>
                      <div style={{ flex: 1, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${((p.total_pedidos || 0) / maxProd) * 100}%`, height: '100%', background: T.olive, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.oliveText, fontFamily: FONT_DISPLAY, width: 22, textAlign: 'right' }}>{p.total_pedidos}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* ── ROW 3: Status fluxo + Escopo + Aprovadores ── */}
      <div className="grid-3col">
        <Panel title="Status do fluxo" subtitle="Propostas do mês selecionado, por etapa">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140, padding: '8px 4px 0' }}>
            {porStatus.map(([status, count]) => {
              const meta = STATUS_META[status];
              const max = Math.max(...porStatus.map(([, v]) => v), 1);
              const h = Math.max((count / max) * 100, count > 0 ? 8 : 2);
              return (
                <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: meta.bg === T.ink ? T.ink : meta.color, fontFamily: FONT_DISPLAY }}>{count}</div>
                  <div style={{ width: '100%', maxWidth: 36, height: h, background: meta.bg === T.ink ? T.ink : meta.color, borderRadius: '3px 3px 0 0', transition: 'height .4s ease' }} />
                  <div style={{ fontSize: 9.5, color: T.inkFaint, marginTop: 8, textAlign: 'center', lineHeight: 1.3 }}>{meta.label}</div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Volume por escopo" subtitle="Itens cadastrados no mês selecionado">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {porEscopo.map(([escopo, count]) => (
              <div key={escopo} style={{ display: 'flex', alignItems: 'center', fontSize: 12, gap: 10 }}>
                <span style={{ width: 120, color: T.inkDim, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11.5 }} title={escopo}>{escopo}</span>
                <div style={{ flex: 1, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(count / maxEscopo) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 3 }} />
                </div>
                <span style={{ width: 20, textAlign: 'right', fontWeight: 700, color: T.ink, fontFamily: FONT_DISPLAY, fontSize: 13 }}>{count}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Aprovações por pessoa" subtitle="Pool fixo — qualquer um decide" right={
          <span style={{ fontSize: 10.5, color: T.inkFaint, display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {APROVADORES_POOL.length}</span>
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {porAprovador.map(([nome, count]) => {
              const maxA = Math.max(...porAprovador.map(([, v]) => v), 1);
              return (
                <div key={nome} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.terracottaSoft, color: T.terracottaText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span style={{ fontSize: 12.5, width: 80, color: T.ink, fontWeight: 500 }}>{nome}</span>
                  <div style={{ flex: 1, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxA) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 3 }} />
                  </div>
                  <span style={{ width: 18, textAlign: 'right', fontWeight: 700, fontFamily: FONT_DISPLAY }}>{count}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ── ROW 4: Origem detalhada + CTA registro manual ── */}
      <div className="grid-2col">
        <Panel title="Propostas: Manual vs ERP" subtitle="Origem dos dados cadastrados no mês">
          <div style={{ display: 'flex', gap: 20, marginTop: 10, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {[
                { label: 'ERP Sankhya', count: stats.sankhyaCount, color: T.blue, bg: T.blueSoft, pct: 100 - stats.percWord },
                { label: 'Word / E-mail', count: stats.wordCount, color: T.amberText, bg: T.amberSoft, pct: stats.percWord },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: row.color }}>{row.count}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, marginBottom: 4 }}>{row.label}</div>
                    <div style={{ background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${row.pct}%`, height: '100%', background: row.color, borderRadius: 3, transition: 'width .5s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: row.color, fontFamily: FONT_DISPLAY }}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          {stats.wordCount > 0 && (
            <div style={{ borderTop: `1px solid ${T.lineSoft}`, paddingTop: 12, marginTop: 4 }}>
              <p style={{ fontSize: 11.5, color: T.inkFaint, margin: 0 }}>
                {stats.wordCount} proposta{stats.wordCount > 1 ? 's' : ''} fora do ERP — registre no portal para rastreamento completo.
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Registrar proposta manual" subtitle="Propostas feitas por Word ou e-mail que ainda não estão no ERP">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Abertas', value: manuaisAbertas.length, color: T.amberText, bg: T.amberSoft },
                { label: 'Concluídas', value: stats.wordCount - manuaisAbertas.length, color: T.oliveText, bg: T.oliveSoft },
              ].map(card => (
                <div key={card.label} style={{ background: card.bg, borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: card.color }}>{Math.max(card.value, 0)}</div>
                  <div style={{ fontSize: 11, color: card.color, fontWeight: 600, marginTop: 2 }}>{card.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: T.inkFaint, margin: 0, lineHeight: 1.6 }}>
              Cada proposta registrada aqui entra no fluxo de revisão técnica → aprovação → conclusão, garantindo rastreabilidade mesmo fora do Sankhya.
            </p>
            <button onClick={onNovaProposta} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: T.terracotta, color: '#fff', border: 'none', borderRadius: 7,
              padding: '11px 18px', fontSize: 13.5, fontWeight: 700, width: '100%',
            }}>
              <Plus size={15} /> Nova proposta manual
            </button>
          </div>
        </Panel>
      </div>

      {/* ── Alerta de atraso ── */}
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

function Kpi({ label, value, icon: Icon, tone, sub }) {
  const toneColor = tone === 'amber' ? T.amberText : tone === 'rust' ? T.rustText : tone === 'olive' ? T.oliveText : tone === 'blue' ? T.blueText : T.ink;
  const toneSoft = tone === 'amber' ? T.amberSoft : tone === 'rust' ? T.rustSoft : tone === 'olive' ? T.oliveSoft : tone === 'blue' ? T.blueSoft : T.terracottaSoft;
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: '18px 20px',
      boxShadow: SHADOW_SM, transition: 'box-shadow .2s, transform .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_MD; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_SM; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11.5, color: T.inkFaint, fontWeight: 600, letterSpacing: '0.01em' }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: toneSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color={toneColor} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: toneColor, marginTop: 14, fontSize: 28, letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function OrigemCard({ percWord, wordCount, sankhyaCount }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: '18px 20px', boxShadow: SHADOW_SM }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11.5, color: T.inkFaint, fontWeight: 600 }}>Origem dos dados</span>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.terracottaSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileWarning size={14} color={T.terracotta} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: T.terracotta, marginTop: 14, letterSpacing: '-0.01em' }}>{percWord}%</div>
      <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>fora do Sankhya (Word/e-mail)</div>
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 12 }}>
        <div style={{ width: `${percWord}%`, background: T.terracotta }} />
        <div style={{ width: `${100 - percWord}%`, background: T.lineSoft }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.inkFaint, marginTop: 7 }}>
        <span>{wordCount} manual</span><span>{sankhyaCount} ERP</span>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children, right }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 22, boxShadow: SHADOW_SM }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: title ? 16 : 0 }}>
        <div>
          {title && <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: T.ink, letterSpacing: '-0.005em' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '4px 0 0', lineHeight: 1.5 }}>{subtitle}</p>}
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
          <BotaoExportar small onClick={() => exportCSV(filtradas, `${titulo.toLowerCase().replace(/ /g,'_')}.csv`, ['br','cliente','escopo','origem_dados','data_entrega_prevista','valor_liquido','status','mes','responsavel'])} />
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
   NOTIFICAÇÕES IN-APP
============================================================================ */
function NotificacoesButton({ userEmail }) {
  const [aberto, setAberto] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    const { data } = await supabase.from('notificacoes')
      .select('*').eq('email', userEmail)
      .order('created_at', { ascending: false }).limit(20);
    setNotifs(data || []);
    setLoading(false);
  }, [userEmail]);

  useEffect(() => { carregar(); }, [carregar]);
  // polling a cada 45s
  useEffect(() => {
    const t = setInterval(carregar, 45000);
    return () => clearInterval(t);
  }, [carregar]);

  const naoLidas = notifs.filter(n => !n.lida).length;

  const marcarLida = async (id) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const marcarTodasLidas = async () => {
    await supabase.from('notificacoes').update({ lida: true }).eq('email', userEmail).eq('lida', false);
    setNotifs(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const tipoIcon = (tipo) => {
    const map = { aprovada: ['✓', T.oliveText, T.oliveSoft], reprovada: ['✗', T.rustText, T.rustSoft], revisao: ['⟳', T.amberText, T.amberSoft], aprovacao: ['⏳', T.blueText, T.blueSoft], concluida: ['★', T.ink, T.lineSoft] };
    return map[tipo] || ['•', T.inkFaint, T.lineSoft];
  };

  const fmtTempo = (iso) => {
    const diff = Math.round((Date.now() - new Date(iso)) / 60000);
    if (diff < 1) return 'agora';
    if (diff < 60) return `${diff}min`;
    if (diff < 1440) return `${Math.round(diff / 60)}h`;
    return `${Math.round(diff / 1440)}d`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => { setAberto(a => !a); if (!aberto) carregar(); }}
        style={{ position: 'relative', background: 'transparent', border: 'none', padding: 6, cursor: 'pointer', color: T.inkDim, display: 'flex', alignItems: 'center' }}
      >
        <Bell size={20} color={naoLidas > 0 ? T.terracotta : T.inkFaint} />
        {naoLidas > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: T.terracotta, color: '#fff', borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="scale-in" style={{
          position: 'absolute', right: 0, top: 42, width: 340, background: T.panel,
          border: `1px solid ${T.line}`, borderRadius: 12, boxShadow: SHADOW_LG, zIndex: 9998, overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Notificações</span>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas} style={{ fontSize: 11, color: T.blueText, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Marcar todas como lidas</button>
            )}
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: T.inkFaint, fontSize: 13 }}>Carregando…</div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: T.inkFaint, fontSize: 13 }}>Nenhuma notificação ainda.</div>
            ) : notifs.map(n => {
              const [ic, cor, bg] = tipoIcon(n.tipo);
              return (
                <div key={n.id} onClick={() => marcarLida(n.id)} style={{
                  display: 'flex', gap: 12, padding: '12px 16px', cursor: 'pointer',
                  background: n.lida ? 'transparent' : `${bg}88`,
                  borderBottom: `1px solid ${T.lineSoft}`,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = n.lida ? 'transparent' : `${bg}88`}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, color: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{ic}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: n.lida ? 500 : 700, color: T.ink, marginBottom: 2 }}>{n.titulo}</div>
                    {n.mensagem && <div style={{ fontSize: 11.5, color: T.inkDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.mensagem}</div>}
                  </div>
                  <span style={{ fontSize: 10.5, color: T.inkFaint, whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtTempo(n.created_at)}</span>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, textAlign: 'right' }}>
            <button onClick={() => setAberto(false)} style={{ fontSize: 12, color: T.inkFaint, background: 'none', border: 'none', cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   MÉTRICAS — funil, ciclo, taxa de conclusão, ranking responsáveis
============================================================================ */
function Metricas({ propostas }) {
  const [periodo, setPeriodo] = useState('90'); // dias

  const base = useMemo(() => {
    const corte = new Date();
    corte.setDate(corte.getDate() - Number(periodo));
    return periodo === 'tudo' ? propostas : propostas.filter(p => new Date(p.data_abertura) >= corte);
  }, [propostas, periodo]);

  const funil = useMemo(() => {
    const total = base.length;
    const revisadas  = base.filter(p => ['em_revisao_tecnica','aguardando_aprovacao','aprovada','concluida','reprovada'].includes(p.status)).length;
    const aprovadas  = base.filter(p => ['aprovada','concluida'].includes(p.status)).length;
    const concluidas = base.filter(p => p.status === 'concluida').length;
    const reprovadas = base.filter(p => p.status === 'reprovada').length;
    return [
      { label: 'Cadastradas',   n: total,      pct: 100 },
      { label: 'Em revisão +',  n: revisadas,  pct: total ? Math.round(revisadas  / total * 100) : 0 },
      { label: 'Aprovadas +',   n: aprovadas,  pct: total ? Math.round(aprovadas  / total * 100) : 0 },
      { label: 'Concluídas',    n: concluidas, pct: total ? Math.round(concluidas / total * 100) : 0 },
      { label: 'Reprovadas',    n: reprovadas, pct: total ? Math.round(reprovadas / total * 100) : 0, cor: T.rustText },
    ];
  }, [base]);

  const ciclo = useMemo(() => {
    const concl = base.filter(p => p.status === 'concluida' && p.data_abertura && p.data_conclusao);
    if (!concl.length) return null;
    const dias = concl.map(p => Math.round((new Date(p.data_conclusao) - new Date(p.data_abertura)) / 86400000));
    const avg = Math.round(dias.reduce((s, d) => s + d, 0) / dias.length);
    return { avg, min: Math.min(...dias), max: Math.max(...dias), total: concl.length };
  }, [base]);

  const ranking = useMemo(() => {
    const map = {};
    base.forEach(p => {
      const r = p.responsavel || p.responsavel_nome || '—';
      if (!map[r]) map[r] = { nome: r, total: 0, concluidas: 0, reprovadas: 0 };
      map[r].total++;
      if (p.status === 'concluida') map[r].concluidas++;
      if (p.status === 'reprovada') map[r].reprovadas++;
    });
    return Object.values(map).sort((a, b) => b.concluidas - a.concluidas).slice(0, 8);
  }, [base]);

  const mensal = useMemo(() => {
    return MESES_ORDEM.map(mes => ({
      mes,
      total: propostas.filter(p => p.mes === mes).length,
      concluidas: propostas.filter(p => p.mes === mes && p.status === 'concluida').length,
    }));
  }, [propostas]);

  const maxMensal = Math.max(...mensal.map(m => m.total), 1);
  const maxRanking = Math.max(...ranking.map(r => r.total), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1200 }}>

      {/* Filtro período */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[['30','30 dias'],['90','90 dias'],['180','6 meses'],['tudo','Tudo']].map(([v, l]) => (
          <button key={v} onClick={() => setPeriodo(v)} style={{
            padding: '6px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
            background: periodo === v ? T.terracotta : T.panelAlt,
            color: periodo === v ? '#fff' : T.inkDim,
          }}>{l}</button>
        ))}
        <span style={{ fontSize: 12, color: T.inkFaint, alignSelf: 'center', marginLeft: 4 }}>{base.length} propostas no período</span>
      </div>

      <div className="grid-2col">
        {/* Funil */}
        <Panel title="Funil de propostas" subtitle="Quantas passam por cada etapa">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {funil.map((f, i) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 100, fontSize: 12, color: T.inkDim, fontWeight: 500 }}>{f.label}</span>
                <div style={{ flex: 1, background: T.lineSoft, height: 22, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${f.pct}%`, height: '100%', background: f.cor || (i === 0 ? T.terracotta : i < 4 ? T.olive : T.rust), borderRadius: 4, transition: 'width .5s ease' }} />
                  <span style={{ position: 'absolute', left: 8, top: 4, fontSize: 11, fontWeight: 700, color: f.pct > 20 ? '#fff' : (f.cor || T.ink) }}>
                    {f.n} · {f.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Ciclo + KPIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ciclo ? (
            <Panel title="Tempo de ciclo" subtitle="Do cadastro à conclusão — propostas concluídas">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 10 }}>
                {[
                  { label: 'Média', value: `${ciclo.avg}d`, color: T.ink },
                  { label: 'Mais rápida', value: `${ciclo.min}d`, color: T.oliveText },
                  { label: 'Mais lenta', value: `${ciclo.max}d`, color: T.rustText },
                ].map(k => (
                  <div key={k.label} style={{ background: T.panelAlt, borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10.5, color: T.inkFaint, fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 12 }}>Base: {ciclo.total} propostas concluídas no período</div>
            </Panel>
          ) : (
            <Panel title="Tempo de ciclo"><p style={{ fontSize: 13, color: T.inkFaint, margin: '10px 0 0' }}>Sem propostas concluídas no período.</p></Panel>
          )}

          <Panel title="Taxa de conversão" subtitle="No período selecionado">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              {[
                { label: 'Conclusão', pct: base.length ? Math.round(base.filter(p=>p.status==='concluida').length/base.length*100) : 0, cor: T.oliveText, bg: T.oliveSoft },
                { label: 'Reprovação', pct: base.length ? Math.round(base.filter(p=>p.status==='reprovada').length/base.length*100) : 0, cor: T.rustText, bg: T.rustSoft },
              ].map(k => (
                <div key={k.label} style={{ background: k.bg, borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: k.cor }}>{k.pct}%</div>
                  <div style={{ fontSize: 11.5, color: k.cor, fontWeight: 600, marginTop: 2 }}>{k.label}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Evolução mensal */}
      <Panel title="Evolução mensal — Jan a Jun" subtitle="Cadastradas vs Concluídas">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 140, padding: '10px 4px 0', overflowX: 'auto' }}>
          {mensal.map(m => {
            const hT = Math.max((m.total / maxMensal) * 100, m.total > 0 ? 4 : 2);
            const hC = Math.max((m.concluidas / maxMensal) * 100, m.concluidas > 0 ? 4 : 2);
            return (
              <div key={m.mes} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 60 }}>
                <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 4 }}>{m.concluidas}/{m.total}</div>
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  <div style={{ width: 16, height: hT, background: T.line, borderRadius: '2px 2px 0 0' }} />
                  <div style={{ width: 16, height: hC, background: T.terracotta, borderRadius: '2px 2px 0 0' }} />
                </div>
                <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 6 }}>{MESES_LABEL[m.mes]}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: T.inkFaint }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.line, borderRadius: 2, marginRight: 4 }} />Cadastradas</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.terracotta, borderRadius: 2, marginRight: 4 }} />Concluídas</span>
        </div>
      </Panel>

      {/* Ranking responsáveis */}
      <Panel title="Ranking por responsável" subtitle="Total de propostas · concluídas · reprovadas no período"
        right={<BotaoExportar onClick={() => exportCSV(ranking, 'ranking_responsaveis.csv', ['nome','total','concluidas','reprovadas'])} small />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {ranking.map((r, i) => (
            <div key={r.nome} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 18, textAlign: 'right', fontSize: 11, color: T.inkFaint, fontFamily: FONT_DISPLAY }}>#{i + 1}</span>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.terracottaSoft, color: T.terracottaText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {r.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <span style={{ width: 110, fontSize: 13, color: T.ink, fontWeight: 500 }}>{r.nome}</span>
              <div style={{ flex: 1, background: T.lineSoft, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(r.total / maxRanking) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12, fontFamily: FONT_DISPLAY }}>
                <span style={{ color: T.ink, fontWeight: 700 }}>{r.total}</span>
                <span style={{ color: T.oliveText }}>✓{r.concluidas}</span>
                <span style={{ color: T.rustText }}>✗{r.reprovadas}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ============================================================================
   TAB ERROR BOUNDARY — captura erros de render nas abas SGQ e exibe
   a mensagem em vez de deixar a tela toda branca.
   Error boundaries precisam ser class components em React.
============================================================================ */
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || String(this.state.error);
      return (
        <div style={{ padding: 32, maxWidth: 680, fontFamily: FONT_BODY }}>
          <div style={{ background: '#FBE6E3', border: '1px solid #C8261C44', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#8A170F', marginBottom: 8 }}>
              Erro ao renderizar aba "{this.props.tab}"
            </div>
            <div style={{ fontSize: 12.5, color: '#615A4F', marginBottom: 14, lineHeight: 1.6 }}>
              Copie a mensagem abaixo e envie para o Asael para diagnóstico:
            </div>
            <pre style={{
              background: '#1C1A17', color: '#E8E4DA', padding: '12px 16px', borderRadius: 8,
              fontSize: 12, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0,
            }}>{msg}</pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ marginTop: 14, background: '#C8261C', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
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
  const [netMensal, setNetMensal] = useState([]);
  const [notaVenda, setNotaVenda] = useState([]);
  const [porKaleng, setPorKaleng] = useState([]);
  const [porSegmento, setPorSegmento] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [consumoMaterial, setConsumoMaterial] = useState([]);
  const [pedidosNaoFat, setPedidosNaoFat] = useState([]);
  const [qtdPedidos, setQtdPedidos] = useState(0);
  const [viewFatTab, setViewFatTab] = useState('faturados'); // 'faturados' | 'nao_faturados'
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [drillDown, setDrillDown] = useState(null); // { titulo, itens }
  const [drillLoading, setDrillLoading] = useState(false);
  const [moeda, setMoeda] = useState('BRL');
  const [cotacoes, setCotacoes] = useState({});

  useEffect(() => {
    supabase.from('cotacoes_moeda').select('*').order('data', { ascending: false }).limit(4)
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(c => { if (!map[c.moeda]) map[c.moeda] = c; });
        setCotacoes(map);
      });
  }, []);

  const converter = useCallback((valorBRL) => {
    if (moeda === 'BRL' || !cotacoes[moeda]) return valorBRL;
    return valorBRL / Number(cotacoes[moeda].valor_venda);
  }, [moeda, cotacoes]);

  const fmtValor = useCallback((v) => {
    const convertido = converter(v);
    if (moeda === 'BRL') return fmtMoeda(convertido);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(convertido);
  }, [converter, moeda]);

  const fmtValorCompacto = useCallback((v) => {
    const convertido = converter(v);
    const prefixo = moeda === 'BRL' ? '' : moeda === 'USD' ? 'US$ ' : '€ ';
    return prefixo + new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(convertido);
  }, [converter, moeda]);

  const rangeDatas = () => {
    const ini = `${filtros.anoIni}-${String(filtros.mesIni).padStart(2, '0')}-01`;
    const ultimoDia = new Date(filtros.anoFim, filtros.mesFim, 0).getDate();
    const fim = `${filtros.anoFim}-${String(filtros.mesFim).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    return { ini, fim };
  };

  const carregarDados = useCallback(async () => {
    setLoading(true);
    const { ini, fim } = rangeDatas();
    const vendCod = filtros.vendedor ? Number(filtros.vendedor) : null;

    // Tudo abaixo (Net Value, Segmento Kalenborn, Segmento de Mercado, Pedido
    // de Venda) vem da MESMA tabela pedidos_itens — garante que os números
    // sempre somam entre si, sem nenhum arredondamento (Number direto da string).
    let qItens = supabase.from('pedidos_itens').select('*').gte('data_neg', ini).lte('data_neg', fim);
    if (vendCod) qItens = qItens.eq('vendedor_codigo', vendCod);

    // Nota de Venda (bruto) agora tem o MESMO tratamento: fonte por item,
    // agregada no front exatamente como o líquido, com drill-down próprio.
    let qNotaItens = supabase.from('nota_venda_itens').select('*').gte('data_neg', ini).lte('data_neg', fim);
    if (vendCod) qNotaItens = qNotaItens.eq('vendedor_codigo', vendCod);

    const qVend = supabase.from('sankhya_vendedores').select('*').order('nome');
    const qSync = supabase.from('sankhya_sync_log').select('*').eq('tipo', 'pedidos_itens').order('finalizado_em', { ascending: false }).limit(1);

    const [rItens, rNotaItens, rVend, rSync] = await Promise.all([qItens, qNotaItens, qVend, qSync]);
    const itens = rItens.data || [];
    const notaItensData = rNotaItens.data || [];

    // Agregação no próprio front, mas sempre da MESMA lista de itens —
    // elimina o risco de Net Value e Segmento divergirem entre si.
    const mensalMap = {};
    const kalengMap = {};
    const segmentoMap = {};
    for (const it of itens) {
      const d = new Date(it.data_neg + 'T00:00:00');
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const valor = Number(it.valor_liquido) || 0;
      mensalMap[key] = (mensalMap[key] || 0) + valor;
      const kal = it.produto_kaleng || 'SEM PG';
      kalengMap[kal] = (kalengMap[kal] || 0) + valor;
      const seg = it.segmento_descricao || 'NAO INFORMADO';
      segmentoMap[seg] = (segmentoMap[seg] || 0) + valor;
    }
    const netMensalArr = Object.entries(mensalMap).map(([key, valor]) => {
      const [ano, mes] = key.split('-').map(Number);
      return { ano, mes, valor_liquido: valor };
    });

    // Mesma agregação mensal, só que para a Nota de Venda (bruto).
    const notaMensalMap = {};
    for (const it of notaItensData) {
      const d = new Date(it.data_neg + 'T00:00:00');
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      notaMensalMap[key] = (notaMensalMap[key] || 0) + (Number(it.valor_bruto) || 0);
    }
    const notaMensalArr = Object.entries(notaMensalMap).map(([key, valor]) => {
      const [ano, mes] = key.split('-').map(Number);
      return { ano, mes, valor_bruto: valor };
    });

    setNetMensal(netMensalArr);
    setPorKaleng(Object.entries(kalengMap).map(([nome, valor]) => ({ nome, valor })));
    setPorSegmento(Object.entries(segmentoMap).map(([nome, valor]) => ({ nome, valor })));
    setNotaVenda(notaMensalArr);
    setVendedores(rVend.data || []);
    setLastSync((rSync.data || [])[0] || null);

    // ── Top clientes (por valor pedido) ──────────────────────────────────────
    const cliMap = {};
    const cliBrsMap = {};
    for (const it of itens) {
      const cli = it.cliente_nome || 'SEM CLIENTE';
      cliMap[cli] = (cliMap[cli] || 0) + (Number(it.valor_liquido) || 0);
      if (!cliBrsMap[cli]) cliBrsMap[cli] = new Set();
      if (it.br) cliBrsMap[cli].add(it.br);
    }
    const topCli = Object.entries(cliMap)
      .map(([nome, valor]) => ({ nome, valor, qtd_pedidos: cliBrsMap[nome]?.size || 0 }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
    setTopClientes(topCli);

    // ── Pedidos únicos (BRs distintos) ───────────────────────────────────────
    const brsUnicos = new Set(itens.map(it => it.br).filter(Boolean));
    setQtdPedidos(brsUnicos.size || itens.length);

    // ── Consumo de matéria-prima (Placa Retangular, KLC, Kalocer) ────────────
    const MAT_KEYS = {
      'Placa Retangular': ['PLACA RET', 'PLACAS RET', 'PLACA RETANG'],
      'KLC': [' KLC', '-KLC', '/KLC', 'KLC '],
      'Kalocer': ['KALOCER'],
    };
    const matAgg = {};
    for (const it of itens) {
      const desc = (it.produto_descricao || '').toUpperCase();
      const kal  = (it.produto_kaleng   || '').toUpperCase();
      for (const [tipo, kws] of Object.entries(MAT_KEYS)) {
        if (kws.some(kw => desc.includes(kw) || kal.includes(kw))) {
          if (!matAgg[tipo]) matAgg[tipo] = { valor: 0, qtd: 0 };
          matAgg[tipo].valor += Number(it.valor_liquido) || 0;
          matAgg[tipo].qtd   += 1;
        }
      }
    }
    setConsumoMaterial(Object.entries(matAgg).map(([tipo, d]) => ({ tipo, ...d })));

    // ── Pedidos não faturados: clientes com pedido mas sem (ou menor) nota ───
    // Agrega nota_venda_itens por cliente_nome (se a coluna existir)
    const notaCliMap = {};
    for (const it of notaItensData) {
      const cli = it.cliente_nome || null;
      if (cli) notaCliMap[cli] = (notaCliMap[cli] || 0) + (Number(it.valor_bruto) || 0);
    }
    const naoFat = topCli.map(c => ({
      ...c,
      faturado:     notaCliMap[c.nome] || 0,
      nao_faturado: Math.max(c.valor - (notaCliMap[c.nome] || 0), 0),
    })).filter(c => c.nao_faturado > 100); // filtra ruídos de centavos
    setPedidosNaoFat(naoFat);

    setLoading(false);
  }, [filtros]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleAtualizar = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const { ini, fim } = rangeDatas();

      const [resItens, resNota] = await Promise.all([
        fetch(`${SUPABASE_URL}/functions/v1/sankhya-pedidos-itens-sync`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataIni: ini, dataFim: fim }),
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/functions/v1/sankhya-nota-venda-itens-sync`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataIni: ini, dataFim: fim }),
        }).then(r => r.json()),
      ]);

      if (resItens.ok && resNota.ok) {
        setSyncStatus({ ok: true, message: `Sincronizado: ${resItens.itens_sincronizados} itens de pedido, ${resNota.itens_sincronizados} itens de nota de venda.` });
        await carregarDados();
      } else {
        setSyncStatus({ ok: false, message: resItens.erro || resNota.erro || 'Erro desconhecido na sincronização.' });
      }
    } catch (err) {
      setSyncStatus({ ok: false, message: String(err) });
    } finally {
      setSyncing(false);
    }
  };

  const abrirDrillDown = useCallback(async (titulo, filtro) => {
    setDrillDown({ titulo, itens: [] });
    setDrillLoading(true);
    const { ini, fim } = rangeDatas();
    let q = supabase.from('pedidos_itens').select('*').gte('data_neg', ini).lte('data_neg', fim).order('data_neg', { ascending: false });
    if (filtro?.coluna && filtro?.valor) q = q.eq(filtro.coluna, filtro.valor);
    const { data } = await q;
    setDrillDown({ titulo, itens: data || [], campoValor: 'valor_liquido' });
    setDrillLoading(false);
  }, [filtros]);

  const abrirDrillDownNota = useCallback(async (titulo, filtro) => {
    setDrillDown({ titulo, itens: [], campoValor: 'valor_bruto' });
    setDrillLoading(true);
    const { ini, fim } = rangeDatas();
    let q = supabase.from('nota_venda_itens').select('*').gte('data_neg', ini).lte('data_neg', fim).order('data_neg', { ascending: false });
    if (filtro?.coluna && filtro?.valor) q = q.eq(filtro.coluna, filtro.valor);
    const { data } = await q;
    setDrillDown({ titulo, itens: data || [], campoValor: 'valor_bruto' });
    setDrillLoading(false);
  }, [filtros]);

  const totalNetValue = useMemo(() => netMensal.reduce((s, m) => s + m.valor_liquido, 0), [netMensal]);
  const totalNotaVenda = useMemo(() => notaVenda.reduce((s, m) => s + Number(m.valor_bruto || 0), 0), [notaVenda]);
  const itensCount = useMemo(() => porKaleng.reduce((s, k) => s, 0) || 0, [porKaleng]); // will use raw below

  const evolucaoMensal = useMemo(() => {
    const map = {};
    netMensal.forEach(m => { map[`${m.ano}-${m.mes}`] = m.valor_liquido; });
    const out = [];
    for (let ano = filtros.anoIni; ano <= filtros.anoFim; ano++) {
      const mIni = ano === filtros.anoIni ? filtros.mesIni : 1;
      const mFim = ano === filtros.anoFim ? filtros.mesFim : 12;
      for (let mes = mIni; mes <= mFim; mes++) out.push({ ano, mes, valor: map[`${ano}-${mes}`] || 0 });
    }
    return out;
  }, [netMensal, filtros]);

  const evolucaoMensalNota = useMemo(() => {
    const map = {};
    notaVenda.forEach(m => { map[`${m.ano}-${m.mes}`] = m.valor_bruto; });
    const out = [];
    for (let ano = filtros.anoIni; ano <= filtros.anoFim; ano++) {
      const mIni = ano === filtros.anoIni ? filtros.mesIni : 1;
      const mFim = ano === filtros.anoFim ? filtros.mesFim : 12;
      for (let mes = mIni; mes <= mFim; mes++) out.push({ ano, mes, valor: map[`${ano}-${mes}`] || 0 });
    }
    return out;
  }, [notaVenda, filtros]);

  const kalengOrdenado = useMemo(() => [...porKaleng].sort((a, b) => b.valor - a.valor).slice(0, 10), [porKaleng]);
  const segmentoOrdenado = useMemo(() => [...porSegmento].sort((a, b) => b.valor - a.valor), [porSegmento]);

  const maxMensal = Math.max(...evolucaoMensal.map(m => m.valor), 1);
  const maxMensalNota = Math.max(...evolucaoMensalNota.map(m => m.valor), 1);
  const maxKaleng = Math.max(...kalengOrdenado.map(k => k.valor), 1);
  const maxSegmento = Math.max(...segmentoOrdenado.map(s => s.valor), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: T.inkFaint, fontSize: 12.5, margin: 0, maxWidth: 560 }}>
          Net Value, Segmento Kalenborn e Segmento de Mercado vêm da mesma fonte por item de pedido — os números sempre somam entre si. Nota de Venda (faturamento já emitido) é uma métrica separada.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 7, padding: 3 }}>
            {['BRL', 'USD', 'EUR'].map(m => (
              <button key={m} onClick={() => setMoeda(m)} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 5, border: 'none',
                background: moeda === m ? T.terracotta : 'transparent', color: moeda === m ? '#fff' : T.inkDim,
                transition: 'background .15s',
              }}>{m}</button>
            ))}
          </div>
          <button onClick={handleAtualizar} disabled={syncing} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: T.terracotta, color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, opacity: syncing ? 0.7 : 1,
          }}>
            <RefreshCw size={15} className={syncing ? 'spin' : ''} />
            {syncing ? 'Atualizando do Sankhya…' : 'Atualizar do Sankhya'}
          </button>
        </div>
      </div>

      {moeda !== 'BRL' && cotacoes[moeda] && (
        <div style={{ fontSize: 11, color: T.inkFaint, marginTop: -8 }}>
          Cotação {moeda}: {fmtMoeda(Number(cotacoes[moeda].valor_venda))} · {cotacoes[moeda].data} ({cotacoes[moeda].fonte})
        </div>
      )}

      <button onClick={() => setFiltros(f => ({ ...f, anoIni: 2020, anoFim: anoAtual, mesIni: 1, mesFim: 12 }))} style={{
        alignSelf: 'flex-start', background: 'transparent', border: 'none', color: T.terracottaText, fontSize: 12, fontWeight: 600,
        textDecoration: 'underline', padding: 0, marginTop: -10,
      }}>
        Expandir todo o histórico disponível →
      </button>
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
            Última sincronização: {new Date(lastSync.finalizado_em).toLocaleString('pt-BR')} · {lastSync.registros_sincronizados} itens
          </div>
        )}
      </Panel>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: T.inkFaint, fontSize: 13 }}>Carregando dados…</div>
      ) : (
        <>
          <div className="grid-kpis-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <KpiClicavel
              label="Net Value (líquido)" valor={totalNetValue} icon={DollarSign} cor={T.terracotta} formatador={fmtValor}
              onClick={() => abrirDrillDown('Net Value — todos os itens do período', null)}
            />
            <KpiClicavel
              label="Nota de Venda (faturamento emitido)" valor={totalNotaVenda} icon={TrendingUp} cor={T.blue} formatador={fmtValor}
              onClick={() => abrirDrillDownNota('Nota de Venda — todos os itens do período', null)}
            />
            <KpiClicavel
              label="Pedidos de venda (qtd)" valor={qtdPedidos} icon={CheckCircle2} cor={T.olive}
              formatador={v => `${v} pedido${v !== 1 ? 's' : ''}`}
              sub={`${itensCount} itens no período`}
            />
            <KpiClicavel
              label="Não faturado (estimado)" valor={pedidosNaoFat.reduce((s, c) => s + c.nao_faturado, 0)} icon={AlertTriangle} cor={T.amber}
              formatador={fmtValor}
              sub={`${pedidosNaoFat.length} cliente${pedidosNaoFat.length !== 1 ? 's' : ''} com saldo em aberto`}
              onClick={pedidosNaoFat.length > 0 ? () => setDrillDown({ titulo: 'Pedidos não faturados — por cliente', itens: pedidosNaoFat, tipo: 'nao_fat' }) : undefined}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Panel title="Evolução mensal — Net Value" subtitle={filtros.anoIni === filtros.anoFim ? `${filtros.anoIni}` : `${filtros.anoIni}–${filtros.anoFim}`}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 210, padding: '14px 4px 0', overflowX: 'auto' }}>
                {evolucaoMensal.map((m, i) => {
                  const h = Math.max((m.valor / maxMensal) * 160, m.valor > 0 ? 4 : 2);
                  return (
                    <button key={i} onClick={() => abrirDrillDown(`Net Value — ${MESES_FAT[m.mes - 1]}/${m.ano}`, null)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', minWidth: 52, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6, color: T.terracottaText, fontFamily: FONT_DISPLAY, whiteSpace: 'nowrap' }}>{fmtValorCompacto(m.valor)}</div>
                      <div style={{
                        width: 34, height: h, borderRadius: '5px 5px 2px 2px', transition: 'height .35s ease, filter .15s',
                        background: `linear-gradient(180deg, ${T.terracotta} 0%, ${T.terracottaText} 100%)`,
                      }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                      />
                      <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 9, fontWeight: 500 }}>{MESES_FAT[m.mes - 1]}/{String(m.ano).slice(2)}</div>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Evolução mensal — Nota de Venda" subtitle={filtros.anoIni === filtros.anoFim ? `${filtros.anoIni}` : `${filtros.anoIni}–${filtros.anoFim}`}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 210, padding: '14px 4px 0', overflowX: 'auto' }}>
                {evolucaoMensalNota.map((m, i) => {
                  const h = Math.max((m.valor / maxMensalNota) * 160, m.valor > 0 ? 4 : 2);
                  return (
                    <button key={i} onClick={() => abrirDrillDownNota(`Nota de Venda — ${MESES_FAT[m.mes - 1]}/${m.ano}`, null)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', minWidth: 52, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6, color: T.blueText, fontFamily: FONT_DISPLAY, whiteSpace: 'nowrap' }}>{fmtValorCompacto(m.valor)}</div>
                      <div style={{
                        width: 34, height: h, borderRadius: '5px 5px 2px 2px', transition: 'height .35s ease, filter .15s',
                        background: `linear-gradient(180deg, ${T.blue} 0%, ${T.blueText} 100%)`,
                      }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                      />
                      <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 9, fontWeight: 500 }}>{MESES_FAT[m.mes - 1]}/{String(m.ano).slice(2)}</div>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="grid-2col">
            <Panel title="Por segmento Kalenborn" subtitle="AD_KALENG — classificação interna de produto · clique para detalhar">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                {kalengOrdenado.length === 0 ? <EmptyStateFat /> : kalengOrdenado.map(k => (
                  <BarraClicavel key={k.nome} nome={k.nome} valor={k.valor} max={maxKaleng} cor={T.terracotta}
                    onClick={() => abrirDrillDown(`Segmento Kalenborn — ${k.nome}`, { coluna: 'produto_kaleng', valor: k.nome })} />
                ))}
              </div>
            </Panel>
            <Panel title="Por segmento de mercado" subtitle="AD_SEGMENTO — Mining, Steel Plant, Cement Plant... · clique para detalhar">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                {segmentoOrdenado.length === 0 ? <EmptyStateFat /> : segmentoOrdenado.map(s => (
                  <BarraClicavel key={s.nome} nome={s.nome} valor={s.valor} max={maxSegmento} cor={T.blue}
                    onClick={() => abrirDrillDown(`Segmento de mercado — ${s.nome}`, { coluna: 'segmento_descricao', valor: s.nome })} />
                ))}
              </div>
            </Panel>
          </div>

          <ComparativoItens moeda={moeda} converter={converter} fmtValor={fmtValor} />

          {/* ── TOP CLIENTES ─────────────────────────────────────────────────── */}
          <Panel
            title="Top clientes — por valor de pedido"
            subtitle="Clientes que mais compraram no período · clique para detalhar"
            right={
              <span style={{ fontSize: 11, color: T.inkFaint }}>{topClientes.length} clientes</span>
            }
          >
            {topClientes.length === 0 ? <EmptyStateFat /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                {topClientes.map((c, i) => {
                  const maxV = topClientes[0]?.valor || 1;
                  return (
                    <button key={c.nome} onClick={() => abrirDrillDown(`Pedidos — ${c.nome}`, { coluna: 'cliente_nome', valor: c.nome })}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', padding: '8px 4px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', width: '100%' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: 18, fontSize: 11, fontWeight: 700, color: T.inkFaint, fontFamily: FONT_DISPLAY, textAlign: 'right' }}>#{i + 1}</span>
                      <span style={{ width: 190, fontSize: 12.5, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.nome}>{c.nome}</span>
                      <div style={{ flex: 1, background: T.lineSoft, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(c.valor / maxV) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 4, transition: 'width .3s' }} />
                      </div>
                      <span style={{ width: 58, textAlign: 'right', fontSize: 11.5, color: T.inkFaint }}>{c.qtd_pedidos}p</span>
                      <span style={{ width: 90, textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: T.ink }}>{fmtValorCompacto(c.valor)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* ── PEDIDOS FATURADOS vs NÃO FATURADOS ──────────────────────────── */}
          <Panel
            title="Pedidos faturados vs não faturados"
            subtitle="Comparativo por cliente — pedido de venda confirmado × nota fiscal emitida"
            right={
              <div style={{ display: 'flex', background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: 2 }}>
                {[['faturados', 'Faturados'], ['nao_faturados', 'Não faturados']].map(([key, label]) => (
                  <button key={key} onClick={() => setViewFatTab(key)} style={{
                    padding: '5px 12px', fontSize: 11.5, fontWeight: 700, borderRadius: 4, border: 'none',
                    background: viewFatTab === key ? T.ink : 'transparent',
                    color: viewFatTab === key ? '#fff' : T.inkDim,
                    transition: 'background .15s',
                  }}>{label}</button>
                ))}
              </div>
            }
          >
            {topClientes.length === 0 ? <EmptyStateFat /> : (
              <div style={{ overflowX: 'auto', marginTop: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                      <th style={thFat()}>Cliente</th>
                      <th style={thFat(0, 'right')}>Pedidos</th>
                      <th style={thFat(0, 'right')}>Valor pedido</th>
                      {viewFatTab === 'faturados'
                        ? <th style={thFat(0, 'right')}>Nota emitida</th>
                        : <th style={thFat(0, 'right')}>Não faturado</th>}
                      <th style={thFat(120)}>Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewFatTab === 'nao_faturados' ? pedidosNaoFat : topClientes.map(c => ({
                      ...c,
                      faturado: c.faturado || 0,
                      nao_faturado: Math.max(c.valor - (c.faturado || 0), 0),
                    }))).map(c => {
                      const cobertura = c.valor > 0 ? Math.min((c.faturado / c.valor) * 100, 100) : 0;
                      const cor = cobertura >= 80 ? T.oliveText : cobertura >= 40 ? T.amberText : T.rustText;
                      return (
                        <tr key={c.nome} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.nome}>{c.nome}</td>
                          <td style={tdFat()}>{c.qtd_pedidos}</td>
                          <td style={{ ...tdFat(), color: T.ink, fontWeight: 600 }}>{fmtValorCompacto(c.valor)}</td>
                          {viewFatTab === 'faturados'
                            ? <td style={{ ...tdFat(), color: T.blueText, fontWeight: 600 }}>{fmtValorCompacto(c.faturado)}</td>
                            : <td style={{ ...tdFat(), color: T.rustText, fontWeight: 700 }}>{fmtValorCompacto(c.nao_faturado)}</td>}
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${cobertura}%`, height: '100%', background: cor, borderRadius: 3, transition: 'width .3s' }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: cor, width: 34, textAlign: 'right' }}>{cobertura.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {viewFatTab === 'nao_faturados' && pedidosNaoFat.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '20px 0', color: T.oliveText, fontSize: 13, fontWeight: 600 }}>
                    ✓ Todos os pedidos do período já foram faturados.
                  </p>
                )}
              </div>
            )}
          </Panel>

          {/* ── CONSUMO DE MATÉRIA-PRIMA ─────────────────────────────────────── */}
          {consumoMaterial.length > 0 && (
            <Panel
              title="Consumo de matéria-prima — Placa Retangular · KLC · Kalocer"
              subtitle="Filtrado de pedidos_itens por palavra-chave em produto_descricao e produto_kaleng"
            >
              <div className="grid-3col" style={{ marginTop: 12 }}>
                {consumoMaterial.map(m => (
                  <div key={m.tipo} style={{
                    background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 10, padding: '16px 18px',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{m.tipo}</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: T.ink }}>{fmtValorCompacto(m.valor)}</div>
                    <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>{m.qtd} item{m.qtd !== 1 ? 's' : ''} de pedido</div>
                    <button onClick={() => abrirDrillDown(`Matéria-prima — ${m.tipo}`, null)} style={{
                      marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11.5, fontWeight: 600, color: T.terracottaText, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    }}>Ver itens <ArrowUpRight size={12} /></button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: T.inkFaint, marginTop: 12, marginBottom: 0 }}>
                Nota: a detecção é por palavra-chave — valide se os nomes de produto no Sankhya batem com os padrões usados (PLACA RET, KLC, KALOCER).
              </p>
            </Panel>
          )}
        </>
      )}

      {drillDown && drillDown.tipo === 'nao_fat' ? (
        <DrillDownNaoFaturados
          titulo={drillDown.titulo}
          clientes={drillDown.itens}
          fmtValor={fmtValor}
          onClose={() => setDrillDown(null)}
        />
      ) : drillDown ? (
        <DrillDownPedidos titulo={drillDown.titulo} itens={drillDown.itens} loading={drillLoading} onClose={() => setDrillDown(null)} campoValor={drillDown.campoValor} />
      ) : null}
    </div>
  );
}

/* ============================================================================
   COMPARATIVO DE ITENS — variação de valor de um mesmo Código Vale
   ao longo do ano, para acompanhar a evolução de preço por peça.
============================================================================ */
function ComparativoItens({ moeda, converter, fmtValor }) {
  const [codigoBusca, setCodigoBusca] = useState('');
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);

  const [topVariacoes, setTopVariacoes] = useState([]);
  const [topLoading, setTopLoading] = useState(true);

  useEffect(() => {
    supabase.from('v_top_variacoes_item').select('*').order('variacao_pct', { ascending: false }).limit(200)
      .then(({ data }) => { setTopVariacoes(data || []); setTopLoading(false); });
  }, []);

  const maisSubiram = topVariacoes.slice(0, 5);
  const maisCairam = [...topVariacoes].sort((a, b) => Number(a.variacao_pct) - Number(b.variacao_pct)).slice(0, 5);

  const buscar = async () => {
    if (!codigoBusca.trim()) return;
    setLoading(true);
    setBuscou(true);
    const { data } = await supabase.from('v_variacao_preco_item').select('*')
      .eq('codigo_vale', codigoBusca.trim())
      .order('ano').order('mes');
    setResultado(data || []);
    setLoading(false);
  };

  const maxValor = Math.max(...resultado.map(r => Number(r.valor_medio) || 0), 1);
  const primeiro = resultado[0];
  const ultimo = resultado[resultado.length - 1];
  const variacaoPct = primeiro && ultimo && Number(primeiro.valor_medio) > 0
    ? ((Number(ultimo.valor_medio) - Number(primeiro.valor_medio)) / Number(primeiro.valor_medio)) * 100
    : null;

  return (
    <Panel title="Comparativo de itens" subtitle="Acompanhe como o valor de um mesmo Código Vale variou ao longo dos meses">
      {!topLoading && (maisSubiram.length > 0 || maisCairam.length > 0) && (
        <div className="grid-2col" style={{ marginBottom: 22 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <ArrowUpRight size={14} color={T.oliveText} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.oliveText, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mais subiram</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {maisSubiram.map(r => (
                <button key={r.codigo_vale} onClick={() => { setCodigoBusca(r.codigo_vale); buscar(); }} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left',
                  background: T.oliveSoft, border: 'none', borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.ink, fontFamily: FONT_DISPLAY }}>{r.codigo_vale}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.oliveText, fontFamily: FONT_DISPLAY }}>+{Number(r.variacao_pct).toFixed(0)}%</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <ArrowDownRight size={14} color={T.rustText} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.rustText, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mais caíram</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {maisCairam.map(r => (
                <button key={r.codigo_vale} onClick={() => { setCodigoBusca(r.codigo_vale); buscar(); }} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left',
                  background: T.rustSoft, border: 'none', borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.ink, fontFamily: FONT_DISPLAY }}>{r.codigo_vale}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.rustText, fontFamily: FONT_DISPLAY }}>{Number(r.variacao_pct).toFixed(0)}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 16, alignItems: 'flex-end' }}>
        <FiltroCampoFat label="Código Vale">
          <input
            value={codigoBusca} onChange={e => setCodigoBusca(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Ex: 15515316" style={{ ...selectStyleFat(180), appearance: 'auto' }}
          />
        </FiltroCampoFat>
        <button onClick={buscar} style={solidBtn(T.terracotta, true)}>Buscar variação</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 13 }}>Carregando…</div>
      ) : !buscou ? (
        <p style={{ fontSize: 12.5, color: T.inkFaint, margin: 0 }}>Digite um Código Vale para ver como o valor desse item variou mês a mês.</p>
      ) : resultado.length === 0 ? (
        <p style={{ fontSize: 12.5, color: T.inkFaint, margin: 0 }}>Nenhum pedido encontrado para esse código no período sincronizado.</p>
      ) : (
        <>
          {variacaoPct !== null && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '7px 12px', borderRadius: 7,
              background: variacaoPct >= 0 ? T.oliveSoft : T.rustSoft, color: variacaoPct >= 0 ? T.oliveText : T.rustText,
              fontSize: 12.5, fontWeight: 700,
            }}>
              {variacaoPct >= 0 ? '↑' : '↓'} {Math.abs(variacaoPct).toFixed(1)}% de {MESES_FAT[primeiro.mes - 1]}/{primeiro.ano} até {MESES_FAT[ultimo.mes - 1]}/{ultimo.ano}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180, padding: '10px 4px 0', overflowX: 'auto' }}>
            {resultado.map((r, i) => {
              const valorMedio = converter(Number(r.valor_medio));
              const h = Math.max((Number(r.valor_medio) / maxValor) * 130, 4);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', minWidth: 64 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6, color: T.terracottaText, fontFamily: FONT_DISPLAY, whiteSpace: 'nowrap' }}>{fmtValor(Number(r.valor_medio))}</div>
                  <div style={{ width: 36, height: h, borderRadius: '5px 5px 2px 2px', background: `linear-gradient(180deg, ${T.terracotta} 0%, ${T.terracottaText} 100%)` }} />
                  <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 8 }}>{MESES_FAT[r.mes - 1]}/{String(r.ano).slice(2)}</div>
                  <div style={{ fontSize: 9.5, color: T.inkFaint, marginTop: 1 }}>{r.qtd_pedidos} pedido{r.qtd_pedidos > 1 ? 's' : ''}</div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: T.inkFaint, marginTop: 14, marginBottom: 0 }}>{resultado[0]?.produto_descricao}</p>
        </>
      )}
    </Panel>
  );
}

function KpiClicavel({ label, valor, icon: Icon, cor, sub, onClick, formatador }) {
  const Tag = onClick ? 'button' : 'div';
  const fmt = formatador || fmtMoeda;
  return (
    <Tag onClick={onClick} style={{
      textAlign: 'left', border: `1px solid ${T.line}`, background: T.panel, borderRadius: 10, padding: '18px 20px',
      cursor: onClick ? 'pointer' : 'default', transition: 'border-color .15s, box-shadow .15s', width: '100%',
    }}
      onMouseEnter={onClick ? (e => { e.currentTarget.style.borderColor = cor; e.currentTarget.style.boxShadow = `0 4px 14px ${cor}22`; }) : undefined}
      onMouseLeave={onClick ? (e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.boxShadow = 'none'; }) : undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600 }}>{label}</span>
        <Icon size={16} color={cor} />
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.ink, marginTop: 12, fontSize: 30, letterSpacing: '-0.01em' }}>{fmt(valor)}</div>
      {onClick ? (
        <div style={{ fontSize: 11, color: cor, marginTop: 6, fontWeight: 600 }}>Ver itens do período →</div>
      ) : sub ? (
        <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 6 }}>{sub}</div>
      ) : null}
    </Tag>
  );
}

function BarraClicavel({ nome, valor, max, cor, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, background: 'transparent', border: 'none',
      padding: '7px 4px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', width: '100%',
    }}
      onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ width: 140, color: T.ink, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={nome}>{nome}</span>
      <div style={{ flex: 1, background: T.lineSoft, height: 9, borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ width: `${(valor / max) * 100}%`, height: '100%', background: cor, borderRadius: 5, transition: 'width .3s ease' }} />
      </div>
      <span style={{ width: 78, textAlign: 'right', fontWeight: 700, fontFamily: FONT_DISPLAY, fontSize: 12.5, color: T.ink }}>{fmtMoedaCompacta(valor)}</span>
    </button>
  );
}

function DrillDownPedidos({ titulo, itens, loading, onClose, campoValor = 'valor_liquido' }) {
  const total = itens.reduce((s, p) => s + Number(p[campoValor] || 0), 0);
  const labelValor = campoValor === 'valor_bruto' ? 'Valor bruto' : 'Valor líquido';
  return (
    <Overlay onClose={onClose}>
      <div className="scale-in" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 920,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, margin: 0 }}>{titulo}</h2>
            <p style={{ fontSize: 12, color: T.inkFaint, margin: '3px 0 0' }}>{itens.length} itens · {fmtMoeda(total)} no total</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.inkFaint }}><X size={20} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                <th style={thFat()}>Data</th>
                <th style={thFat()}>BR</th>
                <th style={thFat()}>Cliente</th>
                <th style={thFat()}>Vendedor</th>
                <th style={thFat()}>Produto</th>
                <th style={thFat(0, 'right')}>{labelValor}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : itens.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Sem itens no período.</td></tr>
              ) : itens.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(p.data_neg)}</td>
                  <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{p.br || '—'}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.cliente_nome}>{p.cliente_nome}</td>
                  <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{p.vendedor_nome || '—'}</td>
                  <td style={{ padding: '9px 12px', color: T.inkDim, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.produto_descricao}>{p.produto_descricao}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{fmtMoeda(p[campoValor])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Overlay>
  );
}

/* ============================================================================
   DRILL-DOWN NÃO FATURADOS — lista de clientes com saldo em aberto
============================================================================ */
function DrillDownNaoFaturados({ titulo, clientes, fmtValor, onClose }) {
  const totalNaoFat = clientes.reduce((s, c) => s + c.nao_faturado, 0);
  const totalPedido = clientes.reduce((s, c) => s + c.valor, 0);
  return (
    <Overlay onClose={onClose}>
      <div className="scale-in" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 780,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, margin: 0 }}>{titulo}</h2>
            <p style={{ fontSize: 12, color: T.inkFaint, margin: '3px 0 0' }}>
              {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} · {fmtValor(totalNaoFat)} em aberto de {fmtValor(totalPedido)} em pedidos
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.inkFaint }}><X size={20} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                <th style={thFat()}>#</th>
                <th style={thFat()}>Cliente</th>
                <th style={thFat(0, 'right')}>Pedidos</th>
                <th style={thFat(0, 'right')}>Valor pedido</th>
                <th style={thFat(0, 'right')}>Nota emitida</th>
                <th style={thFat(0, 'right')}>Não faturado</th>
                <th style={thFat(120)}>Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: T.oliveText, fontWeight: 600 }}>✓ Tudo faturado no período.</td></tr>
              ) : clientes.map((c, i) => {
                const cob = c.valor > 0 ? Math.min((c.faturado / c.valor) * 100, 100) : 0;
                const cor = cob >= 80 ? T.oliveText : cob >= 40 ? T.amberText : T.rustText;
                return (
                  <tr key={c.nome} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '10px 12px', color: T.inkFaint, fontFamily: FONT_DISPLAY, fontSize: 11 }}>#{i + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.nome}>{c.nome}</td>
                    <td style={tdFat()}>{c.qtd_pedidos}</td>
                    <td style={{ ...tdFat(), color: T.ink, fontWeight: 600 }}>{fmtValor(c.valor)}</td>
                    <td style={{ ...tdFat(), color: T.blueText }}>{fmtValor(c.faturado)}</td>
                    <td style={{ ...tdFat(), color: T.rustText, fontWeight: 700 }}>{fmtValor(c.nao_faturado)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${cob}%`, height: '100%', background: cor, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cor, width: 34, textAlign: 'right' }}>{cob.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Overlay>
  );
}

/* ============================================================================
   CONSUMO DE MATÉRIA-PRIMA — lê v_consumo_mp do SGQ (projeto separado)
   Mostra código, descrição, unidade, qtd consumida, saldo e cobertura
============================================================================ */
/* ── Estoque mínimo editável inline ─────────────────────────────────────────── */
function MinEstoqueInput({ codigoMp, valorAtual }) {
  const [val, setVal] = useState(valorAtual || 0);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const salvar = async () => {
    if (Number(val) === Number(valorAtual)) return;
    setSalvando(true);
    await supabaseSGQ.from('estoque_mp')
      .update({ estoque_minimo: Number(val) })
      .eq('codigo_mp', codigoMp);
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type="number" value={val} onChange={e => setVal(e.target.value)}
        onBlur={salvar} onKeyDown={e => e.key === 'Enter' && salvar()}
        style={{ width: 64, textAlign: 'right', padding: '4px 6px', fontSize: 11.5, fontFamily: FONT_DISPLAY, border: `1px solid ${T.line}`, borderRadius: 4, background: T.panelAlt, color: T.ink }}
      />
      {salvo && <CheckCircle2 size={12} color={T.oliveText} />}
    </div>
  );
}

/* helpers de cabeçalho ordenável — definidos antes de ConsumoMP e Almoxarifado */
function SortTh({ label, col, sortBy, sortDir, onClick }) {
  const active = sortBy === col;
  return (
    <th style={{ ...thFat(0, 'right'), cursor: 'pointer', userSelect: 'none' }} onClick={() => onClick(col)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: active ? T.terracotta : T.inkFaint }}>
        {label}{active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ' ↕'}
      </span>
    </th>
  );
}

function AlmoxSortTh({ label, col, sortBy, sortDir, onClick }) {
  const active = sortBy === col;
  return (
    <th style={{ ...thFat(0, 'right'), cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }} onClick={() => onClick(col)}>
      <span style={{ color: active ? T.terracotta : T.inkFaint }}>
        {label}{active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
      </span>
    </th>
  );
}

const CATEGORIA_MP = {
  'KLC / Cerâmica':    (d) => /SM-PLACA|KLC|KALOCER|CERÂMICA|CERAMICA/i.test(d),
  'Borracha':          (d) => /BORRACHA|CHEMITAC|COLA/i.test(d),
  'Fixadores':         (d) => /PARAFUSO|PORCA|ARRUELA|STUD|PM -|PM-/i.test(d),
  'Chapas metálicas':  (d) => /CHAPA|PM - CHAPA|\[PI\]/i.test(d),
  'Outros':            ()   => true,
};

function categoriaMP(descricao) {
  for (const [cat, fn] of Object.entries(CATEGORIA_MP)) {
    if (fn(descricao || '')) return cat;
  }
  return 'Outros';
}

function ConsumoMP() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState('Todos');
  const [sortBy, setSortBy] = useState('qtd_consumida'); // qtd_consumida | saldo | cobertura_pct
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    setLoading(true);
    setErro(null);
    supabaseSGQ
      .from('v_consumo_mp')
      .select('*')
      .then(({ data, error }) => {
        if (error) { setErro(`Erro SGQ: ${error.message}`); setLoading(false); return; }
        setDados((data || []).map(r => ({ ...r, categoria: categoriaMP(r.descricao) })));
        setLoading(false);
      })
      .catch(err => { setErro(`Falha de rede: ${err?.message || String(err)}`); setLoading(false); });
  }, []);

  const categorias = useMemo(() => ['Todos', ...Object.keys(CATEGORIA_MP)], []);

  const filtrados = useMemo(() => {
    return dados
      .filter(r => {
        const matchBusca = !busca || r.codigo_mp?.includes(busca) || (r.descricao || '').toLowerCase().includes(busca.toLowerCase());
        const matchCat = catFiltro === 'Todos' || r.categoria === catFiltro;
        return matchBusca && matchCat;
      })
      .sort((a, b) => {
        const va = Number(a[sortBy]) || 0;
        const vb = Number(b[sortBy]) || 0;
        return sortDir === 'desc' ? vb - va : va - vb;
      });
  }, [dados, busca, catFiltro, sortBy, sortDir]);

  const totais = useMemo(() => ({
    itens: filtrados.length,
    qtdConsumida: filtrados.reduce((s, r) => s + Number(r.qtd_consumida || 0), 0),
    saldoTotal: filtrados.reduce((s, r) => s + Number(r.saldo_disponivel || 0), 0),
    criticos: filtrados.filter(r => Number(r.cobertura_pct) < 30).length,
    atencao: filtrados.filter(r => Number(r.cobertura_pct) >= 30 && Number(r.cobertura_pct) < 80).length,
  }), [filtrados]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const cobColor = (pct) => {
    const v = Number(pct);
    if (!v && v !== 0) return T.inkFaint;
    if (v < 30) return T.rustText;
    if (v < 80) return T.amberText;
    return T.oliveText;
  };
  const cobBg = (pct) => {
    const v = Number(pct);
    if (!v && v !== 0) return T.lineSoft;
    if (v < 30) return T.rustSoft;
    if (v < 80) return T.amberSoft;
    return T.oliveSoft;
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1320 }}>
      <p style={{ fontSize: 12, color: T.inkFaint, margin: 0 }}>
        Dados do SGQ — consumo calculado pela composição de cada produto acabado × quantidade das remessas de industrialização. Saldo = estoque disponível atual no almoxarifado.
      </p>

      {erro && (
        <div style={{ background: T.rustSoft, border: `1px solid ${T.rust}33`, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={16} color={T.rustText} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.rustText }}>Erro ao carregar dados do SGQ</div>
            <div style={{ fontSize: 12, color: T.inkDim, marginTop: 2 }}>{erro}</div>
          </div>
        </div>
      )}
      <div className="grid-kpis-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        {[
          { label: 'Itens de MP', value: totais.itens, color: T.ink },
          { label: 'Qtd total consumida', value: totais.qtdConsumida.toLocaleString('pt-BR', { maximumFractionDigits: 0 }), color: T.ink },
          { label: 'Saldo total (mix unid.)', value: totais.saldoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 }), color: T.ink },
          { label: 'Itens críticos (<30%)', value: totais.criticos, color: T.rustText },
          { label: 'Atenção (30–80%)', value: totais.atencao, color: T.amberText },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: k.color, marginTop: 8 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Buscar código ou descrição">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: 10988, PLACA, KLC…"
                style={{ ...selectStyleFat(220), paddingLeft: 28 }} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Categoria">
            <div style={{ position: 'relative' }}>
              <select value={catFiltro} onChange={e => setCatFiltro(e.target.value)} style={selectStyleFat(170)}>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Ordenar por">
            <div style={{ position: 'relative' }}>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setSortDir('desc'); }} style={selectStyleFat(170)}>
                <option value="qtd_consumida">Qtd consumida</option>
                <option value="saldo_disponivel">Saldo disponível</option>
                <option value="cobertura_pct">Cobertura %</option>
                <option value="qtd_remessas">Nº remessas</option>
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
        </div>
      </Panel>

      {/* Tabela principal */}
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, background: T.panelAlt }}>
                <th style={{ ...thFat(), width: 90 }}>Código MP</th>
                <th style={thFat()}>Descrição</th>
                <th style={{ ...thFat(70), textAlign: 'center' }}>Unid.</th>
                <SortTh label="Qtd consumida" col="qtd_consumida" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <SortTh label="Saldo estoque" col="saldo_disponivel" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <th style={{ ...thFat(90), textAlign: 'right' }}>Mín. estoque</th>
                <SortTh label="Cobertura" col="cobertura_pct" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <th style={{ ...thFat(0, 'right') }}>Remessas</th>
                <th style={thFat(110)}>Categoria</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando dados do SGQ…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Nenhum item encontrado.</td></tr>
              ) : filtrados.map(r => {
                const pct = Number(r.cobertura_pct);
                const isCrit = pct < 30 && r.cobertura_pct !== null;
                return (
                  <tr key={r.codigo_mp} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: isCrit ? `${T.rustSoft}55` : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: T.terracotta }}>{r.codigo_mp}</td>
                    <td style={{ padding: '10px 12px', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }} title={r.descricao}>{r.descricao || '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: T.inkFaint, fontSize: 11, fontWeight: 600 }}>{r.unidade || '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.ink, fontSize: 13 }}>
                      {Number(r.qtd_consumida).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 13, color: Number(r.saldo_disponivel) === 0 ? T.rustText : T.ink, fontWeight: Number(r.saldo_disponivel) === 0 ? 700 : 400 }}>
                      {Number(r.saldo_disponivel).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      {Number(r.saldo_disponivel) === 0 && <span style={{ marginLeft: 5, fontSize: 10, background: T.rustSoft, color: T.rustText, borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>ZERADO</span>}
                      {r.abaixo_minimo && Number(r.saldo_disponivel) > 0 && <span style={{ marginLeft: 5, fontSize: 10, background: T.amberSoft, color: T.amberText, borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>↓MÍN</span>}
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      <MinEstoqueInput codigoMp={r.codigo_mp} valorAtual={r.estoque_minimo} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {r.cobertura_pct === null ? (
                        <span style={{ fontSize: 11, color: T.inkFaint }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, minWidth: 60, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: cobColor(r.cobertura_pct), borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: cobColor(r.cobertura_pct), width: 40, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: T.inkDim, fontFamily: FONT_DISPLAY }}>{r.qtd_remessas}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, padding: '3px 7px', borderRadius: 4,
                        background: cobBg(r.cobertura_pct), color: cobColor(r.cobertura_pct),
                      }}>{r.categoria}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {filtrados.length} item{filtrados.length !== 1 ? 's' : ''} ·
            <span style={{ color: T.rustText, fontWeight: 600 }}> Vermelho &lt;30%</span> ·
            <span style={{ color: T.amberText, fontWeight: 600 }}> Âmbar 30–80%</span> ·
            <span style={{ color: T.oliveText, fontWeight: 600 }}> Verde &gt;80%</span>
          </span>
          <BotaoExportar small onClick={() => exportCSV(filtrados, 'consumo_mp.csv', ['codigo_mp','descricao','unidade','qtd_consumida','saldo_disponivel','estoque_minimo','cobertura_pct','qtd_remessas','categoria'])} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ALMOXARIFADO — estoque consolidado por produto + movimentação acumulada
   Fonte: v_almoxarifado_consolidado (SGQ — sync horária do Sankhya)
============================================================================ */
const GRUPOS_DESTAQUE = ['PLACA KLC', 'KALOCER', 'ABRESIST', 'KALIMPACT', 'ELEMENTOS DE FIXAÇÃO', 'CHAPA', 'COLA', 'BORRACHA'];

function Almoxarifado() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos'); // Todos | Zerado | Crítico | OK
  const [sortBy, setSortBy] = useState('total_saidas');
  const [sortDir, setSortDir] = useState('desc');
  const [detalhe, setDetalhe] = useState(null); // produto selecionado para drill-down por local
  const [locaisDetalhe, setLocaisDetalhe] = useState([]);

  useEffect(() => {
    setLoading(true);
    setErro(null);
    supabaseSGQ.from('v_almoxarifado_consolidado').select('*')
      .then(({ data, error }) => {
        if (error) { setErro(`Erro SGQ: ${error.message}`); setLoading(false); return; }
        setDados(data || []);
        setLoading(false);
      })
      .catch(err => { setErro(`Falha de rede: ${err?.message || String(err)}`); setLoading(false); });
  }, []);

  const grupos = useMemo(() => {
    const set = new Set(dados.map(d => d.descrgrupoprod).filter(Boolean));
    const destaque = GRUPOS_DESTAQUE.filter(g => set.has(g));
    const resto = [...set].filter(g => !GRUPOS_DESTAQUE.includes(g)).sort();
    return ['Todos', ...destaque, ...resto];
  }, [dados]);

  const statusItem = (row) => {
    const total = Number(row.estoque_total) || 0;
    const reserv = Number(row.qtd_reservado) || 0;
    if (total <= 0) return 'Zerado';
    if (reserv >= total) return 'Crítico';
    if (reserv > total * 0.7) return 'Atenção';
    return 'OK';
  };

  const filtrados = useMemo(() => {
    return dados.filter(r => {
      const matchBusca = !busca ||
        String(r.codprod).includes(busca) ||
        (r.descrprod || '').toLowerCase().includes(busca.toLowerCase()) ||
        (r.referencia || '').toLowerCase().includes(busca.toLowerCase());
      const matchGrupo = grupoFiltro === 'Todos' || r.descrgrupoprod === grupoFiltro;
      const st = statusItem(r);
      const matchStatus = statusFiltro === 'Todos' || st === statusFiltro;
      return matchBusca && matchGrupo && matchStatus;
    }).sort((a, b) => {
      const va = Number(a[sortBy]) || 0;
      const vb = Number(b[sortBy]) || 0;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  }, [dados, busca, grupoFiltro, statusFiltro, sortBy, sortDir]);

  const totais = useMemo(() => ({
    skus:        filtrados.length,
    zerados:     filtrados.filter(r => Number(r.estoque_total) <= 0).length,
    criticos:    filtrados.filter(r => { const s = statusItem(r); return s === 'Crítico' || s === 'Atenção'; }).length,
    totalSaidas: filtrados.reduce((s, r) => s + (Number(r.total_saidas) || 0), 0),
    ultimaSync:  dados.length ? dados.reduce((latest, r) => {
      const d = new Date(r.ultima_sync);
      return d > latest ? d : latest;
    }, new Date(0)) : null,
  }), [filtrados, dados]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const abrirDetalhe = async (row) => {
    setDetalhe(row);
    setLocaisDetalhe([]);
    try {
      const { data, error } = await supabaseSGQ.from('almoxarifado_estoque')
        .select('descrlocal, estoque_calculado, qtd_reservado, qtd_entrada, qtd_saida, sincronizado_em')
        .eq('codprod', row.codprod)
        .neq('descrlocal', '<SEM LOCAL DE ESTOQUE>');
      setLocaisDetalhe(error ? [] : (data || []));
    } catch (_) {
      setLocaisDetalhe([]);
    }
  };

  const statusColor = (st) => ({
    Zerado:  [T.rustText,  T.rustSoft],
    Crítico: [T.rustText,  T.rustSoft],
    Atenção: [T.amberText, T.amberSoft],
    OK:      [T.oliveText, T.oliveSoft],
  }[st] || [T.inkFaint, T.lineSoft]);

  const fmtQtd = (v) => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1400 }}>

      {erro && (
        <div style={{ background: T.rustSoft, border: `1px solid ${T.rust}33`, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={16} color={T.rustText} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.rustText }}>Erro ao carregar dados do SGQ</div>
            <div style={{ fontSize: 12, color: T.inkDim, marginTop: 2 }}>{erro}</div>
          </div>
        </div>
      )}

      {/* Sync info */}
      {totais.ultimaSync && totais.ultimaSync.getTime() > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: T.inkFaint }}>
          <RefreshCw size={12} />
          Sincronizado com Sankhya em {totais.ultimaSync.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · atualização automática a cada hora
        </div>
      )}

      {/* KPIs */}
      <div className="grid-kpis-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))' }}>
        {[
          { label: 'Total de SKUs',      value: fmtQtd(totais.skus),        color: T.ink,      icon: Package },
          { label: 'Zerados',            value: fmtQtd(totais.zerados),     color: totais.zerados > 0 ? T.rustText : T.oliveText, icon: AlertTriangle },
          { label: 'Críticos / Atenção', value: fmtQtd(totais.criticos),    color: totais.criticos > 0 ? T.amberText : T.oliveText, icon: AlertTriangle },
          { label: 'Total de saídas',    value: fmtQtd(totais.totalSaidas), color: T.ink,      icon: ArrowDownRight },
          { label: 'Grupos de produto',  value: grupos.length - 1,           color: T.blueText, icon: Layers },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', boxShadow: SHADOW_SM }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>{k.label}</span>
              <k.icon size={13} color={k.color} />
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: k.color, marginTop: 8 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Buscar código, descrição ou ref.">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Ex: 10988, PLACA, KLC, SM-…"
                style={{ ...selectStyleFat(240), paddingLeft: 28 }} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Grupo de produto">
            <div style={{ position: 'relative' }}>
              <select value={grupoFiltro} onChange={e => setGrupoFiltro(e.target.value)} style={selectStyleFat(200)}>
                {grupos.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Status">
            <div style={{ position: 'relative' }}>
              <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} style={selectStyleFat(150)}>
                {['Todos', 'Zerado', 'Crítico', 'Atenção', 'OK'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Ordenar por">
            <div style={{ position: 'relative' }}>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setSortDir('desc'); }} style={selectStyleFat(180)}>
                <option value="total_saidas">Total saídas</option>
                <option value="total_entradas">Total entradas</option>
                <option value="estoque_total">Estoque total</option>
                <option value="qtd_reservado">Qtd reservado</option>
                <option value="estoque_mp">Estoque MP</option>
                <option value="estoque_processamento">Em processamento</option>
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
        </div>
      </Panel>

      {/* Tabela */}
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, background: T.panelAlt }}>
                <th style={{ ...thFat(), width: 74 }}>Código</th>
                <th style={thFat()}>Descrição</th>
                <th style={{ ...thFat(100) }}>Grupo</th>
                <th style={{ ...thFat(42), textAlign: 'center' }}>Un.</th>
                <AlmoxSortTh label="Estoque total"   col="estoque_total"         sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <AlmoxSortTh label="Matéria-prima"   col="estoque_mp"            sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <AlmoxSortTh label="Em process."     col="estoque_processamento" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <AlmoxSortTh label="Reservado"       col="qtd_reservado"         sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <AlmoxSortTh label="↑ Entradas"      col="total_entradas"        sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <AlmoxSortTh label="↓ Saídas"        col="total_saidas"          sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <th style={{ ...thFat(70), textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando estoque do SGQ…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={11} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum item encontrado.</td></tr>
              ) : filtrados.map(r => {
                const st = statusItem(r);
                const [stColor, stBg] = statusColor(st);
                const isZerado = st === 'Zerado';
                return (
                  <tr key={r.codprod} onClick={() => abrirDetalhe(r)}
                    style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer', background: isZerado ? `${T.rustSoft}44` : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = isZerado ? T.rustSoft : T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = isZerado ? `${T.rustSoft}44` : 'transparent'}
                  >
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 12.5, color: T.terracotta }}>{r.codprod}</td>
                    <td style={{ padding: '9px 12px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5 }} title={r.descrprod}>{r.descrprod}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: T.blueText, background: T.blueSoft, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap' }}>{r.descrgrupoprod || '—'}</span>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>{r.codvol || '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: isZerado ? T.rustText : T.ink }}>{fmtQtd(r.estoque_total)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12, color: T.inkDim }}>{fmtQtd(r.estoque_mp)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12, color: T.inkDim }}>{fmtQtd(r.estoque_processamento)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12, color: Number(r.qtd_reservado) > 0 ? T.amberText : T.inkFaint, fontWeight: Number(r.qtd_reservado) > 0 ? 600 : 400 }}>{fmtQtd(r.qtd_reservado)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12, color: T.oliveText }}>{fmtQtd(r.total_entradas)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12, color: T.rustText }}>{fmtQtd(r.total_saidas)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: stBg, color: stColor, whiteSpace: 'nowrap' }}>{st}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {filtrados.length} SKU{filtrados.length !== 1 ? 's' : ''} · Clique em um item para ver movimentação ·
            <span style={{ color: T.rustText, fontWeight: 600 }}> Zerado</span> ·
            <span style={{ color: T.amberText, fontWeight: 600 }}> Crítico</span> ·
            <span style={{ color: T.oliveText, fontWeight: 600 }}> OK</span>
          </span>
          <BotaoExportar small onClick={() => exportCSV(filtrados, 'almoxarifado_estoque.csv', ['codprod','descrprod','descrgrupoprod','codvol','estoque_total','estoque_mp','estoque_processamento','qtd_reservado','total_entradas','total_saidas'])} />
        </div>
      </div>

      {/* Modal de detalhe por local */}
      {detalhe && (
        <Overlay onClose={() => { setDetalhe(null); setLocaisDetalhe([]); }}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 720,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: SHADOW_XL,
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: T.terracotta }}>{detalhe.codprod}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: T.blueSoft, color: T.blueText }}>{detalhe.descrgrupoprod}</span>
                  <span style={{ fontSize: 11, color: T.inkFaint }}>{detalhe.codvol}</span>
                </div>
                <p style={{ fontSize: 12, color: T.inkDim, margin: '5px 0 0', maxWidth: 520 }}>{detalhe.descrprod}</p>
              </div>
              <button onClick={() => { setDetalhe(null); setLocaisDetalhe([]); }} style={{ background: 'transparent', border: 'none', color: T.inkFaint }}><X size={20} /></button>
            </div>

            {/* Totais do produto */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '16px 22px', borderBottom: `1px solid ${T.line}` }}>
              {[
                { label: 'Estoque total',   value: fmtQtd(detalhe.estoque_total),   color: T.ink },
                { label: 'Reservado',       value: fmtQtd(detalhe.qtd_reservado),   color: T.amberText },
                { label: 'Total entradas',  value: fmtQtd(detalhe.total_entradas),  color: T.oliveText },
                { label: 'Total saídas',    value: fmtQtd(detalhe.total_saidas),    color: T.rustText },
              ].map(k => (
                <div key={k.label} style={{ textAlign: 'center', background: T.panelAlt, borderRadius: 8, padding: '10px 8px' }}>
                  <div style={{ fontSize: 10, color: T.inkFaint, fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Movimentação por local */}
            <div style={{ overflow: 'auto', flex: 1, padding: '6px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                    <th style={thFat()}>Local de estoque</th>
                    <th style={thFat(0, 'right')}>Calculado</th>
                    <th style={thFat(0, 'right')}>Reservado</th>
                    <th style={thFat(0, 'right')}>↑ Entradas</th>
                    <th style={thFat(0, 'right')}>↓ Saídas</th>
                    <th style={thFat(0, 'right')}>Giro</th>
                  </tr>
                </thead>
                <tbody>
                  {locaisDetalhe.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                  ) : locaisDetalhe.map(l => {
                    const ent = Number(l.qtd_entrada) || 0;
                    const sai = Math.abs(Number(l.qtd_saida) || 0);
                    const giro = ent > 0 ? Math.min(Math.round((sai / ent) * 100), 100) : 0;
                    return (
                      <tr key={l.descrlocal} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                        <td style={{ padding: '11px 12px', fontWeight: 600 }}>{l.descrlocal}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtQtd(l.estoque_calculado)}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, color: T.amberText }}>{fmtQtd(l.qtd_reservado)}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, color: T.oliveText }}>{fmtQtd(ent)}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, color: T.rustText }}>{fmtQtd(sai)}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, background: T.lineSoft, height: 5, borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${giro}%`, height: '100%', background: giro > 80 ? T.terracotta : T.olive, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: T.inkDim, width: 32, textAlign: 'right' }}>{giro}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 22px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint }}>
              Giro = saídas ÷ entradas acumuladas · Sync: {new Date(detalhe.ultima_sync).toLocaleString('pt-BR')}
            </div>
          </div>
        </Overlay>
      )}
    </div>
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
   PEDIDOS VALE — aba dedicada para exportar pedidos da Vale com colunas
   técnicas de cerâmica preenchidas automaticamente via regras_ceramica_vale,
   substituindo o PROCV manual que dava #N/A no Excel do usuário.
============================================================================ */
function PedidosVale() {
  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [periodo, setPeriodo] = useState({ dataIni: '2026-01-01', dataFim: '2026-06-26' });

  const [brv, setBrv] = useState([]);
  const [brvLoading, setBrvLoading] = useState(true);
  const [brvSyncing, setBrvSyncing] = useState(false);
  const [brvSyncStatus, setBrvSyncStatus] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('v_pedidos_vale').select('*')
      .gte('data_neg', periodo.dataIni).lte('data_neg', periodo.dataFim)
      .order('data_neg', { ascending: false });
    setLinhas(data || []);
    setLoading(false);
  }, [periodo]);

  const carregarBrv = useCallback(async () => {
    setBrvLoading(true);
    const { data } = await supabase.from('orcamentos_brv').select('*')
      .gte('data_emissao', periodo.dataIni).lte('data_emissao', periodo.dataFim)
      .order('data_emissao', { ascending: false });
    setBrv(data || []);
    setBrvLoading(false);
  }, [periodo]);

  useEffect(() => { carregar(); carregarBrv(); }, [carregar, carregarBrv]);

  const handleAtualizarBrv = async () => {
    setBrvSyncing(true);
    setBrvSyncStatus(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sankhya-orcamentos-brv-sync`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataIni: periodo.dataIni }),
      }).then(r => r.json());
      if (res.ok) {
        setBrvSyncStatus({ ok: true, message: `Sincronizado: ${res.linhas_sincronizadas} linhas de orçamento BRV.` });
        await carregarBrv();
      } else {
        setBrvSyncStatus({ ok: false, message: res.erro || 'Erro desconhecido.' });
      }
    } catch (err) {
      setBrvSyncStatus({ ok: false, message: String(err) });
    } finally {
      setBrvSyncing(false);
    }
  };

  const handleAtualizar = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sankhya-pedidos-itens-sync`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataIni: periodo.dataIni, dataFim: periodo.dataFim }),
      }).then(r => r.json());
      if (res.ok) {
        setSyncStatus({ ok: true, message: `Sincronizado: ${res.itens_sincronizados} itens do Sankhya.` });
        await carregar();
      } else {
        setSyncStatus({ ok: false, message: res.erro || 'Erro desconhecido.' });
      }
    } catch (err) {
      setSyncStatus({ ok: false, message: String(err) });
    } finally {
      setSyncing(false);
    }
  };

  const exportarCsv = () => {
    const headers = ['Nº', 'Month', 'Year', 'Client', 'UF', 'BR', 'Cod. Vale', 'Margem atual %', 'Qts peças', 'Area da Placa (m2)', 'Qtd. Ceramica 1 (PC)', 'Qtd. Total Ceramica 1 (PC)', 'Ceramica 1 Código', 'Ceramica 1 Descrição', 'Qtd. Ceramica 2 (PC)', 'Qtd. Total de Ceramica 2 (PC)', 'Ceramica 2 Código', 'Ceramica 2 Descrição', 'Qtd. Ceramica 3 (PC)', 'Qtd. Total de Ceramica 3 (PC)', 'Ceramica 3 Código', 'Ceramica 3 Descrição', 'Qtd. Ceramica 4 (PC)', 'Qtd. Total de Ceramica 4 (PC)', 'Ceramica 4 Código', 'Ceramica 4 Descrição', 'Espessura de Ceramica (mm)', 'Layout da Placa (mm)', 'MGT?', 'AUTOIMPACTO'];
    const linhasCsv = linhas.map(l => [
      l.numero, l.month_nome, l.ano, l.client, l.uf, l.br, l.cod_vale, l.margem_atual_pct ?? '',
      l.qtd_pecas, l.area_placa_m2 ?? '#N/A', l.qtd_ceramica_1 ?? '#N/A', l.qtd_total_ceramica_1 ?? '#N/A',
      l.ceramica_1_codigo ?? '#N/A', l.ceramica_1_descricao ?? '#N/A', l.qtd_ceramica_2 ?? '#N/A',
      l.qtd_total_ceramica_2 ?? '#N/A', l.ceramica_2_codigo ?? '#N/A', l.ceramica_2_descricao ?? '#N/A',
      l.qtd_ceramica_3 ?? '#N/A', l.qtd_total_ceramica_3 ?? '#N/A', l.ceramica_3_codigo ?? '#N/A',
      l.ceramica_3_descricao ?? '#N/A', l.qtd_ceramica_4 ?? '#N/A', l.qtd_total_ceramica_4 ?? '#N/A',
      l.ceramica_4_codigo ?? '#N/A', l.ceramica_4_descricao ?? '#N/A', l.espessura_ceramica_mm ?? '#N/A',
      l.layout_placa_mm ?? '#N/A', l.mgt, l.autoimpacto,
    ]);
    const csv = [headers, ...linhasCsv].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pedidos_vale_${periodo.dataIni}_${periodo.dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const comRegra = linhas.filter(l => l.area_placa_m2 !== null).length;
  const semRegra = linhas.length - comRegra;

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: T.inkFaint, fontSize: 12.5, margin: 0, maxWidth: 560 }}>
          Pedidos de venda de clientes Vale, com colunas de cerâmica preenchidas automaticamente via Código Vale (substitui o PROCV manual que dava #N/A).
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Data início">
            <input type="date" value={periodo.dataIni} onChange={e => setPeriodo(p => ({ ...p, dataIni: e.target.value }))} style={{ ...selectStyleFat(140), appearance: 'auto' }} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Data fim">
            <input type="date" value={periodo.dataFim} onChange={e => setPeriodo(p => ({ ...p, dataFim: e.target.value }))} style={{ ...selectStyleFat(140), appearance: 'auto' }} />
          </FiltroCampoFat>
          <button onClick={exportarCsv} disabled={!linhas.length} style={{ ...ghostBtn(T.terracottaText), opacity: linhas.length ? 1 : 0.5 }}>
            <DownloadCloud size={14} /> Exportar CSV
          </button>
          <button onClick={handleAtualizar} disabled={syncing} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: T.terracotta, color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, opacity: syncing ? 0.7 : 1,
          }}>
            <RefreshCw size={15} className={syncing ? 'spin' : ''} />
            {syncing ? 'Atualizando…' : 'Atualizar do Sankhya'}
          </button>
        </div>
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

      {!loading && linhas.length > 0 && (
        <div className="grid-kpis-2">
          <div style={{ background: T.oliveSoft, border: `1px solid ${T.olive}33`, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 11.5, color: T.oliveText, fontWeight: 600 }}>Com regra de cerâmica completa</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: T.oliveText, marginTop: 4 }}>{comRegra} <span style={{ fontSize: 13, fontWeight: 500 }}>de {linhas.length}</span></div>
          </div>
          <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}33`, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 11.5, color: T.amberText, fontWeight: 600 }}>Sem regra cadastrada</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: T.amberText, marginTop: 4 }}>{semRegra} itens</div>
          </div>
        </div>
      )}

      <Panel title="Pedidos Vale" subtitle="Clique em Exportar CSV para colar direto no modelo de planilha">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.inkFaint, fontSize: 13 }}>Carregando…</div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat()}>Data</th>
                  <th style={thFat()}>Mês/Ano</th>
                  <th style={thFat()}>Cliente</th>
                  <th style={thFat()}>UF</th>
                  <th style={thFat()}>BR</th>
                  <th style={thFat()}>Cod. Vale</th>
                  <th style={thFat(0, 'right')}>Qtd peças</th>
                  <th style={thFat()}>Cerâmica 1</th>
                  <th style={thFat()}>Espessura</th>
                  <th style={thFat()}>Layout</th>
                  <th style={thFat()}>MGT</th>
                  <th style={thFat()}>Autoimpacto</th>
                </tr>
              </thead>
              <tbody>
                {linhas.length === 0 ? (
                  <tr><td colSpan={12} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum pedido Vale no período. Clique em "Atualizar do Sankhya".</td></tr>
                ) : linhas.map(l => {
                  const semRegraLinha = l.area_placa_m2 === null;
                  return (
                    <tr key={l.pedido_item_id} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: semRegraLinha ? T.amberSoft : 'transparent' }}>
                      <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap', fontFamily: FONT_DISPLAY }}>{fmtData(l.data_neg)}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{l.month_nome?.trim()}/{l.ano}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.client}>{l.client}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim }}>{l.uf || '—'}</td>
                      <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{l.br || '—'}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim, fontFamily: FONT_DISPLAY }}>{l.cod_vale || '—'}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{l.qtd_pecas}</td>
                      <td style={{ padding: '9px 12px', color: semRegraLinha ? T.amberText : T.inkDim }}>{l.ceramica_1_descricao || (semRegraLinha ? 'Sem regra' : '—')}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim }}>{l.espessura_ceramica_mm ? `${l.espessura_ceramica_mm}mm` : '—'}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{l.layout_placa_mm || '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{l.mgt === 'SIM' ? <span style={{ color: T.oliveText, fontWeight: 600 }}>SIM</span> : <span style={{ color: T.inkFaint }}>—</span>}</td>
                      <td style={{ padding: '9px 12px' }}>{l.autoimpacto === 'SIM' ? <span style={{ color: T.oliveText, fontWeight: 600 }}>SIM</span> : <span style={{ color: T.inkFaint }}>—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel
        title="Orçamentos BRV — margem e matéria-prima"
        subtitle="AD_ORCPRECO/AD_ORCPRECOITE/AD_ORCITEMAT — dados brutos, ainda sem ligação com Pedidos Vale (regra de cruzamento pendente)"
        right={
          <button onClick={handleAtualizarBrv} disabled={brvSyncing} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: T.panelAlt, color: T.terracottaText, border: `1px solid ${T.line}`,
            borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 600, opacity: brvSyncing ? 0.7 : 1,
          }}>
            <RefreshCw size={13} className={brvSyncing ? 'spin' : ''} />
            {brvSyncing ? 'Atualizando…' : 'Atualizar BRV'}
          </button>
        }
      >
        {brvSyncStatus && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 8, marginBottom: 12,
            background: brvSyncStatus.ok ? T.oliveSoft : T.rustSoft, border: `1px solid ${brvSyncStatus.ok ? T.olive : T.rust}33`,
          }}>
            {brvSyncStatus.ok ? <CheckCircle2 size={14} color={T.oliveText} /> : <AlertTriangle size={14} color={T.rustText} />}
            <span style={{ fontSize: 12.5, color: brvSyncStatus.ok ? T.oliveText : T.rustText }}>{brvSyncStatus.message}</span>
          </div>
        )}
        {brvLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.inkFaint, fontSize: 13 }}>Carregando…</div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 10, maxHeight: 480, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                  <th style={thFat()}>Data Emissão</th>
                  <th style={thFat()}>Nº Orçamento</th>
                  <th style={thFat()}>Cliente</th>
                  <th style={thFat()}>Produto BRV</th>
                  <th style={thFat(0, 'right')}>Qtd Orçada</th>
                  <th style={thFat(0, 'right')}>Margem Lucro</th>
                  <th style={thFat(0, 'right')}>Custo Caixa</th>
                  <th style={thFat(0, 'right')}>Mão de Obra</th>
                  <th style={thFat(0, 'right')}>Mat. Indireto</th>
                  <th style={thFat(0, 'right')}>Desconto</th>
                  <th style={thFat()}>Matéria-Prima</th>
                  <th style={thFat()}>Desc. Genérica</th>
                  <th style={thFat(0, 'right')}>Qtd Unit.</th>
                  <th style={thFat(0, 'right')}>Qtd Total Necessária</th>
                </tr>
              </thead>
              <tbody>
                {brv.length === 0 ? (
                  <tr><td colSpan={14} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Sem dados. Clique em "Atualizar BRV".</td></tr>
                ) : brv.map(l => (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '8px 10px', color: T.inkDim, whiteSpace: 'nowrap', fontFamily: FONT_DISPLAY }}>{fmtData(l.data_emissao)}</td>
                    <td style={{ padding: '8px 10px', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{l.nureg}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.cliente_nome}>{l.cliente_nome}</td>
                    <td style={{ padding: '8px 10px', color: T.inkDim, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.desc_produto_brv}>{l.desc_produto_brv}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{l.qtd_orcada_brv}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY, color: T.oliveText, fontWeight: 600 }}>{l.margem_lucro_item != null ? `${l.margem_lucro_item}%` : '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{l.custo_caixa_item ?? '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{l.mao_de_obra_item ?? '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{l.material_indireto_item ?? '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{l.desconto_item ?? '—'}</td>
                    <td style={{ padding: '8px 10px', color: T.inkDim, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.desc_materia_prima}>{l.desc_materia_prima || '—'}</td>
                    <td style={{ padding: '8px 10px', color: T.inkFaint }}>{l.desc_generica_tela || '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{l.qtd_materia_unitaria ?? '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{l.total_materia_necessaria ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

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

      <div className="grid-2col">
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
    <div className="fade-up grid-2col" style={{ maxWidth: 1100 }}>
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
/* ============================================================================
   MODAL: NOVA PROPOSTA — grava de verdade na tabela propostas do Supabase
============================================================================ */
/* ============================================================================
   TELA DE LOGIN — Supabase Auth real, e-mail/senha
============================================================================ */
function TelaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [entrando, setEntrando] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const entrar = async (e) => {
    e.preventDefault();
    setErro(null);
    if (!email.trim() || !senha) { setErro('Preencha e-mail e senha.'); return; }
    setEntrando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEntrando(false);
    if (error) {
      setErro(error.message.includes('Invalid') ? 'E-mail ou senha incorretos.' : error.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at top, ${T.terracottaSoft} 0%, ${T.bg} 55%)`, fontFamily: FONT_BODY, padding: 20,
    }}>
      <div className="fade-up" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 18, width: '100%', maxWidth: 400,
        padding: '38px 36px', boxShadow: SHADOW_XL,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.terracotta} 0%, ${T.terracottaDeep} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700,
            fontSize: 28, color: '#fff', boxShadow: '0 4px 12px rgba(143,17,9,.3)', marginBottom: 16,
          }}>K</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, margin: 0, color: T.ink, letterSpacing: '-0.01em' }}>KALENBORN</h1>
          <p style={{ fontSize: 12, color: T.inkFaint, margin: '3px 0 0', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Portal de Engenharia</p>
        </div>

        <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.inkDim, marginBottom: 6 }}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu.nome@kalenborn.com.br"
              style={inputStyle()} autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.inkDim, marginBottom: 6 }}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••"
              style={inputStyle()} />
          </div>

          {erro && (
            <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 600 }}>{erro}</div>
          )}

          <button type="submit" disabled={entrando} style={{
            ...solidBtn(T.terracotta, true), width: '100%', justifyContent: 'center', padding: '11px 16px',
            fontSize: 13.5, marginTop: 6, opacity: entrando ? 0.7 : 1,
          }}>
            {entrando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   MODAL: TROCAR SENHA
============================================================================ */
function ModalTrocarSenha({ onClose }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setErro(null);
    if (novaSenha.length < 6) { setErro('A senha precisa ter pelo menos 6 caracteres.'); return; }
    if (novaSenha !== confirmarSenha) { setErro('As senhas não coincidem.'); return; }
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvando(false);
    if (error) { setErro(error.message); return; }
    setSucesso(true);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="scale-in" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, width: '100%', maxWidth: 420,
        overflow: 'hidden', boxShadow: SHADOW_XL,
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, margin: 0, color: T.ink }}>Alterar senha</h2>
          <button onClick={onClose} style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, color: T.inkFaint, padding: 7 }}><X size={18} /></button>
        </div>

        {sucesso ? (
          <div style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.oliveSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Check size={24} color={T.oliveText} strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, margin: 0 }}>Senha alterada com sucesso.</p>
            <button onClick={onClose} style={{ ...solidBtn(T.terracotta, true), marginTop: 18 }}>Fechar</button>
          </div>
        ) : (
          <form onSubmit={salvar} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.inkDim, marginBottom: 6 }}>Nova senha</label>
              <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle()} autoFocus />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.inkDim, marginBottom: 6 }}>Confirmar nova senha</label>
              <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="Repita a senha" style={inputStyle()} />
            </div>
            {erro && (
              <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 600 }}>{erro}</div>
            )}
            <button type="submit" disabled={salvando} style={{ ...solidBtn(T.terracotta, true), width: '100%', justifyContent: 'center', opacity: salvando ? 0.7 : 1 }}>
              {salvando ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </Overlay>
  );
}

function ModalNovaProposta({ currentUser, onClose, onCreated }) {
  const [form, setForm] = useState({
    br: '', cliente: '', uf: '', escopo: ESCOPOS_TOP[0], descricao_servico: '',
    classificacao: 'B', data_entrega_prevista: '', valor_liquido: '',
  });
  const [arquivos, setArquivos] = useState([]); // Array de File objects
  const [salvando, setSalvando] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [erro, setErro] = useState(null);

  const adicionarArquivo = (e) => {
    const files = Array.from(e.target.files || []);
    setArquivos(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removerArquivo = (idx) => setArquivos(prev => prev.filter((_, i) => i !== idx));

  const salvar = async () => {
    setErro(null);
    if (!form.br.trim() || !form.cliente.trim()) {
      setErro('Preencha pelo menos BR e Cliente.');
      return;
    }
    if (arquivos.length === 0) {
      setErro('Anexe pelo menos o arquivo Word da proposta (obrigatório).');
      return;
    }
    setSalvando(true);

    // Upload de todos os arquivos para Supabase Storage
    const urlsUploadadas = [];
    for (let i = 0; i < arquivos.length; i++) {
      const file = arquivos[i];
      setUploadProgress(`Enviando arquivo ${i + 1}/${arquivos.length}: ${file.name}…`);
      const path = `${form.br.replace(/\//g, '-')}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('propostas-arquivos').upload(path, file, { upsert: true });
      if (upErr) {
        setSalvando(false);
        setUploadProgress('');
        setErro(`Erro ao enviar "${file.name}": ${upErr.message}. Verifique se o bucket "propostas-arquivos" existe no Supabase Storage.`);
        return;
      }
      const { data: urlData } = supabase.storage.from('propostas-arquivos').getPublicUrl(path);
      urlsUploadadas.push({ nome: file.name, url: urlData.publicUrl });
    }

    setUploadProgress('Salvando proposta…');
    const { data: colab } = await supabase.from('colaboradores').select('id').eq('nome', currentUser.nome).maybeSingle();

    const payload = {
      br: form.br.trim(),
      cliente: form.cliente.trim(),
      uf: form.uf.trim() || null,
      tipo_proposta: 'venda_spot_email',
      origem_dados: 'manual_word',
      escopo: form.escopo,
      descricao_servico: form.descricao_servico.trim() || null,
      classificacao: form.classificacao,
      responsavel_id: colab?.id || null,
      data_entrega_prevista: form.data_entrega_prevista || null,
      valor_liquido: form.valor_liquido ? Number(form.valor_liquido) : 0,
      arquivo_word_url: urlsUploadadas[0]?.url || null,
      arquivos_json: JSON.stringify(urlsUploadadas), // todos os arquivos
      status: 'rascunho',
      mes: MES_ATUAL_LABEL(),
    };

    const { error } = await supabase.from('propostas').insert(payload);
    setSalvando(false);
    setUploadProgress('');
    if (error) { setErro(error.message); return; }
    onCreated();
  };

  return (
    <Overlay onClose={onClose}>
      <div className="scale-in" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, width: '100%', maxWidth: 560,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: SHADOW_XL,
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, margin: 0, color: T.ink }}>Nova proposta</h2>
          <button onClick={onClose} style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, color: T.inkFaint, padding: 7 }}><X size={18} /></button>
        </div>

        <div style={{ padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 12, color: T.inkFaint, margin: 0, lineHeight: 1.5 }}>
            Propostas manuais (Word/e-mail) — os arquivos são enviados para o Supabase Storage e ficam acessíveis para o aprovador diretamente no portal.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FiltroCampoFat label="BR *">
              <input value={form.br} onChange={e => setForm(f => ({ ...f, br: e.target.value }))} placeholder="BR14999/26" style={{ ...selectStyleFat('100%'), appearance: 'auto' }} />
            </FiltroCampoFat>
            <FiltroCampoFat label="UF">
              <input value={form.uf} onChange={e => setForm(f => ({ ...f, uf: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="MG" style={{ ...selectStyleFat('100%'), appearance: 'auto' }} />
            </FiltroCampoFat>
          </div>

          <FiltroCampoFat label="Cliente *">
            <input value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} placeholder="Nome do cliente" style={{ ...selectStyleFat('100%'), appearance: 'auto' }} />
          </FiltroCampoFat>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FiltroCampoFat label="Escopo">
              <select value={form.escopo} onChange={e => setForm(f => ({ ...f, escopo: e.target.value }))} style={selectStyleFat('100%')}>
                {ESCOPOS_TOP.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </FiltroCampoFat>
            <FiltroCampoFat label="Classificação">
              <select value={form.classificacao} onChange={e => setForm(f => ({ ...f, classificacao: e.target.value }))} style={selectStyleFat('100%')}>
                <option value="A">A</option><option value="B">B</option><option value="C">C</option>
              </select>
            </FiltroCampoFat>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FiltroCampoFat label="Entrega prevista">
              <input type="date" value={form.data_entrega_prevista} onChange={e => setForm(f => ({ ...f, data_entrega_prevista: e.target.value }))} style={{ ...selectStyleFat('100%'), appearance: 'auto' }} />
            </FiltroCampoFat>
            <FiltroCampoFat label="Valor líquido (R$)">
              <input type="number" value={form.valor_liquido} onChange={e => setForm(f => ({ ...f, valor_liquido: e.target.value }))} placeholder="0,00" style={{ ...selectStyleFat('100%'), appearance: 'auto' }} />
            </FiltroCampoFat>
          </div>

          <FiltroCampoFat label="Descrição do serviço">
            <textarea rows={3} value={form.descricao_servico} onChange={e => setForm(f => ({ ...f, descricao_servico: e.target.value }))} style={{ ...inputStyle(), resize: 'vertical' }} />
          </FiltroCampoFat>

          {/* Upload de arquivos — Word e PDF */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.inkFaint, marginBottom: 6 }}>
              Arquivos da proposta * <span style={{ fontWeight: 400 }}>(Word e/ou PDF — obrigatório ao menos 1)</span>
            </label>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
              background: T.panelAlt, border: `1.5px dashed ${T.line}`, fontSize: 13, color: T.inkDim, fontWeight: 500,
            }}>
              <UploadCloud size={16} color={T.terracotta} />
              Adicionar arquivo (.doc, .docx, .pdf)
              <input type="file" accept=".doc,.docx,.pdf" multiple onChange={adicionarArquivo} style={{ display: 'none' }} />
            </label>
            {arquivos.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {arquivos.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.oliveSoft, borderRadius: 6, padding: '7px 11px' }}>
                    <CheckCircle2 size={13} color={T.oliveText} />
                    <span style={{ flex: 1, fontSize: 12.5, color: T.oliveText, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ fontSize: 11, color: T.inkFaint }}>{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => removerArquivo(i)} style={{ background: 'none', border: 'none', color: T.inkFaint, padding: 2, cursor: 'pointer' }}><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploadProgress && (
            <div style={{ background: T.blueSoft, color: T.blueText, borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 600 }}>
              {uploadProgress}
            </div>
          )}
          {erro && (
            <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 600 }}>{erro}</div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.line}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={ghostBtn(T.inkDim)}>Cancelar</button>
          <button onClick={salvar} disabled={salvando} style={{ ...solidBtn(T.terracotta, true), opacity: salvando ? 0.6 : 1 }}>
            {salvando ? 'Enviando…' : 'Criar proposta'}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function MES_ATUAL_LABEL() {
  const m = new Date().getMonth();
  return MESES_ORDEM[m] || MESES_ORDEM[5];
}

function ModalDetalhe({ proposta, usuario, onClose, onAction }) {
  const [comentario, setComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  const isRascunho = proposta.status === 'rascunho' || proposta.status === 'reprovada';
  const sankhyaPendente = proposta.origem_dados === 'sankhya' && !proposta.validado_pelo_engenheiro;

  const canSendToReview = isRascunho && usuario.papel === 'engenheiro' && !sankhyaPendente;
  const canValidateSankhya = sankhyaPendente && usuario.papel === 'engenheiro';
  const canReview = proposta.status === 'em_revisao_tecnica' && usuario.papel === 'revisor_tecnico';
  const canApprove = proposta.status === 'aguardando_aprovacao' && usuario.papel === 'analista_aprovador' && APROVADORES_POOL.includes(usuario.nome);
  const canFinish = proposta.status === 'aprovada' && usuario.papel === 'engenheiro';

  const meta = STATUS_META[proposta.status];

  const carregarComentarios = useCallback(async () => {
    const { data } = await supabase.from('proposta_comentarios').select('*')
      .eq('proposta_id', proposta.id).order('created_at', { ascending: true });
    setComentarios(data || []);
  }, [proposta.id]);

  useEffect(() => { carregarComentarios(); }, [carregarComentarios]);

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    setEnviandoComentario(true);
    await supabase.from('proposta_comentarios').insert({
      proposta_id: proposta.id, autor_nome: usuario.nome, comentario: novoComentario.trim(),
    });
    setNovoComentario('');
    await carregarComentarios();
    setEnviandoComentario(false);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="scale-in" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, width: '100%', maxWidth: 960,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: SHADOW_XL,
      }}>
        <div style={{ padding: '22px 26px', background: `linear-gradient(135deg, ${T.panelAlt} 0%, ${T.panel} 100%)`, borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, margin: 0, color: T.ink, letterSpacing: '-0.01em' }}>{proposta.br}</h2>
              <span style={{ background: meta.bg, color: meta.color, fontSize: 10.5, fontWeight: 700, padding: '5px 11px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {meta.label}
              </span>
            </div>
            <p style={{ color: T.inkFaint, fontSize: 13, margin: '5px 0 0', fontWeight: 500 }}>{proposta.cliente} · {proposta.escopo}</p>
          </div>
          <button onClick={onClose} style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, color: T.inkFaint, padding: 7, height: 'fit-content' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
          <div style={{ flex: '2 1 0', padding: 26, borderRight: `1px solid ${T.line}`, overflow: 'auto' }}>
            <SectionLabel>Informações da proposta</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 26px', fontSize: 13, marginTop: 14, marginBottom: 24 }}>
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
              <ArquivosPropostaSection proposta={proposta} />
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

            <div style={{ marginTop: 26 }}>
              <SectionLabel>Comentários</SectionLabel>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 260, overflow: 'auto', paddingRight: 4 }}>
                {comentarios.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: T.inkFaint, margin: 0 }}>Nenhum comentário ainda. Seja o primeiro a comentar.</p>
                ) : comentarios.map(c => (
                  <div key={c.id} style={{ background: T.panelAlt, border: `1px solid ${T.lineSoft}`, borderRadius: 10, padding: '11px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{c.autor_nome}</span>
                      <span style={{ fontSize: 10.5, color: T.inkFaint }}>{new Date(c.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: T.inkDim, margin: 0, lineHeight: 1.5 }}>{c.comentario}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <input
                  value={novoComentario} onChange={e => setNovoComentario(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && enviarComentario()}
                  placeholder="Escrever um comentário…" style={{ ...inputStyle(), flex: 1, fontSize: 12.5 }}
                />
                <button onClick={enviarComentario} disabled={enviandoComentario || !novoComentario.trim()} style={{ ...solidBtn(T.terracotta, true), opacity: enviandoComentario || !novoComentario.trim() ? 0.5 : 1 }}>
                  Enviar
                </button>
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 0', padding: 26, background: T.panelAlt, display: 'flex', flexDirection: 'column' }}>
            <SectionLabel>Fluxo & aprovação</SectionLabel>
            <div style={{ flex: 1, marginTop: 16 }}>
              <Timeline label="Cadastro" done={proposta.status !== 'rascunho'} active date={proposta.data_abertura} />
              <Timeline label="Revisão técnica" active={proposta.status === 'em_revisao_tecnica'} done={['aguardando_aprovacao', 'aprovada', 'concluida'].includes(proposta.status)} rejected={proposta.status === 'reprovada' && !proposta.aprovador_pool} />
              <PoolTimeline status={proposta.status} aprovador={proposta.aprovador_pool} />
              <Timeline label="Concluída" active={proposta.status === 'concluida'} done={proposta.status === 'concluida'} date={proposta.data_conclusao} last />
            </div>

            <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18, marginTop: 10 }}>
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

/* ============================================================================
   ARQUIVOS DA PROPOSTA — visualizar e adicionar arquivos no ModalDetalhe
============================================================================ */
function ArquivosPropostaSection({ proposta }) {
  const [enviando, setEnviando] = useState(false);
  const [arquivosExtras, setArquivosExtras] = useState([]);
  const [erro, setErro] = useState(null);

  // Parseia todos os arquivos existentes (lista JSON ou só a URL legacy)
  const arquivosExistentes = useMemo(() => {
    try {
      const parsed = JSON.parse(proposta.arquivos_json || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) {}
    if (proposta.arquivo_word_url) return [{ nome: 'Proposta', url: proposta.arquivo_word_url }];
    return [];
  }, [proposta.arquivos_json, proposta.arquivo_word_url]);

  const todosArquivos = [...arquivosExistentes, ...arquivosExtras];

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setEnviando(true);
    setErro(null);
    const novos = [];
    for (const file of files) {
      const path = `${proposta.br.replace(/\//g, '-')}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('propostas-arquivos').upload(path, file, { upsert: true });
      if (upErr) { setErro(`Erro ao enviar "${file.name}": ${upErr.message}`); setEnviando(false); return; }
      const { data: urlData } = supabase.storage.from('propostas-arquivos').getPublicUrl(path);
      novos.push({ nome: file.name, url: urlData.publicUrl });
    }
    // Atualiza arquivos_json na tabela
    const listaAtualizada = [...arquivosExistentes, ...novos];
    await supabase.from('propostas').update({ arquivos_json: JSON.stringify(listaAtualizada) }).eq('id', proposta.id);
    setArquivosExtras(prev => [...prev, ...novos]);
    setEnviando(false);
    e.target.value = '';
  };

  const getExt = (nome) => (nome || '').split('.').pop().toLowerCase();
  const extIcon = (nome) => ['pdf'].includes(getExt(nome)) ? '📄' : ['doc', 'docx'].includes(getExt(nome)) ? '📝' : '📎';

  return (
    <div style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.inkDim, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Arquivos anexados ({todosArquivos.length})
        </span>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
          color: T.terracottaText, cursor: 'pointer', background: T.terracottaSoft,
          border: `1px solid ${T.terracotta}33`, borderRadius: 5, padding: '5px 10px',
        }}>
          <UploadCloud size={13} /> {enviando ? 'Enviando…' : 'Adicionar'}
          <input type="file" accept=".doc,.docx,.pdf" multiple onChange={handleUpload} style={{ display: 'none' }} disabled={enviando} />
        </label>
      </div>

      {todosArquivos.length === 0 ? (
        <p style={{ fontSize: 12, color: T.inkFaint, margin: 0 }}>Nenhum arquivo anexado ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {todosArquivos.map((arq, i) => (
            <a key={i} href={arq.url} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px',
              background: T.panel, border: `1px solid ${T.lineSoft}`, borderRadius: 7,
              textDecoration: 'none', color: T.ink,
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.terracotta}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.lineSoft}
            >
              <span style={{ fontSize: 16 }}>{extIcon(arq.nome)}</span>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{arq.nome}</span>
              <DownloadCloud size={13} color={T.inkFaint} />
            </a>
          ))}
        </div>
      )}
      {erro && <p style={{ fontSize: 11.5, color: T.rustText, marginTop: 8, margin: 0 }}>{erro}</p>}
    </div>
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
  return ReactDOM.createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(33,29,23,.45)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 20,
      }}
    >
      {children}
    </div>,
    document.body
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
