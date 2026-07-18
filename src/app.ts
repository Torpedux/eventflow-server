import { authRouter } from "./modules/auth/auth.routes";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Les routes des modules seront montées ici (etape suivante)

app.use("/api/auth", authRouter);
app.use(errorHandler);