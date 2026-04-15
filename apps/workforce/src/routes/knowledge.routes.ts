import { Router } from "express";
import * as Ctrl from "../controllers/knowledge.controller.js";
import { dualAuth } from "../middlewares/auth-guard.js";

const router = Router();

router.post("/", dualAuth, Ctrl.createFact);
router.get("/search", dualAuth, Ctrl.searchFacts);
router.post("/backfill-embeddings", dualAuth, Ctrl.backfillEmbeddings);
router.get("/:id", dualAuth, Ctrl.getFact);
router.patch("/:id", dualAuth, Ctrl.updateFact);
router.delete("/:id", dualAuth, Ctrl.deleteFact);

export default router;