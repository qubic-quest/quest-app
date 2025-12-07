import { z } from "zod";

export const assetTradeSchema = z.object({
  tx_id: z.string(),
  tick: z.number(),
  from: z.string(),
  event: z.string(),
  asset: z.string(),
  price: z.number().nullable(),
  shares: z.number().nullable(),
});

export const assetTradesResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  count: z.number(),
  trades: z.array(assetTradeSchema),
  filters: z.object({
    assetName: z.string().optional(),
    limit: z.number().optional(),
    event: z.string().optional(),
  }).optional(),
  analysis: z.string().optional(),
  error: z.string().optional(),
});

export type AssetTrade = z.infer<typeof assetTradeSchema>;
export type AssetTradesResult = z.infer<typeof assetTradesResultSchema>;
