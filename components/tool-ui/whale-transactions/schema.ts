import { z } from "zod";

export const whaleTransactionSchema = z.object({
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

export const whaleTransactionsResultSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["information", "decision", "control", "state", "composite"]).optional(),
  success: z.boolean(),
  count: z.number(),
  minAmount: z.number(),
  totalValue: z.number(),
  largestAmount: z.number(),
  transactions: z.array(whaleTransactionSchema),
  filters: z.object({
    limit: z.number().optional(),
    category: z.string().optional(),
    minAmount: z.number().optional(),
  }).optional(),
  error: z.string().optional(),
});

export type WhaleTransactionsResult = z.infer<typeof whaleTransactionsResultSchema>;
export type WhaleTransaction = z.infer<typeof whaleTransactionSchema>;
