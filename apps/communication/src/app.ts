import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { httpErrorHandler } from "@yesboss/errors";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.use("/api/chat", chatRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "communication" });
});

app.use(httpErrorHandler);

export default app;
