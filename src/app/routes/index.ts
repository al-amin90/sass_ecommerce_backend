import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { categoryRouter } from "../modules/tenant/category/category.route";
import { colorRouter } from "../modules/tenant/color/color.route";

const router = Router();

const moduleRouters = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/category",
    route: categoryRouter,
  },
  {
    path: "/color",
    route: colorRouter,
  },
];

moduleRouters.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
