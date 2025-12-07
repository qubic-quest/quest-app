import { z } from "zod";

export const tickInfoSchema = z.object({
  tick_number: z.number(),
  timestamp: z.number().nullable(),
  epoch: z.number().nullable(),
  transaction_count: z.number(),
  fetched_at: z.number().nullable().optional(),
  qx_count: z.number(),
  qearn_count: z.number(),
  ccf_count: z.number(),
  qbay_count: z.number(),
  heartbeat_count: z.number(),
  user_count: z.number(),
});

const transactionSchema = z.object({
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

export const tickInfoResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  tick: tickInfoSchema.nullable(),
  transactions: z.array(transactionSchema).optional(),
  error: z.string().optional(),
});

export const databaseStatsResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  stats: z.object({
    totalTransactions: z.number(),
    totalTicks: z.number(),
    tickRange: z.string(),
  }).optional(),
  error: z.string().optional(),
});

export type TickInfo = z.infer<typeof tickInfoSchema>;
export type TickInfoResult = z.infer<typeof tickInfoResultSchema>;
export type DatabaseStatsResult = z.infer<typeof databaseStatsResultSchema>;
