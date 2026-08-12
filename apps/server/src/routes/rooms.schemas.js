import { z } from "zod";

export const createRoomSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es muy corto"),
  slug: z.string().trim().toLowerCase().optional(),
});

export const updateRoomSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es muy corto").optional(),
  configActual: z.record(z.string(), z.any()).optional(),
});