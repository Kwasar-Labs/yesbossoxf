import { Router } from "express";
import * as ctrl from "../controllers/team.controller.js";
import { authGuard } from "../middlewares/auth-guard.js";
import { roleGuard } from "../middlewares/role-guard.js";
import { UserRole } from "@yesboss/types";

const router = Router();

router.get("/", authGuard, ctrl.listTeams);
router.post("/", authGuard, roleGuard(UserRole.ADMIN), ctrl.createTeam);
router.get("/:id", authGuard, ctrl.getTeam);
router.patch("/:id", authGuard, roleGuard(UserRole.ADMIN), ctrl.updateTeam);
router.post("/:id/members", authGuard, roleGuard(UserRole.ADMIN), ctrl.addTeamMember);
router.delete("/:id/members", authGuard, roleGuard(UserRole.ADMIN), ctrl.removeTeamMember);

export default router;
