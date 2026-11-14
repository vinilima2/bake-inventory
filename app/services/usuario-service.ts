import { database } from "~/database/firebase-config"
import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, getDoc } from 'firebase/firestore';

export interface Usuario {
    nome: string,
    pin: string
}

export interface UsuarioView {
    id: string,
    data: Usuario
}

export async function obterUsuarios(): Promise<UsuarioView[] | null> {
    try {
        const usuario_collection = collection(database, 'Usuario');
        const snapshot = await getDocs(usuario_collection);
        const usuario_docs = snapshot.docs.map((usuario_doc) => ({
            id: usuario_doc.id,
            data: usuario_doc.data() as Usuario
        } as UsuarioView));
        
        return usuario_docs;
    }
    catch(error) {
        console.log("Erro em 'obterUsuarios()': ", error);
    }
    return null;
}

export async function obterUsuario(id: string): Promise<UsuarioView | null> {
    try {
        const usuario_doc = doc(database, 'Usuario', id);
        const snapshot = await getDoc(usuario_doc);
        if (snapshot.exists()) {
            return ({
                id: snapshot.id,
                data: snapshot.data()
            } as UsuarioView);
        }
    }
    catch(error) {
        console.log("Erro em 'obterUsuarios()': ", error);
    }
    return null;
}