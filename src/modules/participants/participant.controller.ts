import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as participantService from "./participant.service";

const addParticipantSchema = z.object({ email: z.string().email() });

export async function listParticipantsHandler(req: AuthRequest, res: Response) {
  const projectId = req.params.projectId as string;
  const participants = await participantService.getParticipants(req.userId!, projectId);
  res.json(participants);
}

export async function addParticipantHandler(req: AuthRequest, res: Response) {
  const data = addParticipantSchema.parse(req.body);
  const projectId = req.params.projectId as string;
  const participant = await participantService.addParticipant(req.userId!, projectId, data.email);
  res.status(201).json(participant);
}

export async function removeParticipantHandler(req: AuthRequest, res: Response) {
  const projectId = req.params.projectId as string;
  const participantUserId = req.params.userId as string;
  await participantService.removeParticipant(req.userId!, projectId, participantUserId);
  res.status(204).send();
}