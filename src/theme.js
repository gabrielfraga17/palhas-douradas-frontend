// Tokens de design compartilhados entre todos os componentes — extraído do
// App.jsx original para evitar duplicar cores/fontes quando novas telas
// (Carrinho, Checkout) forem adicionadas.
export const c = {
  sacred: "#F9F6F0",
  sand: "#EFE9DB",
  charcoal: "#4A3E3D",
  charcoalDeep: "#221C1B",
  brown: "#3E2723",
  rust: "#B5541F",
  gold: "#D4AF37",
  goldSoft: "#E8D9B0",
  white: "#FFFFFF",
};

export const serif = "'Cormorant Garamond', Georgia, serif";
export const sans = "'Inter', -apple-system, sans-serif";

export const fmt = (n) => `R$ ${n.toFixed(2).replace(".", ",")}`;
