import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { TaskStatus } from "@prisma/client";

// Verifie que l'utilisateur a acces au projet (owner ou participant)
async function assertProjectAccess(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { participants: true },
  });
  if (!project) throw new AppError(404, "Événement introuvable");

  const isOwner = project.ownerId === userId;
  const isParticipant = project.participants.some((p) => p.userId === userId);
  if (!isOwner && !isParticipant) throw new AppError(403, "Accès non autorisé à cet événement");

  return project;
}

export async function getTasks(userId: string, projectId: string, status?: TaskStatus) {
  await assertProjectAccess(userId, projectId);

  return prisma.task.findMany({
    where: { projectId, ...(status ? { status } : {}) },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTask(
  userId: string,
  projectId: string,
  title: string,
  description: string
) {
  await assertProjectAccess(userId, projectId);

  return prisma.task.create({
    data: { title, description, projectId },
  });
}

async function getTaskOrThrow(projectId: string, taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== projectId) throw new AppError(404, "Tâche introuvable");
  return task;
}

export async function updateTask(
  userId: string,
  projectId: string,
  taskId: string,
  title: string,
  description: string
) {
  await assertProjectAccess(userId, projectId);
  await getTaskOrThrow(projectId, taskId);

  return prisma.task.update({
    where: { id: taskId },
    data: { title, description },
  });
}

export async function deleteTask(userId: string, projectId: string, taskId: string) {
  await assertProjectAccess(userId, projectId);
  await getTaskOrThrow(projectId, taskId);

  await prisma.task.delete({ where: { id: taskId } });
}

export async function updateTaskStatus(
  userId: string,
  projectId: string,
  taskId: string,
  status: TaskStatus
) {
  await assertProjectAccess(userId, projectId);
  await getTaskOrThrow(projectId, taskId);

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
}

export async function assignTask(
  userId: string,
  projectId: string,
  taskId: string,
  assignedUserId: string | null
) {
  const project = await assertProjectAccess(userId, projectId);
  await getTaskOrThrow(projectId, taskId);

  // Desassignation : pas de verification de participant necessaire
  if (assignedUserId === null) {
    return prisma.task.update({
      where: { id: taskId },
      data: { assignedUserId: null },
    });
  }

  // L'utilisateur assigne doit etre owner ou participant du projet
  const isOwner = project.ownerId === assignedUserId;
  const isParticipant = project.participants.some((p) => p.userId === assignedUserId);
  if (!isOwner && !isParticipant) {
    throw new AppError(400, "Cet utilisateur n'est pas participant de l'événement");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { assignedUserId },
  });
}