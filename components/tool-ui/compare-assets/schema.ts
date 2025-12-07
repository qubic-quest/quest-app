import { z } from "zod";

export const compareAssetsResultSchema = z.object({
  assets: z.array(
    z.object({
      asset_name: z.string(),
      total_trades: z.number(),
      total_volume: z.number(),
      unique_traders: z.number(),
      avg_price: z.number().nullable(),
      min_price: z.number().nullable(),
      max_price: z.number().nullable(),
      last_price: z.number().nullable(),
      last_trade_tick: z.number(),
      price_change_percent: z.number().nullable(),
    })
  ),
});

export type CompareAssetsResult = z.infer<typeof compareAssetsResultSchema>;
