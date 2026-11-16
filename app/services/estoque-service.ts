import { database } from "~/database/firebase-config"
import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, getDoc, query, where } from 'firebase/firestore';
import { excluirLocaisArmazenamento } from "./local-armazenamento-service";

export interface Estoque {
    id_usuario: string,
    nome: string
}

export interface EstoqueView {
    id: string,
    data: Estoque
}

export async function obterEstoques(id_usuario: string): Promise<EstoqueView[] | null> {
    try {
        const estoques_collection = collection(database, 'Estoque');
        const q = query(estoques_collection, where("id_usuario", "==", id_usuario));
        const snapshot = await getDocs(q);
        const estoque_docs = snapshot.docs.map((estoque_doc) => ({
            id: estoque_doc.id,
            data: estoque_doc.data() as Estoque
        } as EstoqueView));

        return estoque_docs;
    }
    catch(error) {
        console.log("Erro em 'obterEstoques()': ", error);
    }
    return null;
}

export async function obterEstoque(id: string): Promise<EstoqueView | null> {
    try {
        const estoque_doc = doc(database, 'Estoque', id);
        const snapshot = await getDoc(estoque_doc);
        if (snapshot.exists()) {
            return ({
                id: snapshot.id,
                data: snapshot.data()
            } as EstoqueView);
        }
    }
    catch(error) {
        console.log("Erro em 'obterEstoque()': ", error);
    }
    return null;
}

export async function adicionarEstoque(estoque: Estoque): Promise<EstoqueView | null> {
    try {
        const estoques_collection = collection(database, 'Estoque');
        const estoque_doc = await addDoc(estoques_collection, estoque);
        return {
    id: estoque_doc.id,
    data: estoque,
};
    }
    catch(error) {
        console.log("Erro em 'adicionarEstoque()': ", error);
    throw error;
}
    return null;    
}

export async function editarEstoque(id: string, novos_dados: Partial<Estoque>): Promise<EstoqueView | null> {
    try {
        const estoque_doc = doc(database, 'Estoque', id);
        await updateDoc(estoque_doc, novos_dados);
        return obterEstoque(id);
    }
    catch(error) {
        console.log("Erro em 'editarEstoque()': ", error);
    throw error;
}
    return null;    
}

export async function excluirEstoque(id: string) {
    try {
        const estoque_doc = doc(database, 'Estoque', id);
        await deleteDoc(estoque_doc);
        await excluirLocaisArmazenamento(id);
    } catch (error) {
        console.log("Erro em 'excluirEstoque()': ", error);
    throw error;
}
}

export async function excluirEstoques(id_usuario: string) {
    try {
        const estoques_collection = collection(database, 'Estoque');
        const q = query(estoques_collection, where("id_usuario", "==", id_usuario));
        const estoque_docs = await getDocs(q);
        for (const estoque of estoque_docs.docs) {
    await excluirEstoque(estoque.id);
}
    } catch (error) {
        console.log("Erro em 'excluirEstoques()': ", error);
    throw error;
}
}