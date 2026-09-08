# Palhas Douradas — Frontend

Vitrine de produtos consumindo a Sales Platform API (Catálogo/Carrinho/Checkout).

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Já consome a API real em produção
(`https://sales-platform-api-sytosdcb4q-rj.a.run.app`) — não precisa rodar
o backend local para desenvolver o frontend.

## Build de produção

```bash
npm run build
npm run preview   # testa o build localmente antes de dockerizar
```

## Deploy no Cloud Run

No Cloud Shell, dentro desta pasta:

```bash
bash deploy.sh
```

## Estrutura

- `src/App.jsx` — página de produto (validada, consumindo dados reais).
  UX ainda sujeita a revisão — mudanças de layout/interação são esperadas.
- `src/main.jsx` — bootstrap do React.
- `src/index.css` — Tailwind + import de fontes (Cormorant Garamond, Inter).

## Pendências conhecidas

- Sem telas de Carrinho/Checkout ainda — só a vitrine de produto.
- Sem roteamento (`react-router` ou similar) — é uma página única por ora.
- `ALLOWED_ORIGINS` no backend está como `*`; trocar pelo domínio deste
  frontend assim que o deploy gerar uma URL fixa.
