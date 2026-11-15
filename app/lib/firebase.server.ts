import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type Credential,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Este arquivo termina em ".server.ts": o React Router garante que ele nunca
// entra no bundle do navegador. Use `db` apenas em loaders, actions e rotas de API.

function credencial(): Credential {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (json) return cert(JSON.parse(json));

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();

  throw new Error(
    "Credenciais do Firebase não configuradas. Copie .env.example para .env e " +
      "coloque o JSON da conta de serviço na raiz como serviceAccountKey.json.",
  );
}

// O servidor de desenvolvimento recarrega este módulo a cada alteração;
// reaproveitar o app evita o erro "app already exists".
const app = getApps().length ? getApp() : initializeApp({ credential: credencial() });

export const db = getFirestore(app);
