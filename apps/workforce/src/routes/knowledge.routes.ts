import { Router } from "express";
import * as Ctrl from "../controllers/knowledge.controller.js";

const router = Router();

router.post("/", Ctrl.createFact);
router.get("/search", Ctrl.searchFacts);
router.get("/:id", Ctrl.getFact);
router.patch("/:id", Ctrl.updateFact);
router.delete("/:id", Ctrl.deleteFact);

export default router;