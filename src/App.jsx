import { useState, useEffect } from "react";
import { Shirt, Gem, Sparkles, Flame, Plus, Check, ChevronDown, ShoppingBag } from "lucide-react";
import { c, serif, sans, fmt } from "./theme";
import { useCart } from "./hooks/useCart";
import CartDrawer from "./components/CartDrawer";

// ---- Integração com a Sales Platform API -------------------------------
// URL do Cloud Run provisionado na Etapa 1. Sem autenticação por enquanto
// (API pública, --allow-unauthenticated) — o módulo de Auth/Checkout entra
// em ticket futuro.
const API_URL = "https://sales-platform-api-sytosdcb4q-rj.a.run.app";

// SKUs base usados para localizar os 2 produtos desta vitrine dentro do
// catálogo. Não há endpoint de busca por SKU ainda, então filtramos no
// cliente a partir da listagem por categoria — aceitável para um catálogo
// pequeno; se crescer, vale pedir um endpoint dedicado de busca por SKU.
const SKU_CAMISETA = "CAM-MANTO-OBALUAE";
const SKU_PULSEIRA = "PULS-GIRO-OXUM";

// ---- Helpers de mapeamento API -> UI -----------------------------------
// Extrai o preço B2C de um Produto vindo da API (schema real tem uma lista
// de preços por tipo de cliente; esta vitrine é B2C, então buscamos esse).
function precoB2C(produto) {
  const preco = produto?.precos?.find((p) => p.tipo_cliente === "b2c");
  return preco ? preco.preco_unitario : 0;
}

// Deriva a lista de tamanhos exibíveis a partir das variações reais do
// produto, preservando se cada um tem estoque ou não — usado para desabilitar
// tamanhos esgotados na UI (comportamento que o protótipo não tinha, já que
// era 100% mockado).
function tamanhosDisponiveis(produto) {
  if (!produto) return [];
  return produto.variacoes.map((v) => ({
    label: v.atributos.tamanho,
    skuVariacao: v.sku_variacao,
    emEstoque: v.estoque_disponivel > 0,
  }));
}

// Geometric diamond weave — a nod to the wax-print textile pattern used
// throughout the moodboard (scarf, ribbon, hangtag border), abstracted so
// it reads as fabric texture rather than any specific liturgical symbol.
const weavePattern = (colorA, colorB, bg) => ({
  backgroundColor: bg,
  backgroundImage: `linear-gradient(135deg, ${colorA} 25%, transparent 25%),
    linear-gradient(225deg, ${colorA} 25%, transparent 25%),
    linear-gradient(315deg, ${colorB} 25%, transparent 25%),
    linear-gradient(45deg, ${colorB} 25%, transparent 25%)`,
  backgroundPosition: "10px 0, 10px 0, 0 0, 0 0",
  backgroundSize: "20px 20px",
  backgroundRepeat: "repeat",
});

// ---- Brand logomark ----------------------------------------------------
function Logomark({ size = 84 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 220" fill="none">
      <path
        d="M42 220 C42 168 58 152 72 148 L128 148 C142 152 158 168 158 220 Z"
        fill={c.charcoalDeep}
      />
      <rect x="84" y="118" width="32" height="36" fill={c.charcoalDeep} />
      <circle cx="100" cy="88" r="46" fill={c.charcoalDeep} />
      <ellipse cx="100" cy="36" rx="20" ry="15" fill={c.charcoalDeep} />
      <path
        d="M52 66 Q100 18 148 66 Q142 50 100 42 Q58 50 52 66 Z"
        fill={c.charcoalDeep}
      />
      {[52, 62, 72].map((y, i) => (
        <path
          key={y}
          d={`M${58 - i * 3} ${y} Q100 ${y - 20} ${142 + i * 3} ${y}`}
          stroke={c.gold}
          strokeWidth="1.4"
          fill="none"
          opacity={0.85 - i * 0.15}
        />
      ))}
      <line x1="140" y1="92" x2="144" y2="100" stroke={c.gold} strokeWidth="1.6" />
      <circle cx="145" cy="104" r="5" fill={c.gold} />
      <path d="M76 150 Q100 170 124 150" stroke={c.gold} strokeWidth="2" fill="none" />
      <path
        d="M72 160 Q100 182 128 160"
        stroke={c.gold}
        strokeWidth="1.4"
        fill="none"
        opacity="0.75"
      />
    </svg>
  );
}

// ---- Placeholder product art (stand-in for real photography) -------------
// Ainda ilustrativo: o schema de Produto na API não tem campo de imagem
// ainda (dívida técnica registrada — abrir ticket quando entrarem fotos
// reais). Continua mapeado por variant só para manter a mesma UI.
function ProductArt({ variant, className = "" }) {
  const icon =
    variant === "beads" ? (
      <Gem className="w-12 h-12" strokeWidth={1.1} color={c.gold} />
    ) : (
      <Shirt className="w-14 h-14" strokeWidth={1.1} color={c.charcoal} />
    );
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background:
          variant === "beads"
            ? `linear-gradient(160deg, ${c.charcoalDeep} 0%, ${c.brown} 100%)`
            : `linear-gradient(160deg, ${c.sand} 0%, #E4D6BE 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `repeating-linear-gradient(115deg, ${
            variant === "beads" ? c.gold : c.rust
          } 0px, ${variant === "beads" ? c.gold : c.rust} 1px, transparent 1px, transparent 14px)`,
        }}
      />
      {icon}
    </div>
  );
}

// ---- Accordion --------------------------------------------------------
function Accordion({ title, children, isOpen, onToggle }) {
  return (
    <div style={{ borderTop: `1px solid ${c.goldSoft}` }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none focus-visible:ring-2 rounded-sm"
        style={{ color: c.charcoalDeep, fontFamily: sans }}
      >
        <span className="text-[15px] font-medium">{title}</span>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: c.charcoal }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "220px" : "0px" }}
      >
        <p
          className="pb-5 text-[14px] leading-relaxed pr-4"
          style={{ color: c.charcoal, fontFamily: sans }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

// ---- Estado de carregamento (novo — não existia no protótipo) ----------
function LoadingState() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ backgroundColor: c.sacred, fontFamily: sans, color: c.charcoal }}
    >
      Carregando produto…
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center gap-2 px-6 text-center"
      style={{ backgroundColor: c.sacred, fontFamily: sans, color: c.charcoal }}
    >
      <p style={{ color: c.charcoalDeep }}>Não foi possível carregar este produto agora.</p>
      <p className="text-[13px]">{message}</p>
    </div>
  );
}

export default function ProductPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [tamanho, setTamanho] = useState(null);
  const [bundleOn, setBundleOn] = useState(true);
  const [openAccordion, setOpenAccordion] = useState("significado");

  // ---- Dados reais da API (substituem as constantes hardcoded) ---------
  const [camiseta, setCamiseta] = useState(null);
  const [pulseira, setPulseira] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // ---- Carrinho real (Sales Platform API) --------------------------------
  // Nomes prefixados com "Carrinho"/"cart" para não colidir com os estados
  // de carregamento/erro do fetch de produtos acima.
  const {
    carrinho,
    elegibilidade,
    carregando: carregandoCarrinho,
    erro: erroCarrinho,
    quantidadeTotalItens,
    adicionarAoCarrinho,
    atualizarQuantidadeItem,
    removerItem,
  } = useCart();
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  async function handleAdicionarSacola() {
    if (!tamanho) return;
    try {
      await adicionarAoCarrinho({
        produtoId: camiseta.produto_id,
        skuVariacao: tamanho.skuVariacao,
        quantidade: 1,
      });
      if (bundleOn) {
        const variacaoPulseira = pulseira.variacoes[0];
        await adicionarAoCarrinho({
          produtoId: pulseira.produto_id,
          skuVariacao: variacaoPulseira.sku_variacao,
          quantidade: 1,
        });
      }
      setCarrinhoAberto(true);
    } catch {
      // Erro já fica exposto via erroCarrinho e exibido dentro do CartDrawer
      // na próxima vez que ele abrir; aqui só evitamos que a exceção suba
      // sem tratamento para o React.
      setCarrinhoAberto(true);
    }
  }

  useEffect(() => {
    let cancelado = false;

    async function carregarProdutos() {
      try {
        const [respModa, respAcessorios] = await Promise.all([
          fetch(`${API_URL}/produtos?categoria=${encodeURIComponent("Moda")}`),
          fetch(`${API_URL}/produtos?categoria=${encodeURIComponent("Acessórios")}`),
        ]);

        if (!respModa.ok || !respAcessorios.ok) {
          throw new Error(`API respondeu com erro (${respModa.status}/${respAcessorios.status})`);
        }

        const [produtosModa, produtosAcessorios] = await Promise.all([
          respModa.json(),
          respAcessorios.json(),
        ]);

        const camisetaEncontrada = produtosModa.find((p) => p.sku_base === SKU_CAMISETA);
        const pulseiraEncontrada = produtosAcessorios.find((p) => p.sku_base === SKU_PULSEIRA);

        if (!camisetaEncontrada || !pulseiraEncontrada) {
          throw new Error(
            "Produtos não encontrados no catálogo. Rode o seed_produtos_palhas_douradas.sh."
          );
        }

        if (!cancelado) {
          setCamiseta(camisetaEncontrada);
          setPulseira(pulseiraEncontrada);
        }
      } catch (e) {
        if (!cancelado) setErro(e.message);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregarProdutos();
    return () => {
      cancelado = true;
    };
  }, []);

  if (carregando) return <LoadingState />;
  if (erro) return <ErrorState message={erro} />;

  const teePrice = precoB2C(camiseta);
  const beadsPrice = precoB2C(pulseira);
  const rawTotal = teePrice + (bundleOn ? beadsPrice : 0);
  const total = bundleOn ? Math.round(rawTotal * 0.9 * 100) / 100 : teePrice;
  const savings = bundleOn ? Math.round((rawTotal - total) * 100) / 100 : 0;

  const sizes = tamanhosDisponiveis(camiseta);

  const gallery = [
    { variant: "tee", label: "Manto de Obaluaê" },
    { variant: "tee", label: "Detalhe da estampa" },
    { variant: "beads", label: "Giro de Oxum" },
    { variant: "tee", label: "Look completo" },
  ];

  return (
    <div
      className="min-h-screen w-full pb-24 lg:pb-0"
      style={{ backgroundColor: c.sacred, fontFamily: sans }}
    >
      {/* Botão flutuante da sacola — posicionamento provisório (canto
          superior direito), fora do fluxo do header centralizado, para não
          interferir na revisão de UX ainda pendente sobre o layout do
          cabeçalho. Reposicionar aqui é uma mudança de poucas linhas. */}
      <button
        onClick={() => setCarrinhoAberto(true)}
        className="fixed top-5 right-5 z-40 w-12 h-12 rounded-full flex items-center justify-center focus:outline-none"
        style={{ border: `1.5px solid ${c.charcoalDeep}`, backgroundColor: c.white }}
        aria-label="Abrir sacola"
      >
        <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.3} color={c.charcoalDeep} />
        {quantidadeTotalItens > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
            style={{ backgroundColor: c.gold, color: c.charcoalDeep }}
          >
            {quantidadeTotalItens}
          </span>
        )}
      </button>

      <CartDrawer
        aberto={carrinhoAberto}
        onFechar={() => setCarrinhoAberto(false)}
        carrinho={carrinho}
        elegibilidade={elegibilidade}
        carregando={carregandoCarrinho}
        erro={erroCarrinho}
        onAtualizarQuantidade={atualizarQuantidadeItem}
        onRemoverItem={removerItem}
      />

      {/* Top brand bar */}
      <header className="px-5 pt-10 pb-6 sm:px-10 flex flex-col items-center gap-6">
        <Logomark size={88} />
        <div className="text-center">
          <h1
            className="text-4xl sm:text-5xl"
            style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500, color: c.charcoalDeep }}
          >
            Palhas Douradas
          </h1>
          <p
            className="text-[11px] mt-2"
            style={{ color: c.charcoal, letterSpacing: "0.22em", textTransform: "uppercase" }}
          >
            Raiz · Beleza · Realeza
          </p>
        </div>

        <nav className="flex items-center gap-8 sm:gap-12 mt-1">
          {[
            { label: "Moda", icon: Shirt },
            { label: "Acessórios", icon: Gem },
            { label: "Sob encomenda", icon: Sparkles },
            { label: "Sagrado", icon: Flame },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{ border: `1.5px solid ${c.charcoalDeep}`, backgroundColor: c.white }}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.3} color={c.charcoalDeep} />
              </span>
              <span
                className="text-[10px]"
                style={{ color: c.charcoal, letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                {label}
              </span>
            </button>
          ))}
        </nav>
      </header>

      <div className="h-px w-full" style={{ backgroundColor: c.goldSoft }} />

      {/* Product section */}
      <main className="px-5 sm:px-10 lg:px-16 pt-6 lg:pt-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-10 lg:self-start">
            <div className="relative aspect-[4/5] w-full rounded-sm overflow-hidden">
              <ProductArt variant={gallery[activeImage].variant} className="w-full h-full" />
              <div
                className="absolute top-4 right-4 w-16 h-20 rounded-sm flex flex-col items-center justify-center gap-1 shadow-sm"
                style={{ backgroundColor: c.sacred, border: `1px solid ${c.goldSoft}` }}
              >
                <Logomark size={26} />
                <span
                  className="text-[7px] text-center leading-tight px-1"
                  style={{ color: c.charcoal, letterSpacing: "0.05em", textTransform: "uppercase" }}
                >
                  Palhas Douradas
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden flex-shrink-0 focus:outline-none"
                  style={{
                    outline: activeImage === i ? `2px solid ${c.gold}` : `1px solid ${c.goldSoft}`,
                    outlineOffset: "1px",
                  }}
                >
                  <ProductArt variant={g.variant} className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex gap-2 mb-4">
              {["Criação própria", "Peça unissex"].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-3 py-1 rounded-full"
                  style={{ border: `1px solid ${c.goldSoft}`, color: c.charcoal }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2
              className="text-3xl sm:text-4xl mb-2"
              style={{ fontFamily: serif, fontStyle: "italic", color: c.charcoalDeep }}
            >
              {camiseta.nome}
            </h2>
            <p className="text-xl mb-5" style={{ color: c.charcoal }}>{fmt(teePrice)}</p>

            <p className="text-[15px] leading-relaxed mb-7" style={{ color: c.charcoal }}>
              {camiseta.descricao}
            </p>

            {/* Size selector */}
            <div className="mb-8">
              <p className="text-[13px] mb-3" style={{ color: c.charcoalDeep }}>Tamanho</p>
              <div className="flex gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.skuVariacao}
                    onClick={() => s.emEstoque && setTamanho(s)}
                    disabled={!s.emEstoque}
                    className="w-11 h-11 text-[13px] rounded-sm transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed relative"
                    style={{
                      border: `1px solid ${tamanho?.skuVariacao === s.skuVariacao ? c.charcoalDeep : c.goldSoft}`,
                      backgroundColor: tamanho?.skuVariacao === s.skuVariacao ? c.charcoalDeep : "transparent",
                      color: !s.emEstoque
                        ? c.goldSoft
                        : tamanho?.skuVariacao === s.skuVariacao
                        ? c.sacred
                        : c.charcoal,
                      textDecoration: !s.emEstoque ? "line-through" : "none",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop the whole look bundle */}
            <div
              className="rounded-sm overflow-hidden mb-7"
              style={{ backgroundColor: c.white, border: `1px solid ${c.goldSoft}` }}
            >
              <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Logomark size={28} />
                <h3
                  className="text-2xl"
                  style={{ fontFamily: serif, fontStyle: "italic", color: c.charcoalDeep }}
                >
                  Vista o look completo
                </h3>
              </div>
              <p className="text-[13px] leading-relaxed mb-4" style={{ color: c.charcoal }}>
                Uma peça representa a terra, a outra representa o ouro. Feche o ciclo entre
                cura e realeza somando o Giro de Oxum ao seu Manto de Obaluaê.
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0">
                  <ProductArt variant="tee" className="w-full h-full" />
                </div>
                <Plus className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} color={c.charcoal} />
                <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0">
                  <ProductArt variant="beads" className="w-full h-full" />
                </div>
                <div className="ml-2 min-w-0">
                  <p className="text-[13px] truncate" style={{ color: c.charcoalDeep }}>
                    {pulseira.nome}
                  </p>
                  <p className="text-[12px]" style={{ color: c.charcoal }}>
                    Pulseira de miçangas · {fmt(beadsPrice)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setBundleOn(!bundleOn)}
                className="w-full flex items-center justify-between py-2 focus:outline-none"
              >
                <span className="text-[13px]" style={{ color: c.charcoalDeep }}>
                  Incluir o Giro de Oxum no pedido
                </span>
                <span
                  className="w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
                  style={{ backgroundColor: bundleOn ? c.gold : c.goldSoft }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: c.white,
                      left: bundleOn ? "22px" : "2px",
                    }}
                  />
                </span>
              </button>

              {bundleOn && (
                <div
                  className="flex items-center gap-2 mt-2 text-[12px]"
                  style={{ color: c.gold }}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Economize {fmt(savings)} no look completo</span>
                </div>
              )}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAdicionarSacola}
              className="w-full py-4 rounded-sm flex items-center justify-center gap-2 text-[15px] transition-opacity duration-150 hover:opacity-90 focus:outline-none disabled:opacity-50"
              style={{ backgroundColor: c.charcoalDeep, color: c.sacred }}
              disabled={!tamanho || carregandoCarrinho}
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              <span>
                {!tamanho
                  ? "Selecione um tamanho"
                  : carregandoCarrinho
                  ? "Adicionando..."
                  : `Adicionar à sacola — ${fmt(total)}`}
              </span>
            </button>
            <p className="text-[12px] text-center mt-3" style={{ color: c.charcoal }}>
              Envio para todo o Brasil · Trocas em até 15 dias
            </p>

            {/* Accordions */}
            <div className="mt-8">
              <Accordion
                title="Significado & origem"
                isOpen={openAccordion === "significado"}
                onToggle={() => setOpenAccordion(openAccordion === "significado" ? null : "significado")}
              >
                A estampa é inspirada na estética das palhas associadas a Obaluaê, símbolo de
                cura e transformação, e no dourado de Oxum, símbolo de beleza e realeza. É uma
                peça de moda autoral — não utiliza assentamentos, guias ou qualquer objeto
                consagrado em sua confecção.
              </Accordion>
              <Accordion
                title="Materiais & cuidados"
                isOpen={openAccordion === "materiais"}
                onToggle={() => setOpenAccordion(openAccordion === "materiais" ? null : "materiais")}
              >
                Camiseta 100% algodão penteado, lavar à mão ou ciclo delicado, não usar
                alvejante. Giro de Oxum confeccionado em miçangas com banho dourado — evite
                contato com água e perfume para preservar o brilho.
              </Accordion>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky mobile CTA */}
      <div
        className="fixed bottom-0 inset-x-0 lg:hidden px-5 py-4 flex items-center justify-between gap-4"
        style={{ backgroundColor: c.white, borderTop: `1px solid ${c.goldSoft}` }}
      >
        <div>
          <p className="text-[11px]" style={{ color: c.charcoal }}>
            {bundleOn ? "Look completo" : "Camiseta"}
          </p>
          <p className="text-[16px]" style={{ color: c.charcoalDeep, fontFamily: serif }}>
            {fmt(total)}
          </p>
        </div>
        <button
          onClick={handleAdicionarSacola}
          className="flex-1 py-3 rounded-sm text-[14px] disabled:opacity-50"
          style={{ backgroundColor: c.charcoalDeep, color: c.sacred }}
          disabled={!tamanho || carregandoCarrinho}
        >
          {!tamanho
            ? "Selecione um tamanho"
            : carregandoCarrinho
            ? "Adicionando..."
            : "Adicionar à sacola"}
        </button>
      </div>
    </div>
  );
}
