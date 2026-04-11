import { Router } from "express";
import * as ctrl from "../controllers/chat.controller.js";
import * as insightsCtrl from "../controllers/insights.controller.js";
import { authGuard } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/", authGuard, ctrl.chat);
router.get("/insights", authGuard, insightsCtrl.getInsights);

export default router;
