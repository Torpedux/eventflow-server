import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: true, message: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: true, message: "Erreur interne du serveur" });
}