import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export async function getMyProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { participants: { some: { userId } } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProject(userId: string, title: string, description: string) {
  return prisma.project.create({
    data: { title, description, ownerId: userId },
  });
}

export async function getProjectById(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { participants: { include: { user: true } }, tasks: true },
  });
  if (!project) throw new AppError(404, "Événement introuvable");

  const isOwner = project.ownerId === userId;
  const isParticipant = project.participants.some((p) => p.userId === userId);
  if (!isOwner && !isParticipant) throw new AppError(403, "Accès non autorisé à cet événement");

  return project;
}

export async function updateProject(userId: string, projectId: string, title: string, description: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Événement introuvable");
  if (project.ownerId !== userId) throw new AppError(403, "Seul le propriétaire peut modifier l'événement");

  return prisma.project.update({
    where: { id: projectId },
    data: { title, description },
  });
}

export async function deleteProject(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Événement introuvable");
  if (project.ownerId !== userId) throw new AppError(403, "Seul le propriétaire peut supprimer l'événement");

  await prisma.project.delete({ where: { id: projectId } });
}