import {
  adicionarUsuario,
  editarUsuario,
  excluirUsuario,
} from "./usuario-service";
import {
  adicionarEstoque,
  editarEstoque,
  excluirEstoque,
} from "./estoque-service";
import {
  adicionarLocalArmazenamento,
  editarLocalArmazenamento,
  excluirLocalArmazenamento,
} from "./local-armazenamento-service";
import {
  adicionarProduto,
  editarProduto,
  excluirProduto,
} from "./produto-service";
import type { Produto } from "./produto-service";
import type { LocalArmazenamento } from "./local-armazenamento-service";
import type { Estoque } from "./estoque-service";
import type { Usuario } from "./usuario-service";

// Relaciona cada entidade ao formato dos seus dados.
type Entidades = {
  Produto: Produto;
  LocalArmazenamento: LocalArmazenamento;
  Estoque: Estoque;
  Usuario: Usuario;
};

// Define os dados necessários para cada operação.
type AcaoDaEntidade<T> =
  | {
      acao: "criar";
      estado: {
        idTemporario: string;
        dados: T;
      };
    }
  | {
      acao: "editar";
      estado: {
        id: string;
        dados: Partial<T>;
      };
    }
  | {
      acao: "excluir";
      estado: {
        id: string;
      };
    };

// Combina a entidade com as operações permitidas.
export type ItemPilha = {
  [E in keyof Entidades]: {
    entidade: E;
  } & AcaoDaEntidade<Entidades[E]>;
}[keyof Entidades];
// Função responsável por executar uma ação no CRUD.
export type ExecutorAcao = (item: ItemPilha) => Promise<void>;
// Resultado enviado para quem chamou o processamento.
export type ResultadoPilha =
  | {
      sucesso: true;
      processadas: number;
    }
  | {
      sucesso: false;
      processadas: number;
      indiceFalha: number;
      erro: string;
    };

// Recebe as ações da mais antiga para a mais recente.
export async function processarPilha(
  pilha: readonly ItemPilha[],
  executarAcao: ExecutorAcao
): Promise<ResultadoPilha> {
  // Copia os dados para não alterar a pilha do front-end.
  const acoes = structuredClone(pilha);

  for (let indice = 0; indice < acoes.length; indice++) {
    try {
      // Aguarda a ação terminar antes de iniciar a próxima.
      await executarAcao(acoes[indice]);
    } catch (erro) {
      return {
        sucesso: false,
        processadas: indice,
        indiceFalha: indice,
        erro:
          erro instanceof Error
            ? erro.message
            : "Erro desconhecido ao processar a pilha.",
      };
    }
  }

  return {
    sucesso: true,
    processadas: acoes.length,
  };
}
type AcaoProduto = Extract<ItemPilha, { entidade: "Produto" }>;

async function executarAcaoProduto(
  item: AcaoProduto,
  idsCriados: Map<string, string>,
  idsLocais: ReadonlyMap<string, string>
): Promise<void> {
  switch (item.acao) {
    case "criar": {
      const { idTemporario, dados } = item.estado;

      if (idsCriados.has(idTemporario)) {
        throw new Error("ID temporário de produto duplicado.");
      }

      const produto = await adicionarProduto({
        ...dados,
        id_local_armazenamento:
          idsLocais.get(dados.id_local_armazenamento) ??
          dados.id_local_armazenamento,
      });

      if (!produto) {
        throw new Error(
          "Não foi possível confirmar a criação do produto."
        );
      }

      idsCriados.set(idTemporario, produto.id);
      return;
    }

    case "editar": {
      const { id, dados } = item.estado;
      const idReal = idsCriados.get(id) ?? id;
      const novosDados = { ...dados };

      if (novosDados.id_local_armazenamento !== undefined) {
        novosDados.id_local_armazenamento =
          idsLocais.get(novosDados.id_local_armazenamento) ??
          novosDados.id_local_armazenamento;
      }

      const produto = await editarProduto(idReal, novosDados);

      if (!produto) {
        throw new Error(
          "Não foi possível confirmar a edição do produto."
        );
      }

      return;
    }

    case "excluir": {
      const idReal =
        idsCriados.get(item.estado.id) ?? item.estado.id;

      await excluirProduto(idReal);
      return;
    }
  }
}
type AcaoLocal = Extract<
  ItemPilha,
  { entidade: "LocalArmazenamento" }
>;

async function executarAcaoLocal(
  item: AcaoLocal,
  idsLocais: Map<string, string>,
  idsEstoques: ReadonlyMap<string, string>
): Promise<void> {
  switch (item.acao) {
    case "criar": {
      const { idTemporario, dados } = item.estado;

      if (idsLocais.has(idTemporario)) {
        throw new Error("ID temporário de local duplicado.");
      }

      const local = await adicionarLocalArmazenamento({
        ...dados,
        id_estoque:
          idsEstoques.get(dados.id_estoque) ?? dados.id_estoque,
      });

      if (!local) {
        throw new Error(
          "Não foi possível confirmar a criação do local."
        );
      }

      idsLocais.set(idTemporario, local.id);
      return;
    }

    case "editar": {
      const { id, dados } = item.estado;
      const idReal = idsLocais.get(id) ?? id;
      const novosDados = { ...dados };

      if (novosDados.id_estoque !== undefined) {
        novosDados.id_estoque =
          idsEstoques.get(novosDados.id_estoque) ??
          novosDados.id_estoque;
      }

      const local = await editarLocalArmazenamento(
        idReal,
        novosDados
      );

      if (!local) {
        throw new Error(
          "Não foi possível confirmar a edição do local."
        );
      }

      return;
    }

    case "excluir": {
      const idReal =
        idsLocais.get(item.estado.id) ?? item.estado.id;

      await excluirLocalArmazenamento(idReal);
      return;
    }
  }
}
type AcaoEstoque = Extract<
  ItemPilha,
  { entidade: "Estoque" }
>;

async function executarAcaoEstoque(
  item: AcaoEstoque,
  idsEstoques: Map<string, string>,
  idsUsuarios: ReadonlyMap<string, string>
): Promise<void> {
  switch (item.acao) {
    case "criar": {
      const { idTemporario, dados } = item.estado;

      if (idsEstoques.has(idTemporario)) {
        throw new Error("ID temporário de estoque duplicado.");
      }

      const estoque = await adicionarEstoque({
        ...dados,
        id_usuario:
          idsUsuarios.get(dados.id_usuario) ?? dados.id_usuario,
      });

      if (!estoque) {
        throw new Error(
          "Não foi possível confirmar a criação do estoque."
        );
      }

      idsEstoques.set(idTemporario, estoque.id);
      return;
    }

    case "editar": {
      const { id, dados } = item.estado;
      const idReal = idsEstoques.get(id) ?? id;
      const novosDados = { ...dados };

      if (novosDados.id_usuario !== undefined) {
        novosDados.id_usuario =
          idsUsuarios.get(novosDados.id_usuario) ??
          novosDados.id_usuario;
      }

      const estoque = await editarEstoque(
        idReal,
        novosDados
      );

      if (!estoque) {
        throw new Error(
          "Não foi possível confirmar a edição do estoque."
        );
      }

      return;
    }

    case "excluir": {
      const idReal =
        idsEstoques.get(item.estado.id) ?? item.estado.id;

      await excluirEstoque(idReal);
      return;
    }
  }
}
type AcaoUsuario = Extract<
  ItemPilha,
  { entidade: "Usuario" }
>;

async function executarAcaoUsuario(
  item: AcaoUsuario,
  idsUsuarios: Map<string, string>
): Promise<void> {
  switch (item.acao) {
    case "criar": {
      const { idTemporario, dados } = item.estado;

      if (idsUsuarios.has(idTemporario)) {
        throw new Error("ID temporário de usuário duplicado.");
      }

      const usuario = await adicionarUsuario(dados);

      if (!usuario) {
        throw new Error(
          "Não foi possível confirmar a criação do usuário."
        );
      }

      idsUsuarios.set(idTemporario, usuario.id);
      return;
    }

    case "editar": {
      const { id, dados } = item.estado;
      const idReal = idsUsuarios.get(id) ?? id;

      const usuario = await editarUsuario(idReal, dados);

      if (!usuario) {
        throw new Error(
          "Não foi possível confirmar a edição do usuário."
        );
      }

      return;
    }

    case "excluir": {
      const idReal =
        idsUsuarios.get(item.estado.id) ?? item.estado.id;

      await excluirUsuario(idReal);
      return;
    }
  }
}
// IDs temporários e seus respectivos IDs no Firebase.
export type IdsPilha = {
  Produto: Record<string, string>;
  LocalArmazenamento: Record<string, string>;
  Estoque: Record<string, string>;
  Usuario: Record<string, string>;
};

export async function salvarPilha(
  pilha: readonly ItemPilha[],
  idsAnteriores?: IdsPilha
): Promise<ResultadoPilha & { idsCriados: IdsPilha }> {
  const idsProdutos = new Map(
    Object.entries(idsAnteriores?.Produto ?? {})
  );

  const idsLocais = new Map(
    Object.entries(idsAnteriores?.LocalArmazenamento ?? {})
  );

  const idsEstoques = new Map(
    Object.entries(idsAnteriores?.Estoque ?? {})
  );

  const idsUsuarios = new Map(
    Object.entries(idsAnteriores?.Usuario ?? {})
  );

  const resultado = await processarPilha(
    pilha,
    async (item) => {
      switch (item.entidade) {
        case "Produto":
          await executarAcaoProduto(
            item,
            idsProdutos,
            idsLocais
          );
          return;

        case "LocalArmazenamento":
          await executarAcaoLocal(
            item,
            idsLocais,
            idsEstoques
          );
          return;

        case "Estoque":
          await executarAcaoEstoque(
            item,
            idsEstoques,
            idsUsuarios
          );
          return;

        case "Usuario":
          await executarAcaoUsuario(item, idsUsuarios);
          return;

        default:
          throw new Error("Entidade não reconhecida.");
      }
    }
  );

  return {
    ...resultado,
    idsCriados: {
      Produto: Object.fromEntries(idsProdutos),
      LocalArmazenamento: Object.fromEntries(idsLocais),
      Estoque: Object.fromEntries(idsEstoques),
      Usuario: Object.fromEntries(idsUsuarios),
    },
  };
}