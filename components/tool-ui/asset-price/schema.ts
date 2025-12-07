import { z } from "zod";

export const assetPriceResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  assetName: z.string(),
  priceInQubic: z.number().nullable(),
  priceInUSD: z.number().nullable(),
  qubicPriceUSD: z.number().nullable(),
  lastTradeEvent: z.enum(["Buy", "Sell"]).nullable(),
  lastTradeTick: z.number().nullable(),
  lastTradeTimestamp: z.number().nullable(),
  volume24h: z.number().optional(),
  trades24h: z.number().optional(),
  error: z.string().optional(),
});

export type AssetPriceResult = z.infer<typeof assetPriceResultSchema>;
