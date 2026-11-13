import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("testes-firebase", "routes/testes-firebase.tsx") // testes para auxílio na conexão com o Firebase
] satisfies RouteConfig;
