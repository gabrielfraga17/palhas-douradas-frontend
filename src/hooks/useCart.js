import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

// Sem autenticação de cliente final (mesmo padrão do backend — ver
// TASK-0002): o carrinho é identificado só por um ID opaco, que o
// frontend guarda em localStorage. Isso é intencional, não um atalho —
// é a mesma decisão de arquitetura já validada no backend.
const CART_ID_STORAGE_KEY = "palhas_douradas_carrinho_id";

export function useCart() {
  const [carrinho, setCarrinho] = useState(null);
  const [elegibilidade, setElegibilidade] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarElegibilidade = useCallback(async (carrinhoId) => {
    try {
      const resultado = await api.elegibilidadeCheckout(carrinhoId);
      setElegibilidade(resultado);
    } catch {
      // Elegibilidade é informativa (mostra se pode finalizar compra) —
      // uma falha aqui não deve impedir o carrinho de ser exibido.
      setElegibilidade(null);
    }
  }, []);

  // Ao carregar a página, recupera um carrinho existente do localStorage,
  // se houver, e confirma que ele ainda é válido no backend (pode ter sido
  // finalizado ou não existir mais).
  useEffect(() => {
    const carrinhoIdSalvo = localStorage.getItem(CART_ID_STORAGE_KEY);
    if (!carrinhoIdSalvo) return;

    (async () => {
      try {
        const dados = await api.obterCarrinho(carrinhoIdSalvo);
        if (dados.finalizado) {
          localStorage.removeItem(CART_ID_STORAGE_KEY);
          return;
        }
        setCarrinho(dados);
        carregarElegibilidade(dados.carrinho_id);
      } catch {
        localStorage.removeItem(CART_ID_STORAGE_KEY);
      }
    })();
  }, [carregarElegibilidade]);

  const garantirCarrinho = useCallback(async () => {
    if (carrinho && !carrinho.finalizado) return carrinho;
    // Esta vitrine é B2C — não há fluxo de identificação de lojista aqui.
    const novo = await api.criarCarrinho("b2c");
    localStorage.setItem(CART_ID_STORAGE_KEY, novo.carrinho_id);
    setCarrinho(novo);
    return novo;
  }, [carrinho]);

  const adicionarAoCarrinho = useCallback(
    async ({ produtoId, skuVariacao, quantidade = 1 }) => {
      setCarregando(true);
      setErro(null);
      try {
        const carrinhoAtual = await garantirCarrinho();
        const atualizado = await api.adicionarItem(carrinhoAtual.carrinho_id, {
          produtoId,
          skuVariacao,
          quantidade,
        });
        setCarrinho(atualizado);
        await carregarElegibilidade(atualizado.carrinho_id);
        return atualizado;
      } catch (e) {
        setErro(e.message);
        throw e;
      } finally {
        setCarregando(false);
      }
    },
    [garantirCarrinho, carregarElegibilidade]
  );

  const atualizarQuantidadeItem = useCallback(
    async (skuVariacao, quantidade) => {
      if (!carrinho) return;
      setCarregando(true);
      setErro(null);
      try {
        const atualizado = await api.atualizarQuantidade(
          carrinho.carrinho_id,
          skuVariacao,
          quantidade
        );
        setCarrinho(atualizado);
        await carregarElegibilidade(atualizado.carrinho_id);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    },
    [carrinho, carregarElegibilidade]
  );

  const removerItem = useCallback(
    async (skuVariacao) => {
      if (!carrinho) return;
      setCarregando(true);
      setErro(null);
      try {
        const atualizado = await api.removerItem(carrinho.carrinho_id, skuVariacao);
        setCarrinho(atualizado);
        await carregarElegibilidade(atualizado.carrinho_id);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    },
    [carrinho, carregarElegibilidade]
  );

  const quantidadeTotalItens = carrinho
    ? carrinho.itens.reduce((soma, item) => soma + item.quantidade, 0)
    : 0;

  return {
    carrinho,
    elegibilidade,
    carregando,
    erro,
    quantidadeTotalItens,
    adicionarAoCarrinho,
    atualizarQuantidadeItem,
    removerItem,
  };
}
