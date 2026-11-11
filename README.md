# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Firebase (banco de dados)

O app usa o Cloud Firestore pelo Admin SDK, só no servidor. Para rodar localmente:

1. Peça a um integrante o JSON da conta de serviço (ou gere o seu em Console do
   Firebase > Configurações do projeto > Contas de serviço) e salve na raiz do
   projeto como `serviceAccountKey.json`.
2. Copie `.env.example` para `.env`.
3. Com `npm run dev` rodando, abra `http://localhost:5173/api/status`. A resposta
   deve ser `{"firestore":"ok"}`.

`serviceAccountKey.json` e `.env` estão no `.gitignore`: **nunca** envie esses
arquivos para o GitHub nem para o grupo em canais públicos.

No código, importe `db` de `~/lib/firebase.server` ou as funções de
`~/lib/dados.server` apenas dentro de `loader`/`action`. Os tipos das entidades
ficam em `~/lib/tipos`.

Em produção (`npm run start`) o `.env` não é lido automaticamente: defina
`GOOGLE_APPLICATION_CREDENTIALS` ou `FIREBASE_SERVICE_ACCOUNT` no ambiente.

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
