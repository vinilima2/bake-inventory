// Entidades do banco, conforme o diagrama ER da proposta.
// Os nomes dos campos são os mesmos gravados no Firestore; `id` é o ID do documento.
// Este arquivo não importa nada do servidor, então pode ser usado nos componentes.

/** Usuário como é enviado para a tela: o PIN nunca sai do servidor. */
export interface Usuario {
  id: string;
  nome: string;
}

export interface Estoque {
  id: string;
  nome: string;
  id_usuario: string;
}

export interface LocalArmazenamento {
  id: string;
  tipo: string;
  nome: string;
  pos_grid_x: number;
  pos_grid_y: number;
  observacoes: string;
  id_estoque: string;
}

export interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  observacoes: string;
  id_local_armazenamento: string;
}
