import { db } from "~/lib/firebase.server";

// GET /api/status — confirma que o servidor consegue falar com o Firestore.
// Útil para cada integrante testar se a chave local está configurada.
export async function loader() {
  try {
    await db.listCollections();
    return Response.json({ firestore: "ok" });
  } catch (erro) {
    console.error("Falha ao conectar no Firestore:", erro);
    return Response.json({ firestore: "erro" }, { status: 500 });
  }
}
