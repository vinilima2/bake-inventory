import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buscarLocaisComProduto,
  buscarLocaisPorTipo,
  buscarProdutosPorNome,
  filtrarLocaisPorNomeProduto,
  filtrarLocaisPorTipo,
  filtrarProdutosPorNome,
  normalizarTexto,
} from "./filtro-service";
import { obterLocaisArmazenamento } from "./local-armazenamento-service";
import type { LocalArmazenamentoView } from "./local-armazenamento-service";
import { obterProdutos } from "./produto-service";
import type { ProdutoView } from "./produto-service";

// Substitui os services reais (que acessam o Firebase) por funções simuladas.
vi.mock("./local-armazenamento-service", () => ({
  obterLocaisArmazenamento: vi.fn(),
}));

vi.mock("./produto-service", () => ({
  obterProdutos: vi.fn(),
}));

function local(id: string, tipo: string, nome = id): LocalArmazenamentoView {
  return {
    id,
    data: {
      id_estoque: "estoque-1",
      nome,
      tipo,
      observacoes: "",
      pos_grid_x: 0,
      pos_grid_y: 0,
    },
  };
}

function produto(id: string, nome: string, id_local: string): ProdutoView {
  return {
    id,
    data: {
      id_local_armazenamento: id_local,
      nome,
      observacoes: "",
      quantidade: 1,
    },
  };
}

const locais = [
  local("geladeira-1", "Geladeira"),
  local("armario-1", "Armário"),
  local("armario-2", "armario"),
  local("freezer-1", "Freezer"),
];

const produtos = [
  produto("p1", "Farinha de Trigo", "armario-1"),
  produto("p2", "Açúcar Refinado", "armario-1"),
  produto("p3", "Açúcar Mascavo", "armario-2"),
  produto("p4", "Manteiga", "geladeira-1"),
  produto("p5", "Fermento", "geladeira-1"),
];

const ids = (lista: { id: string }[]) => lista.map((item) => item.id);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("normalizarTexto", () => {
  it("remove acentos, espaços nas pontas e deixa minúsculo", () => {
    expect(normalizarTexto("  Açúcar MASCAVO ")).toBe("acucar mascavo");
  });

  it("trata valores ausentes como texto vazio", () => {
    expect(normalizarTexto(undefined)).toBe("");
    expect(normalizarTexto(null)).toBe("");
  });
});

describe("filtrarProdutosPorNome", () => {
  it("encontra por parte do nome, sem diferenciar acento e maiúscula", () => {
    expect(ids(filtrarProdutosPorNome(produtos, "acucar"))).toEqual(["p2", "p3"]);
    expect(ids(filtrarProdutosPorNome(produtos, "FARIN"))).toEqual(["p1"]);
  });

  it("devolve tudo quando o termo está vazio", () => {
    expect(filtrarProdutosPorNome(produtos, "   ")).toEqual(produtos);
  });

  it("devolve lista vazia quando nada corresponde", () => {
    expect(filtrarProdutosPorNome(produtos, "chocolate")).toEqual([]);
  });
});

describe("filtrarLocaisPorTipo", () => {
  it("compara o tipo inteiro, sem diferenciar acento e maiúscula", () => {
    expect(ids(filtrarLocaisPorTipo(locais, "armário"))).toEqual([
      "armario-1",
      "armario-2",
    ]);
  });

  it("não aceita tipo parcial", () => {
    expect(filtrarLocaisPorTipo(locais, "gela")).toEqual([]);
  });

  it("devolve tudo quando o tipo está vazio", () => {
    expect(filtrarLocaisPorTipo(locais, "")).toEqual(locais);
  });
});

describe("filtrarLocaisPorNomeProduto", () => {
  it("devolve os locais que guardam o produto procurado", () => {
    expect(ids(filtrarLocaisPorNomeProduto(locais, produtos, "açúcar"))).toEqual([
      "armario-1",
      "armario-2",
    ]);
    expect(ids(filtrarLocaisPorNomeProduto(locais, produtos, "manteiga"))).toEqual([
      "geladeira-1",
    ]);
  });

  it("não devolve locais sem o produto", () => {
    expect(filtrarLocaisPorNomeProduto(locais, produtos, "chocolate")).toEqual([]);
  });

  it("devolve todos os locais quando o termo está vazio", () => {
    expect(filtrarLocaisPorNomeProduto(locais, produtos, "")).toEqual(locais);
  });
});

describe("busca no banco", () => {
  beforeEach(() => {
    vi.mocked(obterLocaisArmazenamento).mockResolvedValue(locais);
    vi.mocked(obterProdutos).mockImplementation(async (id_local: string) =>
      produtos.filter((p) => p.data.id_local_armazenamento === id_local),
    );
  });

  it("buscarProdutosPorNome procura em todos os locais do estoque", async () => {
    const resultado = await buscarProdutosPorNome("estoque-1", "açúcar");

    expect(obterLocaisArmazenamento).toHaveBeenCalledWith("estoque-1");
    expect(obterProdutos).toHaveBeenCalledTimes(locais.length);
    expect(ids(resultado)).toEqual(["p2", "p3"]);
  });

  it("buscarLocaisPorTipo não precisa carregar produtos", async () => {
    const resultado = await buscarLocaisPorTipo("estoque-1", "Geladeira");

    expect(ids(resultado)).toEqual(["geladeira-1"]);
    expect(obterProdutos).not.toHaveBeenCalled();
  });

  it("buscarLocaisComProduto devolve os locais que têm o produto", async () => {
    const resultado = await buscarLocaisComProduto("estoque-1", "fermento");

    expect(ids(resultado)).toEqual(["geladeira-1"]);
  });

  it("trata retorno nulo dos services como lista vazia", async () => {
    vi.mocked(obterLocaisArmazenamento).mockResolvedValue(null);

    expect(await buscarProdutosPorNome("estoque-x", "a")).toEqual([]);
    expect(await buscarLocaisPorTipo("estoque-x", "Geladeira")).toEqual([]);
    expect(await buscarLocaisComProduto("estoque-x", "a")).toEqual([]);
  });

  it("propaga erro do banco", async () => {
    vi.mocked(obterLocaisArmazenamento).mockRejectedValue(new Error("falhou"));
    vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(buscarLocaisPorTipo("estoque-1", "Geladeira")).rejects.toThrow(
      "falhou",
    );
  });
});
