import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  listParticipantsHandler,
  addParticipantHandler,
  removeParticipantHandler,
} from "./participant.controller";

export const participantRouter = Router({ mergeParams: true });

participantRouter.get("/", asyncHandler(listParticipantsHandler));
participantRouter.post("/", asyncHandler(addParticipantHandler));
participantRouter.delete("/:userId", asyncHandler(removeParticipantHandler));