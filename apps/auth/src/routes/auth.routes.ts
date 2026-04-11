import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import { authGuard } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/login", ctrl.login);
router.post("/register", ctrl.register);
router.get("/me", authGuard, ctrl.getMe);

export default router;
