import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  listTasksHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  updateTaskStatusHandler,
  assignTaskHandler,
} from "./task.controller";

// mergeParams permet de recuperer :projectId depuis la route parente
export const taskRouter = Router({ mergeParams: true });

taskRouter.get("/", asyncHandler(listTasksHandler));
taskRouter.post("/", asyncHandler(createTaskHandler));
taskRouter.put("/:taskId", asyncHandler(updateTaskHandler));
taskRouter.delete("/:taskId", asyncHandler(deleteTaskHandler));
taskRouter.patch("/:taskId/status", asyncHandler(updateTaskStatusHandler));
taskRouter.patch("/:taskId/assign", asyncHandler(assignTaskHandler));