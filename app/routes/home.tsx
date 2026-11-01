import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div>
      <header>
        <div className="lista-opcoes">
          <button>Salvar</button>
          <button>Voltar</button>
          <button>Avançar</button>
          <button>Novo</button>
        </div>
        <div>
          <button>Usuário</button>
        </div>
      </header>

      <main>
        <aside>
          <ul>
            <li>
              <div className="card">

              </div>
            </li>
            <li>
              <div className="card">

              </div>
            </li>
             <li>
              <div className="card">

              </div>
            </li>
             <li>
              <div className="card">

              </div>
            </li>
             <li>
              <div className="card">

              </div>
            </li>
             <li>
              <div className="card">

              </div>
            </li>
          </ul>
        </aside>
        <section>

        </section>
      </main>
    </div>
  );
}
