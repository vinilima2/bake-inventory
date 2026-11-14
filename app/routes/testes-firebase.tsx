import { Button } from '@mui/material';
import { obterUsuario, obterUsuarios } from '~/services/usuario-service';

//const usuarios = await obterUsuarios();
const usuario = await obterUsuario("qbNXhCDhxHe5XIOMrXhr");

export default function TestesFirebase() {
    return (
        //<Button onClick={() => {console.log(usuarios)}}>Obter Usuarios</Button>
        <Button onClick={() => {console.log(usuario)}}>Obter Usuario</Button>
    );
}