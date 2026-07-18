import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

async function assertIsOwner(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Événement introuvable");
  if (project.ownerId !== userId) {
    throw new AppError(403, "Seul le propriétaire peut gérer les participants");
  }
  return project;
}

export async function getParticipants(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { participants: { include: { user: true } } },
  });
  if (!project) throw new AppError(404, "Événement introuvable");

  const isOwner = project.ownerId === userId;
  const isParticipant = project.participants.some((p) => p.userId === userId);
  if (!isOwner && !isParticipant) throw new AppError(403, "Accès non autorisé à cet événement");

  return project.participants.map((p) => ({
    id: p.user.id,
    name: p.user.name,
    email: p.user.email,
  }));
}

export async function addParticipant(userId: string, projectId: string, email: string) {
  await assertIsOwner(userId, projectId);

  const userToAdd = await prisma.user.findUnique({ where: { email } });
  if (!userToAdd) throw new AppError(404, "Aucun utilisateur trouvé avec cet email");

  const existing = await prisma.projectParticipant.findUnique({
    where: { projectId_userId: { projectId, userId: userToAdd.id } },
  });
  if (existing) throw new AppError(409, "Cet utilisateur est déjà participant");

  await prisma.projectParticipant.create({
    data: { projectId, userId: userToAdd.id },
  });

  return { id: userToAdd.id, name: userToAdd.name, email: userToAdd.email };
}

export async function removeParticipant(userId: string, projectId: string, participantUserId: string) {
  await assertIsOwner(userId, projectId);

  const link = await prisma.projectParticipant.findUnique({
    where: { projectId_userId: { projectId, userId: participantUserId } },
  });
  if (!link) throw new AppError(404, "Ce participant n'est pas associé à cet événement");

  await prisma.projectParticipant.delete({
    where: { projectId_userId: { projectId, userId: participantUserId } },
  });
}