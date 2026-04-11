import { Router } from "express";
import * as ctrl from "../controllers/user.controller.js";
import { authGuard, apiKeyGuard, dualAuth } from "../middlewares/auth-guard.js";
import { roleGuard } from "../middlewares/role-guard.js";
import { UserRole } from "@yesboss/types";

const router = Router();

router.get("/", authGuard, roleGuard(UserRole.ADMIN), ctrl.listUsers);
router.post("/", authGuard, roleGuard(UserRole.ADMIN), ctrl.createUser);
router.get("/by-phone/:e164", apiKeyGuard, ctrl.getUserByPhone);
router.get("/:id", dualAuth, ctrl.getUser);
router.patch("/:id", authGuard, roleGuard(UserRole.ADMIN), ctrl.updateUser);
router.delete("/:id", authGuard, roleGuard(UserRole.ADMIN), ctrl.deactivateUser);

export default router;
