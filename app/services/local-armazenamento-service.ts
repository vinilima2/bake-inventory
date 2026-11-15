import { database } from "~/database/firebase-config"
import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, getDoc, query, where } from 'firebase/firestore';

export interface LocalArmazenamento {
    id_estoque: string,
    nome: string,
    observacoes: string,
    pos_grid_x: number,
    pos_grid_y: number,
    tipo: string
}

export interface LocalArmazenamentoView {
    id: string, 
    data: LocalArmazenamento
}

export async function obterLocaisArmazenamento(id_estoque: string): Promise<LocalArmazenamentoView[] | null> {
    try {
        const locais_collection = collection(database, 'LocalArmazenamento');
        const q = query(locais_collection, where("id_estoque", "==", id_estoque));
        const snapshot = await getDocs(q);
        const local_docs = snapshot.docs.map((local_doc) => ({
            id: local_doc.id,
            data: local_doc.data() as LocalArmazenamento
        } as LocalArmazenamentoView));

        return local_docs;
    }
    catch(error) {
        console.log("Erro em 'obterLocaisArmazenamento()': ", error);
    }
    return null;    
}