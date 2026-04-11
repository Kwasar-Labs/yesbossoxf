import { Router } from "express";
import * as ctrl from "../controllers/assignment.controller.js";
import { dualAuth } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/", dualAuth, ctrl.assignTask);
router.delete("/", dualAuth, ctrl.unassignTask);
router.get("/mine", dualAuth, ctrl.listMyTasks);

export default router;
