import { Router } from "express";
import * as Ctrl from "../controllers/decompose.controller.js";
import { dualAuth } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/task", dualAuth, Ctrl.decomposeTask);

export default router;
