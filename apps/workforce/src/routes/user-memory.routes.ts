import { Router } from "express";
import * as Ctrl from "../controllers/user-memory.controller.js";
import { dualAuth } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/", dualAuth, Ctrl.upsertMemory);
router.post("/recent", dualAuth, Ctrl.pushRecent);
router.post("/skills", dualAuth, Ctrl.addSkill);
router.get("/:userId", dualAuth, Ctrl.getMemory);

export default router;
