import { database } from "~/database/firebase-config"
import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, getDoc, query, where, writeBatch } from 'firebase/firestore';

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

export async function obterProduto(id: string): Promise<ProdutoView | null> {
    try {
        const local_doc = doc(database, 'Produto', id);
        const snapshot = await getDoc(local_doc);
        if (snapshot.exists()) {
            return ({
                id: snapshot.id,
                data: snapshot.data()
            } as ProdutoView);
        }
    }
    catch(error) {
        console.log("Erro em 'obterProduto()': ", error);
    }
    return null;  
}

export async function adicionarProduto(produto: Produto): Promise<ProdutoView | null> {
    try {
        const produtos_collection = collection(database, 'Produto');
        const produto_doc = await addDoc(produtos_collection, produto);
        return {
    id: produto_doc.id,
    data: produto,
};
    }
    catch(error) {
        console.log("Erro em 'adicionarProduto()': ", error);
    throw error;
}
    return null;   
}

export async function editarProduto(id: string, novos_dados: Partial<Produto>): Promise<ProdutoView | null> {
    try {
        const produto_doc = doc(database, 'Produto', id);
        await updateDoc(produto_doc, novos_dados);
        return obterProduto(id);
    }
    catch(error) {
        console.log("Erro em 'editarProduto()': ", error);
        throw error;
    }
    return null;   
}

export async function excluirProduto(id: string): Promise<void> {
    try {
        const produto_doc = doc(database, 'Produto', id);
        await deleteDoc(produto_doc);
    } catch (error) {
        console.log("Erro em 'excluirProduto()': ", error);
        throw error;
    }
}

export async function excluirProdutos(id_local_armazenamento: string) {
    try {
        const produtos_collection = collection(database, 'Produto');
        const q = query(produtos_collection, where("id_local_armazenamento", "==", id_local_armazenamento));
        const snapshot = await getDocs(q);

        const batch = writeBatch(database);
        snapshot.forEach((produto_doc) => {
            batch.delete(produto_doc.ref);
        });
        await batch.commit();

    }
   catch (error) {
    console.log("Erro em 'excluirProdutos()': ", error);
    throw error;
}
}
/**
 * Retorna todos os produtos cadastrados em um estoque,
 * independentemente do local de armazenamento.
 */
export async function obterProdutosPorEstoque(
    id_estoque: string
): Promise<ProdutoView[] | null> {
    try {
        // Busca todos os locais pertencentes ao estoque.
        const locais_collection = collection(database, 'LocalArmazenamento');

        const q_locais = query(
            locais_collection,
            where("id_estoque", "==", id_estoque)
        );

        const locais_snapshot = await getDocs(q_locais);

        // Busca os produtos de cada local encontrado.
        const produtos_por_local = await Promise.all(
            locais_snapshot.docs.map(async (local_doc) => {
                const produtos_collection = collection(database, 'Produto');

                const q_produtos = query(
                    produtos_collection,
                    where("id_local_armazenamento", "==", local_doc.id)
                );

                const produtos_snapshot = await getDocs(q_produtos);

                return produtos_snapshot.docs.map((produto_doc) => ({
                    id: produto_doc.id,
                    data: produto_doc.data() as Produto
                }));
            })
        );

        // Junta os resultados em uma única lista.
        return produtos_por_local.flat();
    }
    catch (error) {
        console.log("Erro em 'obterProdutosPorEstoque()': ", error);
        return null;
    }
}
