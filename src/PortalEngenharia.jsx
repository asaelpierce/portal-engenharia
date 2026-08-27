import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { createClient } from '@supabase/supabase-js';
import {
  LayoutGrid, FileStack, ClipboardCheck, Gauge, SlidersHorizontal, Workflow,
  Plus, Search, UploadCloud, AlertTriangle, Clock3, Check, X, LogOut,
  ChevronRight, ChevronDown, Building2, CalendarDays, Link2, DownloadCloud,
  Filter, FileWarning, Stamp, ArrowUpRight, ArrowDownRight, Minus, Zap,
  CircleDot, ShieldCheck, MessageSquareWarning, ListFilter, Webhook, Users,
  RefreshCw, TrendingUp, DollarSign, CheckCircle2, Package, Layers, Bell, BarChart2, Download, History, ClipboardList,
  Trophy, Repeat, UserPlus, Trash2,
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

const SUPABASE_SUPPLY_URL = 'https://tocyzucfgwhvpfihakvj.supabase.co';
const SUPABASE_SUPPLY_KEY = 'sb_publishable_BhQK0Wn95R_pZI1eNz6CdQ_PNdR5rVX';
const supabaseSupply = createClient(SUPABASE_SUPPLY_URL, SUPABASE_SUPPLY_KEY);

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

// Grupos de material a destacar no topo do filtro do Almoxarifado (Consolidado SGQ).
// Vazio = sem destaque, lista simplesmente em ordem alfabética.
const GRUPOS_DESTAQUE = [];

const STATUS_META = {
  rascunho: { label: 'Aguardando confirmação', color: T.slate, bg: T.lineSoft },
  em_revisao_tecnica: { label: 'Revisão técnica', color: T.amberText, bg: T.amberSoft },
  aguardando_aprovacao: { label: 'Aguardando aprovação', color: T.blueText, bg: T.blueSoft },
  aprovada: { label: 'Aprovada', color: T.oliveText, bg: T.oliveSoft },
  reprovada: { label: 'Reprovada', color: T.rustText, bg: T.rustSoft },
  concluida: { label: 'Concluída', color: '#fff', bg: T.ink },
};

const FLUXO_ORDEM = ['rascunho', 'em_revisao_tecnica', 'aguardando_aprovacao', 'concluida'];

// TOPs (Tipo de Operação Sankhya) que representam faturamento de venda real.
// Confirmado com o time comercial: 3200, 3201, 3209, 3214, 3216, 3220, 3227, 3229.
// (3209 = simples faturamento p/ entrega futura, 3216 = exportação, 3229 = venda de
// serviços padrão nacional — faltavam antes e deixavam de fora faturamento real.)
// Qualquer outro TOP (ex.: 3213, devoluções, remessas) não deve entrar na conta de faturamento.
const TOPS_FATURAMENTO_VALIDOS = [3200, 3201, 3209, 3214, 3216, 3219, 3220, 3227, 3229]; // 3219 = VENDA DE SERVIÇOS
// Ano em que o portal opera hoje. O campo 'mes' das propostas só guarda o nome
// do mês (sem ano) — sem esse filtro, dados antigos de outro ano (ex: uma
// proposta de setembro/2025) se misturam com o mesmo mês do ano corrente.
const ANO_OPERACIONAL = 2026;

// Clientes/BRs que na verdade são modelos/templates usados para automação (duplicados
// manualmente pra gerar outras propostas) — não representam propostas comerciais reais
// e por isso não devem contar em nenhum KPI, gráfico ou ranking (Visão Geral e Métricas).
const CLIENTES_EXCLUIDOS_METRICAS = ['VALE - DISU'];
const ehPropostaTemplateAutomacao = (p) =>
  CLIENTES_EXCLUIDOS_METRICAS.includes(p.cliente) || (p.br || '').toUpperCase().startsWith('BRV');

// NOTA: a deduplicação de revisões do Sankhya (mesmo BR revisado várias vezes)
// agora é feita na ORIGEM (fn_sync_propostas_de_sankhya, no banco), respeitando
// o agrupamento oficial BR+MATERIAL/SERVIÇO. Por isso NÃO fazemos mais dedup
// aqui no front — fazer de novo aqui juntaria incorretamente duas propostas
// legítimas e diferentes (uma de material, outra de serviço) que só coincidem
// no número do BR.

const MESES_ORDEM = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const MESES_LABEL = { JANEIRO: 'Jan', FEVEREIRO: 'Fev', MARÇO: 'Mar', ABRIL: 'Abr', MAIO: 'Mai', JUNHO: 'Jun', JULHO: 'Jul', AGOSTO: 'Ago', SETEMBRO: 'Set', OUTUBRO: 'Out', NOVEMBRO: 'Nov', DEZEMBRO: 'Dez' };

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

// Link direto pra abrir uma nota/pedido no Sankhya web. A tela (classe) e o
// TIPOPORTAL mudam por tipo de movimento — confirmados: C (Compra/Nota de
// Entrada) e V/P (Venda — nota e pedido usam a mesma tela "Central de Vendas").
// Falta confirmar: OP (usa NUAPO, não NUNOTA — precisa de outro exemplo).
const SANKHYA_SERVIDOR = 'https://snkbrp01667.ativy.com';
const SANKHYA_CONFIG_POR_TIPMOV = {
  C: { classe: 'br.com.sankhya.com.mov.CentralNotas_COMPRA', tipoportal: 'PC' },
  V: { classe: 'br.com.sankhya.com.mov.CentralNotas_VENDA', tipoportal: 'PV' },
  P: { classe: 'br.com.sankhya.com.mov.CentralNotas_VENDA', tipoportal: 'PV' },
  J: { classe: 'br.com.sankhya.com.mov.CentralNotas_MOVINTERNA', tipoportal: 'PI' }, // Pedido de Requisição (confirmado na tela de Reservas Pendentes)
};
function base64Utf8(texto) {
  return btoa(unescape(encodeURIComponent(texto)));
}
function linkSankhyaNota({ nunota, tipmov, codtipoper }) {
  const cfg = SANKHYA_CONFIG_POR_TIPMOV[tipmov];
  if (!cfg || !nunota) return null; // tipo ainda não mapeado, ou sem NUNOTA — não mostra o link
  const agora = Date.now();
  const parametros = {
    NUNOTA: Number(nunota),
    TIPMOV: tipmov,
    ehPedidoW: false,
    CODTIPOPER: Number(codtipoper) || 0,
    TIPOPORTAL: cfg.tipoportal,
    forceNewHash: agora,
  };
  const blocoA = base64Utf8(cfg.classe);
  const blocoB = base64Utf8(JSON.stringify(parametros));
  return `${SANKHYA_SERVIDOR}/mge/system.jsp#app/${blocoA}/${blocoB}&pk-refresh=${agora}`;
}
// Botão pequeno reutilizável — só renderiza se o link puder ser montado (tipo mapeado + nunota presente)
function BotaoAbrirSankhya({ nunota, tipmov, codtipoper, label }) {
  const link = linkSankhyaNota({ nunota, tipmov, codtipoper });
  if (!link) return null;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: T.blueText, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
      <ArrowUpRight size={11} /> {label || 'Abrir no Sankhya'}
    </a>
  );
}

// Telas que o Sankhya SÓ abre de forma genérica (sem parâmetro pra registro específico) —
// confirmado com o usuário que essas duas não aceitam NUAPO/filtro pela URL, então só dá pra
// abrir a tela geral e a pessoa busca manualmente lá dentro.
const SANKHYA_TELAS_GENERICAS = {
  ordensProducao: base64Utf8('br.com.sankhya.prod.OrdensProducaoHTML'),
  orcamentos: base64Utf8('br.com.sankhya.menu.adicional.AD_ORCPRECO'),
};
function linkSankhyaTelaGenerica(chave) {
  const blocoA = SANKHYA_TELAS_GENERICAS[chave];
  if (!blocoA) return null;
  return `${SANKHYA_SERVIDOR}/mge/system.jsp#app/${blocoA}`;
}
function BotaoAbrirTelaSankhya({ tela, label }) {
  const link = linkSankhyaTelaGenerica(tela);
  if (!link) return null;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: T.blueText, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
      <ArrowUpRight size={11} /> {label}
    </a>
  );
}

// Link ESPECÍFICO pro relatório do orçamento (AD_ORCPRECO), via ReportLauncher_27 +
// PK_NUREG — achado clicando na setinha da proposta no Sankhya. Só funciona se a
// proposta já tiver sido casada com o NUREG do Sankhya (campo nureg_sankhya, casado
// pelo BR via sankhya-vincular-nureg-propostas).
const SANKHYA_REPORT_LAUNCHER_27 = base64Utf8('br.com.sankhya.controls.ReportLauncher_27');
function linkSankhyaRelatorioOrcamento(nureg) {
  if (!nureg) return null;
  const agora = Date.now();
  const parametros = {
    PK_NUREG: { type: 'I', value: String(nureg) },
    pks: { '0': { fields: { '0': { nome: 'PK_NUREG', tipo: 'I', valor: Number(nureg) } } } },
  };
  const blocoB = base64Utf8(JSON.stringify(parametros));
  return `${SANKHYA_SERVIDOR}/mge/system.jsp#app/${SANKHYA_REPORT_LAUNCHER_27}/${blocoB}&pk-refresh=${agora}`;
}
function BotaoAbrirOrcamentoSankhya({ nureg }) {
  const link = linkSankhyaRelatorioOrcamento(nureg);
  if (!link) return <BotaoAbrirTelaSankhya tela="orcamentos" label="Abrir Orçamentos no Sankhya (buscar manual)" />;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: T.oliveText, textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
      <ArrowUpRight size={11} /> Abrir esse orçamento no Sankhya
    </a>
  );
}

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
      .then(async ({ data }) => {
        if (data) {
          const { data: telasData } = await supabase.from('colaborador_telas').select('tela').eq('colaborador_id', data.id);
          setCurrentUser({
            id: data.id, nome: data.nome, papel: data.papel,
            email: session.user.email,
            ve_produtividade_completa: data.ve_produtividade_completa,
            ve_almoxarifado_completo: data.ve_almoxarifado_completo,
            ve_almoxarifado_apenas_fila: data.ve_almoxarifado_apenas_fila,
            sankhyaUsuario: data.sankhya_usuario,
            // Sem linhas em colaborador_telas = sem restrição cadastrada (mantém acesso total, comportamento antigo).
            // Com linhas = restrição ativa, só essas telas aparecem.
            telasPermitidas: telasData && telasData.length ? telasData.map(t => t.tela) : null,
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

  // Keep-alive de abas: uma vez visitada, a aba fica montada (só escondida via CSS quando
  // não é a ativa) — preserva filtros/estado local ao trocar de aba e voltar, sem precisar
  // levantar o estado de cada tela individualmente.
  const [visitedViews, setVisitedViews] = useState(() => new Set(['dashboard']));
  useEffect(() => {
    setVisitedViews(prev => prev.has(view) ? prev : new Set(prev).add(view));
  }, [view]);
  const renderTab = (id, node) => visitedViews.has(id) ? (
    <div key={id} style={{ display: view === id ? 'block' : 'none', height: '100%' }}>{node}</div>
  ) : null;

  // Redireciona papel 'comercial' para a primeira aba permitida
  useEffect(() => {
    if (currentUser?.papel === 'comercial' && view === 'dashboard') {
      setView('comercial');
    }
  }, [currentUser?.papel]);
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

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregarPropostas, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregarPropostas]);

  const propostasMes = useMemo(() =>
    propostas.filter(p =>
      !ehPropostaTemplateAutomacao(p) &&
      (mesFiltro === 'ACUMULADO' || p.mes === mesFiltro) &&
      p.data_abertura && new Date(p.data_abertura + 'T00:00:00').getFullYear() === ANO_OPERACIONAL
    ),
  [propostas, mesFiltro]);

  const pendencias = useMemo(() => propostas.filter(p => {
    // Propostas vindas do Sankhya (origem_dados === 'sankhya') são só histórico/informativo —
    // não passam pelo fluxo de aprovação do portal, só as enviadas manualmente (Word/PDF) passam.
    if (p.origem_dados === 'sankhya') return false;

    // Membros do pool de aprovadores (Edson, Felipe, João Victor) veem qualquer proposta em
    // estágio ativo (rascunho, revisão técnica ou aguardando aprovação) como pendência deles —
    // isso vale independente do "papel" cadastrado no banco (hoje os três estão como
    // 'engenheiro', mas têm poder de decisão do pool mesmo assim).
    if (APROVADORES_POOL.includes(currentUser.nome) &&
        ['rascunho', 'em_revisao_tecnica', 'aguardando_aprovacao'].includes(p.status)) {
      return true;
    }

    if (currentUser.papel === 'engenheiro') {
      return p.responsavel === currentUser.nome && (p.status === 'rascunho' || p.status === 'reprovada' || p.status === 'aprovada');
    }
    if (currentUser.papel === 'revisor_tecnico') return p.status === 'em_revisao_tecnica';
    if (currentUser.papel === 'analista_aprovador') return p.status === 'aguardando_aprovacao';
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
      default: return { ok: false, message: `Ação desconhecida: ${acao}` };
    }

    const { error } = await supabase.from('propostas').update(update).eq('id', propostaId);
    if (error) {
      console.error('Erro ao atualizar proposta:', error.message);
      // Antes essa falha ficava só no console — o usuário via o botão "não fazer nada".
      // Agora devolve pro modal mostrar a mensagem de verdade na tela.
      return { ok: false, message: error.message };
    }
    await carregarPropostas();
    // Atualiza o "selected" (modal aberto) com os dados recém-recarregados.
    const { data: atualizado } = await supabase.from('v_propostas_completo').select('*').eq('id', propostaId).maybeSingle();
    if (atualizado) setSelected({ ...atualizado, responsavel: atualizado.responsavel_nome, aprovador_pool: atualizado.aprovador_pool_nome });
    return { ok: true };
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

        .info-tip { position: relative; display: inline-flex; }
        .info-tip .info-tip-bubble {
          display: none; position: absolute; z-index: 40; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
          width: 220px; background: ${T.ink}; color: #fff; font-size: 11px; font-weight: 500; line-height: 1.5;
          padding: 9px 11px; border-radius: 7px; box-shadow: 0 8px 20px rgba(0,0,0,.25); text-align: left; white-space: normal;
        }
        .info-tip .info-tip-bubble::after {
          content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          border: 5px solid transparent; border-top-color: ${T.ink};
        }
        .info-tip:hover .info-tip-bubble, .info-tip:focus-within .info-tip-bubble { display: block; }

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

      <Sidebar view={view} setView={setView} pendCount={pendencias.length} papel={currentUser.papel} telasPermitidas={currentUser.telasPermitidas} />

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
          {renderTab('dashboard', <Dashboard stats={stats} propostas={propostasMes} todasPropostas={propostas} mesFiltro={mesFiltro} setMesFiltro={setMesFiltro} onNovaProposta={() => setModal('nova')} onNavigate={setView} />)}
          {renderTab('propostas', <PropostasTable propostas={propostas} titulo="Todas as propostas" onRowClick={p => { setSelected(p); setModal('detalhe'); }} />)}
          {renderTab('pendencias', <PropostasTable propostas={pendencias} titulo="Aguardando sua ação" empty="Nenhuma pendência — tudo em dia." onRowClick={p => { setSelected(p); setModal('detalhe'); }} />)}
          {renderTab('comercial', <TabErrorBoundary tab="Painel Comercial"><PainelComercial /></TabErrorBoundary>)}
          {renderTab('metricas', <Metricas propostas={propostas} />)}
          {renderTab('ciclo_comercial', <TabErrorBoundary tab="Ciclo Comercial"><CicloComercial /></TabErrorBoundary>)}
          {renderTab('produtividade', <Produtividade propostas={propostas} mesFiltro={mesFiltro} currentUser={currentUser} />)}
          {renderTab('faturamento', <Faturamento />)}
          {renderTab('consumo_mp', <TabErrorBoundary tab="Consumo de MP"><ConsumoMP /></TabErrorBoundary>)}
          {renderTab('placas_kalocer', <TabErrorBoundary tab="Placas Kalocer"><ConsumoPlacasKalocer /></TabErrorBoundary>)}
          {renderTab('analitico_mp', <TabErrorBoundary tab="Analítico"><AnaliticoMP /></TabErrorBoundary>)}
          {renderTab('carteira_estoque', <TabErrorBoundary tab="Carteira x Estoque"><CarteiraEstoque /></TabErrorBoundary>)}
          {renderTab('preco_compra', <TabErrorBoundary tab="Preço de Compra"><PrecoCompra /></TabErrorBoundary>)}
          {renderTab('almoxarifado', <TabErrorBoundary tab="Almoxarifado"><Almoxarifado currentUser={currentUser} /></TabErrorBoundary>)}
          {renderTab('equipamentos', <TabErrorBoundary tab="Equipamentos de Terceiros"><EquipamentosTerceiros /></TabErrorBoundary>)}
          {renderTab('acompanhamento_servico', <TabErrorBoundary tab="Acompanhamento de Serviço"><AcompanhamentoServico /></TabErrorBoundary>)}
          {renderTab('monitoramento_op', <TabErrorBoundary tab="Monitoramento OP"><MonitoramentoOP currentUser={currentUser} /></TabErrorBoundary>)}
          {renderTab('proposta_tecnica', <TabErrorBoundary tab="Proposta Técnica"><PropostaTecnica currentUser={currentUser} /></TabErrorBoundary>)}
          {renderTab('plaquinha_equipamento', <TabErrorBoundary tab="Plaquinha de Equipamento"><PlaquinhaEquipamento currentUser={currentUser} /></TabErrorBoundary>)}
          {renderTab('conf_apontamento', <TabErrorBoundary tab="Conf. Apontamento"><ConfApontamento /></TabErrorBoundary>)}
          {renderTab('reservas_pendentes', <TabErrorBoundary tab="Reservas Pendentes"><ReservasPendentes /></TabErrorBoundary>)}
          {renderTab('verificacao_projetos', <TabErrorBoundary tab="Verificação de Projetos"><VerificacaoProjetos currentUser={currentUser} /></TabErrorBoundary>)}
          {renderTab('analise_comercial', <TabErrorBoundary tab="Análise Comercial"><AnaliseComercial /></TabErrorBoundary>)}
          {renderTab('prospeccao_clientes', <TabErrorBoundary tab="Prospecção de Clientes"><ProspeccaoClientes /></TabErrorBoundary>)}
          {renderTab('almoxarifado_fluxo', <TabErrorBoundary tab="Fluxo de Materiais"><AlmoxarifadoFluxo currentUser={currentUser} /></TabErrorBoundary>)}
          {renderTab('pedidosvale', <PedidosVale />)}
          {renderTab('aberturacotacao', <TabErrorBoundary tab="Abertura de Cotação"><AberturaCotacao currentUser={currentUser} /></TabErrorBoundary>)}
          {renderTab('ranking', <TabErrorBoundary tab="Ranking"><RankingPontuacao /></TabErrorBoundary>)}
          {renderTab('metas', <TabErrorBoundary tab="Metas"><PainelMetas currentUser={currentUser} /></TabErrorBoundary>)}
          {renderTab('auditoria', <TabErrorBoundary tab="Auditoria"><Auditoria /></TabErrorBoundary>)}
          {renderTab('integracao', <Integracao />)}
          {renderTab('admin', <Admin currentUser={currentUser} />)}
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
function Sidebar({ view, setView, pendCount, papel, telasPermitidas }) {
  // Controle de acesso: telasPermitidas vem de colaborador_telas (banco).
  // null = sem restrição cadastrada -> mantém acesso total (comportamento antigo).
  // Regra legada mantida como fallback pro papel 'comercial' sem linhas cadastradas.
  const ACESSO_LEGADO = {
    comercial: ['comercial', 'faturamento', 'equipamentos'],
  };
  const todosItems = [
    { id: 'dashboard',    label: 'Visão geral',           icon: LayoutGrid },
    { id: 'pendencias',   label: 'Minhas pendências',      icon: ClipboardCheck, badge: pendCount },
    { id: 'propostas',    label: 'Todas as propostas',     icon: FileStack },
    { id: 'metricas',     label: 'Métricas',               icon: BarChart2 },
    { id: 'ciclo_comercial', label: 'Ciclo Comercial',     icon: Workflow },
    { id: 'produtividade',label: 'Produtividade',          icon: Gauge },
    { id: 'comercial',    label: 'Painel Comercial',       icon: TrendingUp },
    { id: 'faturamento',  label: 'Faturamento (Sankhya)',  icon: DollarSign },
    { id: 'consumo_mp',   label: 'Consumo de MP',          icon: Layers },
    { id: 'placas_kalocer', label: 'Placas Kalocer',       icon: Layers },
    { id: 'analitico_mp', label: 'Analítico',              icon: BarChart2 },
    { id: 'carteira_estoque', label: 'Carteira x Estoque',  icon: Package },
    { id: 'preco_compra',  label: 'Preço de Compra',        icon: DollarSign },
    { id: 'almoxarifado', label: 'Almoxarifado',           icon: Package },
    { id: 'equipamentos', label: 'Equip. Terceiros',       icon: Webhook },
    { id: 'acompanhamento_servico', label: 'Falta Nota de Serviço', icon: AlertTriangle },
    { id: 'monitoramento_op', label: 'Monitoramento OP', icon: Gauge },
    { id: 'proposta_tecnica', label: 'Proposta Técnica', icon: FileStack },
    { id: 'plaquinha_equipamento', label: 'Plaquinha de Equipamento', icon: Package },
    { id: 'conf_apontamento', label: 'Conf. Apontamento', icon: ClipboardCheck },
    { id: 'reservas_pendentes', label: 'Reservas Pendentes', icon: AlertTriangle },
    { id: 'verificacao_projetos', label: 'Verificação de Projetos', icon: ClipboardCheck },
    { id: 'analise_comercial', label: 'Análise Comercial', icon: TrendingUp },
    { id: 'prospeccao_clientes', label: 'Prospecção de Clientes', icon: UserPlus },
    { id: 'almoxarifado_fluxo', label: 'Fluxo de Materiais', icon: Package },
    { id: 'pedidosvale',  label: 'Pedidos Vale',           icon: FileWarning },
    { id: 'aberturacotacao', label: 'Abertura de Cotação',  icon: FileStack },
    { id: 'ranking',      label: 'Ranking de Pontuação',    icon: TrendingUp },
    { id: 'metas',        label: 'Metas',                   icon: SlidersHorizontal },
    { id: 'auditoria',    label: 'Auditoria',              icon: History },
    { id: 'integracao',   label: 'Integrações',            icon: Workflow },
  ];
  const permitidos = telasPermitidas || ACESSO_LEGADO[papel];
  const items = permitidos ? todosItems.filter(i => permitidos.includes(i.id)) : todosItems;
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
                padding: '10px 12px', borderRadius: 8, border: 'none', textAlign: 'left',
                background: active ? T.terracottaSoft : 'transparent',
                color: active ? T.terracottaText : T.inkDim,
                borderLeft: active ? `2.5px solid ${T.terracotta}` : '2.5px solid transparent',
                transition: 'background .18s ease, color .18s ease, border-color .18s ease',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.panelAlt; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={17} strokeWidth={active ? 2.3 : 2} style={{ flexShrink: 0 }} />
                <span className="sidebar-item-label" style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{it.label}</span>
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
  comercial: 'Painel Comercial — Faturamento do Mês',
  produtividade: 'Produtividade da equipe', faturamento: 'Faturamento (Sankhya)',
  consumo_mp: 'Consumo de Matéria-Prima — SGQ',
  almoxarifado: 'Almoxarifado — Estoque & Movimentação',
  equipamentos: 'Equipamentos de Terceiros',
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
        {view === 'dashboard' && (
          <div style={{ position: 'relative' }}>
            <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} className="focus-ring"
              style={{
                appearance: 'none', background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 5,
                color: T.inkDim, fontSize: 12.5, padding: '6px 28px 6px 10px', fontWeight: 500,
              }}>
              <option value="ACUMULADO">Acumulado {ANO_OPERACIONAL}</option>
              {MESES_ORDEM.map(m => <option key={m} value={m}>{MESES_LABEL[m]} 2026</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: 9, color: T.inkFaint, pointerEvents: 'none' }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {(currentUser.papel === 'engenheiro' || currentUser.papel === 'gestor') && (
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
function Dashboard({ stats, propostas, todasPropostas, mesFiltro, setMesFiltro, onNovaProposta, onNavigate }) {
  const [kpiModal, setKpiModal] = useState(null); // { titulo, itens } | null

  const labelPeriodo = mesFiltro === 'ACUMULADO' ? `no acumulado de ${ANO_OPERACIONAL}` : 'no mês';

  // ── grupos reais por proposta do mês (não pela tabela agregada Sankhya) ──
  // conhecimento_pedido = true  → já virou pedido / "confirmada"
  // conhecimento_pedido = false → ainda não confirmou (hoje aparece com status "Aguardando confirmação")
  const propostasConfirmadas = useMemo(() => propostas.filter(p => p.conhecimento_pedido), [propostas]);
  const propostasNaoConfirmadas = useMemo(() => propostas.filter(p => !p.conhecimento_pedido), [propostas]);
  const valorConfirmadasMes = propostasConfirmadas.reduce((s, p) => s + (Number(p.valor_liquido) || 0), 0);
  const valorNaoConfirmadasMes = propostasNaoConfirmadas.reduce((s, p) => s + (Number(p.valor_liquido) || 0), 0);
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
      const doMes = todasPropostas.filter(p =>
        !ehPropostaTemplateAutomacao(p) && p.mes === mes && p.data_abertura && new Date(p.data_abertura + 'T00:00:00').getFullYear() === ANO_OPERACIONAL
      );
      return { mes, count: doMes.length, valor: doMes.reduce((s, p) => s + (p.valor_liquido || 0), 0) };
    }).filter(m => m.count > 0); // só mostra meses que já têm proposta cadastrada
  }, [todasPropostas]);

  const porCliente = useMemo(() => {
    const map = {};
    propostas.forEach(p => {
      const c = p.cliente || '—';
      if (!map[c]) map[c] = { nome: c, count: 0, valor: 0 };
      map[c].count++;
      map[c].valor += Number(p.valor_liquido) || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [propostas]);

  const evolucaoComVariacao = useMemo(() => {
    return evolucaoMensal.map((m, i) => {
      const anterior = evolucaoMensal[i - 1];
      const ticketMedio = m.count ? m.valor / m.count : 0;
      const varCount = anterior && anterior.count ? ((m.count - anterior.count) / anterior.count) * 100 : null;
      const varTicket = anterior && anterior.count ? ((ticketMedio - (anterior.valor / (anterior.count || 1))) / (anterior.valor / (anterior.count || 1) || 1)) * 100 : null;
      return { ...m, ticketMedio, varCount, varTicket };
    });
  }, [evolucaoMensal]);

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
    // Segue o mês selecionado no topo (mesFiltro): busca o sync mais recente cujo
    // período (data_ini) caiu dentro do mês/ano selecionado. No "Acumulado", pega
    // o sync mais recente que cobre o ano inteiro (data_ini em janeiro do ano
    // operacional) — geralmente o sync manual "ano inteiro" feito sob demanda.
    setProdLoading(true);
    const mesIdx = MESES_ORDEM.indexOf(mesFiltro); // 0-based, -1 se for ACUMULADO
    supabase
      .from('produtividade_orcamentos')
      .select('data_ini, data_fim, sincronizado_em')
      .order('sincronizado_em', { ascending: false })
      .limit(200)
      .then(async ({ data: periodos }) => {
        const candidatos = (periodos || []).filter(p => {
          if (!p.data_ini) return false;
          const d = new Date(p.data_ini + 'T00:00:00');
          if (d.getFullYear() !== ANO_OPERACIONAL) return false;
          return mesFiltro === 'ACUMULADO' ? d.getMonth() === 0 : d.getMonth() === mesIdx;
        });
        const periodo = candidatos[0] || null; // já ordenado por sincronizado_em desc
        if (!periodo) {
          setProdPedidos([]);
          setProdOrc([]);
          setProdPeriodo(null);
          setProdLoading(false);
          return;
        }
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
  }, [mesFiltro]); // agora acompanha o filtro de mês lá de cima

  const maxEscopo = Math.max(...porEscopo.map(([, v]) => v), 1);
  const maxMensal = Math.max(...evolucaoMensal.map(m => m.count), 1);
  const maxProd = Math.max(...prodOrc.map(o => o.total_geral || 0), ...prodPedidos.map(p => p.total_pedidos || 0), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1400 }}>

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

      {/* ── SEÇÃO: COMERCIAL ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.terracottaText, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Comercial {mesFiltro !== 'ACUMULADO' ? `· ${MESES_LABEL[mesFiltro]} ${ANO_OPERACIONAL}` : `· Acumulado ${ANO_OPERACIONAL}`}
        </div>

        {/* ── KPI ROW (7 cards) ── */}
        <div className="grid-kpis-7">
          <Kpi label={`Propostas total ${labelPeriodo}`} value={stats.total} icon={FileStack}
            sub={`todas as propostas cadastradas ${labelPeriodo}`}
            onClick={() => setKpiModal({ titulo: `Propostas total ${labelPeriodo} — todas`, itens: propostas })} />
          <Kpi label="Propostas em Aberto/Sem pedido" value={propostasNaoConfirmadas.length} icon={Clock3} tone="amber"
            sub={`${fmtMoedaCompacta(valorNaoConfirmadasMes)} · ainda não viraram pedido`}
            onClick={() => setKpiModal({ titulo: 'Propostas em Aberto/Sem pedido — valor de cada proposta', itens: propostasNaoConfirmadas })} />
          <Kpi label={`Valor confirmado ${labelPeriodo}`} value={fmtMoedaCompacta(valorConfirmadasMes)} icon={DollarSign}
            sub="soma do valor líquido das propostas que viraram pedido"
            info="Soma o valor líquido da própria proposta (calculado no orçamento do Sankhya) das propostas que já viraram pedido (conhecimento_pedido = true). Esse valor é independente de faturamento/Nota Fiscal — é o valor líquido da proposta em si, não o Net Offer Value faturado (esse é assunto do Painel Comercial/Faturamento)."
            onClick={() => setKpiModal({ titulo: `Valor confirmado ${labelPeriodo} — propostas confirmadas`, itens: propostasConfirmadas })} />
          <Kpi
            label="Pedidos confirmados"
            value={propostasConfirmadas.length}
            icon={CheckCircle2} tone="olive"
            sub={`${fmtMoedaCompacta(valorConfirmadasMes)} · já viraram pedido`}
            onClick={() => setKpiModal({ titulo: 'Pedidos confirmados (viraram pedido)', itens: propostasConfirmadas })}
          />
          <OrigemCard percWord={stats.percWord} wordCount={stats.wordCount} sankhyaCount={stats.sankhyaCount} />
        </div>
      </div>

      {kpiModal && <KpiDetalheModal titulo={kpiModal.titulo} itens={kpiModal.itens} onClose={() => setKpiModal(null)} />}

      {/* ── ROW 2: Volume mensal + Produtividade da equipe ── */}
      <div className="grid-2col-wide">
        <Panel title={`Volume de propostas — ${evolucaoMensal.length ? `Jan a ${MESES_LABEL[evolucaoMensal[evolucaoMensal.length - 1].mes]}` : ANO_OPERACIONAL}`} subtitle="Quantidade e ticket médio por mês · clique numa barra pra ver aquele mês na Visão Geral">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 170, padding: '8px 4px 0' }}>
            {evolucaoComVariacao.map(m => {
              const h = Math.max((m.count / maxMensal) * 110, 4);
              const isActive = m.mes === mesFiltro;
              return (
                <button key={m.mes} onClick={() => setMesFiltro(m.mes)} title={`Ver propostas de ${MESES_LABEL[m.mes]} · ticket médio ${fmtMoedaCompacta(m.ticketMedio)}`} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, color: isActive ? T.terracotta : T.inkDim, fontFamily: FONT_DISPLAY }}>{m.count}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 600, marginBottom: 6, color: m.varCount == null ? T.inkFaint : m.varCount >= 0 ? T.oliveText : T.rustText }}>
                    {m.varCount == null ? '—' : `${m.varCount >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(m.varCount))}%`}
                  </div>
                  <div style={{ width: '100%', maxWidth: 40, height: h, background: isActive ? T.terracotta : T.line, borderRadius: '3px 3px 0 0', transition: 'height .4s ease' }} />
                  <div style={{ fontSize: 10.5, color: isActive ? T.terracottaText : T.inkFaint, marginTop: 8, fontWeight: isActive ? 700 : 400 }}>{MESES_LABEL[m.mes]}</div>
                  <div style={{ fontSize: 9, color: T.inkFaint, marginTop: 2 }}>{fmtMoedaCompacta(m.ticketMedio)}/prop.</div>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 8, marginBottom: 0 }}>
            % em cada barra = variação da quantidade de propostas vs mês anterior. Abaixo do mês: ticket médio (valor líquido ÷ nº de propostas) daquele mês.
          </p>
        </Panel>

        <Panel
          title="Produtividade da equipe"
          subtitle={
            prodLoading ? 'Carregando…'
            : prodPeriodo ? `Sync de ${mesFiltro === 'ACUMULADO' ? `acumulado ${ANO_OPERACIONAL}` : MESES_LABEL[mesFiltro]}: ${fmtData(prodPeriodo.data_ini)} → ${fmtData(prodPeriodo.data_fim)}`
            : `Sem sync para ${mesFiltro === 'ACUMULADO' ? `o acumulado de ${ANO_OPERACIONAL}` : MESES_LABEL[mesFiltro]}`
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
              Sem dados sincronizados para <strong>{mesFiltro === 'ACUMULADO' ? `o acumulado de ${ANO_OPERACIONAL}` : MESES_LABEL[mesFiltro]}</strong> — sincronize na aba <strong>Produtividade</strong>.
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
                    Conhecimento de pedidos confirmados
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

      {/* ── SEÇÃO: EQUIPE E CARTEIRA ── */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.blueText, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: -12 }}>
        Equipe e carteira
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

        <Panel title="Clientes com mais propostas" subtitle={`Quem mais recebeu propostas ${labelPeriodo}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {porCliente.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '14px 0', color: T.inkFaint, fontSize: 12.5 }}>Sem propostas no período.</div>
            ) : porCliente.map(c => (
              <div key={c.nome} style={{ display: 'flex', alignItems: 'center', fontSize: 12, gap: 10 }}>
                <span style={{ width: 120, color: T.inkDim, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11.5 }} title={c.nome}>{c.nome}</span>
                <div style={{ flex: 1, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.count / (porCliente[0]?.count || 1)) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 3 }} />
                </div>
                <span style={{ width: 20, textAlign: 'right', fontWeight: 700, color: T.ink, fontFamily: FONT_DISPLAY, fontSize: 13 }}>{c.count}</span>
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

      {/* ── SEÇÃO: ORIGEM E AÇÕES ── */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.amberText, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: -12 }}>
        Origem dos dados e ações
      </div>

      {/* ── ROW 4: Origem detalhada + CTA registro manual ── */}
      <div className="grid-2col">
        <Panel title="Propostas: Manual vs ERP" subtitle={`Origem dos dados cadastrados ${labelPeriodo}`}>
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

function InfoTip({ texto }) {
  return (
    <span className="info-tip" tabIndex={0} style={{ cursor: 'help' }} onClick={e => e.stopPropagation()}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%', background: T.lineSoft, color: T.inkFaint,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontStyle: 'italic', fontFamily: 'Georgia, serif',
      }}>i</span>
      <span className="info-tip-bubble">{texto}</span>
    </span>
  );
}

function Kpi({ label, value, icon: Icon, tone, sub, onClick, info }) {
  const IconeSeguro = Icon || CircleDot;
  const toneColor = tone === 'amber' ? T.amberText : tone === 'rust' ? T.rustText : tone === 'olive' ? T.oliveText : tone === 'blue' ? T.blueText : T.ink;
  const toneSoft = tone === 'amber' ? T.amberSoft : tone === 'rust' ? T.rustSoft : tone === 'olive' ? T.oliveSoft : tone === 'blue' ? T.blueSoft : T.terracottaSoft;
  const toneAccent = tone === 'amber' ? T.amber : tone === 'rust' ? T.rust : tone === 'olive' ? T.olive : tone === 'blue' ? T.blue : T.terracotta;
  return (
    <div onClick={onClick} style={{
      position: 'relative', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: '20px 20px 18px',
      boxShadow: SHADOW_SM, transition: 'box-shadow .25s ease, transform .25s ease, border-color .25s ease',
      cursor: onClick ? 'pointer' : 'default', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_LG; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${toneAccent}33`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_SM; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = T.line; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: toneAccent, opacity: 0.85 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, color: T.inkFaint, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
          {label}
          {info && <InfoTip texto={info} />}
        </span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: toneSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconeSeguro size={15} color={toneColor} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: toneColor, marginTop: 15, fontSize: 32, letterSpacing: '-0.015em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 6, lineHeight: 1.4 }}>{sub}</div>}
      {onClick && <div style={{ fontSize: 10, color: T.terracottaText, marginTop: 8, fontWeight: 700, letterSpacing: '0.01em' }}>Ver detalhamento →</div>}
    </div>
  );
}

/* ============================================================================
   MODAL DE DETALHAMENTO DE KPI — mostra quem está confirmado/não confirmado,
   com valor, a partir das propostas reais do mês (não da tabela agregada Sankhya)
============================================================================ */
function KpiDetalheModal({ titulo, itens, onClose }) {
  const totalValor = itens.reduce((s, p) => s + (Number(p.valor_liquido) || 0), 0);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,23,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="scale-in" onClick={e => e.stopPropagation()} style={{ background: T.panel, borderRadius: 12, width: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: SHADOW_LG }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>{titulo}</h3>
            <span style={{ fontSize: 12, color: T.inkFaint }}>{itens.length} proposta{itens.length !== 1 ? 's' : ''} · {fmtMoedaCompacta(totalValor)}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={18} /></button>
        </div>
        <div style={{ overflowY: 'auto', padding: '6px 0' }}>
          {itens.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: T.inkFaint, fontSize: 13 }}>Nenhuma proposta nesse grupo.</div>
          ) : itens.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: `1px solid ${T.lineSoft}` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT_DISPLAY, color: T.ink }}>{p.br}</div>
                <div style={{ fontSize: 12, color: T.inkDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.cliente}</div>
              </div>
              <div style={{ fontSize: 13, fontFamily: FONT_DISPLAY, color: T.inkDim, flexShrink: 0, marginLeft: 12 }}>{fmtMoeda(p.valor_liquido)}</div>
            </div>
          ))}
        </div>
      </div>
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
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 24, boxShadow: SHADOW_SM }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: title ? 18 : 0 }}>
        <div>
          {title && <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.ink, letterSpacing: '-0.01em' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '5px 0 0', lineHeight: 1.5 }}>{subtitle}</p>}
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
  const [filtroOrigem, setFiltroOrigem] = useState('todos'); // todos | sankhya | manual_word
  const [filtroConhecimento, setFiltroConhecimento] = useState('todos'); // todos | sim | nao
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const filtradas = useMemo(() => {
    return propostas.filter(p => {
      const matchBusca = p.br.toLowerCase().includes(busca.toLowerCase()) || p.cliente.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
      const matchMes = filtroMes === 'todos' || p.mes === filtroMes;
      const matchOrigem = filtroOrigem === 'todos' || p.origem_dados === filtroOrigem;
      const matchConhecimento = filtroConhecimento === 'todos' || (filtroConhecimento === 'sim' ? !!p.conhecimento_pedido : !p.conhecimento_pedido);
      return matchBusca && matchStatus && matchMes && matchOrigem && matchConhecimento;
    });
  }, [propostas, busca, filtroStatus, filtroMes, filtroOrigem, filtroConhecimento]);

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
          <select value={filtroOrigem} onChange={e => { setFiltroOrigem(e.target.value); setPage(1); }} className="focus-ring"
            style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 10px', fontSize: 12.5, color: T.inkDim }}>
            <option value="todos">Origem: todas</option>
            <option value="sankhya">Sankhya</option>
            <option value="manual_word">Manual (Word/e-mail)</option>
          </select>
          <select value={filtroConhecimento} onChange={e => { setFiltroConhecimento(e.target.value); setPage(1); }} className="focus-ring"
            style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 10px', fontSize: 12.5, color: T.inkDim }}>
            <option value="todos">Conhecimento de pedido: todos</option>
            <option value="sim">Com conhecimento de pedido</option>
            <option value="nao">Sem conhecimento de pedido</option>
          </select>
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
              {['BR / Ref', 'Cliente', 'Escopo', 'Origem', 'Entrega prev.', 'Atraso', 'Dias em aberto', 'Reprog.', 'Valor', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginadas.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: T.inkFaint, fontSize: 13 }}>{empty}</td></tr>
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
                  <td style={{ padding: '12px 16px', fontSize: 12.5, fontFamily: FONT_DISPLAY, color: T.inkDim }}>
                    {p.dias_uteis_aberto == null ? '—' :
                      p.status === 'concluida' || p.conhecimento_pedido
                        ? <span style={{ color: T.inkFaint }}>fechou em {p.dias_uteis_aberto}d</span>
                        : <span style={{ fontWeight: 600, color: p.dias_uteis_aberto > 45 ? T.rustText : T.ink }}>{p.dias_uteis_aberto}d úteis</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5 }}>
                    {p.foi_reprogramada ? <span style={{ color: T.rustText, fontWeight: 600 }}>Sim</span> : <span style={{ color: T.inkFaint }}>Não</span>}
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

function Metricas({ propostas: propostasTodas }) {
  const mesAtualIdx = Math.min(new Date().getMonth(), MESES_ORDEM.length - 1);
  const [mesIni, setMesIni] = useState('JANEIRO');
  const [mesFim, setMesFim] = useState(MESES_ORDEM[mesAtualIdx]);

  const propostas = useMemo(() =>
    propostasTodas.filter(p =>
      !ehPropostaTemplateAutomacao(p) &&
      p.data_abertura && new Date(p.data_abertura + 'T00:00:00').getFullYear() === ANO_OPERACIONAL
    ),
  [propostasTodas]);

  const base = useMemo(() => {
    const idxIni = MESES_ORDEM.indexOf(mesIni);
    const idxFim = MESES_ORDEM.indexOf(mesFim);
    const [lo, hi] = idxIni <= idxFim ? [idxIni, idxFim] : [idxFim, idxIni];
    return propostas.filter(p => {
      const idx = MESES_ORDEM.indexOf(p.mes);
      return idx >= lo && idx <= hi;
    });
  }, [propostas, mesIni, mesFim]);

  const rankingClientes = useMemo(() => {
    const map = {};
    base.forEach(p => {
      const c = p.cliente || '—';
      if (!map[c]) map[c] = { nome: c, propostas: 0, confirmadas: 0, valorConfirmado: 0 };
      map[c].propostas++;
      if (p.conhecimento_pedido) { map[c].confirmadas++; map[c].valorConfirmado += Number(p.valor_liquido) || 0; }
    });
    return Object.values(map)
      .map(c => ({ ...c, taxa: c.propostas ? Math.round((c.confirmadas / c.propostas) * 100) : 0 }))
      .sort((a, b) => b.propostas - a.propostas)
      .slice(0, 10);
  }, [base]);

  const ranking = useMemo(() => {
    const map = {};
    base.forEach(p => {
      const r = p.responsavel || p.responsavel_nome || '—';
      if (!map[r]) map[r] = { nome: r, total: 0, confirmadas: 0, aguardando: 0, reprovadas: 0 };
      map[r].total++;
      if (p.conhecimento_pedido) map[r].confirmadas++;
      else map[r].aguardando++;
      if (p.status === 'reprovada') map[r].reprovadas++;
    });
    return Object.values(map).sort((a, b) => b.confirmadas - a.confirmadas).slice(0, 8);
  }, [base]);

  const mensal = useMemo(() => {
    const idxIni = MESES_ORDEM.indexOf(mesIni);
    const idxFim = MESES_ORDEM.indexOf(mesFim);
    const [lo, hi] = idxIni <= idxFim ? [idxIni, idxFim] : [idxFim, idxIni];
    return MESES_ORDEM.filter((_, i) => i >= lo && i <= hi).map(mes => {
      const doMes = propostas.filter(p => p.mes === mes);
      const confirmadasDoMes = doMes.filter(p => p.conhecimento_pedido);
      return { mes, total: doMes.length, confirmadas: confirmadasDoMes.length, itensTotal: doMes, itensConfirmadas: confirmadasDoMes };
    });
  }, [propostas, mesIni, mesFim]);

  const [mesDrill, setMesDrill] = useState(null); // { mes } | null

  const maxMensal = Math.max(...mensal.map(m => m.total), 1);
  const maxRanking = Math.max(...ranking.map(r => r.total), 1);
  const maxRankingCli = Math.max(...rankingClientes.map(c => c.propostas), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1200 }}>

      {/* Filtro período — De/Até por mês, igual ao padrão da Visão Geral */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, color: T.inkDim, fontWeight: 600 }}>De</span>
        <div style={{ position: 'relative' }}>
          <select value={mesIni} onChange={e => setMesIni(e.target.value)} className="focus-ring" style={{
            appearance: 'none', background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 5,
            color: T.inkDim, fontSize: 12.5, padding: '6px 28px 6px 10px', fontWeight: 500,
          }}>
            {MESES_ORDEM.map(m => <option key={m} value={m}>{MESES_LABEL[m]}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: 9, color: T.inkFaint, pointerEvents: 'none' }} />
        </div>
        <span style={{ fontSize: 12.5, color: T.inkDim, fontWeight: 600 }}>a</span>
        <div style={{ position: 'relative' }}>
          <select value={mesFim} onChange={e => setMesFim(e.target.value)} className="focus-ring" style={{
            appearance: 'none', background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 5,
            color: T.inkDim, fontSize: 12.5, padding: '6px 28px 6px 10px', fontWeight: 500,
          }}>
            {MESES_ORDEM.map(m => <option key={m} value={m}>{MESES_LABEL[m]}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: 9, color: T.inkFaint, pointerEvents: 'none' }} />
        </div>
        <button onClick={() => { setMesIni('JANEIRO'); setMesFim(MESES_ORDEM[MESES_ORDEM.length - 1]); }} style={{
          padding: '6px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
          background: T.panelAlt, color: T.inkDim,
        }}>Ano todo</button>
        <span style={{ fontSize: 12, color: T.inkFaint, alignSelf: 'center', marginLeft: 4 }}>
          {base.length} propostas de {MESES_LABEL[mesIni]} a {MESES_LABEL[mesFim]} de {ANO_OPERACIONAL} · exclui modelos de automação (VALE - DISU e propostas BRV) · revisões do Sankhya já deduplicadas na origem (fica só a versão vencedora de cada BR/MATERIAL/SERVIÇO)
        </span>
      </div>

      {/* Ranking de clientes */}
      <Panel title="Ranking por cliente" subtitle="Propostas feitas × viraram pedido × valor real confirmado (carteira)"
        right={<BotaoExportar onClick={() => exportCSV(rankingClientes, 'ranking_clientes.csv', ['nome','propostas','confirmadas','taxa','valorConfirmado'])} small />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {rankingClientes.map((c, i) => {
            return (
            <div key={c.nome} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 18, textAlign: 'right', fontSize: 11, color: T.inkFaint, fontFamily: FONT_DISPLAY }}>#{i + 1}</span>
              <span style={{ width: 170, fontSize: 13, color: T.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.nome}>{c.nome}</span>
              <div style={{ flex: 1, background: T.amberSoft, height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative' }} title={`${c.confirmadas} de ${c.propostas} propostas viraram pedido (${c.taxa}%) · ${c.propostas - c.confirmadas} ainda aguardando virar pedido`}>
                <div style={{ width: `${(c.propostas / maxRankingCli) * 100}%`, height: '100%', borderRadius: 4, background: T.amberSoft, position: 'absolute', left: 0, top: 0 }} />
                <div style={{ width: `${(c.confirmadas / maxRankingCli) * 100}%`, height: '100%', background: T.terracotta, borderRadius: 4, position: 'absolute', left: 0, top: 0 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12, fontFamily: FONT_DISPLAY, width: 250, justifyContent: 'flex-end' }}>
                <span style={{ color: T.ink, fontWeight: 700 }}>{c.propostas} prop.</span>
                <span style={{ color: T.oliveText }}>{c.confirmadas} pedido{c.confirmadas !== 1 ? 's' : ''}</span>
                <span style={{ color: T.inkFaint }}>({c.taxa}%)</span>
                <span style={{ color: T.oliveText, fontWeight: 700 }}>{fmtMoedaCompacta(c.valorConfirmado)}</span>
              </div>
            </div>
          );})}
        </div>
        <p style={{ fontSize: 11, color: T.inkFaint, marginTop: 10, marginBottom: 0 }}>
          <span style={{ display: 'inline-block', width: 9, height: 9, background: T.terracotta, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> viraram pedido
          <span style={{ display: 'inline-block', width: 9, height: 9, background: T.amberSoft, borderRadius: 2, margin: '0 4px 0 14px', verticalAlign: 'middle' }} /> ainda aguardando virar pedido (não é faturamento)
          <span style={{ marginLeft: 10 }}>— valor à direita é o valor líquido real já confirmado da proposta (carteira), barra proporcional ao maior cliente da lista (top 10 por quantidade de propostas)</span>
        </p>
      </Panel>

      {/* Evolução mensal */}
      <Panel title="Evolução mensal" subtitle={`De ${MESES_LABEL[mesIni]} a ${MESES_LABEL[mesFim]} · cadastradas vs viraram pedido (confirmadas) · clique num mês pra ver quais propostas são`}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 140, padding: '10px 4px 0', overflowX: 'auto' }}>
          {mensal.map(m => {
            const hT = Math.max((m.total / maxMensal) * 100, m.total > 0 ? 4 : 2);
            const hC = Math.max((m.confirmadas / maxMensal) * 100, m.confirmadas > 0 ? 4 : 2);
            const suspeito = m.confirmadas > m.total; // não deveria acontecer — sinal de dado inconsistente
            return (
              <button key={m.mes} onClick={() => setMesDrill(m)} title="Ver quais propostas compõem esse mês" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 60,
                background: 'none', border: 'none', cursor: m.total > 0 ? 'pointer' : 'default', padding: 0,
              }}>
                <div style={{ fontSize: 10, color: suspeito ? T.rustText : T.inkFaint, fontWeight: suspeito ? 700 : 400, marginBottom: 4 }}>
                  {m.confirmadas}/{m.total}{suspeito ? ' ⚠' : ''}
                </div>
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  <div style={{ width: 16, height: hT, background: T.line, borderRadius: '2px 2px 0 0' }} />
                  <div style={{ width: 16, height: hC, background: T.terracotta, borderRadius: '2px 2px 0 0' }} />
                </div>
                <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 6 }}>{MESES_LABEL[m.mes]}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: T.inkFaint }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.line, borderRadius: 2, marginRight: 4 }} />Cadastradas</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.terracotta, borderRadius: 2, marginRight: 4 }} />Confirmadas (viraram pedido)</span>
        </div>
        <p style={{ fontSize: 11, color: T.inkFaint, marginTop: 8, marginBottom: 0 }}>
          "Confirmadas" conta pelo <strong>mês de abertura</strong> da proposta (campo "mes"), não pelo mês em que ela virou pedido. Se algum mês aparecer com ⚠, o nº de confirmadas ultrapassou o de cadastradas naquele mês — clique na barra pra ver a lista exata de propostas e identificar qual registro está com o mês trocado.
        </p>
      </Panel>

      {mesDrill && (
        <KpiDetalheModal
          titulo={`${MESES_LABEL[mesDrill.mes]} — ${mesDrill.total} cadastradas · ${mesDrill.confirmadas} confirmadas`}
          itens={mesDrill.itensTotal}
          onClose={() => setMesDrill(null)}
        />
      )}

      {/* Ranking responsáveis */}
      <Panel title="Ranking por responsável" subtitle="Total de propostas · confirmadas (viraram pedido) · ainda aguardando"
        right={<BotaoExportar onClick={() => exportCSV(ranking, 'ranking_responsaveis.csv', ['nome','total','confirmadas','aguardando','reprovadas'])} small />}
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
                <span style={{ color: T.oliveText }}>✓{r.confirmadas}</span>
                <span style={{ color: T.amberText }}>⏳{r.aguardando}</span>
                {r.reprovadas > 0 && <span style={{ color: T.rustText }}>✗{r.reprovadas}</span>}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ============================================================================
   CICLO COMERCIAL — proposta → pedido → faturamento
   Usa a view v_ciclo_comercial_proposta (join propostas + pedidos_itens + nota_venda_itens por BR)
   Responde: fizemos a proposta em X, virou pedido quando? foi faturado quando?
============================================================================ */
function CicloComercial() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState('todas');
  const mesAtualIdxCC = Math.min(new Date().getMonth(), MESES_ORDEM.length - 1);
  const [mesIni, setMesIni] = useState('JANEIRO');
  const [mesFim, setMesFim] = useState(MESES_ORDEM[mesAtualIdxCC]);
  const [mesFaturamentoAberto, setMesFaturamentoAberto] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const [notasFiscais, setNotasFiscais] = useState([]); // linhas reais de faturamento_resumo (tipmov='V'), não agregadas por proposta

  const carregar = useCallback(() => {
    setLoading(true);
    Promise.all([
      supabase.from('v_ciclo_comercial_proposta').select('*').order('data_abertura', { ascending: false }),
      supabase.from('faturamento_resumo').select('br,data_faturamento,valor_nota,net_offer_value').eq('tipmov', 'V'),
    ]).then(([{ data, error }, { data: nfs, error: errNfs }]) => {
      if (error) console.error('Erro ao carregar ciclo comercial:', error.message);
      if (errNfs) console.error('Erro ao carregar notas fiscais:', errNfs.message);
      setDados((data || []).filter(d => !ehPropostaTemplateAutomacao(d)));
      setNotasFiscais(nfs || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const sincronizarFaturamento = async () => {
    setSyncing(true); setSyncMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(
        `https://sieztnpchjjmrwrmrhoa.supabase.co/functions/v1/sankhya-faturamento-resumo-sync`,
        { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ dataIni: '2026-01-01', dataFim: new Date().toISOString().slice(0, 10) }) }
      );
      const j = await r.json();
      if (!j.ok) throw new Error(j.erro || 'Falha na sincronização');
      setSyncMsg(`✓ ${j.notas_sincronizadas} notas sincronizadas (Valor da Nota + Net Offer Value)`);
      await carregar();
    } catch (e) {
      setSyncMsg(`✗ ${String(e?.message || e)}`);
    }
    setSyncing(false);
  };

  const dadosFiltrados = useMemo(() => {
    const idxIni = MESES_ORDEM.indexOf(mesIni);
    const idxFim = MESES_ORDEM.indexOf(mesFim);
    const [lo, hi] = idxIni <= idxFim ? [idxIni, idxFim] : [idxFim, idxIni];
    return dados.filter(d => {
      const idx = MESES_ORDEM.indexOf(d.mes_proposta);
      return idx >= lo && idx <= hi;
    });
  }, [dados, mesIni, mesFim]);

  // Helper: soma valorFaturado/faturamentoLiquido/netValue UMA VEZ por BR — a view
  // v_ciclo_comercial_proposta anexa o total de faturamento/pedido daquele BR em
  // TODAS as linhas de proposta daquele BR (ex.: quando um BR tem proposta de
  // MATERIAL e de SERVIÇO separadas, as duas linhas mostram o mesmo valor faturado
  // do BR inteiro). Sem esse dedup, somar por linha duplica o valor faturado.
  const somaPorBrUnico = (lista) => {
    let valorTotal = 0, valorSemPedido = 0;
    const porBr = new Map();
    lista.forEach(d => {
      valorTotal += Number(d.valor_liquido) || 0;
      if (d.etapa_atual === 'sem_pedido') valorSemPedido += Number(d.valor_liquido) || 0;
      if (d.br && !porBr.has(d.br)) {
        porBr.set(d.br, {
          netValue: Number(d.net_value) || 0,
          valorFaturado: Number(d.valor_faturado) || 0,
          faturamentoLiquido: Number(d.net_offer_value_faturado) || 0,
          etapa: d.etapa_atual,
        });
      }
    });
    let valorFaturado = 0, faturamentoLiquido = 0, netValue = 0, valorPedidoSemFatura = 0;
    porBr.forEach(v => {
      valorFaturado += v.valorFaturado;
      faturamentoLiquido += v.faturamentoLiquido;
      netValue += v.netValue;
      if (v.etapa === 'pedido_sem_fatura') valorPedidoSemFatura += v.netValue;
    });
    return { valorTotal, valorFaturado, faturamentoLiquido, netValue, valorPedidoSemFatura, valorSemPedido };
  };

  const porMes = useMemo(() => {
    return MESES_ORDEM.map(mes => {
      const doMes = dadosFiltrados.filter(d => d.mes_proposta === mes);
      const soma = somaPorBrUnico(doMes);
      return {
        mes,
        propostas: doMes.length,
        viraramPedido: doMes.filter(d => d.etapa_atual !== 'sem_pedido').length,
        faturadas: doMes.filter(d => d.etapa_atual === 'faturado').length,
        valorTotal: soma.valorTotal,
        netValue: soma.netValue,
        valorFaturado: soma.valorFaturado,
        faturamentoLiquido: soma.faturamentoLiquido,
      };
    }).filter(m => m.propostas > 0);
  }, [dadosFiltrados]);

  // ── totais de valor por etapa (KPIs) ──
  // valor_faturado          = Valor da Nota (CAB.VLRNOTA), bruto, TOPs 3200/3201/3209/3214/3216/3220/3227/3229, STATUSNOTA='L'
  // net_offer_value_faturado = Net Offer Value = VLRNOTA - ICMS - IPI - PIS - COFINS
  // net_value               = Net Offer Value do lado do PEDIDO (mesma fórmula, TIPMOV='P')
  // Fonte: tabela faturamento_resumo, sincronizada por sankhya-faturamento-resumo-sync.
  const totais = useMemo(() => somaPorBrUnico(dadosFiltrados), [dadosFiltrados]);

  // ── cross-tab: faturamento por mês real (data_faturamento) x mês de origem da proposta ──
  const monthLabel = (ymd) => {
    if (!ymd) return '—';
    const [y, m] = ymd.split('-');
    return `${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][Number(m) - 1]}/${y}`;
  };

  // As Notas Fiscais são filtradas pelo MESMO seletor De/Até do topo da tela — mas
  // usando o mês/ano da PRÓPRIA nota (data_faturamento), não o mês de origem da
  // proposta. Sem isso, os painéis de faturamento (que usam notasFiscais) ficavam
  // sempre mostrando o histórico inteiro, sem respeitar o filtro da tela.
  const notasFiscaisFiltradas = useMemo(() => {
    const idxIni = MESES_ORDEM.indexOf(mesIni);
    const idxFim = MESES_ORDEM.indexOf(mesFim);
    const [lo, hi] = idxIni <= idxFim ? [idxIni, idxFim] : [idxFim, idxIni];
    return notasFiscais.filter(nf => {
      if (!nf.data_faturamento) return false;
      const d = new Date(nf.data_faturamento + 'T00:00:00');
      if (d.getFullYear() !== ANO_OPERACIONAL) return false;
      const idx = d.getMonth();
      return idx >= lo && idx <= hi;
    });
  }, [notasFiscais, mesIni, mesFim]);

  const faturamentoPorMes = useMemo(() => {
    // mês de origem de cada BR: quando o BR tem mais de uma proposta (revisões),
    // usa a mais antiga (primeira vez que esse BR apareceu) — explícito por
    // data_abertura, não depende da ordem em que os dados chegaram da query.
    const mesOrigemPorBr = {};
    const dataOrigemPorBr = {};
    dados.forEach(d => {
      if (!d.br) return;
      const dt = d.data_abertura;
      if (!dataOrigemPorBr[d.br] || (dt && dt < dataOrigemPorBr[d.br])) {
        dataOrigemPorBr[d.br] = dt;
        mesOrigemPorBr[d.br] = d.mes_proposta;
      }
    });

    const map = {};
    notasFiscaisFiltradas.forEach(nf => {
      if (!nf.data_faturamento || !nf.br) return;
      const key = nf.data_faturamento.slice(0, 7); // YYYY-MM
      if (!map[key]) map[key] = { key, count: 0, valor: 0, origem: {} };
      const v = Number(nf.valor_nota) || 0;
      map[key].count++;
      map[key].valor += v;
      const origKey = mesOrigemPorBr[nf.br] || '—';
      if (!map[key].origem[origKey]) map[key].origem[origKey] = { count: 0, valor: 0 };
      map[key].origem[origKey].count++;
      map[key].origem[origKey].valor += v;
    });
    return Object.values(map)
      .map(m => ({ ...m, origem: Object.entries(m.origem).map(([mesOrigem, v]) => ({ mesOrigem, ...v })).sort((a, b) => b.count - a.count) }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [dados, notasFiscaisFiltradas]);

  // ── resumo simples: quanto foi faturado (bruto e líquido) em cada mês real da NF ──
  // Diferente do cross-tab acima (que cruza com o mês de origem da proposta), aqui é
  // só "quanto saiu de nota em cada mês", pra bater o olho rápido.
  const faturamentoMensalReal = useMemo(() => {
    const map = {};
    notasFiscaisFiltradas.forEach(nf => {
      if (!nf.data_faturamento) return;
      const key = nf.data_faturamento.slice(0, 7); // YYYY-MM
      if (!map[key]) map[key] = { key, count: 0, bruto: 0, liquido: 0 };
      map[key].count++;
      map[key].bruto += Number(nf.valor_nota) || 0;
      map[key].liquido += Number(nf.net_offer_value) || 0;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [notasFiscaisFiltradas]);
  const maxFaturamentoMensal = Math.max(...faturamentoMensalReal.map(m => m.bruto), 1);

  // Total emitido no período selecionado (De/Até), direto de faturamento_resumo —
  // sem depender de casar o BR com uma proposta cadastrada aqui. Serve pra comparar
  // com o número "cru" do Sankhya e mostrar a diferença de escopo dos KPIs acima
  // (que só contam BRs com proposta no Portal, ou seja, a partir de 2026).
  const faturamentoTotalPeriodo = useMemo(() => {
    let bruto = 0, liquido = 0, count = 0;
    notasFiscaisFiltradas.forEach(nf => {
      bruto += Number(nf.valor_nota) || 0;
      liquido += Number(nf.net_offer_value) || 0;
      count++;
    });
    return { bruto, liquido, count };
  }, [notasFiscaisFiltradas]);

  const filtrados = useMemo(() => {
    return dadosFiltrados.filter(d => {
      const matchBusca = !busca || (d.br || '').toLowerCase().includes(busca.toLowerCase()) || (d.cliente || '').toLowerCase().includes(busca.toLowerCase());
      const matchEtapa = filtroEtapa === 'todas' || d.etapa_atual === filtroEtapa;
      return matchBusca && matchEtapa;
    });
  }, [dadosFiltrados, busca, filtroEtapa]);

  const ETAPA_META = {
    sem_pedido: { label: 'Ainda não virou pedido', color: T.amberText, bg: T.amberSoft },
    pedido_sem_fatura: { label: 'Virou pedido, aguarda faturamento', color: T.blueText, bg: T.blueSoft },
    faturado: { label: 'Faturado', color: T.oliveText, bg: T.oliveSoft },
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</div>;

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1400 }}>

      {/* Sync do faturamento (bruto + Net Offer Value) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={sincronizarFaturamento} disabled={syncing} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12.5, fontWeight: 600,
          borderRadius: 6, border: `1px solid ${T.line}`, background: T.panel, color: T.ink, cursor: syncing ? 'default' : 'pointer',
        }}>
          <RefreshCw size={13} className={syncing ? 'spin' : ''} /> {syncing ? 'Sincronizando…' : 'Sincronizar faturamento (bruto + Net Offer Value)'}
        </button>
        {syncMsg && <span style={{ fontSize: 12, color: syncMsg.startsWith('✓') ? T.oliveText : T.rustText }}>{syncMsg}</span>}
      </div>

      {/* KPIs de valor por etapa */}
      <div className="grid-kpis-7">
        <Kpi label="Valor total em propostas" value={fmtMoeda(totais.valorTotal)} icon={FileStack} />
        <Kpi label="Net Value (pedido, líquido)" value={fmtMoeda(totais.netValue)} icon={TrendingUp} tone="blue" />
        <Kpi label="Faturamento bruto (Vlr Nota)" value={fmtMoeda(faturamentoTotalPeriodo.bruto)} icon={CheckCircle2} tone="olive"
          info={`Total real de Vlr Nota (bruto) faturado de ${MESES_LABEL[mesIni]} a ${MESES_LABEL[mesFim]}/${ANO_OPERACIONAL} — todas as notas fiscais do período (${faturamentoTotalPeriodo.count}), tenham ou não uma proposta cadastrada no Portal. Filtra pela data da própria Nota Fiscal, não pelo mês de origem da proposta.`} />
        <Kpi label="Faturamento líquido (Net Offer Value)" value={fmtMoeda(faturamentoTotalPeriodo.liquido)} icon={DollarSign} tone="olive"
          info={`Mesmo critério do card de bruto: Net Offer Value real de todas as notas fiscais de ${MESES_LABEL[mesIni]} a ${MESES_LABEL[mesFim]}/${ANO_OPERACIONAL}, filtrado pela data da Nota Fiscal.`} />
        <Kpi label="Pedido confirmado, aguarda fatura" value={fmtMoeda(totais.valorPedidoSemFatura)} icon={Clock3} tone="amber" />
      </div>
      <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '-14px 0 0' }}>
        Bruto = Vlr Nota (CAB.VLRNOTA) · Líquido = Net Offer Value (Vlr Nota − ICMS − IPI − PIS − COFINS) · TOPs 3200/3201/3209/3214/3216/3220/3227/3229 · só notas com STATUSNOTA = 'L'
      </p>
      <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '-8px 0 0' }}>
        Desse total, {fmtMoeda(totais.valorFaturado)} bruto / {fmtMoeda(totais.faturamentoLiquido)} líquido está vinculado a BRs com <strong>proposta cadastrada no Portal</strong> — o restante são notas de BRs antigos (2023-2025) sem orçamento sincronizado aqui.
      </p>

      <Panel title="Proposta → Pedido → Faturamento, por mês de ORIGEM DA PROPOSTA" subtitle="Fat. bruto/líquido aqui = de tudo que foi PROPOSTO nesse mês, quanto já foi faturado até hoje (não importa em que mês saiu a nota) — por isso não bate com o gráfico 'Faturamento por mês' abaixo, que agrupa pelo mês da NOTA FISCAL, não da proposta">
        <div style={{ overflowX: 'auto', marginTop: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {['Mês da proposta', 'Propostas', 'Viraram pedido', 'Faturadas', 'Valor total', 'Net Value', 'Fat. bruto (dessas propostas)', 'Fat. líquido (dessas propostas)'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: T.inkFaint, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {porMes.map(m => (
                <tr key={m.mes} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, fontFamily: FONT_DISPLAY }}>{MESES_LABEL[m.mes]}</td>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY }}>{m.propostas}</td>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.blueText }}>{m.viraramPedido} <span style={{ color: T.inkFaint, fontSize: 11 }}>({m.propostas ? Math.round(m.viraramPedido/m.propostas*100) : 0}%)</span></td>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.oliveText }}>{m.faturadas} <span style={{ color: T.inkFaint, fontSize: 11 }}>({m.propostas ? Math.round(m.faturadas/m.propostas*100) : 0}%)</span></td>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.inkDim }}>{fmtMoeda(m.valorTotal)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.blueText, fontWeight: 600 }}>{fmtMoeda(m.netValue)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.oliveText, fontWeight: 600 }}>{fmtMoeda(m.valorFaturado)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.oliveText }}>{fmtMoeda(m.faturamentoLiquido)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: T.inkFaint, marginTop: 10, marginBottom: 0 }}>
          <strong>Por que os totais desta tabela não batem com o gráfico "Faturamento por mês" logo abaixo:</strong> aqui, "Fat. bruto/líquido" de um mês é a soma de tudo que já foi faturado das propostas <em>nascidas</em> naquele mês — não importa quando a nota saiu (pode ter sido faturada meses depois). Já o gráfico abaixo agrupa pelo mês em que a <em>nota fiscal</em> foi emitida, não importa de quando é a proposta. É o mesmo dinheiro, só que organizado por dois calendários diferentes (data da proposta × data da nota).
        </p>
      </Panel>

      {/* Faturamento por mês (real, pela data da Nota Fiscal) — bruto vs líquido */}
      <Panel title="Faturamento por mês" subtitle="Agrupado pelo mês em que a NOTA FISCAL saiu (não pelo mês da proposta) — bruto (Vlr Nota) vs líquido (Net Offer Value)">
        <div style={{ overflowX: 'auto', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, minHeight: 170, padding: '8px 4px 0' }}>
            {faturamentoMensalReal.length === 0 ? (
              <p style={{ fontSize: 13, color: T.inkFaint }}>Nenhuma nota de faturamento encontrada ainda.</p>
            ) : faturamentoMensalReal.map(m => {
              const hBruto = Math.max((m.bruto / maxFaturamentoMensal) * 120, 4);
              const hLiquido = Math.max((m.liquido / maxFaturamentoMensal) * 120, 4);
              return (
                <div key={m.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 74 }}>
                  <div style={{ fontSize: 10.5, color: T.inkFaint, marginBottom: 4 }}>{m.count} nota{m.count !== 1 ? 's' : ''}</div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                    <div title={`Bruto: ${fmtMoeda(m.bruto)}`} style={{ width: 20, height: hBruto, background: T.line, borderRadius: '3px 3px 0 0' }} />
                    <div title={`Líquido: ${fmtMoeda(m.liquido)}`} style={{ width: 20, height: hLiquido, background: T.oliveText, borderRadius: '3px 3px 0 0' }} />
                  </div>
                  <div style={{ fontSize: 11, color: T.ink, fontWeight: 600, marginTop: 6 }}>{monthLabel(m.key)}</div>
                  <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 2 }}>{fmtMoeda(m.bruto)}</div>
                  <div style={{ fontSize: 10, color: T.oliveText, fontWeight: 600 }}>{fmtMoeda(m.liquido)}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: T.inkFaint }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.line, borderRadius: 2, marginRight: 4 }} />Bruto (Vlr Nota)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.oliveText, borderRadius: 2, marginRight: 4 }} />Líquido (Net Offer Value)</span>
        </div>
      </Panel>

      {/* Cross-tab: faturamento real por mês x mês de origem da proposta */}
      <Panel title="Faturamento por mês × mês de origem da proposta" subtitle="Ex.: do que foi faturado em junho, quanto era proposta de abril, maio, etc. Clique num mês para abrir">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
          {faturamentoPorMes.length === 0 ? (
            <p style={{ fontSize: 13, color: T.inkFaint }}>Nenhuma nota de faturamento encontrada ainda.</p>
          ) : faturamentoPorMes.map(f => {
            const aberto = mesFaturamentoAberto === f.key;
            return (
              <div key={f.key} style={{ border: `1px solid ${T.line}`, borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setMesFaturamentoAberto(aberto ? null : f.key)} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', background: aberto ? T.panelAlt : T.panel, border: 'none', cursor: 'pointer', textAlign: 'left',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, fontFamily: FONT_DISPLAY, color: T.ink }}>
                    {aberto ? <ChevronDown size={15} /> : <ChevronRight size={15} />} Faturado em {monthLabel(f.key)}
                  </span>
                  <span style={{ display: 'flex', gap: 16, fontSize: 12.5 }}>
                    <span style={{ color: T.inkDim }}>{f.count} nota{f.count !== 1 ? 's' : ''}</span>
                    <span style={{ color: T.oliveText, fontWeight: 700, fontFamily: FONT_DISPLAY }}>{fmtMoeda(f.valor)}</span>
                  </span>
                </button>
                {aberto && (
                  <div style={{ padding: '4px 16px 12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                      <thead>
                        <tr>
                          {['Mês de origem da proposta', 'Qtd.', '%', 'Valor'].map(h => (
                            <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: T.inkFaint, textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {f.origem.map(o => (
                          <tr key={o.mesOrigem} style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                            <td style={{ padding: '6px 10px', fontWeight: 600 }}>{MESES_LABEL[o.mesOrigem] || o.mesOrigem}</td>
                            <td style={{ padding: '6px 10px', fontFamily: FONT_DISPLAY }}>{o.count}</td>
                            <td style={{ padding: '6px 10px', color: T.inkFaint }}>{f.count ? Math.round(o.count / f.count * 100) : 0}%</td>
                            <td style={{ padding: '6px 10px', fontFamily: FONT_DISPLAY, color: T.oliveText }}>{fmtMoeda(o.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '15px 18px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: T.ink }}>Detalhe por BR <span style={{ color: T.inkFaint, fontWeight: 400 }}>({filtrados.length})</span></h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar BR ou cliente…" className="focus-ring"
              style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 12px', fontSize: 12.5, width: 200 }} />
            <div style={{ position: 'relative' }}>
              <select value={mesIni} onChange={e => setMesIni(e.target.value)} className="focus-ring"
                style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 10px', fontSize: 12.5 }}>
                {MESES_ORDEM.map(m => <option key={m} value={m}>De {MESES_LABEL[m]}</option>)}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <select value={mesFim} onChange={e => setMesFim(e.target.value)} className="focus-ring"
                style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 10px', fontSize: 12.5 }}>
                {MESES_ORDEM.map(m => <option key={m} value={m}>a {MESES_LABEL[m]}</option>)}
              </select>
            </div>
            <button onClick={() => { setMesIni('JANEIRO'); setMesFim(MESES_ORDEM[MESES_ORDEM.length - 1]); }} style={{
              padding: '7px 12px', fontSize: 12.5, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: T.panelAlt, color: T.inkDim,
            }}>Ano todo</button>
            <select value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)} className="focus-ring"
              style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 10px', fontSize: 12.5 }}>
              <option value="todas">Todas as etapas</option>
              {Object.entries(ETAPA_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ padding: '0 18px 12px', fontSize: 11.5, color: T.inkFaint }}>
          {dadosFiltrados.length} propostas de {MESES_LABEL[mesIni]} a {MESES_LABEL[mesFim]} de {ANO_OPERACIONAL} (KPIs e tabela acima já respeitam esse intervalo)
          {' · '}<AlertTriangle size={11} color={T.rust} style={{ verticalAlign: -1 }} /> na coluna "Proposta em" = BR antigo (2025 ou antes) sem a revisão original sincronizada; a data mostrada não é confiável, não afirmamos nada sobre ela
        </div>
        <div style={{ overflowX: 'auto', maxHeight: 500, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                {['BR', 'Cliente', 'Proposta em', 'Virou pedido em', 'Faturado em', 'Valor proposta', 'Net Value', 'Valor faturado', 'Etapa'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: T.inkFaint, textTransform: 'uppercase', position: 'sticky', top: 0, background: T.panel }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.slice(0, 300).map(d => {
                const meta = ETAPA_META[d.etapa_atual];
                const dataInconsistente = d.data_pedido && d.data_abertura && d.data_pedido < d.data_abertura;
                return (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, fontFamily: FONT_DISPLAY }}>{d.br}</td>
                    <td style={{ padding: '10px 16px', color: T.inkDim, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.cliente}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5 }}>
                      {fmtData(d.data_abertura)}
                      {dataInconsistente && (
                        <span title="Esse BR só tem 1 registro de orçamento sincronizado (provavelmente uma revisão/reemissão tardia) — a proposta original é de antes do início do sync (jan/2026) e não temos a data real. Não confie nessa data pra esse BR." style={{ marginLeft: 5, cursor: 'help' }}>
                          <AlertTriangle size={11} color={T.rust} style={{ verticalAlign: -1 }} />
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5 }}>{d.data_pedido ? fmtData(d.data_pedido) : '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5 }}>{d.data_faturamento ? fmtData(d.data_faturamento) : '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5, fontFamily: FONT_DISPLAY, color: T.inkDim }}>{fmtMoeda(d.valor_liquido)}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5, fontFamily: FONT_DISPLAY, color: T.blueText }}>{d.net_value ? fmtMoeda(d.net_value) : '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5, fontFamily: FONT_DISPLAY, color: T.oliveText }}>{d.valor_faturado ? fmtMoeda(d.valor_faturado) : '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 4, whiteSpace: 'nowrap' }}>{meta.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtrados.length > 300 && <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: T.inkFaint }}>Mostrando 300 de {filtrados.length} — refine a busca ou o filtro de mês.</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   EQUIPAMENTOS DE TERCEIROS
   Espelha a view Sankhya: TOPs 2105/2108 (entrada) vs 2409/2410 (retorno)
   Sync via Edge Function sankhya-equipamentos-sync
============================================================================ */
/* ============================================================================
   PAINEL COMERCIAL — Pedidos faturados no mês com ciclo pedido→NF
============================================================================ */
function PainelComercial() {
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deDe, setDeDe] = useState('2025-08');
  const [deAte, setDeAte] = useState(mesAtual);
  const [vendFiltro, setVendFiltro] = useState('Todos');
  const [brBusca, setBrBusca] = useState('');
  const [clienteBusca, setClienteBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [sortCol, setSortCol] = useState('nf_emitida');
  const [sortDir, setSortDir] = useState('desc');

  const carregar = useCallback(async () => {
    setLoading(true);
    const inicio = `${deDe}-01`;
    const [anoAte, mAte] = deAte.split('-');
    const fim = new Date(Number(anoAte), Number(mAte), 0).toISOString().slice(0,10);

    // NFs emitidas no período — fonte faturamento_resumo (nível de nota, já
    // filtrada por TOPs válidos e STATUSNOTA='L' na sincronização). Uma linha
    // por NUNOTA, sem risco de duplicar somando por item.
    const { data: nfs } = await supabase
      .from('faturamento_resumo')
      .select('nunota,numero_nota,br,numero_pedido,codtipoper,cliente_nome,data_faturamento,valor_nota,net_offer_value,vendedor_nome,uf')
      .eq('tipmov', 'V')
      .gte('data_faturamento', inicio)
      .lte('data_faturamento', fim)
      .order('data_faturamento', { ascending: false });

    const numPeds = [...new Set((nfs||[]).map(n => n.numero_pedido).filter(Boolean))];
    let pedMap = {};
    if (numPeds.length > 0) {
      // Só pra enriquecer com kaleng/data do pedido — não usado pra somar valor.
      const { data: peds } = await supabase
        .from('pedidos_itens')
        .select('br,numero_pedido,data_neg,data_faturamento,produto_kaleng')
        .in('numero_pedido', numPeds);
      (peds||[]).forEach(p => {
        const k = `${p.br}||${p.numero_pedido}`;
        if (!pedMap[k]) pedMap[k] = p;
      });
    }

    // Uma linha por nota (nunota) — já vem deduplicado da faturamento_resumo.
    const registros = (nfs||[]).map(n => {
      const chavePedido = `${n.br}||${n.numero_pedido}`;
      const ped = pedMap[chavePedido];
      return {
        br: n.br,
        nf: n.numero_nota || n.nunota,
        numero_pedido: n.numero_pedido,
        top: n.codtipoper,
        cliente: n.cliente_nome || '—',
        nf_emitida: n.data_faturamento,
        fat_previsto: ped?.data_faturamento || null,
        pedido_criado: ped?.data_neg || null,
        valor: Number(n.valor_nota) || 0,
        netValue: Number(n.net_offer_value) || 0,
        vendedor: n.vendedor_nome || '—',
        kaleng: ped?.produto_kaleng || '—',
        uf: n.uf || '—',
      };
    });

    setRegistros(registros);
    setLoading(false);
  }, [deDe, deAte]);

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  // Atraso = NF emitida - data prevista no pedido
  // Negativo = antecipado, Zero = no prazo, Positivo = atrasado
  const diasAtraso = (r) => {
    if (!r.fat_previsto || !r.nf_emitida) return null;
    return Math.round((new Date(r.nf_emitida) - new Date(r.fat_previsto)) / 86400000);
  };

  const statusMeta = (dias) => {
    if (dias === null)  return { cor: T.inkFaint, bg: T.lineSoft,   label: 'Sem data prevista', cat: 'sem_data' };
    if (dias < 0)       return { cor: T.blueText,  bg: T.blueSoft,   label: `${Math.abs(dias)}d antes`,  cat: 'antecipado' };
    if (dias === 0)     return { cor: T.oliveText,  bg: T.oliveSoft,  label: 'No prazo',          cat: 'prazo' };
    if (dias <= 7)      return { cor: '#065f46',    bg: '#d1fae5',    label: `${dias}d atraso`,   cat: 'leve' };
    if (dias <= 14)     return { cor: T.amberText,  bg: T.amberSoft,  label: `${dias}d atraso`,   cat: 'moderado' };
    return               { cor: T.rustText,   bg: T.rustSoft,   label: `${dias}d atraso`,   cat: 'grave' };
  };

  const vendedores = useMemo(() => {
    const s = new Set(registros.map(r => r.vendedor).filter(v => v && v !== '—'));
    return ['Todos', ...[...s].sort()];
  }, [registros]);

  const filtrados = useMemo(() => {
    return registros
      .filter(r => {
        const d = diasAtraso(r);
        const { cat } = statusMeta(d);
        const matchVend   = vendFiltro === 'Todos' || r.vendedor === vendFiltro;
        const matchBr     = !brBusca || (r.br||'').toLowerCase().includes(brBusca.toLowerCase());
        const matchCliente = !clienteBusca || (r.cliente||'').toLowerCase().includes(clienteBusca.toLowerCase());
        const matchStatus = statusFiltro === 'Todos' || cat === statusFiltro;
        return matchVend && matchBr && matchCliente && matchStatus;
      })
      .sort((a, b) => {
        let va = sortCol === 'atraso' ? (diasAtraso(a) ?? 9999) : (a[sortCol] ?? '');
        let vb = sortCol === 'atraso' ? (diasAtraso(b) ?? 9999) : (b[sortCol] ?? '');
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [registros, vendFiltro, brBusca, clienteBusca, statusFiltro, sortCol, sortDir]);

  const kpis = useMemo(() => {
    const total = filtrados.reduce((s,r) => s + r.valor, 0);
    const totalNet = filtrados.reduce((s,r) => s + (r.netValue || 0), 0);
    const comData = filtrados.filter(r => diasAtraso(r) !== null);
    const n = comData.length || 1;
    const nAntes   = comData.filter(r => diasAtraso(r) < 0).length;
    const nPrazo   = comData.filter(r => diasAtraso(r) === 0).length;
    const nAtraso  = comData.filter(r => diasAtraso(r) > 0).length;
    const atrasados = comData.filter(r => diasAtraso(r) > 0).map(r => diasAtraso(r));
    return {
      total,
      totalNet,
      nfs: filtrados.length,
      pctAntes:        Math.round(nAntes  / n * 100),
      pctPrazo:        Math.round(nPrazo  / n * 100),
      pctNoPrazoOuAntes: Math.round((nAntes + nPrazo) / n * 100),
      pctAtraso:       Math.round(nAtraso / n * 100),
      mediaAtraso: atrasados.length ? Math.round(atrasados.reduce((s,d)=>s+d,0)/atrasados.length) : null,
    };
  }, [filtrados]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'nf_emitida' ? 'desc' : 'asc'); }
  };

  const SortThC = ({ label, col, right }) => {
    const active = sortCol === col;
    return (
      <th onClick={() => handleSort(col)} style={{ ...thFat(0, right ? 'right' : 'left'), cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <span style={{ color: active ? T.terracotta : T.inkFaint }}>
          {label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
        </span>
      </th>
    );
  };

  const fmtData = (iso) => {
    if (!iso) return '—';
    const [y,m,d] = String(iso).split('-');
    return d && m && y ? `${d}/${m}/${y}` : iso;
  };

  // Gera lista de meses (jan/2026 até mês atual)
  const meses = useMemo(() => {
    const arr = [];
    const inicio = new Date(2025, 7, 1); // ago/2025 — início real dos dados de faturamento no banco
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    let cur = new Date(inicio);
    while (cur <= fim) {
      const val = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}`;
      const label = cur.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
      arr.push({ val, label: label.charAt(0).toUpperCase() + label.slice(1) });
      cur.setMonth(cur.getMonth() + 1);
    }
    return arr.reverse();
  }, []);

  // Distribuição por categoria para barras visuais
  const dist = useMemo(() => {
    const cats = [
      { cat: 'antecipado', label: 'Antecipado',   cor: T.blueText,  bg: T.blueSoft,  fn: r => diasAtraso(r) !== null && diasAtraso(r) < 0 },
      { cat: 'prazo',      label: 'No prazo',      cor: T.oliveText, bg: T.oliveSoft, fn: r => diasAtraso(r) === 0 },
      { cat: 'leve',       label: 'Atraso 1–7d',   cor: '#065f46',   bg: '#d1fae5',   fn: r => { const d=diasAtraso(r); return d!==null&&d>0&&d<=7; } },
      { cat: 'moderado',   label: 'Atraso 8–14d',  cor: T.amberText, bg: T.amberSoft, fn: r => { const d=diasAtraso(r); return d!==null&&d>7&&d<=14; } },
      { cat: 'grave',      label: 'Atraso 15d+',   cor: T.rustText,  bg: T.rustSoft,  fn: r => { const d=diasAtraso(r); return d!==null&&d>14; } },
    ];
    const total = filtrados.filter(r => diasAtraso(r) !== null).length || 1;
    return cats.map(c => ({ ...c, count: filtrados.filter(c.fn).length, pct: Math.round(filtrados.filter(c.fn).length / total * 100) }));
  }, [filtrados]);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1300 }}>

      {/* Filtro de período — de/até */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 18px' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.inkDim }}>Período:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: T.inkFaint }}>De</span>
          <div style={{ position: 'relative' }}>
            <select value={deDe} onChange={e => setDeDe(e.target.value)} style={selectStyleFat(150)}>
              {meses.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            <ChevronDown size={13} style={chevronStyleFat} />
          </div>
          <span style={{ fontSize: 12, color: T.inkFaint }}>até</span>
          <div style={{ position: 'relative' }}>
            <select value={deAte} onChange={e => setDeAte(e.target.value)} style={selectStyleFat(150)}>
              {meses.filter(m => m.val >= deDe).map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            <ChevronDown size={13} style={chevronStyleFat} />
          </div>
        </div>
        <span style={{ fontSize: 12, color: T.inkFaint }}>
          {loading ? 'Carregando…' : `${filtrados.length} NF${filtrados.length !== 1 ? 's' : ''}`}
        </span>
        <button onClick={carregar} style={{ display: 'flex', alignItems: 'center', gap: 5, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: T.inkDim }}>
          <RefreshCw size={12} /> Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        {[
          { label: 'Total faturado',      value: fmtMoedaCompacta(kpis.total),                color: T.terracotta, big: true },
          { label: 'Net Value (pedidos)', value: fmtMoedaCompacta(kpis.totalNet),             color: T.blueText },
          { label: 'NFs emitidas',         value: kpis.nfs,                                    color: T.ink },
          { label: '% no prazo ou antes', value: `${kpis.pctNoPrazoOuAntes}%`,
            color: kpis.pctNoPrazoOuAntes >= 70 ? T.oliveText : kpis.pctNoPrazoOuAntes >= 40 ? T.amberText : T.rustText },
          { label: '% atrasado',          value: `${kpis.pctAtraso}%`,
            color: kpis.pctAtraso > 50 ? T.rustText : kpis.pctAtraso > 20 ? T.amberText : T.oliveText },
          { label: '% antecipado',        value: `${kpis.pctAntes}%`,  color: T.blueText },
          { label: '% no prazo exato',    value: `${kpis.pctPrazo}%`,  color: T.oliveText },
          { label: 'Atraso médio (dias)', value: kpis.mediaAtraso !== null ? `${kpis.mediaAtraso}d` : '—',
            color: kpis.mediaAtraso > 14 ? T.rustText : kpis.mediaAtraso > 7 ? T.amberText : T.oliveText },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: k.big ? 24 : 22, fontWeight: 700, color: k.color, marginTop: 6 }}>
              {loading ? '…' : k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Distribuição visual com barra de percentual */}
      {!loading && filtrados.length > 0 && (
        <Panel title="Distribuição de pontualidade" subtitle="NF emitida vs data prevista no pedido — clique para filtrar">
          <div style={{ display: 'flex', gap: 0, marginTop: 12, borderRadius: 8, overflow: 'hidden', height: 28 }}>
            {dist.filter(c => c.count > 0).map(c => (
              <div key={c.cat} onClick={() => setStatusFiltro(statusFiltro === c.cat ? 'Todos' : c.cat)}
                title={`${c.label}: ${c.count} NFs (${c.pct}%)`}
                style={{ flex: c.count, background: c.bg, borderRight: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.pct > 0 && <span style={{ fontSize: 10.5, fontWeight: 700, color: c.cor }}>{c.pct >= 5 ? `${c.pct}%` : '·'}</span>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            {dist.map(c => (
              <div key={c.cat} onClick={() => setStatusFiltro(statusFiltro === c.cat ? 'Todos' : c.cat)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c.bg, border: `1px solid ${c.cor}`, display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: statusFiltro === c.cat ? c.cor : T.inkFaint, fontWeight: statusFiltro === c.cat ? 700 : 400 }}>
                  {c.label} ({c.count})
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Filtros */}
      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Cliente">
            <input value={clienteBusca} onChange={e => setClienteBusca(e.target.value)}
              placeholder="Ex: Vale, Ternium…"
              style={{ ...selectStyleFat(180), paddingLeft: 10 }} />
          </FiltroCampoFat>
          <FiltroCampoFat label="BR">
            <input value={brBusca} onChange={e => setBrBusca(e.target.value)} placeholder="Ex: BR14191/26"
              style={{ ...selectStyleFat(160), paddingLeft: 10 }} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Vendedor">
            <div style={{ position: 'relative' }}>
              <select value={vendFiltro} onChange={e => setVendFiltro(e.target.value)} style={selectStyleFat(180)}>
                {vendedores.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Pontualidade">
            <div style={{ position: 'relative' }}>
              <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} style={selectStyleFat(170)}>
                <option value="Todos">Todos</option>
                <option value="antecipado">Antecipado</option>
                <option value="prazo">No prazo</option>
                <option value="leve">Atraso 1–7d</option>
                <option value="moderado">Atraso 8–14d</option>
                <option value="grave">Atraso 15d+</option>
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
          {(brBusca || clienteBusca || vendFiltro !== 'Todos' || statusFiltro !== 'Todos') && (
            <button onClick={() => { setBrBusca(''); setClienteBusca(''); setVendFiltro('Todos'); setStatusFiltro('Todos'); }}
              style={{ fontSize: 12, color: T.amberText, background: T.amberSoft, border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Limpar
            </button>
          )}
        </div>
      </Panel>

      {/* Tabela */}
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <SortThC label="BR"               col="br" />
                <SortThC label="NF"               col="nf" />
                <SortThC label="Cliente"          col="cliente" />
                <SortThC label="Kaleng"           col="kaleng" />
                <SortThC label="Vendedor"         col="vendedor" />
                <SortThC label="UF"               col="uf" />
                <SortThC label="Previsto"         col="fat_previsto" />
                <SortThC label="NF emitida"       col="nf_emitida" />
                <SortThC label="Situação ↕"       col="atraso" />
                <SortThC label="Valor NF"         col="valor" right />
                <SortThC label="Net Value"        col="netValue" right />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={11} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhuma NF no período com os filtros aplicados.</td></tr>
              ) : filtrados.map((r, i) => {
                const d = diasAtraso(r);
                const { cor, bg, label: sitLabel } = statusMeta(d);
                const rowBg = d !== null && d > 14 ? `${T.rustSoft}33` : 'transparent';
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: rowBg }}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                    <td style={{ padding: '9px 10px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, whiteSpace: 'nowrap' }}>{r.br}</td>
                    <td style={{ padding: '9px 10px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.oliveText }}>NF {r.nf}</td>
                    <td style={{ padding: '9px 10px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.cliente}>{r.cliente}</td>
                    <td style={{ padding: '9px 10px', color: T.blueText, fontWeight: 600, fontSize: 11 }}>{r.kaleng}</td>
                    <td style={{ padding: '9px 10px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>{r.vendedor}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontSize: 11 }}>{r.uf}</td>
                    <td style={{ padding: '9px 10px', whiteSpace: 'nowrap', fontSize: 11, color: T.inkDim }}>{fmtData(r.fat_previsto)}</td>
                    <td style={{ padding: '9px 10px', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 600 }}>{fmtData(r.nf_emitida)}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: cor, background: bg, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{sitLabel}</span>
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>{fmtMoedaCompacta(r.valor)}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', color: T.blueText }}>{r.netValue ? fmtMoedaCompacta(r.netValue) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Situação = NF emitida vs data de faturamento prevista no pedido (DTFATUR Sankhya) · negativo = antecipado</span>
          <BotaoExportar small onClick={() => exportCSV(filtrados.map(r => ({ ...r, dias_atraso: diasAtraso(r) })), `comercial_${deDe}_${deAte}.csv`,
            ['br','nf','numero_pedido','top','cliente','kaleng','vendedor','uf','fat_previsto','nf_emitida','dias_atraso','valor'])} />
        </div>
      </div>
    </div>
  );
}


/* NFs agrupadas por número — usado no fallback quando pedido está fora do sync */
function NfsAgrupadasCard({ itens, fmtData, fmtMoedaCompacta }) {
  const grupos = React.useMemo(() => {
    const map = {};
    (itens || []).forEach(n => {
      const k = String(n.nro_interno_sankhya || '?').trim();
      if (!map[k]) map[k] = { nf: k, top: n.codtipoper, pedido: n.numero_pedido, cliente: n.cliente_nome, data: n.data_faturamento, valor: 0, descricoes: [] };
      map[k].valor += Number(n.valor_bruto) || 0;
      if (n.produto_descricao) map[k].descricoes.push(n.produto_descricao);
    });
    return Object.values(map).sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  }, [itens]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {grupos.map((g, i) => (
        <div key={i} style={{ border: `1.5px solid #1D9E7544`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: '#E8F5F0', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: '#1D7A55' }}>✓ NF {g.nf}</span>
            <span style={{ fontSize: 11, color: '#4A7A6A' }}>TOP {g.top}</span>
            {g.pedido && <span style={{ fontSize: 11, color: '#4A7A6A' }}>Pedido {g.pedido}</span>}
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: '#1D7A55' }}>{fmtMoedaCompacta(g.valor)}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1D7A55' }}>{fmtData(g.data)}</span>
          </div>
          <div style={{ padding: '8px 14px', background: '#fff' }}>
            <div style={{ fontSize: 10.5, color: '#888', fontWeight: 600, marginBottom: 6 }}>
              {g.descricoes.length} item{g.descricoes.length !== 1 ? 's' : ''} · {g.cliente}
            </div>
            {g.descricoes.map((d, j) => (
              <div key={j} style={{ fontSize: 11.5, color: '#555', padding: '3px 0', borderBottom: j < g.descricoes.length - 1 ? '1px solid #f0ede8' : 'none' }}>{d}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Funil visual de verdade (trapézios afunilando), clicável por segmento.
function FunilVisualSVG({ segmentos, total, ativo, onClick }) {
  const W = 680;
  const tierH = 110;
  const topY = 20;
  const maxWidth = 460;
  const minWidth = 210;
  const n = segmentos.length;
  const H = topY + n * tierH + 20;
  const icones = { recorrente: Trophy, poucas: Repeat, unica: UserPlus };

  // Larguras de cada nível — o fundo de um nível é exatamente o topo do próximo,
  // então os trapézios encaixam perfeitamente, sem espaço entre eles.
  const bounds = segmentos.map((seg, i) => {
    const wTop = minWidth + (maxWidth - minWidth) * (n - i) / n;
    const wBottom = minWidth + (maxWidth - minWidth) * (n - i - 1) / n;
    const y = topY + i * tierH;
    return { xTopL: (W - wTop) / 2, xTopR: (W + wTop) / 2, xBotL: (W - wBottom) / 2, xBotR: (W + wBottom) / 2, y, yBot: y + tierH };
  });

  // Contorno único do funil inteiro (desce pela borda direita, sobe pela esquerda).
  const rightPts = bounds.map(b => `${b.xTopR},${b.y}`);
  rightPts.push(`${bounds[n - 1].xBotR},${bounds[n - 1].yBot}`);
  const leftPts = bounds.map(b => `${b.xTopL},${b.y}`);
  leftPts.push(`${bounds[n - 1].xBotL},${bounds[n - 1].yBot}`);
  const outline = `M ${rightPts.join(' L ')} L ${[...leftPts].reverse().join(' L ')} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img">
      <title>Funil de clientes por frequência de compra</title>
      <desc>Segmentos de clientes do mais recorrente ao de compra única, com quantidade e valor de cada um</desc>
      <style>{`
        .funil-tier { transition: transform 0.18s ease, filter 0.18s ease; transform-box: fill-box; transform-origin: center; cursor: pointer; }
        .funil-tier:hover { transform: scale(1.015); filter: brightness(1.04); }
        .funil-tier-g { animation: funilEntrada 0.5s ease backwards; }
        @keyframes funilEntrada { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <defs>
        {segmentos.map(seg => (
          <linearGradient key={seg.key} id={`grad-${seg.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={seg.corClara || seg.cor} stopOpacity={ativo === seg.key ? 1 : 0.16} />
            <stop offset="100%" stopColor={seg.cor} stopOpacity={ativo === seg.key ? 1 : 0.08} />
          </linearGradient>
        ))}
        <filter id="funilShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
        </filter>
      </defs>
      {bounds.map((b, i) => {
        const seg = segmentos[i];
        const isAtivo = ativo === seg.key;
        return (
          <g key={seg.key} className="funil-tier-g" style={{ animationDelay: `${i * 90}ms` }}>
            <polygon className="funil-tier" points={`${b.xTopL},${b.y} ${b.xTopR},${b.y} ${b.xBotR},${b.yBot} ${b.xBotL},${b.yBot}`}
              fill={`url(#grad-${seg.key})`} filter={isAtivo ? 'url(#funilShadow)' : undefined} onClick={() => onClick(seg.key)} />
          </g>
        );
      })}
      <path d={outline} fill="none" stroke={T.line} strokeWidth={1} />
      {bounds.slice(0, -1).map((b, i) => (
        <line key={i} x1={b.xBotL} y1={b.yBot} x2={b.xBotR} y2={b.yBot} stroke={T.line} strokeWidth={1} />
      ))}
      {bounds.map((b, i) => {
        const seg = segmentos[i];
        const isAtivo = ativo === seg.key;
        const pct = total ? Math.round(seg.qtd / total * 100) : 0;
        const midY = (b.y + b.yBot) / 2;
        const Icone = icones[seg.key];
        return (
          <g key={seg.key} style={{ cursor: 'pointer', pointerEvents: 'none' }}>
            {Icone && (
              <foreignObject x={W / 2 - 11} y={midY - 40} width={22} height={22} style={{ pointerEvents: 'none' }}>
                <Icone size={22} color={isAtivo ? seg.cor : seg.cor} strokeWidth={2} />
              </foreignObject>
            )}
            <text x={W / 2} y={midY - 4} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 16, fontWeight: 700, fill: seg.cor, fontFamily: FONT_DISPLAY }}>
              {seg.titulo}
            </text>
            <text x={W / 2} y={midY + 20} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 13, fill: T.inkFaint }}>
              {seg.qtd} clientes · {pct}% do total · {fmtMoedaCompacta(seg.valor)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AlmoxarifadoFluxo({ currentUser }) {
  const apenasFilaAtendimento = currentUser?.ve_almoxarifado_apenas_fila === true;
  const [projetos, setProjetos] = useState([]);
  const [perdas, setPerdas] = useState([]);
  const [detalhado, setDetalhado] = useState([]);
  const [faturadoMes, setFaturadoMes] = useState([]);
  const [produtividadeProduto, setProdutividadeProduto] = useState([]);
  const [valoresPerda, setValoresPerda] = useState({}); // movimentacao_id -> valor
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [buscaDetalhado, setBuscaDetalhado] = useState('');
  const [mesFiltro, setMesFiltro] = useState('');
  const [abaAtiva, setAbaAtiva] = useState(apenasFilaAtendimento ? 'fila_atendimento' : 'registrar');
  const [drillBr, setDrillBr] = useState(null);
  const [itensDrill, setItensDrill] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [{ data: proj }, { data: perd }, { data: valores }, { data: det }, { data: fatMes }, { data: prodProduto }] = await Promise.all([
      supabase.from('v_almoxarifado_projetos').select('*').order('ultima_movimentacao', { ascending: false }),
      supabase.from('v_almoxarifado_perdas').select('*').order('carimbo_data_hora', { ascending: false }),
      supabase.from('almoxarifado_perdas_valor').select('*'),
      supabase.from('v_almoxarifado_detalhado').select('*').order('carimbo_data_hora', { ascending: false }).limit(500),
      supabase.from('v_almoxarifado_faturado_mes').select('*'),
      supabase.from('v_almoxarifado_produtividade_por_produto').select('*'),
    ]);
    setProjetos(proj || []);
    setPerdas(perd || []);
    setDetalhado(det || []);
    setFaturadoMes(fatMes || []);
    setProdutividadeProduto(prodProduto || []);
    const vMap = {};
    (valores || []).forEach(v => { vMap[v.movimentacao_id] = v.valor; });
    setValoresPerda(vMap);
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const detalhadoFiltrado = useMemo(() => {
    if (!buscaDetalhado.trim()) return detalhado;
    const b = buscaDetalhado.toLowerCase();
    return detalhado.filter(d => (d.br || '').toLowerCase().includes(b) || (d.op || '').toLowerCase().includes(b) || (d.material || '').toLowerCase().includes(b));
  }, [detalhado, buscaDetalhado]);

  const mesesDisponiveis = useMemo(() => {
    const set = new Set(faturadoMes.map(f => f.mes_referencia));
    return [...set].filter(Boolean).sort().reverse();
  }, [faturadoMes]);

  const faturadoMesFiltrado = useMemo(() => {
    if (!mesFiltro) return faturadoMes;
    return faturadoMes.filter(f => f.mes_referencia === mesFiltro);
  }, [faturadoMes, mesFiltro]);

  const resumoPorLinha = useMemo(() => {
    const grupos = {};
    faturadoMesFiltrado.forEach(f => {
      const chave = f.linha;
      if (!grupos[chave]) grupos[chave] = { linha: chave, itens: 0, brsUnicos: new Set() };
      grupos[chave].itens += 1;
      grupos[chave].brsUnicos.add(f.br);
    });
    return Object.values(grupos).map(g => ({ linha: g.linha, itens: g.itens, projetos: g.brsUnicos.size }));
  }, [faturadoMesFiltrado]);

  // ── Situação atual (o que está parado em cada setor agora) + form de nova movimentação ──
  const SETORES_FLUXO = ['Ponto de Estoque', 'Corte', 'Vulcanização', 'Pintura', 'Caldeiraria', 'Revestimento', 'Expedição', 'Material 100% em produção', 'Projeto Faturado'];
  const [situacaoAtual, setSituacaoAtual] = useState([]);
  const [novoMov, setNovoMov] = useState({ projeto: '', op: '', material: '', setor: 'Ponto de Estoque', gerou_nova_necessidade: '', material_pendente: '', observacao: '' });
  const [salvandoMov, setSalvandoMov] = useState(false);
  const [mensagemMov, setMensagemMov] = useState(null);
  const [materiaisSugeridos, setMateriaisSugeridos] = useState([]);
  const [buscandoMateriais, setBuscandoMateriais] = useState(false);
  const [opsAndamento, setOpsAndamento] = useState([]);
  const [buscaOpAndamento, setBuscaOpAndamento] = useState('');
  const [opSelecionada, setOpSelecionada] = useState(null); // { op, br }
  const [quantidades, setQuantidades] = useState({}); // material_id -> quantidade digitada
  const [setorEscolhido, setSetorEscolhido] = useState({}); // material_id -> setor escolhido
  const [necessidadeItem, setNecessidadeItem] = useState({}); // material_id -> gerou nova necessidade
  const [chegouEstoquePorMaterial, setChegouEstoquePorMaterial] = useState(new Set());
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState([]);
  const carregarMinhasSolicitacoes = useCallback(async () => {
    const { data } = await supabase.from('solicitacoes_movimentacao_almoxarifado').select('*').order('solicitado_em', { ascending: false }).limit(50);
    setMinhasSolicitacoes(data || []);
  }, []);
  useEffect(() => { carregarMinhasSolicitacoes(); }, [carregarMinhasSolicitacoes]);

  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [filtroReserva, setFiltroReserva] = useState('suspeitas'); // suspeitas | com_br | todas
  const [buscaReserva, setBuscaReserva] = useState('');
  const carregarReservas = useCallback(async () => {
    setLoadingReservas(true);
    const { data } = await supabase.from('almoxarifado_reservas_detalhe').select('*').order('data_solicitacao', { ascending: false }).limit(1000);
    setReservas(data || []);
    setLoadingReservas(false);
  }, []);
  useEffect(() => { carregarReservas(); }, [carregarReservas]);
  const reservasFiltradas = useMemo(() => {
    let lista = reservas;
    if (filtroReserva === 'suspeitas') lista = lista.filter(r => r.ja_faturado === true);
    else if (filtroReserva === 'com_br') lista = lista.filter(r => r.br);
    if (buscaReserva.trim()) {
      const b = buscaReserva.toLowerCase();
      lista = lista.filter(r => (r.descrprod || '').toLowerCase().includes(b) || (r.br || '').toLowerCase().includes(b) || (r.op || '').includes(b) || (r.cliente_nome || '').toLowerCase().includes(b));
    }
    return lista;
  }, [reservas, filtroReserva, buscaReserva]);
  const [pendenteItem, setPendenteItem] = useState({}); // material_id -> material pendente

  const carregarSituacaoAtual = useCallback(async () => {
    const { data } = await supabase.from('v_almoxarifado_situacao_atual').select('*');
    setSituacaoAtual(data || []);
  }, []);
  useEffect(() => { carregarSituacaoAtual(); }, [carregarSituacaoAtual]);

  const carregarOpsAndamento = useCallback(async () => {
    const { data } = await supabase.from('v_almoxarifado_ops_andamento').select('*');
    setOpsAndamento(data || []);
  }, []);
  useEffect(() => { carregarOpsAndamento(); }, [carregarOpsAndamento]);

  const opsAndamentoFiltradas = useMemo(() => {
    if (!buscaOpAndamento.trim()) return opsAndamento;
    const b = buscaOpAndamento.toLowerCase().replace(/^br/, '');
    return opsAndamento.filter(o => (o.br || '').toLowerCase().includes(b) || (o.op || '').toLowerCase().includes(b));
  }, [opsAndamento, buscaOpAndamento]);

  const situacaoPorSetor = useMemo(() => {
    const grupos = {};
    SETORES_FLUXO.forEach(s => { grupos[s] = []; });
    situacaoAtual.forEach(s => { if (grupos[s.setor]) grupos[s.setor].push(s); });
    return grupos;
  }, [situacaoAtual]);

  // ── Dados pros gráficos da aba "Visão Geral" ──
  const graficoFaturamentoPorMes = useMemo(() => {
    const grupos = {};
    projetos.forEach(p => {
      if (!p.data_faturamento_real) return;
      const mes = String(p.data_faturamento_real).slice(0, 7); // YYYY-MM
      if (!grupos[mes]) grupos[mes] = 0;
      grupos[mes] += 1;
    });
    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([mes, qtd]) => ({ mes, qtd }));
  }, [projetos]);

  const graficoDiasProducaoPorMes = useMemo(() => {
    const grupos = {};
    projetos.forEach(p => {
      if (!p.data_faturamento_real || p.dias_em_producao == null) return;
      const mes = String(p.data_faturamento_real).slice(0, 7);
      if (!grupos[mes]) grupos[mes] = { soma: 0, qtd: 0 };
      grupos[mes].soma += p.dias_em_producao;
      grupos[mes].qtd += 1;
    });
    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
      .map(([mes, g]) => ({ mes, media: Math.round((g.soma / g.qtd) * 10) / 10 }));
  }, [projetos]);

  const graficoDistribuicaoLinha = useMemo(() => {
    const grupos = {};
    faturadoMes.forEach(f => {
      if (!grupos[f.linha]) grupos[f.linha] = 0;
      grupos[f.linha] += 1;
    });
    const total = Object.values(grupos).reduce((s, v) => s + v, 0) || 1;
    const cores = { 'KALIMPACT': T.terracotta, 'AÇO': T.blueText, 'PG1/PG2': T.oliveText };
    return Object.entries(grupos).map(([linha, qtd]) => ({ linha, qtd, pct: Math.round((qtd / total) * 100), cor: cores[linha] || T.inkFaint }));
  }, [faturadoMes]);

  const graficoPerdasPorTipo = useMemo(() => {
    const grupos = {};
    perdas.forEach(p => {
      const tipo = (p.tipo_perda || '').replace('KDB Controle perda, ', '');
      if (!grupos[tipo]) grupos[tipo] = 0;
      grupos[tipo] += 1;
    });
    return Object.entries(grupos).sort(([, a], [, b]) => b - a).map(([tipo, qtd]) => ({ tipo, qtd }));
  }, [perdas]);

  const graficoSituacaoPorSetor = useMemo(() => {
    return SETORES_FLUXO.filter(s => s !== 'Projeto Faturado').map(s => ({ setor: s, qtd: (situacaoPorSetor[s] || []).length })).filter(s => s.qtd > 0);
  }, [situacaoPorSetor]);

  const kpisGeral = useMemo(() => {
    const faturados = projetos.filter(p => p.tem_marco_faturado);
    const mediaGeral = faturados.length ? Math.round(faturados.reduce((s, p) => s + (p.dias_em_producao || 0), 0) / faturados.length) : 0;
    return {
      totalFaturados: faturados.length,
      mediaGeral,
      totalEmAndamento: situacaoAtual.length,
      totalPerdas: perdas.length,
    };
  }, [projetos, situacaoAtual, perdas]);

  const selecionarOp = async (opItem) => {
    setOpSelecionada(opItem);
    setNovoMov(m => ({ ...m, projeto: opItem.br ? opItem.br.replace(/^BR/, '') : m.projeto, op: opItem.op }));
    setBuscandoMateriais(true);
    const [{ data }, { data: movsEstoque }, { data: solicPendentesEstoque }] = await Promise.all([
      supabase.from('almoxarifado_op_materiais').select('*').eq('op', opItem.op).order('materia_prima_descricao'),
      supabase.from('almoxarifado_movimentacoes').select('material').eq('op', opItem.op).eq('setor', 'Ponto de Estoque'),
      supabase.from('solicitacoes_movimentacao_almoxarifado').select('material').eq('op', opItem.op).eq('tipo', 'para_estoque').neq('status', 'cancelado'),
    ]);
    setMateriaisSugeridos(data || []);
    // Marca quais materiais já chegaram (ou já têm solicitação em andamento) no Ponto de Estoque —
    // regra fixa: tudo tem que passar por ali primeiro antes de ir pra qualquer outro setor.
    const jaNoEstoque = new Set([...(movsEstoque || []), ...(solicPendentesEstoque || [])].map(m => m.material));
    setChegouEstoquePorMaterial(jaNoEstoque);
    setBuscandoMateriais(false);
  };

  // Cria uma SOLICITAÇÃO (não a movimentação em si) — alguém da equipe dela precisa
  // confirmar que atendeu de verdade antes de virar movimentação real.
  const criarSolicitacao = async (materialItem) => {
    const jaNoEstoque = chegouEstoquePorMaterial.has(materialItem.materia_prima_descricao);
    const tipo = jaNoEstoque ? 'para_setor' : 'para_estoque';
    const setor = jaNoEstoque ? (setorEscolhido[materialItem.id] || 'Vulcanização') : 'Ponto de Estoque';
    const qtd = quantidades[materialItem.id];
    const registro = {
      tipo,
      br: opSelecionada?.br || (novoMov.projeto.trim() ? ('BR' + novoMov.projeto.trim().toUpperCase().replace(/,/g, '/').replace(/^BR/, '')) : materialItem.br),
      op: materialItem.op,
      material: materialItem.materia_prima_descricao,
      cod_materia_prima: materialItem.cod_materia_prima,
      quantidade_total_prevista: materialItem.quantidade_mp,
      quantidade_solicitada: qtd || null,
      setor_destino: tipo === 'para_setor' ? setor : null,
      status: 'pendente',
      solicitado_por: currentUser?.nome || null,
    };
    await supabase.from('solicitacoes_movimentacao_almoxarifado').insert(registro);
    setQuantidades(q => ({ ...q, [materialItem.id]: '' }));
    if (!jaNoEstoque) setChegouEstoquePorMaterial(s => new Set([...s, materialItem.materia_prima_descricao]));
    await carregarMinhasSolicitacoes();
  };

  const salvarNovaMovimentacao = async () => {
    if (!novoMov.projeto.trim()) { setMensagemMov({ ok: false, texto: 'Preencha o projeto (BR).' }); return; }
    setSalvandoMov(true);
    setMensagemMov(null);
    const registro = {
      carimbo_data_hora: new Date().toISOString(),
      projeto: novoMov.projeto.trim(),
      op: novoMov.op || null,
      material: novoMov.material || null,
      setor: novoMov.setor || null,
      gerou_nova_necessidade: novoMov.gerou_nova_necessidade || null,
      material_pendente: novoMov.material_pendente || null,
      observacao: novoMov.observacao || null,
      origem: 'manual',
      br_normalizado: /^projeto/i.test(novoMov.projeto.trim()) ? null : ('BR' + novoMov.projeto.trim().toUpperCase().replace(/,/g, '/').replace(/^BR/, '')),
    };
    const { error } = await supabase.from('almoxarifado_movimentacoes').insert(registro);
    if (error) {
      setMensagemMov({ ok: false, texto: error.message });
    } else {
      setMensagemMov({ ok: true, texto: 'Movimentação registrada!' });
      setNovoMov({ projeto: novoMov.projeto, op: novoMov.op, material: '', setor: novoMov.setor, gerou_nova_necessidade: '', material_pendente: '', observacao: '' });
      await Promise.all([carregarSituacaoAtual(), carregar()]);
    }
    setSalvandoMov(false);
  };

  const abrirDrill = async (br) => {
    setDrillBr(br);
    const { data } = await supabase.from('almoxarifado_movimentacoes').select('*').eq('br_normalizado', br).order('carimbo_data_hora');
    setItensDrill(data || []);
  };

  const salvarValorPerda = async (movimentacaoId, valor) => {
    await supabase.from('almoxarifado_perdas_valor').upsert(
      { movimentacao_id: movimentacaoId, valor: valor === '' ? null : Number(valor), atualizado_em: new Date().toISOString() },
      { onConflict: 'movimentacao_id' }
    );
    setValoresPerda(prev => ({ ...prev, [movimentacaoId]: valor === '' ? null : Number(valor) }));
  };

  const projetosFiltrados = useMemo(() => {
    if (!busca.trim()) return projetos;
    const b = busca.toLowerCase();
    return projetos.filter(p => (p.br || '').toLowerCase().includes(b) || (p.ops || '').toLowerCase().includes(b));
  }, [projetos, busca]);

  const kpis = useMemo(() => {
    const comFaturamento = projetos.filter(p => p.dias_em_producao != null);
    const mediaDias = comFaturamento.length ? Math.round(comFaturamento.reduce((s, p) => s + p.dias_em_producao, 0) / comFaturamento.length) : 0;
    const comDivergencia = projetos.filter(p => p.divergencia_dias_faturamento != null && Math.abs(p.divergencia_dias_faturamento) > 2);
    const totalPerdasValor = Object.values(valoresPerda).reduce((s, v) => s + (Number(v) || 0), 0);
    return {
      totalProjetos: projetos.length,
      mediaDias,
      comDivergencia: comDivergencia.length,
      totalOcorrenciasPerda: perdas.length,
      totalPerdasValor,
    };
  }, [projetos, perdas, valoresPerda]);

  const fmtDataHora = (iso) => !iso ? '—' : new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  const fmtMesCurto = (mes) => {
    const [y, m] = mes.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
  };

  // Gráfico de barras genérico (mês x quantidade) — mesmo padrão visual usado no resto do portal
  const GraficoBarrasAlmox = ({ dados, campoLabel, campoValor, corBarra = T.terracotta, formatarValor = (v) => v, formatarLabel = (l) => l }) => {
    if (!dados.length) return <div style={{ textAlign: 'center', padding: 24, color: T.inkFaint, fontSize: 12.5 }}>Sem dados suficientes ainda.</div>;
    const W = 700, H = 200, PAD_L = 40, PAD_B = 30, PAD_T = 16;
    const max = Math.max(...dados.map(d => d[campoValor]), 1);
    const passo = (W - PAD_L - 16) / dados.length;
    const larguraBarra = Math.min(52, passo - 10);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {[0.5, 1].map(f => (
          <line key={f} x1={PAD_L} x2={W - 10} y1={PAD_T + (H - PAD_B - PAD_T) * (1 - f)} y2={PAD_T + (H - PAD_B - PAD_T) * (1 - f)} stroke={T.lineSoft} strokeWidth={1} />
        ))}
        {dados.map((d, i) => {
          const altura = (d[campoValor] / max) * (H - PAD_B - PAD_T);
          const x = PAD_L + i * passo + (passo - larguraBarra) / 2;
          const y = H - PAD_B - altura;
          return (
            <g key={i}>
              <rect x={x} y={y} width={larguraBarra} height={Math.max(altura, 1)} rx={3} fill={corBarra} opacity={0.85}>
                <title>{formatarLabel(d[campoLabel])}: {formatarValor(d[campoValor])}</title>
              </rect>
              <text x={x + larguraBarra / 2} y={H - PAD_B + 15} textAnchor="middle" fontSize={9.5} fill={T.inkFaint}>{formatarLabel(d[campoLabel])}</text>
              <text x={x + larguraBarra / 2} y={y - 5} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={T.ink}>{formatarValor(d[campoValor])}</text>
            </g>
          );
        })}
        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={H - PAD_B} stroke={T.line} strokeWidth={1} />
        <line x1={PAD_L} x2={W - 10} y1={H - PAD_B} y2={H - PAD_B} stroke={T.line} strokeWidth={1} />
      </svg>
    );
  };

  // Gráfico de linha genérico (tendência mês a mês)
  const GraficoLinhaAlmox = ({ dados, campoLabel, campoValor, cor = T.terracotta, sufixo = '' }) => {
    if (dados.length < 2) return <div style={{ textAlign: 'center', padding: 24, color: T.inkFaint, fontSize: 12.5 }}>Sem dados suficientes ainda pra traçar tendência.</div>;
    const W = 700, H = 180, PAD_L = 34, PAD_R = 14, PAD_T = 16, PAD_B = 26;
    const valores = dados.map(d => d[campoValor]);
    const min = Math.min(...valores), max = Math.max(...valores);
    const span = (max - min) || 1;
    const passo = (W - PAD_L - PAD_R) / (dados.length - 1);
    const coordX = (i) => PAD_L + i * passo;
    const coordY = (v) => PAD_T + (H - PAD_T - PAD_B) * (1 - (v - min) / span);
    const linha = dados.map((d, i) => `${coordX(i)},${coordY(d[campoValor])}`).join(' ');
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <polyline points={linha} fill="none" stroke={cor} strokeWidth={2.5} />
        {dados.map((d, i) => (
          <g key={i}>
            <circle cx={coordX(i)} cy={coordY(d[campoValor])} r={3.5} fill={T.panel} stroke={cor} strokeWidth={2}>
              <title>{d[campoLabel]}: {d[campoValor]}{sufixo}</title>
            </circle>
            <text x={coordX(i)} y={coordY(d[campoValor]) - 9} textAnchor="middle" fontSize={9} fontWeight={700} fill={T.ink}>{d[campoValor]}{sufixo}</text>
            <text x={coordX(i)} y={H - PAD_B + 15} textAnchor="middle" fontSize={9} fill={T.inkFaint}>{fmtMesCurto(d[campoLabel])}</text>
          </g>
        ))}
      </svg>
    );
  };

  // Gráfico de rosca (donut) simples
  const GraficoRoscaAlmox = ({ dados }) => {
    if (!dados.length) return <div style={{ textAlign: 'center', padding: 24, color: T.inkFaint, fontSize: 12.5 }}>Sem dados ainda.</div>;
    const R = 60, CX = 70, CY = 70, ESP = 22;
    let anguloAcumulado = -90;
    const circ = 2 * Math.PI * R;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          {dados.map((d, i) => {
            const tamanhoArco = (d.pct / 100) * circ;
            const offset = circ - tamanhoArco;
            const rotacao = anguloAcumulado;
            anguloAcumulado += (d.pct / 100) * 360;
            return (
              <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={d.cor} strokeWidth={ESP}
                strokeDasharray={`${tamanhoArco} ${circ}`} strokeDashoffset={0}
                transform={`rotate(${rotacao} ${CX} ${CY})`}>
                <title>{d.linha}: {d.qtd} itens ({d.pct}%)</title>
              </circle>
            );
          })}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {dados.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: d.cor, flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{d.linha}</span>
              <span style={{ color: T.inkFaint }}>{d.qtd} itens · {d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (apenasFilaAtendimento) {
    return (
      <div className="fade-up">
        <FilaAtendimentoAlmoxarifado currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Controle de movimentação de material por projeto/OP — histórico migrado do formulário + novos registros via Power Automate.
        A data de faturamento é cruzada automaticamente com o Sankhya (não depende de digitar certo no formulário).
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <Kpi label="Projetos no histórico" value={loading ? '…' : kpis.totalProjetos} icon={Package} tone="blue" />
        <Kpi label="Dias médios em produção" value={loading ? '…' : kpis.mediaDias} icon={Clock3} tone="amber" sub="do início até faturado" />
        <Kpi label="Divergência de data > 2 dias" value={loading ? '…' : kpis.comDivergencia} icon={AlertTriangle} tone="rust" sub="formulário vs Sankhya real" />
        <Kpi label="Ocorrências de perda" value={loading ? '…' : kpis.totalOcorrenciasPerda} icon={FileWarning} sub="Divergência/Perca/Serviço" />
        <Kpi label="Valor de perda lançado" value={fmtMoeda(kpis.totalPerdasValor)} icon={DollarSign} tone="rust" sub="preenchido manualmente" />
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${T.line}`, flexWrap: 'wrap' }}>
        {[{ id: 'visao_geral', label: 'Visão Geral' }, { id: 'registrar', label: 'Registrar / Situação atual' }, { id: 'fila_atendimento', label: 'Fila de Atendimento' }, { id: 'reservas', label: `Reservas por Projeto${reservas.filter(r => r.ja_faturado).length ? ` (${reservas.filter(r => r.ja_faturado).length})` : ''}` }, { id: 'detalhado', label: `Detalhado (${detalhado.length})` }, { id: 'faturado_mes', label: 'Faturado por Mês' }, { id: 'produtividade_produto', label: 'Produtividade por Produto' }, { id: 'projetos', label: `Projetos (${projetos.length})` }, { id: 'perdas', label: `Perdas (${perdas.length})` }].map(aba => (
          <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, fontWeight: 600,
              color: abaAtiva === aba.id ? T.terracotta : T.inkFaint,
              borderBottom: `2px solid ${abaAtiva === aba.id ? T.terracotta : 'transparent'}`, marginBottom: -1,
            }}>
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === 'visao_geral' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 18 }}>
            <Kpi label="Projetos faturados" value={loading ? '…' : kpisGeral.totalFaturados} icon={CheckCircle2} tone="olive" />
            <Kpi label="Média geral dias produção" value={loading ? '…' : kpisGeral.mediaGeral} icon={Clock3} tone="amber" />
            <Kpi label="Em andamento agora" value={loading ? '…' : kpisGeral.totalEmAndamento} icon={Package} tone="blue" />
            <Kpi label="Ocorrências de perda" value={loading ? '…' : kpisGeral.totalPerdas} icon={FileWarning} tone="rust" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Panel title="Projetos faturados por mês" subtitle="Quantidade de projetos com o marco 'Projeto Faturado', últimos 12 meses">
              <GraficoBarrasAlmox dados={graficoFaturamentoPorMes} campoLabel="mes" campoValor="qtd" corBarra={T.terracotta} formatarLabel={fmtMesCurto} />
            </Panel>

            <Panel title="Dias médios em produção — tendência" subtitle="Média de dias do início até faturado, por mês de faturamento">
              <GraficoLinhaAlmox dados={graficoDiasProducaoPorMes} campoLabel="mes" campoValor="media" cor={T.blueText} sufixo="d" />
            </Panel>

            <Panel title="Distribuição por linha" subtitle="Produto faturado, agrupado por Kalimpact / Aço / PG1-PG2 (classificação aproximada)">
              <GraficoRoscaAlmox dados={graficoDistribuicaoLinha} />
            </Panel>

            <Panel title="Perdas por tipo" subtitle="Ocorrências de 'gerou nova necessidade', por motivo">
              <GraficoBarrasAlmox dados={graficoPerdasPorTipo} campoLabel="tipo" campoValor="qtd" corBarra={T.rustText}
                formatarLabel={(t) => t.length > 14 ? t.slice(0, 13) + '…' : t} />
            </Panel>

            <div style={{ gridColumn: '1 / -1' }}>
              <Panel title="Situação atual por setor" subtitle="Onde está parado o material agora, entre projetos ainda não faturados">
                <GraficoBarrasAlmox dados={graficoSituacaoPorSetor} campoLabel="setor" campoValor="qtd" corBarra={T.oliveText}
                  formatarLabel={(s) => s.length > 12 ? s.slice(0, 11) + '…' : s} />
              </Panel>
            </div>
          </div>
        </>
      )}

      {abaAtiva === 'registrar' && (
        <>
          <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18, alignItems: 'flex-start' }}>
            <Panel title="Ordens em andamento" subtitle="Clique numa OP pra ver a matéria-prima dela e registrar a entrega, item por item">
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
                <input value={buscaOpAndamento} onChange={e => setBuscaOpAndamento(e.target.value)} placeholder="Buscar por BR ou OP…"
                  style={{ ...inputStyle(), width: '100%', paddingLeft: 28 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto' }}>
                {opsAndamentoFiltradas.length === 0 ? (
                  <div style={{ fontSize: 12, color: T.inkFaint, textAlign: 'center', padding: 20 }}>
                    {opsAndamento.length === 0 ? 'Nenhuma OP em andamento sincronizada ainda.' : 'Nada encontrado pra essa busca.'}
                  </div>
                ) : opsAndamentoFiltradas.map(o => (
                  <button key={o.op} onClick={() => selecionarOp(o)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left',
                      padding: '9px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5,
                      border: `1px solid ${opSelecionada?.op === o.op ? T.terracotta : T.line}`,
                      background: opSelecionada?.op === o.op ? T.rustSoft : T.panelAlt,
                    }}>
                    <span>
                      <strong style={{ color: T.blueText, fontFamily: FONT_DISPLAY }}>{o.br || 'Sem BR (estoque)'}</strong> · OP {o.op}
                      {o.situacao_op === 'P' && <span style={{ marginLeft: 6, fontSize: 9.5, fontWeight: 700, color: T.amberText, background: T.amberSoft, padding: '1px 6px', borderRadius: 8 }}>Sankhya: aberta</span>}
                    </span>
                    <span style={{ fontSize: 10.5, color: T.inkFaint }}>{o.qtd_materiais} itens</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title={opSelecionada ? `${opSelecionada.br} · OP ${opSelecionada.op}` : 'Selecione uma OP ao lado'}
              subtitle={opSelecionada ? 'Tudo passa pelo Ponto de Estoque primeiro. Você solicita — a equipe confirma quando atender de verdade.' : ''}>
              {!opSelecionada ? (
                <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 12.5 }}>← Escolha uma OP em andamento na lista ao lado</div>
              ) : buscandoMateriais ? (
                <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint }}>Carregando itens…</div>
              ) : materiaisSugeridos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 12.5 }}>Essa OP não tem matéria-prima sincronizada.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {materiaisSugeridos.map(mat => {
                    const jaNoEstoque = chegouEstoquePorMaterial.has(mat.materia_prima_descricao);
                    return (
                    <div key={mat.id} style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{mat.materia_prima_descricao}</div>
                          <div style={{ fontSize: 10.5, color: T.inkFaint }}>Total previsto: {mat.quantidade_mp}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, color: jaNoEstoque ? T.oliveText : T.amberText, background: jaNoEstoque ? T.oliveSoft : T.amberSoft, whiteSpace: 'nowrap' }}>
                          {jaNoEstoque ? '✓ já no estoque' : 'aguardando estoque'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {jaNoEstoque && (
                          <div style={{ position: 'relative' }}>
                            <select value={setorEscolhido[mat.id] || 'Vulcanização'} onChange={e => setSetorEscolhido(s => ({ ...s, [mat.id]: e.target.value }))}
                              style={{ ...inputStyle(), fontSize: 11.5, padding: '5px 24px 5px 8px', appearance: 'none' }}>
                              {SETORES_FLUXO.filter(s => s !== 'Projeto Faturado' && s !== 'Ponto de Estoque').map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: 9, color: T.inkFaint, pointerEvents: 'none' }} />
                          </div>
                        )}
                        <input type="number" placeholder="Qtd. solicitada" value={quantidades[mat.id] || ''}
                          onChange={e => setQuantidades(q => ({ ...q, [mat.id]: e.target.value }))}
                          style={{ ...inputStyle(), width: 120, fontSize: 11.5, padding: '5px 8px' }} />
                        <button onClick={() => criarSolicitacao(mat)}
                          style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer' }}>
                          {jaNoEstoque ? 'Solicitar envio pro setor' : 'Solicitar chegada ao estoque'}
                        </button>
                      </div>
                    </div>
                  );})}
                </div>
              )}
            </Panel>
          </div>

          <Panel title="Minhas solicitações recentes" subtitle="Acompanhe o que já foi atendido pela equipe e o que ainda está esperando">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
              {minhasSolicitacoes.length === 0 ? (
                <div style={{ fontSize: 12, color: T.inkFaint, textAlign: 'center', padding: 16 }}>Nenhuma solicitação ainda.</div>
              ) : minhasSolicitacoes.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, background: T.panelAlt, borderRadius: 6, padding: '7px 12px', fontSize: 11.5 }}>
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong style={{ color: T.blueText, fontFamily: FONT_DISPLAY }}>{s.br}</strong> · OP {s.op} · {s.material}
                    <span style={{ color: T.inkFaint }}> → {s.tipo === 'para_estoque' ? 'Ponto de Estoque' : s.setor_destino}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap',
                    color: s.status === 'atendido' ? T.oliveText : s.status === 'cancelado' ? T.inkFaint : T.amberText,
                    background: s.status === 'atendido' ? T.oliveSoft : s.status === 'cancelado' ? T.lineSoft : T.amberSoft,
                  }}>
                    {s.status === 'atendido' ? '✓ Atendido' : s.status === 'cancelado' ? 'Cancelado' : 'Aguardando'}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Registro manual (BR fora da lista)" subtitle="Se a OP não está na lista de andamento, registra aqui pelo BR direto">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 4 }}>Projeto (BR) *</label>
                  <input value={novoMov.projeto} onChange={e => setNovoMov(m => ({ ...m, projeto: e.target.value }))} placeholder="Ex: 14410/26"
                    style={{ ...inputStyle(), width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 4 }}>OP (Ordem de Produção)</label>
                  <input value={novoMov.op} onChange={e => setNovoMov(m => ({ ...m, op: e.target.value }))} placeholder="Ex: 7860"
                    style={{ ...inputStyle(), width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 4 }}>Material</label>
                  <input value={novoMov.material} onChange={e => setNovoMov(m => ({ ...m, material: e.target.value }))} placeholder="Ex: Placa KLC, Chapa"
                    style={{ ...inputStyle(), width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 4 }}>Entregue para qual setor?</label>
                  <div style={{ position: 'relative' }}>
                    <select value={novoMov.setor} onChange={e => setNovoMov(m => ({ ...m, setor: e.target.value }))} style={{ ...inputStyle(), width: '100%', appearance: 'none' }}>
                      {SETORES_FLUXO.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: 12, color: T.inkFaint, pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 4 }}>Gerou nova necessidade?</label>
                  <div style={{ position: 'relative' }}>
                    <select value={novoMov.gerou_nova_necessidade} onChange={e => setNovoMov(m => ({ ...m, gerou_nova_necessidade: e.target.value }))} style={{ ...inputStyle(), width: '100%', appearance: 'none' }}>
                      <option value="">Não</option>
                      <option value="KDB Controle perda, Divergência do Projeto">Divergência do Projeto</option>
                      <option value="KDB Controle perda, Perca Processo Produtivo">Perca Processo Produtivo</option>
                      <option value="KDB Controle perda, Serviço">Serviço</option>
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: 12, color: T.inkFaint, pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 4 }}>Material pendente?</label>
                  <input value={novoMov.material_pendente} onChange={e => setNovoMov(m => ({ ...m, material_pendente: e.target.value }))} placeholder="Ex: Falta Compra, Falta Corte CNC"
                    style={{ ...inputStyle(), width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 4 }}>Observação</label>
                  <textarea rows={3} value={novoMov.observacao} onChange={e => setNovoMov(m => ({ ...m, observacao: e.target.value }))} placeholder="Ex: Entrega parcial de 200 peças"
                    style={{ ...inputStyle(), width: '100%', resize: 'vertical' }} />
                </div>
                {mensagemMov && (
                  <div style={{ fontSize: 12, padding: '8px 12px', borderRadius: 6, color: mensagemMov.ok ? T.oliveText : T.rustText, background: mensagemMov.ok ? T.oliveSoft : T.rustSoft }}>
                    {mensagemMov.texto}
                  </div>
                )}
                <button onClick={salvarNovaMovimentacao} disabled={salvandoMov}
                  style={{ ...solidBtn(T.terracotta, true), width: '100%', opacity: salvandoMov ? 0.7 : 1, marginTop: 4 }}>
                  {salvandoMov ? 'Salvando…' : 'Salvar movimentação'}
                </button>
              </div>
            </Panel>

            <Panel title="Situação atual" subtitle="Onde cada material está parado agora (a última movimentação registrada), entre projetos ainda não faturados. ⚠ = a última movimentação daquele material teve um problema marcado (perda/divergência). Clique num item pra ver o histórico completo do projeto.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {SETORES_FLUXO.filter(s => s !== 'Projeto Faturado').map(setor => {
                  const itens = situacaoPorSetor[setor] || [];
                  if (itens.length === 0) return null;
                  return (
                    <div key={setor}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink }}>{setor}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: T.blueText, background: T.blueSoft, padding: '2px 7px', borderRadius: 10 }}>{itens.length}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {itens.slice(0, 30).map((it, i) => (
                          <div key={i} onClick={() => abrirDrill(it.br)}
                            title={`${it.material} · desde ${fmtData(it.carimbo_data_hora)}${it.observacao ? ' · ' + it.observacao : ''} · clique pra ver o histórico completo`}
                            style={{ fontSize: 11, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer', maxWidth: 220 }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = T.terracotta}
                            onMouseLeave={e => e.currentTarget.style.borderColor = T.line}>
                            <div>
                              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{it.br}</span>
                              {it.op && <span style={{ color: T.inkFaint }}> · OP {it.op}</span>}
                              {it.gerou_nova_necessidade && <span style={{ color: T.rustText }} title="Última movimentação teve perda/divergência marcada"> ⚠</span>}
                            </div>
                            <div style={{ color: T.inkFaint, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.material}</div>
                          </div>
                        ))}
                        {itens.length > 30 && <span style={{ fontSize: 11, color: T.inkFaint, alignSelf: 'center' }}>+{itens.length - 30} outros</span>}
                      </div>
                    </div>
                  );
                })}
                {situacaoAtual.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Nada em andamento no momento.</div>}
              </div>
            </Panel>
        </>
      )}

      {abaAtiva === 'fila_atendimento' && (
        <FilaAtendimentoAlmoxarifado currentUser={currentUser} />
      )}

      {abaAtiva === 'reservas' && (
        <Panel subtitle="Reserva de matéria-prima no Sankhya, cruzada com a OP (via IDIPROC) e o BR correspondente. ⚠ = a reserva ainda existe mas o projeto já foi faturado — provável reserva que não foi baixada.">
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={buscaReserva} onChange={e => setBuscaReserva(e.target.value)} placeholder="Buscar por produto, BR, OP ou cliente…"
                style={{ ...inputStyle(), width: 280, paddingLeft: 28 }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'suspeitas', label: `⚠ Suspeitas (${reservas.filter(r => r.ja_faturado).length})`, cor: T.rustText },
                { id: 'com_br', label: `Com BR (${reservas.filter(r => r.br).length})`, cor: T.blueText },
                { id: 'todas', label: `Todas (${reservas.length})`, cor: T.inkDim },
              ].map(f => (
                <button key={f.id} onClick={() => setFiltroReserva(f.id)}
                  style={{
                    fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                    border: `1.5px solid ${filtroReserva === f.id ? f.cor : T.line}`,
                    background: filtroReserva === f.id ? f.cor : 'transparent',
                    color: filtroReserva === f.id ? '#fff' : f.cor,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(90)}>Data</th>
                  <th style={thFat(70)}>OP</th>
                  <th style={thFat(110)}>BR</th>
                  <th style={thFat(160)}>Cliente</th>
                  <th style={thFat(0)}>Produto reservado</th>
                  <th style={{ ...thFat(80), textAlign: 'right' }}>Qtd</th>
                  <th style={thFat(150)}>Solicitante</th>
                  <th style={{ ...thFat(90), textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingReservas ? (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                ) : reservasFiltradas.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.oliveText, fontWeight: 600 }}>✓ Nada encontrado.</td></tr>
                ) : reservasFiltradas.slice(0, 300).map(r => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: r.ja_faturado ? `${T.rustSoft}44` : 'transparent' }}>
                    <td style={{ padding: '8px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(r.data_solicitacao)}</td>
                    <td style={{ padding: '8px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{r.op || '—'}</td>
                    <td style={{ padding: '8px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{r.br || '—'}</td>
                    <td style={{ padding: '8px 12px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.cliente_nome}>{r.cliente_nome || '—'}</td>
                    <td style={{ padding: '8px 12px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.descrprod}>{r.descrprod}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{r.quantidade_reservada}</td>
                    <td style={{ padding: '8px 12px', color: T.inkFaint, fontSize: 11 }}>{r.solicitante || '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      {r.ja_faturado ? (
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: T.rustText, background: T.rustSoft, padding: '3px 8px', borderRadius: 4 }}>⚠ Já faturado</span>
                      ) : r.br ? (
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: T.oliveText, background: T.oliveSoft, padding: '3px 8px', borderRadius: 4 }}>Em andamento</span>
                      ) : (
                        <span style={{ fontSize: 10.5, color: T.inkFaint }}>Sem BR</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
            <span>{reservasFiltradas.length} reservas (mostrando até 300)</span>
            <BotaoExportar small onClick={() => exportCSV(reservasFiltradas, 'almoxarifado_reservas.csv',
              ['data_solicitacao', 'op', 'br', 'cliente_nome', 'descrprod', 'quantidade_reservada', 'solicitante', 'ja_faturado'])} />
          </div>
        </Panel>
      )}

      {abaAtiva === 'detalhado' && (
        <Panel subtitle="Log completo de movimentação, com os dias em produção (na linha 'Projeto Faturado') e dias parado no ponto de estoque antes de cada etapa">
          <div style={{ marginBottom: 14 }}>
            <FiltroCampoFat label="Buscar BR, OP ou material">
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
                <input value={buscaDetalhado} onChange={e => setBuscaDetalhado(e.target.value)} placeholder="Ex: BR14105/26"
                  style={{ ...selectStyleFat(240), paddingLeft: 28 }} />
              </div>
            </FiltroCampoFat>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(100)}>Data</th>
                  <th style={thFat(100)}>BR</th>
                  <th style={thFat(70)}>OP</th>
                  <th style={thFat(0)}>Material</th>
                  <th style={thFat(140)}>Setor</th>
                  <th style={{ ...thFat(90), textAlign: 'center' }}>Dias produção</th>
                  <th style={{ ...thFat(90), textAlign: 'center' }}>Dias parado estoque</th>
                  <th style={thFat(160)}>Observação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                ) : detalhadoFiltrado.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nada encontrado.</td></tr>
                ) : detalhadoFiltrado.slice(0, 300).map(d => (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: d.setor === 'Projeto Faturado' ? T.oliveSoft : d.gerou_nova_necessidade ? T.rustSoft : 'transparent' }}>
                    <td style={{ padding: '7px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(d.carimbo_data_hora)}</td>
                    <td style={{ padding: '7px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{d.br || '—'}</td>
                    <td style={{ padding: '7px 12px', color: T.inkFaint }}>{d.op || '—'}</td>
                    <td style={{ padding: '7px 12px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.material}>{d.material}</td>
                    <td style={{ padding: '7px 12px', fontWeight: 600 }}>{d.setor}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center', fontWeight: 700 }}>{d.dias_em_producao ?? '—'}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'center' }}>{d.dias_parado_ponto_estoque ?? '—'}</td>
                    <td style={{ padding: '7px 12px', color: T.inkFaint, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.observacao}>{d.observacao || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
            <span>{detalhadoFiltrado.length} eventos (mostrando até 300, mais recentes primeiro)</span>
            <BotaoExportar small onClick={() => exportCSV(detalhadoFiltrado, 'almoxarifado_detalhado.csv',
              ['carimbo_data_hora', 'br', 'op', 'material', 'setor', 'dias_em_producao', 'dias_parado_ponto_estoque', 'observacao'])} />
          </div>
        </Panel>
      )}

      {abaAtiva === 'faturado_mes' && (
        <>
          <Panel subtitle="Produto acabado realmente faturado por projeto — cruzado direto do Sankhya, não depende de digitação manual">
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <FiltroCampoFat label="Mês de referência">
                <div style={{ position: 'relative' }}>
                  <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} style={selectStyleFat(200)}>
                    <option value="">Todos os meses</option>
                    {mesesDisponiveis.map(m => (
                      <option key={m} value={m}>{new Date(m).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} style={chevronStyleFat} />
                </div>
              </FiltroCampoFat>
            </div>
            <div style={{ fontSize: 11, color: T.inkFaint, marginBottom: 12, background: T.panelAlt, padding: '8px 12px', borderRadius: 6 }}>
              ⚠ A classificação "Linha" (Kalimpact/Aço/PG1-PG2) é aproximada por regra de texto na descrição — o critério original é mais manual/contextual, então alguns itens podem cair numa linha diferente do que você classificaria à mão.
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              {resumoPorLinha.map(r => (
                <div key={r.linha} style={{ background: T.panelAlt, borderRadius: 8, padding: '10px 16px', fontSize: 12.5 }}>
                  <strong>{r.linha}</strong>: {r.itens} itens · {r.projetos} projetos
                </div>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                    <th style={thFat(100)}>Data fat.</th>
                    <th style={thFat(100)}>BR</th>
                    <th style={{ ...thFat(80), textAlign: 'center' }}>Dias prod.</th>
                    <th style={thFat(90)}>Código PA</th>
                    <th style={thFat(0)}>Descrição PA</th>
                    <th style={{ ...thFat(80), textAlign: 'right' }}>Qtd</th>
                    <th style={thFat(60)}>Un.</th>
                    <th style={thFat(100)}>Linha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                  ) : faturadoMesFiltrado.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nada encontrado.</td></tr>
                  ) : faturadoMesFiltrado.slice(0, 300).map((f, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                      <td style={{ padding: '8px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(f.data_faturamento)}</td>
                      <td style={{ padding: '8px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{f.br}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }} title={f.dias_producao_estimado ? 'Estimado via data real do Sankhya — não tinha "Projeto Faturado" registrado no formulário' : ''}>
                        {f.dias_em_producao ?? '—'}{f.dias_producao_estimado && <span style={{ color: T.amberText }}> *</span>}
                      </td>
                      <td style={{ padding: '8px 12px', color: T.inkFaint, fontFamily: FONT_DISPLAY }}>{f.cod_produto}</td>
                      <td style={{ padding: '8px 12px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.produto_descricao}>{f.produto_descricao}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{f.quantidade}</td>
                      <td style={{ padding: '8px 12px', color: T.inkFaint }}>{f.unidade}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 4, color: T.blueText, background: T.blueSoft }}>{f.linha}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
              <span>{faturadoMesFiltrado.length} itens faturados (mostrando até 300) · <span style={{ color: T.amberText }}>*</span> = dias estimados via Sankhya (sem "Projeto Faturado" no formulário)</span>
              <BotaoExportar small onClick={() => exportCSV(faturadoMesFiltrado, 'almoxarifado_faturado_mes.csv',
                ['mes_referencia', 'br', 'data_faturamento', 'cod_produto', 'produto_descricao', 'quantidade', 'unidade', 'linha', 'dias_em_producao'])} />
            </div>
          </Panel>
        </>
      )}

      {abaAtiva === 'produtividade_produto' && (
        <Panel subtitle="Média de dias de produção e produtividade por CÓDIGO DE PRODUTO (não por projeto) — considera só movimentações registradas a partir de agora pelo portal, não o histórico importado da planilha">
          <div style={{ fontSize: 11, color: T.inkFaint, marginBottom: 12, background: T.panelAlt, padding: '8px 12px', borderRadius: 6 }}>
            💡 Essa tabela começa vazia e vai enchendo conforme o time registra movimentações pelo portal (aba "Registrar"). O histórico antigo da planilha não entra aqui de propósito.
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(100)}>Código</th>
                  <th style={thFat(0)}>Descrição do produto</th>
                  <th style={{ ...thFat(90), textAlign: 'center' }}>Projetos</th>
                  <th style={{ ...thFat(110), textAlign: 'center' }}>Média dias produção</th>
                  <th style={{ ...thFat(110), textAlign: 'right' }}>Média qtd/projeto</th>
                  <th style={{ ...thFat(120), textAlign: 'right' }}>Produtividade média</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                ) : produtividadeProduto.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Ainda sem dados — vai populando conforme o time registra movimentações novas pelo portal.</td></tr>
                ) : produtividadeProduto.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '8px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{p.cod_produto}</td>
                    <td style={{ padding: '8px 12px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.produto_descricao}>{p.produto_descricao}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{p.qtd_projetos}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{p.media_dias_producao ?? '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{p.media_quantidade_por_projeto ?? '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{p.media_produtividade_pc_dia ? `${p.media_produtividade_pc_dia} pç/d` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {abaAtiva === 'projetos' && (
        <Panel>
          <div style={{ marginBottom: 14 }}>
            <FiltroCampoFat label="Buscar BR ou OP">
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
                <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: BR14105/26"
                  style={{ ...selectStyleFat(240), paddingLeft: 28 }} />
              </div>
            </FiltroCampoFat>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(120)}>BR</th>
                  <th style={thFat(0)}>OPs</th>
                  <th style={thFat(100)}>Início</th>
                  <th style={{ ...thFat(110), textAlign: 'center' }}>Dias produção</th>
                  <th style={thFat(100)}>Faturado (Sankhya)</th>
                  <th style={{ ...thFat(100), textAlign: 'center' }}>Divergência</th>
                  <th style={{ ...thFat(100), textAlign: 'right' }}>Produtividade</th>
                  <th style={{ ...thFat(80), textAlign: 'center' }}>Perdas</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                ) : projetosFiltrados.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum projeto encontrado.</td></tr>
                ) : projetosFiltrados.slice(0, 150).map(p => {
                  const divergenciaAlta = p.divergencia_dias_faturamento != null && Math.abs(p.divergencia_dias_faturamento) > 2;
                  return (
                    <tr key={p.br} onClick={() => abrirDrill(p.br)}
                      style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{p.br}</td>
                      <td style={{ padding: '9px 12px', color: T.inkFaint, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.ops}>{p.ops}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(p.primeira_movimentacao)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700 }}>{p.dias_em_producao ?? '—'}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(p.data_faturamento_real)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                        {p.divergencia_dias_faturamento == null ? <span style={{ color: T.inkFaint }}>—</span> : (
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 7px', borderRadius: 4, color: divergenciaAlta ? T.rustText : T.oliveText, background: divergenciaAlta ? T.rustSoft : T.oliveSoft }}>
                            {p.divergencia_dias_faturamento > 0 ? '+' : ''}{p.divergencia_dias_faturamento}d
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{p.produtividade_pc_dia ? `${p.produtividade_pc_dia} pç/d` : '—'}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                        {p.qtd_ocorrencias_perda > 0 ? (
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: T.rustText, background: T.rustSoft, padding: '3px 7px', borderRadius: 4 }}>{p.qtd_ocorrencias_perda}</span>
                        ) : <span style={{ color: T.inkFaint }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
            <span>{projetosFiltrados.length} projetos (mostrando até 150) · clique numa linha pra ver a linha do tempo completa</span>
            <BotaoExportar small onClick={() => exportCSV(projetosFiltrados, 'almoxarifado_projetos.csv',
              ['br', 'primeira_movimentacao', 'dias_em_producao', 'data_faturamento_real', 'divergencia_dias_faturamento', 'produtividade_pc_dia', 'qtd_ocorrencias_perda'])} />
          </div>
        </Panel>
      )}

      {abaAtiva === 'perdas' && (
        <Panel subtitle="Ocorrências de 'Gerou nova necessidade' (Divergência, Perca de Processo, Serviço) — preencha o valor quando souber, pra acompanhar o total de perda">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(90)}>Data</th>
                  <th style={thFat(110)}>BR</th>
                  <th style={thFat(0)}>Material</th>
                  <th style={thFat(150)}>Tipo</th>
                  <th style={thFat(0)}>Observação</th>
                  <th style={{ ...thFat(120), textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                ) : perdas.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhuma perda registrada.</td></tr>
                ) : perdas.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(p.carimbo_data_hora)}</td>
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{p.br || '—'}</td>
                    <td style={{ padding: '9px 12px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.material}>{p.material}</td>
                    <td style={{ padding: '9px 12px', fontSize: 11, color: T.rustText }}>{p.tipo_perda}</td>
                    <td style={{ padding: '9px 12px', color: T.inkFaint, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.observacao}>{p.observacao || '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                      <input type="number" step="0.01" placeholder="R$"
                        defaultValue={valoresPerda[p.id] ?? ''}
                        onBlur={e => salvarValorPerda(p.id, e.target.value)}
                        style={{ ...inputStyle(), width: 90, fontSize: 12, textAlign: 'right', padding: '4px 8px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
            <span>{perdas.length} ocorrências · total lançado: {fmtMoeda(kpis.totalPerdasValor)}</span>
            <BotaoExportar small onClick={() => exportCSV(perdas, 'almoxarifado_perdas.csv',
              ['carimbo_data_hora', 'br', 'material', 'setor', 'tipo_perda', 'observacao'])} />
          </div>
        </Panel>
      )}

      {drillBr && (
        <Overlay onClose={() => setDrillBr(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 800,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, margin: 0, color: T.ink }}>{drillBr}</h2>
              <button onClick={() => setDrillBr(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={18} /></button>
            </div>
            <div style={{ overflow: 'auto', flex: 1, padding: '16px 22px' }}>
              {itensDrill.map((it, i) => (
                <div key={it.id} style={{ display: 'flex', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: i < itensDrill.length - 1 ? `1px solid ${T.lineSoft}` : 'none' }}>
                  <div style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', marginTop: 5, background: it.setor === 'Projeto Faturado' ? T.oliveText : it.gerou_nova_necessidade ? T.rustText : T.blueText }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: T.inkFaint, marginBottom: 3 }}>
                      <span>{fmtDataHora(it.carimbo_data_hora)}</span>
                      <span>OP {it.op || '—'}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{it.setor}</div>
                    <div style={{ fontSize: 12, color: T.inkDim }}>{it.material}</div>
                    {it.gerou_nova_necessidade && <div style={{ fontSize: 11.5, color: T.rustText, marginTop: 2 }}>⚠ {it.gerou_nova_necessidade}</div>}
                    {it.material_pendente && <div style={{ fontSize: 11.5, color: T.amberText, marginTop: 2 }}>Pendente: {it.material_pendente}</div>}
                    {it.observacao && <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 2 }}>📝 {it.observacao}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function ProspeccaoClientes() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('novo');
  const [buscando, setBuscando] = useState(false);
  const [buscaStatus, setBuscaStatus] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    const { data, error } = await supabase.from('prospeccao_novos_clientes').select('*').order('gerado_em', { ascending: false });
    if (error) { setErro(error.message); setLoading(false); return; }
    setProspects(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleBuscarAgora = async () => {
    setBuscando(true);
    setBuscaStatus(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/prospectar-novos-clientes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qtd: 15 }),
      }).then(r => r.json());
      if (res.ok) {
        setBuscaStatus({ ok: true, message: `${res.inseridos} novo${res.inseridos !== 1 ? 's' : ''} prospect${res.inseridos !== 1 ? 's' : ''} adicionado${res.inseridos !== 1 ? 's' : ''} (${res.filtrados_por_duplicidade} já eram conhecidos e foram ignorados).` });
        await carregar();
      } else {
        setBuscaStatus({ ok: false, message: res.erro || 'Erro desconhecido.' });
      }
    } catch (err) {
      setBuscaStatus({ ok: false, message: String(err) });
    } finally {
      setBuscando(false);
    }
  };

  const atualizarStatus = async (id, status) => {
    await supabase.from('prospeccao_novos_clientes').update({ status, atualizado_em: new Date().toISOString() }).eq('id', id);
    await carregar();
  };

  const [pesquisandoId, setPesquisandoId] = useState(null);
  const [erroPesquisaId, setErroPesquisaId] = useState(null);
  const pesquisarMaisAFundo = async (id) => {
    setPesquisandoId(id);
    setErroPesquisaId(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/pesquisar-prospect-individual`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).then(r => r.json());
      if (!res.ok) throw new Error(res.erro || 'Erro desconhecido.');
      await carregar();
    } catch (err) {
      setErroPesquisaId({ id, mensagem: String(err.message || err) });
    } finally {
      setPesquisandoId(null);
    }
  };

  const filtrados = useMemo(() => {
    return prospects
      .filter(p => filtroStatus === 'todos' || p.status === filtroStatus)
      .filter(p => !busca ||
        p.empresa.toLowerCase().includes(busca.toLowerCase()) ||
        (p.setor_sugerido || '').toLowerCase().includes(busca.toLowerCase()));
  }, [prospects, filtroStatus, busca]);

  const kpis = useMemo(() => ({
    total: prospects.length,
    novo: prospects.filter(p => p.status === 'novo').length,
    em_analise: prospects.filter(p => p.status === 'em_analise').length,
    contatado: prospects.filter(p => p.status === 'contatado').length,
    descartado: prospects.filter(p => p.status === 'descartado').length,
  }), [prospects]);

  const fmtData = (iso) => !iso ? '—' : new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  const statusInfo = {
    novo: { label: 'Novo', cor: T.blueText, bg: T.blueSoft },
    em_analise: { label: 'Em análise', cor: T.amberText, bg: T.amberSoft },
    contatado: { label: 'Contatado', cor: T.oliveText, bg: T.oliveSoft },
    descartado: { label: 'Descartado', cor: T.inkFaint, bg: T.lineSoft },
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 280 }}>
          Agente de IA sugere empresas novas toda segunda-feira, cruzando contra TODA a nossa carteira (não repete cliente
          existente nem recorrente), e faz uma <strong>pesquisa profunda com busca real na web</strong> pra cada uma —
          site, LinkedIn, contato de compras quando encontrar. Mesmo assim, sempre confirme antes de abordar.
        </div>
        <button onClick={handleBuscarAgora} disabled={buscando} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: T.terracotta, color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, opacity: buscando ? 0.7 : 1, flexShrink: 0,
        }}>
          <RefreshCw size={15} className={buscando ? 'spin' : ''} />
          {buscando ? 'Buscando…' : 'Buscar novos prospects agora'}
        </button>
      </div>

      {buscaStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
          background: buscaStatus.ok ? T.oliveSoft : T.rustSoft, border: `1px solid ${buscaStatus.ok ? T.olive : T.rust}33`,
        }}>
          {buscaStatus.ok ? <CheckCircle2 size={14} color={T.oliveText} /> : <AlertTriangle size={14} color={T.rustText} />}
          <span style={{ fontSize: 12.5, color: buscaStatus.ok ? T.oliveText : T.rustText }}>{buscaStatus.message}</span>
        </div>
      )}

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <Kpi label="Total de prospects" value={loading ? '…' : kpis.total} icon={UserPlus} tone="blue" />
        <Kpi label="Novos" value={loading ? '…' : kpis.novo} icon={Bell} tone="blue" sub="ainda não revisados" />
        <Kpi label="Em análise" value={loading ? '…' : kpis.em_analise} icon={Clock3} tone="amber" />
        <Kpi label="Contatados" value={loading ? '…' : kpis.contatado} icon={CheckCircle2} tone="olive" />
        <Kpi label="Descartados" value={loading ? '…' : kpis.descartado} icon={X} sub="não eram bons prospects" />
      </div>

      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Buscar empresa ou setor">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: Ternium, mineração…"
                style={{ ...selectStyleFat(260), paddingLeft: 28 }} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Status">
            <div style={{ position: 'relative' }}>
              <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={selectStyleFat(180)}>
                <option value="novo">Novo</option>
                <option value="em_analise">Em análise</option>
                <option value="contatado">Contatado</option>
                <option value="descartado">Descartado</option>
                <option value="todos">Todos</option>
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
        </div>
      </Panel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 12.5, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }}>
            Nenhum prospect encontrado com esse filtro. Clique em "Buscar novos prospects agora".
          </div>
        ) : filtrados.map(p => {
          const st = statusInfo[p.status] || statusInfo.novo;
          return (
            <div key={p.id} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: T.ink }}>{p.empresa}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: st.cor, background: st.bg, padding: '3px 8px', borderRadius: 4 }}>{st.label}</span>
                    {p.pesquisado ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: T.oliveText, background: T.oliveSoft, padding: '3px 8px', borderRadius: 4 }}>✓ pesquisa profunda (web)</span>
                    ) : (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: T.rustText, background: T.rustSoft, padding: '3px 8px', borderRadius: 4 }}>⚠ só sugestão, sem pesquisa</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: T.inkFaint, marginBottom: 6 }}>
                    {p.setor_sugerido || 'Setor não informado'}{p.localizacao_sugerida ? ` · ${p.localizacao_sugerida}` : ''} · sugerido em {fmtData(p.gerado_em)}
                  </div>
                  {p.motivo && <div style={{ fontSize: 12.5, color: T.inkDim, marginBottom: 4 }}>{p.motivo}</div>}
                  {p.produtos_sugeridos && <div style={{ fontSize: 11.5, color: T.blueText, marginBottom: 6 }}>💡 {p.produtos_sugeridos}</div>}

                  {(p.telefone || p.email || p.site || p.linkedin_url || p.contato_comprador) && (
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11.5, color: T.oliveText, marginBottom: 6 }}>
                      {p.contato_comprador && <span>👤 {p.contato_comprador}</span>}
                      {p.telefone && <span>📞 {p.telefone}</span>}
                      {p.email && <span>✉️ {p.email}</span>}
                      {p.site && <a href={p.site.startsWith('http') ? p.site : `https://${p.site}`} target="_blank" rel="noopener noreferrer" style={{ color: T.oliveText, textDecoration: 'none' }}>🌐 site</a>}
                      {p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: T.oliveText, textDecoration: 'none' }}>🔗 LinkedIn</a>}
                    </div>
                  )}

                  {p.resumo_pesquisa_profunda && (
                    <div style={{ fontSize: 11.5, color: T.inkDim, background: T.panelAlt, borderRadius: 6, padding: '8px 10px', marginTop: 4 }}>
                      🔎 {p.resumo_pesquisa_profunda}
                    </div>
                  )}
                  {p.fontes_pesquisa && (
                    <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.fontes_pesquisa}>
                      Fontes: {p.fontes_pesquisa}
                    </div>
                  )}
                  {p.observacao && (
                    <div style={{ fontSize: 11, color: T.inkFaint, background: T.panelAlt, borderRadius: 6, padding: '6px 10px', marginTop: 4 }}>
                      📝 {p.observacao}
                    </div>
                  )}
                  {erroPesquisaId?.id === p.id && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.rustText, background: T.rustSoft, borderRadius: 6, padding: '6px 10px', marginTop: 4 }}>
                      <AlertTriangle size={12} /> {erroPesquisaId.mensagem}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                  <button onClick={() => pesquisarMaisAFundo(p.id)} disabled={pesquisandoId === p.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontWeight: 700, opacity: pesquisandoId === p.id ? 0.6 : 1 }}>
                    <Search size={12} className={pesquisandoId === p.id ? 'spin' : ''} />
                    {pesquisandoId === p.id ? 'Pesquisando…' : 'Pesquisar mais a fundo'}
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {p.status !== 'em_analise' && <button onClick={() => atualizarStatus(p.id, 'em_analise')} style={{ fontSize: 11, color: T.amberText, background: T.amberSoft, border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontWeight: 600 }}>Em análise</button>}
                    {p.status !== 'contatado' && <button onClick={() => atualizarStatus(p.id, 'contatado')} style={{ fontSize: 11, color: T.oliveText, background: T.oliveSoft, border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontWeight: 600 }}>Contatado</button>}
                    {p.status !== 'descartado' && <button onClick={() => atualizarStatus(p.id, 'descartado')} style={{ fontSize: 11, color: T.inkFaint, background: T.lineSoft, border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontWeight: 600 }}>Descartar</button>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
        <span>{filtrados.length} prospect{filtrados.length !== 1 ? 's' : ''}</span>
        <BotaoExportar small onClick={() => exportCSV(filtrados, 'prospeccao_novos_clientes.csv',
          ['empresa', 'setor_sugerido', 'localizacao_sugerida', 'motivo', 'produtos_sugeridos', 'status', 'gerado_em'])} />
      </div>
    </div>
  );
}

function AnaliseComercial() {
  const [notas, setNotas] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [segmentoAberto, setSegmentoAberto] = useState(null); // 'unica' | 'poucas' | 'recorrente' | null
  const [clienteAberto, setClienteAberto] = useState(null); // detalhe de um cliente específico
  const [buscaSemFechar, setBuscaSemFechar] = useState('');
  const [periodo, setPeriodo] = useState(() => {
    const hoje = new Date();
    // Objetivo da aba é remarketing — precisa do máximo de histórico possível pra
    // identificar clientes de compra única/pouco frequentes. Sincronizamos o histórico
    // completo do Sankhya (nota_venda_itens vai até 2023), então o padrão cobre tudo.
    return { dataIni: '2023-01-01', dataFim: hoje.toISOString().slice(0, 10) };
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const buscarTudoEmLotes = async (tabela, campos, filtros) => {
        const TAMANHO_LOTE = 1000;
        let resultado = [];
        let pagina = 0;
        while (true) {
          let q = supabase.from(tabela).select(campos);
          if (filtros) q = filtros(q);
          const { data, error } = await q.range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
          if (error) throw error;
          resultado = resultado.concat(data || []);
          if (!data || data.length < TAMANHO_LOTE) break;
          pagina += 1;
          if (pagina > 50) break;
        }
        return resultado;
      };

      const [notasData, propostasData] = await Promise.all([
        buscarTudoEmLotes('nota_venda_itens', 'nunota,br,cliente_nome,produto_descricao,quantidade,valor_bruto,data_faturamento,data_neg',
          q => q.gte('data_neg', periodo.dataIni).lte('data_neg', periodo.dataFim)),
        buscarTudoEmLotes('propostas', 'br,cliente,status,valor_liquido,data_abertura',
          q => q.gte('data_abertura', periodo.dataIni).lte('data_abertura', periodo.dataFim)),
      ]);

      setNotas(notasData);
      setPropostas(propostasData);
    } catch (e) {
      setErro(String(e?.message || e));
    }
    setLoading(false);
  }, [periodo]);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Enriquecimento: clientes prioritários pra remarketing/follow-up ────
  const [enriquecimento, setEnriquecimento] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('pesquisar');
  const [buscaEnriq, setBuscaEnriq] = useState('');
  const carregarEnriquecimento = useCallback(async () => {
    const TAMANHO_LOTE = 1000;
    let resultado = [];
    let pagina = 0;
    while (true) {
      const { data, error } = await supabase.from('analise_comercial_enriquecimento')
        .select('*').order('valor_referencia', { ascending: false })
        .range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
      if (error) break;
      resultado = resultado.concat(data || []);
      if (!data || data.length < TAMANHO_LOTE) break;
      pagina += 1;
    }
    setEnriquecimento(resultado);
  }, []);
  useEffect(() => { carregarEnriquecimento(); }, [carregarEnriquecimento]);

  const enriquecimentoFiltrado = useMemo(() => {
    return enriquecimento
      .filter(e => filtroCategoria === 'todos' || e.categoria === filtroCategoria)
      .filter(e => !buscaEnriq || e.cliente.toLowerCase().includes(buscaEnriq.toLowerCase()));
  }, [enriquecimento, filtroCategoria, buscaEnriq]);

  const kpisEnriq = useMemo(() => ({
    total: enriquecimento.length,
    pesquisar: enriquecimento.filter(e => e.categoria === 'pesquisar').length,
    pesquisados: enriquecimento.filter(e => e.categoria === 'pesquisar' && e.pesquisado).length,
    grandeConhecido: enriquecimento.filter(e => e.categoria === 'grande_conhecido').length,
  }), [enriquecimento]);

  // ── Distribuição por setor (a partir do texto pesquisado de cada cliente) ─
  const categorizarSetor = (setor, categoria) => {
    const s = (setor || '').toLowerCase();
    if (s.includes('mineração') || s.includes('mineracao') || s.includes('minério') || s.includes('minerio')) return 'Mineração';
    if (s.includes('cimento') || s.includes('concreto') || s.includes(' cal,') || s.includes('calcário')) return 'Cimento/Concreto';
    if (s.includes('siderúr') || s.includes('siderur') || s.includes('aço') || s.includes('metal') || s.includes('caldeiraria') || s.includes('usinagem')) return 'Metalúrgica/Siderúrgica';
    if (s.includes('porto') || s.includes('portuár') || s.includes('terminal') || s.includes('granel')) return 'Portuário/Logística';
    if (s.includes('agro') || s.includes('etanol') || s.includes('grão') || s.includes('grao')) return 'Agronegócio';
    if (s.includes('vidro')) return 'Vidros';
    if (s.includes('equipamento') || s.includes('máquina') || s.includes('maquina')) return 'Equipamentos Industriais';
    if (s.includes('engenharia') || s.includes('montagem') || s.includes('construç') || s.includes('construc')) return 'Engenharia/Montagem';
    if (categoria === 'grande_conhecido') return 'Grande conhecido (diverso)';
    return 'Outros';
  };
  const setoresDist = useMemo(() => {
    const grupos = {};
    enriquecimento.forEach(e => {
      const cat = categorizarSetor(e.setor, e.categoria);
      if (!grupos[cat]) grupos[cat] = { setor: cat, qtd: 0, valor: 0 };
      grupos[cat].qtd += 1;
      grupos[cat].valor += Number(e.valor_referencia) || 0;
    });
    const lista = Object.values(grupos).sort((a, b) => b.valor - a.valor);
    const maxValor = Math.max(...lista.map(g => g.valor), 1);
    return lista.map(g => ({ ...g, pctBarra: (g.valor / maxValor) * 100 }));
  }, [enriquecimento]);

  // ── Funil de clientes por frequência de compra ──────────────────────────
  const funil = useMemo(() => {
    const porCliente = {};
    notas.forEach(n => {
      const cliente = n.cliente_nome || 'Sem nome';
      if (!porCliente[cliente]) porCliente[cliente] = { cliente, nunotas: new Set(), itens: [], valorTotal: 0, primeiraCompra: n.data_neg, ultimaCompra: n.data_neg };
      porCliente[cliente].nunotas.add(n.nunota);
      porCliente[cliente].itens.push(n);
      porCliente[cliente].valorTotal += Number(n.valor_bruto) || 0;
      if (n.data_neg < porCliente[cliente].primeiraCompra) porCliente[cliente].primeiraCompra = n.data_neg;
      if (n.data_neg > porCliente[cliente].ultimaCompra) porCliente[cliente].ultimaCompra = n.data_neg;
    });

    const clientes = Object.values(porCliente).map(c => ({
      cliente: c.cliente,
      totalCompras: c.nunotas.size,
      valorTotal: c.valorTotal,
      primeiraCompra: c.primeiraCompra,
      ultimaCompra: c.ultimaCompra,
      itens: c.itens.sort((a, b) => (b.data_neg || '').localeCompare(a.data_neg || '')),
    }));

    const unica = clientes.filter(c => c.totalCompras === 1).sort((a, b) => b.valorTotal - a.valorTotal);
    const poucas = clientes.filter(c => c.totalCompras >= 2 && c.totalCompras <= 3).sort((a, b) => b.valorTotal - a.valorTotal);
    const recorrente = clientes.filter(c => c.totalCompras >= 4).sort((a, b) => b.valorTotal - a.valorTotal);

    return { total: clientes.length, unica, poucas, recorrente };
  }, [notas]);

  // ── Propostas sem pedido fechado (BR sem nenhuma nota de venda) ─────────
  const semFechar = useMemo(() => {
    const brsComVenda = new Set(notas.map(n => n.br));
    return propostas
      .filter(p => p.br && !brsComVenda.has(p.br) && p.status !== 'reprovada')
      .map(p => ({
        ...p,
        diasAberto: p.data_abertura ? Math.floor((Date.now() - new Date(p.data_abertura).getTime()) / 86400000) : null,
      }))
      .filter(p => !buscaSemFechar ||
        p.br.toLowerCase().includes(buscaSemFechar.toLowerCase()) ||
        (p.cliente || '').toLowerCase().includes(buscaSemFechar.toLowerCase()))
      .sort((a, b) => (b.diasAberto || 0) - (a.diasAberto || 0));
  }, [notas, propostas, buscaSemFechar]);

  const valorSemFechar = useMemo(() => semFechar.reduce((s, p) => s + (Number(p.valor_liquido) || 0), 0), [semFechar]);

  const fmtData = (iso) => !iso ? '—' : new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  const statusPropostaLabel = (s) => ({
    rascunho: 'Aguardando confirmação', em_revisao_tecnica: 'Revisão técnica', aguardando_aprovacao: 'Aguardando aprovação',
    aprovada: 'Aprovada', concluida: 'Concluída', reprovada: 'Reprovada',
  }[s] || s);

  const segmentoInfo = {
    unica: { titulo: 'Compraram só 1 vez', cor: T.rustText, bg: T.rustSoft, lista: funil.unica },
    poucas: { titulo: 'Compraram 2-3 vezes', cor: T.amberText, bg: T.amberSoft, lista: funil.poucas },
    recorrente: { titulo: 'Clientes recorrentes (4+)', cor: T.oliveText, bg: T.oliveSoft, lista: funil.recorrente },
  };

  const [abaAtiva, setAbaAtiva] = useState('visao_geral');
  const ABAS = [
    { id: 'visao_geral', label: 'Visão geral' },
    { id: 'sem_fechar', label: `Propostas sem fechar${semFechar.length ? ` (${semFechar.length})` : ''}` },
    { id: 'prioritarios', label: `Clientes prioritários${kpisEnriq.total ? ` (${kpisEnriq.total})` : ''}` },
  ];

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 280 }}>
          Funil de clientes por frequência de compra (fonte: Nota de Venda) e propostas que nunca resultaram em pedido faturado.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <FiltroCampoFat label="De">
            <input type="date" value={periodo.dataIni} onChange={e => setPeriodo(p => ({ ...p, dataIni: e.target.value }))} style={selectStyleFat(140)} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Até">
            <input type="date" value={periodo.dataFim} onChange={e => setPeriodo(p => ({ ...p, dataFim: e.target.value }))} style={selectStyleFat(140)} />
          </FiltroCampoFat>
        </div>
      </div>

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${T.line}` }}>
        {ABAS.map(aba => (
          <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, fontWeight: 600,
              color: abaAtiva === aba.id ? T.terracotta : T.inkFaint,
              borderBottom: `2px solid ${abaAtiva === aba.id ? T.terracotta : 'transparent'}`, marginBottom: -1,
            }}>
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === 'visao_geral' && (
      <>
      {/* ── FUNIL ────────────────────────────────────────────────────────── */}
      <Panel title="Funil de clientes por frequência de compra" subtitle="Clique num segmento pra ver a lista de clientes">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
        ) : (
          <FunilVisualSVG segmentos={['recorrente', 'poucas', 'unica'].map(key => ({
            key, ...segmentoInfo[key], qtd: segmentoInfo[key].lista.length,
            valor: segmentoInfo[key].lista.reduce((s, c) => s + c.valorTotal, 0),
          }))} total={funil.total} ativo={segmentoAberto} onClick={k => setSegmentoAberto(segmentoAberto === k ? null : k)} />
        )}
      </Panel>

      {/* ── DISTRIBUIÇÃO POR SETOR ───────────────────────────────────────── */}
      <Panel title="Distribuição por setor" subtitle="Clientes prioritários (256) agrupados por setor de atuação — quanto de oportunidade tem em cada um">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {setoresDist.map(g => (
            <div key={g.setor} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 190, fontSize: 12, fontWeight: 600, color: T.ink, flexShrink: 0, textAlign: 'right' }}>{g.setor}</div>
              <div style={{ flex: 1, background: T.panelAlt, borderRadius: 6, height: 26, position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: `${g.pctBarra}%`, height: '100%', background: T.blueSoft, borderRadius: 6, borderRight: `2px solid ${T.blueText}` }} />
              </div>
              <div style={{ width: 150, fontSize: 11.5, color: T.inkFaint, flexShrink: 0, whiteSpace: 'nowrap' }}>
                {g.qtd} cliente{g.qtd !== 1 ? 's' : ''} · {fmtMoedaCompacta(g.valor)}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── LISTA DO SEGMENTO SELECIONADO ────────────────────────────────── */}
      {segmentoAberto && (
        <Panel title={segmentoInfo[segmentoAberto].titulo} subtitle="Clique num cliente pra ver o que comprou e quando"
          right={<button onClick={() => setSegmentoAberto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={16} /></button>}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(0)}>Cliente</th>
                  <th style={{ ...thFat(90), textAlign: 'right' }}>Compras</th>
                  <th style={{ ...thFat(120), textAlign: 'right' }}>Valor total</th>
                  <th style={thFat(110)}>1ª compra</th>
                  <th style={thFat(110)}>Última compra</th>
                </tr>
              </thead>
              <tbody>
                {segmentoInfo[segmentoAberto].lista.map(c => (
                  <tr key={c.cliente} style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}
                    onClick={() => setClienteAberto(c)}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '9px 12px', fontWeight: 600 }}>{c.cliente}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{c.totalCompras}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtMoeda(c.valorTotal)}</td>
                    <td style={{ padding: '9px 12px', color: T.inkDim }}>{fmtData(c.primeiraCompra)}</td>
                    <td style={{ padding: '9px 12px', color: T.inkDim }}>{fmtData(c.ultimaCompra)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
            <span>{segmentoInfo[segmentoAberto].lista.length} clientes</span>
            <BotaoExportar small onClick={() => exportCSV(segmentoInfo[segmentoAberto].lista, `clientes_${segmentoAberto}.csv`,
              ['cliente', 'totalCompras', 'valorTotal', 'primeiraCompra', 'ultimaCompra'])} />
          </div>
        </Panel>
      )}
      </>
      )}

      {abaAtiva === 'sem_fechar' && (
      <>
      {/* ── PROPOSTAS SEM PEDIDO FECHADO ─────────────────────────────────── */}
      <Panel title="Propostas sem pedido fechado" subtitle="BRs com proposta cadastrada, mas sem nenhuma nota de venda emitida até hoje">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
            <input value={buscaSemFechar} onChange={e => setBuscaSemFechar(e.target.value)} placeholder="Buscar BR ou cliente…"
              style={{ ...selectStyleFat(260), paddingLeft: 28 }} />
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: T.inkFaint }}>Propostas sem fechar</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: T.rustText }}>{loading ? '…' : semFechar.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.inkFaint }}>Valor em risco</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: T.rustText }}>{loading ? '…' : fmtMoedaCompacta(valorSemFechar)}</div>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <th style={thFat(0)}>BR</th>
                <th style={thFat(0)}>Cliente</th>
                <th style={thFat(140)}>Status da proposta</th>
                <th style={{ ...thFat(120), textAlign: 'right' }}>Valor</th>
                <th style={thFat(110)}>Abertura</th>
                <th style={{ ...thFat(100), textAlign: 'right' }}>Dias</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : semFechar.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.oliveText, fontWeight: 600 }}>✓ Todas as propostas do período resultaram em pedido faturado.</td></tr>
              ) : semFechar.map(p => (
                <tr key={p.br} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: (p.diasAberto || 0) > 60 ? T.rustSoft : 'transparent' }}>
                  <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{p.br}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 600 }}>{p.cliente || '—'}</td>
                  <td style={{ padding: '9px 12px', color: T.inkDim }}>{statusPropostaLabel(p.status)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtMoeda(p.valor_liquido)}</td>
                  <td style={{ padding: '9px 12px', color: T.inkDim }}>{fmtData(p.data_abertura)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: (p.diasAberto || 0) > 60 ? T.rustText : T.inkDim }}>{p.diasAberto ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
          <span>Linhas em vermelho = aberta há mais de 60 dias sem fechar</span>
          <BotaoExportar small onClick={() => exportCSV(semFechar, 'propostas_sem_fechar.csv',
            ['br', 'cliente', 'status', 'valor_liquido', 'data_abertura', 'diasAberto'])} />
        </div>
      </Panel>
      </>
      )}

      {/* ── DETALHE DE UM CLIENTE (o que comprou, quando) ────────────────── */}
      {clienteAberto && (
        <Overlay onClose={() => setClienteAberto(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 700,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: T.ink }}>{clienteAberto.cliente}</div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>
                  {clienteAberto.totalCompras} compra{clienteAberto.totalCompras !== 1 ? 's' : ''} · {fmtMoeda(clienteAberto.valorTotal)} no total
                </div>
              </div>
              <button onClick={() => setClienteAberto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={18} /></button>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                    <th style={thFat(0)}>Produto</th>
                    <th style={thFat(90)}>BR</th>
                    <th style={{ ...thFat(70), textAlign: 'right' }}>Qtd</th>
                    <th style={{ ...thFat(100), textAlign: 'right' }}>Valor</th>
                    <th style={thFat(100)}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {clienteAberto.itens.map((it, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                      <td style={{ padding: '9px 12px', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={it.produto_descricao}>{it.produto_descricao}</td>
                      <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, color: T.blueText }}>{it.br || '—'}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right' }}>{it.quantidade}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtMoeda(it.valor_bruto)}</td>
                      <td style={{ padding: '9px 12px', color: T.inkFaint, whiteSpace: 'nowrap' }}>{fmtData(it.data_neg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Overlay>
      )}

      {abaAtiva === 'prioritarios' && (
      <>
      {/* ── CLIENTES PRIORITÁRIOS PRA REMARKETING/FOLLOW-UP ──────────────── */}
      <Panel title="Clientes prioritários (remarketing e follow-up)"
        subtitle="Proposta sem fechar, poucas compras, ou sem proposta nova há 45+ dias — contato do Sankhya + pesquisa de mercado">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginBottom: 16 }}>
          <Kpi label="Total de clientes" value={kpisEnriq.total} icon={Users} tone="blue" sub="propostas/compras que precisam atenção" />
          <Kpi label="Pra pesquisar" value={kpisEnriq.pesquisar} icon={Search} tone="amber" sub="pequenas/médias, pesquisa de mercado agrega valor" />
          <Kpi label="Já pesquisados" value={kpisEnriq.pesquisados} icon={CheckCircle2} tone="olive" sub={`${kpisEnriq.pesquisar ? Math.round(kpisEnriq.pesquisados / kpisEnriq.pesquisar * 100) : 0}% da fila concluído`} />
          <Kpi label="Grandes já conhecidos" value={kpisEnriq.grandeConhecido} icon={Package} sub="Vale, ArcelorMittal etc — só follow-up interno" />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
          <FiltroCampoFat label="Buscar cliente">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={buscaEnriq} onChange={e => setBuscaEnriq(e.target.value)} placeholder="Nome do cliente…"
                style={{ ...selectStyleFat(240), paddingLeft: 28 }} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Categoria">
            <div style={{ position: 'relative' }}>
              <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={selectStyleFat(240)}>
                <option value="pesquisar">Pequenas/médias (pesquisar)</option>
                <option value="grande_conhecido">Grandes já conhecidos</option>
                <option value="todos">Todos</option>
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <th style={thFat(0)}>Cliente</th>
                <th style={thFat(0)}>Setor / contexto</th>
                <th style={thFat(150)}>Contato</th>
                <th style={{ ...thFat(110), textAlign: 'right' }}>Valor ref.</th>
                <th style={{ ...thFat(90), textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {enriquecimentoFiltrado.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum cliente encontrado.</td></tr>
              ) : enriquecimentoFiltrado.slice(0, 100).map(e => (
                <tr key={e.cliente} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '9px 12px', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.cliente}>{e.cliente}</td>
                  <td style={{ padding: '9px 12px', maxWidth: 280, color: e.setor ? T.inkDim : T.inkFaint, fontSize: 11.5 }} title={e.setor}>
                    {e.setor || (e.categoria === 'grande_conhecido' ? 'Cliente grande já conhecido — sem pesquisa necessária' : 'Ainda não pesquisado')}
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: 11 }}>
                    {e.telefone && e.telefone !== '000000000000' && <div style={{ color: T.blueText }}>{e.telefone}</div>}
                    {e.email && <div style={{ color: T.blueText }}>{e.email}</div>}
                    {(!e.telefone || e.telefone === '000000000000') && !e.email && <span style={{ color: T.inkFaint }}>—</span>}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtMoedaCompacta(e.valor_referencia)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    {e.categoria === 'grande_conhecido' ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, background: T.lineSoft, padding: '3px 7px', borderRadius: 4 }}>follow-up</span>
                    ) : e.pesquisado ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.oliveText, background: T.oliveSoft, padding: '3px 7px', borderRadius: 4 }}>pesquisado</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.amberText, background: T.amberSoft, padding: '3px 7px', borderRadius: 4 }}>pendente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
          <span>{enriquecimentoFiltrado.length} clientes (mostrando até 100) · pesquisa de mercado sendo completada progressivamente</span>
          <BotaoExportar small onClick={() => exportCSV(enriquecimentoFiltrado, 'clientes_prioritarios.csv',
            ['cliente','categoria','setor','telefone','email','valor_referencia','pesquisado'])} />
        </div>
      </Panel>
      </>
      )}
    </div>
  );
}

function VerificacaoProjetos({ currentUser }) {
  const podeEditar = APROVADORES_POOL.includes(currentUser?.nome);
  const [projetosSemana, setProjetosSemana] = useState([]);
  const [propostasMap, setPropostasMap] = useState({}); // br -> proposta
  const [manuaisMap, setManuaisMap] = useState({}); // `${codproj}-${item}` -> registro manual
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [ultimoSync, setUltimoSync] = useState(null);
  const [observacaoAberta, setObservacaoAberta] = useState(null); // { codproj, item }

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data: projetos, error: eProj } = await supabase.from('projetos_sankhya_semana')
      .select('*').order('dhalter', { ascending: false });
    if (eProj) { setErro(eProj.message); setLoading(false); return; }

    const brs = (projetos || []).map(p => p.identificacao).filter(Boolean);
    const { data: propostas, error: eProp } = brs.length
      ? await supabase.from('propostas').select('br,status,conhecimento_pedido,data_conhecimento_pedido,responsavel_id,data_abertura').in('br', brs)
      : { data: [], error: null };
    if (eProp) { setErro(eProp.message); setLoading(false); return; }

    const { data: manuais, error: eManual } = await supabase.from('verificacao_projetos_manual').select('*');
    if (eManual) { setErro(eManual.message); setLoading(false); return; }

    const pMap = {};
    (propostas || []).forEach(p => { if (!pMap[p.br]) pMap[p.br] = p; });
    const mMap = {};
    (manuais || []).forEach(m => { mMap[`${m.codproj}-${m.item}`] = m; });

    setProjetosSemana(projetos || []);
    setPropostasMap(pMap);
    setManuaisMap(mMap);
    if (projetos?.length) setUltimoSync(projetos[0].sincronizado_em);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const id = setInterval(carregar, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const handleAtualizar = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sankhya-projetos-semana-sync`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      }).then(r => r.json());
      if (res.ok) {
        setSyncStatus({ ok: true, message: `${res.gravados} projeto${res.gravados !== 1 ? 's' : ''} encontrado${res.gravados !== 1 ? 's' : ''} nessa semana.` });
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

  const marcarManual = async (codproj, item, concluido, observacao = null) => {
    if (!podeEditar) return; // só Edson, Felipe e João Victor podem marcar/desmarcar
    const { error } = await supabase.from('verificacao_projetos_manual')
      .upsert({ codproj, item, concluido, observacao, marcado_por: currentUser?.nome, marcado_em: new Date().toISOString() }, { onConflict: 'codproj,item' });
    if (!error) await carregar();
  };

  // Monta o checklist de cada projeto: o "concluído" É SEMPRE a marcação manual (é o controle
  // do time, não pode ser automático) — o dado da tabela `propostas` aparece só como SUGESTÃO,
  // pra ajudar quem for marcar, mas nunca marca a caixinha por conta própria.
  const projetos = useMemo(() => {
    return projetosSemana.map(p => {
      const proposta = propostasMap[p.identificacao];
      const manualProposta = manuaisMap[`${p.codproj}-proposta_criada`];
      const manualConhecimento = manuaisMap[`${p.codproj}-conhecimento_pedido`];

      const propostaCriada = manualProposta?.concluido ?? false;
      const conhecimentoPedido = manualConhecimento?.concluido ?? false;
      const sugestaoProposta = !!proposta; // indício automático, não conta como confirmado
      const sugestaoConhecimento = !!proposta?.conhecimento_pedido;

      const pendencias = (propostaCriada ? 0 : 1) + (conhecimentoPedido ? 0 : 1);

      return {
        ...p,
        proposta,
        propostaCriada,
        sugestaoProposta,
        marcadoPorProposta: manualProposta?.marcado_por || null,
        marcadoEmProposta: manualProposta?.marcado_em || null,
        conhecimentoPedido,
        sugestaoConhecimento,
        marcadoPorConhecimento: manualConhecimento?.marcado_por || null,
        marcadoEmConhecimento: manualConhecimento?.marcado_em || null,
        pendencias,
      };
    });
  }, [projetosSemana, propostasMap, manuaisMap]);

  const filtrados = useMemo(() => {
    return projetos
      .filter(p => !busca ||
        p.identificacao.toLowerCase().includes(busca.toLowerCase()) ||
        (p.abreviatura || '').toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => b.pendencias - a.pendencias || (b.dhalter || '').localeCompare(a.dhalter || ''));
  }, [projetos, busca]);

  const kpis = useMemo(() => ({
    total: projetos.length,
    semProposta: projetos.filter(p => !p.propostaCriada).length,
    semConhecimento: projetos.filter(p => !p.conhecimentoPedido).length,
    completos: projetos.filter(p => p.propostaCriada && p.conhecimentoPedido).length,
  }), [projetos]);

  const fmtData = (iso) => !iso ? '—' : new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const fmtDataHora = (iso) => !iso ? '—' : new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const ChecklistItem = ({ ok, label, sugestao, marcadoPor, marcadoEm, podeEditar, onToggle }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <button
        onClick={podeEditar ? onToggle : undefined}
        disabled={!podeEditar}
        title={!podeEditar ? 'Só Edson, Felipe e João Victor podem confirmar isso' : (ok ? 'Marcado — clique pra desmarcar' : 'Clique pra confirmar manualmente')}
        style={{
          width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${ok ? T.oliveText : T.line}`,
          background: ok ? T.oliveText : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: podeEditar ? 'pointer' : 'not-allowed', flexShrink: 0, marginTop: 1, opacity: podeEditar ? 1 : 0.6,
        }}>
        {ok && <CheckCircle2 size={13} color="#fff" strokeWidth={3} />}
      </button>
      <div>
        <div style={{ fontSize: 12, color: ok ? T.ink : T.inkFaint, fontWeight: ok ? 600 : 400 }}>{label}</div>
        {ok && marcadoPor && (
          <div style={{ fontSize: 10.5, color: T.oliveText, marginTop: 2 }}>por {marcadoPor}{marcadoEm ? ` · ${fmtDataHora(marcadoEm)}` : ''}</div>
        )}
        {!ok && sugestao && (
          <div style={{ fontSize: 10.5, color: T.blueText, marginTop: 2 }}>💡 sugestão: {sugestao}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 280 }}>
          Lista os projetos (BRs) criados ou alterados no Sankhya <strong>nesta semana</strong>, pra você confirmar
          manualmente se cada um já tem <strong>proposta criada</strong> e <strong>conhecimento de pedido confirmado</strong>.
          A marcação é sempre manual (é o controle do time) — o portal só mostra uma 💡 sugestão ao lado, quando encontra
          algo na tabela de propostas, pra ajudar na hora de confirmar.
        </div>
        <button onClick={handleAtualizar} disabled={syncing} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: T.terracotta, color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, opacity: syncing ? 0.7 : 1, flexShrink: 0,
        }}>
          <RefreshCw size={15} className={syncing ? 'spin' : ''} />
          {syncing ? 'Atualizando…' : 'Atualizar do Sankhya'}
        </button>
      </div>

      {!podeEditar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: T.amberSoft, border: `1px solid ${T.amber}33` }}>
          <AlertTriangle size={14} color={T.amberText} />
          <span style={{ fontSize: 12.5, color: T.amberText }}>
            Modo somente leitura — só Edson, Felipe e João Victor podem confirmar os itens do checklist.
          </span>
        </div>
      )}

      {syncStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
          background: syncStatus.ok ? T.oliveSoft : T.rustSoft, border: `1px solid ${syncStatus.ok ? T.olive : T.rust}33`,
        }}>
          {syncStatus.ok ? <CheckCircle2 size={14} color={T.oliveText} /> : <AlertTriangle size={14} color={T.rustText} />}
          <span style={{ fontSize: 12.5, color: syncStatus.ok ? T.oliveText : T.rustText }}>{syncStatus.message}</span>
        </div>
      )}

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
        <Kpi label="Projetos nessa semana" value={loading ? '…' : kpis.total} icon={Package} tone="blue"
          sub="criados ou alterados no Sankhya" />
        <Kpi label="Sem proposta" value={loading ? '…' : kpis.semProposta} icon={AlertTriangle} tone="rust"
          sub="ainda não tem proposta cadastrada no portal" />
        <Kpi label="Sem conhecimento de pedido" value={loading ? '…' : kpis.semConhecimento} icon={Clock3} tone="amber"
          sub="proposta existe, mas conhecimento não confirmado" />
        <Kpi label="Checklist completo" value={loading ? '…' : kpis.completos} icon={CheckCircle2} tone="olive"
          sub="proposta + conhecimento de pedido, os dois ok" />
      </div>

      <Panel>
        <FiltroCampoFat label="Buscar BR ou abreviatura">
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: BR14410…"
              style={{ ...selectStyleFat(280), paddingLeft: 28 }} />
          </div>
        </FiltroCampoFat>
      </Panel>

      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <th style={thFat(0)}>BR / Abreviatura</th>
                <th style={thFat(100)}>Alterado em</th>
                <th style={thFat(90)}>Ativo</th>
                <th style={thFat(220)}>Proposta criada</th>
                <th style={thFat(240)}>Conhecimento de pedido</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum projeto encontrado nessa semana. Clique em "Atualizar do Sankhya".</td></tr>
              ) : filtrados.map(p => (
                <tr key={p.codproj} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: p.pendencias > 0 ? T.amberSoft : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = p.pendencias > 0 ? T.amberSoft : 'transparent'}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{p.identificacao}</div>
                    {p.abreviatura && <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>{p.abreviatura}</div>}
                  </td>
                  <td style={{ padding: '10px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtDataHora(p.dhalter)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {p.ativo ? <span style={{ color: T.oliveText, fontWeight: 600, fontSize: 11 }}>Sim</span> : <span style={{ color: T.inkFaint, fontSize: 11 }}>Não</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <ChecklistItem ok={p.propostaCriada} podeEditar={podeEditar}
                      label={p.propostaCriada ? 'Confirmado' : 'Pendente de confirmação'}
                      sugestao={p.sugestaoProposta ? `existe proposta (${p.proposta?.status || 'cadastrada'})` : null}
                      marcadoPor={p.marcadoPorProposta} marcadoEm={p.marcadoEmProposta}
                      onToggle={() => marcarManual(p.codproj, 'proposta_criada', !p.propostaCriada)} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <ChecklistItem ok={p.conhecimentoPedido} podeEditar={podeEditar}
                      label={p.conhecimentoPedido ? 'Confirmado' : 'Pendente de confirmação'}
                      sugestao={p.sugestaoConhecimento ? `sistema indica confirmado ${p.proposta?.data_conhecimento_pedido ? 'em ' + fmtData(p.proposta.data_conhecimento_pedido) : ''}` : null}
                      marcadoPor={p.marcadoPorConhecimento} marcadoEm={p.marcadoEmConhecimento}
                      onToggle={() => marcarManual(p.codproj, 'conhecimento_pedido', !p.conhecimentoPedido)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{filtrados.length} projeto{filtrados.length !== 1 ? 's' : ''} · linhas em âmbar = tem pendência no checklist{ultimoSync && ` · última sincronização: ${new Date(ultimoSync).toLocaleString('pt-BR')}`}</span>
          <BotaoExportar small onClick={() => exportCSV(filtrados, 'verificacao_projetos.csv',
            ['identificacao','abreviatura','dhalter','propostaCriada','conhecimentoPedido'])} />
        </div>
      </div>
    </div>
  );
}

function ReservasPendentes() {
  const [itens, setItens] = useState([]);
  const [faturamentoPorPedido, setFaturamentoPorPedido] = useState({}); // numero_pedido -> { data_faturamento, valor_nota, numero_nota }
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [ultimaSinc, setUltimaSinc] = useState(null);
  const [ordenarPor, setOrdenarPor] = useState('op');
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos' | 'aberto' | 'finalizado' | 'finalizado_faturado' | 'finalizado_nao_faturado'
  const [selecionados, setSelecionados] = useState(new Set());
  const [abrindoLote, setAbrindoLote] = useState(false);
  const [cancelando, setCancelando] = useState(null); // id do item sendo cancelado agora
  const [confirmando, setConfirmando] = useState(null); // item aguardando confirmação no modal
  const [erroCancelamento, setErroCancelamento] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [{ data }, { data: fat }] = await Promise.all([
      supabase.from('reservas_pendentes_sankhya').select('*').order('sincronizado_em', { ascending: false }).limit(3000),
      // Só nota de VENDA (tipmov='V') conta como faturamento de fato — pedido (tipmov='P')
      // também aparece em faturamento_resumo mas não significa NF emitida.
      supabase.from('faturamento_resumo').select('numero_pedido,data_faturamento,valor_nota,numero_nota').eq('tipmov', 'V').not('numero_pedido', 'is', null),
    ]);
    setItens(data || []);
    if (data && data.length) setUltimaSinc(data[0].sincronizado_em);
    const mapa = {};
    (fat || []).forEach(f => {
      const existente = mapa[f.numero_pedido];
      // Se o mesmo pedido tiver mais de uma NF, guarda a mais recente.
      if (!existente || (f.data_faturamento && f.data_faturamento > existente.data_faturamento)) {
        mapa[f.numero_pedido] = f;
      }
    });
    setFaturamentoPorPedido(mapa);
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  // Baixa um Excel de 1 linha com todos os dados do item que acabou de ser
  // cancelado -- comprovante imediato pra anexar em e-mail, ticket, etc.
  const gerarComprovanteCancelamento = async (item, canceladoPor) => {
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Portal Engenharia Kalenborn';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Reserva Cancelada');
    const colunas = [
      { header: 'OP', key: 'op', width: 10 },
      { header: 'BR', key: 'br', width: 14 },
      { header: 'Nro. Pedido', key: 'nro_pedido', width: 14 },
      { header: 'NUNOTA Reserva', key: 'nunota', width: 16 },
      { header: 'Código Produto', key: 'cod_produto', width: 14 },
      { header: 'Descrição', key: 'descr_produto', width: 40 },
      { header: 'Qtd Reservada', key: 'qtd_reservada', width: 14 },
      { header: 'Lote', key: 'lote', width: 14 },
      { header: 'Local', key: 'local', width: 10 },
      { header: 'Status OP', key: 'status_op', width: 12 },
      { header: 'Cancelado em', key: 'cancelado_em', width: 20 },
      { header: 'Cancelado por', key: 'cancelado_por', width: 24 },
    ];
    sheet.columns = colunas;
    sheet.addRow({
      op: item.op ?? '—', br: item.br ?? '—', nro_pedido: item.nro_pedido ?? '—',
      nunota: item.nunota_reserva, cod_produto: item.cod_produto, descr_produto: item.descr_produto ?? '—',
      qtd_reservada: Number(item.qtd_reservada) || 0, lote: item.controle_lote ?? '—', local: item.local_origem ?? '—',
      status_op: item.status_op ?? '—', cancelado_em: new Date().toLocaleString('pt-BR'), cancelado_por: canceladoPor || '—',
    });
    const headerRow = sheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8261C' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
    headerRow.height = 28;
    sheet.getRow(2).eachCell({ includeEmpty: true }, cell => { cell.font = { name: 'Arial', size: 10.5 }; cell.alignment = { vertical: 'middle' }; });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reserva_cancelada_OP${item.op || item.nunota_reserva}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Baixa o histórico completo de tudo que já foi cancelado (tabela de log
  // gravada pela edge function, sucesso ou falha) -- útil pra auditoria/relatório.
  const [baixandoHistorico, setBaixandoHistorico] = useState(false);
  const baixarHistoricoCancelamentos = async () => {
    setBaixandoHistorico(true);
    try {
      const { data: log } = await supabase.from('reservas_canceladas_log').select('*').order('cancelado_em', { ascending: false }).limit(5000);
      const { default: ExcelJS } = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Portal Engenharia Kalenborn';
      workbook.created = new Date();
      const sheet = workbook.addWorksheet('Histórico Cancelamentos', { views: [{ state: 'frozen', ySplit: 1 }] });
      sheet.columns = [
        { header: 'Data/Hora', key: 'cancelado_em', width: 20 },
        { header: 'OP', key: 'op', width: 10 },
        { header: 'BR', key: 'br', width: 14 },
        { header: 'Nro. Pedido', key: 'nro_pedido', width: 14 },
        { header: 'NUNOTA Reserva', key: 'nunota_reserva', width: 16 },
        { header: 'Código Produto', key: 'cod_produto', width: 14 },
        { header: 'Descrição', key: 'descr_produto', width: 40 },
        { header: 'Qtd Reservada', key: 'qtd_reservada', width: 14 },
        { header: 'Lote', key: 'controle_lote', width: 14 },
        { header: 'Local', key: 'local_origem', width: 10 },
        { header: 'Status OP', key: 'status_op', width: 12 },
        { header: 'Resultado', key: 'sankhya_status', width: 12 },
        { header: 'Mensagem', key: 'sankhya_mensagem', width: 30 },
        { header: 'Cancelado por', key: 'cancelado_por', width: 24 },
      ];
      (log || []).forEach(l => sheet.addRow({ ...l, cancelado_em: l.cancelado_em ? new Date(l.cancelado_em).toLocaleString('pt-BR') : '—' }));
      const headerRow = sheet.getRow(1);
      headerRow.eachCell(cell => {
        cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8261C' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
      headerRow.height = 30;
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const l = (log || [])[rowNumber - 2];
        row.eachCell({ includeEmpty: true }, cell => {
          cell.font = { name: 'Arial', size: 10.5 };
          cell.alignment = { vertical: 'middle' };
          if (l?.sankhya_status === 'falha') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4E4' } };
          else if (rowNumber % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F4F0' } };
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `historico_cancelamentos_reservas_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBaixandoHistorico(false);
    }
  };

  // Chama a edge function que loga no Sankhya com o usuário de serviço,
  // executa o CACSP.excluirNotas na reserva e — se der certo — já tira a
  // linha da tela local, sem esperar a próxima sincronização (4h).
  const confirmarCancelamento = async (item) => {
    setConfirmando(null);
    setCancelando(item.id);
    setErroCancelamento(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const canceladoPor = user?.email || null;
      const { data, error } = await supabase.functions.invoke('sankhya-cancelar-reserva', {
        body: {
          nunota: item.nunota_reserva, cod_produto: item.cod_produto, descr_produto: item.descr_produto,
          op: item.op, br: item.br, nro_pedido: item.nro_pedido, qtd_reservada: item.qtd_reservada,
          controle_lote: item.controle_lote, local_origem: item.local_origem, status_op: item.status_op,
          cancelado_por: canceladoPor,
        },
      });
      if (error || !data?.ok) {
        throw new Error(data?.error || error?.message || 'Falha desconhecida ao cancelar');
      }
      setItens(prev => prev.filter(i => i.id !== item.id));
      setSelecionados(prev => { const n = new Set(prev); n.delete(item.id); return n; });
      await gerarComprovanteCancelamento(item, canceladoPor);
    } catch (e) {
      setErroCancelamento({ id: item.id, msg: String(e.message || e) });
    } finally {
      setCancelando(null);
    }
  };

  const faturado = (item) => item.nro_pedido ? faturamentoPorPedido[item.nro_pedido] : null;

  const filtrados = itens.filter(i => {
    if (filtroStatus === 'aberto' && i.status_op !== 'Aberto') return false;
    if (filtroStatus === 'finalizado' && i.status_op !== 'Finalizado') return false;
    if (filtroStatus === 'finalizado_faturado' && (i.status_op !== 'Finalizado' || !faturado(i))) return false;
    if (filtroStatus === 'finalizado_nao_faturado' && (i.status_op !== 'Finalizado' || faturado(i))) return false;
    if (!busca.trim()) return true;
    const b = busca.toLowerCase();
    return String(i.op || '').includes(b) || (i.descr_produto || '').toLowerCase().includes(b) || (i.br || '').toLowerCase().includes(b);
  }).sort((a, b) => {
    let va, vb;
    if (ordenarPor === 'op') { va = Number(a.op) || 0; vb = Number(b.op) || 0; }
    else { va = a.br || ''; vb = b.br || ''; }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return ordemAsc ? cmp : -cmp;
  });

  const contagens = {
    todos: itens.length,
    aberto: itens.filter(i => i.status_op === 'Aberto').length,
    finalizado: itens.filter(i => i.status_op === 'Finalizado').length,
    finalizadoFaturado: itens.filter(i => i.status_op === 'Finalizado' && faturado(i)).length,
    finalizadoNaoFaturado: itens.filter(i => i.status_op === 'Finalizado' && !faturado(i)).length,
  };

  const alternarOrdem = (campo) => {
    if (ordenarPor === campo) setOrdemAsc(prev => !prev);
    else { setOrdenarPor(campo); setOrdemAsc(true); }
  };

  const alternarSelecao = (id) => {
    setSelecionados(prev => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id); else novo.add(id);
      return novo;
    });
  };
  const selecionarTodosVisiveis = () => {
    const idsVisiveis = filtrados.slice(0, 300).map(i => i.id);
    const todosJaSelecionados = idsVisiveis.every(id => selecionados.has(id));
    setSelecionados(todosJaSelecionados ? new Set() : new Set(idsVisiveis));
  };

  // Abre um link por vez, com uma pequena pausa entre cada — navegadores
  // bloqueiam abertura de várias abas de uma vez sem isso
  const abrirSelecionadosEmLote = async () => {
    const itensSelecionados = filtrados.filter(i => selecionados.has(i.id) && i.codtipoper);
    if (!itensSelecionados.length) return;
    setAbrindoLote(true);
    for (const i of itensSelecionados) {
      const link = linkSankhyaNota({ nunota: i.nunota_reserva, tipmov: 'J', codtipoper: i.codtipoper });
      if (link) window.open(link, '_blank');
      await new Promise(r => setTimeout(r, 400));
    }
    setAbrindoLote(false);
  };

  const fmtNum = (n) => n == null ? '—' : Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  const fmtData = (d) => !d ? '—' : new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1200 }}>
      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Sinalização antecipada — itens com <strong>reserva pendente</strong> no Sankhya (ainda não entregues), pra você saber que estão comprometidos ANTES de tentar usar ou transferir. Marca os que quer resolver e abre todos de uma vez — o clique de liberar a reserva continua sendo feito por você, lá no Sankhya. Sincroniza sozinho a cada 4h.
        {ultimaSinc && <span style={{ marginLeft: 8, color: T.inkFaint }}>· Última sincronização: {new Date(ultimaSinc).toLocaleString('pt-BR')}</span>}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'todos', label: `Todas (${contagens.todos})`, cor: T.inkDim },
            { id: 'aberto', label: `Aberta (${contagens.aberto})`, cor: T.amberText },
            { id: 'finalizado', label: `Finalizada (${contagens.finalizado})`, cor: T.rustText },
            { id: 'finalizado_nao_faturado', label: `⚠ Finalizada, não faturada (${contagens.finalizadoNaoFaturado})`, cor: T.rustText },
            { id: 'finalizado_faturado', label: `✓ Finalizada e faturada (${contagens.finalizadoFaturado})`, cor: T.oliveText },
          ].map(f => (
            <button key={f.id} onClick={() => setFiltroStatus(f.id)}
              style={{
                fontSize: 12, fontWeight: 700, padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
                border: `1.5px solid ${filtroStatus === f.id ? f.cor : T.line}`,
                background: filtroStatus === f.id ? f.cor : 'transparent',
                color: filtroStatus === f.id ? '#fff' : T.inkDim,
              }}>
              {f.label}
            </button>
          ))}
        </div>
        {selecionados.size > 0 && (
          <button onClick={abrirSelecionadosEmLote} disabled={abrindoLote}
            style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', opacity: abrindoLote ? 0.6 : 1 }}>
            {abrindoLote ? 'Abrindo…' : `↗ Abrir ${selecionados.size} selecionado(s) no Sankhya`}
          </button>
        )}
        <button onClick={baixarHistoricoCancelamentos} disabled={baixandoHistorico}
          style={{ fontSize: 12, fontWeight: 600, color: T.inkDim, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 6, padding: '7px 12px', cursor: 'pointer', opacity: baixandoHistorico ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Download size={12} /> {baixandoHistorico ? 'Gerando…' : 'Histórico de cancelamentos'}
        </button>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar OP, produto ou BR…" style={{ ...inputStyle(), width: 220, paddingLeft: 28 }} />
        </div>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <th style={{ ...thFat(36), textAlign: 'center' }}>
                  <input type="checkbox" onChange={selecionarTodosVisiveis}
                    checked={filtrados.slice(0, 300).length > 0 && filtrados.slice(0, 300).every(i => selecionados.has(i.id))} />
                </th>
                <th style={{ ...thFat(70), cursor: 'pointer', userSelect: 'none' }} onClick={() => alternarOrdem('op')}>
                  OP {ordenarPor === 'op' && (ordemAsc ? '▲' : '▼')}
                </th>
                <th style={{ ...thFat(90), cursor: 'pointer', userSelect: 'none' }} onClick={() => alternarOrdem('br')}>
                  BR {ordenarPor === 'br' && (ordemAsc ? '▲' : '▼')}
                </th>
                <th style={thFat(70)}>Código</th>
                <th style={thFat(220)}>Produto</th>
                <th style={{ ...thFat(90), textAlign: 'right' }}>Reservada</th>
                <th style={thFat(90)}>Lote</th>
                <th style={thFat(80)}>Local</th>
                <th style={thFat(90)}>Status OP</th>
                <th style={thFat(100)}>Faturado</th>
                <th style={thFat(100)}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={11} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nada aqui — nenhuma reserva pendente!</td></tr>
              ) : filtrados.slice(0, 300).map(i => {
                const nf = faturado(i);
                return (
                <tr key={i.id} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: selecionados.has(i.id) ? `${T.terracotta}0d` : 'transparent' }}>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                    <input type="checkbox" checked={selecionados.has(i.id)} onChange={() => alternarSelecao(i.id)} />
                  </td>
                  <td style={{ padding: '7px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{i.op || '—'}</td>
                  <td style={{ padding: '7px 12px', color: T.blueText, fontWeight: 600 }}>{i.br || '—'}</td>
                  <td style={{ padding: '7px 12px', color: T.inkFaint, fontFamily: 'monospace', fontSize: 11.5 }}>{i.cod_produto}</td>
                  <td style={{ padding: '7px 12px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={i.descr_produto}>{i.descr_produto}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: T.amberText }}>{fmtNum(i.qtd_reservada)}</td>
                  <td style={{ padding: '7px 12px', color: T.inkFaint }}>{i.controle_lote || '—'}</td>
                  <td style={{ padding: '7px 12px', color: T.inkFaint }}>{i.local_origem || '—'}</td>
                  <td style={{ padding: '7px 12px' }}>
                    {i.status_op && (
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                        color: i.status_op === 'Finalizado' ? T.oliveText : T.amberText,
                        background: i.status_op === 'Finalizado' ? T.oliveSoft : T.amberSoft,
                      }}>{i.status_op}</span>
                    )}
                  </td>
                  <td style={{ padding: '7px 12px' }}>
                    {!i.nro_pedido ? (
                      <span style={{ fontSize: 10.5, color: T.inkFaint }}>sem pedido</span>
                    ) : nf ? (
                      <span title={`NF ${nf.numero_nota || '—'} · ${fmtData(nf.data_faturamento)}`} style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                        color: T.oliveText, background: T.oliveSoft,
                      }}>✓ Faturado</span>
                    ) : (
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                        color: T.rustText, background: T.rustSoft,
                      }}>Pendente</span>
                    )}
                  </td>
                  <td style={{ padding: '7px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BotaoAbrirSankhya nunota={i.nunota_reserva} tipmov="J" codtipoper={i.codtipoper} />
                      <button
                        onClick={() => setConfirmando(i)}
                        disabled={cancelando === i.id}
                        title="Cancelar reserva no Sankhya"
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 24, height: 24, border: `1px solid ${T.line}`, borderRadius: 5,
                          background: 'transparent', color: T.rustText, cursor: cancelando === i.id ? 'default' : 'pointer',
                          opacity: cancelando === i.id ? 0.5 : 1,
                        }}>
                        {cancelando === i.id ? '…' : <Trash2 size={12} />}
                      </button>
                    </div>
                    {erroCancelamento?.id === i.id && (
                      <div style={{ fontSize: 10.5, color: T.rustText, marginTop: 4, maxWidth: 220 }}>{erroCancelamento.msg}</div>
                    )}
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
        {filtrados.length > 300 && (
          <div style={{ padding: '10px 16px', fontSize: 11.5, color: T.inkFaint, borderTop: `1px solid ${T.line}` }}>
            Mostrando as primeiras 300 de {filtrados.length} — refina a busca pra ver mais específico.
          </div>
        )}
      </div>

      {confirmando && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => setConfirmando(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: 22,
            maxWidth: 380, width: '100%', boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Trash2 size={16} color={T.rustText} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>Cancelar reserva no Sankhya</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.inkDim, lineHeight: 1.5, marginBottom: 16 }}>
              Isso vai <strong>excluir a nota de reserva {confirmando.nunota_reserva}</strong> direto no Sankhya
              (OP {confirmando.op || '—'}, produto {confirmando.descr_produto}). Ação irreversível — não tem como desfazer por aqui.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmando(null)} style={{
                fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${T.line}`, background: 'transparent', color: T.inkDim,
              }}>Cancelar</button>
              <button onClick={() => confirmarCancelamento(confirmando)} style={{
                fontSize: 12.5, fontWeight: 700, padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
                border: 'none', background: T.rustText, color: '#fff',
              }}>Sim, cancelar no Sankhya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfApontamento() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('divergente_finalizado'); // 'todos' | 'divergente' | 'divergente_finalizado' | 'ok'
  const [busca, setBusca] = useState('');
  const [ultimaSinc, setUltimaSinc] = useState(null);
  const [opAberta, setOpAberta] = useState(null); // número da OP selecionada pro modal de detalhe
  const [ordenarPor, setOrdenarPor] = useState('op'); // 'op' | 'br'
  const [ordemAsc, setOrdemAsc] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('conferencia_apontamento').select('*').order('sincronizado_em', { ascending: false }).limit(3000);
    setItens(data || []);
    if (data && data.length) setUltimaSinc(data[0].sincronizado_em);
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = itens.filter(i => {
    if (filtroStatus === 'divergente' && i.diferenca == 0) return false;
    if (filtroStatus === 'divergente_finalizado' && (i.diferenca == 0 || i.status_op !== 'Finalizado')) return false;
    if (filtroStatus === 'ok' && i.diferenca != 0) return false;
    if (busca.trim()) {
      const b = busca.toLowerCase();
      if (!String(i.op).includes(b) && !(i.produto_descricao || '').toLowerCase().includes(b) && !(i.br || '').toLowerCase().includes(b)) return false;
    }
    return true;
  }).sort((a, b) => {
    let va, vb;
    if (ordenarPor === 'op') { va = Number(a.op) || 0; vb = Number(b.op) || 0; }
    else { va = a.br || ''; vb = b.br || ''; }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return ordemAsc ? cmp : -cmp;
  });

  const alternarOrdem = (campo) => {
    if (ordenarPor === campo) setOrdemAsc(prev => !prev);
    else { setOrdenarPor(campo); setOrdemAsc(true); }
  };

  const contagens = {
    total: itens.length,
    divergente: itens.filter(i => i.diferenca != 0).length,
    divergenteFinalizado: itens.filter(i => i.diferenca != 0 && i.status_op === 'Finalizado').length,
    ok: itens.filter(i => i.diferenca == 0).length,
  };

  const fmtNum = (n) => n == null ? '—' : Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  const fmtData = (d) => !d ? '—' : new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1200 }}>
      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Compara, por OP e <strong>item de matéria-prima</strong>, a quantidade que era <strong>esperada pela composição oficial</strong> (fórmula cadastrada × quantidade produzida) com a quantidade que foi <strong>realmente apontada</strong> na produção — não conta o produto acabado. Sincroniza sozinho a cada 4h.
        {ultimaSinc && <span style={{ marginLeft: 8, color: T.inkFaint }}>· Última sincronização: {new Date(ultimaSinc).toLocaleString('pt-BR')}</span>}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'divergente_finalizado', label: `⚠ Finalizadas com divergência (${contagens.divergenteFinalizado})`, cor: T.rustText },
            { id: 'divergente', label: `Todas divergentes (${contagens.divergente})`, cor: T.amberText },
            { id: 'ok', label: `✓ Batendo (${contagens.ok})`, cor: T.oliveText },
            { id: 'todos', label: `Todas (${contagens.total})`, cor: T.inkDim },
          ].map(f => (
            <button key={f.id} onClick={() => setFiltroStatus(f.id)}
              style={{
                fontSize: 12, fontWeight: 700, padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
                border: `1.5px solid ${filtroStatus === f.id ? f.cor : T.line}`,
                background: filtroStatus === f.id ? f.cor : 'transparent',
                color: filtroStatus === f.id ? '#fff' : T.inkDim,
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar OP, produto ou BR…" style={{ ...inputStyle(), width: 220, paddingLeft: 28 }} />
        </div>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <th style={{ ...thFat(70), cursor: 'pointer', userSelect: 'none' }} onClick={() => alternarOrdem('op')}>
                  OP {ordenarPor === 'op' && (ordemAsc ? '▲' : '▼')}
                </th>
                <th style={{ ...thFat(90), cursor: 'pointer', userSelect: 'none' }} onClick={() => alternarOrdem('br')}>
                  BR {ordenarPor === 'br' && (ordemAsc ? '▲' : '▼')}
                </th>
                <th style={thFat(70)}>Código</th>
                <th style={thFat(220)}>Produto</th>
                <th style={{ ...thFat(90), textAlign: 'right' }}>Esperado</th>
                <th style={{ ...thFat(90), textAlign: 'right' }}>Apontado</th>
                <th style={{ ...thFat(90), textAlign: 'right' }}>Diferença</th>
                <th style={thFat(90)}>Status OP</th>
                <th style={thFat(90)}>Apontado em</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nada aqui — bom sinal!</td></tr>
              ) : filtrados.slice(0, 300).map(i => (
                <tr key={i.id} onClick={() => setOpAberta(i.op)} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: (i.diferenca != 0 && i.status_op === 'Finalizado') ? `${T.rustSoft}55` : 'transparent', cursor: 'pointer' }}>
                  <td style={{ padding: '7px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.terracotta, textDecoration: 'underline' }}>{i.op}</td>
                  <td style={{ padding: '7px 12px', color: T.blueText, fontWeight: 600 }}>{i.br || '—'}</td>
                  <td style={{ padding: '7px 12px', color: T.inkFaint, fontFamily: 'monospace', fontSize: 11.5 }}>{i.codprod}</td>
                  <td style={{ padding: '7px 12px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={i.produto_descricao}>{i.produto_descricao}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmtNum(i.quantidade_planejada)}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmtNum(i.quantidade_apontada)}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: i.diferenca == 0 ? T.oliveText : (i.diferenca < 0 ? T.rustText : T.amberText) }}>
                    {i.diferenca == 0 ? '✓' : (i.diferenca > 0 ? '+' : '') + fmtNum(i.diferenca)}
                  </td>
                  <td style={{ padding: '7px 12px' }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      color: i.status_op === 'Finalizado' ? T.oliveText : T.amberText,
                      background: i.status_op === 'Finalizado' ? T.oliveSoft : T.amberSoft,
                    }}>{i.status_op}</span>
                  </td>
                  <td style={{ padding: '7px 12px', color: T.inkFaint }}>{fmtData(i.data_apontamento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length > 300 && (
          <div style={{ padding: '10px 16px', fontSize: 11.5, color: T.inkFaint, borderTop: `1px solid ${T.line}` }}>
            Mostrando as primeiras 300 de {filtrados.length} — refina a busca pra ver mais específico.
          </div>
        )}
      </div>

      {opAberta && (
        <ModalDetalheOP op={opAberta} itens={itens.filter(i => i.op === opAberta)} onFechar={() => setOpAberta(null)}
          fmtNum={fmtNum} fmtData={fmtData} />
      )}
    </div>
  );
}

function ModalDetalheOP({ op, itens, onFechar, fmtNum, fmtData }) {
  const primeiro = itens[0];
  return (
    <Overlay onClose={onFechar}>
      <div className="scale-in" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 720, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,.18)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, margin: 0 }}>OP {op}</h3>
            <div style={{ fontSize: 12.5, color: T.inkFaint, marginTop: 2 }}>
              {primeiro?.br && <span style={{ color: T.blueText, fontWeight: 600 }}>{primeiro.br}</span>}
              {primeiro?.status_op && <span style={{ marginLeft: 8 }}>· {primeiro.status_op}</span>}
              {primeiro?.data_apontamento && <span style={{ marginLeft: 8 }}>· apontado em {fmtData(primeiro.data_apontamento)}</span>}
            </div>
          </div>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint, fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 14 }}>
          <thead>
            <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
              <th style={thFat(70)}>Código</th>
              <th style={thFat(240)}>Produto</th>
              <th style={{ ...thFat(90), textAlign: 'right' }}>Esperado</th>
              <th style={{ ...thFat(90), textAlign: 'right' }}>Apontado</th>
              <th style={{ ...thFat(90), textAlign: 'right' }}>Diferença</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.id} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: i.diferenca != 0 ? `${T.rustSoft}33` : 'transparent' }}>
                <td style={{ padding: '8px 12px', color: T.inkFaint, fontFamily: 'monospace', fontSize: 11.5 }}>{i.codprod}</td>
                <td style={{ padding: '8px 12px' }}>{i.produto_descricao}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmtNum(i.quantidade_planejada)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmtNum(i.quantidade_apontada)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: i.diferenca == 0 ? T.oliveText : (i.diferenca < 0 ? T.rustText : T.amberText) }}>
                  {i.diferenca == 0 ? '✓' : (i.diferenca > 0 ? '+' : '') + fmtNum(i.diferenca)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Overlay>
  );
}

function PlaquinhaEquipamento({ currentUser }) {
  const [aba, setAba] = useState('pendentes'); // 'pendentes' | 'preenchidas'
  const [origemAba, setOrigemAba] = useState('compras'); // 'compras' | 'automacao'
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edicoes, setEdicoes] = useState({}); // id -> { campo: valor }
  const [salvandoId, setSalvandoId] = useState(null);
  const [busca, setBusca] = useState('');
  const [mostrarCriarManual, setMostrarCriarManual] = useState(false);
  const [modalEmail, setModalEmail] = useState(null); // { grupos: [...], modo: 'concluir'|'enviar'|'massa' }

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('plaquinhas_equipamento').select('*').order('created_at', { ascending: false });
    setItens(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const origemPorBr = useMemo(() => {
    const mapa = new Map();
    itens.forEach(item => {
      const chave = item.br || `sem-br-${item.id}`;
      const ehCompras = item.origem_deteccao === 'fabricado_kalenborn' || item.origem_deteccao === 'recebido_cliente';
      if (ehCompras) mapa.set(chave, 'compras');
      else if (!mapa.has(chave)) mapa.set(chave, 'automacao');
    });
    return mapa;
  }, [itens]);

  const pendentes = itens.filter(i => i.status === 'pendente');
  const preenchidas = itens.filter(i => i.status === 'preenchida');
  const listaAtual = (aba === 'pendentes' ? pendentes : preenchidas).filter(i => {
    const chave = i.br || `sem-br-${i.id}`;
    if (origemPorBr.get(chave) !== origemAba) return false;
    return !busca.trim() || (i.br || '').toLowerCase().includes(busca.toLowerCase()) || (i.cliente_nome || '').toLowerCase().includes(busca.toLowerCase());
  });

  const grupos = useMemo(() => {
    const mapa = new Map();
    listaAtual.forEach(item => {
      const chave = item.br || `sem-br-${item.id}`;
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(item);
    });
    return [...mapa.entries()].map(([chave, items]) => ({ chave, items }));
  }, [listaAtual]);

  // Grupos preenchidos que ainda não tiveram e-mail disparado (pro botão de disparo em massa)
  const gruposSemEmail = useMemo(() => {
    const mapa = new Map();
    itens.filter(i => i.status === 'preenchida' && !i.email_enviado).forEach(item => {
      const chave = item.br || `sem-br-${item.id}`;
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(item);
    });
    return [...mapa.entries()].map(([chave, items]) => ({ chave, items }));
  }, [itens]);

  const MESES_PT = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
  const fmtMesAno = (d) => {
    if (!d) return '—';
    const data = new Date(d + 'T12:00:00');
    return `${MESES_PT[data.getMonth()]}/${data.getFullYear()}`;
  };

  const campo = (item, nome) => edicoes[item.id]?.[nome] ?? item[nome] ?? '';
  const setCampo = (itemId, nome, valor) => setEdicoes(prev => ({ ...prev, [itemId]: { ...prev[itemId], [nome]: valor } }));

  // Monta o texto padrão (assunto + corpo) pra um grupo de itens de um mesmo BR
  const montarTemplateGrupo = (items) => {
    const primeiro = items[0];
    const blocos = items.map(it => (
      `N. Ordem de serviço: ${it.numero_ordem_servico || '—'}\n` +
      `N. Desenho: ${it.numero_desenho || '—'}\n` +
      `Mês/ano: ${fmtMesAno(it.mes_ano)}\n` +
      `N. Pedido de compra: ${it.numero_pedido_compra || '—'}\n` +
      `N. Projeto: ${it.br || '—'}\n` +
      `Cliente: ${it.cliente_nome || '—'}`
    )).join('\n\n—\n\n');
    const linkDownload = `https://sieztnpchjjmrwrmrhoa.supabase.co/functions/v1/gerar-plaquinha-docx?${primeiro.br ? `br=${encodeURIComponent(primeiro.br)}` : `id=${primeiro.id}`}`;
    const assinatura = currentUser?.assinatura_email || currentUser?.nome || '';
    const assunto = `Plaquinha de Equipamento — ${primeiro.br || primeiro.numero_desenho}`;
    const corpo = `PLAQUINHA DE EQUIPAMENTO\n\n${blocos}\n\nBaixar o arquivo Word: ${linkDownload}\n\n${assinatura}`;
    return { assunto, corpo };
  };

  // Converte o texto normal (o que ela vê e edita) pro HTML que vai de verdade no e-mail —
  // ela nunca precisa ver tag nenhuma, só texto legível.
  const textoParaHtmlEmail = (texto) => {
    const escapado = texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const comLinks = escapado.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
    return comLinks.replace(/\n/g, '<br>');
  };

  const validarGrupo = (items) => {
    for (const it of items) {
      if (!campo(it, 'numero_desenho')) return `Falta o N. Desenho em um dos itens de ${it.br || 'sem BR'}.`;
      if (!campo(it, 'mes_ano')) return `Falta o Mês/Ano em um dos itens de ${it.br || 'sem BR'}.`;
    }
    return null;
  };

  const concluirGrupo = (items) => {
    const erro = validarGrupo(items);
    if (erro) { alert(erro); return; }
    setModalEmail({ grupos: [{ items }], modo: 'concluir' });
  };

  const enviarEmailGrupo = (items) => {
    setModalEmail({ grupos: [{ items }], modo: 'enviar' });
  };

  const dispararTodos = () => {
    if (gruposSemEmail.length === 0) return;
    setModalEmail({ grupos: gruposSemEmail, modo: 'massa' });
  };

  const confirmarEnvio = async ({ grupos: gruposModal, modo, destinatarios, assunto, corpo }) => {
    setSalvandoId('modal');
    for (const { items } of gruposModal) {
      // Se veio de "concluir", salva os dados finais de cada item do grupo primeiro
      if (modo === 'concluir') {
        for (const it of items) {
          await supabase.from('plaquinhas_equipamento').update({
            br: campo(it, 'br') || null,
            cliente_nome: campo(it, 'cliente_nome') || null,
            numero_pedido_compra: campo(it, 'numero_pedido_compra') || null,
            numero_desenho: campo(it, 'numero_desenho'),
            numero_ordem_servico: campo(it, 'numero_ordem_servico') || null,
            mes_ano: campo(it, 'mes_ano'),
            status: 'preenchida',
            preenchido_por: currentUser?.nome || null,
            preenchido_em: new Date().toISOString(),
          }).eq('id', it.id);
        }
      }
      if (destinatarios.length > 0) {
        const { assunto: assuntoDoGrupo, corpo: corpoDoGrupo } = (gruposModal.length > 1) ? montarTemplateGrupo(items) : { assunto, corpo };
        await supabase.from('solicitacoes_email_plaquinha').insert({
          plaquinha_ids: items.map(i => i.id),
          destinatarios,
          assunto: assuntoDoGrupo,
          corpo: textoParaHtmlEmail(corpoDoGrupo),
          status: 'pendente',
        });
        await supabase.from('plaquinhas_equipamento').update({ email_enviado: true }).in('id', items.map(i => i.id));
      }
    }
    setModalEmail(null);
    await carregar();
    setSalvandoId(null);
  };

  const refazerGrupo = async (items) => {
    if (!confirm(`Reabrir ${items.length > 1 ? 'os ' + items.length + ' itens' : 'esse item'} pra edição?`)) return;
    await supabase.from('plaquinhas_equipamento').update({ status: 'pendente', preenchido_por: null, preenchido_em: null }).in('id', items.map(i => i.id));
    await carregar();
  };

  const salvarSemFinalizar = async (item) => {
    setSalvandoId(item.id);
    await supabase.from('plaquinhas_equipamento').update({
      br: campo(item, 'br') || null,
      cliente_nome: campo(item, 'cliente_nome') || null,
      numero_pedido_compra: campo(item, 'numero_pedido_compra') || null,
      numero_desenho: campo(item, 'numero_desenho') || null,
      numero_ordem_servico: campo(item, 'numero_ordem_servico') || null,
      mes_ano: campo(item, 'mes_ano') || null,
    }).eq('id', item.id);
    await carregar();
    setSalvandoId(null);
  };

  const adicionarItem = async (item) => {
    const { error } = await supabase.from('plaquinhas_equipamento').insert({
      br: item.br, cliente_nome: item.cliente_nome, numero_pedido_compra: item.numero_pedido_compra,
      mes_ano: item.mes_ano, data_prevista_entrega: item.data_prevista_entrega,
      origem_deteccao: 'manual', status: 'pendente',
    });
    if (error) { alert(`Erro ao adicionar item: ${error.message}`); return; }
    setAba('pendentes');
    await carregar();
  };

  const excluir = async (item) => {
    if (!confirm(`Excluir esse item${item.numero_desenho ? ` (${item.numero_desenho})` : ''}? Essa ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from('plaquinhas_equipamento').delete().eq('id', item.id);
    if (error) { alert(`Erro ao excluir: ${error.message}`); return; }
    await carregar();
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
      {(pendentes.length > 0 || gruposSemEmail.length > 0) && (
        <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}55`, borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color={T.amberText} />
            <strong style={{ fontSize: 13, color: T.amberText }}>Tem coisa pendente aqui</strong>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5 }}>
            {pendentes.length > 0 && (
              <button onClick={() => setAba('pendentes')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: T.amberText, textDecoration: 'underline', fontSize: 12.5 }}>
                {pendentes.length} plaquinha(s) ainda por preencher
              </button>
            )}
            {gruposSemEmail.length > 0 && (
              <button onClick={() => { setAba('preenchidas'); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: T.amberText, textDecoration: 'underline', fontSize: 12.5 }}>
                {gruposSemEmail.length} projeto(s) concluído(s) mas <strong>sem e-mail enviado</strong>
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Todos os campos são editáveis — corrige se algo vier errado. Itens do mesmo BR ficam sempre agrupados juntos e o Word/e-mail saem juntos também.
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${T.line}` }}>
        {[
          { id: 'compras', label: `📋 Portal de Compras (regra Sankhya)` },
          { id: 'automacao', label: `🤖 Automação / Comercial` },
        ].map(o => (
          <button key={o.id} onClick={() => setOrigemAba(o.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, fontWeight: 600,
              color: origemAba === o.id ? T.terracotta : T.inkFaint,
              borderBottom: `2px solid ${origemAba === o.id ? T.terracotta : 'transparent'}`, marginBottom: -1,
            }}>
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ id: 'pendentes', label: `Pendentes (${pendentes.length})` }, { id: 'preenchidas', label: `Preenchidas (${preenchidas.length})` }].map(a => (
              <button key={a.id} onClick={() => setAba(a.id)}
                style={{
                  fontSize: 12.5, fontWeight: 700, padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
                  border: `1.5px solid ${aba === a.id ? T.terracotta : T.line}`,
                  background: aba === a.id ? T.terracotta : 'transparent',
                  color: aba === a.id ? '#fff' : T.inkDim,
                }}>
                {a.label}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar BR ou cliente…" style={{ ...inputStyle(), width: 220, paddingLeft: 28 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {aba === 'preenchidas' && gruposSemEmail.length > 0 && (
            <button onClick={dispararTodos}
              style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>
              🚀 Disparar e-mails pendentes ({gruposSemEmail.length})
            </button>
          )}
          <button onClick={() => setMostrarCriarManual(true)}
            style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', background: T.blueText, border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>
            + Criar Nova Manualmente
          </button>
        </div>
      </div>

      {mostrarCriarManual && <CriarPlaquinhaManual onFechar={() => setMostrarCriarManual(false)} onCriado={carregar} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint }}>Carregando…</div>
        ) : grupos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.inkFaint, fontSize: 13 }}>Nada por aqui.</div>
        ) : grupos.map(({ chave, items }) => {
          const primeiro = items[0];
          const todosPendentes = items.every(i => i.status === 'pendente');
          const todosPreenchidos = items.every(i => i.status === 'preenchida');
          return (
            <div key={chave} style={{ background: T.panel, border: `1.5px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: T.panelAlt, borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: T.blueText }}>{primeiro.br || 'Sem BR'}</span>
                  {primeiro.cliente_nome && <span style={{ fontSize: 12, color: T.inkDim }}> — {primeiro.cliente_nome}</span>}
                  {items.length > 1 && <span style={{ fontSize: 10.5, fontWeight: 700, color: T.terracotta, marginLeft: 8, background: `${T.terracotta}18`, padding: '2px 7px', borderRadius: 4 }}>{items.length} itens</span>}
                </div>
                {items.length > 1 && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {todosPendentes && (
                      <button onClick={() => concluirGrupo(items)}
                        style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer' }}>
                        ✓ Concluir os {items.length} itens
                      </button>
                    )}
                    {todosPreenchidos && (
                      <button onClick={() => refazerGrupo(items)}
                        style={{ fontSize: 11.5, fontWeight: 600, color: T.amberText, background: 'transparent', border: `1px solid ${T.amber}66`, borderRadius: 5, padding: '5px 10px', cursor: 'pointer' }}>
                        ↺ Refazer todos
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item, idx) => (
                  <div key={item.id} style={{ borderTop: idx > 0 ? `1px dashed ${T.lineSoft}` : 'none' }}>
                    <div style={{ padding: '8px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                        color: item.origem_deteccao === 'recebido_cliente' ? T.blueText : item.origem_deteccao === 'requisitado_comercial' ? T.terracotta : item.origem_deteccao === 'manual' ? T.inkDim : T.oliveText,
                        background: item.origem_deteccao === 'recebido_cliente' ? T.blueSoft : item.origem_deteccao === 'requisitado_comercial' ? `${T.terracotta}22` : item.origem_deteccao === 'manual' ? T.lineSoft : T.oliveSoft,
                      }}>
                        {item.origem_deteccao === 'recebido_cliente' ? '📥 Recebido do cliente' : item.origem_deteccao === 'requisitado_comercial' ? '📨 Requisitado pelo comercial' : item.origem_deteccao === 'manual' ? '✋ Item adicional' : '🏭 Fabricado pela Kalenborn'}
                      </span>
                      {item.status === 'pendente' && (
                        <button onClick={() => excluir(item)} title="Excluir esse item"
                          style={{ fontSize: 11, fontWeight: 700, color: T.rustText, background: 'transparent', border: `1px solid ${T.rust}55`, borderRadius: 5, padding: '3px 9px', cursor: 'pointer' }}>
                          🗑 Excluir
                        </button>
                      )}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <tbody>
                        {[
                          ['N. Ordem de serviço', 'numero_ordem_servico', 'text', 'Preenche manualmente…'],
                          ['N. Desenho', 'numero_desenho', 'text', 'Preenche manualmente… *obrigatório'],
                          ['Mês/ano', 'mes_ano', 'month', null],
                          ['N. Pedido de compra', 'numero_pedido_compra', 'text', null],
                          ['N. Projeto (BR)', 'br', 'text', null],
                          ['Cliente', 'cliente_nome', 'text', null],
                        ].map(([label, nome, tipo, placeholder]) => (
                          <tr key={nome} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                            <td style={{ padding: '7px 16px', fontWeight: 700, color: T.inkDim, width: 180, background: `${T.panelAlt}88` }}>{label}</td>
                            <td style={{ padding: '7px 16px' }}>
                              {item.status === 'preenchida' ? (
                                nome === 'mes_ano' ? (item[nome] ? fmtMesAno(item[nome]) : '—') : (item[nome] || '—')
                              ) : nome === 'mes_ano' ? (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <select value={campo(item, nome) ? new Date(campo(item, nome) + 'T12:00:00').getMonth() : ''}
                                    onChange={e => {
                                      const anoAtual = campo(item, nome) ? new Date(campo(item, nome) + 'T12:00:00').getFullYear() : new Date().getFullYear();
                                      const mes = String(Number(e.target.value) + 1).padStart(2, '0');
                                      setCampo(item.id, nome, `${anoAtual}-${mes}-01`);
                                    }}
                                    style={{ ...inputStyle(), border: 'none', padding: '2px 4px', background: 'transparent', flex: 1 }}>
                                    <option value="">Mês…</option>
                                    {MESES_PT.map((m, i) => <option key={m} value={i}>{m}</option>)}
                                  </select>
                                  <input type="number" placeholder="Ano" value={campo(item, nome) ? new Date(campo(item, nome) + 'T12:00:00').getFullYear() : ''}
                                    onChange={e => {
                                      const mesAtual = campo(item, nome) ? String(new Date(campo(item, nome) + 'T12:00:00').getMonth() + 1).padStart(2, '0') : '01';
                                      setCampo(item.id, nome, e.target.value ? `${e.target.value}-${mesAtual}-01` : '');
                                    }}
                                    style={{ ...inputStyle(), border: 'none', padding: '2px 4px', background: 'transparent', width: 80 }} />
                                </div>
                              ) : (
                                <input type={tipo} value={campo(item, nome)} onChange={e => setCampo(item.id, nome, e.target.value)}
                                  placeholder={placeholder || undefined}
                                  style={{ ...inputStyle(), width: '100%', border: 'none', padding: '2px 0', background: 'transparent',
                                    fontWeight: nome === 'br' ? 700 : 400, fontFamily: nome === 'br' ? FONT_DISPLAY : undefined, color: nome === 'br' ? T.blueText : T.ink }} />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {item.status === 'pendente' ? (
                      <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button onClick={() => salvarSemFinalizar(item)} disabled={salvandoId === item.id}
                          style={{ fontSize: 12, fontWeight: 600, color: T.inkDim, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>
                          Salvar rascunho
                        </button>
                        {items.length === 1 && (
                          <button onClick={() => concluirGrupo(items)} disabled={salvandoId === item.id}
                            style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', opacity: salvandoId === item.id ? 0.6 : 1 }}>
                            {salvandoId === item.id ? 'Salvando…' : '✓ Concluir plaquinha'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '8px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: T.inkFaint }}>
                          Preenchido por {item.preenchido_por || '?'} em {new Date(item.preenchido_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          {item.email_enviado && <span style={{ color: T.oliveText, fontWeight: 700 }}> · ✓ e-mail enviado</span>}
                        </span>
                        {items.length === 1 && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <a href={`https://sieztnpchjjmrwrmrhoa.supabase.co/functions/v1/gerar-plaquinha-docx?id=${item.id}`}
                              style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: T.blueText, borderRadius: 5, padding: '5px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              ⬇ Baixar Word
                            </a>
                            <button onClick={() => enviarEmailGrupo(items)}
                              style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer' }}>
                              📧 Enviar e-mail
                            </button>
                            <button onClick={() => refazerGrupo(items)}
                              style={{ fontSize: 11.5, fontWeight: 600, color: T.amberText, background: 'transparent', border: `1px solid ${T.amber}66`, borderRadius: 5, padding: '5px 10px', cursor: 'pointer' }}>
                              ↺ Refazer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {items.length > 1 && todosPreenchidos && (
                <div style={{ padding: '8px 16px 12px', borderTop: `1px dashed ${T.lineSoft}`, display: 'flex', gap: 8 }}>
                  <a href={`https://sieztnpchjjmrwrmrhoa.supabase.co/functions/v1/gerar-plaquinha-docx?br=${encodeURIComponent(primeiro.br)}`}
                    style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: T.blueText, borderRadius: 5, padding: '6px 14px', textDecoration: 'none' }}>
                    ⬇ Baixar Word (com os {items.length} itens)
                  </a>
                  <button onClick={() => enviarEmailGrupo(items)}
                    style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 5, padding: '6px 14px', cursor: 'pointer' }}>
                    📧 Enviar e-mail (com os {items.length} itens)
                  </button>
                </div>
              )}
              {aba === 'pendentes' && (
                <div style={{ padding: '8px 16px 12px', borderTop: `1px dashed ${T.lineSoft}` }}>
                  <button onClick={() => adicionarItem(primeiro)}
                    style={{ fontSize: 11.5, fontWeight: 700, color: T.inkDim, background: 'transparent', border: `1px dashed ${T.line}`, borderRadius: 5, padding: '6px 12px', cursor: 'pointer', width: '100%' }}>
                    + Adicionar item nesse projeto (peça diferente, mesmo BR)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalEmail && (
        <ModalEmailPlaquinha modalEmail={modalEmail} currentUser={currentUser}
          montarTemplateGrupo={montarTemplateGrupo}
          onFechar={() => setModalEmail(null)}
          onConfirmar={confirmarEnvio}
          salvando={salvandoId === 'modal'} />
      )}
    </div>
  );
}

function ModalEmailPlaquinha({ modalEmail, currentUser, montarTemplateGrupo, onFechar, onConfirmar, salvando }) {
  const { grupos, modo } = modalEmail;
  const ehMassa = grupos.length > 1;
  const primeiroGrupo = grupos[0].items;
  const templateInicial = montarTemplateGrupo(primeiroGrupo);

  const [destinatarios, setDestinatarios] = useState([]);
  const [textoNome, setTextoNome] = useState('');
  const [colaboradores, setColaboradores] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [modelos, setModelos] = useState([]);
  const [assunto, setAssunto] = useState(templateInicial.assunto);
  const [corpo, setCorpo] = useState(templateInicial.corpo);
  const [nomeNovoModelo, setNomeNovoModelo] = useState('');
  const [mostrarSalvarModelo, setMostrarSalvarModelo] = useState(false);

  useEffect(() => {
    supabase.from('colaboradores').select('nome,email').eq('ativo', true).not('email', 'is', null).order('nome')
      .then(({ data }) => setColaboradores(data || []));
    supabase.from('modelos_email_plaquinha').select('*').order('nome_modelo')
      .then(({ data }) => setModelos(data || []));
  }, []);

  const sugestoes = textoNome.trim() ? colaboradores.filter(c => c.nome.toLowerCase().includes(textoNome.toLowerCase()) && !destinatarios.includes(c.email)) : [];

  const adicionarDestinatario = (email) => {
    if (!email || destinatarios.includes(email)) return;
    setDestinatarios(prev => [...prev, email]);
    setTextoNome('');
    setMostrarSugestoes(false);
  };
  const removerDestinatario = (email) => setDestinatarios(prev => prev.filter(e => e !== email));

  const usarModelo = (modelo) => {
    setDestinatarios(modelo.destinatarios || []);
  };

  const salvarModelo = async () => {
    if (!nomeNovoModelo.trim() || destinatarios.length === 0) return;
    await supabase.from('modelos_email_plaquinha').insert({
      nome_modelo: nomeNovoModelo.trim(), destinatarios, criado_por: currentUser?.nome || null,
    });
    const { data } = await supabase.from('modelos_email_plaquinha').select('*').order('nome_modelo');
    setModelos(data || []);
    setNomeNovoModelo('');
    setMostrarSalvarModelo(false);
  };

  return (
    <Overlay onClose={onFechar}>
      <div className="scale-in" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 820, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>
          {modo === 'concluir' ? `Concluir plaquinha${ehMassa ? 's' : ''}` : ehMassa ? `Enviar ${grupos.length} e-mails pendentes` : 'Enviar e-mail'}
        </h3>
        <p style={{ fontSize: 12.5, color: T.inkFaint, margin: '0 0 16px' }}>
          {ehMassa
            ? `Cada projeto abaixo vai virar um e-mail separado, todos pros mesmos destinatários: ${grupos.map(g => g.items[0].br).join(', ')}.`
            : 'Escolhe pra quem manda, e confere o texto antes de enviar.'}
        </p>

        {/* Destinatários */}
        <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Destinatários</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          {destinatarios.map(email => (
            <span key={email} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, background: T.blueSoft, color: T.blueText, padding: '4px 8px', borderRadius: 5 }}>
              {email}
              <span onClick={() => removerDestinatario(email)} style={{ cursor: 'pointer', fontWeight: 700 }}>×</span>
            </span>
          ))}
        </div>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <input value={textoNome}
            onChange={e => { setTextoNome(e.target.value); setMostrarSugestoes(true); }}
            onFocus={() => setMostrarSugestoes(true)}
            onKeyDown={e => { if (e.key === 'Enter' && textoNome.includes('@')) { adicionarDestinatario(textoNome.trim()); } }}
            placeholder="Digita o nome ou e-mail e aperta Enter…" style={{ ...inputStyle(), width: '100%' }} />
          {mostrarSugestoes && sugestoes.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 10, maxHeight: 180, overflowY: 'auto' }}>
              {sugestoes.map(c => (
                <div key={c.email} onClick={() => adicionarDestinatario(c.email)} onMouseDown={e => e.preventDefault()}
                  style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12.5, borderBottom: `1px solid ${T.lineSoft}` }}>
                  <div style={{ fontWeight: 700 }}>{c.nome}</div>
                  <div style={{ color: T.inkFaint, fontSize: 11 }}>{c.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modelos salvos */}
        {modelos.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: T.inkFaint, alignSelf: 'center' }}>Modelos salvos:</span>
            {modelos.map(m => (
              <button key={m.id} onClick={() => usarModelo(m)}
                style={{ fontSize: 11, fontWeight: 600, color: T.inkDim, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 5, padding: '3px 9px', cursor: 'pointer' }}>
                {m.nome_modelo}
              </button>
            ))}
          </div>
        )}
        {destinatarios.length > 0 && !mostrarSalvarModelo && (
          <button onClick={() => setMostrarSalvarModelo(true)} style={{ fontSize: 10.5, color: T.blueText, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}>
            💾 Salvar esses destinatários como modelo
          </button>
        )}
        {mostrarSalvarModelo && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <input value={nomeNovoModelo} onChange={e => setNomeNovoModelo(e.target.value)} placeholder="Nome do modelo (ex: Time Ternium)" style={{ ...inputStyle(), flex: 1 }} />
            <button onClick={salvarModelo} style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer' }}>Salvar</button>
          </div>
        )}

        {/* Assunto/corpo — só edita de verdade se for envio único (em massa usa o template automático por projeto) */}
        {!ehMassa && (
          <>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4, marginTop: 6 }}>Assunto</label>
            <input value={assunto} onChange={e => setAssunto(e.target.value)} style={{ ...inputStyle(), width: '100%', marginBottom: 10 }} />
            <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Corpo do e-mail</label>
            <textarea value={corpo} onChange={e => setCorpo(e.target.value)} rows={16}
              style={{ ...inputStyle(), width: '100%', resize: 'vertical', fontSize: 12.5 }} />
            <p style={{ fontSize: 10, color: T.inkFaint, marginTop: 4 }}>Escreve normal — as quebras de linha e o link já ficam certos no e-mail final.</p>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => onConfirmar({ grupos, modo, destinatarios, assunto, corpo })} disabled={salvando || destinatarios.length === 0}
            style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', opacity: (salvando || destinatarios.length === 0) ? 0.5 : 1 }}>
            {salvando ? 'Enviando…' : ehMassa ? `✓ Disparar ${grupos.length} e-mails` : modo === 'concluir' ? '✓ Concluir e enviar' : '✓ Enviar'}
          </button>
          {modo === 'concluir' && (
            <button onClick={() => onConfirmar({ grupos, modo, destinatarios: [], assunto, corpo })} disabled={salvando}
              style={{ fontSize: 12.5, fontWeight: 600, color: T.inkDim, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}>
              Só concluir (sem e-mail)
            </button>
          )}
          <button onClick={onFechar} style={{ fontSize: 12.5, fontWeight: 600, color: T.inkFaint, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function CriarPlaquinhaManual({ onFechar, onCriado }) {
  const [br, setBr] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [encontrado, setEncontrado] = useState(null);
  const [naoAchou, setNaoAchou] = useState(false);
  const [criando, setCriando] = useState(false);

  const buscar = async () => {
    if (!br.trim()) return;
    setBuscando(true);
    setNaoAchou(false);
    setEncontrado(null);
    const { data } = await supabase.from('pedidos_itens').select('br,cliente_nome,numero_pedido,data_prevista_entrega,produto_descricao')
      .ilike('br', br.trim()).limit(1).maybeSingle();
    if (data) {
      setEncontrado(data);
    } else {
      setNaoAchou(true);
      setEncontrado({ br: br.trim(), cliente_nome: '', numero_pedido: '', data_prevista_entrega: '', produto_descricao: '' });
    }
    setBuscando(false);
  };

  const criar = async () => {
    setCriando(true);
    await supabase.from('plaquinhas_equipamento').insert({
      br: encontrado.br, cliente_nome: encontrado.cliente_nome || null,
      numero_pedido_compra: encontrado.numero_pedido || null,
      data_prevista_entrega: encontrado.data_prevista_entrega || null,
      origem_deteccao: 'manual', status: 'pendente',
    });
    setCriando(false);
    onCriado();
    onFechar();
  };

  return (
    <Panel title="Criar plaquinha manualmente" subtitle="Digita o BR e busca — a gente preenche cliente e pedido automaticamente se achar.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={br} onChange={e => setBr(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Ex: BR14500/26" style={{ ...inputStyle(), flex: 1 }} />
          <button onClick={buscar} disabled={buscando || !br.trim()}
            style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', background: T.inkDim, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
            {buscando ? 'Buscando…' : '🔍 Buscar'}
          </button>
        </div>

        {naoAchou && <div style={{ fontSize: 12, color: T.amberText }}>⚠ Não achamos esse BR — pode preencher tudo na mão abaixo.</div>}

        {encontrado && (
          <>
            {encontrado.produto_descricao && (
              <div style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkFaint, marginBottom: 3 }}>PRODUTO (Sankhya)</div>
                <div style={{ fontSize: 12, color: T.inkDim, lineHeight: 1.4 }}>{encontrado.produto_descricao}</div>
              </div>
            )}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Cliente</label>
              <input value={encontrado.cliente_nome || ''} onChange={e => setEncontrado(prev => ({ ...prev, cliente_nome: e.target.value }))} style={{ ...inputStyle(), width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>N. Pedido de compra</label>
              <input value={encontrado.numero_pedido || ''} onChange={e => setEncontrado(prev => ({ ...prev, numero_pedido: e.target.value }))} style={{ ...inputStyle(), width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Data prevista de entrega</label>
              <input type="date" value={encontrado.data_prevista_entrega || ''} onChange={e => setEncontrado(prev => ({ ...prev, data_prevista_entrega: e.target.value }))} style={{ ...inputStyle(), width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={criar} disabled={criando}
                style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                {criando ? 'Criando…' : '✓ Adicionar à lista de pendentes'}
              </button>
              <button onClick={onFechar} style={{ fontSize: 12.5, fontWeight: 600, color: T.inkFaint, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </>
        )}
        {!encontrado && (
          <button onClick={onFechar} style={{ fontSize: 12.5, fontWeight: 600, color: T.inkFaint, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer', alignSelf: 'flex-start' }}>
            Cancelar
          </button>
        )}
      </div>
    </Panel>
  );
}

function PropostaTecnica({ currentUser }) {
  const [abaPT, setAbaPT] = useState('minhas_tarefas'); // 'direcionar' | 'minhas_tarefas' | 'aprovacao' | 'todas'
  const [itens, setItens] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [{ data }, { data: colabs }] = await Promise.all([
      supabase.from('propostas_tecnicas').select('*, direcionado_para_nome:colaboradores!propostas_tecnicas_direcionado_para_fkey(nome), direcionado_por_nome:colaboradores!propostas_tecnicas_direcionado_por_fkey(nome), aprovado_por_nome:colaboradores!propostas_tecnicas_aprovado_por_fkey(nome)').order('created_at', { ascending: false }),
      supabase.from('colaboradores').select('id,nome').eq('ativo', true).order('nome'),
    ]);
    setItens((data || []).map(d => ({
      ...d,
      direcionado_para_nome: d.direcionado_para_nome?.nome || null,
      direcionado_por_nome: d.direcionado_por_nome?.nome || null,
      aprovado_por_nome: d.aprovado_por_nome?.nome || null,
    })));
    setColaboradores(colabs || []);
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const meuId = colaboradores.find(c => c.nome === currentUser?.nome)?.id;
  const minhasTarefas = itens.filter(i => i.direcionado_para === meuId && (i.status === 'aberta' || i.status === 'reprovada'));
  const paraAprovar = itens.filter(i => i.status === 'entregue');

  const fmtDataHora = (iso) => !iso ? '—' : new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const fmtData = (d) => !d ? '—' : new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const diasAberta = (item) => {
    const inicio = new Date(item.direcionado_em);
    const fim = item.entregue_em ? new Date(item.entregue_em) : new Date();
    return Math.max(0, Math.floor((fim - inicio) / (1000 * 60 * 60 * 24)));
  };
  const atrasada = (item) => item.status !== 'aprovada' && new Date().toISOString().slice(0, 10) > item.prazo_entrega;

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1280 }}>
      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Toda proposta técnica passa por aqui — direciona pra alguém, quem recebe vê como tarefa aberta, anexa o retorno, e entra pra aprovação. Dá pra ver quem está fazendo, quem não está, e quanto tempo está levando.
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${T.line}`, flexWrap: 'wrap' }}>
        {[
          { id: 'minhas_tarefas', label: `Minhas Tarefas${minhasTarefas.length ? ` (${minhasTarefas.length})` : ''}` },
          { id: 'direcionar', label: 'Direcionar Nova' },
          { id: 'aprovacao', label: `Aprovação${paraAprovar.length ? ` (${paraAprovar.length})` : ''}` },
          { id: 'todas', label: `Todas (${itens.length})` },
        ].map(aba => (
          <button key={aba.id} onClick={() => setAbaPT(aba.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, fontWeight: 600,
              color: abaPT === aba.id ? T.terracotta : T.inkFaint,
              borderBottom: `2px solid ${abaPT === aba.id ? T.terracotta : 'transparent'}`, marginBottom: -1,
            }}>
            {aba.label}
          </button>
        ))}
      </div>

      {abaPT === 'direcionar' && <DirecionarPropostaTecnica currentUser={currentUser} colaboradores={colaboradores} onCriado={carregar} />}

      {abaPT === 'minhas_tarefas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint }}>Carregando…</div>
          ) : minhasTarefas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.oliveText, fontWeight: 600, fontSize: 13 }}>✓ Nenhuma tarefa aberta pra você.</div>
          ) : minhasTarefas.map(item => (
            <TarefaCard key={item.id} item={item} currentUser={currentUser} onAtualizado={carregar} fmtDataHora={fmtDataHora} fmtData={fmtData} diasAberta={diasAberta} atrasada={atrasada} />
          ))}
        </div>
      )}

      {abaPT === 'aprovacao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint }}>Carregando…</div>
          ) : paraAprovar.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.inkFaint, fontSize: 13 }}>Nada esperando aprovação.</div>
          ) : paraAprovar.map(item => (
            <AprovacaoCard key={item.id} item={item} currentUser={currentUser} onAtualizado={carregar} fmtDataHora={fmtDataHora} fmtData={fmtData} />
          ))}
        </div>
      )}

      {abaPT === 'todas' && (
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(100)}>BR</th>
                  <th style={thFat(140)}>Cliente</th>
                  <th style={thFat(120)}>Direcionado pra</th>
                  <th style={thFat(90)}>Direcionado em</th>
                  <th style={thFat(80)}>Prazo</th>
                  <th style={thFat(90)}>Status</th>
                  <th style={{ ...thFat(70), textAlign: 'right' }}>Dias</th>
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhuma proposta técnica ainda.</td></tr>
                ) : itens.map(item => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: atrasada(item) ? `${T.rustSoft}44` : 'transparent' }}>
                    <td style={{ padding: '8px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{item.br || '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{item.cliente_nome || '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{item.direcionado_para_nome || '—'}</td>
                    <td style={{ padding: '8px 12px', color: T.inkFaint }}>{fmtDataHora(item.direcionado_em)}</td>
                    <td style={{ padding: '8px 12px', color: atrasada(item) ? T.rustText : T.inkFaint, fontWeight: atrasada(item) ? 700 : 400 }}>{fmtData(item.prazo_entrega)}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                        color: item.status === 'aprovada' ? T.oliveText : item.status === 'reprovada' ? T.rustText : item.status === 'entregue' ? T.blueText : T.amberText,
                        background: item.status === 'aprovada' ? T.oliveSoft : item.status === 'reprovada' ? T.rustSoft : item.status === 'entregue' ? T.blueSoft : T.amberSoft,
                      }}>
                        {item.status === 'aberta' ? 'Aberta' : item.status === 'entregue' ? 'Aguard. aprovação' : item.status === 'aprovada' ? '✓ Aprovada' : '✗ Reprovada'}
                      </span>
                      {atrasada(item) && <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 700, color: T.rustText }}>⚠ Atrasada</span>}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{diasAberta(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DirecionarPropostaTecnica({ currentUser, colaboradores, onCriado }) {
  const [br, setBr] = useState('');
  const [cliente, setCliente] = useState('');
  const [prazo, setPrazo] = useState('');
  const [direcionadoPara, setDirecionadoPara] = useState('');
  const [arquivoProposta, setArquivoProposta] = useState(null);
  const [arquivoEmail, setArquivoEmail] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState('');
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const enviar = async () => {
    if (!prazo || !direcionadoPara) { setErro('Prazo e destinatário são obrigatórios.'); return; }
    if (!arquivoProposta && !arquivoEmail) { setErro('Anexa a proposta e/ou o e-mail.'); return; }
    setErro(null);
    setEnviando(true);

    const uploads = {};
    try {
      for (const [campo, file] of [['proposta', arquivoProposta], ['email', arquivoEmail]]) {
        if (!file) continue;
        setProgresso(`Enviando ${file.name}…`);
        const path = `proposta-tecnica/${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from('propostas-arquivos').upload(path, file, { upsert: true });
        if (upErr) throw new Error(`Erro ao enviar "${file.name}": ${upErr.message}`);
        const { data: urlData } = supabase.storage.from('propostas-arquivos').getPublicUrl(path);
        uploads[campo] = { url: urlData.publicUrl, nome: file.name };
      }

      setProgresso('Salvando…');
      const { data: colabAtual } = await supabase.from('colaboradores').select('id').eq('nome', currentUser?.nome).maybeSingle();
      const { data: novaProposta, error } = await supabase.from('propostas_tecnicas').insert({
        br: br || null,
        cliente_nome: cliente || null,
        arquivo_proposta_url: uploads.proposta?.url || null,
        arquivo_proposta_nome: uploads.proposta?.nome || null,
        arquivo_email_url: uploads.email?.url || null,
        arquivo_email_nome: uploads.email?.nome || null,
        prazo_entrega: prazo,
        direcionado_para: direcionadoPara,
        direcionado_por: colabAtual?.id || null,
        status: 'aberta',
      }).select().single();
      if (error) throw new Error(error.message);

      // Enfileira a notificação do Teams (Power Automate processa depois)
      const destinatario = colaboradores.find(c => c.id === direcionadoPara);
      const { data: colabDestino } = await supabase.from('colaboradores').select('email').eq('id', direcionadoPara).maybeSingle();
      if (colabDestino?.email) {
        await supabase.from('solicitacoes_notificacao_teams').insert({
          proposta_tecnica_id: novaProposta.id,
          destinatario_email: colabDestino.email,
          mensagem: `Nova proposta técnica direcionada pra você${br ? ` — ${br}` : ''}${cliente ? ` (${cliente})` : ''}. Prazo: ${new Date(prazo + 'T12:00:00').toLocaleDateString('pt-BR')}.`,
          status: 'pendente',
        });
      }

      setSucesso(true);
      setBr(''); setCliente(''); setPrazo(''); setDirecionadoPara(''); setArquivoProposta(null); setArquivoEmail(null);
      onCriado();
      setTimeout(() => setSucesso(false), 4000);
    } catch (e) {
      setErro(e.message);
    }
    setEnviando(false);
    setProgresso('');
  };

  return (
    <Panel title="Direcionar proposta técnica" subtitle="Anexa a proposta e/ou o e-mail que você recebeu do comercial, define o prazo, e escolhe quem vai fazer.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
        {erro && <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 6, padding: '8px 12px', fontSize: 12.5 }}>{erro}</div>}
        {sucesso && <div style={{ background: T.oliveSoft, color: T.oliveText, borderRadius: 6, padding: '8px 12px', fontSize: 12.5, fontWeight: 600 }}>✓ Direcionado com sucesso!</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>BR (opcional)</label>
            <input value={br} onChange={e => setBr(e.target.value)} placeholder="Ex: BR14500/26" style={{ ...inputStyle(), width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Cliente (opcional)</label>
            <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nome do cliente" style={{ ...inputStyle(), width: '100%' }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Anexar proposta (PDF/Word)</label>
          <input type="file" onChange={e => setArquivoProposta(e.target.files?.[0] || null)} style={{ fontSize: 12.5 }} />
        </div>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Anexar e-mail (opcional)</label>
          <input type="file" onChange={e => setArquivoEmail(e.target.files?.[0] || null)} style={{ fontSize: 12.5 }} />
        </div>

        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Prazo de entrega (o que o comercial passou)</label>
          <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} style={{ ...inputStyle(), width: '100%' }} />
        </div>

        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Direcionar para</label>
          <div style={{ position: 'relative' }}>
            <select value={direcionadoPara} onChange={e => setDirecionadoPara(e.target.value)} style={{ ...inputStyle(), width: '100%', appearance: 'none' }}>
              <option value="">Escolhe quem vai fazer…</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: 11, color: T.inkFaint, pointerEvents: 'none' }} />
          </div>
        </div>

        <button onClick={enviar} disabled={enviando}
          style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
          {enviando ? (progresso || 'Enviando…') : '📨 Direcionar e notificar'}
        </button>
      </div>
    </Panel>
  );
}

function TarefaCard({ item, currentUser, onAtualizado, fmtDataHora, fmtData, diasAberta, atrasada }) {
  const [arquivoRetorno, setArquivoRetorno] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const entregar = async () => {
    if (!arquivoRetorno) { setErro('Anexa o retorno antes de entregar.'); return; }
    setErro(null);
    setEnviando(true);
    try {
      const path = `proposta-tecnica-retorno/${Date.now()}_${arquivoRetorno.name}`;
      const { error: upErr } = await supabase.storage.from('propostas-arquivos').upload(path, arquivoRetorno, { upsert: true });
      if (upErr) throw new Error(upErr.message);
      const { data: urlData } = supabase.storage.from('propostas-arquivos').getPublicUrl(path);
      await supabase.from('propostas_tecnicas').update({
        arquivo_retorno_url: urlData.publicUrl,
        arquivo_retorno_nome: arquivoRetorno.name,
        status: 'entregue',
        entregue_em: new Date().toISOString(),
      }).eq('id', item.id);
      onAtualizado();
    } catch (e) {
      setErro(e.message);
    }
    setEnviando(false);
  };

  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {item.br && <span style={{ fontFamily: FONT_DISPLAY, color: T.blueText }}>{item.br}</span>}
            {item.cliente_nome && <span style={{ fontSize: 12, fontWeight: 400, color: T.inkDim }}> — {item.cliente_nome}</span>}
          </div>
          <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 3 }}>
            Direcionado por {item.direcionado_por_nome || '?'} em {fmtDataHora(item.direcionado_em)}
          </div>
          {item.status === 'reprovada' && item.comentario_aprovacao && (
            <div style={{ fontSize: 11.5, color: T.rustText, marginTop: 4 }}>✗ Reprovada: {item.comentario_aprovacao} — ajusta e reenvia</div>
          )}
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: atrasada(item) ? T.rustText : T.inkDim, background: atrasada(item) ? T.rustSoft : T.panelAlt, padding: '4px 10px', borderRadius: 4 }}>
          Prazo: {fmtData(item.prazo_entrega)} {atrasada(item) && '⚠'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {item.arquivo_proposta_url && <a href={item.arquivo_proposta_url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: T.blueText, textDecoration: 'underline' }}>📄 {item.arquivo_proposta_nome}</a>}
        {item.arquivo_email_url && <a href={item.arquivo_email_url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: T.blueText, textDecoration: 'underline' }}>✉️ {item.arquivo_email_nome}</a>}
      </div>
      {erro && <div style={{ fontSize: 11.5, color: T.rustText }}>{erro}</div>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: `1px solid ${T.lineSoft}`, paddingTop: 10, flexWrap: 'wrap' }}>
        <input type="file" onChange={e => setArquivoRetorno(e.target.files?.[0] || null)} style={{ fontSize: 11.5 }} />
        <button onClick={entregar} disabled={enviando}
          style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
          {enviando ? 'Enviando…' : '✓ Entregar pra aprovação'}
        </button>
      </div>
    </div>
  );
}

function AprovacaoCard({ item, currentUser, onAtualizado, fmtDataHora, fmtData }) {
  const [comentario, setComentario] = useState('');
  const [processando, setProcessando] = useState(false);

  const decidir = async (aprovado) => {
    setProcessando(true);
    const { data: colabAtual } = await supabase.from('colaboradores').select('id').eq('nome', currentUser?.nome).maybeSingle();
    await supabase.from('propostas_tecnicas').update({
      status: aprovado ? 'aprovada' : 'reprovada',
      aprovado_por: colabAtual?.id || null,
      aprovado_em: new Date().toISOString(),
      comentario_aprovacao: comentario || null,
    }).eq('id', item.id);
    onAtualizado();
    setProcessando(false);
  };

  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {item.br && <span style={{ fontFamily: FONT_DISPLAY, color: T.blueText }}>{item.br}</span>}
            {item.cliente_nome && <span style={{ fontSize: 12, fontWeight: 400, color: T.inkDim }}> — {item.cliente_nome}</span>}
          </div>
          <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 3 }}>
            Feito por {item.direcionado_para_nome || '?'} — entregue em {fmtDataHora(item.entregue_em)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {item.arquivo_proposta_url && <a href={item.arquivo_proposta_url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: T.blueText, textDecoration: 'underline' }}>📄 Proposta original</a>}
        {item.arquivo_retorno_url && <a href={item.arquivo_retorno_url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, fontWeight: 700, color: T.oliveText, textDecoration: 'underline' }}>📎 {item.arquivo_retorno_nome}</a>}
      </div>
      <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={2} placeholder="Comentário (opcional, obrigatório se reprovar)"
        style={{ ...inputStyle(), width: '100%', resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => decidir(true)} disabled={processando}
          style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
          ✓ Aprovar
        </button>
        <button onClick={() => decidir(false)} disabled={processando || !comentario}
          style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.rustText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', opacity: !comentario ? 0.5 : 1 }}>
          ✗ Reprovar
        </button>
      </div>
    </div>
  );
}

function MonitoramentoOP({ currentUser }) {
  const STATUS_PLANNER_LABEL = { notStarted: 'Não iniciado', inProgress: 'Em andamento', completed: 'Concluído' };
  // IDs reais dos buckets do quadro "Gestão Comercial" no Planner — o portal
  // manda o ID direto na solicitação de mover card, sem precisar o Power
  // Automate descobrir/traduzir nome pra ID.
  const BUCKETS_PLANNER = {
    CONHECIMENTO_PRONTO: 'EWmnDctn00KrthU9NhijvpcAPYtl',
    AVALIACAO_PRELIMINAR: 'aP8nsbEDEkSB7cBRhOrXkZcAKvzc',
    PROJETOS_EM_ANDAMENTO: 'bFR9Hid1TE6S6kQUtsFD-5cAAQbR',
    OPS_GERADAS: 'Gkd6VVWprEacnKG3F73XGZcAEzsE',
    DUVIDAS_TECNICAS: 'CaDhL0JpMUifIHgbkBxniZcANDG0',
  };
  const [abaMonitoramento, setAbaMonitoramento] = useState('op'); // 'op' | 'cotacao'
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loadingSolic, setLoadingSolic] = useState(true);
  const [buscaSolic, setBuscaSolic] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos | nao_solicitado | aguardando | criado | excluido
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const [cardsBrOp, setCardsBrOp] = useState([]);
  const [loadingCardsBrOp, setLoadingCardsBrOp] = useState(true);
  const [filtroCardBrOp, setFiltroCardBrOp] = useState('sem_op'); // sem_op | com_op | todos
  const [buscaCardBrOp, setBuscaCardBrOp] = useState('');
  const carregarCardsBrOp = useCallback(async () => {
    setLoadingCardsBrOp(true);
    const { data } = await supabase.from('v_monitoramento_op_cards_planner').select('*').eq('planner_excluido', false).order('br');
    setCardsBrOp(data || []);
    setLoadingCardsBrOp(false);
  }, []);
  useEffect(() => { if (abaMonitoramento === 'cards_br_op') carregarCardsBrOp(); }, [abaMonitoramento, carregarCardsBrOp]);
  const cardsBrOpFiltrados = useMemo(() => {
    let lista = cardsBrOp;
    if (filtroCardBrOp === 'sem_op') lista = lista.filter(c => !c.op || !c.op.trim());
    else if (filtroCardBrOp === 'com_op') lista = lista.filter(c => c.op && c.op.trim());
    if (buscaCardBrOp.trim()) {
      const b = buscaCardBrOp.toLowerCase();
      lista = lista.filter(c => (c.br || '').toLowerCase().includes(b) || (c.planner_titulo || '').toLowerCase().includes(b) || (c.op || '').includes(b));
    }
    return lista;
  }, [cardsBrOp, filtroCardBrOp, buscaCardBrOp]);

  // ── Candidatos a ter a OP escrita na observação — nada acontece sem confirmação manual ──
  const [candidatosObs, setCandidatosObs] = useState([]);
  const [loadingCandidatosObs, setLoadingCandidatosObs] = useState(true);
  const [confirmandoObs, setConfirmandoObs] = useState(null);
  const carregarCandidatosObs = useCallback(async () => {
    setLoadingCandidatosObs(true);
    const { data } = await supabase.from('v_candidatos_atualizar_observacao').select('*');
    setCandidatosObs(data || []);
    setLoadingCandidatosObs(false);
  }, []);
  useEffect(() => { if (abaMonitoramento === 'cards_br_op') carregarCandidatosObs(); }, [abaMonitoramento, carregarCandidatosObs]);

  const confirmarAdicionarOp = async (candidato) => {
    setConfirmandoObs(candidato.planner_task_id);
    await supabase.from('solicitacoes_atualizar_observacao_planner').insert({
      planner_task_id: candidato.planner_task_id,
      br: candidato.br,
      op_para_adicionar: candidato.ops_encontradas,
      status: 'pendente',
    });
    await carregarCandidatosObs();
    setConfirmandoObs(null);
  };

  // ── Aba "Conhecimento Pronto" — fluxo Iniciar → Finalizar → move card automático ──
  const [cardsConhecPronto, setCardsConhecPronto] = useState([]);
  const [loadingConhecPronto, setLoadingConhecPronto] = useState(true);
  const [modalFinalizar, setModalFinalizar] = useState(null); // card sendo finalizado agora
  const [modalIniciar, setModalIniciar] = useState(null); // card sendo iniciado agora
  const [visualizacaoConhecPronto, setVisualizacaoConhecPronto] = useState('cards'); // 'cards' | 'planilha'
  const [processandoCard, setProcessandoCard] = useState(null);
  const carregarConhecPronto = useCallback(async () => {
    setLoadingConhecPronto(true);
    const { data } = await supabase.from('v_monitoramento_op_cards_planner').select('*')
      .eq('bucket_atual', 'Engenharia - Conhecimento Pronto').eq('planner_excluido', false)
      .order('br');
    let lista = data || [];
    const brs = [...new Set(lista.map(c => c.br).filter(Boolean))];
    if (brs.length) {
      const clientePorBr = {};
      const { data: pedidos } = await supabase.from('pedidos_itens').select('br,cliente_nome').in('br', brs);
      (pedidos || []).forEach(p => { if (p.cliente_nome && !clientePorBr[p.br]) clientePorBr[p.br] = p.cliente_nome; });
      const semCliente = brs.filter(br => !clientePorBr[br]);
      if (semCliente.length) {
        const { data: vendas } = await supabase.from('nota_venda_itens').select('br,cliente_nome').in('br', semCliente);
        (vendas || []).forEach(v => { if (v.cliente_nome && !clientePorBr[v.br]) clientePorBr[v.br] = v.cliente_nome; });
      }
      lista = lista.map(c => ({ ...c, cliente_nome: c.cliente_nome || clientePorBr[c.br] || null }));
    }
    setCardsConhecPronto(lista);
    setLoadingConhecPronto(false);

    // Marca "visto" automaticamente (igual WhatsApp) pra quem ainda não foi visto —
    // não espera clique nenhum, só de aparecer na tela já conta.
    const naoVistos = lista.filter(c => !c.visto_em && !c.data_finalizado);
    if (naoVistos.length) {
      const agora = new Date().toISOString();
      await supabase.from('monitoramento_op_cards_planner')
        .update({ visto_em: agora, visto_por: currentUser?.nome || null })
        .in('id', naoVistos.map(c => c.id));
      setCardsConhecPronto(prev => prev.map(c =>
        naoVistos.some(nv => nv.id === c.id) ? { ...c, visto_em: agora, visto_por: currentUser?.nome || null } : c
      ));
    }
  }, [currentUser]);
  useEffect(() => { if (abaMonitoramento === 'conhecimento_pronto') carregarConhecPronto(); }, [abaMonitoramento, carregarConhecPronto]);
  useEffect(() => {
    if (abaMonitoramento !== 'conhecimento_pronto') return;
    const id = setInterval(() => carregarConhecPronto(), 20000);
    return () => clearInterval(id);
  }, [abaMonitoramento, carregarConhecPronto]);

  const marcarCienteDemanda = async (card) => {
    setProcessandoCard(card.id);
    await supabase.from('monitoramento_op_cards_planner').update({
      ciente_em: new Date().toISOString(),
      ciente_por: currentUser?.nome || null,
    }).eq('id', card.id);
    await supabase.from('solicitacoes_mover_card_planner').insert({
      planner_task_id: card.planner_task_id,
      br: card.br,
      bucket_destino: BUCKETS_PLANNER.AVALIACAO_PRELIMINAR,
      status: 'pendente',
    });
    await carregarConhecPronto();
    setProcessandoCard(null);
  };

  const iniciarProjeto = async (card, dataPrevista, projetista) => {
    setProcessandoCard(card.id);
    await supabase.from('monitoramento_op_cards_planner').update({
      data_iniciado: new Date().toISOString(),
      iniciado_por: currentUser?.nome || null,
      data_prevista_finalizacao: dataPrevista || null,
      projetista: projetista || null,
    }).eq('id', card.id);
    await supabase.from('solicitacoes_mover_card_planner').insert({
      planner_task_id: card.planner_task_id,
      br: card.br,
      bucket_destino: BUCKETS_PLANNER.PROJETOS_EM_ANDAMENTO,
      status: 'pendente',
    });
    setModalIniciar(null);
    await carregarConhecPronto();
    setProcessandoCard(null);
  };

  const finalizarProjeto = async (card, comDuvida, observacao, motivoAtraso) => {
    setProcessandoCard(card.id);
    await supabase.from('monitoramento_op_cards_planner').update({
      data_finalizado: new Date().toISOString(),
      finalizado_com_duvida: comDuvida,
      observacao_duvida: observacao || null,
      motivo_atraso: motivoAtraso || null,
    }).eq('id', card.id);

    await supabase.from('solicitacoes_mover_card_planner').insert({
      planner_task_id: card.planner_task_id,
      br: card.br,
      bucket_destino: comDuvida ? BUCKETS_PLANNER.DUVIDAS_TECNICAS : BUCKETS_PLANNER.OPS_GERADAS,
      status: 'pendente',
    });

    setModalFinalizar(null);
    await carregarConhecPronto();
    setProcessandoCard(null);
  };

  const fmtHoras = (h) => {
    if (h == null) return '—';
    if (h < 1) return `${Math.round(h * 60)} min`;
    return `${h.toFixed(1)} h`;
  };

  const [cardsTravados, setCardsTravados] = useState([]);
  const carregarCardsTravados = useCallback(async () => {
    const { data } = await supabase.from('v_cards_movimentacao_travada').select('*');
    setCardsTravados(data || []);
  }, []);
  useEffect(() => { if (abaMonitoramento === 'conhecimento_pronto') carregarCardsTravados(); }, [abaMonitoramento, carregarCardsTravados]);

  // ── Aba "Verificação de OP's Geradas" — Iniciar/Pausar/Finalizar + mostra as OPs reais do BR ──
  const [cardsOpsGeradas, setCardsOpsGeradas] = useState([]);
  const [loadingOpsGeradas, setLoadingOpsGeradas] = useState(true);
  const [opsPorBr, setOpsPorBr] = useState({}); // br -> [ops]
  const [modalPendencia, setModalPendencia] = useState(null);
  const [tick, setTick] = useState(0); // força recálculo do tempo ao vivo a cada segundo
  const carregarOpsGeradas = useCallback(async () => {
    setLoadingOpsGeradas(true);
    // Não usa bucket_atual (isso só é atualizado pelo Fluxo 1, que só rastreia
    // "Conhecimento Pronto") -- usa nosso próprio controle: já foi finalizado
    // normalmente (sem dúvida) e ainda não passou pela verificação das OPs.
    const { data } = await supabase.from('v_monitoramento_op_cards_planner').select('*')
      .not('data_finalizado', 'is', null)
      .eq('finalizado_com_duvida', false)
      .neq('status_verificacao_op', 'finalizado')
      .eq('planner_excluido', false)
      .order('br');
    setCardsOpsGeradas(data || []);
    const brs = [...new Set((data || []).map(c => c.br).filter(Boolean))];
    if (brs.length) {
      // Busca direto no Sankhya (não depende de já ter apontamento de produção
      // -- pega a OP assim que ela é criada, mesmo ainda "Aberto")
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/buscar-op-por-br`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brs }),
        }).then(r => r.json());
        if (res.ok) {
          setOpsPorBr(Object.fromEntries(Object.entries(res.opsPorBr).map(([br, lista]) => [br, lista.map(x => x.op)])));
        }
      } catch (e) { console.error('Erro buscando OP por BR:', e); }
    }
    setLoadingOpsGeradas(false);
  }, []);
  useEffect(() => { if (abaMonitoramento === 'conhecimento_pronto') carregarOpsGeradas(); }, [abaMonitoramento, carregarOpsGeradas]);
  useEffect(() => {
    if (abaMonitoramento !== 'conhecimento_pronto') return;
    const id = setInterval(() => carregarOpsGeradas(), 30000);
    return () => clearInterval(id);
  }, [abaMonitoramento, carregarOpsGeradas]);
  // Ticker de 1s só pra atualizar o cronômetro visual dos que estão "em andamento"
  useEffect(() => {
    if (abaMonitoramento !== 'conhecimento_pronto') return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [abaMonitoramento]);

  const iniciarOuRetomarVerificacao = async (card) => {
    await supabase.from('monitoramento_op_cards_planner').update({
      status_verificacao_op: 'em_andamento',
      ultimo_inicio_verificacao: new Date().toISOString(),
    }).eq('id', card.id);
    await carregarOpsGeradas();
  };

  const pausarVerificacao = async (card) => {
    const segundosRodados = card.ultimo_inicio_verificacao ? Math.floor((Date.now() - new Date(card.ultimo_inicio_verificacao).getTime()) / 1000) : 0;
    await supabase.from('monitoramento_op_cards_planner').update({
      status_verificacao_op: 'pausado',
      tempo_acumulado_segundos: (card.tempo_acumulado_segundos || 0) + segundosRodados,
      ultimo_inicio_verificacao: null,
    }).eq('id', card.id);
    await carregarOpsGeradas();
  };

  const finalizarVerificacao = async (card) => {
    const segundosRodados = card.ultimo_inicio_verificacao ? Math.floor((Date.now() - new Date(card.ultimo_inicio_verificacao).getTime()) / 1000) : 0;
    await supabase.from('monitoramento_op_cards_planner').update({
      status_verificacao_op: 'finalizado',
      tempo_acumulado_segundos: (card.tempo_acumulado_segundos || 0) + segundosRodados,
      ultimo_inicio_verificacao: null,
      finalizado_verificacao_em: new Date().toISOString(),
    }).eq('id', card.id);
    // Não precisa mover — já está no bucket final "OP's GERADAS", que é o último da esteira
    await carregarOpsGeradas();
  };

  const sinalizarPendencia = async (card, observacao) => {
    const segundosRodados = card.ultimo_inicio_verificacao ? Math.floor((Date.now() - new Date(card.ultimo_inicio_verificacao).getTime()) / 1000) : 0;
    await supabase.from('monitoramento_op_cards_planner').update({
      status_verificacao_op: 'pendencia',
      tempo_acumulado_segundos: (card.tempo_acumulado_segundos || 0) + segundosRodados,
      ultimo_inicio_verificacao: null,
      observacao_duvida: observacao || null,
    }).eq('id', card.id);
    await supabase.from('solicitacoes_mover_card_planner').insert({
      planner_task_id: card.planner_task_id,
      br: card.br,
      bucket_destino: BUCKETS_PLANNER.DUVIDAS_TECNICAS,
      status: 'pendente',
    });
    setModalPendencia(null);
    await carregarOpsGeradas();
  };

  const fmtCronometro = (segundos) => {
    const s = Math.max(0, Math.floor(segundos));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };
  const tempoAoVivo = (card) => {
    const base = card.tempo_acumulado_segundos || 0;
    if (card.status_verificacao_op === 'em_andamento' && card.ultimo_inicio_verificacao) {
      return base + Math.floor((Date.now() - new Date(card.ultimo_inicio_verificacao).getTime()) / 1000);
    }
    return base;
  };

  const carregarSolicitacoes = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoadingSolic(true);
    const { data } = await supabase.from('solicitacoes_compra_planner').select('*').order('data_solicitacao', { ascending: false });
    setSolicitacoes(data || []);
    if (!silencioso) setLoadingSolic(false);
  }, []);
  useEffect(() => { if (abaMonitoramento === 'cotacao') carregarSolicitacoes(); }, [abaMonitoramento, carregarSolicitacoes]);
  // Atualização automática da tela a cada 15s, enquanto a aba estiver aberta — sem piscar loading
  useEffect(() => {
    if (abaMonitoramento !== 'cotacao') return;
    const id = setInterval(() => carregarSolicitacoes(true), 15000);
    return () => clearInterval(id);
  }, [abaMonitoramento, carregarSolicitacoes]);

  const [sincronizandoSankhya, setSincronizandoSankhya] = useState(false);
  const [mensagemSyncSankhya, setMensagemSyncSankhya] = useState(null);
  const sincronizarComSankhya = async () => {
    setSincronizandoSankhya(true);
    setMensagemSyncSankhya(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-solicitacoes-compra-planner`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      }).then(r => r.json());
      if (res.ok) {
        setMensagemSyncSankhya({ ok: true, texto: `${res.registros_unicos} solicitações no Sankhya, ${res.upserts} atualizadas.` });
        await carregarSolicitacoes();
      } else {
        setMensagemSyncSankhya({ ok: false, texto: res.erro || 'Erro desconhecido.' });
      }
    } catch (err) {
      setMensagemSyncSankhya({ ok: false, texto: String(err.message || err) });
    }
    setSincronizandoSankhya(false);
  };

  const solicitacoesFiltradas = useMemo(() => {
    let lista = solicitacoes;
    if (filtroStatus === 'nao_solicitado') lista = lista.filter(s => !s.card_planner_solicitado);
    else if (filtroStatus === 'aguardando') lista = lista.filter(s => s.card_planner_solicitado && !s.card_planner_criado);
    else if (filtroStatus === 'criado') lista = lista.filter(s => s.card_planner_criado && !s.planner_excluido);
    else if (filtroStatus === 'excluido') lista = lista.filter(s => s.planner_excluido);
    if (filtroDataInicio) lista = lista.filter(s => s.data_solicitacao && s.data_solicitacao >= filtroDataInicio);
    if (filtroDataFim) lista = lista.filter(s => s.data_solicitacao && s.data_solicitacao <= filtroDataFim);
    if (buscaSolic.trim()) {
      const b = buscaSolic.toLowerCase();
      lista = lista.filter(s => String(s.numnota || '').includes(b) || String(s.numero_cotacao || '').includes(b) || (s.produto_descricao || '').toLowerCase().includes(b) || (s.nome_usuario || '').toLowerCase().includes(b) || (s.br || '').toLowerCase().includes(b) || (s.cliente_nome || '').toLowerCase().includes(b));
    }
    return lista;
  }, [solicitacoes, filtroStatus, filtroDataInicio, filtroDataFim, buscaSolic]);

  const marcarCardSolicitado = async (id) => {
    await supabase.from('solicitacoes_compra_planner').update({
      card_planner_solicitado: true,
      card_planner_solicitado_em: new Date().toISOString(),
    }).eq('id', id);
    await carregarSolicitacoes();
  };

  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('sem_op');
  const [sortCol, setSortCol] = useState('diasAberto');
  const [sortDir, setSortDir] = useState('desc');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [ultimoSync, setUltimoSync] = useState(null);
  const [drillBR, setDrillBR] = useState(null); // BR selecionado — mostra os itens dele
  const [tagsCatalogo, setTagsCatalogo] = useState([]);
  const [tagsPorBr, setTagsPorBr] = useState({}); // br -> [tag_id, ...]
  const [anotacoesPorBr, setAnotacoesPorBr] = useState({}); // br -> { observacao, data_referencia }
  const [novaTagNome, setNovaTagNome] = useState('');
  const [novaTagCor, setNovaTagCor] = useState('#e07a5f');
  const [salvandoAnotacao, setSalvandoAnotacao] = useState(false);

  const carregarEtiquetasEAnotacoes = useCallback(async () => {
    const [{ data: tags }, { data: vinculos }, { data: anotacoes }] = await Promise.all([
      supabase.from('monitoramento_op_tags').select('*').order('nome'),
      supabase.from('monitoramento_op_br_tags').select('*'),
      supabase.from('monitoramento_op_anotacoes').select('*'),
    ]);
    setTagsCatalogo(tags || []);
    const porBr = {};
    (vinculos || []).forEach(v => { if (!porBr[v.br]) porBr[v.br] = []; porBr[v.br].push(v.tag_id); });
    setTagsPorBr(porBr);
    const anotMap = {};
    (anotacoes || []).forEach(a => { anotMap[a.br] = a; });
    setAnotacoesPorBr(anotMap);
  }, []);

  useEffect(() => { carregarEtiquetasEAnotacoes(); }, [carregarEtiquetasEAnotacoes]);

  const criarNovaTag = async () => {
    if (!novaTagNome.trim()) return;
    const { error } = await supabase.from('monitoramento_op_tags').insert({ nome: novaTagNome.trim(), cor: novaTagCor });
    if (!error) { setNovaTagNome(''); await carregarEtiquetasEAnotacoes(); }
  };

  const alternarTagNoBr = async (br, tagId) => {
    const jaTem = (tagsPorBr[br] || []).includes(tagId);
    if (jaTem) {
      await supabase.from('monitoramento_op_br_tags').delete().eq('br', br).eq('tag_id', tagId);
    } else {
      await supabase.from('monitoramento_op_br_tags').insert({ br, tag_id: tagId });
    }
    await carregarEtiquetasEAnotacoes();
  };

  const salvarAnotacao = async (br, observacao, dataReferencia) => {
    setSalvandoAnotacao(true);
    await supabase.from('monitoramento_op_anotacoes').upsert(
      { br, observacao, data_referencia: dataReferencia || null, atualizado_em: new Date().toISOString() },
      { onConflict: 'br' }
    );
    await carregarEtiquetasEAnotacoes();
    setSalvandoAnotacao(false);
  };

  const [observacaoEdit, setObservacaoEdit] = useState('');
  const [dataEdit, setDataEdit] = useState('');
  useEffect(() => {
    if (drillBR) {
      const a = anotacoesPorBr[drillBR.br];
      setObservacaoEdit(a?.observacao || '');
      setDataEdit(a?.data_referencia || '');
    }
  }, [drillBR?.br]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    const TAMANHO_LOTE = 1000;
    let todas = [];
    let pagina = 0;
    while (true) {
      const { data, error } = await supabase.from('monitoramento_op_pedidos')
        .select('*')
        .order('data_pedido', { ascending: false })
        .range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
      if (error) { setErro(error.message); setLoading(false); return; }
      todas = todas.concat(data || []);
      if (!data || data.length < TAMANHO_LOTE) break;
      pagina += 1;
      if (pagina > 50) break;
    }
    setLinhas(todas);
    if (todas.length) setUltimoSync(todas[0].sincronizado_em);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const handleAtualizar = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sankhya-monitorar-op-pedidos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      }).then(r => r.json());
      if (res.ok) {
        setSyncStatus({ ok: true, message: `Analisado: ${res.total} itens de pedido · ${res.sem_op} sem OP · ${res.producao_generica} com produção genérica (últimos 180 dias).` });
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

  const fmtData = (iso) => !iso ? '—' : new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  const diasEmAberto = (iso) => !iso ? null : Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

  // Agrupa por BR — a "pior" situação entre os itens de um projeto define o status do projeto
  // inteiro (se pelo menos 1 item está 'sem_op', o projeto conta como 'sem_op', mesmo que os
  // outros itens estejam ok).
  const projetos = useMemo(() => {
    const semBR = linhas.filter(l => !l.br);
    const porBR = {};
    linhas.filter(l => l.br).forEach(l => {
      if (!porBR[l.br]) porBR[l.br] = { br: l.br, cliente: l.cliente_nome, itens: [], dataMaisAntiga: l.data_pedido };
      porBR[l.br].itens.push(l);
      if (l.data_pedido && (!porBR[l.br].dataMaisAntiga || l.data_pedido < porBR[l.br].dataMaisAntiga)) {
        porBR[l.br].dataMaisAntiga = l.data_pedido;
      }
    });

    const PRIORIDADE_STATUS = { sem_op: 0, producao_generica: 1, op_planejada: 2, em_producao: 3, servico: 4 };
    return {
      semBR: semBR.length,
      lista: Object.values(porBR).map(p => {
        // Itens de serviço não entram no cálculo do "pior status" — um projeto não deve
        // aparecer como "em produção" só porque tem um item de mão de obra, nem como
        // "sem OP" por causa de serviço (serviço nunca tem OP mesmo, é esperado).
        const itensProducao = p.itens.filter(i => i.status !== 'servico');
        const piorStatus = itensProducao.length
          ? itensProducao.reduce((pior, i) => PRIORIDADE_STATUS[i.status] < PRIORIDADE_STATUS[pior] ? i.status : pior, 'em_producao')
          : 'servico'; // projeto 100% serviço (ex: só mão de obra) — não é relevante pra análise de OP
        const itensSemOp = p.itens.filter(i => i.status === 'sem_op').length;
        return {
          br: p.br,
          cliente: p.cliente,
          totalItens: p.itens.length,
          itensSemOp,
          status: piorStatus,
          dataMaisAntiga: p.dataMaisAntiga,
          diasAberto: diasEmAberto(p.dataMaisAntiga),
          itens: [...p.itens].sort((a, b) => PRIORIDADE_STATUS[a.status] - PRIORIDADE_STATUS[b.status]),
        };
      }),
    };
  }, [linhas]);

  const filtrados = useMemo(() => {
    return projetos.lista
      .filter(p => statusFiltro === 'todos' || p.status === statusFiltro)
      .filter(p => !busca ||
        p.br.toLowerCase().includes(busca.toLowerCase()) ||
        (p.cliente || '').toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => {
        let va = a[sortCol] ?? 0, vb = b[sortCol] ?? 0;
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [projetos, busca, statusFiltro, sortCol, sortDir]);

  const kpis = useMemo(() => {
    const semOp = projetos.lista.filter(p => p.status === 'sem_op');
    return {
      totalProjetos: projetos.lista.length,
      semOp: semOp.length,
      producaoGenerica: projetos.lista.filter(p => p.status === 'producao_generica').length,
      opPlanejada: projetos.lista.filter(p => p.status === 'op_planejada').length,
      emProducao: projetos.lista.filter(p => p.status === 'em_producao').length,
      diasMedioSemOp: semOp.length ? Math.round(semOp.reduce((s, p) => s + (p.diasAberto || 0), 0) / semOp.length) : 0,
      semBR: projetos.semBR,
    };
  }, [projetos]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };
  const SortTh = ({ label, col, right }) => {
    const active = sortCol === col;
    return (
      <th onClick={() => handleSort(col)} style={{ ...thFat(0, right ? 'right' : 'left'), cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <span style={{ color: active ? T.terracotta : T.inkFaint }}>{label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
      </th>
    );
  };

  const statusInfo = (status) => ({
    em_producao:        { label: '✓ Em produção',         cor: T.oliveText, bg: T.oliveSoft },
    op_planejada:       { label: '◑ OP criada, não iniciada', cor: T.blueText, bg: T.blueSoft },
    producao_generica:  { label: '◐ Produção genérica',   cor: T.amberText, bg: T.amberSoft },
    sem_op:             { label: '⚠ Sem OP',               cor: T.rustText,  bg: T.rustSoft },
    servico:            { label: '— Serviço (N/A)',        cor: T.inkFaint,  bg: T.lineSoft },
  }[status] || { label: status, cor: T.inkFaint, bg: T.lineSoft });

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${T.line}` }}>
        {[{ id: 'op', label: 'Monitoramento de OP' }, { id: 'cotacao', label: `Cotação — Card no Planner${solicitacoes.filter(s => !s.card_planner_solicitado).length ? ` (${solicitacoes.filter(s => !s.card_planner_solicitado).length})` : ''}` }, { id: 'conhecimento_pronto', label: `Fluxo Conhecimento → OP${(cardsConhecPronto.filter(c => !c.data_finalizado).length + cardsOpsGeradas.filter(c => c.status_verificacao_op !== 'finalizado').length) ? ` (${cardsConhecPronto.filter(c => !c.data_finalizado).length + cardsOpsGeradas.filter(c => c.status_verificacao_op !== 'finalizado').length})` : ''}` }].map(aba => (
          <button key={aba.id} onClick={() => setAbaMonitoramento(aba.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, fontWeight: 600,
              color: abaMonitoramento === aba.id ? T.terracotta : T.inkFaint,
              borderBottom: `2px solid ${abaMonitoramento === aba.id ? T.terracotta : 'transparent'}`, marginBottom: -1,
            }}>
            {aba.label}
          </button>
        ))}
      </div>

      {abaMonitoramento === 'cotacao' && (
        <Panel subtitle="Solicitações de compra (Kaio.R e Alexandre.P) que precisam ter um Card criado no Microsoft Planner — clique em 'Marcar' e o Power Automate cria o card automaticamente. A lista atualiza sozinha a cada 15s."
          right={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <button onClick={sincronizarComSankhya} disabled={sincronizandoSankhya}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', opacity: sincronizandoSankhya ? 0.7 : 1 }}>
                <RefreshCw size={13} className={sincronizandoSankhya ? 'spin' : ''} />
                {sincronizandoSankhya ? 'Buscando…' : 'Sincronizar com Sankhya agora'}
              </button>
              {mensagemSyncSankhya && (
                <span style={{ fontSize: 10.5, color: mensagemSyncSankhya.ok ? T.oliveText : T.rustText }}>{mensagemSyncSankhya.texto}</span>
              )}
            </div>
          }>
          {solicitacoes.some(s => s.planner_excluido) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12.5, fontWeight: 600 }}>
              <AlertTriangle size={15} />
              {solicitacoes.filter(s => s.planner_excluido).length} card(s) foram excluídos no Planner depois de criados — verifique se foi intencional.
            </div>
          )}

          {/* Abas de status, com contagem de cada */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { id: 'todos', label: 'Todos', cor: T.inkDim, qtd: solicitacoes.length },
              { id: 'nao_solicitado', label: 'Sem Card pedido', cor: T.rustText, qtd: solicitacoes.filter(s => !s.card_planner_solicitado).length },
              { id: 'aguardando', label: 'Aguardando Power Automate', cor: T.amberText, qtd: solicitacoes.filter(s => s.card_planner_solicitado && !s.card_planner_criado).length },
              { id: 'criado', label: 'Criado', cor: T.oliveText, qtd: solicitacoes.filter(s => s.card_planner_criado && !s.planner_excluido).length },
              { id: 'excluido', label: 'Excluído', cor: T.rustText, qtd: solicitacoes.filter(s => s.planner_excluido).length },
            ].map(f => (
              <button key={f.id} onClick={() => setFiltroStatus(f.id)}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                  border: `1.5px solid ${filtroStatus === f.id ? f.cor : T.line}`,
                  background: filtroStatus === f.id ? f.cor : 'transparent',
                  color: filtroStatus === f.id ? '#fff' : f.cor,
                }}>
                {f.label} ({f.qtd})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={buscaSolic} onChange={e => setBuscaSolic(e.target.value)} placeholder="Buscar por número, BR, cliente, produto ou usuário…"
                style={{ ...inputStyle(), width: 300, paddingLeft: 28 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11.5, color: T.inkFaint }}>De:</span>
              <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} style={{ ...inputStyle(), fontSize: 12, padding: '5px 8px' }} />
              <span style={{ fontSize: 11.5, color: T.inkFaint }}>Até:</span>
              <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} style={{ ...inputStyle(), fontSize: 12, padding: '5px 8px' }} />
            </div>
            {(() => {
              const hoje = new Date().toISOString().slice(0, 10);
              const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
              return (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setFiltroDataInicio(hoje); setFiltroDataFim(hoje); }}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 5, border: `1px solid ${T.line}`, background: T.panelAlt, color: T.inkDim, cursor: 'pointer' }}>Hoje</button>
                  <button onClick={() => { setFiltroDataInicio(ontem); setFiltroDataFim(ontem); }}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 5, border: `1px solid ${T.line}`, background: T.panelAlt, color: T.inkDim, cursor: 'pointer' }}>Ontem</button>
                  {(filtroDataInicio || filtroDataFim) && (
                    <button onClick={() => { setFiltroDataInicio(''); setFiltroDataFim(''); }}
                      style={{ fontSize: 11, padding: '5px 10px', borderRadius: 5, border: `1px solid ${T.line}`, background: 'transparent', color: T.inkFaint, cursor: 'pointer' }}>Limpar data</button>
                  )}
                </div>
              );
            })()}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(90)}>Data</th>
                  <th style={thFat(100)}>Cotação nº</th>
                  <th style={thFat(80)}>Solicitação</th>
                  <th style={thFat(150)}>Tipo</th>
                  <th style={thFat(0)}>Produto</th>
                  <th style={{ ...thFat(70), textAlign: 'right' }}>Qtd</th>
                  <th style={thFat(100)}>Solicitante</th>
                  <th style={{ ...thFat(160), textAlign: 'center' }}>Card no Planner</th>
                </tr>
              </thead>
              <tbody>
                {loadingSolic ? (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                ) : solicitacoesFiltradas.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.oliveText, fontWeight: 600 }}>✓ Nada pendente por aqui.</td></tr>
                ) : solicitacoesFiltradas.map(s => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '8px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(s.data_solicitacao)}</td>
                    <td style={{ padding: '8px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.terracotta, fontSize: 13 }}>{s.numero_cotacao || '—'}</td>
                    <td style={{ padding: '8px 12px', color: T.inkFaint }}>{s.numnota}</td>
                    <td style={{ padding: '8px 12px', fontSize: 11, color: T.inkFaint }}>{(s.descricao_top || '').replace('SOLICITAÇÃO COMPRA ', '').replace('SOLICITAÇÃO DE COMPRA ', '')}</td>
                    <td style={{ padding: '8px 12px', maxWidth: 260 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.produto_descricao}>{s.produto_descricao || '—'}</div>
                      {s.observacao && (
                        <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.observacao}>
                          📝 {s.observacao.replace(/\n/g, ' · ')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{s.quantidade ?? '—'}</td>
                    <td style={{ padding: '8px 12px', color: T.inkDim }}>{(s.nome_usuario || '').replace('.R', '').replace('.P', '')}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      {s.planner_excluido ? (
                        <span title={`Excluído em ${fmtData(s.planner_excluido_em)}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: T.rustText, background: T.rustSoft, padding: '3px 8px', borderRadius: 4 }}>
                          <AlertTriangle size={11} /> Card excluído!
                        </span>
                      ) : s.card_planner_criado ? (
                        <span title={s.planner_titulo ? `"${s.planner_titulo}" · atualizado ${fmtData(s.planner_atualizado_em)}` : ''}
                          style={{ fontSize: 10.5, fontWeight: 700, color: T.oliveText, background: T.oliveSoft, padding: '3px 8px', borderRadius: 4 }}>
                          ✓ {STATUS_PLANNER_LABEL[s.planner_status] || 'Criado'}
                        </span>
                      ) : s.card_planner_solicitado ? (
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: T.amberText, background: T.amberSoft, padding: '3px 8px', borderRadius: 4 }}>Aguardando Power Automate</span>
                      ) : (
                        <button onClick={() => marcarCardSolicitado(s.id)}
                          style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer' }}>
                          Marcar pra criar Card
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {abaMonitoramento === 'conhecimento_pronto' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          {[{ id: 'cards', label: '🗂 Cards' }, { id: 'planilha', label: '📋 Planilha (estilo Backlog)' }].map(v => (
            <button key={v.id} onClick={() => setVisualizacaoConhecPronto(v.id)}
              style={{
                fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                border: `1.5px solid ${visualizacaoConhecPronto === v.id ? T.terracotta : T.line}`,
                background: visualizacaoConhecPronto === v.id ? T.terracotta : 'transparent',
                color: visualizacaoConhecPronto === v.id ? '#fff' : T.inkDim,
              }}>
              {v.label}
            </button>
          ))}
        </div>
      )}

      {abaMonitoramento === 'conhecimento_pronto' && visualizacaoConhecPronto === 'planilha' && (
        <Panel subtitle="Visão em tabela, no mesmo formato da planilha de Backlog que a Engenharia já usava — pra manter o mesmo controle de sempre.">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(90)}>PROJETO</th>
                  <th style={thFat(140)}>CLIENTE</th>
                  <th style={thFat(90)}>ABERTURA C.P.</th>
                  <th style={thFat(130)}>ETAPA</th>
                  <th style={thFat(90)}>DATA DE INÍCIO</th>
                  <th style={thFat(90)}>PREVISTA FINAL.</th>
                  <th style={thFat(90)}>REAL FINAL.</th>
                  <th style={thFat(120)}>PROJETISTA</th>
                  <th style={thFat(150)}>MOTIVO ATRASO</th>
                  <th style={thFat(0)}>OBS. / PENDÊNCIAS</th>
                </tr>
              </thead>
              <tbody>
                {[...cardsConhecPronto, ...cardsOpsGeradas.filter(o => !cardsConhecPronto.some(c => c.id === o.id))].length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nada por aqui.</td></tr>
                ) : [...cardsConhecPronto, ...cardsOpsGeradas.filter(o => !cardsConhecPronto.some(c => c.id === o.id))].map(c => {
                  const etapa = c.data_finalizado
                    ? (c.finalizado_com_duvida ? '⚠ Dúvidas Técnicas' : (c.status_verificacao_op === 'finalizado' ? '✓ Concluído' : "OP's Geradas"))
                    : c.data_iniciado ? 'Projeto em andamento'
                    : c.ciente_em ? 'Aguardando iniciar'
                    : c.visto_em ? 'Visto, aguardando ciência'
                    : 'Aguardando visualização';
                  return (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                      <td style={{ padding: '7px 10px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{c.br}</td>
                      <td style={{ padding: '7px 10px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.cliente_nome}>{c.cliente_nome || '—'}</td>
                      <td style={{ padding: '7px 10px', color: T.inkFaint }}>{c.data_abertura_cp ? fmtData(c.data_abertura_cp) : '—'}</td>
                      <td style={{ padding: '7px 10px' }}>{etapa}</td>
                      <td style={{ padding: '7px 10px', color: T.inkFaint }}>{c.data_iniciado ? fmtData(c.data_iniciado) : '—'}</td>
                      <td style={{ padding: '7px 10px', color: T.inkFaint }}>{c.data_prevista_finalizacao ? fmtData(c.data_prevista_finalizacao) : '—'}</td>
                      <td style={{ padding: '7px 10px', color: c.atrasou ? T.rustText : T.inkFaint, fontWeight: c.atrasou ? 700 : 400 }}>{c.data_finalizado ? fmtData(c.data_finalizado) : '—'}</td>
                      <td style={{ padding: '7px 10px' }}>{c.projetista || '—'}</td>
                      <td style={{ padding: '7px 10px', color: T.rustText, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.motivo_atraso}>{c.motivo_atraso || '—'}</td>
                      <td style={{ padding: '7px 10px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.observacao_duvida || c.pendencias}>{c.observacao_duvida || c.pendencias || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
            <span>{cardsConhecPronto.length + cardsOpsGeradas.filter(o => !cardsConhecPronto.some(c => c.id === o.id)).length} projetos</span>
            <BotaoExportar small onClick={() => exportCSV(
              [...cardsConhecPronto, ...cardsOpsGeradas.filter(o => !cardsConhecPronto.some(c => c.id === o.id))],
              'fluxo_conhecimento_op.csv',
              ['br', 'cliente_nome', 'data_abertura_cp', 'data_iniciado', 'data_prevista_finalizacao', 'data_finalizado', 'projetista', 'motivo_atraso', 'observacao_duvida', 'pendencias']
            )} />
          </div>
        </Panel>
      )}

      {abaMonitoramento === 'conhecimento_pronto' && visualizacaoConhecPronto === 'cards' && (
        <Panel subtitle="Cards na coluna 'Engenharia - Conhecimento Pronto' — clica em Iniciar quando começar o projeto, e Finalizar quando terminar. Ao finalizar, o card é movido automaticamente no Planner (via Power Automate).">
          {cardsTravados.length > 0 && (
            <div style={{ background: T.rustSoft, border: `1px solid ${T.rust}33`, borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={16} color={T.rustText} />
                <strong style={{ fontSize: 13, color: T.rustText }}>{cardsTravados.length} card(s) travado(s) — pediu pra mover mas o card ainda não chegou no destino há mais de 1,5 dia</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {cardsTravados.map(t => (
                  <div key={t.solicitacao_id} style={{ fontSize: 12, color: T.inkDim }}>
                    <strong style={{ fontFamily: FONT_DISPLAY, color: T.blueText }}>{t.br}</strong> — devia estar em "<strong>{t.bucket_destino}</strong>", mas ainda está em "{t.bucket_atual || '?'}" (pedido há {fmtHoras(t.horas_desde_solicitacao)})
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loadingConhecPronto ? (
              <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint }}>Carregando…</div>
            ) : cardsConhecPronto.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: T.inkFaint, fontSize: 13 }}>Nenhum card nessa coluna no momento.</div>
            ) : cardsConhecPronto.map(c => (
              <div key={c.id} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, color: T.blueText }}>{c.br}</span>
                    {c.cliente_nome && <span style={{ fontSize: 12, fontWeight: 400, color: T.inkDim }}> — {c.cliente_nome}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: T.inkDim, marginTop: 2 }}>{c.planner_titulo}</div>
                  <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 4 }}>
                    {c.data_abertura_cp && `Aberto em ${fmtData(c.data_abertura_cp)} · `}
                    {c.visto_em && `👁 Visto em ${fmtData(c.visto_em)} (${c.visto_por || '?'}) · `}
                    {c.ciente_em && `✓ Ciente em ${fmtData(c.ciente_em)} (${c.ciente_por || '?'}) · `}
                    {c.data_iniciado ? `Iniciado em ${fmtData(c.data_iniciado)}${c.iniciado_por ? ` por ${c.iniciado_por}` : ''}` : c.ciente_em ? 'Aguardando iniciar' : c.visto_em ? 'Visto, aguardando confirmação' : 'Ainda não visto'}
                    {c.projetista && ` · Projetista: ${c.projetista}`}
                    {c.data_prevista_finalizacao && ` · Previsto: ${fmtData(c.data_prevista_finalizacao)}`}
                    {c.data_finalizado && ` · Finalizado em ${fmtData(c.data_finalizado)} · Tempo: ${fmtHoras(c.horas_gastas)}`}
                    {c.atrasou && <span style={{ color: T.rustText, fontWeight: 700 }}> · ⚠ Atrasou</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {c.data_finalizado ? (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: c.finalizado_com_duvida ? T.amberText : T.oliveText, background: c.finalizado_com_duvida ? T.amberSoft : T.oliveSoft, padding: '4px 10px', borderRadius: 4 }}>
                      {c.finalizado_com_duvida ? '⚠ Enviado p/ Dúvidas Técnicas' : "✓ Enviado p/ OP's Geradas"}
                    </span>
                  ) : !c.ciente_em ? (
                    <button onClick={() => marcarCienteDemanda(c)} disabled={processandoCard === c.id}
                      style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.inkDim, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', opacity: processandoCard === c.id ? 0.6 : 1 }}>
                      {processandoCard === c.id ? 'Confirmando…' : '👁 Ciente da Demanda'}
                    </button>
                  ) : !c.data_iniciado ? (
                    <button onClick={() => setModalIniciar(c)}
                      style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.blueText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                      ▶ Iniciar Projeto
                    </button>
                  ) : (
                    <button onClick={() => setModalFinalizar(c)}
                      style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                      ✓ Finalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {modalIniciar && (
        <Overlay onClose={() => setModalIniciar(null)}>
          <div className="scale-in" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 440, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,.18)' }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>Iniciar {modalIniciar.br}</h3>
            <p style={{ fontSize: 12.5, color: T.inkFaint, margin: '0 0 16px' }}>Só pra registrar direitinho o acompanhamento:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Data prevista de finalização</label>
                <input id="input-data-prevista" type="date" style={{ ...inputStyle(), width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: T.inkDim, display: 'block', marginBottom: 4 }}>Projetista responsável</label>
                <input id="input-projetista" type="text" defaultValue={currentUser?.nome || ''} placeholder="Nome de quem vai fazer" style={{ ...inputStyle(), width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={() => iniciarProjeto(modalIniciar, document.getElementById('input-data-prevista').value, document.getElementById('input-projetista').value)}
                disabled={processandoCard === modalIniciar.id}
                style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: T.blueText, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer' }}>
                {processandoCard === modalIniciar.id ? 'Iniciando…' : '▶ Iniciar'}
              </button>
              <button onClick={() => setModalIniciar(null)}
                style={{ fontSize: 12.5, fontWeight: 600, color: T.inkFaint, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {modalFinalizar && (() => {
        const hoje = new Date().toISOString().slice(0, 10);
        const estaAtrasado = modalFinalizar.data_prevista_finalizacao && hoje > modalFinalizar.data_prevista_finalizacao;
        return (
        <Overlay onClose={() => setModalFinalizar(null)}>
          <div className="scale-in" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 460, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,.18)' }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>Finalizar {modalFinalizar.br}</h3>
            <p style={{ fontSize: 12.5, color: T.inkFaint, margin: '0 0 16px' }}>Como foi essa etapa?</p>
            {estaAtrasado && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: T.rustText, display: 'block', marginBottom: 4 }}>⚠ Passou da data prevista ({fmtData(modalFinalizar.data_prevista_finalizacao)}) — motivo do atraso:</label>
                <textarea id="input-motivo-atraso" rows={2} style={{ ...inputStyle(), width: '100%', resize: 'vertical' }} placeholder="Ex: aguardou retorno do cliente…" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => finalizarProjeto(modalFinalizar, false, null, estaAtrasado ? document.getElementById('input-motivo-atraso').value : null)} disabled={processandoCard === modalFinalizar.id}
                style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' }}>
                ✓ Finalizado normalmente — mover pra "OP's Geradas"
              </button>
              <button onClick={() => {
                const obs = prompt('Descreve rapidamente a dúvida técnica (opcional):') || '';
                finalizarProjeto(modalFinalizar, true, obs, estaAtrasado ? document.getElementById('input-motivo-atraso')?.value : null);
              }} disabled={processandoCard === modalFinalizar.id}
                style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: T.amberText, border: 'none', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' }}>
                ⚠ Tem dúvida técnica — mover pra "Dúvidas Técnicas"
              </button>
              <button onClick={() => setModalFinalizar(null)}
                style={{ fontSize: 12.5, fontWeight: 600, color: T.inkFaint, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer', marginTop: 4 }}>
                Cancelar
              </button>
            </div>
          </div>
        </Overlay>
        );
      })()}

      {abaMonitoramento === 'conhecimento_pronto' && visualizacaoConhecPronto === 'cards' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 4px' }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: 0.5 }}>Etapa 2 — Verificação de OP's Geradas</span>
            <div style={{ flex: 1, height: 1, background: T.line }} />
          </div>
          {cardsOpsGeradas.filter(c => c.status_verificacao_op !== 'finalizado' && (opsPorBr[c.br] || []).length === 0 && c.bucket_atualizado_em && (Date.now() - new Date(c.bucket_atualizado_em).getTime()) > 1.5 * 24 * 3600 * 1000).length > 0 && (
            <div style={{ background: T.rustSoft, border: `1px solid ${T.rust}33`, borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color={T.rustText} />
                <strong style={{ fontSize: 13, color: T.rustText }}>
                  {cardsOpsGeradas.filter(c => c.status_verificacao_op !== 'finalizado' && (opsPorBr[c.br] || []).length === 0 && c.bucket_atualizado_em && (Date.now() - new Date(c.bucket_atualizado_em).getTime()) > 1.5 * 24 * 3600 * 1000).length} BR(s) em "OP's Geradas" há mais de 1,5 dia sem nenhuma OP sincronizada ainda — vale conferir se está tudo certo
                </strong>
              </div>
            </div>
          )}
        </>
      )}

      {abaMonitoramento === 'conhecimento_pronto' && visualizacaoConhecPronto === 'cards' && (
        <Panel subtitle="Cards na coluna 'OP's Geradas' — confira as OPs que já existem pra esse BR (pode ter mais de uma) antes de decidir finalizar. Só você decide quando está completo — o sistema nunca fecha isso sozinho.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loadingOpsGeradas ? (
              <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint }}>Carregando…</div>
            ) : cardsOpsGeradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: T.inkFaint, fontSize: 13 }}>Nenhum card nessa coluna no momento.</div>
            ) : cardsOpsGeradas.map(c => {
              const ops = opsPorBr[c.br] || [];
              const tempo = tempoAoVivo(c);
              return (
                <div key={c.id} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}><span style={{ fontFamily: FONT_DISPLAY, color: T.blueText }}>{c.br}</span></div>
                      <div style={{ fontSize: 12, color: T.inkDim, marginTop: 2 }}>{c.planner_titulo}</div>
                    </div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: c.status_verificacao_op === 'em_andamento' ? T.terracotta : T.inkFaint }}>
                      {fmtCronometro(tempo)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11.5, color: T.inkFaint, fontWeight: 600 }}>OPs encontradas pra esse BR:</span>
                    {ops.length === 0 ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: T.amberText, background: T.amberSoft, padding: '3px 8px', borderRadius: 4 }}>⚠ Nenhuma OP sincronizada ainda</span>
                    ) : ops.map(op => (
                      <span key={op} style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT_DISPLAY, color: T.oliveText, background: T.oliveSoft, padding: '3px 9px', borderRadius: 4 }}>{op}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: `1px solid ${T.lineSoft}`, paddingTop: 10, flexWrap: 'wrap' }}>
                    {c.status_verificacao_op === 'nao_iniciado' && (
                      <button onClick={() => iniciarOuRetomarVerificacao(c)}
                        style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.blueText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                        ▶ Iniciar
                      </button>
                    )}
                    {c.status_verificacao_op === 'em_andamento' && (
                      <button onClick={() => pausarVerificacao(c)}
                        style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.amberText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                        ⏸ Pausar
                      </button>
                    )}
                    {c.status_verificacao_op === 'pausado' && (
                      <button onClick={() => iniciarOuRetomarVerificacao(c)}
                        style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.blueText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                        ▶ Retomar
                      </button>
                    )}
                    {(c.status_verificacao_op === 'em_andamento' || c.status_verificacao_op === 'pausado') && (
                      <>
                        <button onClick={() => finalizarVerificacao(c)}
                          style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                          ✓ Finalizar
                        </button>
                        <button onClick={() => setModalPendencia(c)}
                          style={{ fontSize: 12, fontWeight: 600, color: T.rustText, background: 'transparent', border: `1px solid ${T.rust}55`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>
                          ⚠ Sinalizar pendência
                        </button>
                      </>
                    )}
                    {c.status_verificacao_op === 'pendencia' && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: T.rustText, background: T.rustSoft, padding: '4px 10px', borderRadius: 4 }}>⚠ Movido pra Dúvidas Técnicas</span>
                    )}
                    {c.status_verificacao_op === 'finalizado' && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: T.oliveText, background: T.oliveSoft, padding: '4px 10px', borderRadius: 4 }}>✓ Finalizado — movido pra Finaliza processo</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {modalPendencia && (
        <Overlay onClose={() => setModalPendencia(null)}>
          <div className="scale-in" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 460, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,.18)' }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>Sinalizar pendência — {modalPendencia.br}</h3>
            <p style={{ fontSize: 12.5, color: T.inkFaint, margin: '0 0 16px' }}>Descreve rapidamente o que está pendente:</p>
            <textarea id="obs-pendencia-textarea" rows={3} placeholder="Ex: falta confirmar quantidade com o cliente…"
              style={{ ...inputStyle(), width: '100%', resize: 'vertical', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => sinalizarPendencia(modalPendencia, document.getElementById('obs-pendencia-textarea').value)}
                style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: T.rustText, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer' }}>
                Confirmar e mover
              </button>
              <button onClick={() => setModalPendencia(null)}
                style={{ fontSize: 12.5, fontWeight: 600, color: T.inkFaint, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {abaMonitoramento === 'cards_br_op' && (
        <>
          {candidatosObs.length > 0 && (
            <Panel subtitle="Achamos OP nova pra esses BR — nada é escrito no Planner sem você confirmar aqui, um por um.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {candidatosObs.map(c => (
                  <div key={c.planner_task_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: T.oliveSoft, borderRadius: 8, padding: '10px 14px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{c.br}</span>
                      <span style={{ color: T.inkFaint, fontSize: 12 }}> · {c.planner_titulo}</span>
                      <div style={{ fontSize: 12, marginTop: 2 }}>Adicionar na observação: <strong style={{ fontFamily: FONT_DISPLAY }}>OP: {c.ops_encontradas}</strong></div>
                    </div>
                    <button onClick={() => confirmarAdicionarOp(c)} disabled={confirmandoObs === c.planner_task_id}
                      style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', opacity: confirmandoObs === c.planner_task_id ? 0.6 : 1 }}>
                      {confirmandoObs === c.planner_task_id ? 'Confirmando…' : '✓ Confirmar e adicionar'}
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          )}
          <Panel subtitle="Cards do quadro 'Gestão Comercial' no Planner — o BR vem do título, a OP vem da observação (preenchida depois pelos meninos). Aqui dá pra ver quem ainda não teve a OP preenchida.">
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={buscaCardBrOp} onChange={e => setBuscaCardBrOp(e.target.value)} placeholder="Buscar por BR, OP ou título…"
                style={{ ...inputStyle(), width: 260, paddingLeft: 28 }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'sem_op', label: `⚠ Sem OP (${cardsBrOp.filter(c => !c.op || !c.op.trim()).length})`, cor: T.amberText },
                { id: 'com_op', label: `✓ Com OP (${cardsBrOp.filter(c => c.op && c.op.trim()).length})`, cor: T.oliveText },
                { id: 'todos', label: `Todos (${cardsBrOp.length})`, cor: T.inkDim },
              ].map(f => (
                <button key={f.id} onClick={() => setFiltroCardBrOp(f.id)}
                  style={{
                    fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                    border: `1.5px solid ${filtroCardBrOp === f.id ? f.cor : T.line}`,
                    background: filtroCardBrOp === f.id ? f.cor : 'transparent',
                    color: filtroCardBrOp === f.id ? '#fff' : f.cor,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(110)}>BR</th>
                  <th style={thFat(0)}>Título do card</th>
                  <th style={thFat(110)}>OP(s)</th>
                  <th style={thFat(150)}>Coluna atual</th>
                  <th style={thFat(130)}>Última mudança</th>
                </tr>
              </thead>
              <tbody>
                {loadingCardsBrOp ? (
                  <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
                ) : cardsBrOpFiltrados.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: T.oliveText, fontWeight: 600 }}>✓ Nada encontrado.</td></tr>
                ) : cardsBrOpFiltrados.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{c.br}</td>
                    <td style={{ padding: '9px 12px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.planner_titulo}>{c.planner_titulo}</td>
                    <td style={{ padding: '9px 12px' }}>
                      {c.op && c.op.trim() ? (
                        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{c.op}</span>
                      ) : (
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: T.amberText, background: T.amberSoft, padding: '3px 8px', borderRadius: 4 }}>⚠ Pendente</span>
                      )}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.inkDim, background: T.panelAlt, padding: '3px 8px', borderRadius: 4 }}>{c.bucket_atual || '—'}</span>
                    </td>
                    <td style={{ padding: '9px 12px', color: T.inkFaint, fontSize: 11 }}>{c.bucket_atualizado_em ? fmtData(c.bucket_atualizado_em) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between' }}>
            <span>{cardsBrOpFiltrados.length} cards</span>
            <BotaoExportar small onClick={() => exportCSV(cardsBrOpFiltrados, 'cards_br_op.csv', ['br', 'planner_titulo', 'op', 'bucket_atual', 'bucket_atualizado_em'])} />
          </div>
        </Panel>
        </>
      )}

      {abaMonitoramento === 'op' && (<>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 280 }}>
          Verifica, por <strong>projeto (BR)</strong>, se todos os itens pedidos têm Ordem de Produção
          vinculada no Sankhya — em três níveis: 1) a OP existe e a produção já foi iniciada, 2) a OP existe
          mas a produção ainda não começou, ou 3) não existe OP nem produção próxima do mesmo produto
          (pode ser produção pra estoque, vendida depois). Itens de <strong>serviço</strong> (mão de obra
          etc.) nunca passam por produção interna — ficam numa categoria própria, fora dessa análise. Um
          projeto entra como <strong>"Sem OP"</strong> se pelo menos um item (não-serviço) dele não tiver
          nada disso — clique num projeto pra ver quais itens específicos estão pendentes. Cobre os
          últimos 180 dias.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
          <button onClick={handleAtualizar} disabled={syncing} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: T.terracotta, color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, opacity: syncing ? 0.7 : 1, flexShrink: 0,
          }}>
            <RefreshCw size={15} className={syncing ? 'spin' : ''} />
            {syncing ? 'Analisando… (pode levar 1min)' : 'Atualizar do Sankhya'}
          </button>
          <BotaoAbrirTelaSankhya tela="ordensProducao" label="Abrir tela de OPs no Sankhya (buscar manual)" />
        </div>
      </div>

      {syncStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
          background: syncStatus.ok ? T.oliveSoft : T.rustSoft, border: `1px solid ${syncStatus.ok ? T.olive : T.rust}33`,
        }}>
          {syncStatus.ok ? <CheckCircle2 size={14} color={T.oliveText} /> : <AlertTriangle size={14} color={T.rustText} />}
          <span style={{ fontSize: 12.5, color: syncStatus.ok ? T.oliveText : T.rustText }}>{syncStatus.message}</span>
        </div>
      )}

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
        <Kpi label="Projetos analisados" value={loading ? '…' : kpis.totalProjetos} icon={Package} tone="blue"
          sub="últimos 180 dias · com BR vinculado" />
        <Kpi label="Sem OP (risco real)" value={loading ? '…' : kpis.semOp} icon={AlertTriangle} tone="rust"
          sub="pelo menos 1 item sem nenhuma produção nem OP criada" />
        <Kpi label="Só produção genérica" value={loading ? '…' : kpis.producaoGenerica} icon={Clock3} tone="amber"
          sub="produção próxima encontrada, mas sem OP formal criada" />
        <Kpi label="OP criada, não iniciada" value={loading ? '…' : kpis.opPlanejada} icon={Gauge}
          sub="a OP existe no Sankhya, mas a produção ainda não começou" />
        <Kpi label="Em produção" value={loading ? '…' : kpis.emProducao} icon={CheckCircle2} tone="olive"
          sub="OP criada e produção já iniciada" />
      </div>

      {kpis.semOp > 0 && (
        <div style={{ fontSize: 11.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '8px 14px' }}>
          Média de {kpis.diasMedioSemOp} dia{kpis.diasMedioSemOp !== 1 ? 's' : ''} em aberto entre os projetos "Sem OP".
        </div>
      )}

      {kpis.semBR > 0 && (
        <div style={{ fontSize: 11.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '8px 14px' }}>
          {kpis.semBR} item{kpis.semBR !== 1 ? 's' : ''} sem BR vinculado no Sankhya (não entram na contagem por projeto acima).
        </div>
      )}

      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FiltroCampoFat label="Buscar BR ou cliente">
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
                <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: BR14331, Vale…"
                  style={{ ...selectStyleFat(260), paddingLeft: 28 }} />
              </div>
            </FiltroCampoFat>
            <FiltroCampoFat label="Status">
              <div style={{ position: 'relative' }}>
                <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} style={selectStyleFat(240)}>
                  <option value="sem_op">⚠ Sem OP (risco real)</option>
                  <option value="producao_generica">◐ Só produção genérica</option>
                  <option value="op_planejada">◑ OP criada, não iniciada</option>
                  <option value="em_producao">✓ Em produção</option>
                  <option value="servico">— Só serviço (N/A)</option>
                  <option value="todos">Todos</option>
                </select>
                <ChevronDown size={13} style={chevronStyleFat} />
              </div>
            </FiltroCampoFat>
          </div>
          {ultimoSync && <div style={{ fontSize: 11, color: T.inkFaint }}>Última análise: {new Date(ultimoSync).toLocaleString('pt-BR')}</div>}
        </div>
      </Panel>

      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <SortTh label="BR" col="br" />
                <th style={thFat(0)}>Cliente</th>
                <SortTh label="Itens sem OP" col="itensSemOp" right />
                <SortTh label="Total de itens" col="totalItens" right />
                <SortTh label="Pedido mais antigo" col="dataMaisAntiga" />
                <SortTh label="Dias aberto" col="diasAberto" right />
                <th style={{ ...thFat(190), textAlign: 'center' }}>Status</th>
                <th style={thFat(160)}>Etiquetas / Observação</th>
                <th style={{ ...thFat(90), textAlign: 'center' }}>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: T.oliveText, fontWeight: 600 }}>✓ Nenhum projeto encontrado com esse filtro.</td></tr>
              ) : filtrados.map(p => {
                const st = statusInfo(p.status);
                const tagsDoBr = (tagsPorBr[p.br] || []).map(id => tagsCatalogo.find(t => t.id === id)).filter(Boolean);
                const anotacao = anotacoesPorBr[p.br];
                return (
                  <tr key={p.br} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: p.status === 'sem_op' && p.diasAberto > 30 ? T.rustSoft : 'transparent', cursor: 'pointer' }}
                    onClick={() => setDrillBR(p)}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = (p.status === 'sem_op' && p.diasAberto > 30) ? T.rustSoft : 'transparent'}>
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, whiteSpace: 'nowrap' }}>{p.br}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.cliente}>{p.cliente || '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: p.itensSemOp > 0 ? T.rustText : T.inkFaint }}>{p.itensSemOp || '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: T.inkDim }}>{p.totalItens}</td>
                    <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(p.dataMaisAntiga)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: p.diasAberto > 30 ? T.rustText : T.inkDim }}>{p.diasAberto ?? '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: st.cor, background: st.bg, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: anotacao?.observacao ? 4 : 0 }}>
                        {tagsDoBr.map(tag => (
                          <span key={tag.id} style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', background: tag.cor, padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap' }}>{tag.nome}</span>
                        ))}
                      </div>
                      {anotacao?.observacao && (
                        <div style={{ fontSize: 10.5, color: T.inkFaint, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={anotacao.observacao}>
                          📝 {anotacao.observacao}{anotacao.data_referencia ? ` (${fmtData(anotacao.data_referencia)})` : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <button onClick={(e) => { e.stopPropagation(); setDrillBR(p); }}
                        style={{ fontSize: 11, color: T.blueText, background: T.blueSoft, border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                        Ver itens
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{filtrados.length} projeto{filtrados.length !== 1 ? 's' : ''} · linhas em vermelho = "Sem OP" há mais de 30 dias</span>
          <BotaoExportar small onClick={() => exportCSV(filtrados.map(p => ({ ...p, itens: p.itens.map(i => `${i.cod_produto} (${i.status})`).join(' | ') })), 'monitoramento_op_por_projeto.csv',
            ['br','cliente','itensSemOp','totalItens','dataMaisAntiga','diasAberto','status','itens'])} />
        </div>
      </div>

      {/* Modal: itens do projeto selecionado */}
      {drillBR && (
        <Overlay onClose={() => setDrillBR(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 720,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: T.ink }}>{drillBR.br}</div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{drillBR.cliente} · {drillBR.totalItens} item{drillBR.totalItens !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => setDrillBR(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={18} /></button>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                    <th style={thFat(0)}>Produto</th>
                    <th style={{ ...thFat(70), textAlign: 'right' }}>Qtd</th>
                    <th style={thFat(100)}>Data pedido</th>
                    <th style={{ ...thFat(90), textAlign: 'center' }}>Nº OP</th>
                    <th style={{ ...thFat(170), textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drillBR.itens.map((it, i) => {
                    const st = statusInfo(it.status);
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontWeight: 600 }}>{it.cod_produto} — {it.produto_descricao}</div>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY }}>{it.quantidade}</td>
                        <td style={{ padding: '9px 12px', color: T.inkFaint, whiteSpace: 'nowrap' }}>{fmtData(it.data_pedido)}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{it.nro_ordem_producao || '—'}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: st.cor, background: st.bg, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── ETIQUETAS + OBSERVAÇÃO ────────────────────────────────── */}
            <div style={{ borderTop: `1px solid ${T.line}`, padding: '16px 22px', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Etiquetas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {tagsCatalogo.map(tag => {
                  const marcado = (tagsPorBr[drillBR.br] || []).includes(tag.id);
                  return (
                    <button key={tag.id} onClick={() => alternarTagNoBr(drillBR.br, tag.id)}
                      style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 12, cursor: 'pointer',
                        border: `1.5px solid ${tag.cor}`, background: marcado ? tag.cor : 'transparent', color: marcado ? '#fff' : tag.cor,
                      }}>
                      {marcado ? '✓ ' : '+ '}{tag.nome}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16 }}>
                <input value={novaTagNome} onChange={e => setNovaTagNome(e.target.value)} placeholder="Nova etiqueta…"
                  style={{ ...inputStyle(), fontSize: 12, flex: 1, padding: '6px 10px' }} />
                <input type="color" value={novaTagCor} onChange={e => setNovaTagCor(e.target.value)}
                  style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 6, padding: 2, cursor: 'pointer' }} />
                <button onClick={criarNovaTag} style={{ ...ghostBtn(T.inkFaint), padding: '6px 12px', fontSize: 12 }}>Criar</button>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Observação</div>
              <textarea rows={3} value={observacaoEdit} onChange={e => setObservacaoEdit(e.target.value)}
                placeholder="Ex: aguardando retorno do cliente sobre o desenho técnico — cobrar comercial se não voltar até a data abaixo."
                style={{ ...inputStyle(), fontSize: 12.5, width: '100%', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11.5, color: T.inkFaint }}>Retomar em:</span>
                  <input type="date" value={dataEdit || ''} onChange={e => setDataEdit(e.target.value)}
                    style={{ ...inputStyle(), fontSize: 12, padding: '5px 8px' }} />
                </div>
                <button onClick={() => salvarAnotacao(drillBR.br, observacaoEdit, dataEdit)} disabled={salvandoAnotacao}
                  style={{ ...solidBtn(T.terracotta, true), marginLeft: 'auto', opacity: salvandoAnotacao ? 0.7 : 1 }}>
                  {salvandoAnotacao ? 'Salvando…' : 'Salvar observação'}
                </button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
      </>)}
    </div>
  );
}

function FilaAtendimentoAlmoxarifado({ currentUser }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaStatus, setAbaStatus] = useState('pendente'); // pendente | atendido | todos
  const [necessidadeItem, setNecessidadeItem] = useState({}); // solicitacao_id -> gerou nova necessidade
  const [pendenteItem, setPendenteItem] = useState({}); // solicitacao_id -> material pendente
  const [atendendo, setAtendendo] = useState(null); // id em processamento no momento

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('solicitacoes_movimentacao_almoxarifado').select('*').order('solicitado_em', { ascending: true }).limit(200);
    setSolicitacoes(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => {
    const id = setInterval(() => carregar(), 20000);
    return () => clearInterval(id);
  }, [carregar]);

  const filtradas = useMemo(() => {
    if (abaStatus === 'todos') return solicitacoes;
    return solicitacoes.filter(s => s.status === abaStatus);
  }, [solicitacoes, abaStatus]);

  const marcarAtendido = async (solic) => {
    setAtendendo(solic.id);
    const registroMov = {
      carimbo_data_hora: new Date().toISOString(),
      projeto: (solic.br || '').replace(/^BR/, ''),
      op: solic.op,
      material: solic.material,
      setor: solic.tipo === 'para_estoque' ? 'Ponto de Estoque' : solic.setor_destino,
      gerou_nova_necessidade: necessidadeItem[solic.id] || null,
      material_pendente: pendenteItem[solic.id] || null,
      observacao: solic.quantidade_solicitada ? `Quantidade entregue: ${solic.quantidade_solicitada} (de ${solic.quantidade_total_prevista ?? '?'} total)` : null,
      origem: 'manual',
      br_normalizado: solic.br,
    };
    const { data: movInserida, error } = await supabase.from('almoxarifado_movimentacoes').insert(registroMov).select().single();
    if (!error && movInserida) {
      await supabase.from('solicitacoes_movimentacao_almoxarifado').update({
        status: 'atendido',
        atendido_por: currentUser?.nome || null,
        atendido_em: new Date().toISOString(),
        movimentacao_id: movInserida.id,
      }).eq('id', solic.id);
    }
    setAtendendo(null);
    await carregar();
  };

  const cancelarSolicitacao = async (solic) => {
    await supabase.from('solicitacoes_movimentacao_almoxarifado').update({ status: 'cancelado' }).eq('id', solic.id);
    await carregar();
  };

  const fmtDataHora = (iso) => !iso ? '—' : new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Aqui aparecem os pedidos da coordenação — vai buscar/entregar o material de verdade e clica em <strong>"Confirmar atendimento"</strong> quando terminar.
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${T.line}` }}>
        {[
          { id: 'pendente', label: `Aguardando (${solicitacoes.filter(s => s.status === 'pendente').length})` },
          { id: 'atendido', label: 'Já atendidas' },
          { id: 'todos', label: 'Todas' },
        ].map(aba => (
          <button key={aba.id} onClick={() => setAbaStatus(aba.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 13, fontWeight: 600,
              color: abaStatus === aba.id ? T.terracotta : T.inkFaint,
              borderBottom: `2px solid ${abaStatus === aba.id ? T.terracotta : 'transparent'}`, marginBottom: -1,
            }}>
            {aba.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint }}>Carregando…</div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.oliveText, fontWeight: 600, fontSize: 13 }}>✓ Nada por aqui.</div>
        ) : filtradas.map(s => (
          <div key={s.id} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>
                  <span style={{ fontFamily: FONT_DISPLAY, color: T.blueText }}>{s.br}</span> · OP {s.op}
                </div>
                <div style={{ fontSize: 12.5, color: T.inkDim, marginTop: 2 }}>{s.material}</div>
                <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>
                  Levar pra: <strong style={{ color: T.terracotta }}>{s.tipo === 'para_estoque' ? 'Ponto de Estoque' : s.setor_destino}</strong>
                  {s.quantidade_solicitada ? ` · Qtd: ${s.quantidade_solicitada}` : ''}
                  {s.quantidade_total_prevista ? ` (de ${s.quantidade_total_prevista} total)` : ''}
                </div>
                <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>
                  Pedido por {s.solicitado_por || '—'} em {fmtDataHora(s.solicitado_em)}
                  {s.status === 'atendido' && ` · Atendido por ${s.atendido_por || '—'} em ${fmtDataHora(s.atendido_em)}`}
                </div>
              </div>
              {s.status === 'pendente' && (
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.amberText, background: T.amberSoft, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>Aguardando</span>
              )}
              {s.status === 'atendido' && (
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.oliveText, background: T.oliveSoft, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>✓ Atendido</span>
              )}
              {s.status === 'cancelado' && (
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.inkFaint, background: T.lineSoft, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>Cancelado</span>
              )}
            </div>

            {s.status === 'pendente' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${T.lineSoft}`, paddingTop: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <select value={necessidadeItem[s.id] || ''} onChange={e => setNecessidadeItem(n => ({ ...n, [s.id]: e.target.value }))}
                      style={{ ...inputStyle(), fontSize: 10.5, padding: '4px 22px 4px 8px', appearance: 'none', color: necessidadeItem[s.id] ? T.rustText : T.inkFaint }}>
                      <option value="">Sem problema (padrão)</option>
                      <option value="KDB Controle perda, Divergência do Projeto">⚠ Divergência do Projeto</option>
                      <option value="KDB Controle perda, Perca Processo Produtivo">⚠ Perca Processo Produtivo</option>
                      <option value="KDB Controle perda, Serviço">⚠ Serviço</option>
                    </select>
                    <ChevronDown size={10} style={{ position: 'absolute', right: 6, top: 8, color: T.inkFaint, pointerEvents: 'none' }} />
                  </div>
                  <input placeholder="Material pendente? (ex: Falta Compra)" value={pendenteItem[s.id] || ''}
                    onChange={e => setPendenteItem(p => ({ ...p, [s.id]: e.target.value }))}
                    style={{ ...inputStyle(), fontSize: 10.5, padding: '4px 8px', flex: 1, minWidth: 160 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => marcarAtendido(s)} disabled={atendendo === s.id}
                    style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', opacity: atendendo === s.id ? 0.6 : 1 }}>
                    {atendendo === s.id ? 'Confirmando…' : '✓ Confirmar atendimento'}
                  </button>
                  <button onClick={() => cancelarSolicitacao(s)} disabled={atendendo === s.id}
                    style={{ fontSize: 12, fontWeight: 600, color: T.inkFaint, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AcompanhamentoServico() {
  const [linhas, setLinhas] = useState([]); // uma por BR: { br, cliente, itensServicoPendentes: [...], valorPendente, dataPedidoMaisAntiga }
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [sortCol, setSortCol] = useState('diasAberto');
  const [sortDir, setSortDir] = useState('desc');
  const [detalhe, setDetalhe] = useState(null);
  const [exclusoes, setExclusoes] = useState({}); // br -> { motivo, excluido_por, excluido_em }
  const [modalExcluir, setModalExcluir] = useState(null); // br sendo excluído agora

  const ehServico = (descricao) => (descricao || '').toUpperCase().includes('SERVIÇO') || (descricao || '').toUpperCase().includes('SERVICO');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    // Busca em lotes pra evitar limite de linhas do Supabase (~1000 por resposta).
    const buscarTudoEmLotes = async (tabela, campos, filtros) => {
      const TAMANHO_LOTE = 1000;
      let resultado = [];
      let pagina = 0;
      while (true) {
        let q = supabase.from(tabela).select(campos);
        if (filtros) q = filtros(q);
        const { data, error } = await q.range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
        if (error) throw error;
        resultado = resultado.concat(data || []);
        if (!data || data.length < TAMANHO_LOTE) break;
        pagina += 1;
        if (pagina > 50) break;
      }
      return resultado;
    };

    try {
      // 1) TODOS os pedidos com BR válido — antes isso ficava restrito só aos BRs que
      // tinham equipamento de terceiro vinculado (equipamentos_terceiros), o que deixava
      // de fora qualquer projeto sem empréstimo de equipamento (ex: BR14100, que tem
      // material faturado e serviço pendente, mas nenhum equipamento envolvido).
      // codtipoper != 3104 exclui "PEDIDO DE VENDA - RETRABALHO", que não deve contar
      // como pendência de nota de serviço.
      // data_neg >= 2026-01-01 exclui tudo de 2025 (casos antigos demais, resolvidos ou
      // já não são acionáveis — o time só quer ver pendências recentes).
      const pedidos = await buscarTudoEmLotes(
        'pedidos_itens',
        'br,cliente_nome,produto_descricao,quantidade,valor_liquido,data_neg,numero_pedido,vendedor_nome,codtipoper',
        q => q.not('br', 'is', null).neq('br', '<SEM PROJETO>').or('codtipoper.neq.3104,codtipoper.is.null').gte('data_neg', '2026-01-01'),
      );

      const brs = [...new Set(pedidos.map(p => p.br))];
      if (!brs.length) { setLinhas([]); setLoading(false); return; }

      // 2) Itens já faturados, pra cada BR (busca em lotes pra evitar limite de URL/IN)
      const buscarEmLotesPorBR = async (tabela, campos) => {
        let resultado = [];
        for (let i = 0; i < brs.length; i += 200) {
          const lote = brs.slice(i, i + 200);
          const { data, error } = await supabase.from(tabela).select(campos).in('br', lote);
          if (error) throw error;
          resultado = resultado.concat(data || []);
        }
        return resultado;
      };

      const notas = await buscarEmLotesPorBR('nota_venda_itens', 'br,produto_descricao,quantidade,data_faturamento');

      // 3) Equipamentos de terceiro (entrada/retorno) — usado só na REGRA 2 (BR que só tem
      // Pedido de Venda de Serviços, sem Pedido de Venda - Consumo nenhum).
      const { data: equipData } = await supabase.from('equipamentos_terceiros')
        .select('projeto_br,projeto_br_retorno,fornecedor,nunota_retorno');

      // 4) Exclusões manuais do time (tabela falta_servico_exclusoes) — sempre tem
      // prioridade sobre as regras automáticas, pro time poder corrigir casos específicos.
      const { data: exclusoesData } = await supabase.from('falta_servico_exclusoes').select('*');
      const exclusoesMap = {};
      (exclusoesData || []).forEach(e => { exclusoesMap[e.br] = e; });
      setExclusoes(exclusoesMap);

      // Agrupa pedidos por BR (pra saber quais TOPs cada BR tem) e por BR+item (quantidade)
      const pedidoPorBrItem = {};
      const topsPorBr = {};
      const clientePorBr = {};
      pedidos.forEach(p => {
        const chave = `${p.br}|||${p.produto_descricao}`;
        if (!pedidoPorBrItem[chave]) pedidoPorBrItem[chave] = { ...p, quantidade: 0, valor_liquido: 0 };
        pedidoPorBrItem[chave].quantidade += Number(p.quantidade) || 0;
        pedidoPorBrItem[chave].valor_liquido += Number(p.valor_liquido) || 0;
        if (p.data_neg < pedidoPorBrItem[chave].data_neg) pedidoPorBrItem[chave].data_neg = p.data_neg;
        if (!topsPorBr[p.br]) topsPorBr[p.br] = new Set();
        topsPorBr[p.br].add(Number(p.codtipoper));
        clientePorBr[p.br] = p.cliente_nome;
      });
      const faturadoPorBrItem = {};
      notas.forEach(n => {
        const chave = `${n.br}|||${n.produto_descricao}`;
        faturadoPorBrItem[chave] = (faturadoPorBrItem[chave] || 0) + (Number(n.quantidade) || 0);
      });

      // Pra cada BR, calcula quais itens do pedido NÃO estão totalmente faturados
      const porBr = {};
      Object.values(pedidoPorBrItem).forEach(item => {
        const chave = `${item.br}|||${item.produto_descricao}`;
        const faturado = faturadoPorBrItem[chave] || 0;
        const pendente = item.quantidade - faturado > 0.001;
        if (!porBr[item.br]) porBr[item.br] = { br: item.br, cliente: item.cliente_nome, vendedor: item.vendedor_nome, itensPendentes: [], dataPedidoMaisAntiga: item.data_neg, numeroPedido: item.numero_pedido };
        if (item.data_neg < porBr[item.br].dataPedidoMaisAntiga) porBr[item.br].dataPedidoMaisAntiga = item.data_neg;
        if (pendente) porBr[item.br].itensPendentes.push({ descricao: item.produto_descricao, quantidade: item.quantidade - faturado, valor: item.valor_liquido });
      });

      // REGRA 1: BR tem Pedido de Venda - Consumo (TOP 3100) E Pedido de Venda de Serviços
      // (TOP 3103) juntos. Se o material (Consumo) já está tudo faturado (não pendente) e
      // sobrou item de serviço sem nota — significa que tem que solicitar a nota de serviço.
      // Isso já é exatamente o que o cálculo de "itensPendentes" acima resolve: se o material
      // não aparece em itensPendentes (foi todo faturado) e o serviço aparece, é a Regra 1.
      //
      // REGRA 2: BR tem SÓ Pedido de Venda de Serviços (TOP 3103), sem nenhum Consumo (3100)
      // — normalmente equipamento de terceiro pra conserto. Só conta como pendência se
      // existir uma nota de RETORNO de equipamento (equipamentos_terceiros) com o MESMO BR
      // e o MESMO CLIENTE do pedido de serviço — isso confirma que o equipamento já voltou
      // pro cliente, e por isso já dá pra cobrar o serviço. Sem essa confirmação, não inclui
      // (ex: BR14251/26 — o retorno que existe ficou com um BR diferente por erro de
      // cadastro no Sankhya, então não confirma nada pra esse BR específico).
      const temRetornoConfirmado = (br, cliente) => (equipData || []).some(e =>
        e.nunota_retorno != null && e.fornecedor === cliente && (e.projeto_br === br || e.projeto_br_retorno === br)
      );

      const resultado = Object.values(porBr)
        .filter(b => {
          if (exclusoesMap[b.br]) return false; // exclusão manual sempre vence
          if (!(b.itensPendentes.length > 0 && b.itensPendentes.every(i => ehServico(i.descricao)))) return false;
          const tops = topsPorBr[b.br] || new Set();
          const temConsumo = tops.has(3100);
          if (temConsumo) return true; // Regra 1: já resolvido pelo cálculo de faturamento acima
          return temRetornoConfirmado(b.br, clientePorBr[b.br]); // Regra 2
        })
        .map(b => ({
          ...b,
          valorPendente: b.itensPendentes.reduce((s, i) => s + i.valor, 0),
          diasAberto: b.dataPedidoMaisAntiga ? Math.floor((Date.now() - new Date(b.dataPedidoMaisAntiga).getTime()) / 86400000) : null,
        }));

      setLinhas(resultado);
    } catch (e) {
      setErro(String(e?.message || e));
    }
    setLoading(false);
  }, []);

  const excluirBr = async (br, motivo) => {
    await supabase.from('falta_servico_exclusoes').upsert({ br, motivo, excluido_por: 'time' }, { onConflict: 'br' });
    setModalExcluir(null);
    await carregar();
  };

  const reincluirBr = async (br) => {
    await supabase.from('falta_servico_exclusoes').delete().eq('br', br);
    await carregar();
  };

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const filtradas = useMemo(() => {
    return linhas
      .filter(l => !busca ||
        l.br.toLowerCase().includes(busca.toLowerCase()) ||
        (l.cliente || '').toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => {
        let va = a[sortCol] ?? 0, vb = b[sortCol] ?? 0;
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [linhas, busca, sortCol, sortDir]);

  const kpis = useMemo(() => ({
    total: linhas.length,
    valorTotal: linhas.reduce((s, l) => s + l.valorPendente, 0),
    mais30dias: linhas.filter(l => (l.diasAberto || 0) > 30).length,
  }), [linhas]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const LocalSortTh = ({ label, col, right }) => {
    const active = sortCol === col;
    return (
      <th onClick={() => handleSort(col)} style={{ ...thFat(0, right ? 'right' : 'left'), cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <span style={{ color: active ? T.terracotta : T.inkFaint }}>{label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
      </th>
    );
  };

  const fmtData = (iso) => !iso ? '—' : new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Compara item por item o que foi pedido vs. o que já foi faturado, por BR (equipamentos de terceiros).
        Mostra só os casos em que <strong>todo o material já foi faturado</strong> e o que falta é <strong>exclusivamente o item de serviço</strong> —
        ou seja, casos prontos pra cobrar/emitir a nota de serviço, sem ambiguidade de material pendente junto.
      </div>

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
        <Kpi label="BRs com só serviço pendente" value={loading ? '…' : kpis.total} icon={AlertTriangle} tone="amber"
          sub="material 100% faturado, falta só o serviço" />
        <Kpi label="Valor de serviço pendente" value={loading ? '…' : fmtMoedaCompacta(kpis.valorTotal)} icon={DollarSign} tone="rust"
          sub="soma do valor dos itens de serviço em aberto" />
        <Kpi label="Em aberto há mais de 30 dias" value={loading ? '…' : kpis.mais30dias} icon={Clock3} tone="rust"
          sub="prioridade de cobrança" />
      </div>

      <Panel>
        <FiltroCampoFat label="Buscar BR ou cliente">
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: BR14148, Vale…"
              style={{ ...selectStyleFat(280), paddingLeft: 28 }} />
          </div>
        </FiltroCampoFat>
      </Panel>

      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <LocalSortTh label="BR" col="br" />
                <th style={thFat(0)}>Cliente</th>
                <th style={thFat(0)}>Item de serviço pendente</th>
                <LocalSortTh label="Valor" col="valorPendente" right />
                <LocalSortTh label="Pedido" col="dataPedidoMaisAntiga" />
                <LocalSortTh label="Dias em aberto" col="diasAberto" right />
                <th style={{ ...thFat(90), textAlign: 'center' }}>Detalhe</th>
                <th style={{ ...thFat(90), textAlign: 'center' }}>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtradas.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.oliveText, fontWeight: 600 }}>✓ Nenhum caso — tudo faturado ou pendências ainda têm material em aberto também.</td></tr>
              ) : filtradas.map(l => (
                <tr key={l.br} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: (l.diasAberto || 0) > 30 ? T.rustSoft : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = (l.diasAberto || 0) > 30 ? T.rustSoft : 'transparent'}>
                  <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, whiteSpace: 'nowrap' }}>{l.br}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.cliente}>{l.cliente || '—'}</td>
                  <td style={{ padding: '9px 12px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.itensPendentes.map(i => i.descricao).join(' · ')}>
                    {l.itensPendentes.map(i => i.descricao).join(' · ')}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.ink }}>{fmtMoeda(l.valorPendente)}</td>
                  <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(l.dataPedidoMaisAntiga)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: T.inkDim }}>{l.diasAberto ?? '—'}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <button onClick={() => setDetalhe(l)}
                      style={{ fontSize: 11, color: T.blueText, background: T.blueSoft, border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                      Ver
                    </button>
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <button onClick={() => setModalExcluir(l.br)} title="Marcar como 'não solicitar ainda' (com motivo)"
                      style={{ fontSize: 11, color: T.inkFaint, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                      Ocultar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{filtradas.length} BR{filtradas.length !== 1 ? 's' : ''} · linhas em vermelho = mais de 30 dias em aberto</span>
          <BotaoExportar small onClick={() => exportCSV(filtradas.map(l => ({ ...l, itens: l.itensPendentes.map(i => i.descricao).join(' | ') })), 'servico_pendente.csv',
            ['br','cliente','itens','valorPendente','dataPedidoMaisAntiga','diasAberto'])} />
        </div>
      </div>

      {detalhe && (
        <Overlay onClose={() => setDetalhe(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 560,
            boxShadow: '0 24px 60px rgba(0,0,0,.18)', overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: T.ink }}>{detalhe.br}</div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{detalhe.cliente} · vendedor: {detalhe.vendedor || '—'}</div>
              </div>
              <button onClick={() => setDetalhe(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={18} /></button>
            </div>
            <div style={{ padding: '16px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', marginBottom: 8 }}>Itens de serviço pendentes de faturamento</div>
              {detalhe.itensPendentes.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.lineSoft}` }}>
                  <span style={{ fontSize: 12.5 }}>{it.descricao}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, fontFamily: FONT_DISPLAY }}>{fmtMoeda(it.valor)}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, fontSize: 12, color: T.inkFaint }}>
                Pedido em {fmtData(detalhe.dataPedidoMaisAntiga)} · {detalhe.diasAberto} dias em aberto
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* Modal: excluir BR manualmente, com motivo obrigatório */}
      {modalExcluir && (
        <Overlay onClose={() => setModalExcluir(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 460,
            boxShadow: '0 24px 60px rgba(0,0,0,.18)', overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}` }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: T.ink }}>Ocultar {modalExcluir}</div>
              <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 3 }}>Explica por que esse BR não deve aparecer aqui ainda (fica registrado, e pode reincluir depois).</div>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <textarea id="motivo-exclusao" rows={3} placeholder="Ex: equipamento ainda com subcontratada, aguardando retorno pro cliente…"
                style={{ ...inputStyle(), fontSize: 12.5, width: '100%' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => setModalExcluir(null)} style={{ ...ghostBtn(T.inkFaint), flex: 1, justifyContent: 'center' }}>Cancelar</button>
                <button onClick={() => excluirBr(modalExcluir, document.getElementById('motivo-exclusao').value)}
                  style={{ ...solidBtn(T.terracotta, true), flex: 1, justifyContent: 'center' }}>Ocultar</button>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* BRs ocultados manualmente — pra poder reincluir se precisar */}
      {Object.keys(exclusoes).length > 0 && (
        <Panel title="BRs ocultados manualmente" subtitle="Marcados pelo time como 'não solicitar faturamento ainda' — clique em Reincluir se a situação mudou">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.values(exclusoes).map(e => (
              <div key={e.br} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 12px', background: T.panelAlt, borderRadius: 8, gap: 12 }}>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, fontSize: 12.5 }}>{e.br}</div>
                  {e.motivo && <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 3 }}>{e.motivo}</div>}
                </div>
                <button onClick={() => reincluirBr(e.br)} style={{ fontSize: 11, color: T.oliveText, background: T.oliveSoft, border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
                  Reincluir
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function EquipamentosTerceiros() {
  const [dados, setDados] = useState([]);
  const [pedidosVenda, setPedidosVenda] = useState([]);
  const [notaVendaMap, setNotaVendaMap] = useState({}); // numero_pedido → {nunota, data_faturamento, valor_bruto}
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState('');
  const [fornFiltro, setFornFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [brFiltro, setBrFiltro] = useState('Todos'); // filtra AMBAS as tabelas pelo BR
  const [sortCol, setSortCol] = useState('data_entrada');
  const [sortDir, setSortDir] = useState('asc');
  const [detalhe, setDetalhe] = useState(null);
  const [pedidosRel, setPedidosRel] = useState([]);
  const [propostasRel, setPropostasRel] = useState([]);
  const [loadingRel, setLoadingRel] = useState(false);

  const abrirDetalhe = useCallback(async (row) => {
    setDetalhe(row);
    setPedidosRel([]);
    setPropostasRel([]);
    // Ao clicar, aplica o filtro de BR automaticamente
    const brRef = row.br_referencia || row.projeto_br || row.projeto_br_retorno;
    if (brRef && brRef !== '<SEM PROJETO>') setBrFiltro(brRef);
    const brs = [...new Set([row.projeto_br, row.projeto_br_retorno, row.br_referencia].filter(Boolean))];
    if (!brs.length) return;
    setLoadingRel(true);
    try {
      const [rPed, rProp] = await Promise.all([
        supabase.from('pedidos_itens')
          .select('br,nunota,numero_pedido,cliente_nome,produto_descricao,produto_kaleng,valor_liquido,quantidade,unidade,data_neg,vendedor_nome,uf')
          .in('br', brs).order('data_neg', { ascending: false }).limit(50),
        supabase.from('propostas')
          .select('br,cliente,escopo,status,valor_liquido,data_abertura,responsavel')
          .in('br', brs).order('data_abertura', { ascending: false }),
      ]);
      setPedidosRel(rPed.data || []);
      setPropostasRel(rProp.data || []);
    } catch (_) {}
    setLoadingRel(false);
  }, []);

  const carregar = useCallback(async () => {
    setErro(null);
    const { data, error } = await supabase
      .from('equipamentos_terceiros')
      .select('*')
      .order('data_entrada', { ascending: true });
    if (error) { setErro(error.message); setLoading(false); return; }
    setDados(data || []);
    if (data?.length) setLastSync(data[0].sincronizado_em);

    // Carrega pedidos de venda para todos os BRs dos equipamentos
    const brs = [...new Set(
      (data || []).map(d => d.br_referencia).filter(b => b && b !== '<SEM PROJETO>')
    )];
    if (brs.length > 0) {
      const { data: pedidos } = await supabase
        .from('pedidos_itens')
        .select('br,nunota,numero_pedido,cliente_nome,produto_descricao,produto_kaleng,valor_liquido,quantidade,unidade,data_neg,vendedor_nome,uf')
        .in('br', brs)
        .order('data_neg', { ascending: false });
      setPedidosVenda(pedidos || []);

      // Carrega registros completos de nota_venda_itens por BR
      // (exibe quando pedidos_itens não tem dados — ex: pedido anterior a jan/2026)
      if (brs.length > 0) {
        const { data: notas } = await supabase
          .from('nota_venda_itens')
          .select('br, nro_interno_sankhya, codtipoper, numero_pedido, data_faturamento, cliente_nome, produto_descricao, valor_bruto, quantidade')
          .in('br', brs)
          .in('codtipoper', TOPS_FATURAMENTO_VALIDOS)
          .order('data_faturamento', { ascending: false });
        // Map por BR para lookup rápido
        const map = {};
        (notas || []).forEach(n => {
          if (!map[n.br]) map[n.br] = { data: n.data_faturamento, itens: [] };
          if (n.data_faturamento > map[n.br].data) map[n.br].data = n.data_faturamento;
          map[n.br].itens.push(n);
        });
        setNotaVendaMap(map);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const sincronizar = async () => {
    setSyncing(true); setSyncMsg(null); setErro(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(
        `https://sieztnpchjjmrwrmrhoa.supabase.co/functions/v1/sankhya-equipamentos-sync`,
        { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setSyncMsg(`✓ ${j.total} registros sincronizados`);
      await carregar();
    } catch (e) {
      setErro(String(e?.message || e));
    }
    setSyncing(false);
  };

  const fornecedores = useMemo(() => {
    const s = new Set(dados.map(d => d.fornecedor).filter(Boolean));
    return ['Todos', ...[...s].sort()];
  }, [dados]);

  const brsDisponiveis = useMemo(() => {
    const s = new Set(dados.map(d => d.br_referencia).filter(b => b && b !== '<SEM PROJETO>'));
    return ['Todos', ...[...s].sort()];
  }, [dados]);

  // BRs que têm ao menos um pedido de venda sincronizado
  const brsComPedido = useMemo(() =>
    new Set(pedidosVenda.map(p => p.br).filter(Boolean)),
  [pedidosVenda]);

  // BRs com NF de venda emitida (direto do notaVendaMap, keyed by BR)
  const brsComNf = useMemo(() =>
    new Set(Object.keys(notaVendaMap)),
  [notaVendaMap]);

  // BRs com nota de retorno (equipamento voltou)
  const brsComRetorno = useMemo(() =>
    new Set(dados.filter(d => d.nunota_retorno).map(d => d.br_referencia).filter(Boolean)),
  [dados]);

  // BRs sem pedido de venda E sem NF — excluir os que têm NF (pedido só está fora do range de sync)
  const brsSemPedido = useMemo(() =>
    dados
      .map(d => d.br_referencia)
      .filter(b => b && b !== '<SEM PROJETO>' && !brsComPedido.has(b) && !brsComNf.has(b))
      .filter((b, i, arr) => arr.indexOf(b) === i)
      .sort(),
  [dados, brsComPedido, brsComNf]);

  // Compara itens do PEDIDO (pedidos_itens) com itens já FATURADOS (nota_venda_itens)
  // por BR — pra saber se o faturamento está completo ou só parcial. Sem essa
  // comparação, "BR tem NF" era tratado como sim/não, o que presumia faturamento
  // completo mesmo quando só parte dos itens tinha sido faturada (ex.: 2 de 4).
  const faturamentoPorBr = useMemo(() => {
    const map = {};
    pedidosVenda.forEach(p => {
      if (!p.br) return;
      if (!map[p.br]) map[p.br] = { totalItens: 0, totalQtd: 0, itensFaturados: 0, qtdFaturada: 0 };
      map[p.br].totalItens++;
      map[p.br].totalQtd += Number(p.quantidade) || 0;
    });
    Object.entries(notaVendaMap).forEach(([br, v]) => {
      if (!map[br]) map[br] = { totalItens: 0, totalQtd: 0, itensFaturados: 0, qtdFaturada: 0 };
      map[br].itensFaturados = v.itens.length;
      map[br].qtdFaturada = v.itens.reduce((s, i) => s + (Number(i.quantidade) || 0), 0);
    });
    return map;
  }, [pedidosVenda, notaVendaMap]);

  // Status de faturamento de um BR, sem presumir quando é duvidoso:
  // - 'sem_pedido_sincronizado': não dá pra comparar (pedido fora do range de sync) — não afirma nada
  // - 'completo': todos os itens do pedido já têm NF (ou não temos como contar itens, mas a qtd bate)
  // - 'parcial': só PARTE dos itens/quantidade foi faturada — AMBÍGUO, precisa o usuário confirmar
  // - 'nenhum': nenhum item faturado ainda
  const statusFaturamentoBr = (br) => {
    const f = faturamentoPorBr[br];
    if (!f || f.totalItens === 0) return 'sem_pedido_sincronizado';
    if (f.itensFaturados === 0) return 'nenhum';
    if (f.itensFaturados >= f.totalItens && f.qtdFaturada >= f.totalQtd - 0.001) return 'completo';
    return 'parcial';
  };

  // ALERTA (confiável): NF de TODOS os itens emitida mas sem nota de retorno
  const alertasBR = useMemo(() =>
    [...brsComNf].filter(br => !brsComRetorno.has(br) && statusFaturamentoBr(br) === 'completo').sort(),
  [brsComNf, brsComRetorno, faturamentoPorBr]);

  // AMBÍGUO: faturamento PARCIAL (só parte dos itens do pedido tem NF) e sem retorno —
  // não dá pra presumir "pendente" nem "ok", empurra pro usuário decidir com os números na mão
  const parciaisBR = useMemo(() =>
    [...brsComNf].filter(br => !brsComRetorno.has(br) && statusFaturamentoBr(br) === 'parcial').sort(),
  [brsComNf, brsComRetorno, faturamentoPorBr]);

  // Filtros por coluna na tabela de pedidos
  const [colFilters, setColFilters] = useState({
    br: '', cliente_nome: '', produto_descricao: '',
    produto_kaleng: '', vendedor_nome: '', uf: '', nf_status: 'Todos',
  });
  const setColFilter = (col, val) => setColFilters(f => ({ ...f, [col]: val }));

  const pedidosFiltrados = useMemo(() => {
    return pedidosVenda.filter(p => {
      const matchBr     = (brFiltro === 'Todos' || p.br === brFiltro) &&
                          (!colFilters.br || (p.br || '').toLowerCase().includes(colFilters.br.toLowerCase()));
      const matchCli    = !colFilters.cliente_nome    || (p.cliente_nome    || '').toLowerCase().includes(colFilters.cliente_nome.toLowerCase());
      const matchProd   = !colFilters.produto_descricao || (p.produto_descricao || '').toLowerCase().includes(colFilters.produto_descricao.toLowerCase());
      const matchKaleng = !colFilters.produto_kaleng  || (p.produto_kaleng  || '').toLowerCase().includes(colFilters.produto_kaleng.toLowerCase());
      const matchVend   = !colFilters.vendedor_nome   || (p.vendedor_nome   || '').toLowerCase().includes(colFilters.vendedor_nome.toLowerCase());
      const matchUf     = !colFilters.uf              || (p.uf              || '').toLowerCase().includes(colFilters.uf.toLowerCase());
      const hasNf = !!notaVendaMap[p.br];
      const matchNfSt   = colFilters.nf_status === 'Todos' ||
                          (colFilters.nf_status === 'Faturado' && hasNf) ||
                          (colFilters.nf_status === 'Sem NF' && !hasNf);
      return matchBr && matchCli && matchProd && matchKaleng && matchVend && matchUf && matchNfSt;
    });
  }, [pedidosVenda, brFiltro, colFilters, notaVendaMap]);

  const totalPedidosValor = useMemo(() =>
    pedidosFiltrados.reduce((s, p) => s + (Number(p.valor_liquido) || 0), 0),
  [pedidosFiltrados]);

  const diasAberto = (row) => {
    if (!row.data_entrada || row.data_retorno) return null;
    return Math.round((Date.now() - new Date(row.data_entrada)) / 86400000);
  };

  // Status REAL: nota de retorno com data = devolvido, independente do flag Sankhya
  const statusRow = (row) => {
    if (row.nunota_retorno && row.data_retorno) return 'Devolvido';
    if (row.nunota_retorno && !row.data_retorno) return 'Em processamento';
    if (row.pendente_sankhya === 'N') return 'Finalizado';
    return 'Pendente';
  };

  const filtrados = useMemo(() => {
    return dados.filter(r => {
      const st = statusRow(r);
      const brRef = r.br_referencia || r.projeto_br || r.projeto_br_retorno || '';
      const matchBusca = !busca ||
        (r.numnota_origem || '').includes(busca) ||
        brRef.toLowerCase().includes(busca.toLowerCase()) ||
        (r.cod_produto || '').includes(busca) ||
        (r.descr_produto || '').toLowerCase().includes(busca.toLowerCase()) ||
        (r.fornecedor || '').toLowerCase().includes(busca.toLowerCase());
      const matchForn = fornFiltro === 'Todos' || r.fornecedor === fornFiltro;
      const matchSt = statusFiltro === 'Todos' || st === statusFiltro;
      const matchBr = brFiltro === 'Todos' ||
        r.br_referencia === brFiltro ||
        r.projeto_br === brFiltro ||
        r.projeto_br_retorno === brFiltro;
      return matchBusca && matchForn && matchSt && matchBr;
    }).sort((a, b) => {
      let va = a[sortCol] ?? '';
      let vb = b[sortCol] ?? '';
      if (sortCol === 'data_entrada' || sortCol === 'data_retorno') {
        va = va ? new Date(va).getTime() : 0;
        vb = vb ? new Date(vb).getTime() : 0;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dados, busca, fornFiltro, statusFiltro, brFiltro, sortCol, sortDir]);

  const totais = useMemo(() => ({
    pendentes:    filtrados.filter(r => statusRow(r) === 'Pendente').length,
    devolvidos:   filtrados.filter(r => statusRow(r) === 'Devolvido').length,
    em_proc:      filtrados.filter(r => statusRow(r) === 'Em processamento').length,
    fornecedores: new Set(filtrados.map(r => r.fornecedor).filter(Boolean)).size,
    mais_antigo:  filtrados
                    .filter(r => statusRow(r) === 'Pendente')
                    .reduce((mx, r) => { const d = diasAberto(r) ?? 0; return d > mx ? d : mx; }, 0),
  }), [filtrados]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  // Sem timezone bug: parse manual da string YYYY-MM-DD
  const fmtData = (iso) => {
    if (!iso) return '—';
    const [y, m, d] = String(iso).split('-');
    return d && m && y ? `${d}/${m}/${y}` : iso;
  };

  const statusMeta = (st) => ({
    'Devolvido':       { cor: T.oliveText,  bg: T.oliveSoft,  icone: '✓' },
    'Em processamento':{ cor: T.blueText,   bg: T.blueSoft,   icone: '⟳' },
    'Finalizado':      { cor: T.inkFaint,   bg: T.lineSoft,   icone: '■' },
    'Pendente':        { cor: T.amberText,  bg: T.amberSoft,  icone: '!' },
  }[st] || { cor: T.inkFaint, bg: T.lineSoft, icone: '?' });

  const rowBg = (r) => {
    const st = statusRow(r);
    if (st === 'Devolvido') return `${T.oliveSoft}55`;
    if (st === 'Em processamento') return `${T.blueSoft}55`;
    if (st === 'Finalizado') return 'transparent';
    const d = diasAberto(r);
    if (d !== null && d > 90) return `${T.rustSoft}44`;
    return 'transparent';
  };

  const diasCor = (d) => {
    if (d === null) return [T.inkFaint, T.lineSoft];
    if (d > 90) return [T.rustText, T.rustSoft];
    if (d > 30) return [T.amberText, T.amberSoft];
    return [T.oliveText, T.oliveSoft];
  };

  const SortTh2 = ({ label, col, width }) => {
    const active = sortCol === col;
    return (
      <th onClick={() => handleSort(col)} style={{
        ...thFat(width || 0, 'left'), cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
      }}>
        <span style={{ color: active ? T.terracotta : T.inkFaint }}>
          {label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
        </span>
      </th>
    );
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1400 }}>

      {/* Header sync */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontSize: 12, color: T.inkFaint, margin: 0 }}>
          Equipamentos recebidos de terceiros (TOPs 2105/2108) com itens pendentes desde jan/2026.
          {lastSync && ` Último sync: ${new Date(lastSync).toLocaleString('pt-BR')}.`}
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {syncMsg && <span style={{ fontSize: 12, color: T.oliveText, fontWeight: 600 }}>{syncMsg}</span>}
          <button onClick={sincronizar} disabled={syncing} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: T.terracotta, color: '#fff',
            border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, opacity: syncing ? 0.7 : 1,
          }}>
            <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
            {syncing ? 'Sincronizando…' : 'Sincronizar Sankhya'}
          </button>
        </div>
      </div>

      {erro && (
        <div style={{ background: T.rustSoft, border: `1px solid ${T.rust}33`, borderRadius: 8, padding: '11px 15px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={15} color={T.rustText} />
          <span style={{ fontSize: 12.5, color: T.rustText, fontWeight: 600 }}>{erro}</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid-kpis-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))' }}>
        {[
          { label: 'Pendentes',        value: totais.pendentes,    color: totais.pendentes > 0 ? T.amberText : T.oliveText },
          { label: 'Devolvidos',       value: totais.devolvidos,   color: T.oliveText },
          { label: 'Em processamento', value: totais.em_proc,      color: T.blueText },
          { label: 'Mais antigo (dias)',value: totais.mais_antigo ? `${totais.mais_antigo}d` : '—',
            color: totais.mais_antigo > 90 ? T.rustText : totais.mais_antigo > 30 ? T.amberText : T.oliveText },
          { label: 'Fornecedores',     value: totais.fornecedores, color: T.ink },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '14px 16px', boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: k.color, marginTop: 8 }}>{loading ? '…' : k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Buscar nota, BR, produto ou fornecedor">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Ex: 12345, BR-2026, VÁLVULA, Gerdau…"
                style={{ ...selectStyleFat(280), paddingLeft: 28 }} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Filtrar por BR">
            <div style={{ position: 'relative' }}>
              <select value={brFiltro} onChange={e => setBrFiltro(e.target.value)} style={selectStyleFat(160)}>
                {brsDisponiveis.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Fornecedor">
            <div style={{ position: 'relative' }}>
              <select value={fornFiltro} onChange={e => setFornFiltro(e.target.value)} style={selectStyleFat(200)}>
                {fornecedores.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Status">
            <div style={{ position: 'relative' }}>
              <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} style={selectStyleFat(160)}>
                {['Todos', 'Pendente', 'Devolvido', 'Em processamento', 'Finalizado'].map(s => <option key={s} value={s}>{s}</option>)}
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
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <SortTh2 label="Nº Nota"        col="numnota_origem"     width={80} />
                <SortTh2 label="BR Origem"      col="projeto_br"         width={100} />
                <SortTh2 label="BR Retorno"     col="projeto_br_retorno" width={100} />
                <SortTh2 label="Cod. Produto"   col="cod_produto"     width={90} />
                <th style={thFat()}>Descrição</th>
                <SortTh2 label="Qtd"            col="quantidade"      width={55} />
                <SortTh2 label="Fornecedor"     col="fornecedor"      />
                <SortTh2 label="Entrada"        col="data_entrada"    width={90} />
                <th style={{ ...thFat(60), textAlign: 'center' }}>Dias</th>
                <th style={{ ...thFat(110), textAlign: 'center' }}>Status</th>
                <SortTh2 label="Nº Retorno"     col="numnota_retorno" width={90} />
                <SortTh2 label="Data Retorno"   col="data_retorno"    width={100} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>
                  {dados.length === 0 ? 'Nenhum dado — clique em "Sincronizar Sankhya" para importar.' : 'Nenhum item encontrado com os filtros aplicados.'}
                </td></tr>
              ) : filtrados.map((r, i) => {
                const d = diasAberto(r);
                const [dCor, dBg] = diasCor(d);
                const st = statusRow(r);
                const { cor: stCor, bg: stBg, icone } = statusMeta(st);
                const brRef = r.br_referencia || r.projeto_br || r.projeto_br_retorno;
                const bg = rowBg(r);
                // Agrupa visualmente linhas da mesma nota de origem
                const prevR = i > 0 ? filtrados[i - 1] : null;
                const mesmaNotaAnterior = prevR && prevR.nunota_origem === r.nunota_origem;
                const rowBgFinal = mesmaNotaAnterior ? `${bg === 'transparent' ? T.panelAlt + '88' : bg}` : bg;
                return (
                  <tr key={r.id} onClick={() => abrirDetalhe(r)} style={{
                    borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer',
                    background: rowBgFinal,
                    borderLeft: mesmaNotaAnterior ? `3px solid ${T.terracotta}44` : '3px solid transparent',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = rowBgFinal}
                  >
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.terracotta }}>
                      {mesmaNotaAnterior
                        ? <span style={{ color: T.terracotta, opacity: 0.4, paddingLeft: 4 }}>↳</span>
                        : r.numnota_origem || '—'}
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: 11.5 }}>
                      {mesmaNotaAnterior
                        ? <span style={{ color: T.inkFaint, fontSize: 11 }}>↳</span>
                        : r.projeto_br
                          ? <span style={{ fontWeight: 700, color: T.blueText }}>{r.projeto_br}</span>
                          : <span style={{ color: T.inkFaint }}>—</span>}
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: 11.5 }}>
                      {r.projeto_br_retorno
                        ? <span style={{ fontWeight: 700, color: r.projeto_br_retorno !== r.projeto_br ? T.oliveText : T.blueText }}>{r.projeto_br_retorno}</span>
                        : <span style={{ color: T.inkFaint }}>—</span>}
                    </td>
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontSize: 12, color: T.inkDim }}>{r.cod_produto}</td>
                    <td style={{ padding: '9px 12px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5 }} title={r.descr_produto}>{r.descr_produto}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{Number(r.quantidade).toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '9px 12px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5 }} title={r.fornecedor}>{r.fornecedor}</td>
                    <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', fontSize: 12, fontFamily: FONT_DISPLAY }}>{fmtData(r.data_entrada)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      {d !== null && st === 'Pendente' ? (
                        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 11.5, color: dCor, background: dBg, padding: '2px 6px', borderRadius: 4 }}>{d}d</span>
                      ) : <span style={{ fontSize: 11, color: T.inkFaint }}>—</span>}
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', background: stBg, color: stCor }}>
                        {icone} {st}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontSize: 11.5, color: r.nunota_retorno ? T.oliveText : T.inkFaint, fontWeight: r.nunota_retorno ? 600 : 400 }}>{r.numnota_retorno || '—'}</td>
                    <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', fontSize: 12, fontFamily: FONT_DISPLAY, color: r.data_retorno ? T.oliveText : T.inkFaint, fontWeight: r.data_retorno ? 600 : 400 }}>{fmtData(r.data_retorno)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {filtrados.length} item{filtrados.length !== 1 ? 's' : ''} ·
            <span style={{ color: T.oliveText, fontWeight: 600 }}> ✓ Devolvido</span> ·
            <span style={{ color: T.amberText, fontWeight: 600 }}> ! Pendente</span> ·
            <span style={{ color: T.blueText, fontWeight: 600 }}> ⟳ Em processamento</span> ·
            <span style={{ color: T.inkFaint, fontWeight: 600 }}> ■ Finalizado</span> ·
            dias em âmbar &gt;30d, vermelho &gt;90d
          </span>
          <BotaoExportar small onClick={() => exportCSV(filtrados, 'equipamentos_terceiros.csv',
            ['numnota_origem','projeto_br','cod_produto','descr_produto','quantidade','fornecedor','data_entrada','data_retorno','numnota_retorno'])} />
        </div>
      </div>

      {/* ── PEDIDOS DE VENDA RELACIONADOS ─────────────────────────────── */}
      <Panel
        title="Pedidos de venda — Sankhya"
        subtitle={
          brFiltro !== 'Todos'
            ? `Filtrado por BR: ${brFiltro} · ${pedidosFiltrados.length} item${pedidosFiltrados.length !== 1 ? 's' : ''}`
            : `${pedidosFiltrados.length} item${pedidosFiltrados.length !== 1 ? 's' : ''} · ${brsComPedido.size} BR${brsComPedido.size !== 1 ? 's' : ''} com pedido`
        }
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Filtro rápido: mostrar só sem NF */}
            <button
              onClick={() => setColFilters(f => ({ ...f, nf_status: f.nf_status === 'Sem NF' ? 'Todos' : 'Sem NF' }))}
              style={{
                fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: colFilters.nf_status === 'Sem NF' ? T.amberText : T.amberSoft,
                color:      colFilters.nf_status === 'Sem NF' ? '#fff'      : T.amberText,
              }}>
              ✗ Sem NF ({pedidosVenda.filter(p => !notaVendaMap[p.br]).length})
            </button>
            {brFiltro !== 'Todos' && (
              <button onClick={() => { setBrFiltro('Todos'); }} style={{ fontSize: 11, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 5, padding: '4px 9px', cursor: 'pointer' }}>✕ Limpar BR</button>
            )}
            {Object.values(colFilters).some(v => v && v !== 'Todos') && (
              <button onClick={() => setColFilters({ br: '', cliente_nome: '', produto_descricao: '', produto_kaleng: '', vendedor_nome: '', uf: '', nf_status: 'Todos' })}
                style={{ fontSize: 11, color: T.amberText, background: T.amberSoft, border: `1px solid ${T.amber}33`, borderRadius: 5, padding: '4px 9px', cursor: 'pointer' }}>
                ✕ Limpar filtros
              </button>
            )}
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: T.terracotta }}>{fmtMoedaCompacta(totalPedidosValor)}</span>
            <BotaoExportar small onClick={() => exportCSV(pedidosFiltrados, 'pedidos_venda_equip.csv',
              ['br','numero_pedido','cliente_nome','produto_descricao','produto_kaleng','quantidade','unidade','valor_liquido','data_neg','vendedor_nome','uf'])} />
          </div>
        }
      >
        {/* 🚨 ALERTA: NF de itens emitida mas sem nota de retorno */}
        {/* 🚨 ALERTA: NF de itens emitida mas sem nota de retorno */}
        {alertasBR.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#8A170F', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={13} color="#C8261C" />
              {alertasBR.length} BR{alertasBR.length !== 1 ? 's' : ''} com NF emitida mas SEM retorno — NF de serviço bloqueada
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {alertasBR.map(br => {
                const equip = dados.find(d => d.br_referencia === br);
                const dias = equip?.data_entrada
                  ? Math.round((Date.now() - new Date(equip.data_entrada)) / 86400000) : null;
                const ativo = brFiltro === br;
                return (
                  <button key={br} onClick={() => setBrFiltro(ativo ? 'Todos' : br)} style={{
                    textAlign: 'left', background: ativo ? '#C8261C' : '#fff',
                    border: '1.5px solid #C8261C66', borderRadius: 8, padding: '10px 12px',
                    cursor: 'pointer', transition: 'all .15s',
                  }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: ativo ? '#fff' : '#8A170F', marginBottom: 3 }}>{br}</div>
                    {equip && <div style={{ fontSize: 11, color: ativo ? '#ffc9c9' : '#8A170F', opacity: 0.85 }}>{equip.fornecedor}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 5, alignItems: 'center' }}>
                      {equip?.data_entrada && <span style={{ fontSize: 10.5, color: ativo ? '#ffc9c9' : '#615A4F' }}>Entrada: {fmtData(equip.data_entrada)}</span>}
                      {dias !== null && <span style={{ fontSize: 10.5, fontWeight: 700, color: ativo ? '#fff' : '#C8261C' }}>{dias}d</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 6 }}>
              NF de serviço só emite quando equipamento retornar (TOPs 2409/2410 no Portal de Compras).
            </div>
          </div>
        )}

        {/* ⚠️ AMBÍGUO: faturamento parcial — não presume, pede confirmação do usuário */}
        {parciaisBR.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: T.amberText, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={13} color={T.amber} />
              {parciaisBR.length} BR{parciaisBR.length !== 1 ? 's' : ''} com faturamento PARCIAL — confira antes de decidir
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {parciaisBR.map(br => {
                const equip = dados.find(d => d.br_referencia === br);
                const f = faturamentoPorBr[br];
                const ativo = brFiltro === br;
                return (
                  <button key={br} onClick={() => setBrFiltro(ativo ? 'Todos' : br)} style={{
                    textAlign: 'left', background: ativo ? T.amber : '#fff',
                    border: `1.5px solid ${T.amber}66`, borderRadius: 8, padding: '10px 12px',
                    cursor: 'pointer', transition: 'all .15s',
                  }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: ativo ? '#fff' : T.amberText, marginBottom: 3 }}>{br}</div>
                    {equip && <div style={{ fontSize: 11, color: ativo ? '#fff' : T.inkDim, opacity: 0.85 }}>{equip.fornecedor}</div>}
                    <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 5, color: ativo ? '#fff' : T.amberText }}>
                      {f?.itensFaturados ?? 0} de {f?.totalItens ?? '?'} itens faturados
                    </div>
                    <div style={{ fontSize: 10.5, color: ativo ? '#fff' : T.inkFaint, marginTop: 2 }}>
                      Quantidade: {f?.qtdFaturada ?? 0} de {f?.totalQtd ?? '?'} faturada
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 6 }}>
              Não deu pra confirmar automaticamente se esses BRs estão realmente pendentes de retorno: só parte dos itens do pedido foi faturada até agora. Pode ser faturamento em etapas (normal) ou pode faltar sincronizar — clique no BR pra ver os itens exatos na tabela de pedidos abaixo e decidir.
            </div>
          </div>
        )}

        {/* BRs sem pedido de venda */}
        {brsSemPedido.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: T.rustText, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={13} color={T.rust} />
              {brsSemPedido.length} BR{brsSemPedido.length !== 1 ? 's' : ''} sem pedido de venda — verifique se o Faturamento está sincronizado desde ago/2025
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {brsSemPedido.map(br => {
                const equip = dados.find(d => d.br_referencia === br);
                const dias = equip?.data_entrada
                  ? Math.round((Date.now() - new Date(equip.data_entrada)) / 86400000) : null;
                const ativo = brFiltro === br;
                return (
                  <button key={br} onClick={() => setBrFiltro(ativo ? 'Todos' : br)} style={{
                    textAlign: 'left', background: ativo ? T.rustText : '#fff',
                    border: `1.5px solid ${T.rust}66`, borderRadius: 8, padding: '10px 12px',
                    cursor: 'pointer', transition: 'all .15s',
                  }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: ativo ? '#fff' : T.rustText, marginBottom: 3 }}>{br}</div>
                    {equip && <div style={{ fontSize: 11, color: ativo ? '#ffccc7' : T.inkDim }}>{equip.fornecedor}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 5, alignItems: 'center' }}>
                      {equip?.data_entrada && <span style={{ fontSize: 10.5, color: ativo ? '#ffccc7' : T.inkFaint }}>Entrada: {fmtData(equip.data_entrada)}</span>}
                      {dias !== null && <span style={{ fontSize: 10.5, fontWeight: 700, color: ativo ? '#fff' : T.rustText }}>{dias}d</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 6 }}>
              Equipamentos recebidos mas sem pedido de venda sincronizado em Faturamento.
            </div>
          </div>
        )}
        {loading ? (
          <p style={{ color: T.inkFaint, fontSize: 13, margin: '10px 0 0' }}>Carregando…</p>
        ) : pedidosVenda.length === 0 ? (
          <p style={{ color: T.inkFaint, fontSize: 13, margin: '10px 0 0' }}>
            {dados.length === 0 ? 'Sincronize os equipamentos primeiro.' : 'Nenhum pedido de venda encontrado para os BRs dos equipamentos.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.line}`, background: T.panelAlt }}>
                  {[
                    ['BR',        'br',               80],
                    ['Nº Pedido', 'numero_pedido',    90],
                    ['Cliente',   'cliente_nome',       0],
                    ['Produto',   'produto_descricao',  0],
                    ['Kaleng',    'produto_kaleng',    80],
                    ['Qtd',       'quantidade',        55],
                    ['Un.',       'unidade',           40],
                    ['Valor Ped.','valor_liquido',     90],
                    ['Data Ped.', 'data_neg',          90],
                    ['Vendedor',  'vendedor_nome',     120],
                    ['UF',        'uf',                40],
                    ['NF emitida?','nf',              130],
                  ].map(([label, , w]) => (
                    <th key={label} style={{ ...thFat(w, 'left'), whiteSpace: 'nowrap' }}>{label}</th>
                  ))}
                </tr>
                {/* ── LINHA DE FILTROS POR COLUNA ── */}
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  {/* BR */}
                  <td style={{ padding: '4px 6px' }}>
                    <input value={colFilters.br} onChange={e => setColFilter('br', e.target.value)}
                      placeholder="Filtrar…" style={{ width: '100%', fontSize: 11, padding: '3px 6px', border: `1px solid ${T.line}`, borderRadius: 4, background: T.panel }} />
                  </td>
                  {/* Nº Pedido — sem filtro */}
                  <td style={{ padding: '4px 6px' }} />
                  {/* Cliente */}
                  <td style={{ padding: '4px 6px' }}>
                    <input value={colFilters.cliente_nome} onChange={e => setColFilter('cliente_nome', e.target.value)}
                      placeholder="Filtrar…" style={{ width: '100%', fontSize: 11, padding: '3px 6px', border: `1px solid ${T.line}`, borderRadius: 4, background: T.panel }} />
                  </td>
                  {/* Produto */}
                  <td style={{ padding: '4px 6px' }}>
                    <input value={colFilters.produto_descricao} onChange={e => setColFilter('produto_descricao', e.target.value)}
                      placeholder="Filtrar…" style={{ width: '100%', fontSize: 11, padding: '3px 6px', border: `1px solid ${T.line}`, borderRadius: 4, background: T.panel }} />
                  </td>
                  {/* Kaleng */}
                  <td style={{ padding: '4px 6px' }}>
                    <input value={colFilters.produto_kaleng} onChange={e => setColFilter('produto_kaleng', e.target.value)}
                      placeholder="Filtrar…" style={{ width: '100%', fontSize: 11, padding: '3px 6px', border: `1px solid ${T.line}`, borderRadius: 4, background: T.panel }} />
                  </td>
                  {/* Qtd / Un — sem filtro */}
                  <td /><td />
                  {/* Valor / Data — sem filtro */}
                  <td /><td />
                  {/* Vendedor */}
                  <td style={{ padding: '4px 6px' }}>
                    <input value={colFilters.vendedor_nome} onChange={e => setColFilter('vendedor_nome', e.target.value)}
                      placeholder="Filtrar…" style={{ width: '100%', fontSize: 11, padding: '3px 6px', border: `1px solid ${T.line}`, borderRadius: 4, background: T.panel }} />
                  </td>
                  {/* UF */}
                  <td style={{ padding: '4px 6px' }}>
                    <input value={colFilters.uf} onChange={e => setColFilter('uf', e.target.value)}
                      placeholder="UF" style={{ width: 36, fontSize: 11, padding: '3px 5px', border: `1px solid ${T.line}`, borderRadius: 4, background: T.panel, textTransform: 'uppercase' }} />
                  </td>
                  {/* NF status */}
                  <td style={{ padding: '4px 6px' }}>
                    <select value={colFilters.nf_status} onChange={e => setColFilter('nf_status', e.target.value)}
                      style={{ width: '100%', fontSize: 11, padding: '3px 5px', border: `1px solid ${T.line}`, borderRadius: 4, background: T.panel }}>
                      <option value="Todos">Todos</option>
                      <option value="Faturado">✓ Faturado</option>
                      <option value="Sem NF">✗ Sem NF</option>
                    </select>
                  </td>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((p, i) => {
                  const isSelecionado = brFiltro !== 'Todos' && p.br === brFiltro;
                  const nfInfo = notaVendaMap[p.br];
                  const semNf = !nfInfo;
                  // Detecta se a linha anterior tem a mesma NF (para agrupar visualmente)
                  const prevP = i > 0 ? pedidosFiltrados[i - 1] : null;
                  const mesmoNfAnterior = prevP && prevP.numero_pedido === p.numero_pedido && prevP.br === p.br;
                  const rowBg = semNf
                    ? `${T.amberSoft}BB`
                    : mesmoNfAnterior
                    ? `${T.oliveSoft}55`
                    : isSelecionado ? `${T.terracottaSoft}66` : 'transparent';
                  return (
                    <tr key={i}
                      style={{ borderBottom: `1px solid ${T.lineSoft}`, background: rowBg,
                        borderLeft: mesmoNfAnterior ? `3px solid ${T.olive}55` : '3px solid transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = semNf ? T.amberSoft : T.panelAlt}
                      onMouseLeave={e => e.currentTarget.style.background = rowBg}
                    >
                      <td style={{ padding: '8px 10px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.terracotta, whiteSpace: 'nowrap' }}>
                        <button onClick={() => setBrFiltro(p.br === brFiltro ? 'Todos' : p.br)} style={{
                          background: 'none', border: 'none', color: T.terracotta, fontFamily: FONT_DISPLAY,
                          fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: 0,
                        }}>{p.br}</button>
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: FONT_DISPLAY, fontSize: 11.5, color: T.inkDim }}>{p.numero_pedido || p.nunota || '—'}</td>
                      <td style={{ padding: '8px 10px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.cliente_nome}>{p.cliente_nome}</td>
                      <td style={{ padding: '8px 10px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5, color: T.inkDim }} title={p.produto_descricao}>{p.produto_descricao}</td>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: T.blueText, whiteSpace: 'nowrap' }}>{p.produto_kaleng}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12 }}>{Number(p.quantidade || 0).toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: T.inkFaint, textAlign: 'center' }}>{p.unidade}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{fmtMoedaCompacta(Number(p.valor_liquido) || 0)}</td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', fontSize: 11.5, color: T.inkDim }}>{fmtData(p.data_neg)}</td>
                      <td style={{ padding: '8px 10px', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5 }}>{p.vendedor_nome}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: T.inkDim }}>{p.uf}</td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        {!nfInfo ? (
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: T.amberSoft, color: T.amberText, padding: '2px 7px', borderRadius: 4 }}>✗ Sem NF</span>
                        ) : (() => {
                          // Checa se ESTE item específico (não o BR inteiro) já foi faturado —
                          // casa pela descrição do produto, o campo em comum entre pedidos_itens
                          // e nota_venda_itens. Sem isso, um pedido com faturamento parcial
                          // mostrava "✓ NF" ou "↳" em todos os itens, mesmo nos que ainda não
                          // saíram na nota.
                          const itens = nfInfo.itens || [];
                          const doPedido = itens.filter(n => n.numero_pedido === p.numero_pedido);
                          const lista = doPedido.length > 0 ? doPedido : itens;
                          const itemFaturado = lista.find(n => n.produto_descricao === p.produto_descricao);
                          if (itemFaturado) {
                            return (
                              <div>
                                <span style={{ fontSize: 10.5, fontWeight: 700, background: T.oliveSoft, color: T.oliveText, padding: '2px 7px', borderRadius: 4 }}>
                                  ✓ NF {itemFaturado.nro_interno_sankhya || '—'}
                                </span>
                                {itemFaturado.data_faturamento && <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 2 }}>{fmtData(itemFaturado.data_faturamento)}</div>}
                              </div>
                            );
                          }
                          // O BR tem NF, mas ESTE item específico ainda não saiu nela
                          return (
                            <span style={{ fontSize: 10.5, fontWeight: 700, background: T.amberSoft, color: T.amberText, padding: '2px 7px', borderRadius: 4 }} title="Outros itens deste BR já têm NF, mas este item específico ainda não">
                              ⏳ Pendente
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Fallback: BR selecionado com NF mas sem pedido em pedidos_itens */}
            {pedidosFiltrados.length === 0 && brFiltro !== 'Todos' && notaVendaMap[brFiltro] && (
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.amberText, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} color={T.amberText} />
                  Pedido de venda fora do período sincronizado — mostrando NFs direto de nota_venda_itens
                </div>
                <div style={{ fontSize: 11, color: T.inkFaint, marginBottom: 12 }}>
                  O pedido deste BR tem data de negociação anterior a jan/2026. Sincronize o Faturamento desde ago/2025 para ver o pedido completo.
                </div>
                {/* Agrupa por NF */}
                <NfsAgrupadasCard
                  itens={notaVendaMap[brFiltro].itens}
                  fmtData={fmtData}
                  fmtMoedaCompacta={fmtMoedaCompacta}
                />
              </div>
            )}
            {pedidosFiltrados.length === 0 && brFiltro !== 'Todos' && !notaVendaMap[brFiltro] && (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: T.inkFaint, fontSize: 13 }}>
                Nenhum pedido de venda ou NF encontrado para {brFiltro} no período sincronizado.
              </div>
            )}
            <div style={{ padding: '8px 10px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint }}>
              Clique em um BR para filtrar · pedidos_itens sincronizado de <strong>jan/2026</strong> em diante · NFs desde sempre
            </div>
          </div>
        )}
      </Panel>

      {/* Modal de detalhe */}
      {detalhe && (
        <Overlay onClose={() => { setDetalhe(null); setPedidosRel([]); setPropostasRel([]); }}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12,
            width: '100%', maxWidth: 760, maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: SHADOW_XL,
          }}>
            {/* Header */}
            <div style={{ padding: '16px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: T.terracotta }}>Nota {detalhe.numnota_origem}</span>
                  {(() => { const { cor, bg, icone } = statusMeta(statusRow(detalhe)); return <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: bg, color: cor }}>{icone} {statusRow(detalhe)}</span>; })()}
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: T.inkDim }}>{detalhe.fornecedor}</p>
              </div>
              <button onClick={() => { setDetalhe(null); setPedidosRel([]); setPropostasRel([]); }} style={{ background: 'transparent', border: 'none', color: T.inkFaint, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Body scrollável */}
            <div style={{ overflow: 'auto', flex: 1, padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Grid info base */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  { label: 'Nº Único',       value: detalhe.nunota_origem },
                  { label: 'TOP',            value: detalhe.top_origem },
                  { label: 'Data Entrada',   value: fmtData(detalhe.data_entrada) },
                  { label: 'Flag Sankhya',   value: `PENDENTE = ${detalhe.pendente_sankhya || '?'}` },
                  { label: 'Status real',    value: statusRow(detalhe) },
                  { label: 'Dias em aberto', value: statusRow(detalhe) === 'Pendente' && diasAberto(detalhe) !== null ? `${diasAberto(detalhe)}d` : '—' },
                ].map(f => (
                  <div key={f.label} style={{ background: T.panelAlt, borderRadius: 7, padding: '9px 12px' }}>
                    <div style={{ fontSize: 10, color: T.inkFaint, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, fontFamily: FONT_DISPLAY }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* BRs lado a lado */}
              {(detalhe.projeto_br || detalhe.projeto_br_retorno) && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { label: 'BR Origem',  value: detalhe.projeto_br,          cor: T.blueText,  bg: T.blueSoft  },
                    { label: 'BR Retorno', value: detalhe.projeto_br_retorno,  cor: T.oliveText, bg: T.oliveSoft },
                  ].filter(b => b.value).map(b => (
                    <div key={b.label} style={{ flex: 1, background: b.bg, borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 10, color: b.cor, fontWeight: 700, marginBottom: 3 }}>{b.label}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: b.cor, fontFamily: FONT_DISPLAY }}>{b.value}</div>
                    </div>
                  ))}
                  {!detalhe.projeto_br && detalhe.projeto_br_retorno && (
                    <div style={{ fontSize: 11, color: T.amberText, alignSelf: 'center', padding: '0 4px' }}>⚠ Origem sem BR — referência vem do retorno</div>
                  )}
                </div>
              )}

              {/* Produto */}
              <div style={{ background: T.panelAlt, borderRadius: 8, padding: '11px 14px' }}>
                <div style={{ fontSize: 10, color: T.inkFaint, fontWeight: 600, marginBottom: 3 }}>Produto</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>[{detalhe.cod_produto}] {detalhe.descr_produto}</div>
                <div style={{ fontSize: 12, color: T.inkDim, marginTop: 3 }}>Qtd: <strong>{Number(detalhe.quantidade).toLocaleString('pt-BR')}</strong></div>
              </div>

              {/* Nota de retorno */}
              {detalhe.nunota_retorno ? (
                <div style={{ background: T.oliveSoft, border: `1px solid ${T.olive}33`, borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.oliveText, marginBottom: 4 }}>NOTA DE RETORNO</div>
                  <div style={{ fontSize: 13, color: T.ink }}>Nota <strong>{detalhe.numnota_retorno}</strong> · TOP {detalhe.top_retorno} · {fmtData(detalhe.data_retorno)}</div>
                </div>
              ) : (
                <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}33`, borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.amberText, marginBottom: 3 }}>AGUARDANDO DEVOLUÇÃO</div>
                  <div style={{ fontSize: 12, color: T.inkDim }}>Nenhuma nota de retorno (TOPs 2409/2410) vinculada.</div>
                </div>
              )}

              {/* ── DADOS DO PORTAL DE VENDAS ── */}
              <div style={{ borderTop: `2px solid ${T.line}`, paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={14} color={T.terracotta} />
                  Portal de Vendas — relacionados ao BR
                  {loadingRel && <span style={{ fontSize: 11, color: T.inkFaint, fontWeight: 400 }}>carregando…</span>}
                </div>

                {!loadingRel && pedidosRel.length === 0 && propostasRel.length === 0 && (
                  <p style={{ fontSize: 12, color: T.inkFaint, margin: 0 }}>
                    Nenhum pedido ou proposta encontrado para {[detalhe.projeto_br, detalhe.projeto_br_retorno].filter(Boolean).join(' / ')} no portal de vendas.
                  </p>
                )}

                {propostasRel.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                      Propostas ({propostasRel.length})
                    </div>
                    {propostasRel.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: T.panelAlt, borderRadius: 6, marginBottom: 5 }}>
                        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, fontSize: 12, flexShrink: 0, width: 110 }}>{p.br}</span>
                        <span style={{ fontSize: 12, color: T.ink, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.cliente}</span>
                        <span style={{ fontSize: 11, color: T.inkDim, flexShrink: 0, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.escopo}</span>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                          background: p.status === 'concluida' ? T.oliveSoft : p.status === 'reprovada' ? T.rustSoft : T.amberSoft,
                          color:      p.status === 'concluida' ? T.oliveText : p.status === 'reprovada' ? T.rustText  : T.amberText,
                        }}>{p.status}</span>
                        {Number(p.valor_liquido) > 0 && <span style={{ fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{fmtMoedaCompacta(Number(p.valor_liquido))}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {pedidosRel.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                      Pedidos de venda Sankhya ({pedidosRel.length})
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${T.line}`, background: T.panelAlt }}>
                            {['BR','Nota','Cliente','Produto','Data','Valor'].map(h => (
                              <th key={h} style={{ ...thFat(h === 'Valor' ? 80 : 0, h === 'Valor' ? 'right' : 'left'), fontSize: 10.5 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pedidosRel.map((p, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                              <td style={{ padding: '7px 10px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, fontSize: 11, whiteSpace: 'nowrap' }}>{p.br}</td>
                              <td style={{ padding: '7px 10px', fontFamily: FONT_DISPLAY, fontSize: 11 }}>{p.numnota}</td>
                              <td style={{ padding: '7px 10px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.cliente_nome}>{p.cliente_nome}</td>
                              <td style={{ padding: '7px 10px', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: T.inkDim }} title={p.produto_descricao}>{p.produto_descricao}</td>
                              <td style={{ padding: '7px 10px', whiteSpace: 'nowrap', color: T.inkDim }}>{fmtData(p.data_neg)}</td>
                              <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{fmtMoedaCompacta(Number(p.valor_liquido) || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Overlay>
      )}
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
function RevisaoResponsaveisPropostas() {
  const [itens, setItens] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvandoId, setSalvandoId] = useState(null);
  const [selecoes, setSelecoes] = useState({}); // proposta_id -> colaborador_id escolhido
  const [aberto, setAberto] = useState(() => localStorage.getItem('revisaoResponsaveis_oculto') !== 'true');

  const alternarAberto = () => {
    setAberto(a => {
      const novo = !a;
      localStorage.setItem('revisaoResponsaveis_oculto', novo ? 'false' : 'true');
      return novo;
    });
  };

  const carregar = useCallback(async () => {
    setLoading(true);
    const [{ data: colabs }, { data: asaelRow }] = await Promise.all([
      supabase.from('colaboradores').select('id,nome').eq('ativo', true).order('nome'),
      supabase.from('colaboradores').select('id').eq('nome', 'Asael Abdon').maybeSingle(),
    ]);
    setColaboradores(colabs || []);

    const queries = [];
    if (asaelRow?.id) {
      queries.push(
        supabase.from('propostas').select('id,br,cliente,valor_liquido,responsavel_id').eq('responsavel_id', asaelRow.id)
      );
    }
    const { data: urgentes } = await supabase.from('propostas_revisao_manual_urgente').select('proposta_id,br,motivo');
    const idsUrgentes = (urgentes || []).map(u => u.proposta_id);
    if (idsUrgentes.length) {
      queries.push(supabase.from('propostas').select('id,br,cliente,valor_liquido,responsavel_id').in('id', idsUrgentes));
    }

    const resultados = await Promise.all(queries);
    const mapa = new Map();
    resultados.forEach(r => (r.data || []).forEach(p => mapa.set(p.id, p)));
    const motivoPorId = Object.fromEntries((urgentes || []).map(u => [u.proposta_id, u.motivo]));
    const lista = [...mapa.values()].map(p => ({ ...p, motivo_urgente: motivoPorId[p.id] || null }));
    setItens(lista);
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const confirmar = async (propostaId) => {
    const colabId = selecoes[propostaId];
    if (!colabId) return;
    setSalvandoId(propostaId);
    await supabase.from('propostas').update({ responsavel_id: colabId }).eq('id', propostaId);
    await supabase.from('propostas_revisao_manual_urgente').delete().eq('proposta_id', propostaId);
    setItens(prev => prev.filter(i => i.id !== propostaId));
    setSalvandoId(null);
  };

  if (loading) return null;
  if (itens.length === 0) return null;

  return (
    <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}44`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} color={T.amberText} />
          <strong style={{ fontSize: 13.5, color: T.amberText }}>{itens.length} proposta(s) precisam confirmar quem fez de verdade</strong>
        </div>
        <button onClick={alternarAberto}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: T.amberText, background: 'transparent', border: `1px solid ${T.amber}66`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
          {aberto ? 'Ocultar' : 'Expandir'}
          <ChevronDown size={13} style={{ transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
        </button>
      </div>
      {aberto && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, color: T.inkDim, margin: '0 0 4px' }}>
            Essas propostas foram feitas por uma automação (ou tiveram o responsável perdido numa correção) — escolhe quem fez de verdade pra pontuação ficar certa.
          </p>
          {itens.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.panel, borderRadius: 8, padding: '10px 14px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{p.br}</span>
                <span style={{ fontSize: 12, color: T.inkFaint }}> — {p.cliente || '—'}</span>
                {p.motivo_urgente && (
                  <div style={{ fontSize: 10.5, color: T.rustText, marginTop: 2 }}>⚠ {p.motivo_urgente}</div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <select value={selecoes[p.id] || ''} onChange={e => setSelecoes(s => ({ ...s, [p.id]: e.target.value }))}
                  style={{ ...inputStyle(), fontSize: 12, padding: '6px 24px 6px 10px', appearance: 'none', minWidth: 180 }}>
                  <option value="">Quem fez de verdade?</option>
                  {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: 9, color: T.inkFaint, pointerEvents: 'none' }} />
              </div>
              <button onClick={() => confirmar(p.id)} disabled={!selecoes[p.id] || salvandoId === p.id}
                style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: T.oliveText, border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', opacity: (!selecoes[p.id] || salvandoId === p.id) ? 0.5 : 1 }}>
                {salvandoId === p.id ? 'Salvando…' : '✓ Confirmar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Produtividade({ currentUser }) {
  const agora = new Date();
  const hoje = agora.toISOString().slice(0, 10);
  const primeiroDiaMes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01`;
  const [periodo, setPeriodo] = useState({ dataIni: primeiroDiaMes, dataFim: hoje });
  const [pedidos, setPedidos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Usuários sem visão completa (ve_produtividade_completa = false) só veem os próprios números.
  // O filtro compara pelo login do Sankhya (sankhya_usuario), não pelo nome cadastrado no portal —
  // os dados sincronizados vêm com o usuário do ERP (ex: "EDSON.J"), que é diferente do nome de exibição.
  const veTudo = currentUser?.ve_produtividade_completa === true;

  const carregarDados = useCallback(async () => {
    setLoading(true);
    let q1 = supabase.from('produtividade_pedidos').select('*').eq('data_ini', periodo.dataIni).eq('data_fim', periodo.dataFim).order('total_pedidos', { ascending: false });
    let q2 = supabase.from('produtividade_orcamentos').select('*').eq('data_ini', periodo.dataIni).eq('data_fim', periodo.dataFim).order('total_geral', { ascending: false });
    if (!veTudo && currentUser?.sankhyaUsuario) {
      q1 = q1.eq('vendedor_nome', currentUser.sankhyaUsuario);
      q2 = q2.eq('orcamentista_nome', currentUser.sankhyaUsuario);
    }
    const [r1, r2, r3] = await Promise.all([
      q1, q2,
      supabase.from('sankhya_sync_log').select('*').eq('tipo', 'produtividade').order('finalizado_em', { ascending: false }).limit(1),
    ]);
    setPedidos(r1.data || []);
    setOrcamentos(r2.data || []);
    setLastSync((r3.data || [])[0] || null);
    setLoading(false);
  }, [periodo, veTudo, currentUser?.nome]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregarDados, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregarDados]);

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

  const [drillDown, setDrillDown] = useState(null); // { tipo: 'pedidos'|'orcamentos', nome: string }

  const maxPedidos = Math.max(...pedidos.map(p => p.total_pedidos), 1);
  const maxOrc = Math.max(...orcamentos.map(o => o.total_geral), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1280 }}>
      {veTudo && <RevisaoResponsaveisPropostas />}

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
                    <tr key={p.vendedor_nome} onClick={() => setDrillDown({ tipo: 'pedidos', nome: p.vendedor_nome })} style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}>
                      <td style={{ padding: '11px 12px', fontWeight: 600, color: T.terracottaText, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{p.vendedor_nome}</td>
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
                    <tr key={o.orcamentista_nome} onClick={() => setDrillDown({ tipo: 'orcamentos', nome: o.orcamentista_nome })} style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}>
                      <td style={{ padding: '11px 12px', fontWeight: 600, color: T.blueText, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{o.orcamentista_nome}</td>
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

      {drillDown && (
        <ModalDrillDownProdutividade
          tipo={drillDown.tipo}
          nome={drillDown.nome}
          periodo={periodo}
          onClose={() => setDrillDown(null)}
        />
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

function ModalDrillDownProdutividade({ tipo, nome, periodo, onClose }) {
  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    const tabela = tipo === 'pedidos' ? 'produtividade_pedidos_detalhe' : 'produtividade_orcamentos_detalhe';
    const campoNome = tipo === 'pedidos' ? 'vendedor_nome' : 'orcamentista_nome';
    const campoData = tipo === 'pedidos' ? 'data_neg' : 'data_emissao';
    supabase.from(tabela).select('*').eq(campoNome, nome)
      .gte(campoData, periodo.dataIni).lte(campoData, periodo.dataFim)
      .order(campoData, { ascending: false })
      .then(({ data }) => { if (ativo) { setLinhas(data || []); setLoading(false); } });
    return () => { ativo = false; };
  }, [tipo, nome, periodo.dataIni, periodo.dataFim]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,23,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div className="scale-in" style={{ background: T.panel, borderRadius: 12, padding: 24, width: 620, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 17 }}>{nome}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 12, color: T.inkFaint, margin: '2px 0 16px' }}>
          {tipo === 'pedidos' ? 'Pedidos confirmados (conhecimento de pedido)' : 'Orçamentos/propostas gerados'} — {periodo.dataIni} a {periodo.dataFim}
        </p>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: T.inkFaint, fontSize: 13 }}>Carregando…</div>
        ) : linhas.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: T.inkFaint, fontSize: 13 }}>Nenhum registro de detalhe encontrado nesse período.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, textAlign: 'left', color: T.inkFaint, fontSize: 11 }}>
                <th style={{ padding: '6px 8px' }}>Data</th>
                <th style={{ padding: '6px 8px' }}>Cliente</th>
                {tipo === 'pedidos' ? <th style={{ padding: '6px 8px', textAlign: 'right' }}>Valor</th> : <th style={{ padding: '6px 8px' }}>Identificação</th>}
              </tr>
            </thead>
            <tbody>
              {linhas.map(l => (
                <tr key={tipo === 'pedidos' ? l.nunota : l.nureg} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '8px' }}>{new Date((tipo === 'pedidos' ? l.data_neg : l.data_emissao) + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '8px' }}>{l.cliente_nome || '—'}</td>
                  {tipo === 'pedidos' ? (
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{fmtMoedaCompacta(l.valor_nota)}</td>
                  ) : (
                    <td style={{ padding: '8px' }}>{l.identificacao || '—'} {l.eh_revisao && <span style={{ fontSize: 10, color: T.rustText }}>(revisão)</span>}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   FATURAMENTO — dados reais do Sankhya (TGFCAB/TGFITE/TGFPAR)
   Botão "Atualizar" dispara a edge function sankhya-faturamento-sync.
============================================================================ */
const MESES_FAT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function Faturamento() {
  const anoAtual = new Date().getFullYear();
  const [filtros, setFiltros] = useState({ anoIni: 2026, anoFim: anoAtual, mesIni: 1, mesFim: 12, vendedor: '' });
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
  const vendedoresRef = useRef([]);
  useEffect(() => { vendedoresRef.current = vendedores; }, [vendedores]);
  const [auditado, setAuditado] = useState({ pedidoBruto: 0, pedidoLiquido: 0, notaBruto: 0, notaLiquido: 0 });
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
    // BUG CORRIGIDO: pedidos_itens/nota_venda_itens só têm vendedor_nome,
    // não vendedor_codigo. Filtrar direto por código fazia a query falhar
    // silenciosamente e voltar vazia sempre que um vendedor era selecionado.
    const vendNome = filtros.vendedor
      ? (vendedoresRef.current.find(v => String(v.codigo) === String(filtros.vendedor))?.nome || null)
      : null;

    // Tudo abaixo (Net Value, Segmento Kalenborn, Segmento de Mercado, Pedido
    // de Venda) vem da MESMA tabela pedidos_itens — garante que os números
    // sempre somam entre si, sem nenhum arredondamento (Number direto da string).
    // O Supabase limita cada resposta a ~1000 linhas por padrão — pedidos_itens e nota_venda_itens
    // já passam ou estão perto disso, então buscamos em lotes até trazer tudo, senão os totais
    // (Net Value, Nota de Venda etc.) ficam sub-contados silenciosamente.
    const buscarPaginado = async (query) => {
      const TAMANHO_LOTE = 1000;
      let todas = [];
      let pagina = 0;
      while (true) {
        const { data, error } = await query.range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
        if (error) return { data: null, error };
        todas = todas.concat(data || []);
        if (!data || data.length < TAMANHO_LOTE) break;
        pagina += 1;
        if (pagina > 100) break;
      }
      return { data: todas, error: null };
    };

    let qItens = supabase.from('pedidos_itens').select('*').gte('data_neg', ini).lte('data_neg', fim);
    if (vendNome) qItens = qItens.eq('vendedor_nome', vendNome);

    // Nota de Venda (bruto) agora tem o MESMO tratamento: fonte por item,
    // agregada no front exatamente como o líquido, com drill-down próprio.
    let qNotaItens = supabase.from('nota_venda_itens').select('*').in('codtipoper', TOPS_FATURAMENTO_VALIDOS).gte('data_neg', ini).lte('data_neg', fim);
    if (vendNome) qNotaItens = qNotaItens.eq('vendedor_nome', vendNome);

    const qVend = supabase.from('sankhya_vendedores').select('*').order('nome');
    const qSync = supabase.from('sankhya_sync_log').select('*').eq('tipo', 'pedidos_itens').order('finalizado_em', { ascending: false }).limit(1);

    // Totais auditados (nível de nota, sem duplicidade, com STATUSNOTA='L' e
    // Net Offer Value real já descontando ICMS/IPI/PIS/COFINS) — fonte
    // sankhya-faturamento-resumo-sync. Mostrados ao lado dos números por
    // item pra conferência; item ainda é usado pros gráficos por produto/segmento.
    let qResumo = supabase.from('faturamento_resumo').select('tipmov,valor_nota,net_offer_value,data_neg').gte('data_neg', ini).lte('data_neg', fim);
    if (vendNome) qResumo = qResumo.eq('vendedor_nome', vendNome);

    const [rItens, rNotaItens, rVend, rSync, rResumo] = await Promise.all([buscarPaginado(qItens), buscarPaginado(qNotaItens), qVend, qSync, qResumo]);
    const itens = rItens.data || [];
    const notaItensData = rNotaItens.data || [];
    const resumo = rResumo.data || [];
    const resumoTotais = { pedidoBruto: 0, pedidoLiquido: 0, notaBruto: 0, notaLiquido: 0 };
    resumo.forEach(r => {
      if (r.tipmov === 'P') { resumoTotais.pedidoBruto += Number(r.valor_nota) || 0; resumoTotais.pedidoLiquido += Number(r.net_offer_value) || 0; }
      if (r.tipmov === 'V') { resumoTotais.notaBruto += Number(r.valor_nota) || 0; resumoTotais.notaLiquido += Number(r.net_offer_value) || 0; }
    });
    setAuditado(resumoTotais);

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

    // Evolução mensal — Nota de Venda (bruto E líquido), fonte exata: faturamento_resumo
    // (nível de nota, TOPs válidos + STATUSNOTA='L' já aplicados na sync).
    const notaMensalMapExato = {};
    resumo.forEach(r => {
      if (r.tipmov !== 'V' || !r.data_neg) return;
      const d = new Date(r.data_neg + 'T00:00:00');
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!notaMensalMapExato[key]) notaMensalMapExato[key] = { bruto: 0, liquido: 0 };
      notaMensalMapExato[key].bruto += (Number(r.valor_nota) || 0);
      notaMensalMapExato[key].liquido += (Number(r.net_offer_value) || 0);
    });
    const notaMensalArr = Object.entries(notaMensalMapExato).map(([key, v]) => {
      const [ano, mes] = key.split('-').map(Number);
      return { ano, mes, valor_bruto: v.bruto, valor_liquido: v.liquido };
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

    // ── Pedidos não faturados: por PEDIDO ÚNICO (NUNOTA), não por BR ──────────
    // NUMPEDIDO é o número de CONTRATO do cliente (se repete entre vários
    // pedidos/entregas do mesmo contrato — ex.: ArcelorMittal) — não serve como
    // identificador único. NUNOTA é o pedido de venda de verdade no Sankhya.
    // Quando o Sankhya vai entregando aos poucos o MESMO pedido (parcial), o
    // item mantém o mesmo NUNOTA e só QTDENTREGUE vai subindo — por isso a
    // pendência certa é por ITEM: quantidade − qtd_entregue, não por comparação
    // solta com nota_venda_itens. Se surge um NUNOTA novo pro mesmo BR (outro
    // equipamento/ordem), é tratado como pedido separado, não somado junto.
    const pedidoPorNunota = {};
    for (const it of itens) {
      if (!it.nunota) continue;
      if (!pedidoPorNunota[it.nunota]) {
        pedidoPorNunota[it.nunota] = {
          nunota: it.nunota, br: it.br || '—', cliente: it.cliente_nome || '—',
          vendedor: it.vendedor_nome || '—', numero_pedido: it.numero_pedido || '—',
          nro_interno: it.nro_interno_sankhya || it.nunota,
          valorPedido: 0, valorPendente: 0, itensPendentes: 0, itensTotal: 0,
        };
      }
      const p = pedidoPorNunota[it.nunota];
      const valor = Number(it.valor_liquido) || 0;
      const qtd = Number(it.quantidade) || 0;
      const entregue = Number(it.qtd_entregue) || 0;
      const pendente = Math.max(0, qtd - entregue);
      p.valorPedido += valor;
      p.itensTotal += 1;
      if (pendente > 0.001) {
        p.itensPendentes += 1;
        // valor pendente proporcional à quantidade que ainda falta entregar
        p.valorPendente += qtd > 0 ? valor * (pendente / qtd) : valor;
      }
    }
    const naoFat = Object.values(pedidoPorNunota)
      .filter(p => p.valorPendente > 100) // filtra ruído de centavos
      .sort((a, b) => b.valorPendente - a.valorPendente);
    setPedidosNaoFat(naoFat);

    setLoading(false);
  }, [filtros]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregarDados, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregarDados]);

  const handleAtualizar = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const { ini, fim } = rangeDatas();

      const [resItens, resNota, resResumo] = await Promise.all([
        fetch(`${SUPABASE_URL}/functions/v1/sankhya-pedidos-itens-sync`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataIni: ini, dataFim: fim }),
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/functions/v1/sankhya-nota-venda-itens-sync`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataIni: ini, dataFim: fim }),
        }).then(r => r.json()),
        // faturamento_resumo (usada na "Conferência auditada" e nos gráficos mensais) — faltava
        // ser chamada aqui, por isso ficava parada mesmo depois de clicar em "Atualizar do Sankhya".
        fetch(`${SUPABASE_URL}/functions/v1/sankhya-faturamento-resumo-sync`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataIni: ini, dataFim: fim }),
        }).then(r => r.json()),
      ]);

      if (resItens.ok && resNota.ok && resResumo.ok) {
        setSyncStatus({ ok: true, message: `Sincronizado: ${resItens.itens_sincronizados} itens de pedido, ${resNota.itens_sincronizados} itens de nota de venda, ${resResumo.notas_sincronizadas} notas (resumo).` });
        await carregarDados();
      } else {
        setSyncStatus({ ok: false, message: resItens.erro || resNota.erro || resResumo.erro || 'Erro desconhecido na sincronização.' });
      }
    } catch (err) {
      setSyncStatus({ ok: false, message: String(err) });
    } finally {
      setSyncing(false);
    }
  };

  const abrirDrillDown = useCallback(async (titulo, filtro, mesInfo) => {
    setDrillDown({ titulo, itens: [] });
    setDrillLoading(true);
    let ini, fim;
    if (mesInfo) {
      ini = `${mesInfo.ano}-${String(mesInfo.mes).padStart(2, '0')}-01`;
      const ultimoDia = new Date(mesInfo.ano, mesInfo.mes, 0).getDate();
      fim = `${mesInfo.ano}-${String(mesInfo.mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    } else {
      ({ ini, fim } = rangeDatas());
    }
    let q = supabase.from('pedidos_itens').select('*').gte('data_neg', ini).lte('data_neg', fim).order('data_neg', { ascending: false });
    if (filtro?.coluna && filtro?.valor) q = q.eq(filtro.coluna, filtro.valor);
    // Paginado — o período pode superar as ~1000 linhas que o Supabase devolve por padrão.
    let dataCompleta = [];
    for (let pagina = 0; pagina < 100; pagina++) {
      const { data } = await q.range(pagina * 1000, (pagina + 1) * 1000 - 1);
      dataCompleta = dataCompleta.concat(data || []);
      if (!data || data.length < 1000) break;
    }
    setDrillDown({ titulo, itens: dataCompleta, campoValor: 'valor_liquido', tipmov: 'P' });
    setDrillLoading(false);
  }, [filtros]);

  const abrirDrillDownNota = useCallback(async (titulo, filtro, mesInfo) => {
    setDrillDown({ titulo, itens: [], campoValor: 'valor_bruto' });
    setDrillLoading(true);
    let ini, fim;
    if (mesInfo) {
      ini = `${mesInfo.ano}-${String(mesInfo.mes).padStart(2, '0')}-01`;
      const ultimoDia = new Date(mesInfo.ano, mesInfo.mes, 0).getDate();
      fim = `${mesInfo.ano}-${String(mesInfo.mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    } else {
      ({ ini, fim } = rangeDatas());
    }
    let q = supabase.from('nota_venda_itens').select('*').in('codtipoper', TOPS_FATURAMENTO_VALIDOS).gte('data_neg', ini).lte('data_neg', fim).order('data_neg', { ascending: false });
    if (filtro?.coluna && filtro?.valor) q = q.eq(filtro.coluna, filtro.valor);
    let dataCompleta = [];
    for (let pagina = 0; pagina < 100; pagina++) {
      const { data } = await q.range(pagina * 1000, (pagina + 1) * 1000 - 1);
      dataCompleta = dataCompleta.concat(data || []);
      if (!data || data.length < 1000) break;
    }
    setDrillDown({ titulo, itens: dataCompleta, campoValor: 'valor_bruto', tipmov: 'V' });
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
    notaVenda.forEach(m => { map[`${m.ano}-${m.mes}`] = { bruto: m.valor_bruto, liquido: m.valor_liquido || 0 }; });
    const out = [];
    for (let ano = filtros.anoIni; ano <= filtros.anoFim; ano++) {
      const mIni = ano === filtros.anoIni ? filtros.mesIni : 1;
      const mFim = ano === filtros.anoFim ? filtros.mesFim : 12;
      for (let mes = mIni; mes <= mFim; mes++) {
        const v = map[`${ano}-${mes}`] || { bruto: 0, liquido: 0 };
        out.push({ ano, mes, valor: v.bruto, valorLiquido: v.liquido });
      }
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

      <button onClick={() => setFiltros(f => ({ ...f, anoIni: 2026, anoFim: anoAtual, mesIni: 1, mesFim: 12 }))} style={{
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
              label="Nota de Venda (faturamento emitido)" valor={auditado.notaBruto || totalNotaVenda} icon={TrendingUp} cor={T.blue} formatador={fmtValor}
              sub={auditado.notaBruto ? 'valor auditado (nível de nota)' : 'aprox. por item — sincronize p/ valor exato'}
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
              sub={`${pedidosNaoFat.length} pedido${pedidosNaoFat.length !== 1 ? 's' : ''} com saldo em aberto`}
              onClick={pedidosNaoFat.length > 0 ? () => setDrillDown({ titulo: 'Pedidos não faturados — por BR', itens: pedidosNaoFat, tipo: 'nao_fat' }) : undefined}
            />
          </div>

          {/* Conferência auditada — nível de nota (faturamento_resumo), sem risco de
              duplicidade por item, com Net Offer Value real (líquido de todos os
              lançamentos de TGFDIN por nota — validado contra planilha real do usuário).
              Só cobre Nota Fiscal (TIPMOV='V'): pedido não usa STATUSNOTA da mesma forma,
              por isso o Net Value de pedido continua vindo do card acima (pedidos_itens). */}
          <Panel title="Conferência auditada — Nota Fiscal (nível de nota)" subtitle="Fonte: faturamento_resumo — Vlr Nota (bruto) e Net Offer Value (líquido), TOPs 3200/3201/3209/3214/3216/3220/3227/3229, STATUSNOTA='L'">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 10 }}>
              {[
                { label: 'Nota — bruto (Vlr Nota)',        valor: auditado.notaBruto,    cor: T.oliveText },
                { label: 'Nota — líquido (Net Offer Value)', valor: auditado.notaLiquido,  cor: T.oliveText },
              ].map(k => (
                <div key={k.label} style={{ background: T.panelAlt, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10.5, color: T.inkFaint, fontWeight: 600 }}>{k.label}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: k.cor, marginTop: 2 }}>{fmtValor(k.valor)}</div>
                </div>
              ))}
            </div>
            {auditado.notaBruto === 0 && (
              <p style={{ fontSize: 11.5, color: T.amberText, marginTop: 10 }}>
                Ainda sem dados — rode a sincronização "faturamento_resumo" (aba Ciclo Comercial) pra popular esses números.
              </p>
            )}
          </Panel>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Panel title="Evolução mensal — Net Value (Pedidos)" subtitle={`${filtros.anoIni === filtros.anoFim ? `${filtros.anoIni}` : `${filtros.anoIni}–${filtros.anoFim}`} · soma de pedidos_itens (TIPMOV='P'), não é valor de propostas`}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 210, padding: '14px 4px 0', overflowX: 'auto' }}>
                {evolucaoMensal.map((m, i) => {
                  const h = Math.max((m.valor / maxMensal) * 160, m.valor > 0 ? 4 : 2);
                  return (
                    <button key={i} onClick={() => abrirDrillDown(`Net Value (Pedidos) — ${MESES_FAT[m.mes - 1]}/${m.ano}`, null, { ano: m.ano, mes: m.mes })}
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

            <Panel title="Evolução mensal — Nota de Venda" subtitle={`${filtros.anoIni === filtros.anoFim ? `${filtros.anoIni}` : `${filtros.anoIni}–${filtros.anoFim}`} · bruto (Vlr Nota) vs líquido (Net Offer Value)`}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 210, padding: '14px 4px 0', overflowX: 'auto' }}>
                {evolucaoMensalNota.map((m, i) => {
                  const hBruto = Math.max((m.valor / maxMensalNota) * 160, m.valor > 0 ? 4 : 2);
                  const hLiquido = Math.max((m.valorLiquido / maxMensalNota) * 160, m.valorLiquido > 0 ? 4 : 2);
                  return (
                    <button key={i} onClick={() => abrirDrillDownNota(`Nota de Venda — ${MESES_FAT[m.mes - 1]}/${m.ano}`, null, { ano: m.ano, mes: m.mes })}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', minWidth: 66, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, marginBottom: 6, color: T.blueText, fontFamily: FONT_DISPLAY, whiteSpace: 'nowrap' }}>{fmtValorCompacto(m.valor)}</div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                        <div title={`Bruto: ${fmtValor(m.valor)}`} style={{
                          width: 22, height: hBruto, borderRadius: '4px 4px 2px 2px', transition: 'height .35s ease, filter .15s',
                          background: `linear-gradient(180deg, ${T.blue} 0%, ${T.blueText} 100%)`,
                        }}
                          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
                          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                        />
                        <div title={`Líquido: ${fmtValor(m.valorLiquido)}`} style={{
                          width: 22, height: hLiquido, borderRadius: '4px 4px 2px 2px', background: T.oliveText,
                        }} />
                      </div>
                      <div style={{ fontSize: 9.5, fontWeight: 600, color: T.oliveText, marginTop: 4, whiteSpace: 'nowrap' }}>{fmtValorCompacto(m.valorLiquido)}</div>
                      <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 6, fontWeight: 500 }}>{MESES_FAT[m.mes - 1]}/{String(m.ano).slice(2)}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11, color: T.inkFaint }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.blueText, borderRadius: 2, marginRight: 4 }} />Bruto (Vlr Nota)</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.oliveText, borderRadius: 2, marginRight: 4 }} />Líquido (Net Offer Value)</span>
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
            title="Pedidos: entregues vs pendentes"
            subtitle={viewFatTab === 'faturados'
              ? 'Comparativo por cliente — pedido de venda confirmado × nota fiscal emitida'
              : 'Por pedido único (NUNOTA) — quantidade ainda não entregue, item a item'}
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
            {viewFatTab === 'nao_faturados' ? (
              pedidosNaoFat.length === 0 ? <EmptyStateFat texto="Nenhum pedido pendente de entrega no período." /> : (
                <div style={{ overflowX: 'auto', marginTop: 10 }}>
                  <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '0 0 8px' }}>
                    Cada linha é um PEDIDO ÚNICO (NUNOTA do Sankhya, não o número de contrato — que pode se repetir em vários pedidos do mesmo cliente, ex.: ArcelorMittal). "Falta entregar" soma, item a item, (quantidade − qtd. já entregue) × valor unitário — não depende de casar com nota fiscal. Ordenado do que falta mais.
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                        <th style={thFat()}>BR</th>
                        <th style={thFat()}>Pedido (NUNOTA)</th>
                        <th style={thFat()}>Contrato</th>
                        <th style={thFat()}>Cliente</th>
                        <th style={thFat()}>Vendedor</th>
                        <th style={thFat(0, 'right')}>Valor pedido</th>
                        <th style={thFat(0, 'right')}>Falta entregar</th>
                        <th style={thFat(120)}>Itens pendentes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosNaoFat.map(p => {
                        const cobertura = p.itensTotal > 0 ? Math.min(((p.itensTotal - p.itensPendentes) / p.itensTotal) * 100, 100) : 0;
                        const cor = cobertura >= 80 ? T.oliveText : cobertura >= 40 ? T.amberText : T.rustText;
                        return (
                          <tr key={p.nunota} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: FONT_DISPLAY, color: T.blueText }}>{p.br}</td>
                            <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.inkDim }}>{p.nro_interno}</td>
                            <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.inkFaint, fontSize: 11.5 }}>{p.numero_pedido}</td>
                            <td style={{ padding: '10px 12px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.cliente}>{p.cliente}</td>
                            <td style={{ padding: '10px 12px', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: T.inkDim, fontSize: 11.5 }} title={p.vendedor}>{p.vendedor}</td>
                            <td style={{ ...tdFat(), color: T.ink, fontWeight: 600 }}>{fmtValorCompacto(p.valorPedido)}</td>
                            <td style={{ ...tdFat(), color: T.rustText, fontWeight: 700 }}>{fmtValorCompacto(p.valorPendente)}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, background: T.lineSoft, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ width: `${cobertura}%`, height: '100%', background: cor, borderRadius: 3, transition: 'width .3s' }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: cor, width: 42, textAlign: 'right' }}>{p.itensTotal - p.itensPendentes}/{p.itensTotal}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : topClientes.length === 0 ? <EmptyStateFat /> : (
              <div style={{ overflowX: 'auto', marginTop: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.line}` }}>
                      <th style={thFat()}>Cliente</th>
                      <th style={thFat(0, 'right')}>Pedidos</th>
                      <th style={thFat(0, 'right')}>Valor pedido</th>
                      <th style={thFat(0, 'right')}>Nota emitida</th>
                      <th style={thFat(120)}>Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClientes.map(c => ({
                      ...c,
                      faturado: c.faturado || 0,
                      nao_faturado: Math.max(c.valor - (c.faturado || 0), 0),
                    })).map(c => {
                      const cobertura = c.valor > 0 ? Math.min((c.faturado / c.valor) * 100, 100) : 0;
                      const cor = cobertura >= 80 ? T.oliveText : cobertura >= 40 ? T.amberText : T.rustText;
                      return (
                        <tr key={c.nome} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.nome}>{c.nome}</td>
                          <td style={tdFat()}>{c.qtd_pedidos}</td>
                          <td style={{ ...tdFat(), color: T.ink, fontWeight: 600 }}>{fmtValorCompacto(c.valor)}</td>
                          <td style={{ ...tdFat(), color: T.blueText, fontWeight: 600 }}>{fmtValorCompacto(c.faturado)}</td>
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
        <DrillDownPedidos titulo={drillDown.titulo} itens={drillDown.itens} loading={drillLoading} onClose={() => setDrillDown(null)} campoValor={drillDown.campoValor} tipmov={drillDown.tipmov} />
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
  const [pedidosDetalhe, setPedidosDetalhe] = useState([]); // pedidos individuais desse código (BR, cliente, peças)
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
    const codigo = codigoBusca.trim();
    const [rVariacao, rPedidos] = await Promise.all([
      supabase.from('v_variacao_preco_item').select('*').eq('codigo_vale', codigo).order('ano').order('mes'),
      // Pedidos individuais desse código — quais BRs/clientes/quantas peças, pra ver quem consumiu.
      supabase.from('v_pedidos_vale').select('data_neg,br,client,uf,qtd_pecas,cod_sankhya,numero,month_nome,ano')
        .eq('cod_vale', codigo).order('data_neg', { ascending: false }),
    ]);
    setResultado(rVariacao.data || []);
    setPedidosDetalhe(rPedidos.data || []);
    setLoading(false);
  };

  const maxValor = Math.max(...resultado.map(r => Number(r.valor_medio) || 0), 1);
  const primeiro = resultado[0];
  const ultimo = resultado[resultado.length - 1];
  const variacaoPct = primeiro && ultimo && Number(primeiro.valor_medio) > 0
    ? ((Number(ultimo.valor_medio) - Number(primeiro.valor_medio)) / Number(primeiro.valor_medio)) * 100
    : null;
  const totalPecasEncontradas = pedidosDetalhe.reduce((s, p) => s + (Number(p.qtd_pecas) || 0), 0);

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

          {pedidosDetalhe.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pedidos que usaram esse código
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: T.terracottaText, fontFamily: FONT_DISPLAY }}>
                  {new Intl.NumberFormat('pt-BR').format(totalPecasEncontradas)} peças no total
                </span>
              </div>
              <div style={{ overflowX: 'auto', border: `1px solid ${T.line}`, borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                      <th style={thFat()}>Data</th>
                      <th style={thFat()}>BR (Projeto)</th>
                      <th style={thFat(0)}>Cliente</th>
                      <th style={thFat(60)}>UF</th>
                      <th style={{ ...thFat(100), textAlign: 'right' }}>Qtd peças</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosDetalhe.map((p, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                        <td style={{ padding: '8px 10px', color: T.inkDim, whiteSpace: 'nowrap', fontFamily: FONT_DISPLAY }}>{p.data_neg ? new Date(p.data_neg).toLocaleDateString('pt-BR') : '—'}</td>
                        <td style={{ padding: '8px 10px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{p.br || '—'}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.client || '—'}</td>
                        <td style={{ padding: '8px 10px', color: T.inkFaint }}>{p.uf || '—'}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{new Intl.NumberFormat('pt-BR').format(Number(p.qtd_pecas) || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
      position: 'relative', textAlign: 'left', border: `1px solid ${T.line}`, background: T.panel, borderRadius: 12,
      padding: '20px 20px 18px', boxShadow: SHADOW_SM, cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow .25s ease, transform .25s ease, border-color .25s ease', width: '100%', overflow: 'hidden',
    }}
      onMouseEnter={onClick ? (e => { e.currentTarget.style.boxShadow = SHADOW_LG; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${cor}33`; }) : undefined}
      onMouseLeave={onClick ? (e => { e.currentTarget.style.boxShadow = SHADOW_SM; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = T.line; }) : undefined}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: cor, opacity: 0.85 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, color: T.inkFaint, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${cor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={cor} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.ink, marginTop: 15, fontSize: 32, letterSpacing: '-0.015em', lineHeight: 1 }}>{fmt(valor)}</div>
      {onClick ? (
        <div style={{ fontSize: 10, color: cor, marginTop: 8, fontWeight: 700, letterSpacing: '0.01em' }}>Ver itens do período →</div>
      ) : sub ? (
        <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 6, lineHeight: 1.4 }}>{sub}</div>
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

function DrillDownPedidos({ titulo, itens, loading, onClose, campoValor = 'valor_liquido', tipmov }) {
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
                <th style={thFat(90)}>Sankhya</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : itens.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Sem itens no período.</td></tr>
              ) : itens.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(p.data_neg)}</td>
                  <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{p.br || '—'}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.cliente_nome}>{p.cliente_nome}</td>
                  <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{p.vendedor_nome || '—'}</td>
                  <td style={{ padding: '9px 12px', color: T.inkDim, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.produto_descricao}>{p.produto_descricao}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{fmtMoeda(p[campoValor])}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <BotaoAbrirSankhya nunota={p.nunota} tipmov={tipmov} codtipoper={p.codtipoper} label="Abrir" />
                  </td>
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
  const totalPedido = clientes.reduce((s, c) => s + c.valorPedido, 0);
  return (
    <Overlay onClose={onClose}>
      <div className="scale-in" style={{
        background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 820,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, margin: 0 }}>{titulo}</h2>
            <p style={{ fontSize: 12, color: T.inkFaint, margin: '3px 0 0' }}>
              {clientes.length} pedido{clientes.length !== 1 ? 's' : ''} · {fmtValor(totalNaoFat)} em aberto de {fmtValor(totalPedido)} em pedidos
            </p>
            <p style={{ fontSize: 11.5, color: T.inkFaint, margin: '4px 0 0' }}>
              Falta faturar = valor do pedido − o que já foi faturado desse mesmo BR (em qualquer data).
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.inkFaint }}><X size={20} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                <th style={thFat()}>#</th>
                <th style={thFat()}>BR</th>
                <th style={thFat()}>Cliente</th>
                <th style={thFat(0, 'right')}>Valor pedido</th>
                <th style={thFat(0, 'right')}>Já faturado</th>
                <th style={thFat(0, 'right')}>Falta faturar</th>
                <th style={thFat(120)}>Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: T.oliveText, fontWeight: 600 }}>✓ Tudo faturado no período.</td></tr>
              ) : clientes.map((c, i) => {
                const cob = c.valorPedido > 0 ? Math.min((c.faturado / c.valorPedido) * 100, 100) : 0;
                const cor = cob >= 80 ? T.oliveText : cob >= 40 ? T.amberText : T.rustText;
                return (
                  <tr key={c.br} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '10px 12px', color: T.inkFaint, fontFamily: FONT_DISPLAY, fontSize: 11 }}>#{i + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: FONT_DISPLAY, color: T.blueText }}>{c.br}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.cliente}>{c.cliente}</td>
                    <td style={{ ...tdFat(), color: T.ink, fontWeight: 600 }}>{fmtValor(c.valorPedido)}</td>
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

// Situação real do apontamento de produção no Sankhya: C = Concluído (Finalizado), P = Pendente (Em andamento).
const SITUACAO_OP_LABEL = { C: 'Finalizado', P: 'Em andamento' };

function AnaliticoMP() {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const [filtros, setFiltros] = useState({ anoIni: anoAtual, anoFim: anoAtual, mesIni: mesAtual, mesFim: mesAtual });
  const [linhasGeral, setLinhasGeral] = useState([]);
  const [loadingGeral, setLoadingGeral] = useState(true);
  const [erroGeral, setErroGeral] = useState(null);

  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [codigoAtual, setCodigoAtual] = useState(null); // código da MP selecionada — refaz a busca se o período mudar
  const [dados, setDados] = useState(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [erroDetalhe, setErroDetalhe] = useState(null);
  const [sortCol, setSortCol] = useState('data_ref');
  const [sortDir, setSortDir] = useState('desc');
  const detalheRef = useRef(null);
  const dadosRef = useRef(null); // aponta pro início do CONTEÚDO carregado (KPIs/gráfico/tabela), não pra caixa de busca
  const [projetoSelecionado, setProjetoSelecionado] = useState(null); // BR selecionado pro drill-down de projeto
  const projetoRef = useRef(null);
  const [buscaProjeto, setBuscaProjeto] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState(null); // 'YYYY-MM' — drill-down do gráfico mensal
  const [notaVendaItensRaw, setNotaVendaItensRaw] = useState([]); // itens brutos de faturamento (pra poder quebrar por projeto)
  const [loadingMargem, setLoadingMargem] = useState(true);
  const [situacaoSelecionada, setSituacaoSelecionada] = useState(null); // 'C' | 'P' — drill-down Finalizado x Em andamento
  const [produtoMargemSelecionado, setProdutoMargemSelecionado] = useState(null); // código do produto — drill-down de margem por projeto
  const [sortMargemCol, setSortMargemCol] = useState('faturado');
  const [sortMargemDir, setSortMargemDir] = useState('desc');

  const rangeDatas = useCallback(() => {
    const ini = `${filtros.anoIni}-${String(filtros.mesIni).padStart(2, '0')}-01`;
    const ultimoDia = new Date(filtros.anoFim, filtros.mesFim, 0).getDate();
    const fim = `${filtros.anoFim}-${String(filtros.mesFim).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    return { ini, fim };
  }, [filtros]);

  // Visão geral: carrega todos os apontamentos do período pra montar os rankings e KPIs consolidados.
  const carregarGeral = useCallback(async () => {
    setLoadingGeral(true);
    setErroGeral(null);
    const { ini, fim } = rangeDatas();

    // O Supabase limita cada resposta a ~1000 linhas, mesmo pedindo mais via .range() —
    // por isso buscamos em lotes de 1000 até não vir mais nada.
    const TAMANHO_LOTE = 1000;
    let todasLinhas = [];
    let pagina = 0;
    while (true) {
      const { data, error } = await supabase.from('producao_mp_apontamentos')
        .select('nuapo,cod_materia_prima,desc_materia_prima,unidade_mp,cod_prod_acabado,desc_prod_acabado,br,qtd_mp,custo_total,data_ref,situacao_op')
        .gte('data_ref', ini).lte('data_ref', fim)
        .range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
      if (error) { setErroGeral(error.message); setLoadingGeral(false); return; }
      todasLinhas = todasLinhas.concat(data || []);
      if (!data || data.length < TAMANHO_LOTE) break;
      pagina += 1;
      if (pagina > 100) break; // teto de segurança (100k linhas)
    }

    setLinhasGeral(todasLinhas);
    setLoadingGeral(false);
  }, [rangeDatas]);

  useEffect(() => { carregarGeral(); }, [carregarGeral]);

  // Carrega o faturado por produto no mesmo período — pra cruzar com o custo de MP e calcular margem.
  // Mesma fonte/lógica da aba Faturamento (nota_venda_itens, TOPs de venda validados).
  // Guardamos a lista BRUTA (não só agregada) pra poder quebrar margem por projeto também.
  useEffect(() => {
    const carregarFaturamento = async () => {
      setLoadingMargem(true);
      const { ini, fim } = rangeDatas();
      const TAMANHO_LOTE = 1000;
      let todasLinhas = [];
      let pagina = 0;
      while (true) {
        const { data, error } = await supabase.from('nota_venda_itens')
          .select('cod_produto,produto_descricao,valor_bruto,br,quantidade,cliente_nome')
          .in('codtipoper', TOPS_FATURAMENTO_VALIDOS)
          .gte('data_neg', ini).lte('data_neg', fim)
          .range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
        if (error) break;
        todasLinhas = todasLinhas.concat(data || []);
        if (!data || data.length < TAMANHO_LOTE) break;
        pagina += 1;
        if (pagina > 100) break;
      }
      setNotaVendaItensRaw(todasLinhas);
      setLoadingMargem(false);
    };
    carregarFaturamento();
  }, [filtros]);

  // Faturado agregado por produto (derivado da lista bruta acima).
  const faturamentoPorProduto = useMemo(() => {
    const mapa = {};
    notaVendaItensRaw.forEach(it => {
      if (!it.cod_produto) return;
      if (!mapa[it.cod_produto]) mapa[it.cod_produto] = { faturado: 0, descricao: it.produto_descricao };
      mapa[it.cod_produto].faturado += Number(it.valor_bruto) || 0;
    });
    return mapa;
  }, [notaVendaItensRaw]);

  const overview = useMemo(() => {
    const mpMap = {}, prodMap = {}, brMap = {}, mesMap = {};
    const opsSet = new Set(), mpSet = new Set(), prodSet = new Set(), brSet = new Set();
    let custoTotalGeral = 0, custoFinalizado = 0, custoAndamento = 0;

    linhasGeral.forEach(l => {
      opsSet.add(l.nuapo);
      const custo = Number(l.custo_total) || 0;
      custoTotalGeral += custo;
      if (l.situacao_op === 'C') custoFinalizado += custo;
      else if (l.situacao_op === 'P') custoAndamento += custo;

      if (l.cod_materia_prima) {
        mpSet.add(l.cod_materia_prima);
        if (!mpMap[l.cod_materia_prima]) mpMap[l.cod_materia_prima] = { codigo: l.cod_materia_prima, descricao: l.desc_materia_prima, custo: 0, qtd: 0, unidade: l.unidade_mp };
        mpMap[l.cod_materia_prima].custo += custo;
        mpMap[l.cod_materia_prima].qtd += Number(l.qtd_mp) || 0;
      }
      if (l.cod_prod_acabado) {
        prodSet.add(l.cod_prod_acabado);
        if (!prodMap[l.cod_prod_acabado]) prodMap[l.cod_prod_acabado] = { codigo: l.cod_prod_acabado, descricao: l.desc_prod_acabado, custo: 0 };
        prodMap[l.cod_prod_acabado].custo += custo;
      }
      if (l.br && l.br !== '<SEM PROJETO>') {
        brSet.add(l.br);
        if (!brMap[l.br]) brMap[l.br] = { br: l.br, custo: 0 };
        brMap[l.br].custo += custo;
      }
      if (l.data_ref) {
        const mesKey = l.data_ref.slice(0, 7); // YYYY-MM
        if (!mesMap[mesKey]) mesMap[mesKey] = { mes: mesKey, custo: 0 };
        mesMap[mesKey].custo += custo;
      }
    });

    return {
      totalOPs: opsSet.size,
      totalMPs: mpSet.size,
      totalProdutos: prodSet.size,
      totalProjetos: brSet.size,
      custoTotalGeral, custoFinalizado, custoAndamento,
      topMPs: Object.values(mpMap).sort((a, b) => b.custo - a.custo).slice(0, 8),
      topProdutos: Object.values(prodMap).sort((a, b) => b.custo - a.custo).slice(0, 8),
      topProjetos: Object.values(brMap).sort((a, b) => b.custo - a.custo).slice(0, 8),
      custoPorMes: Object.values(mesMap).sort((a, b) => a.mes.localeCompare(b.mes)),
      prodMapCompleto: prodMap,
      mpMapCompleto: mpMap,
      brMapCompleto: brMap,
      brsDisponiveis: [...brSet].sort(),
    };
  }, [linhasGeral]);

  // Drill-down de projeto: todo o custo de matéria-prima dentro de um BR específico,
  // calculado sobre os mesmos dados já carregados (sem nova busca no banco).
  const dadosProjeto = useMemo(() => {
    if (!projetoSelecionado) return null;
    const itensDoProjeto = linhasGeral.filter(l => l.br === projetoSelecionado);
    const mpMap = {}, prodMap = {};
    const prodSet = new Set(), opsSet = new Set();
    let custoTotal = 0;

    itensDoProjeto.forEach(l => {
      opsSet.add(l.nuapo);
      const custo = Number(l.custo_total) || 0;
      custoTotal += custo;
      if (l.cod_materia_prima) {
        if (!mpMap[l.cod_materia_prima]) mpMap[l.cod_materia_prima] = { codigo: l.cod_materia_prima, descricao: l.desc_materia_prima, custo: 0, qtd: 0, unidade: l.unidade_mp };
        mpMap[l.cod_materia_prima].custo += custo;
        mpMap[l.cod_materia_prima].qtd += Number(l.qtd_mp) || 0;
      }
      if (l.cod_prod_acabado) {
        prodSet.add(l.cod_prod_acabado);
        if (!prodMap[l.cod_prod_acabado]) prodMap[l.cod_prod_acabado] = { codigo: l.cod_prod_acabado, descricao: l.desc_prod_acabado, custo: 0 };
        prodMap[l.cod_prod_acabado].custo += custo;
      }
    });

    return {
      br: projetoSelecionado,
      custoTotal,
      totalOPs: opsSet.size,
      totalMPs: Object.keys(mpMap).length,
      totalProdutos: prodSet.size,
      topMPs: Object.values(mpMap).sort((a, b) => b.custo - a.custo),
      topProdutos: Object.values(prodMap).sort((a, b) => b.custo - a.custo).slice(0, 8),
      itens: [...itensDoProjeto].sort((a, b) => (b.data_ref || '').localeCompare(a.data_ref || '')),
    };
  }, [projetoSelecionado, linhasGeral]);

  const selecionarProjeto = (br) => {
    setProjetoSelecionado(br);
    setTimeout(() => projetoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  // Margem por produto: cruza o faturado (nota_venda_itens) com o custo de MP consumido
  // (producao_mp_apontamentos), pro mesmo produto acabado no mesmo período.
  const margemPorProduto = useMemo(() => {
    const codigos = new Set([...Object.keys(overview.prodMapCompleto || {}), ...Object.keys(faturamentoPorProduto)]);
    const linhas = [...codigos].map(cod => {
      const custoInfo = overview.prodMapCompleto?.[cod];
      const fatInfo = faturamentoPorProduto[cod];
      const custo = custoInfo?.custo || 0;
      const faturado = fatInfo?.faturado || 0;
      const margem = faturado - custo;
      const margemPct = faturado > 0 ? (margem / faturado) * 100 : null;
      return {
        codigo: cod,
        descricao: custoInfo?.descricao || fatInfo?.descricao || cod,
        custo, faturado, margem, margemPct,
        temAmbos: !!custoInfo && !!fatInfo,
      };
    });
    return linhas
      .filter(l => l.temAmbos) // só onde dá pra calcular margem de verdade (tem os dois lados)
      .sort((a, b) => b.faturado - a.faturado);
  }, [overview.prodMapCompleto, faturamentoPorProduto]);

  const margemPorProdutoOrdenado = useMemo(() => {
    return [...margemPorProduto].sort((a, b) => {
      let va = a[sortMargemCol], vb = b[sortMargemCol];
      if (sortMargemCol === 'margemPct') { va = va ?? -Infinity; vb = vb ?? -Infinity; }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortMargemDir === 'asc' ? -1 : 1;
      if (va > vb) return sortMargemDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [margemPorProduto, sortMargemCol, sortMargemDir]);

  const handleSortMargem = (col) => {
    if (sortMargemCol === col) setSortMargemDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortMargemCol(col); setSortMargemDir('desc'); }
  };

  // Drill-down do gráfico mensal: TODAS as matérias-primas e projetos daquele mês (não só top 8).
  const mesDrill = useMemo(() => {
    if (!mesSelecionado) return null;
    const itensDoMes = linhasGeral.filter(l => l.data_ref && l.data_ref.slice(0, 7) === mesSelecionado);
    const mpMap = {}, brMap = {};
    let custoTotal = 0;
    itensDoMes.forEach(l => {
      const custo = Number(l.custo_total) || 0;
      custoTotal += custo;
      if (l.cod_materia_prima) {
        if (!mpMap[l.cod_materia_prima]) mpMap[l.cod_materia_prima] = { codigo: l.cod_materia_prima, descricao: l.desc_materia_prima, custo: 0 };
        mpMap[l.cod_materia_prima].custo += custo;
      }
      if (l.br && l.br !== '<SEM PROJETO>') {
        if (!brMap[l.br]) brMap[l.br] = { br: l.br, custo: 0 };
        brMap[l.br].custo += custo;
      }
    });
    return {
      mes: mesSelecionado,
      custoTotal,
      todasMPs: Object.values(mpMap).sort((a, b) => b.custo - a.custo),
      todosProjetos: Object.values(brMap).sort((a, b) => b.custo - a.custo),
    };
  }, [mesSelecionado, linhasGeral]);

  // Drill-down Finalizado x Em andamento: TODOS os projetos daquela situação.
  const situacaoDrill = useMemo(() => {
    if (!situacaoSelecionada) return null;
    const itensDaSituacao = linhasGeral.filter(l => l.situacao_op === situacaoSelecionada);
    const brMap = {};
    let custoTotal = 0;
    itensDaSituacao.forEach(l => {
      const custo = Number(l.custo_total) || 0;
      custoTotal += custo;
      if (l.br && l.br !== '<SEM PROJETO>') {
        if (!brMap[l.br]) brMap[l.br] = { br: l.br, custo: 0, ops: new Set() };
        brMap[l.br].custo += custo;
        brMap[l.br].ops.add(l.nuapo);
      }
    });
    return {
      situacao: situacaoSelecionada,
      custoTotal,
      todosProjetos: Object.values(brMap).map(p => ({ br: p.br, custo: p.custo, numOps: p.ops.size })).sort((a, b) => b.custo - a.custo),
    };
  }, [situacaoSelecionada, linhasGeral]);

  // Drill-down de margem por projeto: quebra o faturado e o custo de um produto específico
  // entre os diferentes BRs em que ele foi faturado/consumido.
  const margemPorProjetoDoProduto = useMemo(() => {
    if (!produtoMargemSelecionado) return null;
    const faturadoPorBR = {};
    notaVendaItensRaw.filter(it => it.cod_produto === produtoMargemSelecionado).forEach(it => {
      const br = it.br || '<SEM PROJETO>';
      if (!faturadoPorBR[br]) faturadoPorBR[br] = { valor: 0, cliente: it.cliente_nome };
      faturadoPorBR[br].valor += Number(it.valor_bruto) || 0;
      if (!faturadoPorBR[br].cliente && it.cliente_nome) faturadoPorBR[br].cliente = it.cliente_nome;
    });
    const custoPorBR = {};
    const itensDoProduto = linhasGeral.filter(l => l.cod_prod_acabado === produtoMargemSelecionado);
    itensDoProduto.forEach(l => {
      const br = l.br || '<SEM PROJETO>';
      if (!custoPorBR[br]) custoPorBR[br] = 0;
      custoPorBR[br] += Number(l.custo_total) || 0;
    });
    const brs = new Set([...Object.keys(faturadoPorBR), ...Object.keys(custoPorBR)]);
    const linhas = [...brs].map(br => {
      const faturado = faturadoPorBR[br]?.valor || 0;
      const custo = custoPorBR[br] || 0;
      const margem = faturado - custo;
      return { br, cliente: faturadoPorBR[br]?.cliente || null, faturado, custo, margem, margemPct: faturado > 0 ? (margem / faturado) * 100 : null };
    }).sort((a, b) => b.faturado - a.faturado);

    // Quebra do custo total por matéria-prima (todas as MPs que compõem esse produto, no período todo).
    const custoPorMP = {};
    itensDoProduto.forEach(l => {
      const codigo = l.cod_materia_prima;
      if (!codigo) return;
      if (!custoPorMP[codigo]) custoPorMP[codigo] = { codigo, descricao: l.desc_materia_prima, custo: 0, qtd: 0 };
      custoPorMP[codigo].custo += Number(l.custo_total) || 0;
      custoPorMP[codigo].qtd += Number(l.qtd_mp) || 0;
    });
    const materiaisPrima = Object.values(custoPorMP).sort((a, b) => b.custo - a.custo);

    const info = margemPorProduto.find(m => m.codigo === produtoMargemSelecionado);
    return { codigo: produtoMargemSelecionado, descricao: info?.descricao || produtoMargemSelecionado, linhas, materiaisPrima };
  }, [produtoMargemSelecionado, notaVendaItensRaw, linhasGeral, margemPorProduto]);

  // Sugestões de código conforme digita (busca em ambas as fontes)
  useEffect(() => {
    if (!busca || busca.length < 2) { setSugestoes([]); return; }
    const t = setTimeout(async () => {
      const [rLista, rApontamentos] = await Promise.all([
        supabase.from('mp_placas_kalocer').select('codigo_mp,descricao')
          .or(`codigo_mp.ilike.%${busca}%,descricao.ilike.%${busca}%`).limit(8),
        supabase.from('producao_mp_apontamentos').select('cod_materia_prima,desc_materia_prima')
          .or(`cod_materia_prima.ilike.%${busca}%,desc_materia_prima.ilike.%${busca}%`).limit(8),
      ]);
      const mapa = new Map();
      (rLista.data || []).forEach(l => mapa.set(l.codigo_mp, l.descricao));
      (rApontamentos.data || []).forEach(l => { if (!mapa.has(l.cod_materia_prima)) mapa.set(l.cod_materia_prima, l.desc_materia_prima); });
      setSugestoes([...mapa.entries()].map(([codigo, descricao]) => ({ codigo, descricao })).slice(0, 8));
    }, 300);
    return () => clearTimeout(t);
  }, [busca]);

  // Sugestões de projeto (BR) — filtro local sobre os dados já carregados, sem nova consulta.
  const sugestoesProjeto = useMemo(() => {
    if (!buscaProjeto || buscaProjeto.length < 2) return [];
    const termo = buscaProjeto.toLowerCase();
    return (overview.brsDisponiveis || []).filter(br => br.toLowerCase().includes(termo)).slice(0, 8);
  }, [buscaProjeto, overview.brsDisponiveis]);

  // Carrega o detalhe de uma matéria-prima específica, respeitando o MESMO período do filtro geral
  // (antes, essa busca ignorava o período e trazia o histórico inteiro — causava datas fora do filtro).
  const carregarDetalhe = useCallback(async (codigo) => {
    setLoadingDetalhe(true);
    setErroDetalhe(null);
    const { ini, fim } = rangeDatas();

    const [rApontamentos, rComposicao] = await Promise.all([
      supabase.from('producao_mp_apontamentos')
        .select('nuapo,seq_pa,data_ref,cod_prod_acabado,desc_prod_acabado,qtd_lote_pa,qtd_mp,unidade_mp,custo_unitario,custo_total,saldo_fisico_mp,saldo_reservado_mp,saldo_disponivel_mp,br,cliente_nome,desc_materia_prima,situacao_op,nro_ordem_producao')
        .eq('cod_materia_prima', codigo)
        .gte('data_ref', ini).lte('data_ref', fim)
        .order('data_ref', { ascending: false }),
      supabase.from('composicao_produtos').select('cod_prod_pai').eq('cod_prod_mp', codigo),
    ]);

    if (rApontamentos.error) { setErroDetalhe(rApontamentos.error.message); setLoadingDetalhe(false); return; }

    const itens = rApontamentos.data || [];

    const produtosAcabadosDistintos = new Set(itens.map(i => i.cod_prod_acabado).filter(Boolean));
    const itensFinalizados = itens.filter(i => i.situacao_op === 'C');
    const itensAndamento = itens.filter(i => i.situacao_op === 'P');
    // "Projetos atendidos" = BRs distintos de ordens JÁ FINALIZADAS (situacao_op = 'C').
    const projetosAtendidos = new Set(itensFinalizados.filter(i => i.br && i.br !== '<SEM PROJETO>').map(i => i.br));
    // "Projetos em andamento" = BRs distintos de ordens AINDA EM PRODUÇÃO (situacao_op = 'P').
    const projetosEmAndamento = new Set(itensAndamento.filter(i => i.br && i.br !== '<SEM PROJETO>').map(i => i.br));
    const custoTotalGeral = itens.reduce((s, i) => s + (Number(i.custo_total) || 0), 0);
    const qtdTotal = itens.reduce((s, i) => s + (Number(i.qtd_mp) || 0), 0);
    const maisRecente = itens[0]; // já vem ordenado por data_ref desc
    const descricao = maisRecente?.desc_materia_prima || '';
    const unidade = maisRecente?.unidade_mp || '';

    // Série histórica de custo unitário (ordem cronológica) — pra ver a variação de preço da MP.
    const historicoCusto = [...itens]
      .filter(i => i.custo_unitario != null)
      .sort((a, b) => a.data_ref.localeCompare(b.data_ref))
      .map(i => ({ data: i.data_ref, valor: Number(i.custo_unitario) }));

    setDados({
      codigo, descricao, unidade,
      itens,
      historicoCusto,
      kpis: {
        produtosAcabados: produtosAcabadosDistintos.size,
        projetosAtendidos: projetosAtendidos.size,
        projetosEmAndamento: projetosEmAndamento.size,
        opsFinalizadas: itensFinalizados.length,
        opsAndamento: itensAndamento.length,
        estoqueFisico: maisRecente?.saldo_fisico_mp ?? null,
        estoqueReservado: maisRecente?.saldo_reservado_mp ?? null,
        estoqueDisponivel: maisRecente?.saldo_disponivel_mp ?? null,
        custoTotal: custoTotalGeral,
        qtdTotal,
      },
    });
    setLoadingDetalhe(false);
  }, [rangeDatas]);

  const selecionar = useCallback((codigo) => {
    setSugestoes([]);
    setCodigoAtual(codigo);
    carregarDetalhe(codigo);
  }, [carregarDetalhe]);

  // Rola pro início do conteúdo carregado (KPIs/gráfico/tabela) assim que os dados chegarem —
  // não pra caixa de busca, que fica bem mais acima do conteúdo de verdade.
  useEffect(() => {
    if (dados) setTimeout(() => dadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [dados]);

  // Se o período mudar com uma MP já selecionada, refaz a busca pro novo período automaticamente.
  useEffect(() => {
    if (codigoAtual) carregarDetalhe(codigoAtual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const itensOrdenados = useMemo(() => {
    if (!dados) return [];
    return [...dados.itens].sort((a, b) => {
      let va = a[sortCol] ?? 0, vb = b[sortCol] ?? 0;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dados, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const LocalSortTh = ({ label, col, right }) => {
    const active = sortCol === col;
    return (
      <th onClick={() => handleSort(col)} style={{ ...thFat(0, right ? 'right' : 'left'), cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <span style={{ color: active ? T.terracotta : T.inkFaint }}>{label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
      </th>
    );
  };

  const fmtQtd = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(v);
  const fmtR = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtRCompacta = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);
  const fmtDataCurta = (iso) => !iso ? '—' : new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  const fmtMesLabel = (iso) => { const [y, m] = iso.split('-'); return `${MESES_LABEL[MESES_ORDEM[Number(m) - 1]]}/${y.slice(2)}`; };

  const RankingBar = ({ label, sub, valor, max, onClick }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none',
      cursor: onClick ? 'pointer' : 'default', padding: '6px 0', textAlign: 'left',
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={e => onClick && (e.currentTarget.style.opacity = '1')}
    >
      <div style={{ width: 130, flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: T.inkFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sub}>{sub}</div>}
      </div>
      <div style={{ flex: 1, background: T.lineSoft, height: 7, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max((valor / max) * 100, 2)}%`, height: '100%', background: T.terracotta, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: T.rustText, fontFamily: FONT_DISPLAY, width: 60, textAlign: 'right', flexShrink: 0 }}>{fmtRCompacta(valor)}</span>
    </button>
  );

  const SortThMargem = ({ label, col, right }) => {
    const ativo = sortMargemCol === col;
    return (
      <th onClick={() => handleSortMargem(col)} style={{ ...thFat(0, right ? 'right' : 'left'), cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
        <span style={{ color: ativo ? T.terracotta : T.inkFaint }}>{label}{ativo ? (sortMargemDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
      </th>
    );
  };

  // Gráfico de barras verticais simples (custo consumido por mês) — SVG puro, sem lib externa.
  const BarChartMensal = ({ dadosMes, mesAtivo, onClickMes }) => {
    if (dadosMes.length === 0) return <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados no período.</div>;
    const W = 900, H = 220, PAD_L = 60, PAD_B = 30, PAD_T = 10;
    const max = Math.max(...dadosMes.map(d => d.custo), 1);
    const larguraBarra = Math.min(60, (W - PAD_L - 20) / dadosMes.length - 10);
    const passo = (W - PAD_L - 20) / dadosMes.length;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={PAD_L} x2={W - 10} y1={PAD_T + (H - PAD_B - PAD_T) * (1 - f)} y2={PAD_T + (H - PAD_B - PAD_T) * (1 - f)} stroke={T.lineSoft} strokeWidth={1} />
        ))}
        {dadosMes.map((d, i) => {
          const alturaBarra = (d.custo / max) * (H - PAD_B - PAD_T);
          const x = PAD_L + i * passo + (passo - larguraBarra) / 2;
          const y = H - PAD_B - alturaBarra;
          const ativo = mesAtivo === d.mes;
          return (
            <g key={d.mes} onClick={() => onClickMes && onClickMes(d.mes)} style={{ cursor: onClickMes ? 'pointer' : 'default' }}>
              <rect x={x} y={y} width={larguraBarra} height={alturaBarra} rx={3} fill={T.terracotta} opacity={ativo ? 1 : 0.75}
                stroke={ativo ? T.ink : 'none'} strokeWidth={ativo ? 2 : 0}>
                <title>{fmtMesLabel(d.mes)}: {fmtR(d.custo)} — clique pra ver o detalhe</title>
              </rect>
              <text x={x + larguraBarra / 2} y={H - PAD_B + 16} textAnchor="middle" fontSize={10} fontWeight={ativo ? 700 : 400} fill={ativo ? T.ink : T.inkFaint}>{fmtMesLabel(d.mes)}</text>
              <text x={x + larguraBarra / 2} y={y - 6} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={T.rustText}>{fmtRCompacta(d.custo)}</text>
            </g>
          );
        })}
        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={H - PAD_B} stroke={T.line} strokeWidth={1} />
        <line x1={PAD_L} x2={W - 10} y1={H - PAD_B} y2={H - PAD_B} stroke={T.line} strokeWidth={1} />
      </svg>
    );
  };

  // Gráfico de linha — variação do custo unitário da MP ao longo do tempo.
  const LineChartCusto = ({ pontos }) => {
    if (pontos.length === 0) return <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem histórico de custo suficiente.</div>;
    if (pontos.length === 1) {
      return <div style={{ padding: 16, fontSize: 13 }}>Único valor no período: <strong>{fmtR(pontos[0].valor)}</strong> em {fmtDataCurta(pontos[0].data)}</div>;
    }
    const W = 900, H = 200, PAD_L = 70, PAD_R = 20, PAD_T = 20, PAD_B = 30;
    const valores = pontos.map(p => p.valor);
    const min = Math.min(...valores), max = Math.max(...valores);
    const span = max - min || 1;
    const passo = (W - PAD_L - PAD_R) / (pontos.length - 1);
    const coordX = (i) => PAD_L + i * passo;
    const coordY = (v) => PAD_T + (H - PAD_T - PAD_B) * (1 - (v - min) / span);
    const linha = pontos.map((p, i) => `${coordX(i)},${coordY(p.valor)}`).join(' ');
    const primeiro = pontos[0].valor, ultimo = pontos[pontos.length - 1].valor;
    const variacaoPct = primeiro !== 0 ? ((ultimo - primeiro) / primeiro) * 100 : 0;
    const subiu = variacaoPct > 0.5, desceu = variacaoPct < -0.5;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {subiu && <ArrowUpRight size={16} color={T.rustText} />}
          {desceu && <ArrowDownRight size={16} color={T.oliveText} />}
          {!subiu && !desceu && <Minus size={16} color={T.inkFaint} />}
          <span style={{ fontSize: 13, fontWeight: 700, color: subiu ? T.rustText : desceu ? T.oliveText : T.inkFaint }}>
            {variacaoPct > 0 ? '+' : ''}{variacaoPct.toFixed(1)}% no período
          </span>
          <span style={{ fontSize: 11.5, color: T.inkFaint }}>({fmtR(primeiro)} → {fmtR(ultimo)})</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {[0, 0.5, 1].map(f => (
            <g key={f}>
              <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + (H - PAD_T - PAD_B) * f} y2={PAD_T + (H - PAD_T - PAD_B) * f} stroke={T.lineSoft} strokeWidth={1} />
              <text x={PAD_L - 8} y={PAD_T + (H - PAD_T - PAD_B) * f + 4} textAnchor="end" fontSize={9.5} fill={T.inkFaint}>{fmtR(max - span * f)}</text>
            </g>
          ))}
          <polyline points={linha} fill="none" stroke={T.terracotta} strokeWidth={2.5} />
          {pontos.map((p, i) => (
            <circle key={i} cx={coordX(i)} cy={coordY(p.valor)} r={4} fill={T.panel} stroke={T.terracotta} strokeWidth={2}>
              <title>{fmtDataCurta(p.data)}: {fmtR(p.valor)}</title>
            </circle>
          ))}
          {pontos.filter((_, i) => i === 0 || i === pontos.length - 1 || i === Math.floor(pontos.length / 2)).map((p) => {
            const i = pontos.indexOf(p);
            return <text key={i} x={coordX(i)} y={H - PAD_B + 16} textAnchor="middle" fontSize={9.5} fill={T.inkFaint}>{fmtDataCurta(p.data)}</text>;
          })}
        </svg>
      </div>
    );
  };

  const maxMP = Math.max(...overview.topMPs.map(m => m.custo), 1);
  const maxProd = Math.max(...overview.topProdutos.map(p => p.custo), 1);
  const maxProj = Math.max(...overview.topProjetos.map(p => p.custo), 1);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {erroGeral && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erroGeral}
        </div>
      )}

      {/* Filtro de período */}
      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Ano início">
            <SelectAnoFat value={filtros.anoIni} onChange={v => setFiltros(f => ({ ...f, anoIni: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Mês início">
            <SelectMesFat value={filtros.mesIni} onChange={v => setFiltros(f => ({ ...f, mesIni: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Ano fim">
            <SelectAnoFat value={filtros.anoFim} onChange={v => setFiltros(f => ({ ...f, anoFim: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Mês fim">
            <SelectMesFat value={filtros.mesFim} onChange={v => setFiltros(f => ({ ...f, mesFim: v }))} />
          </FiltroCampoFat>
        </div>
      </Panel>

      {/* KPIs consolidados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
        <Kpi label="Ordens de produção" value={loadingGeral ? '…' : overview.totalOPs} icon={Gauge}
          sub="OPs com consumo de MP no período" />
        <Kpi label="Matérias-primas distintas" value={loadingGeral ? '…' : overview.totalMPs} icon={Layers} tone="blue"
          sub="códigos de MP consumidos" />
        <Kpi label="Produtos acabados" value={loadingGeral ? '…' : overview.totalProdutos} icon={Package} tone="olive"
          sub="produtos diferentes produzidos" />
        <Kpi label="Projetos atendidos" value={loadingGeral ? '…' : overview.totalProjetos} icon={CheckCircle2} tone="amber"
          sub="BRs com produção no período" />
        <Kpi label="Custo total de MP" value={loadingGeral ? '…' : fmtRCompacta(overview.custoTotalGeral)} icon={DollarSign} tone="rust"
          sub={`${String(filtros.mesIni).padStart(2, '0')}/${filtros.anoIni} até ${String(filtros.mesFim).padStart(2, '0')}/${filtros.anoFim} · Finalizado: ${fmtRCompacta(overview.custoFinalizado)} · Em andamento: ${fmtRCompacta(overview.custoAndamento)}`} />
      </div>

      {/* Gráfico comparativo — custo consumido por mês */}
      <Panel title="Custo de MP consumido por mês" subtitle="Comparativo mensal — clique numa barra pra ver o detalhe (matérias-primas e projetos daquele mês)">
        {loadingGeral ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
        ) : (
          <BarChartMensal dadosMes={overview.custoPorMes} mesAtivo={mesSelecionado}
            onClickMes={(mes) => setMesSelecionado(prev => prev === mes ? null : mes)} />
        )}
      </Panel>

      {/* Drill-down do mês selecionado — lista COMPLETA, ranqueada, sem limite de top 8 */}
      {mesDrill && (
        <Panel title={`Detalhe de ${fmtMesLabel(mesDrill.mes)}`} subtitle={`Custo total no mês: ${fmtR(mesDrill.custoTotal)} · ranking completo, do maior pro menor`}
          right={<button onClick={() => setMesSelecionado(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={16} /></button>}>
          <div className="grid-2col">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, marginBottom: 10, textTransform: 'uppercase' }}>
                Todas as matérias-primas no mês ({mesDrill.todasMPs.length})
              </div>
              <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                {mesDrill.todasMPs.length === 0 ? (
                  <div style={{ color: T.inkFaint, fontSize: 12.5 }}>Sem dados.</div>
                ) : mesDrill.todasMPs.map((mp, i) => (
                  <div key={mp.codigo} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${T.lineSoft}` }}>
                    <span style={{ fontSize: 10.5, color: T.inkFaint, width: 22, flexShrink: 0 }}>{i + 1}º</span>
                    <RankingBar label={mp.codigo} sub={mp.descricao} valor={mp.custo} max={Math.max(mesDrill.todasMPs[0]?.custo || 1, 1)}
                      onClick={() => { setBusca(`${mp.codigo} — ${mp.descricao || ''}`); selecionar(mp.codigo); }} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, marginBottom: 10, textTransform: 'uppercase' }}>
                Todos os projetos no mês ({mesDrill.todosProjetos.length})
              </div>
              <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                {mesDrill.todosProjetos.length === 0 ? (
                  <div style={{ color: T.inkFaint, fontSize: 12.5 }}>Sem BR vinculado nesse mês.</div>
                ) : mesDrill.todosProjetos.map((p, i) => (
                  <div key={p.br} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${T.lineSoft}` }}>
                    <span style={{ fontSize: 10.5, color: T.inkFaint, width: 22, flexShrink: 0 }}>{i + 1}º</span>
                    <RankingBar label={p.br} valor={p.custo} max={Math.max(mesDrill.todosProjetos[0]?.custo || 1, 1)}
                      onClick={() => selecionarProjeto(p.br)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Comparativo Finalizado x Em andamento — clicável, abre lista completa de projetos */}
      <Panel title="Custo: Finalizado × Em andamento" subtitle="Clique numa barra pra ver todos os projetos daquela situação">
        {loadingGeral ? (
          <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <RankingBar label="Finalizado" valor={overview.custoFinalizado} max={Math.max(overview.custoFinalizado, overview.custoAndamento, 1)}
              onClick={() => setSituacaoSelecionada(prev => prev === 'C' ? null : 'C')} />
            <RankingBar label="Em andamento" valor={overview.custoAndamento} max={Math.max(overview.custoFinalizado, overview.custoAndamento, 1)}
              onClick={() => setSituacaoSelecionada(prev => prev === 'P' ? null : 'P')} />
          </div>
        )}
      </Panel>

      {/* Drill-down de situação: todos os projetos Finalizados ou Em andamento */}
      {situacaoDrill && (
        <Panel title={situacaoDrill.situacao === 'C' ? 'Projetos Finalizados' : 'Projetos Em andamento'}
          subtitle={`${situacaoDrill.todosProjetos.length} projeto${situacaoDrill.todosProjetos.length !== 1 ? 's' : ''} · custo total: ${fmtR(situacaoDrill.custoTotal)}`}
          right={<button onClick={() => setSituacaoSelecionada(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={16} /></button>}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(50)}>#</th>
                  <th style={thFat(0)}>Projeto (BR)</th>
                  <th style={{ ...thFat(90), textAlign: 'center' }}>OPs</th>
                  <th style={{ ...thFat(120), textAlign: 'right' }}>Custo de MP</th>
                </tr>
              </thead>
              <tbody>
                {situacaoDrill.todosProjetos.map((p, i) => (
                  <tr key={p.br} style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}
                    onClick={() => selecionarProjeto(p.br)}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '8px 12px', color: T.inkFaint }}>{i + 1}º</td>
                    <td style={{ padding: '8px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{p.br}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: T.inkDim }}>{p.numOps}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtR(p.custo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Rankings — clique numa matéria-prima pra ver o detalhe completo */}
      <div className="grid-3col">
        <Panel title="Top matérias-primas por custo" subtitle="Clique pra ver o detalhe completo">
          {loadingGeral ? (
            <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
          ) : overview.topMPs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados no período.</div>
          ) : overview.topMPs.map(mp => (
            <RankingBar key={mp.codigo} label={mp.codigo} sub={mp.descricao} valor={mp.custo} max={maxMP}
              onClick={() => { setBusca(`${mp.codigo} — ${mp.descricao || ''}`); selecionar(mp.codigo); }} />
          ))}
        </Panel>

        <Panel title="Top produtos acabados por custo de MP" subtitle="Onde o custo de matéria-prima mais pesa">
          {loadingGeral ? (
            <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
          ) : overview.topProdutos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados no período.</div>
          ) : overview.topProdutos.map(p => (
            <RankingBar key={p.codigo} label={p.codigo} sub={p.descricao} valor={p.custo} max={maxProd} />
          ))}
        </Panel>

        <Panel title="Top projetos por custo de MP" subtitle="BRs com maior custo de matéria-prima consumida — clique pra ver o detalhe completo">
          {loadingGeral ? (
            <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
          ) : overview.topProjetos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados no período.</div>
          ) : overview.topProjetos.map(p => (
            <RankingBar key={p.br} label={p.br} valor={p.custo} max={maxProj} onClick={() => selecionarProjeto(p.br)} />
          ))}
        </Panel>
      </div>

      {/* Drill-down de projeto: todo o custo de matéria-prima dentro do BR selecionado */}
      {dadosProjeto && (
        <div ref={projetoRef} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: T.ink }}>
              Projeto {dadosProjeto.br} — custo de matéria-prima
            </div>
            <button onClick={() => setProjetoSelecionado(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
            <Kpi label="Custo total de MP" value={fmtRCompacta(dadosProjeto.custoTotal)} icon={DollarSign} tone="rust"
              sub="soma de todas as matérias-primas consumidas nesse projeto" />
            <Kpi label="Matérias-primas distintas" value={dadosProjeto.totalMPs} icon={Layers} tone="blue"
              sub="códigos diferentes consumidos" />
            <Kpi label="Produtos acabados" value={dadosProjeto.totalProdutos} icon={Package} tone="olive"
              sub="produtos diferentes produzidos pra esse projeto" />
            <Kpi label="Ordens de produção" value={dadosProjeto.totalOPs} icon={Gauge}
              sub="OPs desse projeto no período" />
          </div>

          <div className="grid-2col">
            <Panel title="Matérias-primas por custo neste projeto" subtitle="Clique numa MP pra ver o detalhe completo dela">
              {dadosProjeto.topMPs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados.</div>
              ) : dadosProjeto.topMPs.slice(0, 12).map(mp => (
                <RankingBar key={mp.codigo} label={mp.codigo} sub={mp.descricao} valor={mp.custo}
                  max={Math.max(...dadosProjeto.topMPs.map(m => m.custo), 1)}
                  onClick={() => { setBusca(`${mp.codigo} — ${mp.descricao || ''}`); selecionar(mp.codigo); }} />
              ))}
            </Panel>
            <Panel title="Produtos acabados por custo neste projeto" subtitle="Onde o custo de matéria-prima mais pesa">
              {dadosProjeto.topProdutos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados.</div>
              ) : dadosProjeto.topProdutos.map(p => (
                <RankingBar key={p.codigo} label={p.codigo} sub={p.descricao} valor={p.custo}
                  max={Math.max(...dadosProjeto.topProdutos.map(pp => pp.custo), 1)} />
              ))}
            </Panel>
          </div>
        </div>
      )}

      {/* Busca detalhada por matéria-prima específica */}
      <div ref={detalheRef}>
        <Panel title="Analisar uma matéria-prima específica" subtitle="Digite o código ou a descrição — ou clique num item do ranking acima. O detalhe respeita o mesmo período do filtro.">
          <div style={{ position: 'relative', maxWidth: 460 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: T.inkFaint }} />
              <input
                value={busca}
                onChange={e => { setBusca(e.target.value); }}
                placeholder="Ex: 10988, SM-PLACA-RETANGULAR…"
                style={{ ...selectStyleFat(460), paddingLeft: 32, fontSize: 13.5 }}
              />
            </div>
            {sugestoes.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8, boxShadow: SHADOW_LG, zIndex: 20, overflow: 'hidden' }}>
                {sugestoes.map(s => (
                  <button key={s.codigo} onClick={() => { setBusca(`${s.codigo} — ${s.descricao}`); selecionar(s.codigo); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${T.lineSoft}`, fontSize: 12.5 }}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{s.codigo}</span>
                    <span style={{ color: T.inkDim, marginLeft: 8 }}>{s.descricao}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Busca de projeto específico (não só o Top 8 do ranking) */}
      <Panel title="Analisar um projeto específico" subtitle="Digite o BR — ou clique num item do ranking 'Top projetos' acima">
        <div style={{ position: 'relative', maxWidth: 460 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: T.inkFaint }} />
            <input
              value={buscaProjeto}
              onChange={e => setBuscaProjeto(e.target.value)}
              placeholder="Ex: BR14312, BR14206…"
              style={{ ...selectStyleFat(460), paddingLeft: 32, fontSize: 13.5 }}
            />
          </div>
          {sugestoesProjeto.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8, boxShadow: SHADOW_LG, zIndex: 20, overflow: 'hidden' }}>
              {sugestoesProjeto.map(br => (
                <button key={br} onClick={() => { setBuscaProjeto(br); selecionarProjeto(br); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${T.lineSoft}`, fontSize: 12.5, fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}
                  onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {br}
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {loadingDetalhe && <div style={{ textAlign: 'center', padding: 40, color: T.inkFaint, fontSize: 13 }}>Carregando…</div>}

      {erroDetalhe && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erroDetalhe}
        </div>
      )}

      {dados && !loadingDetalhe && (
        <>
          <div ref={dadosRef} style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: T.ink, scrollMarginTop: 20 }}>
            {dados.codigo} — {dados.descricao || 'Sem descrição sincronizada'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
            <Kpi label="Produtos acabados distintos" value={dados.kpis.produtosAcabados} icon={Package}
              sub="quantos produtos diferentes usam essa MP" />
            <Kpi label="Projetos atendidos" value={dados.kpis.projetosAtendidos} icon={CheckCircle2} tone="olive"
              sub={dados.kpis.opsFinalizadas > 0 && dados.kpis.projetosAtendidos === 0
                ? `${dados.kpis.opsFinalizadas} OP${dados.kpis.opsFinalizadas !== 1 ? 's' : ''} finalizada${dados.kpis.opsFinalizadas !== 1 ? 's' : ''}, mas sem BR vinculado (produção pra estoque)`
                : `de ${dados.kpis.opsFinalizadas} OP${dados.kpis.opsFinalizadas !== 1 ? 's' : ''} finalizada${dados.kpis.opsFinalizadas !== 1 ? 's' : ''}`} />
            <Kpi label="Projetos em andamento" value={dados.kpis.projetosEmAndamento} icon={Clock3} tone="amber"
              sub={dados.kpis.opsAndamento > 0 && dados.kpis.projetosEmAndamento === 0
                ? `${dados.kpis.opsAndamento} OP${dados.kpis.opsAndamento !== 1 ? 's' : ''} em produção, mas sem BR vinculado ainda`
                : `de ${dados.kpis.opsAndamento} OP${dados.kpis.opsAndamento !== 1 ? 's' : ''} em produção`} />
            <Kpi label="Saldo de Matéria-Prima" value={fmtQtd(dados.kpis.estoqueFisico)} icon={Layers} tone="blue"
              sub={`${dados.unidade || ''} · Local 1050, estoque próprio (não é o estoque total da empresa)`} />
            <Kpi label="Saldo Reservado" value={fmtQtd(dados.kpis.estoqueReservado)} icon={Clock3} tone="amber"
              sub={`${dados.unidade || ''} · Já comprometido · Disponível pra novo consumo: ${fmtQtd(dados.kpis.estoqueDisponivel)}`} />
            <Kpi label="Custo total consumido" value={fmtRCompacta(dados.kpis.custoTotal)} icon={DollarSign} tone="rust"
              sub={`${fmtQtd(dados.kpis.qtdTotal)} ${dados.unidade || ''} ao custo médio (TGFCUS)`} />
          </div>

          {/* Variação de custo unitário no tempo */}
          <Panel title="Variação de custo unitário" subtitle="Como o custo médio (TGFCUS) dessa matéria-prima mudou ao longo do período">
            <LineChartCusto pontos={dados.historicoCusto} />
          </Panel>

          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                    <LocalSortTh label="Data" col="data_ref" />
                    <th style={thFat(0)}>Produto acabado / OP</th>
                    <th style={thFat(90)}>Status OP</th>
                    <th style={thFat(140)}>Projeto / Cliente</th>
                    <LocalSortTh label="Qtd consumida" col="qtd_mp" right />
                    <LocalSortTh label="Vlr. unitário" col="custo_unitario" right />
                    <LocalSortTh label="Custo total" col="custo_total" right />
                  </tr>
                </thead>
                <tbody>
                  {itensOrdenados.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum apontamento de produção encontrado para essa MP no período.</td></tr>
                  ) : itensOrdenados.map((it, i) => {
                    const temProjeto = it.br && it.br !== '<SEM PROJETO>';
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}
                        onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '9px 12px', fontSize: 11, color: T.inkFaint, whiteSpace: 'nowrap' }}>{fmtDataCurta(it.data_ref)}</td>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontWeight: 600 }}>{it.cod_prod_acabado} — {it.desc_prod_acabado}</div>
                          <div style={{ fontSize: 10.5, color: T.inkFaint }}>OP {it.nro_ordem_producao ?? it.nuapo}</div>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <span style={{
                            fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                            color: it.situacao_op === 'C' ? T.oliveText : T.amberText,
                            background: it.situacao_op === 'C' ? T.oliveSoft : T.amberSoft,
                          }}>
                            {SITUACAO_OP_LABEL[it.situacao_op] || it.situacao_op || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '9px 12px', fontSize: 11.5 }}>
                          {temProjeto ? (
                            <>
                              <div>{it.br}</div>
                              <div style={{ color: T.inkFaint }}>{it.cliente_nome && it.cliente_nome !== '<SEM PARCEIRO>' ? it.cliente_nome : '—'}</div>
                            </>
                          ) : (
                            <span style={{ color: T.inkFaint, fontStyle: 'italic' }} title="Ordem de produção sem nota de venda vinculada no momento do apontamento (ex: produção pra estoque)">
                              Sem venda vinculada
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtQtd(it.qtd_mp)} {it.unidade_mp}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', color: T.inkDim }}>{fmtR(it.custo_unitario)}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.rustText }}>{fmtR(it.custo_total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{itensOrdenados.length} apontamento{itensOrdenados.length !== 1 ? 's' : ''} de produção · Custo = custo médio (TGFCUS) na data do apontamento × quantidade consumida</span>
              <BotaoExportar small onClick={() => exportCSV(itensOrdenados, `analitico_${dados.codigo}.csv`,
                ['data_ref','situacao_op','cod_prod_acabado','desc_prod_acabado','nro_ordem_producao','nuapo','br','cliente_nome','qtd_mp','custo_unitario','custo_total'])} />
            </div>
          </div>
        </>
      )}

      {/* Margem: faturado x custo de matéria-prima, por produto */}
      <Panel title="Margem sobre custo de matéria-prima" subtitle="Cruza o valor faturado (Nota de Venda) com o custo de MP consumido, por produto acabado — clique no cabeçalho pra ordenar, clique no produto pra ver a quebra por projeto">
        {(loadingGeral || loadingMargem) ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
        ) : margemPorProduto.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 12.5 }}>
            Nenhum produto tem faturamento e consumo de MP simultâneos nesse período.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <SortThMargem label="Produto" col="descricao" col2="codigo" />
                  <SortThMargem label="Faturado" col="faturado" right />
                  <SortThMargem label="Custo de MP" col="custo" right />
                  <SortThMargem label="Margem (R$)" col="margem" right />
                  <SortThMargem label="Margem %" col="margemPct" right />
                </tr>
              </thead>
              <tbody>
                {margemPorProdutoOrdenado.slice(0, 25).map(m => (
                  <tr key={m.codigo} style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer', background: produtoMargemSelecionado === m.codigo ? T.panelAlt : 'transparent' }}
                    onClick={() => setProdutoMargemSelecionado(prev => prev === m.codigo ? null : m.codigo)}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = produtoMargemSelecionado === m.codigo ? T.panelAlt : 'transparent'}>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{m.codigo} — {m.descricao}</div>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtR(m.faturado)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: T.rustText }}>{fmtR(m.custo)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: m.margem >= 0 ? T.oliveText : T.rustText }}>{fmtR(m.margem)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: m.margemPct == null ? T.inkFaint : m.margemPct >= 0 ? T.oliveText : T.rustText }}>
                      {m.margemPct == null ? '—' : `${m.margemPct.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '10px 0 0', fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{margemPorProduto.length} produto{margemPorProduto.length !== 1 ? 's' : ''} com faturamento e consumo de MP no período · Margem = Faturado − Custo de MP (não considera outros custos de fabricação)</span>
          {margemPorProduto.length > 0 && (
            <BotaoExportar small onClick={() => exportCSV(margemPorProdutoOrdenado, 'margem_por_produto.csv',
              ['codigo','descricao','faturado','custo','margem','margemPct'])} />
          )}
        </div>
      </Panel>

      {/* Quebra de margem por projeto — abre ao clicar num produto na tabela acima */}
      {margemPorProjetoDoProduto && (
        <div className="grid-2col">
          <Panel title={`${margemPorProjetoDoProduto.codigo} — margem por projeto/cliente`} subtitle={margemPorProjetoDoProduto.descricao}
            right={<button onClick={() => setProdutoMargemSelecionado(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={16} /></button>}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                    <th style={thFat(0)}>Projeto / Cliente</th>
                    <th style={{ ...thFat(100), textAlign: 'right' }}>Faturado</th>
                    <th style={{ ...thFat(100), textAlign: 'right' }}>Custo MP</th>
                    <th style={{ ...thFat(100), textAlign: 'right' }}>Margem</th>
                    <th style={{ ...thFat(70), textAlign: 'right' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {margemPorProjetoDoProduto.linhas.map(l => (
                    <tr key={l.br} style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: l.br !== '<SEM PROJETO>' ? 'pointer' : 'default' }}
                      onClick={() => l.br !== '<SEM PROJETO>' && selecionarProjeto(l.br)}
                      onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: l.br !== '<SEM PROJETO>' ? T.blueText : T.inkFaint }}>{l.br}</div>
                        {l.cliente && <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>{l.cliente}</div>}
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtR(l.faturado)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', color: T.rustText }}>{fmtR(l.custo)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: l.margem >= 0 ? T.oliveText : T.rustText }}>{fmtR(l.margem)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: l.margemPct == null ? T.inkFaint : l.margemPct >= 0 ? T.oliveText : T.rustText }}>
                        {l.margemPct == null ? '—' : `${l.margemPct.toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 10 }}>
              "&lt;SEM PROJETO&gt;" = faturado ou produzido sem nota de venda/projeto vinculado no momento do apontamento.
            </div>
          </Panel>

          <Panel title="Matérias-primas desse produto" subtitle="Quanto cada matéria-prima pesa no custo total, no período">
            {margemPorProjetoDoProduto.materiaisPrima.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados de consumo de MP nesse período.</div>
            ) : margemPorProjetoDoProduto.materiaisPrima.map(mp => (
              <RankingBar key={mp.codigo} label={mp.codigo} sub={mp.descricao} valor={mp.custo}
                max={Math.max(...margemPorProjetoDoProduto.materiaisPrima.map(m => m.custo), 1)}
                onClick={() => { setBusca(`${mp.codigo} — ${mp.descricao || ''}`); selecionar(mp.codigo); }} />
            ))}
          </Panel>
        </div>
      )}
    </div>
  );
}


function PrecoCompra() {
  const [busca, setBusca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState([]); // lista de produtos que bateram na busca
  const [itemSelecionado, setItemSelecionado] = useState(null); // { codigo, descricao }
  const [historico, setHistorico] = useState([]); // compras do item selecionado
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [erro, setErro] = useState(null);
  const [qtdCompras, setQtdCompras] = useState(3); // 3, 5, 10 ou 'todas' — escolhido pelo usuário
  const [contatosFornecedor, setContatosFornecedor] = useState({}); // cod_fornecedor -> {email, telefone, razao_social}

  // Análise geral: maiores gastos, mais recorrentes, maiores variações de preço.
  const [analise, setAnalise] = useState([]);
  const [loadingAnalise, setLoadingAnalise] = useState(true);

  // Busca inteligente por similaridade de texto (pg_trgm) — funciona mesmo com
  // descrições parciais/genéricas, sem precisar do código exato do item.
  useEffect(() => {
    if (!busca || busca.trim().length < 3) { setResultados([]); return; }
    const t = setTimeout(async () => {
      setBuscando(true);
      setErro(null);
      const termo = busca.trim();
      const { data, error } = await supabaseSupply.rpc('buscar_itens_compra', { termo_busca: termo });
      if (error) {
        // fallback: busca simples por ILIKE caso a function ainda não exista
        const { data: dataFallback, error: errorFallback } = await supabaseSupply
          .from('nfs_entrada')
          .select('codigo_produto,descricao_produto')
          .ilike('descricao_produto', `%${termo}%`)
          .limit(30);
        if (errorFallback) { setErro(errorFallback.message); setBuscando(false); return; }
        const vistos = new Set();
        const unicos = (dataFallback || []).filter(r => {
          if (vistos.has(r.codigo_produto)) return false;
          vistos.add(r.codigo_produto);
          return true;
        });
        setResultados(unicos);
        setBuscando(false);
        return;
      }
      setResultados(data || []);
      setBuscando(false);
    }, 350);
    return () => clearTimeout(t);
  }, [busca]);

  // Análise geral: carrega o agregado de TODOS os itens já comprados, uma vez —
  // usado pros rankings de maior gasto, mais recorrentes e maior variação de preço.
  useEffect(() => {
    const carregarAnalise = async () => {
      setLoadingAnalise(true);
      const { data, error } = await supabaseSupply
        .from('v_analise_compras')
        .select('codigo_produto,descricao_produto,total_compras,valor_total_gasto,quantidade_total,data_ultima_compra,preco_recente,fornecedor_recente,preco_anterior,variacao_pct,valor_total_gasto_liquido,preco_recente_liquido,preco_anterior_liquido,variacao_pct_liquido');
      if (!error) setAnalise(data || []);
      setLoadingAnalise(false);
    };
    carregarAnalise();
  }, []);

  const rankings = useMemo(() => {
    const validos = analise.filter(a => a.valor_total_gasto_liquido != null);
    const comVariacao = analise.filter(a => a.variacao_pct_liquido != null);
    return {
      maisGastos: [...validos].sort((a, b) => b.valor_total_gasto_liquido - a.valor_total_gasto_liquido).slice(0, 10),
      maisRecorrentes: [...validos].sort((a, b) => b.total_compras - a.total_compras).slice(0, 10),
      maioresAltas: [...comVariacao].filter(a => a.variacao_pct_liquido > 0).sort((a, b) => b.variacao_pct_liquido - a.variacao_pct_liquido).slice(0, 8),
      maioresQuedas: [...comVariacao].filter(a => a.variacao_pct_liquido < 0).sort((a, b) => a.variacao_pct_liquido - b.variacao_pct_liquido).slice(0, 8),
    };
  }, [analise]);

  const selecionarItem = async (codigo, descricao, qtd) => {
    const limite = qtd ?? qtdCompras;
    setItemSelecionado({ codigo, descricao });
    setLoadingHistorico(true);
    setErro(null);

    let query = supabaseSupply
      .from('v_ultimas_compras')
      .select('descricao_produto,fornecedor,cod_fornecedor,data_recebimento,numero_nf,quantidade_recebida,valor_total_linha,preco_unitario,ordem_recencia,valor_liquido_item,preco_unitario_liquido,valor_icms,valor_ipi,valor_icms_st,nunota,tipmov,codtipoper_nota,numero_pedido_oc,nunota_pedido_oc')
      .eq('codigo_produto', codigo)
      .order('ordem_recencia', { ascending: true });
    if (limite !== 'todas') query = query.lte('ordem_recencia', limite);

    const { data, error } = await query;
    if (error) { setErro(error.message); setLoadingHistorico(false); return; }
    setHistorico(data || []);

    // Busca o contato (email/telefone) dos fornecedores que aparecem nesse histórico.
    const codigosFornecedor = [...new Set((data || []).map(h => h.cod_fornecedor).filter(Boolean))];
    if (codigosFornecedor.length > 0) {
      const { data: contatos } = await supabaseSupply
        .from('fornecedores_email')
        .select('cod_fornecedor,fornecedor,razao_social,email,telefone,contato')
        .in('cod_fornecedor', codigosFornecedor);
      const mapa = {};
      (contatos || []).forEach(c => { mapa[c.cod_fornecedor] = c; });
      setContatosFornecedor(mapa);
    } else {
      setContatosFornecedor({});
    }

    setLoadingHistorico(false);
  };

  // Se o usuário mudar a quantidade de compras a mostrar com um item já selecionado, refaz a busca.
  useEffect(() => {
    if (itemSelecionado) selecionarItem(itemSelecionado.codigo, itemSelecionado.descricao, qtdCompras);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qtdCompras]);

  const fmtMoeda = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtQtd = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);
  const fmtData = (iso) => !iso ? '—' : new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  const variacaoPreco = useMemo(() => {
    if (historico.length < 2) return null;
    const maisRecente = historico[0]?.preco_unitario_liquido;
    const maisAntiga = historico[historico.length - 1]?.preco_unitario_liquido;
    if (maisRecente == null || maisAntiga == null || maisAntiga === 0) return null;
    return ((maisRecente - maisAntiga) / maisAntiga) * 100;
  }, [historico]);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Busca pelo histórico real de compras (Notas Fiscais de entrada) — fonte: Supply Chain. Digite qualquer termo da descrição
        (não precisa ser exato) e veja as últimas 3 compras de cada item, com fornecedor, quantidade e preço. Os valores
        <strong> líquidos</strong> já têm ICMS, IPI e ICMS-ST subtraídos (o bruto, que vem da nota, tem o imposto embutido).
      </div>

      <Panel title="Buscar item" subtitle="Digite uma descrição genérica (ex: 'ventilador', 'chapa aço', 'rolamento') — a busca acha por similaridade">
        <div style={{ position: 'relative', maxWidth: 520 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: T.inkFaint }} />
            <input
              value={busca}
              onChange={e => { setBusca(e.target.value); setItemSelecionado(null); setHistorico([]); }}
              placeholder="Ex: ventilador, chapa de aço, rolamento…"
              style={{ ...selectStyleFat(520), paddingLeft: 32, fontSize: 13.5 }}
            />
            {buscando && <span style={{ position: 'absolute', right: 10, top: 10, fontSize: 11, color: T.inkFaint }}>buscando…</span>}
          </div>
          {resultados.length > 0 && !itemSelecionado && (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 4, left: 0, right: 0, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8, boxShadow: SHADOW_LG, zIndex: 20, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
                {resultados.map(r => (
                  <button key={r.codigo_produto} onClick={() => { setBusca(`${r.codigo_produto} — ${r.descricao_produto}`); selecionarItem(r.codigo_produto, r.descricao_produto); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${T.lineSoft}`, fontSize: 12.5 }}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText }}>{r.codigo_produto}</span>
                    <span style={{ color: T.inkDim, marginLeft: 8 }}>{r.descricao_produto}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {busca.trim().length >= 3 && !buscando && resultados.length === 0 && !itemSelecionado && (
            <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 8 }}>Nenhum item encontrado com esse termo.</div>
          )}
        </div>
      </Panel>

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      {loadingHistorico && <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 13 }}>Carregando histórico…</div>}

      {itemSelecionado && !loadingHistorico && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: T.ink }}>
              {itemSelecionado.codigo} — {itemSelecionado.descricao}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: T.inkFaint }}>Mostrar:</span>
              {[3, 5, 10, 'todas'].map(opt => (
                <button key={opt} onClick={() => setQtdCompras(opt)}
                  style={{
                    fontSize: 12, fontWeight: 600, border: `1px solid ${T.line}`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
                    background: qtdCompras === opt ? T.terracotta : T.panel, color: qtdCompras === opt ? '#fff' : T.inkDim,
                  }}>
                  {opt === 'todas' ? 'Todas' : `${opt} últimas`}
                </button>
              ))}
            </div>
          </div>

          {historico.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: T.inkFaint, fontSize: 13 }}>Nenhuma compra registrada pra esse item.</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
                <Kpi label="Preço líquido mais recente" value={fmtMoeda(historico[0]?.preco_unitario_liquido)} icon={DollarSign} tone="rust"
                  sub={`bruto: ${fmtMoeda(historico[0]?.preco_unitario)} · ${fmtData(historico[0]?.data_recebimento)} · ${historico[0]?.fornecedor || '—'}`} />
                <Kpi label="Compras mostradas" value={historico.length} icon={Package} tone="blue"
                  sub={qtdCompras === 'todas' ? 'histórico completo' : `das últimas ${qtdCompras}`} />
                {variacaoPreco != null && (
                  <Kpi label="Variação (mais antiga → mais recente)" value={`${variacaoPreco > 0 ? '+' : ''}${variacaoPreco.toFixed(1)}%`}
                    icon={variacaoPreco > 0 ? ArrowUpRight : variacaoPreco < 0 ? ArrowDownRight : Minus}
                    tone={variacaoPreco > 0 ? 'rust' : variacaoPreco < 0 ? 'olive' : undefined}
                    sub="dentro do período mostrado acima" />
                )}
              </div>

              {historico.length >= 2 && (
                <Panel title="Variação de preço ao longo do tempo" subtitle="Preço unitário em cada compra, da mais antiga pra mais recente">
                  <GraficoPrecoHistorico pontos={[...historico].reverse()} fmtMoeda={fmtMoeda} fmtData={fmtData} />
                </Panel>
              )}

              <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                        <th style={thFat(60)}>#</th>
                        <th style={thFat()}>Data</th>
                        <th style={thFat(0)}>Fornecedor</th>
                        <th style={thFat(180)}>Contato</th>
                        <th style={thFat(100)}>NF</th>
                        <th style={{ ...thFat(90), textAlign: 'right' }}>Qtd</th>
                        <th style={{ ...thFat(110), textAlign: 'right' }}>Vlr. bruto NF</th>
                        <th style={{ ...thFat(110), textAlign: 'right' }}>Preço unit. bruto</th>
                        <th style={{ ...thFat(120), textAlign: 'right' }}>Preço unit. líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map((h, i) => {
                        const contato = contatosFornecedor[h.cod_fornecedor];
                        return (
                          <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: i === 0 ? T.oliveSoft : 'transparent' }}>
                            <td style={{ padding: '10px 12px', color: T.inkFaint, fontSize: 11 }}>{i === 0 ? '★ mais recente' : `${i + 1}ª mais recente`}</td>
                            <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, color: T.inkDim, whiteSpace: 'nowrap' }}>{fmtData(h.data_recebimento)}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={h.fornecedor}>{h.fornecedor || '—'}</td>
                            <td style={{ padding: '10px 12px', fontSize: 11 }}>
                              {contato?.email ? <div style={{ color: T.blueText }}>{contato.email}</div> : null}
                              {contato?.telefone ? <div style={{ color: T.inkFaint }}>{contato.telefone}</div> : null}
                              {!contato?.email && !contato?.telefone && <span style={{ color: T.inkFaint }}>—</span>}
                            </td>
                            <td style={{ padding: '10px 12px', color: T.inkFaint }}>
                              <div>{h.numero_nf || '—'}</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3 }}>
                                <BotaoAbrirSankhya nunota={h.nunota} tipmov={h.tipmov} codtipoper={h.codtipoper_nota} label="Ver nota" />
                                {h.numero_pedido_oc && <BotaoAbrirSankhya nunota={h.nunota_pedido_oc} tipmov="C" codtipoper={h.codtipoper_nota} label={`Ver pedido ${h.numero_pedido_oc}`} />}
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmtQtd(h.quantidade_recebida)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: T.inkFaint }}>{fmtMoeda(h.valor_total_linha)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: T.inkFaint }}>{fmtMoeda(h.preco_unitario)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.rustText }}>{fmtMoeda(h.preco_unitario_liquido)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Preço líquido = (valor da linha − ICMS − IPI − ICMS-ST) ÷ quantidade recebida · fonte: Supply Chain (nfs_entrada + cadastro de fornecedores)</span>
                  <BotaoExportar small onClick={() => exportCSV(historico, `historico_${itemSelecionado.codigo}.csv`,
                    ['data_recebimento','fornecedor','numero_nf','quantidade_recebida','valor_total_linha','preco_unitario','valor_liquido_item','preco_unitario_liquido','valor_icms','valor_ipi','valor_icms_st'])} />
                </div>
              </div>
            </>
          )}
        </>
      )}

      {!itemSelecionado && !buscando && busca.trim().length < 3 && (
        <>
          {loadingAnalise ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.inkFaint, fontSize: 13 }}>Carregando análise de compras…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
                <Kpi label="Itens com histórico" value={analise.length} icon={Package} tone="blue"
                  sub="códigos distintos já comprados" />
                <Kpi label="Total gasto líquido (todo o histórico)" value={fmtMoeda(analise.reduce((s, a) => s + (a.valor_total_gasto_liquido || 0), 0))} icon={DollarSign} tone="rust"
                  sub={`bruto: ${fmtMoeda(analise.reduce((s, a) => s + (a.valor_total_gasto || 0), 0))}`} />
                <Kpi label="Itens com alta de preço" value={rankings.maioresAltas.length ? analise.filter(a => a.variacao_pct_liquido > 0).length : 0} icon={ArrowUpRight} tone="amber"
                  sub="entre a última e a penúltima compra (líquido)" />
                <Kpi label="Itens com queda de preço" value={analise.filter(a => a.variacao_pct_liquido < 0).length} icon={ArrowDownRight} tone="olive"
                  sub="entre a última e a penúltima compra (líquido)" />
              </div>

              <div className="grid-2col">
                <Panel title="Maior gasto acumulado (líquido)" subtitle="Itens em que mais investimos, no histórico todo — clique pra ver o detalhe">
                  {rankings.maisGastos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados.</div>
                  ) : rankings.maisGastos.map(a => (
                    <RankingBarPreco key={a.codigo_produto} label={String(a.codigo_produto)} sub={a.descricao_produto} valor={a.valor_total_gasto_liquido}
                      max={rankings.maisGastos[0]?.valor_total_gasto_liquido || 1} fmt={fmtMoeda}
                      onClick={() => { setBusca(`${a.codigo_produto} — ${a.descricao_produto}`); selecionarItem(a.codigo_produto, a.descricao_produto); }} />
                  ))}
                </Panel>

                <Panel title="Itens mais recorrentes" subtitle="Comprados com mais frequência — clique pra ver o detalhe">
                  {rankings.maisRecorrentes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados.</div>
                  ) : rankings.maisRecorrentes.map(a => (
                    <RankingBarPreco key={a.codigo_produto} label={String(a.codigo_produto)} sub={a.descricao_produto} valor={a.total_compras}
                      max={rankings.maisRecorrentes[0]?.total_compras || 1} fmt={v => `${v}x`}
                      onClick={() => { setBusca(`${a.codigo_produto} — ${a.descricao_produto}`); selecionarItem(a.codigo_produto, a.descricao_produto); }} />
                  ))}
                </Panel>
              </div>

              <div className="grid-2col">
                <Panel title="Maiores altas de preço (líquido)" subtitle="Itens que mais subiram de preço na última compra vs a anterior">
                  {rankings.maioresAltas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Nenhuma alta registrada.</div>
                  ) : rankings.maioresAltas.map(a => (
                    <div key={a.codigo_produto} onClick={() => { setBusca(`${a.codigo_produto} — ${a.descricao_produto}`); selecionarItem(a.codigo_produto, a.descricao_produto); }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.descricao_produto}>
                          <span style={{ color: T.blueText, fontFamily: FONT_DISPLAY }}>{a.codigo_produto}</span> — {a.descricao_produto}
                        </div>
                        <div style={{ fontSize: 10.5, color: T.inkFaint }}>{fmtMoeda(a.preco_anterior_liquido)} → {fmtMoeda(a.preco_recente_liquido)}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.rustText, fontFamily: FONT_DISPLAY, flexShrink: 0, marginLeft: 10 }}>+{a.variacao_pct_liquido.toFixed(1)}%</span>
                    </div>
                  ))}
                </Panel>

                <Panel title="Maiores quedas de preço (líquido)" subtitle="Itens que mais baixaram de preço na última compra vs a anterior">
                  {rankings.maioresQuedas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Nenhuma queda registrada.</div>
                  ) : rankings.maioresQuedas.map(a => (
                    <div key={a.codigo_produto} onClick={() => { setBusca(`${a.codigo_produto} — ${a.descricao_produto}`); selecionarItem(a.codigo_produto, a.descricao_produto); }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.descricao_produto}>
                          <span style={{ color: T.blueText, fontFamily: FONT_DISPLAY }}>{a.codigo_produto}</span> — {a.descricao_produto}
                        </div>
                        <div style={{ fontSize: 10.5, color: T.inkFaint }}>{fmtMoeda(a.preco_anterior_liquido)} → {fmtMoeda(a.preco_recente_liquido)}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.oliveText, fontFamily: FONT_DISPLAY, flexShrink: 0, marginLeft: 10 }}>{a.variacao_pct_liquido.toFixed(1)}%</span>
                    </div>
                  ))}
                </Panel>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function GraficoPrecoHistorico({ pontos, fmtMoeda, fmtData }) {
  const validos = pontos.filter(p => p.preco_unitario_liquido != null);
  if (validos.length < 2) return <div style={{ textAlign: 'center', padding: 20, color: T.inkFaint, fontSize: 12.5 }}>Sem dados suficientes pra gráfico.</div>;

  const W = 900, H = 200, PAD_L = 80, PAD_R = 20, PAD_T = 20, PAD_B = 34;
  const valores = validos.map(p => p.preco_unitario_liquido);
  const min = Math.min(...valores), max = Math.max(...valores);
  const span = max - min || 1;
  const passo = (W - PAD_L - PAD_R) / (validos.length - 1);
  const coordX = (i) => PAD_L + i * passo;
  const coordY = (v) => PAD_T + (H - PAD_T - PAD_B) * (1 - (v - min) / span);
  const linha = validos.map((p, i) => `${coordX(i)},${coordY(p.preco_unitario_liquido)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {[0, 0.5, 1].map(f => (
        <g key={f}>
          <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + (H - PAD_T - PAD_B) * f} y2={PAD_T + (H - PAD_T - PAD_B) * f} stroke={T.lineSoft} strokeWidth={1} />
          <text x={PAD_L - 8} y={PAD_T + (H - PAD_T - PAD_B) * f + 4} textAnchor="end" fontSize={9.5} fill={T.inkFaint}>{fmtMoeda(max - span * f)}</text>
        </g>
      ))}
      <polyline points={linha} fill="none" stroke={T.terracotta} strokeWidth={2.5} />
      {validos.map((p, i) => (
        <circle key={i} cx={coordX(i)} cy={coordY(p.preco_unitario_liquido)} r={4} fill={T.panel} stroke={T.terracotta} strokeWidth={2}>
          <title>{fmtData(p.data_recebimento)} · {p.fornecedor}: {fmtMoeda(p.preco_unitario_liquido)} líquido</title>
        </circle>
      ))}
      {validos.filter((_, i) => i === 0 || i === validos.length - 1 || i === Math.floor(validos.length / 2)).map((p) => {
        const i = validos.indexOf(p);
        return <text key={i} x={coordX(i)} y={H - PAD_B + 16} textAnchor="middle" fontSize={9.5} fill={T.inkFaint}>{fmtData(p.data_recebimento)}</text>;
      })}
    </svg>
  );
}

function RankingBarPreco({ label, sub, valor, max, fmt, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none',
      cursor: 'pointer', padding: '6px 0', textAlign: 'left',
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <div style={{ width: 140, flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: T.inkFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sub}>{sub}</div>}
      </div>
      <div style={{ flex: 1, background: T.lineSoft, height: 7, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max((valor / max) * 100, 2)}%`, height: '100%', background: T.terracotta, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: T.rustText, fontFamily: FONT_DISPLAY, width: 70, textAlign: 'right', flexShrink: 0 }}>{fmt(valor)}</span>
    </button>
  );
}

function CarteiraEstoque() {
  const [linhas, setLinhas] = useState([]); // uma por MP, com demanda x saldo
  const [semComposicao, setSemComposicao] = useState([]); // produtos em carteira sem composição cadastrada
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [sortCol, setSortCol] = useState('deficit');
  const [sortDir, setSortDir] = useState('desc');
  const [drillMP, setDrillMP] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    // 1) Pedidos em carteira (ainda não entregues por completo)
    const TAMANHO_LOTE = 1000;
    let pedidos = [];
    let pagina = 0;
    while (true) {
      const { data, error } = await supabase.from('pedidos_itens')
        .select('id,cod_produto,produto_descricao,quantidade,qtd_entregue,br,cliente_nome,numero_pedido,data_prevista_entrega')
        .not('cod_produto', 'is', null)
        .range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
      if (error) { setErro(`Erro pedidos_itens: ${error.message}`); setLoading(false); return; }
      pedidos = pedidos.concat(data || []);
      if (!data || data.length < TAMANHO_LOTE) break;
      pagina += 1;
      if (pagina > 100) break;
    }

    const pendentes = pedidos
      .map(p => ({ ...p, pendente: (Number(p.quantidade) || 0) - (Number(p.qtd_entregue) || 0) }))
      .filter(p => p.pendente > 0.0001);

    const codigosProdutos = [...new Set(pendentes.map(p => p.cod_produto))];

    // 2) Composição (BOM) só dos produtos que estão em carteira
    let composicao = [];
    for (let i = 0; i < codigosProdutos.length; i += 300) {
      const lote = codigosProdutos.slice(i, i + 300);
      const { data, error } = await supabase.from('composicao_produtos')
        .select('cod_prod_pai,cod_prod_mp,descr_prod_mp,unidade,quantidade')
        .in('cod_prod_pai', lote);
      if (error) { setErro(`Erro composição: ${error.message}`); setLoading(false); return; }
      composicao = composicao.concat(data || []);
    }
    const composicaoPorProduto = {};
    composicao.forEach(c => {
      if (!composicaoPorProduto[c.cod_prod_pai]) composicaoPorProduto[c.cod_prod_pai] = [];
      composicaoPorProduto[c.cod_prod_pai].push(c);
    });

    // 3) Saldo atual de cada matéria-prima — pega o registro mais recente por código
    let apontamentos = [];
    pagina = 0;
    while (true) {
      const { data, error } = await supabase.from('producao_mp_apontamentos')
        .select('cod_materia_prima,desc_materia_prima,unidade_mp,saldo_fisico_mp,saldo_reservado_mp,saldo_disponivel_mp,sincronizado_em')
        .order('sincronizado_em', { ascending: false })
        .range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
      if (error) { setErro(`Erro estoque: ${error.message}`); setLoading(false); return; }
      apontamentos = apontamentos.concat(data || []);
      if (!data || data.length < TAMANHO_LOTE) break;
      pagina += 1;
      if (pagina > 100) break;
    }
    const saldoPorMP = {}; // primeira ocorrência = mais recente (já veio ordenado desc)
    apontamentos.forEach(a => {
      if (!saldoPorMP[a.cod_materia_prima]) {
        saldoPorMP[a.cod_materia_prima] = {
          descricao: a.desc_materia_prima, unidade: a.unidade_mp,
          fisico: Number(a.saldo_fisico_mp) || 0, reservado: Number(a.saldo_reservado_mp) || 0,
          disponivel: Number(a.saldo_disponivel_mp) || 0,
        };
      }
    });

    // 4) Calcula demanda total por MP (soma de todos os pedidos pendentes que a usam)
    const demandaPorMP = {}; // codigo -> { total, itens: [...] }
    const faltantes = new Map();

    pendentes.forEach(p => {
      const bom = composicaoPorProduto[p.cod_produto];
      if (!bom) {
        faltantes.set(p.cod_produto, { produto: p.cod_produto, descricao: p.produto_descricao, br: p.br });
        return;
      }
      bom.forEach(mat => {
        const codigo = mat.cod_prod_mp;
        const qtdUnitaria = Number(mat.quantidade) || 0;
        const demanda = qtdUnitaria * p.pendente;
        if (!demandaPorMP[codigo]) demandaPorMP[codigo] = { total: 0, descricao: mat.descr_prod_mp, unidade: mat.unidade, itens: [] };
        demandaPorMP[codigo].total += demanda;
        demandaPorMP[codigo].itens.push({
          produto: p.cod_produto, descricaoProduto: p.produto_descricao, br: p.br,
          cliente: p.cliente_nome, pedido: p.numero_pedido, pendente: p.pendente,
          demanda, dataPrevista: p.data_prevista_entrega,
        });
      });
    });

    const lista = Object.entries(demandaPorMP).map(([codigo, info]) => {
      const saldo = saldoPorMP[codigo];
      const disponivel = saldo?.disponivel ?? null;
      const deficit = disponivel != null ? info.total - disponivel : null;
      return {
        codigo,
        descricao: saldo?.descricao || info.descricao || `MP ${codigo}`,
        unidade: saldo?.unidade || info.unidade || '',
        demanda: info.total,
        saldoDisponivel: disponivel,
        deficit,
        status: disponivel == null ? 'sem_saldo' : deficit > 0.0001 ? 'insuficiente' : 'ok',
        itens: info.itens.sort((a, b) => b.demanda - a.demanda),
      };
    });

    setLinhas(lista);
    setSemComposicao([...faltantes.values()]);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const filtrados = useMemo(() => {
    return linhas
      .filter(l => statusFiltro === 'Todos' || l.status === statusFiltro)
      .filter(l => !busca ||
        l.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        (l.descricao || '').toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => {
        let va = a[sortCol] ?? -Infinity, vb = b[sortCol] ?? -Infinity;
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [linhas, busca, statusFiltro, sortCol, sortDir]);

  const kpis = useMemo(() => ({
    totalMPs: linhas.length,
    insuficientes: linhas.filter(l => l.status === 'insuficiente').length,
    semSaldo: linhas.filter(l => l.status === 'sem_saldo').length,
    ok: linhas.filter(l => l.status === 'ok').length,
    produtosSemComposicao: semComposicao.length,
  }), [linhas, semComposicao]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const LocalSortTh = ({ label, col, right }) => {
    const active = sortCol === col;
    return (
      <th onClick={() => handleSort(col)} style={{ ...thFat(0, right ? 'right' : 'left'), cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <span style={{ color: active ? T.terracotta : T.inkFaint }}>{label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
      </th>
    );
  };

  const fmtQtd = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);
  const fmtData = (iso) => !iso ? '—' : new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  const statusInfo = (status) => ({
    ok:           { label: '✓ Atende',    cor: T.oliveText, bg: T.oliveSoft },
    insuficiente: { label: '⚠ Insuficiente', cor: T.rustText, bg: T.rustSoft },
    sem_saldo:    { label: '— Sem dado de estoque', cor: T.inkFaint, bg: T.lineSoft },
  }[status] || { label: status, cor: T.inkFaint, bg: T.lineSoft });

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        Cruza os pedidos ainda não entregues (quantidade pedida − quantidade já entregue) com a composição de cada produto,
        e compara a demanda total de cada matéria-prima com o saldo disponível atual (mesmo saldo usado na aba Analítico).
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
        <Kpi label="Matérias-primas analisadas" value={loading ? '…' : kpis.totalMPs} icon={Layers} tone="blue"
          sub="usadas em algum pedido em carteira" />
        <Kpi label="Atendem a demanda" value={loading ? '…' : kpis.ok} icon={CheckCircle2} tone="olive"
          sub="saldo atual cobre tudo que está em carteira" />
        <Kpi label="Insuficientes" value={loading ? '…' : kpis.insuficientes} icon={AlertTriangle} tone="rust"
          sub="saldo atual NÃO cobre a demanda da carteira" />
        <Kpi label="Sem dado de estoque" value={loading ? '…' : kpis.semSaldo} icon={Clock3} tone="amber"
          sub="MP nunca apareceu num apontamento sincronizado" />
        <Kpi label="Produtos sem composição" value={loading ? '…' : kpis.produtosSemComposicao} icon={Package}
          sub="em carteira, mas sem BOM cadastrada — não entram no cálculo" />
      </div>

      {/* Filtros */}
      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Buscar código ou descrição">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: 10988, PLACA-RETANGULAR…"
                style={{ ...selectStyleFat(260), paddingLeft: 28 }} />
            </div>
          </FiltroCampoFat>
          <FiltroCampoFat label="Status">
            <div style={{ position: 'relative' }}>
              <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} style={selectStyleFat(180)}>
                <option value="Todos">Todos</option>
                <option value="insuficiente">⚠ Insuficiente</option>
                <option value="ok">✓ Atende</option>
                <option value="sem_saldo">Sem dado de estoque</option>
              </select>
              <ChevronDown size={13} style={chevronStyleFat} />
            </div>
          </FiltroCampoFat>
          {(busca || statusFiltro !== 'Todos') && (
            <button onClick={() => { setBusca(''); setStatusFiltro('Todos'); }}
              style={{ fontSize: 12, color: T.amberText, background: T.amberSoft, border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Limpar
            </button>
          )}
        </div>
      </Panel>

      {/* Tabela principal */}
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <LocalSortTh label="Código" col="codigo" />
                <th style={thFat(0)}>Descrição</th>
                <th style={{ ...thFat(70), textAlign: 'center' }}>UM</th>
                <LocalSortTh label="Demanda (carteira)" col="demanda" right />
                <LocalSortTh label="Saldo disponível" col="saldoDisponivel" right />
                <LocalSortTh label="Déficit" col="deficit" right />
                <th style={{ ...thFat(140), textAlign: 'center' }}>Status</th>
                <th style={{ ...thFat(90), textAlign: 'center' }}>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhuma matéria-prima encontrada.</td></tr>
              ) : filtrados.map(r => {
                const st = statusInfo(r.status);
                return (
                  <tr key={r.codigo} style={{ borderBottom: `1px solid ${T.lineSoft}` }}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, whiteSpace: 'nowrap' }}>{r.codigo}</td>
                    <td style={{ padding: '9px 12px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.descricao}>{r.descricao}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', fontSize: 11, color: T.inkFaint }}>{r.unidade}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmtQtd(r.demanda)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmtQtd(r.saldoDisponivel)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: r.deficit == null ? T.inkFaint : r.deficit > 0 ? T.rustText : T.oliveText }}>
                      {r.deficit == null ? '—' : r.deficit > 0 ? `-${fmtQtd(r.deficit)}` : `+${fmtQtd(-r.deficit)}`}
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: st.cor, background: st.bg, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <button onClick={() => setDrillMP(r)}
                        style={{ fontSize: 11, color: T.blueText, background: T.blueSoft, border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                        Ver pedidos
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{filtrados.length} matéria{filtrados.length !== 1 ? 's' : ''}-prima · Demanda = Σ (composição do produto × quantidade pendente de entrega)</span>
          <BotaoExportar small onClick={() => exportCSV(filtrados, 'carteira_x_estoque.csv',
            ['codigo','descricao','unidade','demanda','saldoDisponivel','deficit','status'])} />
        </div>
      </div>

      {semComposicao.length > 0 && (
        <Panel title="Produtos em carteira sem composição cadastrada" subtitle="Esses pedidos não entraram no cálculo de demanda acima, porque o produto não está em `composicao_produtos`">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                  <th style={thFat(100)}>Produto</th>
                  <th style={thFat(0)}>Descrição</th>
                  <th style={thFat(120)}>BR</th>
                </tr>
              </thead>
              <tbody>
                {semComposicao.map((f, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '8px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.amberText }}>{f.produto}</td>
                    <td style={{ padding: '8px 12px' }}>{f.descricao}</td>
                    <td style={{ padding: '8px 12px', color: T.inkFaint }}>{f.br || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Modal: pedidos que precisam dessa matéria-prima */}
      {drillMP && (
        <Overlay onClose={() => setDrillMP(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 680,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: T.ink }}>{drillMP.codigo} — {drillMP.descricao}</div>
                <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>
                  Demanda: {fmtQtd(drillMP.demanda)} {drillMP.unidade} · Saldo disponível: {fmtQtd(drillMP.saldoDisponivel)} {drillMP.unidade}
                </div>
              </div>
              <button onClick={() => setDrillMP(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.inkFaint, flexShrink: 0 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '10px 22px', fontSize: 11, color: T.inkFaint, borderBottom: `1px solid ${T.lineSoft}`, background: T.panelAlt }}>
              Pedidos em carteira que vão consumir essa matéria-prima
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                    <th style={thFat(0)}>Produto / BR</th>
                    <th style={{ ...thFat(80), textAlign: 'right' }}>Pendente</th>
                    <th style={{ ...thFat(100), textAlign: 'right' }}>Demanda MP</th>
                    <th style={{ ...thFat(90) }}>Previsão</th>
                  </tr>
                </thead>
                <tbody>
                  {drillMP.itens.map((it, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{it.produto} — {it.descricaoProduto}</div>
                        <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>{it.br || '—'} · {it.cliente || '—'} · Pedido {it.pedido || '—'}</div>
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmtQtd(it.pendente)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, fontFamily: FONT_DISPLAY }}>{fmtQtd(it.demanda)} {drillMP.unidade}</td>
                      <td style={{ padding: '9px 12px', fontSize: 11, color: T.inkFaint }}>{fmtData(it.dataPrevista)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function ConsumoPlacasKalocer() {
  const anoAtual = new Date().getFullYear();
  const [filtros, setFiltros] = useState({ anoIni: 2026, anoFim: anoAtual, mesIni: 1, mesFim: 12 });
  const [linhas, setLinhas] = useState([]); // uma por código da lista (mp_placas_kalocer)
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [sortCol, setSortCol] = useState('consumido');
  const [sortDir, setSortDir] = useState('desc');
  const [drillMP, setDrillMP] = useState(null); // { codigo_mp, descricao, itens: [...] }
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [mostrarSemConsumo, setMostrarSemConsumo] = useState(false);

  const rangeDatas = () => {
    const ini = `${filtros.anoIni}-${String(filtros.mesIni).padStart(2, '0')}-01`;
    const ultimoDia = new Date(filtros.anoFim, filtros.mesFim, 0).getDate();
    const fim = `${filtros.anoFim}-${String(filtros.mesFim).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    return { ini, fim };
  };

  // Cruza a lista de códigos de MP (mp_placas_kalocer) com o consumo REAL por ordem de produção
  // (producao_mp_apontamentos, sincronizada do Sankhya via TPRAPO/TPRAPA/TPRAMP — apontamento de
  // produção de verdade, não estimativa via composição x faturamento).
  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    const { ini, fim } = rangeDatas();

    const rLista = await supabase.from('mp_placas_kalocer').select('codigo_mp,descricao,unidade');
    if (rLista.error) { setErro(`Erro lista de placas: ${rLista.error.message}`); setLoading(false); return; }

    // O Supabase limita cada resposta a ~1000 linhas, mesmo sem pedir explicitamente — por isso
    // buscamos em lotes de 1000 até não vir mais nada, senão o consumo total fica sub-contado.
    const TAMANHO_LOTE = 1000;
    let apontamentos = [];
    let pagina = 0;
    while (true) {
      const { data, error } = await supabase.from('producao_mp_apontamentos')
        .select('nuapo,seq_pa,data_ref,cod_prod_acabado,desc_prod_acabado,qtd_lote_pa,cod_materia_prima,qtd_mp,unidade_mp,br,cliente_nome,nro_ordem_producao')
        .gte('data_ref', ini).lte('data_ref', fim)
        .range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
      if (error) { setErro(`Erro apontamentos: ${error.message}`); setLoading(false); return; }
      apontamentos = apontamentos.concat(data || []);
      if (!data || data.length < TAMANHO_LOTE) break;
      pagina += 1;
      if (pagina > 100) break; // teto de segurança (100k linhas)
    }
    const rApontamentos = { data: apontamentos, error: null };

    const listaCodigos = rLista.data || [];

    // Agrega consumo real por código de MP da lista
    const consumoPorMP = {}; // codigo_mp -> { total, itens: [...] }
    (rApontamentos.data || []).forEach(ap => {
      const codigo = ap.cod_materia_prima;
      if (!codigo) return;
      if (!consumoPorMP[codigo]) consumoPorMP[codigo] = { total: 0, itens: [] };
      const qtd = Number(ap.qtd_mp) || 0;
      consumoPorMP[codigo].total += qtd;
      consumoPorMP[codigo].itens.push({
        nuapo: ap.nuapo, seq_pa: ap.seq_pa,
        produto: ap.cod_prod_acabado, descricao_produto: ap.desc_prod_acabado,
        data_ref: ap.data_ref, qtd_lote_pa: Number(ap.qtd_lote_pa) || 0,
        qtd_mp: qtd, unidade_mp: ap.unidade_mp,
        br: ap.br, cliente_nome: ap.cliente_nome,
      });
    });

    const lista = listaCodigos.map(l => {
      const agr = consumoPorMP[l.codigo_mp];
      return {
        codigo_mp: l.codigo_mp,
        descricao: l.descricao,
        unidade: l.unidade,
        apareceu: !!agr,
        consumido: agr ? agr.total : 0,
        itens: agr ? agr.itens.sort((a, b) => b.qtd_mp - a.qtd_mp) : [],
      };
    });

    setLinhas(lista);
    setLoading(false);
  }, [filtros]);

  // Dispara a sincronização do consumo real de MP por OP direto do Sankhya.
  const handleAtualizarProducao = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sankhya-producao-mp-sync`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataIni: '2025-01-01' }),
      }).then(r => r.json());
      if (res.ok) {
        setSyncStatus({ ok: true, message: `Sincronizado: ${res.gravados} apontamentos de produção.` });
        await carregar();
      } else {
        setSyncStatus({ ok: false, message: res.error || 'Erro desconhecido na sincronização.' });
      }
    } catch (err) {
      setSyncStatus({ ok: false, message: String(err) });
    } finally {
      setSyncing(false);
    }
  };

  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  const [statusRelatorio, setStatusRelatorio] = useState(null);
  const handleGerarRelatorioEstoque = async () => {
    setGerandoRelatorio(true);
    setStatusRelatorio(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/gerar-relatorio-estoque-temp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      }).then(r => r.json());
      setStatusRelatorio(res.ok ? { ok: true, message: `Pronto: ${res.total} códigos processados.` } : { ok: false, message: res.error });
    } catch (err) {
      setStatusRelatorio({ ok: false, message: String(err) });
    } finally {
      setGerandoRelatorio(false);
    }
  };

  const [diagOP, setDiagOP] = useState(null);
  const [diagnosticandoOP, setDiagnosticandoOP] = useState(false);
  const handleDiagnosticarOP = async () => {
    setDiagnosticandoOP(true);
    setDiagOP(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sankhya-diagnostico-op`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      }).then(r => r.json());
      setDiagOP(res);
    } catch (err) {
      setDiagOP({ ok: false, error: String(err) });
    } finally {
      setDiagnosticandoOP(false);
    }
  };

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const filtrados = useMemo(() => {
    return linhas
      .filter(l => mostrarSemConsumo || l.apareceu)
      .filter(l => !busca ||
        l.codigo_mp.toLowerCase().includes(busca.toLowerCase()) ||
        (l.descricao || '').toLowerCase().includes(busca.toLowerCase()) ||
        l.itens.some(it => (it.br || '').toLowerCase().includes(busca.toLowerCase())))
      .sort((a, b) => {
        let va = a[sortCol] ?? 0;
        let vb = b[sortCol] ?? 0;
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [linhas, busca, sortCol, sortDir, mostrarSemConsumo]);

  const kpis = useMemo(() => ({
    totalNaLista: linhas.length,
    apareceram: linhas.filter(l => l.apareceu).length,
    naoApareceram: linhas.filter(l => !l.apareceu).length,
  }), [linhas]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'codigo_mp' ? 'asc' : 'desc'); }
  };

  const LocalSortTh = ({ label, col, right }) => {
    const active = sortCol === col;
    return (
      <th onClick={() => handleSort(col)} style={{ ...thFat(0, right ? 'right' : 'left'), cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <span style={{ color: active ? T.terracotta : T.inkFaint }}>{label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
      </th>
    );
  };

  const fmtQtd = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);
  const fmtDataCurta = (iso) => !iso ? '—' : new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {[
          { label: 'Placas na lista', value: kpis.totalNaLista, color: T.ink, desc: 'Códigos fornecidos (Kalocer)' },
          { label: 'Consumidas no período', value: kpis.apareceram, color: T.oliveText, desc: 'Apareceram em alguma ordem de produção' },
          { label: 'Sem consumo no período', value: kpis.naoApareceram, color: kpis.naoApareceram > 0 ? T.amberText : T.oliveText, desc: 'Não apareceram em nenhum apontamento de produção' },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '12px 14px', boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 10.5, color: T.inkFaint, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: k.color, marginTop: 6 }}>{loading ? '…' : k.value}</div>
            {k.desc && <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 2 }}>{k.desc}</div>}
          </div>
        ))}
      </div>

      {/* Filtros */}
      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Ano início">
            <SelectAnoFat value={filtros.anoIni} onChange={v => setFiltros(f => ({ ...f, anoIni: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Mês início">
            <SelectMesFat value={filtros.mesIni} onChange={v => setFiltros(f => ({ ...f, mesIni: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Ano fim">
            <SelectAnoFat value={filtros.anoFim} onChange={v => setFiltros(f => ({ ...f, anoFim: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Mês fim">
            <SelectMesFat value={filtros.mesFim} onChange={v => setFiltros(f => ({ ...f, mesFim: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Buscar código, descrição ou BR">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: 10988, PLACA-RETANGULAR, BR14206…"
                style={{ ...selectStyleFat(260), paddingLeft: 28 }} />
            </div>
          </FiltroCampoFat>
          {busca && (
            <button onClick={() => setBusca('')}
              style={{ fontSize: 12, color: T.amberText, background: T.amberSoft, border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Limpar
            </button>
          )}
          <button onClick={() => setMostrarSemConsumo(v => !v)}
            style={{
              fontSize: 12, fontWeight: 600, border: `1px solid ${T.line}`, borderRadius: 5, padding: '7px 12px', cursor: 'pointer',
              background: mostrarSemConsumo ? T.blueSoft : T.panel, color: mostrarSemConsumo ? T.blueText : T.inkDim,
            }}>
            {mostrarSemConsumo ? '✓ ' : ''}Mostrar sem consumo ({kpis.naoApareceram})
          </button>
        </div>
      </Panel>

      {/* Tabela — uma linha por código da lista fornecida */}
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <LocalSortTh label="Código"   col="codigo_mp" />
                <th style={thFat(0)}>Descrição</th>
                <th style={{ ...thFat(70), textAlign: 'center' }}>UM</th>
                <LocalSortTh label="Consumido no período" col="consumido" right />
                <th style={{ ...thFat(100), textAlign: 'center' }}>Status</th>
                <th style={{ ...thFat(90), textAlign: 'center' }}>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum código encontrado.</td></tr>
              ) : filtrados.map((r) => (
                <tr key={r.codigo_mp} style={{ borderBottom: `1px solid ${T.lineSoft}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, whiteSpace: 'nowrap' }}>{r.codigo_mp}</td>
                  <td style={{ padding: '9px 12px', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.descricao}>{r.descricao}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', fontSize: 11, color: T.inkFaint }}>{r.unidade}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: r.apareceu ? T.ink : T.inkFaint }}>{r.apareceu ? fmtQtd(r.consumido) : '—'}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    {r.apareceu
                      ? <span style={{ fontSize: 10.5, fontWeight: 700, color: T.oliveText, background: T.oliveSoft, padding: '3px 8px', borderRadius: 4 }}>✓ Consumida</span>
                      : <span style={{ fontSize: 10.5, fontWeight: 700, color: T.inkFaint, background: T.lineSoft, padding: '3px 8px', borderRadius: 4 }}>Sem consumo</span>}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    {r.apareceu && (
                      <button onClick={() => setDrillMP(r)}
                        style={{ fontSize: 11, color: T.blueText, background: T.blueSoft, border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                        Ver produtos
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span>{filtrados.length} código{filtrados.length !== 1 ? 's' : ''} · Consumido = soma real do apontamento de produção (OP) no período — Sankhya (TPRAPO/TPRAPA/TPRAMP)</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleAtualizarProducao} disabled={syncing} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: T.terracotta, color: '#fff', border: 'none',
              borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, opacity: syncing ? 0.7 : 1,
            }}>
              <RefreshCw size={12} className={syncing ? 'spin' : ''} />
              {syncing ? 'Atualizando…' : 'Atualizar produção do Sankhya'}
            </button>
            <BotaoExportar small onClick={() => exportCSV(filtrados, 'consumo_placas_kalocer.csv',
              ['codigo_mp','descricao','unidade','consumido','apareceu'])} />
          </div>
        </div>
      </div>

      {syncStatus && (
        <div style={{ background: syncStatus.ok ? T.oliveSoft : T.rustSoft, color: syncStatus.ok ? T.oliveText : T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5 }}>
          {syncStatus.message}
        </div>
      )}

      {/* TEMPORÁRIO — favor pontual: gerar relatório de estoque/consumo pra Excel */}
      <Panel title="📋 Gerar relatório de estoque (favor pontual)" subtitle="Busca consumo (OP) + estoque atual direto do Sankhya pros 126 códigos pedidos">
        <button onClick={handleGerarRelatorioEstoque} disabled={gerandoRelatorio}
          style={{ background: T.terracotta, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
          {gerandoRelatorio ? 'Gerando…' : 'Gerar relatório'}
        </button>
        {statusRelatorio && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: statusRelatorio.ok ? T.oliveText : T.rustText }}>
            {statusRelatorio.message}
          </div>
        )}
      </Panel>

      {/* TEMPORÁRIO — diagnóstico do campo real de "Nro Ordem Produção" */}
      <Panel title="🔍 Diagnóstico: Nro Ordem Produção (temporário)" subtitle="Um clique — descobre de onde vem o número real da OP que aparece na tela do Sankhya">
        <button onClick={handleDiagnosticarOP} disabled={diagnosticandoOP}
          style={{ background: T.blueText, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
          {diagnosticandoOP ? 'Diagnosticando…' : 'Rodar diagnóstico'}
        </button>
        {diagOP && (
          <pre style={{ fontSize: 11, background: T.panelAlt, padding: 12, borderRadius: 8, overflow: 'auto', maxHeight: 400 }}>
            {JSON.stringify(diagOP, null, 2)}
          </pre>
        )}
      </Panel>

      {/* Modal: produtos que consumiram essa placa */}
      {drillMP && (
        <Overlay onClose={() => setDrillMP(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 640,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: T.ink }}>{drillMP.codigo_mp} — {drillMP.descricao}</div>
                <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>Consumido no período: {fmtQtd(drillMP.consumido)} {drillMP.unidade}</div>
              </div>
              <button onClick={() => setDrillMP(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.inkFaint, flexShrink: 0 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '10px 22px', fontSize: 11, color: T.inkFaint, borderBottom: `1px solid ${T.lineSoft}`, background: T.panelAlt }}>
              Ordens de produção que consumiram essa placa
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                    <th style={thFat(0)}>Produto acabado / OP</th>
                    <th style={{ ...thFat(80), textAlign: 'right' }}>Qtd lote (PA)</th>
                    <th style={{ ...thFat(90), textAlign: 'right' }}>Consumo MP</th>
                  </tr>
                </thead>
                <tbody>
                  {drillMP.itens.map((it, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{it.produto} — {it.descricao_produto}</div>
                        <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>OP {it.nro_ordem_producao ?? it.nuapo} · {fmtDataCurta(it.data_ref)}{it.br ? ` · ${it.br}` : ''}{it.cliente_nome ? ` · ${it.cliente_nome}` : ''}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: T.inkDim }}>{fmtQtd(it.qtd_lote_pa)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontFamily: FONT_DISPLAY }}>{fmtQtd(it.qtd_mp)} {it.unidade_mp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function ConsumoMP() {
  const anoAtual = new Date().getFullYear();
  const [filtros, setFiltros] = useState({ anoIni: 2026, anoFim: anoAtual, mesIni: 1, mesFim: 12 });
  const [itens, setItens] = useState([]);
  const [semComposicao, setSemComposicao] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [sortCol, setSortCol] = useState('data_neg');
  const [sortDir, setSortDir] = useState('desc');
  const [drillGrupo, setDrillGrupo] = useState(null);   // { nunota, br, cliente_nome, data_neg, valor_total, itens: [...] } — nível 1 → 2
  const [drillItem, setDrillItem] = useState(null);     // { ...item, composicao: [...] | null } — nível 2 → 3

  const rangeDatas = () => {
    const ini = `${filtros.anoIni}-${String(filtros.mesIni).padStart(2, '0')}-01`;
    const ultimoDia = new Date(filtros.anoFim, filtros.mesFim, 0).getDate();
    const fim = `${filtros.anoFim}-${String(filtros.mesFim).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    return { ini, fim };
  };

  // Fonte: exatamente a mesma usada em Faturamento → Nota de Venda (nota_venda_itens,
  // filtrado pelos TOPs de venda validados) — o que já saiu, faturado de verdade.
  // Atualiza sozinho conforme o sync do Sankhya roda (mesmo sync que alimenta o Faturamento).
  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    const { ini, fim } = rangeDatas();

    // composicao_produtos tem mais de 1000 linhas — sem paginação, o Supabase corta e produtos
    // que têm composição cadastrada apareceriam errado como "sem composição".
    const buscarComposicaoCompleta = async () => {
      const TAMANHO_LOTE = 1000;
      let todas = [];
      let pagina = 0;
      while (true) {
        const { data, error } = await supabase.from('composicao_produtos').select('cod_prod_pai')
          .range(pagina * TAMANHO_LOTE, (pagina + 1) * TAMANHO_LOTE - 1);
        if (error) return { data: null, error };
        todas = todas.concat(data || []);
        if (!data || data.length < TAMANHO_LOTE) break;
        pagina += 1;
        if (pagina > 100) break;
      }
      return { data: todas, error: null };
    };

    const [rNotas, rComposicao] = await Promise.all([
      supabase.from('nota_venda_itens')
        .select('nunota,sequencia,br,cliente_nome,data_neg,data_faturamento,numero_pedido,valor_bruto,unidade,quantidade,produto_descricao,cod_produto')
        .in('codtipoper', TOPS_FATURAMENTO_VALIDOS)
        .gte('data_neg', ini).lte('data_neg', fim)
        .order('data_neg', { ascending: false }),
      buscarComposicaoCompleta(),
    ]);

    if (rNotas.error) { setErro(`Erro: ${rNotas.error.message}`); setLoading(false); return; }
    if (rComposicao.error) { setErro(`Erro composição: ${rComposicao.error.message}`); setLoading(false); return; }

    const produtosComComposicao = new Set((rComposicao.data || []).map(c => c.cod_prod_pai));

    setItens(rNotas.data || []);
    setSemComposicao(produtosComComposicao);
    setLoading(false);
  }, [filtros]);

  // Carrega a composição de um produto específico e calcula o consumo pela quantidade daquele item faturado.
  const carregarComposicao = useCallback(async (codProduto, quantidade) => {
    const { data, error } = await supabase.from('composicao_produtos')
      .select('cod_prod_mp,descr_prod_mp,unidade,quantidade,disponivel_producao')
      .eq('cod_prod_pai', codProduto)
      .order('quantidade', { ascending: false });
    if (error) return [];
    return (data || []).map(m => ({
      codigo_mp: m.cod_prod_mp,
      descricao_mp: m.descr_prod_mp,
      um: m.unidade,
      quantidade_unitaria: Number(m.quantidade) || 0,
      consumo_calculado: (Number(m.quantidade) || 0) * quantidade,
      disponivel_producao: m.disponivel_producao,
    }));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  // Nível 1: agrupa os itens por nota fiscal (nunota) — um pedido/nota pode ter vários produtos dentro.
  const grupos = useMemo(() => {
    const mapa = new Map();
    itens.forEach(it => {
      if (!mapa.has(it.nunota)) {
        mapa.set(it.nunota, {
          nunota: it.nunota, br: it.br, cliente_nome: it.cliente_nome,
          data_neg: it.data_neg, numero_pedido: it.numero_pedido,
          valor_total: 0, qtd_produtos: 0, itens: [],
        });
      }
      const g = mapa.get(it.nunota);
      g.valor_total += Number(it.valor_bruto) || 0;
      g.qtd_produtos += 1;
      g.itens.push(it);
    });
    return [...mapa.values()];
  }, [itens]);

  const filtrados = useMemo(() => {
    return grupos
      .filter(g => !busca ||
        (g.br || '').toLowerCase().includes(busca.toLowerCase()) ||
        (g.cliente_nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        g.itens.some(it => (it.cod_produto || '').toLowerCase().includes(busca.toLowerCase()) ||
                            (it.produto_descricao || '').toLowerCase().includes(busca.toLowerCase())))
      .sort((a, b) => {
        let va = a[sortCol] ?? 0;
        let vb = b[sortCol] ?? 0;
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [grupos, busca, sortCol, sortDir]);

  const kpis = useMemo(() => {
    const totalFaturado = filtrados.reduce((s, g) => s + g.valor_total, 0);
    const totalItens = filtrados.reduce((s, g) => s + g.qtd_produtos, 0);
    const todosItens = filtrados.flatMap(g => g.itens);
    const semComp = todosItens.filter(it => it.cod_produto && !semComposicao.has(it.cod_produto)).length;
    return { totalGrupos: filtrados.length, totalItens, totalFaturado, semComp };
  }, [filtrados, semComposicao]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'data_neg' ? 'desc' : 'asc'); }
  };

  const fmtQtd = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);
  const fmtR = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);
  const fmtRCheia = (v) => v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtDataCurta = (iso) => !iso ? '—' : new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  // Nível 2 → 3: abre a composição de um produto específico dentro do grupo.
  const abrirComposicao = async (it) => {
    setDrillItem({ ...it, composicao: null });
    const composicao = await carregarComposicao(it.cod_produto, Number(it.quantidade) || 0);
    setDrillItem(prev => prev && prev.nunota === it.nunota && prev.sequencia === it.sequencia ? { ...prev, composicao } : prev);
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {erro && (
        <div style={{ background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {erro}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {[
          { label: 'Notas faturadas', value: kpis.totalGrupos, color: T.ink, desc: `${kpis.totalItens} produtos no período` },
          { label: 'Total faturado', value: fmtR(kpis.totalFaturado), color: T.oliveText, desc: 'Soma do valor bruto' },
          { label: 'Produtos sem composição', value: kpis.semComp, color: kpis.semComp > 0 ? T.amberText : T.oliveText, desc: 'Não está em `composicao_produtos`' },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: '12px 14px', boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 10.5, color: T.inkFaint, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: k.color, marginTop: 6 }}>{loading ? '…' : k.value}</div>
            {k.desc && <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 2 }}>{k.desc}</div>}
          </div>
        ))}
      </div>

      {/* Filtros */}
      <Panel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FiltroCampoFat label="Ano início">
            <SelectAnoFat value={filtros.anoIni} onChange={v => setFiltros(f => ({ ...f, anoIni: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Mês início">
            <SelectMesFat value={filtros.mesIni} onChange={v => setFiltros(f => ({ ...f, mesIni: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Ano fim">
            <SelectAnoFat value={filtros.anoFim} onChange={v => setFiltros(f => ({ ...f, anoFim: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Mês fim">
            <SelectMesFat value={filtros.mesFim} onChange={v => setFiltros(f => ({ ...f, mesFim: v }))} />
          </FiltroCampoFat>
          <FiltroCampoFat label="Buscar BR, cliente ou produto">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: BR14206, Vale, 17988…"
                style={{ ...selectStyleFat(240), paddingLeft: 28 }} />
            </div>
          </FiltroCampoFat>
          {busca && (
            <button onClick={() => setBusca('')}
              style={{ fontSize: 12, color: T.amberText, background: T.amberSoft, border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Limpar
            </button>
          )}
        </div>
      </Panel>

      {/* Nível 1 — grupos por nota fiscal: BR, Cliente, Data, Qtd de produtos, Valor */}
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.panelAlt, borderBottom: `1px solid ${T.line}` }}>
                <th onClick={() => handleSort('data_neg')} style={{ ...thFat(0), cursor: 'pointer' }}>
                  <span style={{ color: sortCol === 'data_neg' ? T.terracotta : T.inkFaint }}>Data{sortCol === 'data_neg' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </th>
                <th onClick={() => handleSort('br')} style={{ ...thFat(0), cursor: 'pointer' }}>
                  <span style={{ color: sortCol === 'br' ? T.terracotta : T.inkFaint }}>BR{sortCol === 'br' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </th>
                <th onClick={() => handleSort('cliente_nome')} style={{ ...thFat(0), cursor: 'pointer' }}>
                  <span style={{ color: sortCol === 'cliente_nome' ? T.terracotta : T.inkFaint }}>Cliente{sortCol === 'cliente_nome' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </th>
                <th style={{ ...thFat(90), textAlign: 'center' }}>Qtd produtos</th>
                <th onClick={() => handleSort('valor_total')} style={{ ...thFat(0, 'right'), cursor: 'pointer' }}>
                  <span style={{ color: sortCol === 'valor_total' ? T.terracotta : T.inkFaint }}>Valor{sortCol === 'valor_total' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhuma nota faturada no período.</td></tr>
              ) : filtrados.map((g) => (
                <tr key={g.nunota} style={{ borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer' }}
                  onClick={() => setDrillGrupo(g)}
                  onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px', fontSize: 11.5, color: T.inkFaint, whiteSpace: 'nowrap' }}>{fmtDataCurta(g.data_neg)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.blueText, whiteSpace: 'nowrap' }}>{g.br || '—'}</td>
                  <td style={{ padding: '10px 12px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={g.cliente_nome}>{g.cliente_nome || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: T.inkDim }}>{g.qtd_produtos}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.ink }}>{fmtR(g.valor_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkFaint, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{filtrados.length} nota{filtrados.length !== 1 ? 's' : ''} faturada{filtrados.length !== 1 ? 's' : ''} · Fonte: Nota de Venda (mesmos TOPs validados do Faturamento) · Clique numa linha para ver os produtos</span>
          <BotaoExportar small onClick={() => exportCSV(filtrados.map(g => ({ data_neg: g.data_neg, br: g.br, cliente_nome: g.cliente_nome, qtd_produtos: g.qtd_produtos, valor_total: g.valor_total })), 'consumo_mp_faturado.csv',
            ['data_neg','br','cliente_nome','qtd_produtos','valor_total'])} />
        </div>
      </div>

      {/* Nível 2 — produtos dentro da nota selecionada */}
      {drillGrupo && !drillItem && (
        <Overlay onClose={() => setDrillGrupo(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 640,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: T.ink }}>{drillGrupo.br || '—'} — {drillGrupo.cliente_nome}</div>
                <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>{fmtDataCurta(drillGrupo.data_neg)} · {drillGrupo.qtd_produtos} produto{drillGrupo.qtd_produtos !== 1 ? 's' : ''} · {fmtRCheia(drillGrupo.valor_total)}</div>
              </div>
              <button onClick={() => setDrillGrupo(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.inkFaint, flexShrink: 0 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '10px 22px', fontSize: 11, color: T.inkFaint, borderBottom: `1px solid ${T.lineSoft}`, background: T.panelAlt }}>
              Produtos faturados nessa nota — clique num produto para ver a composição
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {drillGrupo.itens.map((it, i) => {
                const temComposicao = it.cod_produto && semComposicao.has(it.cod_produto);
                return (
                  <div key={i} onClick={() => abrirComposicao(it)}
                    style={{ padding: '14px 22px', borderBottom: `1px solid ${T.lineSoft}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
                    onMouseEnter={e => e.currentTarget.style.background = T.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: T.ink, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ color: T.blueText }}>{it.cod_produto || '—'}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {it.produto_descricao}</span>
                        {!temComposicao && <span title="Sem composição cadastrada" style={{ color: T.amberText, fontSize: 12, flexShrink: 0 }}>⚠</span>}
                      </div>
                      <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>Qtd: {fmtQtd(it.quantidade)} {it.unidade}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13.5, fontWeight: 700, color: T.ink }}>{fmtR(it.valor_bruto)}</div>
                      <div style={{ fontSize: 10, color: T.blueText, marginTop: 2 }}>Ver composição →</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Overlay>
      )}

      {/* Nível 3 — composição do produto, calculada pela quantidade daquele item faturado */}
      {drillItem && (
        <Overlay onClose={() => setDrillItem(null)}>
          <div className="scale-in" style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, width: '100%', maxWidth: 640,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <button onClick={() => setDrillItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.blueText, fontSize: 11, padding: 0, marginBottom: 6 }}>← Voltar aos produtos</button>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1.25 }}>{drillItem.cod_produto || '—'} — {drillItem.produto_descricao}</div>
                <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>{drillItem.br || '—'} · {drillItem.cliente_nome} · Qtd faturada: {fmtQtd(drillItem.quantidade)} {drillItem.unidade} · {fmtRCheia(drillItem.valor_bruto)}</div>
              </div>
              <button onClick={() => { setDrillItem(null); setDrillGrupo(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.inkFaint, flexShrink: 0 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '10px 22px', fontSize: 11, color: T.inkFaint, borderBottom: `1px solid ${T.lineSoft}`, background: T.panelAlt }}>
              Composição do produto (Sankhya) — itens e quantidade consumida nessa quantidade faturada
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {!drillItem.cod_produto ? (
                <div style={{ padding: '40px 30px', textAlign: 'center' }}>
                  <AlertTriangle size={22} color={T.amberText} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 13, color: T.ink, fontWeight: 600, marginBottom: 4 }}>Item sem código de produto sincronizado</div>
                  <div style={{ fontSize: 12, color: T.inkFaint }}>Clique em "Atualizar do Sankhya" na aba Faturamento para completar esse dado.</div>
                </div>
              ) : drillItem.composicao === null ? (
                <div style={{ padding: 40, textAlign: 'center', color: T.inkFaint, fontSize: 12.5 }}>Carregando…</div>
              ) : drillItem.composicao.length === 0 ? (
                <div style={{ padding: '40px 30px', textAlign: 'center' }}>
                  <FileWarning size={22} color={T.inkFaint} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 13, color: T.ink, fontWeight: 600, marginBottom: 4 }}>Sem composição cadastrada</div>
                  <div style={{ fontSize: 12, color: T.inkFaint }}>Esse produto ainda não está em `composicao_produtos` — pode ser preciso incluir o código na lista sincronizada do Sankhya.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.line}`, position: 'sticky', top: 0, background: T.panel }}>
                      <th style={thFat(0)}>Matéria-prima</th>
                      <th style={{ ...thFat(90), textAlign: 'right' }}>Qtd unitária</th>
                      <th style={{ ...thFat(100), textAlign: 'right' }}>Consumido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drillItem.composicao.map((it, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600 }}>{it.descricao_mp || `MP ${it.codigo_mp}`}</div>
                          <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>{it.codigo_mp}</div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: T.inkDim }}>{fmtQtd(it.quantidade_unitaria)} {it.um}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontFamily: FONT_DISPLAY }}>{fmtQtd(it.consumo_calculado)} {it.um}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}



function Almoxarifado({ currentUser }) {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos'); // Todos | Zerado | Crítico | OK
  const [sortBy, setSortBy] = useState('disponivel_mp');
  const [sortDir, setSortDir] = useState('desc');
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemSync, setMensagemSync] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    supabaseSGQ.from('almoxarifado_saldo_mp').select('*')
      .then(({ data, error }) => {
        if (error) { setErro(`Erro: ${error.message}`); setLoading(false); return; }
        setDados(data || []);
        setLoading(false);
      })
      .catch(err => { setErro(`Falha de rede: ${err?.message || String(err)}`); setLoading(false); });
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const sincronizarAgora = async () => {
    setSincronizando(true);
    setMensagemSync(null);
    try {
      const res = await fetch(`${SUPABASE_SGQ_URL}/functions/v1/almoxarifado-saldo-mp-sync`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      }).then(r => r.json());
      if (res.ok) {
        setMensagemSync({ ok: true, texto: `${res.produtos_sincronizados} produtos atualizados.` });
        carregar();
      } else {
        setMensagemSync({ ok: false, texto: res.erro || 'Erro desconhecido.' });
      }
    } catch (err) {
      setMensagemSync({ ok: false, texto: String(err.message || err) });
    }
    setSincronizando(false);
  };

  const grupos = useMemo(() => {
    const set = new Set(dados.map(d => d.descrgrupoprod).filter(Boolean));
    const destaque = GRUPOS_DESTAQUE.filter(g => set.has(g));
    const resto = [...set].filter(g => !GRUPOS_DESTAQUE.includes(g)).sort();
    return ['Todos', ...destaque, ...resto];
  }, [dados]);

  // Status baseado no estoque de matéria-prima e em quanto disso já tem destino certo (reservado)
  const statusItem = (row) => {
    const estoqueMp = Number(row.estoque_mp) || 0;
    const reservadoMp = Number(row.reservado_mp) || 0;
    if (estoqueMp <= 0) return 'Zerado';
    if (reservadoMp >= estoqueMp) return 'Crítico'; // já tem reserva pra tudo que existe
    if (reservadoMp > estoqueMp * 0.7) return 'Atenção';
    return 'OK';
  };

  const filtrados = useMemo(() => {
    return dados.filter(r => {
      const matchBusca = !busca ||
        String(r.codprod).includes(busca) ||
        (r.descrprod || '').toLowerCase().includes(busca.toLowerCase());
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
    skus:     filtrados.length,
    zerados:  filtrados.filter(r => statusItem(r) === 'Zerado').length,
    criticos: filtrados.filter(r => { const s = statusItem(r); return s === 'Crítico' || s === 'Atenção'; }).length,
    totalDisponivel: filtrados.reduce((s, r) => s + (Number(r.disponivel_mp) || 0), 0),
    ultimaSync: dados.length ? dados.reduce((latest, r) => {
      const d = new Date(r.sincronizado_em);
      return d > latest ? d : latest;
    }, new Date(0)) : null,
  }), [filtrados, dados]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const statusColor = (st) => ({
    Zerado:  [T.rustText,  T.rustSoft],
    Crítico: [T.rustText,  T.rustSoft],
    Atenção: [T.amberText, T.amberSoft],
    OK:      [T.oliveText, T.oliveSoft],
  }[st] || [T.inkFaint, T.lineSoft]);

  const fmtQtd = (v) => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  // Visualização limitada: só código, descrição, disponível e reservado — sem
  // sincronizar, exportar, KPIs administrativos ou detalhes de processamento.
  const veTudo = currentUser?.ve_almoxarifado_completo !== false;
  const filtradosSimples = useMemo(() => {
    return dados.filter(r => !busca ||
      String(r.codprod).includes(busca) ||
      (r.descrprod || '').toLowerCase().includes(busca.toLowerCase())
    ).sort((a, b) => (Number(b.disponivel_mp) || 0) - (Number(a.disponivel_mp) || 0));
  }, [dados, busca]);

  if (!veTudo) {
    return (
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
        {erro && (
          <div style={{ background: T.rustSoft, border: `1px solid ${T.rust}33`, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <AlertTriangle size={16} color={T.rustText} />
            <div style={{ fontSize: 13, color: T.rustText }}>{erro}</div>
          </div>
        )}
        <FiltroCampoFat label="Buscar código ou descrição">
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: T.inkFaint }} />
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Ex: 10988, PLACA, KLC…"
              style={{ ...selectStyleFat(300), paddingLeft: 28 }} />
          </div>
        </FiltroCampoFat>
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, background: T.panelAlt }}>
                <th style={{ ...thFat(), width: 74 }}>Código</th>
                <th style={thFat()}>Descrição</th>
                <th style={{ ...thFat(60), textAlign: 'center' }}>Un.</th>
                <th style={{ ...thFat(110), textAlign: 'right' }}>Disponível</th>
                <th style={{ ...thFat(110), textAlign: 'right' }}>Reservado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>
              ) : filtradosSimples.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum item encontrado.</td></tr>
              ) : filtradosSimples.map(r => (
                <tr key={r.codprod} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '10px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, color: T.terracotta }}>{r.codprod}</td>
                  <td style={{ padding: '10px 12px', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.descrprod}>{r.descrprod}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: T.inkFaint }}>{r.codvol || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: T.oliveText }}>{fmtQtd(r.disponivel_mp)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, color: Number(r.reservado_mp) > 0 ? T.amberText : T.inkFaint }}>{fmtQtd(r.reservado_mp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1400 }}>

      {erro && (
        <div style={{ background: T.rustSoft, border: `1px solid ${T.rust}33`, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={16} color={T.rustText} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.rustText }}>Erro ao carregar saldo de matéria-prima</div>
            <div style={{ fontSize: 12, color: T.inkDim, marginTop: 2 }}>{erro}</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 12.5, color: T.inkFaint, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 14px' }}>
        <strong>Disponível</strong> = Estoque de matéria-prima menos o que já está reservado pra algum projeto — é o que realmente sobra livre pra usar. <strong>Em processamento</strong> = já foi retirado do estoque e está em uso na produção.
      </div>

      {/* Sync info + botão manual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {totais.ultimaSync && totais.ultimaSync.getTime() > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: T.inkFaint }}>
            <RefreshCw size={12} />
            Sincronizado com Sankhya em {totais.ultimaSync.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · atualização automática a cada 2h
          </div>
        ) : <div />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mensagemSync && <span style={{ fontSize: 11, color: mensagemSync.ok ? T.oliveText : T.rustText }}>{mensagemSync.texto}</span>}
          <button onClick={sincronizarAgora} disabled={sincronizando}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#fff', background: T.terracotta, border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', opacity: sincronizando ? 0.7 : 1 }}>
            <RefreshCw size={13} className={sincronizando ? 'spin' : ''} />
            {sincronizando ? 'Sincronizando…' : 'Sincronizar agora'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-kpis-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))' }}>
        {[
          { label: 'Total de SKUs',       value: fmtQtd(totais.skus),           color: T.ink,      icon: Package },
          { label: 'Zerados',             value: fmtQtd(totais.zerados),        color: totais.zerados > 0 ? T.rustText : T.oliveText, icon: AlertTriangle },
          { label: 'Críticos / Atenção',  value: fmtQtd(totais.criticos),       color: totais.criticos > 0 ? T.amberText : T.oliveText, icon: AlertTriangle },
          { label: 'Total disponível',    value: fmtQtd(totais.totalDisponivel), color: T.oliveText, icon: CheckCircle2 },
          { label: 'Grupos de produto',   value: grupos.length - 1,             color: T.blueText, icon: Layers },
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
          <FiltroCampoFat label="Buscar código ou descrição">
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
                <option value="disponivel_mp">Disponível</option>
                <option value="estoque_mp">Estoque MP</option>
                <option value="reservado_mp">Reservado</option>
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
                <AlmoxSortTh label="Estoque MP"      col="estoque_mp"             sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <AlmoxSortTh label="Reservado"       col="reservado_mp"           sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <AlmoxSortTh label="Disponível"      col="disponivel_mp"          sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <AlmoxSortTh label="Em process."     col="estoque_processamento"  sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                <th style={{ ...thFat(70), textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.inkFaint }}>Carregando saldo…</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>Nenhum item encontrado.</td></tr>
              ) : filtrados.map(r => {
                const st = statusItem(r);
                const [stColor, stBg] = statusColor(st);
                const isZerado = st === 'Zerado';
                return (
                  <tr key={r.codprod}
                    style={{ borderBottom: `1px solid ${T.lineSoft}`, background: isZerado ? `${T.rustSoft}44` : 'transparent' }}
                  >
                    <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 12.5, color: T.terracotta }}>{r.codprod}</td>
                    <td style={{ padding: '9px 12px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5 }} title={r.descrprod}>{r.descrprod}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: T.blueText, background: T.blueSoft, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap' }}>{r.descrgrupoprod || '—'}</span>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>{r.codvol || '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12, color: T.inkDim }}>{fmtQtd(r.estoque_mp)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12, color: Number(r.reservado_mp) > 0 ? T.amberText : T.inkFaint, fontWeight: Number(r.reservado_mp) > 0 ? 600 : 400 }}>{fmtQtd(r.reservado_mp)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: isZerado ? T.rustText : T.oliveText }}>{fmtQtd(r.disponivel_mp)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 12, color: T.inkDim }}>{fmtQtd(r.estoque_processamento)}</td>
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
            {filtrados.length} SKU{filtrados.length !== 1 ? 's' : ''} ·
            <span style={{ color: T.rustText, fontWeight: 600 }}> Zerado</span> ·
            <span style={{ color: T.amberText, fontWeight: 600 }}> Crítico</span> ·
            <span style={{ color: T.oliveText, fontWeight: 600 }}> OK</span>
          </span>
          <BotaoExportar small onClick={() => exportCSV(filtrados, 'almoxarifado_saldo_mp.csv', ['codprod','descrprod','descrgrupoprod','codvol','estoque_mp','reservado_mp','disponivel_mp','estoque_processamento'])} />
        </div>
      </div>
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

function EmptyStateFat({ texto }) {
  return <p style={{ fontSize: 12, color: T.inkFaint, textAlign: 'center', padding: '16px 0', margin: 0 }}>{texto || 'Sem dados — clique em "Atualizar do Sankhya".'}</p>;
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
  const [periodo, setPeriodo] = useState({ dataIni: '2026-01-01', dataFim: new Date().toISOString().slice(0, 10) });

  const [descricaoAberta, setDescricaoAberta] = useState(null); // { cod, descricao } — modal de descrição completa
  const [buscaCodVale, setBuscaCodVale] = useState('');
  const [exportandoExcel, setExportandoExcel] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('v_pedidos_vale').select('*')
      .gte('data_neg', periodo.dataIni).lte('data_neg', periodo.dataFim)
      .order('data_neg', { ascending: false });
    setLinhas(data || []);
    setLoading(false);
  }, [periodo]);

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

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
    const linhasCsv = linhasFiltradas.map(l => [
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

  // Filtro por Cód Vale — o usuário digita um código e vê só os pedidos daquele código,
  // com o total de peças agregado (pode ter saído em mais de um pedido/BR/data).
  const linhasFiltradas = useMemo(() => {
    if (!buscaCodVale.trim()) return linhas;
    const termo = buscaCodVale.trim().toLowerCase();
    return linhas.filter(l => (l.cod_vale || '').toLowerCase().includes(termo));
  }, [linhas, buscaCodVale]);

  const analiseCodVale = useMemo(() => {
    if (!buscaCodVale.trim()) return null;
    const totalPecas = linhasFiltradas.reduce((s, l) => s + (Number(l.qtd_pecas) || 0), 0);
    const brsDistintos = new Set(linhasFiltradas.map(l => l.br).filter(Boolean));
    const clientesDistintos = new Set(linhasFiltradas.map(l => l.client).filter(Boolean));
    return { totalPecas, totalPedidos: linhasFiltradas.length, totalBrs: brsDistintos.size, totalClientes: clientesDistintos.size };
  }, [linhasFiltradas, buscaCodVale]);

  // Exporta em Excel de verdade (formatado: cabeçalho colorido, larguras de coluna,
  // linhas "sem regra" destacadas) — usa a mesma lista já filtrada na tela.
  const exportarExcel = async () => {
    setExportandoExcel(true);
    try {
      // Carrega a biblioteca só quando realmente precisa — evita engordar o carregamento
      // inicial do site inteiro por causa de uma função usada só nessa aba.
      const { default: ExcelJS } = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Portal Engenharia Kalenborn';
      workbook.created = new Date();
      const sheet = workbook.addWorksheet('Pedidos Vale', { views: [{ state: 'frozen', ySplit: 1 }] });

      const colunas = [
        { header: 'Nº', key: 'numero', width: 8 },
        { header: 'Month', key: 'month_nome', width: 12 },
        { header: 'Year', key: 'ano', width: 8 },
        { header: 'Client', key: 'client', width: 26 },
        { header: 'UF', key: 'uf', width: 6 },
        { header: 'BR', key: 'br', width: 14 },
        { header: 'Cod. Vale', key: 'cod_vale', width: 12 },
        { header: 'Margem atual %', key: 'margem_atual_pct', width: 14 },
        { header: 'Qtd peças', key: 'qtd_pecas', width: 11 },
        { header: 'Area da Placa (m2)', key: 'area_placa_m2', width: 16 },
        { header: 'Qtd. Cerâmica 1 (PC)', key: 'qtd_ceramica_1', width: 16 },
        { header: 'Qtd. Total Cerâmica 1 (PC)', key: 'qtd_total_ceramica_1', width: 18 },
        { header: 'Cerâmica 1 Código', key: 'ceramica_1_codigo', width: 14 },
        { header: 'Cerâmica 1 Descrição', key: 'ceramica_1_descricao', width: 30 },
        { header: 'Qtd. Cerâmica 2 (PC)', key: 'qtd_ceramica_2', width: 16 },
        { header: 'Qtd. Total Cerâmica 2 (PC)', key: 'qtd_total_ceramica_2', width: 18 },
        { header: 'Cerâmica 2 Código', key: 'ceramica_2_codigo', width: 14 },
        { header: 'Cerâmica 2 Descrição', key: 'ceramica_2_descricao', width: 30 },
        { header: 'Qtd. Cerâmica 3 (PC)', key: 'qtd_ceramica_3', width: 16 },
        { header: 'Qtd. Total Cerâmica 3 (PC)', key: 'qtd_total_ceramica_3', width: 18 },
        { header: 'Cerâmica 3 Código', key: 'ceramica_3_codigo', width: 14 },
        { header: 'Cerâmica 3 Descrição', key: 'ceramica_3_descricao', width: 30 },
        { header: 'Qtd. Cerâmica 4 (PC)', key: 'qtd_ceramica_4', width: 16 },
        { header: 'Qtd. Total Cerâmica 4 (PC)', key: 'qtd_total_ceramica_4', width: 18 },
        { header: 'Cerâmica 4 Código', key: 'ceramica_4_codigo', width: 14 },
        { header: 'Cerâmica 4 Descrição', key: 'ceramica_4_descricao', width: 30 },
        { header: 'Espessura Cerâmica (mm)', key: 'espessura_ceramica_mm', width: 16 },
        { header: 'Layout Placa (mm)', key: 'layout_placa_mm', width: 16 },
        { header: 'MGT?', key: 'mgt', width: 8 },
        { header: 'Autoimpacto', key: 'autoimpacto', width: 12 },
      ];
      sheet.columns = colunas;

      linhasFiltradas.forEach(l => {
        sheet.addRow({
          numero: l.numero, month_nome: l.month_nome?.trim(), ano: l.ano, client: l.client, uf: l.uf, br: l.br,
          cod_vale: l.cod_vale, margem_atual_pct: l.margem_atual_pct ?? null, qtd_pecas: Number(l.qtd_pecas) || 0,
          area_placa_m2: l.area_placa_m2 ?? '#N/A', qtd_ceramica_1: l.qtd_ceramica_1 ?? '#N/A',
          qtd_total_ceramica_1: l.qtd_total_ceramica_1 ?? '#N/A', ceramica_1_codigo: l.ceramica_1_codigo ?? '#N/A',
          ceramica_1_descricao: l.ceramica_1_descricao ?? '#N/A', qtd_ceramica_2: l.qtd_ceramica_2 ?? '#N/A',
          qtd_total_ceramica_2: l.qtd_total_ceramica_2 ?? '#N/A', ceramica_2_codigo: l.ceramica_2_codigo ?? '#N/A',
          ceramica_2_descricao: l.ceramica_2_descricao ?? '#N/A', qtd_ceramica_3: l.qtd_ceramica_3 ?? '#N/A',
          qtd_total_ceramica_3: l.qtd_total_ceramica_3 ?? '#N/A', ceramica_3_codigo: l.ceramica_3_codigo ?? '#N/A',
          ceramica_3_descricao: l.ceramica_3_descricao ?? '#N/A', qtd_ceramica_4: l.qtd_ceramica_4 ?? '#N/A',
          qtd_total_ceramica_4: l.qtd_total_ceramica_4 ?? '#N/A', ceramica_4_codigo: l.ceramica_4_codigo ?? '#N/A',
          ceramica_4_descricao: l.ceramica_4_descricao ?? '#N/A', espessura_ceramica_mm: l.espessura_ceramica_mm ?? '#N/A',
          layout_placa_mm: l.layout_placa_mm ?? '#N/A', mgt: l.mgt, autoimpacto: l.autoimpacto,
        });
      });

      // Cabeçalho: fundo terracota, texto branco, negrito
      const headerRow = sheet.getRow(1);
      headerRow.eachCell(cell => {
        cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8261C' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FF999999' } } };
      });
      headerRow.height = 32;

      // Linhas de dados: fonte Arial, "sem regra" destacada em âmbar, zebra nas demais
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const linha = linhasFiltradas[rowNumber - 2];
        const semRegraLinha = linha?.area_placa_m2 == null;
        row.eachCell({ includeEmpty: true }, cell => {
          cell.font = { name: 'Arial', size: 10.5 };
          cell.alignment = { vertical: 'middle' };
          if (semRegraLinha) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF0DC' } };
          else if (rowNumber % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F4F0' } };
        });
        row.getCell('qtd_pecas').numFmt = '#,##0';
        row.getCell('margem_atual_pct').numFmt = '0.0%';
      });

      // Linha de resumo no rodapé
      const linhaResumo = sheet.addRow({});
      const totalGeral = linhasFiltradas.reduce((s, l) => s + (Number(l.qtd_pecas) || 0), 0);
      sheet.getCell(`H${linhaResumo.number}`).value = 'Total de peças:';
      sheet.getCell(`H${linhaResumo.number}`).font = { name: 'Arial', bold: true, size: 10.5 };
      sheet.getCell(`I${linhaResumo.number}`).value = totalGeral;
      sheet.getCell(`I${linhaResumo.number}`).font = { name: 'Arial', bold: true, size: 10.5, color: { argb: 'FFC8261C' } };
      sheet.getCell(`I${linhaResumo.number}`).numFmt = '#,##0';

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const sufixo = buscaCodVale.trim() ? `_${buscaCodVale.trim()}` : '';
      a.href = url; a.download = `pedidos_vale${sufixo}_${periodo.dataIni}_${periodo.dataFim}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportandoExcel(false);
    }
  };

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
          <FiltroCampoFat label="Buscar Cód Vale">
            <input value={buscaCodVale} onChange={e => setBuscaCodVale(e.target.value)} placeholder="Ex: 15342946"
              style={{ ...selectStyleFat(160) }} />
          </FiltroCampoFat>
          <button onClick={exportarCsv} disabled={!linhasFiltradas.length} style={{ ...ghostBtn(T.terracottaText), opacity: linhasFiltradas.length ? 1 : 0.5 }}>
            <DownloadCloud size={14} /> Exportar CSV
          </button>
          <button onClick={exportarExcel} disabled={!linhasFiltradas.length || exportandoExcel} style={{ ...ghostBtn(T.oliveText), opacity: linhasFiltradas.length ? 1 : 0.5 }}>
            <DownloadCloud size={14} /> {exportandoExcel ? 'Gerando…' : 'Exportar Excel'}
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

      {analiseCodVale && (
        <div style={{ background: T.blueSoft, border: `1px solid ${T.blue}33`, borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: T.blueText, fontWeight: 600 }}>Cód Vale "{buscaCodVale}" — total de peças</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: T.blueText, marginTop: 4 }}>{new Intl.NumberFormat('pt-BR').format(analiseCodVale.totalPecas)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>Pedidos</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, color: T.ink, marginTop: 4 }}>{analiseCodVale.totalPedidos}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>BRs distintos</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, color: T.ink, marginTop: 4 }}>{analiseCodVale.totalBrs}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>Clientes distintos</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, color: T.ink, marginTop: 4 }}>{analiseCodVale.totalClientes}</div>
          </div>
        </div>
      )}

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
                  <th style={thFat()}>Cód Sankhya</th>
                  <th style={thFat()}>Descrição</th>
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
                {linhasFiltradas.length === 0 ? (
                  <tr><td colSpan={14} style={{ padding: 30, textAlign: 'center', color: T.inkFaint }}>{buscaCodVale ? 'Nenhum pedido com esse Cód Vale.' : 'Nenhum pedido Vale no período. Clique em "Atualizar do Sankhya".'}</td></tr>
                ) : linhasFiltradas.map(l => {
                  const semRegraLinha = l.area_placa_m2 === null;
                  return (
                    <tr key={l.pedido_item_id} style={{ borderBottom: `1px solid ${T.lineSoft}`, background: semRegraLinha ? T.amberSoft : 'transparent' }}>
                      <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap', fontFamily: FONT_DISPLAY }}>{fmtData(l.data_neg)}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim, whiteSpace: 'nowrap' }}>{l.month_nome?.trim()}/{l.ano}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.client}>{l.client}</td>
                      <td style={{ padding: '9px 12px', color: T.inkDim }}>{l.uf || '—'}</td>
                      <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{l.br || '—'}</td>
                      <td style={{ padding: '9px 12px', fontFamily: FONT_DISPLAY, color: T.blueText, whiteSpace: 'nowrap' }}>{l.cod_sankhya || '—'}</td>
                      <td style={{ padding: '9px 12px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: l.descricao_produto ? 'pointer' : 'default', color: l.descricao_produto ? T.inkDim : T.inkFaint }}
                        onClick={() => l.descricao_produto && setDescricaoAberta({ cod: l.cod_sankhya, descricao: l.descricao_produto })}
                        title="Clique pra ver a descrição completa">
                        {l.descricao_produto ? `${l.descricao_produto.slice(0, 34)}${l.descricao_produto.length > 34 ? '…' : ''}` : '—'}
                      </td>
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

      {descricaoAberta && (
        <Overlay onClose={() => setDescricaoAberta(null)}>
          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 20, maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: T.blueText }}>{descricaoAberta.cod || '—'}</div>
              <button onClick={() => setDescricaoAberta(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint }}><X size={18} /></button>
            </div>
            <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5 }}>{descricaoAberta.descricao}</div>
          </div>
        </Overlay>
      )}

      <ComparativoItens moeda="BRL" converter={v => v} fmtValor={fmtMoeda} />
    </div>
  );
}

/* ============================================================================
   INTEGRAÇÕES — ponte com Power Automate
============================================================================ */
/* ============================================================================
   AUDITORIA — quem alterou o quê em cada proposta
============================================================================ */
const CAMPO_LABEL = {
  br: 'BR', cliente: 'Cliente', uf: 'UF', tipo_proposta: 'Tipo', escopo: 'Escopo',
  grupo_produto: 'Grupo de produto', descricao_servico: 'Descrição do serviço',
  classificacao: 'Classificação', mes: 'Mês', responsavel_id: 'Responsável',
  data_abertura: 'Data de abertura', data_entrega_prevista: 'Prazo de entrega',
  data_conclusao: 'Data de conclusão', status: 'Status', conhecimento_pedido: 'Conhecimento de pedido',
  data_conhecimento_pedido: 'Data de conhecimento de pedido', valor_liquido: 'Valor líquido',
  observacao: 'Observação', informacoes_faltantes: 'Informações faltantes',
  sankhya_referencia: 'Referência Sankhya', validado_pelo_engenheiro: 'Validado pelo engenheiro',
  aprovador_pool_id: 'Aprovador', data_decisao_final: 'Data da decisão final', comentario_decisao: 'Comentário da decisão',
};

/* ============================================================================
   ABERTURA DE COTAÇÃO — comercial solicita abertura, gera e-mail padronizado
   NOTA: isso gera o texto e registra a solicitação no banco. O envio automático
   mantendo a thread do e-mail (Outlook/Power Automate) depende de uma
   integração à parte que ainda não está configurada neste portal.
============================================================================ */
function AberturaCotacao({ currentUser }) {
  const vazio = { brNumero: '', clienteNome: '', projeto: '', categoriaCliente: '', contato: '', prazoEnvio: '', escopoExtra: '', emailThreadReferencia: '' };
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('cotacoes_abertura').select('*').order('solicitado_em', { ascending: false }).limit(50);
    setHistorico(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const assunto = `ABERTURA DE COTAÇÃO - BR${form.brNumero || '{número}'} - ${form.clienteNome || '{cliente}'}`;
  const corpo = `Prezados, boa tarde!

Encaminho abaixo as informações para abertura de proposta da ${form.clienteNome || '{cliente}'}

- Projeto: ${form.projeto || '—'}
- Categoria do cliente: ${form.categoriaCliente || '—'}
- Contato: ${form.contato || '—'}
- Prazo para envio da proposta: ${form.prazoEnvio ? fmtData(form.prazoEnvio) : '—'}
- Escopo: Conforme e-mail abaixo.
            Proposta técnica e comercial.
${form.escopoExtra ? `\n${form.escopoExtra}\n` : ''}
Fico à disposição para qualquer dúvida e agradeço desde já pela atenção.`;

  const copiarEmail = async () => {
    try {
      await navigator.clipboard.writeText(`Assunto: ${assunto}\n\n${corpo}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (_e) { /* clipboard indisponível, ignora */ }
  };

  const registrar = async () => {
    if (!form.brNumero || !form.clienteNome) return;
    setSalvando(true);
    await supabase.from('cotacoes_abertura').insert({
      br_numero: form.brNumero, cliente_nome: form.clienteNome, projeto: form.projeto,
      categoria_cliente: form.categoriaCliente, contato: form.contato,
      prazo_envio: form.prazoEnvio || null, escopo_extra: form.escopoExtra,
      email_thread_referencia: form.emailThreadReferencia || null,
      solicitado_por_id: currentUser?.id || null,
    });
    setForm(vazio);
    setSalvando(false);
    await carregar();
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1280 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: T.blueSoft, borderRadius: 8, fontSize: 12, color: T.blueText }}>
        <AlertTriangle size={15} />
        O envio automático do e-mail mantendo a thread existente (Outlook/Power Automate) ainda não está conectado aqui — por enquanto essa tela gera o texto pra você copiar e colar na resposta do e-mail em andamento, sem perder o histórico.
      </div>

      <div className="grid-2col-wide">
        <Panel title="Nova solicitação de abertura" subtitle="Preencha e gere o e-mail padronizado">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            <FiltroCampoFat label="Número BR"><input value={form.brNumero} onChange={e => setForm(f => ({ ...f, brNumero: e.target.value }))} style={{ ...selectStyleFat(160), appearance: 'auto' }} /></FiltroCampoFat>
            <FiltroCampoFat label="Cliente"><input value={form.clienteNome} onChange={e => setForm(f => ({ ...f, clienteNome: e.target.value }))} style={{ ...selectStyleFat(300), appearance: 'auto' }} /></FiltroCampoFat>
            <FiltroCampoFat label="Projeto"><input value={form.projeto} onChange={e => setForm(f => ({ ...f, projeto: e.target.value }))} style={{ ...selectStyleFat(300), appearance: 'auto' }} /></FiltroCampoFat>
            <FiltroCampoFat label="Categoria do cliente"><input value={form.categoriaCliente} onChange={e => setForm(f => ({ ...f, categoriaCliente: e.target.value }))} style={{ ...selectStyleFat(200), appearance: 'auto' }} /></FiltroCampoFat>
            <FiltroCampoFat label="Contato"><input value={form.contato} onChange={e => setForm(f => ({ ...f, contato: e.target.value }))} style={{ ...selectStyleFat(260), appearance: 'auto' }} /></FiltroCampoFat>
            <FiltroCampoFat label="Prazo para envio da proposta"><input type="date" value={form.prazoEnvio} onChange={e => setForm(f => ({ ...f, prazoEnvio: e.target.value }))} style={{ ...selectStyleFat(180), appearance: 'auto' }} /></FiltroCampoFat>
            <FiltroCampoFat label="Escopo adicional (opcional)"><textarea value={form.escopoExtra} onChange={e => setForm(f => ({ ...f, escopoExtra: e.target.value }))} rows={2} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 13, fontFamily: 'inherit' }} /></FiltroCampoFat>
            <FiltroCampoFat label="Referência do e-mail existente (assunto/thread, se já tinha e-mail rolando)"><input value={form.emailThreadReferencia} onChange={e => setForm(f => ({ ...f, emailThreadReferencia: e.target.value }))} placeholder="ex: RE: Cotação Mineração X" style={{ ...selectStyleFat(320), appearance: 'auto' }} /></FiltroCampoFat>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={copiarEmail} style={{ background: T.terracotta, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}>
                {copiado ? 'Copiado!' : 'Copiar e-mail'}
              </button>
              <button onClick={registrar} disabled={salvando || !form.brNumero || !form.clienteNome} style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, opacity: (salvando || !form.brNumero || !form.clienteNome) ? 0.5 : 1 }}>
                Registrar solicitação
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Pré-visualização do e-mail" subtitle="Exatamente o que vai ser copiado">
          <div style={{ marginTop: 10, fontSize: 12, color: T.inkFaint }}>Assunto:</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{assunto}</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12.5, fontFamily: 'inherit', background: T.panelAlt, padding: 14, borderRadius: 8, border: `1px solid ${T.lineSoft}` }}>{corpo}</pre>
        </Panel>
      </div>

      <Panel title="Solicitações recentes" subtitle="Últimas 50 aberturas de cotação registradas">
        <div className="table-scroll" style={{ marginTop: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, textAlign: 'left', color: T.inkFaint, fontSize: 11 }}>
                <th style={{ padding: '8px 10px' }}>Solicitado em</th>
                <th style={{ padding: '8px 10px' }}>BR</th>
                <th style={{ padding: '8px 10px' }}>Cliente</th>
                <th style={{ padding: '8px 10px' }}>Prazo</th>
                <th style={{ padding: '8px 10px' }}>Ref. e-mail</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} style={{ padding: 16, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>}
              {!loading && historico.length === 0 && <tr><td colSpan={5} style={{ padding: 16, textAlign: 'center', color: T.inkFaint }}>Nenhuma solicitação ainda.</td></tr>}
              {historico.map(h => (
                <tr key={h.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '8px 10px', color: T.inkFaint }}>{new Date(h.solicitado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{h.br_numero}</td>
                  <td style={{ padding: '8px 10px' }}>{h.cliente_nome}</td>
                  <td style={{ padding: '8px 10px' }}>{h.prazo_envio ? fmtData(h.prazo_envio) : '—'}</td>
                  <td style={{ padding: '8px 10px', color: T.inkFaint }}>{h.email_thread_referencia || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Auditoria() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responsaveis, setResponsaveis] = useState([]);
  const [filtroResponsavel, setFiltroResponsavel] = useState('Todos');
  const [busca, setBusca] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('v_auditoria_completo').select('*').order('alterado_em', { ascending: false }).limit(500);
    setRegistros(data || []);
    const nomes = Array.from(new Set((data || []).map(r => r.responsavel_nome).filter(Boolean))).sort();
    setResponsaveis(nomes);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const filtrados = useMemo(() => registros.filter(r => {
    if (filtroResponsavel !== 'Todos' && r.responsavel_nome !== filtroResponsavel) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!(r.br || '').toLowerCase().includes(q) && !(r.cliente || '').toLowerCase().includes(q) && !(r.alterado_por_nome || '').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [registros, filtroResponsavel, busca]);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1280 }}>
      <Panel title="Quem alterou o quê" subtitle="Histórico de mudanças em propostas — cada alteração registrada campo a campo, com quem fez e quando">
        <div style={{ display: 'flex', gap: 12, marginTop: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <FiltroCampoFat label="Responsável pela proposta">
            <select value={filtroResponsavel} onChange={e => setFiltroResponsavel(e.target.value)} style={selectStyleFat(200)}>
              <option value="Todos">Todos</option>
              {responsaveis.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </FiltroCampoFat>
          <FiltroCampoFat label="Buscar (BR, cliente, quem alterou)">
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar…" style={{ ...selectStyleFat(220), appearance: 'auto' }} />
          </FiltroCampoFat>
        </div>

        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.line}`, textAlign: 'left', color: T.inkFaint, fontSize: 11 }}>
                <th style={{ padding: '8px 10px' }}>Quando</th>
                <th style={{ padding: '8px 10px' }}>BR / Cliente</th>
                <th style={{ padding: '8px 10px' }}>Responsável</th>
                <th style={{ padding: '8px 10px' }}>Campo</th>
                <th style={{ padding: '8px 10px' }}>De</th>
                <th style={{ padding: '8px 10px' }}>Para</th>
                <th style={{ padding: '8px 10px' }}>Alterado por</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center', color: T.inkFaint }}>Carregando…</td></tr>}
              {!loading && filtrados.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center', color: T.inkFaint }}>Nenhuma alteração registrada ainda.</td></tr>
              )}
              {filtrados.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: T.inkFaint }}>{new Date(r.alterado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '8px 10px' }}>{r.br} — {r.cliente}</td>
                  <td style={{ padding: '8px 10px' }}>{r.responsavel_nome || '—'}</td>
                  <td style={{ padding: '8px 10px' }}>{CAMPO_LABEL[r.campo] || r.campo}</td>
                  <td style={{ padding: '8px 10px', color: T.inkFaint }}>{r.valor_anterior ?? '—'}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{r.valor_novo ?? '—'}</td>
                  <td style={{ padding: '8px 10px' }}>{r.alterado_por_nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ============================================================================
   INTEGRAÇÃO — Power Automate
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
const TELAS_CATALOGO = [
  { id: 'dashboard',    label: 'Visão geral' },
  { id: 'pendencias',   label: 'Minhas pendências' },
  { id: 'propostas',    label: 'Todas as propostas' },
  { id: 'metricas',     label: 'Métricas' },
  { id: 'produtividade',label: 'Produtividade' },
  { id: 'comercial',    label: 'Painel Comercial' },
  { id: 'faturamento',  label: 'Faturamento (Sankhya)' },
  { id: 'consumo_mp',   label: 'Consumo de MP' },
  { id: 'placas_kalocer', label: 'Placas Kalocer' },
  { id: 'analitico_mp', label: 'Analítico' },
  { id: 'carteira_estoque', label: 'Carteira x Estoque' },
  { id: 'preco_compra', label: 'Preço de Compra' },
  { id: 'almoxarifado', label: 'Almoxarifado' },
  { id: 'equipamentos', label: 'Equip. Terceiros' },
  { id: 'acompanhamento_servico', label: 'Falta Nota de Serviço' },
  { id: 'monitoramento_op', label: 'Monitoramento OP' },
  { id: 'proposta_tecnica', label: 'Proposta Técnica' },
  { id: 'plaquinha_equipamento', label: 'Plaquinha de Equipamento' },
  { id: 'conf_apontamento', label: 'Conf. Apontamento' },
  { id: 'reservas_pendentes', label: 'Reservas Pendentes' },
  { id: 'verificacao_projetos', label: 'Verificação de Projetos' },
  { id: 'analise_comercial', label: 'Análise Comercial' },
  { id: 'prospeccao_clientes', label: 'Prospecção de Clientes' },
  { id: 'almoxarifado_fluxo', label: 'Fluxo de Materiais' },
  { id: 'pedidosvale',  label: 'Pedidos Vale' },
  { id: 'aberturacotacao', label: 'Abertura de Cotação' },
  { id: 'ranking',      label: 'Ranking de Pontuação' },
  { id: 'metas',        label: 'Metas' },
  { id: 'auditoria',    label: 'Auditoria' },
  { id: 'integracao',   label: 'Integrações' },
  { id: 'admin',        label: 'Admin' },
];

function PermissoesManager() {
  const [colabs, setColabs] = useState([]);
  const [telasPorUsuario, setTelasPorUsuario] = useState({}); // { colaborador_id: Set(tela) }
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [{ data: c }, { data: t }] = await Promise.all([
      supabase.from('colaboradores').select('*').eq('ativo', true).order('nome'),
      supabase.from('colaborador_telas').select('*'),
    ]);
    setColabs(c || []);
    const mapa = {};
    (t || []).forEach(row => {
      if (!mapa[row.colaborador_id]) mapa[row.colaborador_id] = new Set();
      mapa[row.colaborador_id].add(row.tela);
    });
    setTelasPorUsuario(mapa);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const usuario = colabs.find(c => c.id === selecionado);
  const telasSet = selecionado ? telasPorUsuario[selecionado] : null;
  const temRestricao = !!(telasSet && telasSet.size > 0);

  const toggleTela = async (tela) => {
    if (!selecionado) return;
    setSalvando(true);
    const atualSet = telasPorUsuario[selecionado] || new Set();
    const jaMarcado = temRestricao ? atualSet.has(tela) : true; // sem restrição = tudo marcado
    if (jaMarcado) {
      // Vai desmarcar. Se ainda não havia restrição, materializa a lista inteira menos essa tela.
      const base = temRestricao ? [...atualSet] : TELAS_CATALOGO.map(t => t.id);
      const novaLista = base.filter(t => t !== tela);
      await supabase.from('colaborador_telas').delete().eq('colaborador_id', selecionado);
      if (novaLista.length) {
        await supabase.from('colaborador_telas').insert(novaLista.map(t => ({ colaborador_id: selecionado, tela: t })));
      }
    } else {
      await supabase.from('colaborador_telas').insert({ colaborador_id: selecionado, tela });
    }
    await carregar();
    setSalvando(false);
  };

  const liberarTudo = async () => {
    if (!selecionado) return;
    setSalvando(true);
    await supabase.from('colaborador_telas').delete().eq('colaborador_id', selecionado);
    await carregar();
    setSalvando(false);
  };

  const bloquearTudo = async () => {
    if (!selecionado) return;
    setSalvando(true);
    // IMPORTANTE: nesse modelo, "zero linhas em colaborador_telas" significa "sem restrição
    // = acesso total" — então pra BLOQUEAR tudo de verdade, não dá pra só apagar as linhas
    // (isso faria o oposto: liberaria tudo). Grava um marcador que não bate com nenhuma tela
    // real do catálogo, forçando o modo "restrito" com zero telas visíveis de fato.
    await supabase.from('colaborador_telas').delete().eq('colaborador_id', selecionado);
    await supabase.from('colaborador_telas').insert({ colaborador_id: selecionado, tela: '__bloqueado_tudo__' });
    await carregar();
    setSalvando(false);
  };

  const toggleProdutividadeCompleta = async () => {
    if (!usuario) return;
    setSalvando(true);
    await supabase.from('colaboradores').update({ ve_produtividade_completa: !usuario.ve_produtividade_completa }).eq('id', usuario.id);
    await carregar();
    setSalvando(false);
  };

  const toggleAlmoxarifadoCompleto = async () => {
    if (!usuario) return;
    setSalvando(true);
    await supabase.from('colaboradores').update({ ve_almoxarifado_completo: !usuario.ve_almoxarifado_completo }).eq('id', usuario.id);
    await carregar();
    setSalvando(false);
  };

  const toggleApenasFilaAtendimento = async () => {
    if (!usuario) return;
    setSalvando(true);
    await supabase.from('colaboradores').update({ ve_almoxarifado_apenas_fila: !usuario.ve_almoxarifado_apenas_fila }).eq('id', usuario.id);
    await carregar();
    setSalvando(false);
  };

  return (
    <Panel title="Permissões de acesso por usuário" subtitle="Controla quais telas cada colaborador vê e se a produtividade é própria ou de todos">
      <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 220, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 420, overflow: 'auto' }}>
          {loading && <div style={{ fontSize: 12, color: T.inkFaint }}>Carregando…</div>}
          {colabs.map(c => {
            const restrito = (telasPorUsuario[c.id]?.size || 0) > 0;
            return (
              <button key={c.id} onClick={() => setSelecionado(c.id)} style={{
                textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: `1px solid ${T.line}`,
                background: selecionado === c.id ? T.terracottaSoft : T.panelAlt, cursor: 'pointer',
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{c.nome}</div>
                <div style={{ fontSize: 10.5, color: T.inkFaint }}>{c.papel} · {restrito ? 'acesso restrito' : 'acesso total'}</div>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          {!usuario && <div style={{ fontSize: 12.5, color: T.inkFaint }}>Selecione um colaborador à esquerda.</div>}
          {usuario && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button disabled={salvando} onClick={liberarTudo} style={{ fontSize: 12, padding: '7px 12px', borderRadius: 6, border: `1px solid ${T.line}`, background: T.panelAlt }}>Liberar acesso total</button>
                <button disabled={salvando} onClick={bloquearTudo} style={{ fontSize: 12, padding: '7px 12px', borderRadius: 6, border: `1px solid ${T.line}`, background: T.panelAlt }}>Bloquear todas as telas</button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TELAS_CATALOGO.map(t => {
                  const marcado = temRestricao ? telasSet.has(t.id) : true;
                  return (
                    <label key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '6px 10px',
                      border: `1px solid ${T.line}`, borderRadius: 6, background: marcado ? T.oliveSoft : T.panelAlt, cursor: 'pointer',
                    }}>
                      <input type="checkbox" checked={marcado} disabled={salvando} onChange={() => toggleTela(t.id)} />
                      {t.label}
                    </label>
                  );
                })}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginTop: 4 }}>
                <input type="checkbox" checked={!!usuario.ve_produtividade_completa} disabled={salvando} onChange={toggleProdutividadeCompleta} />
                Vê produtividade de todo mundo (não só a própria)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                <input type="checkbox" checked={usuario.ve_almoxarifado_completo !== false} disabled={salvando} onChange={toggleAlmoxarifadoCompleto} />
                Vê a aba Almoxarifado completa (senão, só código/descrição/disponível/reservado)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                <input type="checkbox" checked={!!usuario.ve_almoxarifado_apenas_fila} disabled={salvando} onChange={toggleApenasFilaAtendimento} />
                Em Fluxo de Materiais, vê só a Fila de Atendimento (nada mais) — pros colaboradores que atendem os pedidos
              </label>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function PainelMetas({ currentUser }) {
  const [pesos, setPesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null); // item sendo editado
  const ehGestor = currentUser?.papel === 'gestor';

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data: p } = await supabase.from('metas_individuais_config').select('*').order('item');
    setPesos(p || []);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvarPeso = async (item, novoPeso) => {
    await supabase.from('metas_individuais_config').update({ peso: novoPeso }).eq('item', item);
    setEditando(null);
    await carregar();
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
      <Panel title="Metas individuais — pesos por ação" subtitle={ehGestor ? "Regra: Conhecimento de Pedido só é contabilizado até 10 realizações · clique no peso pra editar" : "Regra: Conhecimento de Pedido só é contabilizado até 10 realizações"}>
        <div style={{ marginTop: 10 }}>
          {pesos.map(p => (
            <div key={p.item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderBottom: `1px solid ${T.lineSoft}` }}>
              <span style={{ fontSize: 13 }}>{p.descricao}{p.limite_contabilizado ? ` (máx. ${p.limite_contabilizado})` : ''}</span>
              {editando === p.item && ehGestor ? (
                <input type="number" step="0.5" autoFocus defaultValue={p.peso}
                  onBlur={e => salvarPeso(p.item, Number(e.target.value))}
                  onKeyDown={e => { if (e.key === 'Enter') salvarPeso(p.item, Number(e.target.value)); }}
                  style={{ width: 60, padding: '4px 6px', borderRadius: 5, border: `1px solid ${T.line}`, fontSize: 13 }} />
              ) : (
                <span onClick={() => ehGestor && setEditando(p.item)} style={{ fontSize: 13, fontWeight: 700, color: T.terracottaText, cursor: ehGestor ? 'pointer' : 'default', padding: '2px 8px' }} title={ehGestor ? 'Clique para editar' : ''}>
                  Peso {p.peso}
                </span>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function RankingPontuacao() {
  const [coletivas, setColetivas] = useState([]);
  const [coletivasStatus, setColetivasStatus] = useState(null);
  const [rankingAcumulado, setRankingAcumulado] = useState([]);
  const [rankingMensal, setRankingMensal] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState('todos');
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [{ data: c }, { data: cs }, { data: rAcum }, { data: rMes }] = await Promise.all([
      supabase.from('metas_coletivas').select('*').order('id'),
      supabase.from('v_metas_coletivas_status').select('*').maybeSingle(),
      supabase.from('v_metas_pontuacao').select('*').order('pontuacao_total', { ascending: false }),
      supabase.from('v_metas_pontuacao_mensal').select('*'),
    ]);
    setColetivas(c || []);
    setColetivasStatus(cs || null);
    setRankingAcumulado(rAcum || []);
    setRankingMensal(rMes || []);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Auto-refresh a cada 30 minutos.
  useEffect(() => {
    const id = setInterval(carregar, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const mesesDisponiveis = useMemo(() => {
    const meses = Array.from(new Set(rankingMensal.map(r => r.mes)));
    return MESES_ORDEM.filter(m => meses.includes(m));
  }, [rankingMensal]);

  const rankingExibido = useMemo(() => {
    if (mesSelecionado === 'todos') return rankingAcumulado;
    return rankingMensal.filter(r => r.mes === mesSelecionado).sort((a, b) => b.pontuacao_total - a.pontuacao_total);
  }, [mesSelecionado, rankingAcumulado, rankingMensal]);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: T.inkFaint, fontSize: 13 }}>Carregando…</div>
      ) : (
        <>
          <Panel title="Metas coletivas" subtitle="Calculadas automaticamente com base nas propostas concluídas">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {coletivas.map(c => {
                const atual = c.id === 1 ? coletivasStatus?.pct_no_prazo : c.id === 2 ? coletivasStatus?.pct_reprogramadas : coletivasStatus?.media_dias_uteis_aberto;
                return (
                  <div key={c.id} style={{ padding: '10px 12px', background: T.panelAlt, borderRadius: 8, border: `1px solid ${T.lineSoft}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.descricao}</span>
                      <span style={{ fontSize: 12, color: T.terracottaText, fontWeight: 700 }}>Meta: {c.meta_texto}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>
                      {c.baseline_texto && <>Baseline: {c.baseline_texto} · </>}
                      Atual: {atual != null ? (c.id === 3 ? `${atual} dias úteis` : `${atual}%`) : 'sem dados suficientes ainda'}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Ranking de pontuação por engenheiro" subtitle="Escolha entre visão acumulada (todo o histórico) ou de um mês específico">
            <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <button onClick={() => setMesSelecionado('todos')} style={{
                fontSize: 12, padding: '6px 12px', borderRadius: 6, border: `1px solid ${T.line}`,
                background: mesSelecionado === 'todos' ? T.terracotta : T.panelAlt,
                color: mesSelecionado === 'todos' ? '#fff' : T.inkDim, fontWeight: 600,
              }}>Acumulado</button>
              {mesesDisponiveis.map(m => (
                <button key={m} onClick={() => setMesSelecionado(m)} style={{
                  fontSize: 12, padding: '6px 12px', borderRadius: 6, border: `1px solid ${T.line}`,
                  background: mesSelecionado === m ? T.terracotta : T.panelAlt,
                  color: mesSelecionado === m ? '#fff' : T.inkDim, fontWeight: 600,
                }}>{MESES_LABEL[m]}</button>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              {rankingExibido.length === 0 && <div style={{ fontSize: 13, color: T.inkFaint, padding: '8px 0' }}>Nenhum dado ainda para essa visão.</div>}
              {rankingExibido.map((r, i) => (
                <div key={r.colaborador_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px', borderBottom: `1px solid ${T.lineSoft}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? T.terracottaSoft : T.panelAlt, color: i === 0 ? T.terracottaText : T.inkFaint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.nome}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.blueText }}>{r.pontuacao_total} pts</span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

function Admin({ currentUser }) {
  const ehGestor = currentUser?.papel === 'gestor';
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1100 }}>
      {ehGestor && <PermissoesManager />}
      {!ehGestor && (
        <div style={{ fontSize: 13, color: T.inkFaint, padding: '10px 4px' }}>
          Gerenciamento de permissões disponível apenas para usuários com papel "gestor".
        </div>
      )}
      <div className="grid-2col">
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
    classificacao: 'B', data_entrega_prevista: '', valor_liquido: '', eh_revisao: false,
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
      data_abertura: new Date().toISOString().slice(0, 10),
      data_entrega_prevista: form.data_entrega_prevista || null,
      valor_liquido: form.valor_liquido ? Number(form.valor_liquido) : 0,
      eh_revisao: form.eh_revisao,
      arquivo_word_url: urlsUploadadas[0]?.url || null,
      arquivos_json: urlsUploadadas, // array de {nome, url} — coluna jsonb
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

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.inkDim }}>
            <input type="checkbox" checked={form.eh_revisao} onChange={e => setForm(f => ({ ...f, eh_revisao: e.target.checked }))} />
            Esta é uma revisão de um orçamento já existente
          </label>

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
  return MESES_ORDEM[m] || MESES_ORDEM[MESES_ORDEM.length - 1];
}

function ModalDetalhe({ proposta, usuario, onClose, onAction }) {
  const [comentario, setComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [acaoErro, setAcaoErro] = useState(null);
  const [executandoAcao, setExecutandoAcao] = useState(false);

  // Envolve onAction pra capturar erro e mostrar na tela — antes, uma falha na atualização
  // (RLS, constraint etc.) só aparecia no console, e o botão "parecia" não fazer nada.
  const executarAcao = async (acao) => {
    setExecutandoAcao(true);
    setAcaoErro(null);
    const resultado = await onAction(proposta.id, acao, comentario);
    if (resultado && resultado.ok === false) {
      setAcaoErro(resultado.message || 'Erro desconhecido ao executar a ação.');
    }
    setExecutandoAcao(false);
  };

  const isRascunho = proposta.status === 'rascunho' || proposta.status === 'reprovada';
  const sankhyaPendente = proposta.origem_dados === 'sankhya' && !proposta.validado_pelo_engenheiro;
  const souAprovador = APROVADORES_POOL.includes(usuario.nome);
  const statusAtivo = ['rascunho', 'em_revisao_tecnica', 'aguardando_aprovacao'].includes(proposta.status);

  const canSendToReview = isRascunho && usuario.papel === 'engenheiro' && !sankhyaPendente && !souAprovador;
  const canValidateSankhya = sankhyaPendente && usuario.papel === 'engenheiro';
  const canReview = proposta.status === 'em_revisao_tecnica' && usuario.papel === 'revisor_tecnico';
  // Membros do pool de aprovadores (Edson, Felipe, João Victor) têm poder de aprovar ou reprovar
  // direto, em qualquer estágio ativo — não precisam esperar a proposta passar por revisão técnica.
  // Isso é checado só pelo nome (pool), não pelo "papel" cadastrado, porque hoje os três estão
  // cadastrados como papel='engenheiro' no banco (também criam propostas normalmente).
  const canApprove = souAprovador && statusAtivo;
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
            <div style={{ marginTop: 8 }}>
              <BotaoAbrirOrcamentoSankhya nureg={proposta.nureg_sankhya} />
            </div>
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
                  <button onClick={() => executarAcao('validar_sankhya')} disabled={executandoAcao} style={solidBtn(T.amberText)}>Validar dados</button>
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
              {acaoErro && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: T.rustSoft, color: T.rustText, borderRadius: 8, padding: '10px 12px', fontSize: 12, marginBottom: 12 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{acaoErro}</span>
                </div>
              )}
              {(canReview || canApprove) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {canApprove ? `Sua decisão como ${usuario.nome} (pool de aprovação)` : 'Sua ação é necessária'}
                  </span>
                  <textarea rows={2} placeholder="Comentário (obrigatório ao reprovar)…" value={comentario} onChange={e => setComentario(e.target.value)}
                    style={{ ...inputStyle(), fontSize: 12.5 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => executarAcao(canReview ? 'reprovar_revisao' : 'reprovar_final')} disabled={executandoAcao} style={{ ...ghostBtn(T.rustText), flex: 1, justifyContent: 'center', opacity: executandoAcao ? 0.6 : 1 }}>Reprovar</button>
                    <button onClick={() => executarAcao(canReview ? 'aprovar_revisao' : 'aprovar_final')} disabled={executandoAcao} style={{ ...solidBtn(T.oliveText), flex: 1, justifyContent: 'center', opacity: executandoAcao ? 0.6 : 1 }}>{executandoAcao ? 'Enviando…' : 'Aprovar'}</button>
                  </div>
                </div>
              )}
              {canSendToReview && <button onClick={() => executarAcao('enviar_revisao')} disabled={executandoAcao} style={{ ...solidBtn(T.terracotta, true), width: '100%', justifyContent: 'center' }}>Enviar para revisão técnica</button>}
              {canFinish && <button onClick={() => executarAcao('concluir')} disabled={executandoAcao} style={{ ...solidBtn(T.ink, true), width: '100%', justifyContent: 'center' }}>Marcar como concluída</button>}
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
