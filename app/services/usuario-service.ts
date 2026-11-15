import { database } from "~/database/firebase-config"
import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, getDoc, query, where } from 'firebase/firestore';

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
        const usuarios_collection = collection(database, 'Usuario');
        const snapshot = await getDocs(usuarios_collection);
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
        console.log("Erro em 'obterUsuario()': ", error);
    }
    return null;
}

export async function adicionarUsuario(usuario: Usuario): Promise<string | null> {
    try {
        const usuarios_collection = collection(database, 'Usuario');
        const q = query(usuarios_collection, where("nome", "==", usuario.nome));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            throw new Error("usuário com esse nome já existe.");
        }
        const usuario_doc = await addDoc(usuarios_collection, usuario);
        return usuario_doc.id;
    }
    catch(error) {
        console.log("Erro em 'adicionarUsuario()': ", error);
    }
    return null;
}

export async function editarUsuario(id: string, novos_dados: Partial<Usuario>): Promise<UsuarioView | null> {
    try {
        const usuario_doc = doc(database, 'Usuario', id);
        await updateDoc(usuario_doc, novos_dados);
        return obterUsuario(id);
    }
    catch(error) {
        console.log("Erro em 'editarUsuario()': ", error);
    }
    return null;
}

export async function excluirUsuario(id: string) {
    // TODO...
}

export async function login(nome_usuario: string, pin: string): Promise<UsuarioView | null> {
    try {
        const usuarios_collection = collection(database, 'Usuario');
        const q = query(usuarios_collection, where("nome", "==", nome_usuario), where("pin", "==", pin));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        const usuario_doc = snapshot.docs[0];
        return ({
            id: usuario_doc.id,
            data: usuario_doc.data()
        } as UsuarioView);
    }
    catch(error) {
        console.log("Erro em 'login()': ", error);
        return null;
    }
}

