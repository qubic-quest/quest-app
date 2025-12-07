import { z } from "zod";

export const marketOverviewResultSchema = z.object({
  total_assets: z.number(),
  total_trades: z.number(),
  total_volume_qubic: z.number(),
  unique_traders: z.number(),
  most_traded_asset: z.string().nullable(),
  most_traded_count: z.number(),
  latest_tick: z.number(),
});

export type MarketOverviewResult = z.infer<typeof marketOverviewResultSchema>;
