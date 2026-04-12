import { Router } from "express";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { productValidations } from "./product.validation";
import { productControllers } from "./product.controller";
import { upload } from "../../../middlewares/multer";

const router = Router();

// ── Product routes ──
router.post(
  "/",
  auth("admin"),
  upload.array("images", 10),
  validateRequest(productValidations.createProductSchema),
  productControllers.createProduct,
);
router.get("/", productControllers.getAllProducts);

router.get("/slug/:slug", productControllers.getProductBySlug);

router.get("/:id", productControllers.getSingleProduct);

router.patch(
  "/:id",
  auth("admin"),
  validateRequest(productValidations.updateProductSchema),
  productControllers.updateProduct,
);

router.delete("/:id", auth("admin"), productControllers.deleteProduct);

// ── Variant routes ──
router.post(
  "/:id/variants",
  auth("admin"),
  validateRequest(productValidations.updateVariantSchema),
  productControllers.addVariant,
);

router.patch(
  "/:id/variants/:variantId",
  auth("admin"),
  validateRequest(productValidations.updateVariantSchema),
  productControllers.updateVariant,
);

router.delete(
  "/:id/variants/:variantId",
  auth("admin"),
  productControllers.deleteVariant,
);

// ── Stock check route ──
router.post("/check-stock", productControllers.checkStock);

export const productRouter = router;
