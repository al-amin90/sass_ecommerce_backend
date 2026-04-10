import { Router } from "express";
import { categoryControllers } from "./product.controller";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { productValidations } from "./product.validation";

const router = Router();

router.post(
  "/",
  auth("admin"),
  validateRequest(productValidations.createProductSchema),
  categoryControllers.createCategory,
);
router.get("/", categoryControllers.getAllCategory);
router.get("/:id", categoryControllers.getSingleCategory);

router.patch(
  "/:id",
  auth("admin"),
  validateRequest(productValidations.updateProductSchema),
  categoryControllers.updateCategory,
);
router.delete("/:id", auth("admin"), categoryControllers.deleteCategory);

export const categoryRouter = router;
