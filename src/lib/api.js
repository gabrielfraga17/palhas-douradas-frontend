// Cliente HTTP fino para a Sales Platform API. Centraliza a URL base e o
// tratamento de erro para não repetir fetch() cru em cada componente.
export const API_URL = "https://sales-platform-api-sytosdcb4q-rj.a.run.app";

async function request(path, options = {}) {
  const resp = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    const mensagem = body.detail
      ? typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail)
      : `Erro ${resp.status} ao chamar ${path}`;
    const erro = new Error(mensagem);
    erro.status = resp.status;
    erro.body = body;
    throw erro;
  }

  if (resp.status === 204) return null;
  return resp.json();
}

export const api = {
  criarCarrinho: (tipoCliente) =>
    request("/carrinhos", {
      method: "POST",
      body: JSON.stringify({ tipo_cliente: tipoCliente }),
    }),

  obterCarrinho: (carrinhoId) => request(`/carrinhos/${carrinhoId}`),

  adicionarItem: (carrinhoId, { produtoId, skuVariacao, quantidade }) =>
    request(`/carrinhos/${carrinhoId}/itens`, {
      method: "POST",
      body: JSON.stringify({
        produto_id: produtoId,
        sku_variacao: skuVariacao,
        quantidade,
      }),
    }),

  atualizarQuantidade: (carrinhoId, skuVariacao, quantidade) =>
    request(`/carrinhos/${carrinhoId}/itens/${skuVariacao}`, {
      method: "PUT",
      body: JSON.stringify({ quantidade }),
    }),

  removerItem: (carrinhoId, skuVariacao) =>
    request(`/carrinhos/${carrinhoId}/itens/${skuVariacao}`, {
      method: "DELETE",
    }),

  elegibilidadeCheckout: (carrinhoId) =>
    request(`/carrinhos/${carrinhoId}/elegibilidade-checkout`),
};
