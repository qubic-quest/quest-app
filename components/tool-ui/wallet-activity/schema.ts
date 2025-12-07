import { z } from "zod";

export const walletActivitySchema = z.object({
  address_id: z.string(),
  first_seen_tick: z.number(),
  first_seen_timestamp: z.number(),
  address_type: z.string(),
  label: z.string().nullable(),
  tx_count: z.number(),
  last_active_tick: z.number(),
});

export const walletActivityResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  wallet: walletActivitySchema.nullable(),
  transactions: z.array(z.object({
    tx_id: z.string(),
    tick: z.number(),
    from: z.string(),
    to: z.string(),
    amount: z.number(),
    category: z.string(),
    summary: z.string().nullable(),
  })).optional(),
  error: z.string().optional(),
});

export type WalletActivity = z.infer<typeof walletActivitySchema>;
export type WalletActivityResult = z.infer<typeof walletActivityResultSchema>;
