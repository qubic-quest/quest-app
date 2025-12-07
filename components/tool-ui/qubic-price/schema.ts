import { z } from "zod";

export const qubicPriceResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  currentPrice: z.number().nullable(),
  priceChange24h: z.number().nullable(),
  priceChangePercentage24h: z.number().nullable(),
  marketCap: z.number().nullable(),
  volume24h: z.number().nullable(),
  priceHistory: z.array(z.object({
    timestamp: z.number(),
    price: z.number(),
  })).optional(),
  error: z.string().optional(),
});

export type QubicPriceResult = z.infer<typeof qubicPriceResultSchema>;
