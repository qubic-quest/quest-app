import { z } from "zod";

export const walletPortfolioResultSchema = z.object({
  walletId: z.string(),
  qubicBalance: z.number().nullable(),
  assets: z.array(
    z.object({
      asset_name: z.string(),
      total_bought: z.number(),
      total_sold: z.number(),
      net_shares: z.number(),
      avg_buy_price: z.number().nullable(),
      avg_sell_price: z.number().nullable(),
      last_trade_price: z.number().nullable(),
      last_trade_tick: z.number(),
      trade_count: z.number(),
    })
  ),
});

export type WalletPortfolioResult = z.infer<typeof walletPortfolioResultSchema>;
