import { Button } from '@mui/material';
import { obterUsuarios } from '~/services/usuario-service';

const usuarios = await obterUsuarios();

export default function TestesFirebase() {
    return (
        <Button onClick={() => {console.log(usuarios)}}>Obter Usuarios</Button>
    );
}