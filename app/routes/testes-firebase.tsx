import { Button } from '@mui/material';
import { adicionarEstoque, editarEstoque, obterEstoque, obterEstoques } from '~/services/estoque-service';
import { obterUsuario, obterUsuarios, login, adicionarUsuario, editarUsuario } from '~/services/usuario-service';

//const usuarios = await obterUsuarios();
//const usuario = await obterUsuario("qbNXhCDhxHe5XIOMrXhr");
//const usuario_log = await login("Thomas", "1234");
//const estoques = await obterEstoques("WQAP9S6XGc95oyVO8wru");
//const estoque = await obterEstoque("ckuCKULiOb4VjYPw84ZF");

export default function TestesFirebase() {
    return (
        //<Button onClick={() => {console.log(usuarios)}}>Obter Usuarios</Button>
        //<Button onClick={() => {console.log(usuario_log)}}>Obter Usuario</Button>
        //<Button onClick={() => {console.log(usuario_log)}}>Logar</Button>
        /*<Button onClick={() => {
            adicionarUsuario({ nome: "Vinicius", pin: "9999" });
        }}>Criar</Button>*/
        /*<Button onClick={() => {
            editarUsuario("usjVFhQeLu3tVRWPC6bm", {pin: "0911", nome: "Diego"});
        }}>Atualizar</Button>*/
        //<Button onClick={() => {console.log(estoque)}}>Obter Estoques</Button>
        //<Button onClick={() => {console.log(estoque)}}>Obter Estoque</Button>
        /*<Button onClick={() => {
            adicionarEstoque({ nome: "Depósito Bebidas", id_usuario: "qbNXhCDhxHe5XIOMrXhr" });
        }}>Criar</Button>*/
        <Button onClick={() => {
            editarEstoque("VTN6kuNeYPhbillXTSm5", {nome: "Deposito Limpeza"});
        }}>Atualizar</Button>
    );
}