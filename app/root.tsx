import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen text-bakery-text flex flex-col justify-between overflow-x-hidden relative">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let mensagem = "Ops!";
  let detalhes = "Ocorreu um erro inesperado.";
  let rastreamento: string | undefined;

  if (isRouteErrorResponse(error)) {
    mensagem = error.status === 404 ? "404" : "Erro";
    detalhes =
      error.status === 404
        ? "A página solicitada não foi encontrada."
        : error.statusText || detalhes;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    detalhes = error.message;
    rastreamento = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{mensagem}</h1>
      <p>{detalhes}</p>
      {rastreamento && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{rastreamento}</code>
        </pre>
      )}
    </main>
  );
}
