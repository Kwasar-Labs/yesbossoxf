import { Router } from "express";
import * as ctrl from "../controllers/organization.controller.js";
import { authGuard } from "../middlewares/auth-guard.js";
import { roleGuard } from "../middlewares/role-guard.js";
import { UserRole } from "@yesboss/types";

const router = Router();

router.get("/", authGuard, ctrl.listOrgs);
router.get("/:id", authGuard, ctrl.getOrg);
router.post("/", authGuard, roleGuard(UserRole.ADMIN), ctrl.createOrg);
router.patch("/:id", authGuard, roleGuard(UserRole.ADMIN), ctrl.updateOrg);

export default router;
