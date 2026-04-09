import { Router } from "express";
import { categoryControllers } from "./category.controller";

const router = Router();

router.post("/", categoryControllers.createCategory);
router.get("/", categoryControllers.getAllCategory);
router.get("/:id", categoryControllers.getSingleCategory);
router.patch("/:id", categoryControllers.updateCategory);
router.delete("/:id", categoryControllers.deleteCategory);

export const categoryRouter = router;
