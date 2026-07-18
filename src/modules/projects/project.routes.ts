import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  listProjectsHandler,
  createProjectHandler,
  getProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from "./project.controller";

export const projectRouter = Router();
projectRouter.get("/", asyncHandler(listProjectsHandler));
projectRouter.post("/", asyncHandler(createProjectHandler));
projectRouter.get("/:id", asyncHandler(getProjectHandler));
projectRouter.put("/:id", asyncHandler(updateProjectHandler));
projectRouter.delete("/:id", asyncHandler(deleteProjectHandler));