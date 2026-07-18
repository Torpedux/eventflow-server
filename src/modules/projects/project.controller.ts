import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as projectService from "./project.service";

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export async function listProjectsHandler(req: AuthRequest, res: Response) {
  const projects = await projectService.getMyProjects(req.userId!);
  res.json(projects);
}

export async function createProjectHandler(req: AuthRequest, res: Response) {
  const data = projectSchema.parse(req.body);
  const project = await projectService.createProject(req.userId!, data.title, data.description);
  res.status(201).json(project);
}

export async function getProjectHandler(req: AuthRequest, res: Response) {
  const project = await projectService.getProjectById(req.userId!, req.params.id as string);
  res.json(project);
}

export async function updateProjectHandler(req: AuthRequest, res: Response) {
  const data = projectSchema.parse(req.body);
  const project = await projectService.updateProject(
    req.userId!,
    req.params.id as string,
    data.title,
    data.description
  );
  res.json(project);
}

export async function deleteProjectHandler(req: AuthRequest, res: Response) {
  await projectService.deleteProject(req.userId!, req.params.id as string);
  res.status(204).send();
}