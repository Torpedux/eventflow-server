import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as taskService from "./task.service";
import { TaskStatus } from "@prisma/client";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const statusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export async function listTasksHandler(req: AuthRequest, res: Response) {
  const projectId = req.params.projectId as string;
  const statusQuery = req.query.status as TaskStatus | undefined;

  if (statusQuery && !Object.values(TaskStatus).includes(statusQuery)) {
    return res.status(400).json({ error: true, message: "Statut invalide" });
  }

  const tasks = await taskService.getTasks(req.userId!, projectId, statusQuery);
  res.json(tasks);
}

export async function createTaskHandler(req: AuthRequest, res: Response) {
  const data = taskSchema.parse(req.body);
  const projectId = req.params.projectId as string;
  const task = await taskService.createTask(req.userId!, projectId, data.title, data.description);
  res.status(201).json(task);
}

export async function updateTaskHandler(req: AuthRequest, res: Response) {
  const data = taskSchema.parse(req.body);
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;
  const task = await taskService.updateTask(req.userId!, projectId, taskId, data.title, data.description);
  res.json(task);
}

export async function deleteTaskHandler(req: AuthRequest, res: Response) {
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;
  await taskService.deleteTask(req.userId!, projectId, taskId);
  res.status(204).send();
}

export async function updateTaskStatusHandler(req: AuthRequest, res: Response) {
  const data = statusSchema.parse(req.body);
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;
  const task = await taskService.updateTaskStatus(req.userId!, projectId, taskId, data.status);
  res.json(task);
}