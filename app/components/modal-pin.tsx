import { useState, useRef, useEffect } from "react";

interface PropriedadesModalPin {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
}

export default function ModalPin({ aberto, aoFechar, aoConfirmar }: PropriedadesModalPin) {
  const [digitosPin, setDigitosPin] = useState(["", "", "", "", ""]);
  const entradasRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (aberto) {
      setDigitosPin(["", "", "", "", ""]);
      setTimeout(() => {
        entradasRef.current[0]?.focus();
      }, 50);
    }
  }, [aberto]);

  if (!aberto) return null;

  function manipularEntrada(valor: string, indice: number) {
    const ultimoCaractere = valor.slice(-1);
    const novosDigitos = [...digitosPin];
    novosDigitos[indice] = ultimoCaractere;
    setDigitosPin(novosDigitos);

    if (ultimoCaractere && indice < 4) {
      entradasRef.current[indice + 1]?.focus();
    }
  }

  function manipularTecla(evento: React.KeyboardEvent<HTMLInputElement>, indice: number) {
    if (evento.key === "Backspace" && !digitosPin[indice] && indice > 0) {
      entradasRef.current[indice - 1]?.focus();
    } else if (evento.key === "Enter") {
      aoConfirmar();
    }
  }

  return (
    <div id="modal-pin" className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bakery-card border border-bakery-border rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
        <button
          onClick={aoFechar}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f4e8dc] hover:bg-bakery-border flex items-center justify-center text-bakery-text transition cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
        <div className="mx-auto mb-3 w-16 h-16 bg-[#f4e8dc] rounded-xl flex items-center justify-center border border-bakery-border">
          <i className="fa-solid fa-basket-shopping text-2xl text-bakery-primary"></i>
        </div>
        <h3 className="font-serif text-2xl font-bold text-bakery-primary mb-6">Insira o PIN para continuar</h3>
        <div className="flex justify-center gap-3 mb-8" id="pin-inputs">
          {digitosPin.map((digito, indice) => (
            <input
              key={indice}
              ref={(elemento) => {
                entradasRef.current[indice] = elemento;
              }}
              type="password"
              maxLength={1}
              value={digito}
              onChange={(e) => manipularEntrada(e.target.value, indice)}
              onKeyDown={(e) => manipularTecla(e, indice)}
              className="pin-box w-12 h-12 text-center text-xl font-bold border-2 border-bakery-border rounded-xl bg-white focus:border-bakery-primary outline-none shadow-sm"
            />
          ))}
        </div>
        <button
          onClick={aoConfirmar}
          className="inline-flex items-center justify-center gap-2 bg-[#9c5932] hover:bg-[#824522] text-white font-medium px-6 py-3 rounded-xl shadow-md transition-all duration-200 w-full cursor-pointer"
        >
          <i className="fa-solid fa-lock"></i>
          Confirmar PIN
        </button>
      </div>
    </div>
  );
}
