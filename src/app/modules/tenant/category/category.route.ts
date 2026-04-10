import { Router } from "express";
import { categoryControllers } from "./category.controller";
import auth from "../../../middlewares/auth";

const router = Router();

router.post("/", auth("admin"), categoryControllers.createCategory);
router.get("/", auth("admin"), categoryControllers.getAllCategory);
router.get("/:id", auth("admin"), categoryControllers.getSingleCategory);
router.patch("/:id", auth("admin"), categoryControllers.updateCategory);
router.delete("/:id", auth("admin"), categoryControllers.deleteCategory);

export const categoryRouter = router;
