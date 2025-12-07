import { z } from "zod";

export const currentTickResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  currentTick: z.number().optional(),
  epoch: z.number().optional(),
  timestamp: z.number().optional(),
  error: z.string().optional(),
});

export type CurrentTickResult = z.infer<typeof currentTickResultSchema>;
