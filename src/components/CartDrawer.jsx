import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { c, serif, sans, fmt } from "../theme";

// Painel lateral do carrinho. Escopo desta versão: visualizar itens,
// ajustar quantidade, remover, e ver elegibilidade de checkout. O
// formulário de dados do comprador (finalizar-checkout de verdade) é uma
// tela própria, ainda não implementada — o botão de finalizar aqui é só
// um placeholder informativo até essa tela existir.
export default function CartDrawer({
  aberto,
  onFechar,
  carrinho,
  elegibilidade,
  carregando,
  erro,
  onAtualizarQuantidade,
  onRemoverItem,
}) {
  if (!aberto) return null;

  const itens = carrinho?.itens ?? [];
  const vazio = itens.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onFechar}
        aria-hidden="true"
      />

      {/* Painel */}
      <div
        className="relative w-full sm:w-[420px] h-full flex flex-col shadow-xl"
        style={{ backgroundColor: c.sacred }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${c.goldSoft}` }}
        >
          <h2
            className="text-2xl"
            style={{ fontFamily: serif, fontStyle: "italic", color: c.charcoalDeep }}
          >
            Sua sacola
          </h2>
          <button
            onClick={onFechar}
            className="p-1 rounded-full focus:outline-none"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" color={c.charcoal} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {erro && (
            <div
              className="mb-4 px-3 py-2 rounded-sm text-[13px]"
              style={{ backgroundColor: "#FBEAEA", color: "#8A3B3B" }}
            >
              {erro}
            </div>
          )}

          {vazio ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 pt-16">
              <ShoppingBag className="w-10 h-10" strokeWidth={1.2} color={c.goldSoft} />
              <p className="text-[14px]" style={{ color: c.charcoal }}>
                Sua sacola está vazia.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {itens.map((item) => (
                <li
                  key={item.sku_variacao}
                  className="flex gap-3 pb-4"
                  style={{ borderBottom: `1px solid ${c.goldSoft}` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px]" style={{ color: c.charcoalDeep }}>
                      {item.nome_produto}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: c.charcoal }}>
                      SKU: {item.sku_variacao}
                    </p>
                    <p className="text-[13px] mt-1" style={{ color: c.charcoal }}>
                      {fmt(item.preco_unitario)} cada
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() =>
                          onAtualizarQuantidade(item.sku_variacao, item.quantidade - 1)
                        }
                        disabled={carregando}
                        className="w-7 h-7 flex items-center justify-center rounded-sm disabled:opacity-40"
                        style={{ border: `1px solid ${c.goldSoft}` }}
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-3 h-3" color={c.charcoalDeep} />
                      </button>
                      <span className="text-[13px] w-6 text-center" style={{ color: c.charcoalDeep }}>
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() =>
                          onAtualizarQuantidade(item.sku_variacao, item.quantidade + 1)
                        }
                        disabled={carregando}
                        className="w-7 h-7 flex items-center justify-center rounded-sm disabled:opacity-40"
                        style={{ border: `1px solid ${c.goldSoft}` }}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-3 h-3" color={c.charcoalDeep} />
                      </button>

                      <button
                        onClick={() => onRemoverItem(item.sku_variacao)}
                        disabled={carregando}
                        className="ml-2 p-1.5 rounded-sm disabled:opacity-40"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" color={c.rust} />
                      </button>
                    </div>
                  </div>

                  <p
                    className="text-[14px] whitespace-nowrap"
                    style={{ color: c.charcoalDeep }}
                  >
                    {fmt(item.subtotal ?? item.preco_unitario * item.quantidade)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!vazio && (
          <div className="px-5 py-4" style={{ borderTop: `1px solid ${c.goldSoft}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px]" style={{ color: c.charcoal }}>Total</span>
              <span
                className="text-xl"
                style={{ fontFamily: serif, color: c.charcoalDeep }}
              >
                {fmt(carrinho.total)}
              </span>
            </div>

            {elegibilidade && !elegibilidade.elegivel && (
              <p className="text-[12px] mb-3" style={{ color: c.rust }}>
                {elegibilidade.motivo}
              </p>
            )}

            <button
              disabled={carregando || (elegibilidade && !elegibilidade.elegivel)}
              className="w-full py-3.5 rounded-sm text-[14px] disabled:opacity-50"
              style={{ backgroundColor: c.charcoalDeep, color: c.sacred }}
            >
              Finalizar compra
            </button>
            <p className="text-[11px] text-center mt-2" style={{ color: c.charcoal }}>
              Tela de finalização de compra em construção.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
