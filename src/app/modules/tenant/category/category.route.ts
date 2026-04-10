import { Router } from "express";
import { categoryControllers } from "./category.controller";
import auth from "../../../middlewares/auth";

const router = Router();

router.post("/", auth("admin"), categoryControllers.createCategory);
router.get("/", auth("admin"), categoryControllers.getAllCategory);
router.get("/:id", categoryControllers.getSingleCategory);
router.patch("/:id", categoryControllers.updateCategory);
router.delete("/:id", categoryControllers.deleteCategory);

export const categoryRouter = router;
