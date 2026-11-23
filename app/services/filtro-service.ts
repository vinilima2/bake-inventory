import { obterLocaisArmazenamento } from "./local-armazenamento-service";
import type { LocalArmazenamentoView } from "./local-armazenamento-service";
import { obterProdutos } from "./produto-service";
import type { ProdutoView } from "./produto-service";

// Service de FILTRO.
//
// O Firestore não tem busca por "contém" nem ignora maiúsculas/acentos, então os
// filtros são feitos em memória. Há duas camadas:
//
// 1. Funções puras (`filtrar...`): recebem listas já carregadas e devolvem a lista
//    filtrada. O front-end pode usá-las direto nos dados que já tem na tela, sem
//    ir ao banco a cada tecla digitada.
// 2. Funções assíncronas (`buscar...`): carregam do banco tudo o que pertence a um
//    ESTOQUE e aplicam o filtro correspondente.
//
// Regras de comparação:
// - Ignora maiúsculas/minúsculas, acentos e espaços nas pontas ("Açúcar" == "acucar").
// - Nome do produto: busca parcial ("farin" encontra "Farinha de trigo").
// - Tipo de local: comparação exata ("geladeira" encontra "Geladeira", mas não "Geladeira 2").
// - Termo vazio: não filtra, devolve a lista inteira.

/** Deixa o texto pronto para comparação: minúsculo, sem acentos e sem espaços nas pontas. */
export function normalizarTexto(texto: string | null | undefined): string {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// --- Filtros puros ----------------------------------------------------------

/** Produtos cujo nome contém `nome`. */
export function filtrarProdutosPorNome(
  produtos: ProdutoView[],
  nome: string,
): ProdutoView[] {
  const termo = normalizarTexto(nome);
  if (!termo) return produtos;
  return produtos.filter((produto) =>
    normalizarTexto(produto.data.nome).includes(termo),
  );
}

/** Locais de armazenamento cujo tipo é igual a `tipo`. */
export function filtrarLocaisPorTipo(
  locais: LocalArmazenamentoView[],
  tipo: string,
): LocalArmazenamentoView[] {
  const termo = normalizarTexto(tipo);
  if (!termo) return locais;
  return locais.filter((local) => normalizarTexto(local.data.tipo) === termo);
}

/** Locais de armazenamento que guardam pelo menos um produto cujo nome contém `nome`. */
export function filtrarLocaisPorNomeProduto(
  locais: LocalArmazenamentoView[],
  produtos: ProdutoView[],
  nome: string,
): LocalArmazenamentoView[] {
  const termo = normalizarTexto(nome);
  if (!termo) return locais;
  const idsLocais = new Set(
    filtrarProdutosPorNome(produtos, termo).map(
      (produto) => produto.data.id_local_armazenamento,
    ),
  );
  return locais.filter((local) => idsLocais.has(local.id));
}

// --- Busca no banco ---------------------------------------------------------

/** Carrega todos os locais de um estoque e todos os produtos guardados neles. */
async function carregarEstoque(id_estoque: string): Promise<{
  locais: LocalArmazenamentoView[];
  produtos: ProdutoView[];
}> {
  const locais = (await obterLocaisArmazenamento(id_estoque)) ?? [];
  const produtosPorLocal = await Promise.all(
    locais.map(async (local) => (await obterProdutos(local.id)) ?? []),
  );
  return { locais, produtos: produtosPorLocal.flat() };
}

/** Todos os PRODUTOS do estoque cujo nome contém `nome`. */
export async function buscarProdutosPorNome(
  id_estoque: string,
  nome: string,
): Promise<ProdutoView[]> {
  try {
    const { produtos } = await carregarEstoque(id_estoque);
    return filtrarProdutosPorNome(produtos, nome);
  } catch (error) {
    console.log("Erro em 'buscarProdutosPorNome()': ", error);
    throw error;
  }
}

/** Todos os LOCAIS DE ARMAZENAMENTO do estoque do tipo `tipo`. */
export async function buscarLocaisPorTipo(
  id_estoque: string,
  tipo: string,
): Promise<LocalArmazenamentoView[]> {
  try {
    const locais = (await obterLocaisArmazenamento(id_estoque)) ?? [];
    return filtrarLocaisPorTipo(locais, tipo);
  } catch (error) {
    console.log("Erro em 'buscarLocaisPorTipo()': ", error);
    throw error;
  }
}

/** Todos os LOCAIS DE ARMAZENAMENTO do estoque que guardam um produto cujo nome contém `nome`. */
export async function buscarLocaisComProduto(
  id_estoque: string,
  nome: string,
): Promise<LocalArmazenamentoView[]> {
  try {
    const { locais, produtos } = await carregarEstoque(id_estoque);
    return filtrarLocaisPorNomeProduto(locais, produtos, nome);
  } catch (error) {
    console.log("Erro em 'buscarLocaisComProduto()': ", error);
    throw error;
  }
}
