import { Router } from "express";
import * as ctrl from "../controllers/project.controller.js";
import { dualAuth, roleGuard } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/", dualAuth, roleGuard("admin"), ctrl.createProject);
router.get("/", dualAuth, ctrl.listProjects);
router.get("/:id", dualAuth, ctrl.getProject);
router.patch("/:id", dualAuth, roleGuard("admin"), ctrl.updateProject);
router.delete("/:id", dualAuth, roleGuard("admin"), ctrl.deleteProject);

export default router;
