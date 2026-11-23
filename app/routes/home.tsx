import { useState, useMemo, useRef, useEffect } from "react";
import type { Route } from "./+types/home";
import ModalPin from "~/components/modal-pin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sistema de Estoque da Padaria" },
    { name: "description", content: "Organize e acompanhe ingredientes, insumos e produtos com praticidade" },
  ];
}

interface LocalEstoque {
  id: number;
  nome: string;
  tipo: string;
  produtos: Record<string, number>;
}

const dadosIniciais: LocalEstoque[] = [
  { id: 1, nome: "Local de armazenamento", tipo: "tipo A", produtos: { "Produto A": 123, "Produto B": 1, "Produto C": 18, "Produto D": 900 } },
  { id: 2, nome: "Local de armazenamento", tipo: "tipo B", produtos: { "Produto A": 1, "Produto D": 15 } },
  { id: 3, nome: "Local de armazenamento", tipo: "tipo C", produtos: { "Produto B": 45, "Produto C": 320 } },
  { id: 4, nome: "Local de armazenamento", tipo: "tipo D", produtos: { "Produto A": 20, "Produto D": 135 } },
];

const rotulosFiltro: Record<string, string> = {
  todos: "Filtrar dados",
  baixo_estoque: "Estoque baixo",
  maior_volume: "Maior volume",
  alfabetico: "Ordem A-Z",
};

export default function Home() {
  const [telaAtual, setTelaAtual] = useState<"login" | "dashboard">("login");
  const [modalPinAberto, setModalPinAberto] = useState(false);
  const [locaisEstoque, setLocaisEstoque] = useState<LocalEstoque[]>(dadosIniciais);
  const [historicoDesfazer, setHistoricoDesfazer] = useState<string[]>([]);
  const [historicoRefazer, setHistoricoRefazer] = useState<string[]>([]);
  const [filtroAtual, setFiltroAtual] = useState<string>("todos");
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(false);
  const [statusSalvoVisivel, setStatusSalvoVisivel] = useState(false);
  const [indiceArrastado, setIndiceArrastado] = useState<number | null>(null);
  const [indiceSobre, setIndiceSobre] = useState<number | null>(null);

  const containerFiltroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("padaria_estoque");
    if (dadosSalvos) {
      try {
        setLocaisEstoque(JSON.parse(dadosSalvos));
      } catch {
        setLocaisEstoque(dadosIniciais);
      }
    }
  }, []);

  useEffect(() => {
    function manipularCliqueFora(evento: MouseEvent) {
      if (containerFiltroRef.current && !containerFiltroRef.current.contains(evento.target as Node)) {
        setMenuFiltroAberto(false);
      }
    }

    document.addEventListener("click", manipularCliqueFora);
    return () => {
      document.removeEventListener("click", manipularCliqueFora);
    };
  }, []);

  function registrarHistorico(novosLocais: LocalEstoque[]) {
    setHistoricoDesfazer((anterior) => [...anterior, JSON.stringify(locaisEstoque)]);
    setHistoricoRefazer([]);
    setLocaisEstoque(novosLocais);
  }

  function desfazer() {
    if (historicoDesfazer.length === 0) return;
    const copia = [...historicoDesfazer];
    const estadoAnterior = copia.pop()!;
    setHistoricoRefazer((anterior) => [...anterior, JSON.stringify(locaisEstoque)]);
    setHistoricoDesfazer(copia);
    setLocaisEstoque(JSON.parse(estadoAnterior));
  }

  function refazer() {
    if (historicoRefazer.length === 0) return;
    const copia = [...historicoRefazer];
    const proximoEstado = copia.pop()!;
    setHistoricoDesfazer((anterior) => [...anterior, JSON.stringify(locaisEstoque)]);
    setHistoricoRefazer(copia);
    setLocaisEstoque(JSON.parse(proximoEstado));
  }

  function salvarEstado() {
    localStorage.setItem("padaria_estoque", JSON.stringify(locaisEstoque));
    setStatusSalvoVisivel(true);
    setTimeout(() => {
      setStatusSalvoVisivel(false);
    }, 2500);
  }

  function abrirModalPin() {
    setModalPinAberto(true);
  }

  function fecharModalPin() {
    setModalPinAberto(false);
  }

  function confirmarPin() {
    setModalPinAberto(false);
    setTelaAtual("dashboard");
  }

  function alternarMenuFiltro() {
    setMenuFiltroAberto((anterior) => !anterior);
  }

  function aplicarFiltro(tipo: string) {
    setFiltroAtual(tipo);
    setMenuFiltroAberto(false);
  }

  const listaFiltrada = useMemo(() => {
    let lista = locaisEstoque.map((item, indiceOriginal) => ({ ...item, indiceOriginal }));

    if (filtroAtual === "baixo_estoque") {
      lista = lista.filter((local) => Object.values(local.produtos).some((qtd) => Number(qtd) < 20));
    } else if (filtroAtual === "maior_volume") {
      lista.sort((a, b) => {
        const somaA = Object.values(a.produtos).reduce((acumulador, v) => acumulador + Number(v), 0);
        const somaB = Object.values(b.produtos).reduce((acumulador, v) => acumulador + Number(v), 0);
        return somaB - somaA;
      });
    } else if (filtroAtual === "alfabetico") {
      lista.sort((a, b) => a.tipo.localeCompare(b.tipo));
    }

    return lista;
  }, [locaisEstoque, filtroAtual]);

  const totalProdutos = useMemo(() => {
    let total = 0;
    locaisEstoque.forEach((local) => {
      for (const qtd of Object.values(local.produtos)) {
        total += Number(qtd);
      }
    });
    return total;
  }, [locaisEstoque]);

  function adicionarLocal() {
    const novoTipo = prompt("Digite o nome ou tipo do novo local (Ex: tipo E):");
    if (novoTipo) {
      const novosLocais = [
        ...locaisEstoque,
        {
          id: Date.now(),
          nome: "Local de armazenamento",
          tipo: novoTipo,
          produtos: { "Produto A": 10, "Produto B": 5 },
        },
      ];
      registrarHistorico(novosLocais);
    }
  }

  function adicionarRegistro() {
    const tipoAlvo = prompt("Digite o tipo do local onde deseja adicionar produtos (Ex: tipo A, tipo B):");
    if (!tipoAlvo) return;
    const indice = locaisEstoque.findIndex((l) => l.tipo.toLowerCase() === tipoAlvo.toLowerCase());

    if (indice !== -1) {
      const nomeProduto = prompt("Nome do produto (Ex: Produto C):");
      const quantidadeProduto = prompt("Quantidade:");
      if (nomeProduto && quantidadeProduto !== null && quantidadeProduto.trim() !== "" && !isNaN(Number(quantidadeProduto))) {
        const novosLocais = structuredClone(locaisEstoque);
        novosLocais[indice].produtos[nomeProduto] = Number(quantidadeProduto);
        registrarHistorico(novosLocais);
      } else {
        alert("Dados inválidos!");
      }
    } else {
      alert("Local não encontrado!");
    }
  }

  function excluirLocal(indice: number) {
    if (confirm("Deseja realmente excluir este local e seus registros?")) {
      const novosLocais = locaisEstoque.filter((_, i) => i !== indice);
      registrarHistorico(novosLocais);
    }
  }

  function editarLocal(indice: number) {
    const novoTipo = prompt("Edite o tipo do local:", locaisEstoque[indice].tipo);
    if (novoTipo) {
      const novosLocais = structuredClone(locaisEstoque);
      novosLocais[indice].tipo = novoTipo;
      registrarHistorico(novosLocais);
    }
  }

  function manipularInicioArrasto(e: React.DragEvent<HTMLDivElement>, indice: number) {
    setIndiceArrastado(indice);
    e.dataTransfer.effectAllowed = "move";
  }

  function manipularSobreArrasto(e: React.DragEvent<HTMLDivElement>, indice: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (indice !== indiceArrastado) {
      setIndiceSobre(indice);
    }
  }

  function manipularSaidaArrasto() {
    setIndiceSobre(null);
  }

  function manipularSoltar(e: React.DragEvent<HTMLDivElement>, indiceAlvo: number) {
    e.stopPropagation();
    setIndiceSobre(null);

    if (indiceArrastado !== null && indiceArrastado !== indiceAlvo) {
      const novosLocais = [...locaisEstoque];
      const itemMovido = novosLocais.splice(indiceArrastado, 1)[0];
      novosLocais.splice(indiceAlvo, 0, itemMovido);
      registrarHistorico(novosLocais);
    }
  }

  function manipularFimArrasto() {
    setIndiceArrastado(null);
    setIndiceSobre(null);
  }

  return (
    <>
      <div className="absolute bottom-0 left-0 pointer-events-none opacity-20 transform -scale-x-100">
        <svg width="250" height="250" viewBox="0 0 200 200" fill="none">
          <path d="M20 180 C 60 140, 100 100, 180 20 M50 180 C 80 150, 120 120, 170 60" stroke="#8c5830" strokeWidth="3" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-20">
        <svg width="250" height="250" viewBox="0 0 200 200" fill="none">
          <path d="M20 180 C 60 140, 100 100, 180 20 M50 180 C 80 150, 120 120, 170 60" stroke="#8c5830" strokeWidth="3" />
        </svg>
      </div>

      {telaAtual === "login" && (
        <div id="screen-login" className="flex-1 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-bakery-card border border-bakery-border rounded-2xl shadow-xl p-8 max-w-xl w-full text-center relative">
            <div className="mx-auto mb-4 w-20 h-20 bg-[#f4e8dc] rounded-xl flex items-center justify-center border border-bakery-border shadow-inner">
              <i className="fa-solid fa-basket-shopping text-3xl text-bakery-primary"></i>
            </div>
            <h1 className="font-serif text-3xl font-bold text-bakery-primary mb-2">Sistema de Estoque da Padaria</h1>
            <div className="flex items-center justify-center gap-2 my-3 text-bakery-accent">
              <div className="h-[1px] bg-bakery-border w-16"></div>
              <i className="fa-solid fa-wheat-awn text-sm"></i>
              <div className="h-[1px] bg-bakery-border w-16"></div>
            </div>
            <p className="text-bakery-muted text-sm mb-8">Organize e acompanhe ingredientes, insumos e produtos com praticidade</p>
            <button
              onClick={abrirModalPin}
              className="inline-flex items-center justify-center gap-2 bg-[#9c5932] hover:bg-[#824522] text-white font-medium px-8 py-3 rounded-xl shadow-md transition-all duration-200 w-full max-w-xs text-base cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              Entrar
            </button>
          </div>
        </div>
      )}

      <ModalPin
        aberto={modalPinAberto}
        aoFechar={fecharModalPin}
        aoConfirmar={confirmarPin}
      />

      {telaAtual === "dashboard" && (
        <div id="screen-dashboard" className="flex flex-col min-h-screen">
          <header className="bg-bakery-card border-b border-bakery-border px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f4e8dc] rounded-lg flex items-center justify-center border border-bakery-border">
                <i className="fa-solid fa-basket-shopping text-bakery-primary"></i>
              </div>
              <div className="flex items-center gap-3 font-serif text-lg font-bold text-bakery-primary">
                <span>Sistema de Estoque</span>
                <span className="text-bakery-border font-normal">|</span>
                <span className="text-bakery-muted font-sans text-sm font-medium">Área de Trabalho</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-bakery-bg border border-bakery-border px-3 py-1.5 rounded-lg text-sm">
                <div className="w-7 h-7 bg-[#9c5932] text-white rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-user text-xs"></i>
                </div>
                <span className="font-medium">Administrador</span>
              </div>
            </div>
          </header>

          <div className="bg-bakery-card/60 border-b border-bakery-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={salvarEstado}
                title="Salvar alterações"
                className="w-9 h-9 bg-white border border-bakery-border rounded-lg flex items-center justify-center text-bakery-text hover:bg-bakery-bg transition shadow-2xs cursor-pointer"
              >
                <i className="fa-solid fa-floppy-disk"></i>
              </button>
              <button
                id="btn-undo"
                onClick={desfazer}
                disabled={historicoDesfazer.length === 0}
                title="Desfazer"
                className="w-9 h-9 bg-white border border-bakery-border rounded-lg flex items-center justify-center text-bakery-text hover:bg-bakery-bg transition shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-rotate-left"></i>
              </button>
              <button
                id="btn-redo"
                onClick={refazer}
                disabled={historicoRefazer.length === 0}
                title="Refazer"
                className="w-9 h-9 bg-white border border-bakery-border rounded-lg flex items-center justify-center text-bakery-text hover:bg-bakery-bg transition shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-rotate-right"></i>
              </button>
              <div className="h-5 w-[1px] bg-bakery-border mx-1"></div>
              <button
                onClick={adicionarLocal}
                className="inline-flex items-center gap-2 bg-[#9c5932] hover:bg-[#824522] text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-2xs cursor-pointer"
              >
                <i className="fa-solid fa-plus"></i> Adicionar Local
              </button>
            </div>
            {statusSalvoVisivel && (
              <span id="status-salvo" className="text-xs text-emerald-700 font-medium">
                <i className="fa-solid fa-check mr-1"></i> Alterações salvas
              </span>
            )}
          </div>

          <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1600px] w-full mx-auto">
            <section className="bg-bakery-card border border-bakery-border rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <i className="fa-solid fa-arrows-up-down-left-right text-bakery-primary"></i>
                <h2 className="font-serif font-bold text-lg text-bakery-primary">Layout de Armazenamento</h2>
              </div>
              <p className="text-xs text-bakery-muted mb-4">Organize os locais de armazenamento arrastando e soltando no grid.</p>

              <div id="layout-container" className="flex-1 grid-bg border border-bakery-border rounded-xl p-4 min-h-[450px] grid grid-cols-1 sm:grid-cols-2 gap-3 content-start overflow-y-auto">
                {locaisEstoque.map((local, indice) => (
                  <div
                    key={local.id}
                    draggable
                    onDragStart={(e) => manipularInicioArrasto(e, indice)}
                    onDragOver={(e) => manipularSobreArrasto(e, indice)}
                    onDragLeave={manipularSaidaArrasto}
                    onDrop={(e) => manipularSoltar(e, indice)}
                    onDragEnd={manipularFimArrasto}
                    className={`drag-item bg-white border border-bakery-border rounded-xl p-4 shadow-xs flex items-center justify-between select-none ${
                      indiceArrastado === indice ? "dragging" : ""
                    } ${indiceSobre === indice && indiceArrastado !== indice ? "drag-over" : ""}`}
                  >
                    <div className="flex items-center gap-3 pointer-events-none">
                      <div className="w-10 h-10 bg-[#f4e8dc] rounded-lg flex items-center justify-center border border-bakery-border">
                        <i className="fa-solid fa-grip-vertical text-bakery-primary"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{local.nome}</h4>
                        <span className="font-bold text-sm text-bakery-primary">{local.tipo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => excluirLocal(indice)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center border border-red-200 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                      <button
                        onClick={() => editarLocal(indice)}
                        className="w-8 h-8 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center border border-amber-200 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-bakery-primary font-medium">
                <i className="fa-solid fa-arrows-up-down-left-right"></i>
                <span>Arraste e solte os locais para organizar o layout.</span>
              </div>
            </section>

            <section className="bg-bakery-card border border-bakery-border rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-bakery-border">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-boxes-stacked text-bakery-primary"></i>
                  <h2 className="font-serif font-bold text-lg text-bakery-primary">Visão Geral do Estoque</h2>
                  <span className="text-bakery-border mx-1">|</span>
                  <span className="text-xs font-medium text-bakery-muted">
                    Total de produtos: <strong id="total-produtos">{totalProdutos.toLocaleString("pt-BR")}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 relative">
                  <div className="relative" ref={containerFiltroRef}>
                    <button
                      onClick={alternarMenuFiltro}
                      className="inline-flex items-center gap-1.5 bg-white border border-bakery-border px-3 py-1.5 rounded-lg text-xs font-medium text-bakery-text hover:bg-bakery-bg transition cursor-pointer"
                    >
                      <i className="fa-solid fa-filter text-bakery-muted"></i>
                      <span id="label-filtro">{rotulosFiltro[filtroAtual]}</span>
                      <i className="fa-solid fa-chevron-down text-[10px] ml-1"></i>
                    </button>
                    {menuFiltroAberto && (
                      <div id="menu-filtro" className="absolute right-0 mt-1 w-48 bg-white border border-bakery-border rounded-xl shadow-lg z-20 py-1 text-xs">
                        <button
                          onClick={() => aplicarFiltro("todos")}
                          className="w-full text-left px-4 py-2 hover:bg-bakery-bg transition flex items-center justify-between cursor-pointer"
                        >
                          <span>Mostrar todos</span>
                          <i className={`fa-solid fa-check text-bakery-primary filtro-check ${filtroAtual === "todos" ? "" : "hidden"}`}></i>
                        </button>
                        <button
                          onClick={() => aplicarFiltro("baixo_estoque")}
                          className="w-full text-left px-4 py-2 hover:bg-bakery-bg transition flex items-center justify-between cursor-pointer"
                        >
                          <span>Estoque baixo (&lt; 20 un)</span>
                          <i className={`fa-solid fa-check text-bakery-primary filtro-check ${filtroAtual === "baixo_estoque" ? "" : "hidden"}`}></i>
                        </button>
                        <button
                          onClick={() => aplicarFiltro("maior_volume")}
                          className="w-full text-left px-4 py-2 hover:bg-bakery-bg transition flex items-center justify-between cursor-pointer"
                        >
                          <span>Maior volume total</span>
                          <i className={`fa-solid fa-check text-bakery-primary filtro-check ${filtroAtual === "maior_volume" ? "" : "hidden"}`}></i>
                        </button>
                        <button
                          onClick={() => aplicarFiltro("alfabetico")}
                          className="w-full text-left px-4 py-2 hover:bg-bakery-bg transition flex items-center justify-between cursor-pointer"
                        >
                          <span>Ordem alfabética</span>
                          <i className={`fa-solid fa-check text-bakery-primary filtro-check ${filtroAtual === "alfabetico" ? "" : "hidden"}`}></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={adicionarRegistro}
                    className="inline-flex items-center gap-1.5 bg-[#9c5932] hover:bg-[#824522] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    <i className="fa-solid fa-plus"></i> Adicionar Registro
                  </button>
                </div>
              </div>

              <div id="estoque-container" className="flex-1 flex flex-col gap-3 overflow-y-auto">
                {listaFiltrada.map((local) => (
                  <div key={local.id} className="bg-white border border-bakery-border rounded-xl p-4 shadow-xs flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#f4e8dc] rounded-lg flex items-center justify-center border border-bakery-border mt-1">
                        <i className="fa-solid fa-basket-shopping text-bakery-primary"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-bakery-primary mb-2">
                          {local.nome} {local.tipo}
                        </h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                          {Object.entries(local.produtos).map(([produto, quantidade]) => (
                            <div key={produto} className="flex justify-between gap-4">
                              <span className="text-bakery-muted">{produto}:</span>
                              <span className={`font-semibold ${Number(quantidade) < 20 ? "text-red-600" : ""}`}>
                                {quantidade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => excluirLocal(local.indiceOriginal)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center border border-red-200 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                      <button
                        onClick={() => editarLocal(local.indiceOriginal)}
                        className="w-8 h-8 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center border border-amber-200 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}
    </>
  );
}
