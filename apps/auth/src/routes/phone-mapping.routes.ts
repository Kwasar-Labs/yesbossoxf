import { Router } from "express";
import * as ctrl from "../controllers/phone-mapping.controller.js";
import { authGuard, apiKeyGuard } from "../middlewares/auth-guard.js";
import { roleGuard } from "../middlewares/role-guard.js";
import { UserRole } from "@yesboss/types";

const router = Router();

router.post("/", authGuard, roleGuard(UserRole.ADMIN), ctrl.createMapping);
router.get("/:e164", apiKeyGuard, ctrl.getMappingByPhone);
router.delete("/:e164", authGuard, roleGuard(UserRole.ADMIN), ctrl.deleteMapping);
router.get("/", authGuard, roleGuard(UserRole.ADMIN), ctrl.listMappings);

export default router;
