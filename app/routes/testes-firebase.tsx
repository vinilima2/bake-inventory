import { Button } from '@mui/material';
import { obterUsuario, obterUsuarios, login } from '~/services/usuario-service';

//const usuarios = await obterUsuarios();
//const usuario = await obterUsuario("qbNXhCDhxHe5XIOMrXhr");
const usuario_log = await login("Thomas", "1234");

export default function TestesFirebase() {
    return (
        //<Button onClick={() => {console.log(usuarios)}}>Obter Usuarios</Button>
        //<Button onClick={() => {console.log(usuario_log)}}>Obter Usuario</Button>
        <Button onClick={() => {console.log(usuario_log)}}>Logar</Button>
    );
}