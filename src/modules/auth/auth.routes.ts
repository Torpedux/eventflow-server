import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerHandler, loginHandler } from "./auth.controller";

export const authRouter = Router();
authRouter.post("/register", asyncHandler(registerHandler));
authRouter.post("/login", asyncHandler(loginHandler));