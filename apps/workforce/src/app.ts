import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { httpErrorHandler } from "@yesboss/errors";
import taskRoutes from "./routes/task.routes.js";
import projectRoutes from "./routes/project.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import knowledgeRoutes from "./routes/knowledge.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/knowledge", knowledgeRoutes);

app.use(httpErrorHandler);

export default app;
