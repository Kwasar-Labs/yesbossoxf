import { Router } from "express";
import * as Ctrl from "../controllers/session.controller.js";
import { dualAuth } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/turn", dualAuth, Ctrl.appendTurn);
router.post("/intent", dualAuth, Ctrl.setIntent);
router.post("/confirmation", dualAuth, Ctrl.setConfirmation);
router.get("/:phone", dualAuth, Ctrl.getSession);
router.delete("/:phone", dualAuth, Ctrl.clearSession);

export default router;
