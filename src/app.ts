import { taskRouter } from "./modules/tasks/task.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { projectRouter } from "./modules/projects/project.routes";
import { authRouter } from "./modules/auth/auth.routes";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Les routes des modules seront montées ici

app.use("/api/auth", authRouter);
app.use("/api/projects", authMiddleware, projectRouter);
app.use("/api/projects/:projectId/tasks", authMiddleware, taskRouter);
app.use(errorHandler);