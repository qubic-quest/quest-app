import { z } from "zod";

export const transactionSchema = z.object({
  tx_id: z.string(),
  tick: z.number(),
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  category: z.string(),
  contract: z.string().nullable(),
  event: z.string().nullable(),
  summary: z.string().nullable(),
});

export const transactionTableResultSchema = z.object({
  id: z.string().optional().describe("Unique identifier for this tool UI rendering"),
  role: z.enum(["information", "decision", "control", "state", "composite"]).optional().describe("The primary purpose of this UI"),
  success: z.boolean(),
  count: z.number(),
  transactions: z.array(transactionSchema),
  filters: z.object({
    limit: z.number().optional(),
    category: z.string().optional(),
    contract: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

export type TransactionTableResult = z.infer<typeof transactionTableResultSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
