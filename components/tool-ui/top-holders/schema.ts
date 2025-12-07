import { z } from "zod";

export const topHolderSchema = z.object({
  address_id: z.string(),
  address_short: z.string(),
  balance: z.number().nullable(),
  balance_status: z.enum(["loaded", "loading", "error"]),
  tx_count: z.number(),
  first_seen_tick: z.number(),
  last_active_tick: z.number(),
});

export const topHoldersResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  count: z.number(),
  holders: z.array(topHolderSchema),
  analysis: z.string().optional(),
  error: z.string().optional(),
});

export type TopHolder = z.infer<typeof topHolderSchema>;
export type TopHoldersResult = z.infer<typeof topHoldersResultSchema>;
