import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "./auth.service";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string() });

export async function registerHandler(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const user = await authService.register(data.email, data.password, data.name);
  res.status(201).json(user);
}

export async function loginHandler(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const result = await authService.login(data.email, data.password);
  res.json(result);
}