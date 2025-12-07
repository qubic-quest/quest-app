import { z } from "zod";

export const qbayTransactionSchema = z.object({
  tx_id: z.string(),
  tick: z.number(),
  from: z.string(),
  event: z.string(),
  nft_id: z.number().nullable(),
  collection_id: z.number().nullable(),
  price: z.number().nullable(),
  payment_method: z.number().nullable(),
  volume: z.number().nullable(),
  uri: z.string().nullable(),
});

export const qbayTableResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  count: z.number(),
  transactions: z.array(qbayTransactionSchema),
  filters: z.object({
    event: z.string().optional(),
    limit: z.number().optional(),
  }).optional(),
  error: z.string().optional(),
});

export type QBAYTransaction = z.infer<typeof qbayTransactionSchema>;
export type QBAYTableResult = z.infer<typeof qbayTableResultSchema>;
