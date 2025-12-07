import { z } from "zod";

export const qearnTransactionSchema = z.object({
  tx_id: z.string(),
  tick: z.number(),
  from: z.string(),
  event: z.string(),
  amount: z.number(),
  locked_epoch: z.number().nullable(),
});

export const qearnTableResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  count: z.number(),
  transactions: z.array(qearnTransactionSchema),
  filters: z.object({
    event: z.string().optional(),
    limit: z.number().optional(),
  }).optional(),
  error: z.string().optional(),
});

export type QEARNTransaction = z.infer<typeof qearnTransactionSchema>;
export type QEARNTableResult = z.infer<typeof qearnTableResultSchema>;
