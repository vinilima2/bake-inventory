import { database } from "~/database/firebase-config"
import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, getDoc, query, where } from 'firebase/firestore';

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
        return obterEstoque(estoque_doc.id);
    }
    catch(error) {
        console.log("Erro em 'adicionarEstoque()': ", error);
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
    }
    return null;    
}

export async function excluirEstoque(id: string) {
    // TODO...
}