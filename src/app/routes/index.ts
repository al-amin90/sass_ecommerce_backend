import { Router } from "express";

const router = Router();

const moduleRouters = [
  {
    path: "/admins",
    route: "adminRouter",
  },
  // {
  //   path: '/auth',
  //   route: authRouter,
  // },
];

moduleRouters.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
