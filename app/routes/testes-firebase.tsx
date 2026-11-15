import { Button } from '@mui/material';
import { adicionarEstoque, editarEstoque, obterEstoque, obterEstoques } from '~/services/estoque-service';
import { adicionarLocalArmazenamento, editarLocalArmazenamento, obterLocaisArmazenamento, obterLocalArmazenamento } from '~/services/local-armazenamento-service';
import { obterProdutos } from '~/services/produto-service';
import { obterUsuario, obterUsuarios, login, adicionarUsuario, editarUsuario } from '~/services/usuario-service';

//const usuarios = await obterUsuarios();
//const usuario = await obterUsuario("qbNXhCDhxHe5XIOMrXhr");
//const usuario_log = await login("Thomas", "1234");
//const estoques = await obterEstoques("WQAP9S6XGc95oyVO8wru");
//const estoque = await obterEstoque("ckuCKULiOb4VjYPw84ZF");
//const locais = await obterLocaisArmazenamento("e3JNOMUyYzR0SXzpgC9I");
//const local = await obterLocalArmazenamento("dcyrQJ7NNcGOEboOp7hX");
const produtos = await obterProdutos("dcyrQJ7NNcGOEboOp7hX");

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
        /*<Button onClick={() => {
            editarEstoque("VTN6kuNeYPhbillXTSm5", {nome: "Deposito Limpeza"});
        }}>Atualizar</Button>*/
        //<Button onClick={() => {console.log(locais)}}>Obter Locais de Armazenamento</Button>
        //<Button onClick={() => {console.log(local)}}>Obter Local de Armazenamento</Button>
        /*<Button onClick={() => {
            adicionarLocalArmazenamento({ id_estoque: "e3JNOMUyYzR0SXzpgC9I", nome: "Prateleira A", observacoes: "", pos_grid_x: 10, pos_grid_y: 5, tipo: "prateleira" });
        }}>Criar</Button>*/
        /*<Button onClick={() => {
            editarLocalArmazenamento("P21jWYjnelasrHFiqKfZ", {pos_grid_x: 6, pos_grid_y: 7, nome: "Prateleira B"});
        }}>Atualizar</Button>*/
        <Button onClick={() => {console.log(produtos)}}>Obter Produtos</Button>
    );
}