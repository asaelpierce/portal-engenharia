# Portal de Engenharia — Kalenborn

Portal interno de Engenharia/Orçamentos: controle de propostas, fluxo de
aprovação, produtividade da equipe e faturamento integrado ao Sankhya.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Configuração necessária

O arquivo `src/PortalEngenharia.jsx` já tem a URL e a chave pública (anon key)
do projeto Supabase embutidas nas constantes `SUPABASE_URL` e
`SUPABASE_ANON_KEY`, no topo do arquivo. Se for usar outro projeto Supabase,
troque esses dois valores.

A anon key é segura para uso no frontend — não é a `service_role key` nem a
senha do banco.

## Build de produção

```bash
npm run build
```

Gera a pasta `dist/`, que pode ser hospedada em qualquer serviço de hosting
estático (Vercel, Netlify, GitHub Pages, etc).

## Estrutura

- `src/PortalEngenharia.jsx` — componente principal (todas as telas: Visão
  geral, Propostas, Pendências, Produtividade, Faturamento, Integrações)
- `src/propostas_data.js` — dados históricos de propostas migrados da
  planilha de controle (547 registros, Jan–Jun 2026)
- `src/main.jsx` — ponto de entrada React
