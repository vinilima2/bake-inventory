import type { DocumentData } from "firebase-admin/firestore";

import { db } from "./firebase.server";
import type { Estoque, LocalArmazenamento, Produto, Usuario } from "./tipos";

// Acesso ao Firestore. Só pode ser importado em loaders, actions e rotas de API.

function colecao<T extends { id: string }>(nome: string) {
  type Dados = Omit<T, "id">;
  const ref = db.collection(nome);

  return {
    ref,

    async buscar(id: string): Promise<T | null> {
      const doc = await ref.doc(id).get();
      return doc.exists ? ({ id: doc.id, ...doc.data() } as T) : null;
    },

    /** Lista os documentos cujo `campo` (uma chave estrangeira) é igual a `valor`. */
    async listarPor(campo: keyof Dados & string, valor: string): Promise<T[]> {
      const resultado = await ref.where(campo, "==", valor).get();
      return resultado.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
    },

    async criar(dados: Dados): Promise<T> {
      const doc = await ref.add(dados as DocumentData);
      return { id: doc.id, ...dados } as T;
    },

    /** Altera só os campos informados. Falha se o documento não existir. */
    async atualizar(id: string, dados: Partial<Dados>): Promise<void> {
      await ref.doc(id).update(dados as DocumentData);
    },
  };
}

const usuarios = db.collection("Usuario");
export const estoques = colecao<Estoque>("Estoque");
export const locais = colecao<LocalArmazenamento>("LocalArmazenamento");
export const produtos = colecao<Produto>("Produto");

// --- Usuário ---------------------------------------------------------------

export async function listarUsuarios(): Promise<Usuario[]> {
  const resultado = await usuarios.select("nome").get();
  return resultado.docs.map((doc) => ({ id: doc.id, nome: doc.get("nome") }));
}

export async function verificarPin(idUsuario: string, pin: string): Promise<boolean> {
  const doc = await usuarios.doc(idUsuario).get();
  return doc.exists && doc.get("pin") === pin;
}

// --- Remoção ---------------------------------------------------------------
// O Firestore não tem chave estrangeira nem exclusão em cascata: ao remover um
// estoque ou um local é preciso apagar os filhos junto, senão ficam órfãos.
// Cada remoção é atômica (um batch, limitado pelo Firestore a 500 documentos).

export async function removerProduto(id: string): Promise<void> {
  await produtos.ref.doc(id).delete();
}

export async function removerLocal(id: string): Promise<void> {
  const batch = db.batch();
  const filhos = await produtos.ref.where("id_local_armazenamento", "==", id).get();
  filhos.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(locais.ref.doc(id));
  await batch.commit();
}

export async function removerEstoque(id: string): Promise<void> {
  const batch = db.batch();
  const locaisDoEstoque = await locais.ref.where("id_estoque", "==", id).get();
  for (const local of locaisDoEstoque.docs) {
    const filhos = await produtos.ref
      .where("id_local_armazenamento", "==", local.id)
      .get();
    filhos.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(local.ref);
  }
  batch.delete(estoques.ref.doc(id));
  await batch.commit();
}
