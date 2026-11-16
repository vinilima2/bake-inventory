import { adicionarUsuario } from "./usuario-service";
import { adicionarEstoque } from "./estoque-service";
import {
  adicionarLocalArmazenamento,
} from "./local-armazenamento-service";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  processarPilha,
  salvarPilha,
} from "./pilha-service";

import type { ItemPilha } from "./pilha-service";

import {
  adicionarProduto,
  editarProduto,
  excluirProduto,
} from "./produto-service";

// Substitui os services reais por funções simuladas.
vi.mock("./produto-service", () => ({
  adicionarProduto: vi.fn(),
  editarProduto: vi.fn(),
  excluirProduto: vi.fn(),
}));

vi.mock("./local-armazenamento-service", () => ({
  adicionarLocalArmazenamento: vi.fn(),
  editarLocalArmazenamento: vi.fn(),
  excluirLocalArmazenamento: vi.fn(),
}));

vi.mock("./estoque-service", () => ({
  adicionarEstoque: vi.fn(),
  editarEstoque: vi.fn(),
  excluirEstoque: vi.fn(),
}));

vi.mock("./usuario-service", () => ({
  adicionarUsuario: vi.fn(),
  editarUsuario: vi.fn(),
  excluirUsuario: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Service de pilha", () => {
  it("aceita uma pilha vazia sem executar ações", async () => {
    const executar = vi.fn();

    const resultado = await processarPilha([], executar);

    expect(resultado).toEqual({
      sucesso: true,
      processadas: 0,
    });

    expect(executar).not.toHaveBeenCalled();
  });

  it("aguarda cada ação e mantém a ordem original", async () => {
    const pilha: ItemPilha[] = [
      {
        entidade: "Produto",
        acao: "excluir",
        estado: { id: "primeiro" },
      },
      {
        entidade: "Produto",
        acao: "excluir",
        estado: { id: "segundo" },
      },
    ];

    const eventos: string[] = [];

    const resultado = await processarPilha(
      pilha,
      async (item) => {
        if (item.acao !== "excluir") {
          throw new Error("Ação inesperada no teste.");
        }

        eventos.push(`inicio:${item.estado.id}`);
        await Promise.resolve();
        eventos.push(`fim:${item.estado.id}`);
      }
    );

    expect(eventos).toEqual([
      "inicio:primeiro",
      "fim:primeiro",
      "inicio:segundo",
      "fim:segundo",
    ]);

    expect(resultado).toEqual({
      sucesso: true,
      processadas: 2,
    });
  });

  it("para na falha e não executa a próxima ação", async () => {
    const pilha: ItemPilha[] = [
      {
        entidade: "Produto",
        acao: "excluir",
        estado: { id: "1" },
      },
      {
        entidade: "Produto",
        acao: "excluir",
        estado: { id: "2" },
      },
      {
        entidade: "Produto",
        acao: "excluir",
        estado: { id: "3" },
      },
    ];

    vi.mocked(excluirProduto)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Falha simulada"));

    const resultado = await salvarPilha(pilha);

    expect(resultado).toMatchObject({
      sucesso: false,
      processadas: 1,
      indiceFalha: 1,
      erro: "Falha simulada",
    });

    expect(excluirProduto).toHaveBeenCalledTimes(2);
    expect(excluirProduto).not.toHaveBeenCalledWith("3");
  });

  it("usa o ID criado ao editar um produto novo", async () => {
    const dados = {
      nome: "Farinha",
      quantidade: 10,
      observacoes: "",
      id_local_armazenamento: "local-existente",
    };

    vi.mocked(adicionarProduto).mockResolvedValue({
      id: "id-firebase",
      data: dados,
    });

    vi.mocked(editarProduto).mockResolvedValue({
      id: "id-firebase",
      data: { ...dados, quantidade: 20 },
    });

    const pilha: ItemPilha[] = [
      {
        entidade: "Produto",
        acao: "criar",
        estado: {
          idTemporario: "temp-produto",
          dados,
        },
      },
      {
        entidade: "Produto",
        acao: "editar",
        estado: {
          id: "temp-produto",
          dados: { quantidade: 20 },
        },
      },
    ];

    const original = structuredClone(pilha);
    const resultado = await salvarPilha(pilha);

    expect(resultado.sucesso).toBe(true);
    expect(resultado.processadas).toBe(2);

    expect(editarProduto).toHaveBeenCalledWith(
      "id-firebase",
      { quantidade: 20 }
    );

    expect(resultado.idsCriados.Produto).toEqual({
      "temp-produto": "id-firebase",
    });

    expect(pilha).toEqual(original);
  });
});
it("converte os IDs dos vínculos entre as entidades", async () => {
  const usuario = {
    nome: "Usuario de teste",
    pin: "1234",
  };

  const estoque = {
    nome: "Estoque de teste",
    id_usuario: "temp-usuario",
  };

  const local = {
    nome: "Prateleira de teste",
    id_estoque: "temp-estoque",
    observacoes: "",
    pos_grid_x: 0,
    pos_grid_y: 0,
    tipo: "Prateleira",
  };

  const produto = {
    nome: "Farinha",
    quantidade: 10,
    observacoes: "",
    id_local_armazenamento: "temp-local",
  };

  vi.mocked(adicionarUsuario).mockResolvedValue({
    id: "usuario-real",
    data: usuario,
  });

  vi.mocked(adicionarEstoque).mockResolvedValue({
    id: "estoque-real",
    data: { ...estoque, id_usuario: "usuario-real" },
  });

  vi.mocked(adicionarLocalArmazenamento).mockResolvedValue({
    id: "local-real",
    data: { ...local, id_estoque: "estoque-real" },
  });

  vi.mocked(adicionarProduto).mockResolvedValue({
    id: "produto-real",
    data: {
      ...produto,
      id_local_armazenamento: "local-real",
    },
  });

  const pilha: ItemPilha[] = [
    {
      entidade: "Usuario",
      acao: "criar",
      estado: {
        idTemporario: "temp-usuario",
        dados: usuario,
      },
    },
    {
      entidade: "Estoque",
      acao: "criar",
      estado: {
        idTemporario: "temp-estoque",
        dados: estoque,
      },
    },
    {
      entidade: "LocalArmazenamento",
      acao: "criar",
      estado: {
        idTemporario: "temp-local",
        dados: local,
      },
    },
    {
      entidade: "Produto",
      acao: "criar",
      estado: {
        idTemporario: "temp-produto",
        dados: produto,
      },
    },
  ];

  const original = structuredClone(pilha);
  const resultado = await salvarPilha(pilha);

  expect(resultado).toMatchObject({
    sucesso: true,
    processadas: 4,
    idsCriados: {
      Usuario: { "temp-usuario": "usuario-real" },
      Estoque: { "temp-estoque": "estoque-real" },
      LocalArmazenamento: { "temp-local": "local-real" },
      Produto: { "temp-produto": "produto-real" },
    },
  });

  expect(adicionarUsuario).toHaveBeenCalledWith(usuario);

  expect(adicionarEstoque).toHaveBeenCalledWith({
    ...estoque,
    id_usuario: "usuario-real",
  });

  expect(adicionarLocalArmazenamento).toHaveBeenCalledWith({
    ...local,
    id_estoque: "estoque-real",
  });

  expect(adicionarProduto).toHaveBeenCalledWith({
    ...produto,
    id_local_armazenamento: "local-real",
  });

  expect(pilha).toEqual(original);
})