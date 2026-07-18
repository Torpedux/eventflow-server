import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export async function register(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, "Un compte existe déjà avec cet email");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  return { id: user.id, email: user.email, name: user.name };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(401, "Identifiants invalides");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError(401, "Identifiants invalides");

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}