import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { categoryRouter } from "../modules/category/category.route";

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
];

moduleRouters.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
