import { database } from "~/database/firebase-config"
import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, getDoc, query, where } from 'firebase/firestore';

export interface Produto {
    id_local_armazenamento: string,
    nome: string, 
    observacoes: string,
    quantidade: number
}

export interface ProdutoView {
    id: string,
    data: Produto
}

export async function obterProdutos(id_local: string): Promise<ProdutoView[] | null> {
    try {
        const produtos_collection = collection(database, 'Produto');
        const q = query(produtos_collection, where("id_local_armazenamento", "==", id_local));
        const snapshot = await getDocs(q);
        const produto_docs = snapshot.docs.map((produto_doc) => ({
            id: produto_doc.id,
            data: produto_doc.data() as Produto
        } as ProdutoView));

        return produto_docs;
    }
    catch(error) {
        console.log("Erro em 'obterProdutos()': ", error);
    }
    return null; 
}