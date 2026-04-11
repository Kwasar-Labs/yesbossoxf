import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { httpErrorHandler } from "@yesboss/errors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes from "./routes/organization.routes.js";
import teamRoutes from "./routes/team.routes.js";
import phoneMappingRoutes from "./routes/phone-mapping.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/organizations", orgRoutes);
app.use("/teams", teamRoutes);
app.use("/phone-mappings", phoneMappingRoutes);

app.use(httpErrorHandler);

export default app;
