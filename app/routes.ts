import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/status", "routes/api.status.ts"),
] satisfies RouteConfig;
