import { Router } from "express";
import * as ctrl from "../controllers/task.controller.js";
import { dualAuth, roleGuard } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/", dualAuth, ctrl.createTask);
router.get("/", dualAuth, ctrl.listTasks);
router.get("/:id", dualAuth, ctrl.getTask);
router.patch("/:id", dualAuth, ctrl.updateTask);
router.delete("/:id", dualAuth, roleGuard("admin"), ctrl.deleteTask);
router.patch("/:id/status", dualAuth, ctrl.updateTaskStatus);
router.post("/:id/assign", dualAuth, roleGuard("admin"), ctrl.assignTask);
router.post("/:id/unassign", dualAuth, roleGuard("admin"), ctrl.unassignTask);

export default router;
