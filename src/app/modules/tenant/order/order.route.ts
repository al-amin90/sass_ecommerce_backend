import { Router } from "express";

import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";

import { orderController } from "./order.controller";
import { orderValidations } from "./order.validation";

const router = Router();

router.post(
  "/",
  validateRequest(orderValidations.createOrderSchema),
  orderController.createOrder,
);

export const orderRouter = router;
