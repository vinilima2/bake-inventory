import type { Route } from "./+types/home";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "BakeInventory - Seja bem vindo" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Login() {
  return <></>;
}
