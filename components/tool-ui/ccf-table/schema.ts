import { z } from "zod";

export const ccfTransactionSchema = z.object({
  tx_id: z.string(),
  tick: z.number(),
  from: z.string(),
  event: z.string(),
  proposal_type: z.number().nullable(),
  epoch: z.number().nullable(),
  url: z.string().nullable(),
  transfer_amount: z.number().nullable(),
  proposal_index: z.number().nullable(),
  vote_text: z.string().nullable(),
});

export const ccfTableResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  count: z.number(),
  transactions: z.array(ccfTransactionSchema),
  filters: z.object({
    event: z.string().optional(),
    limit: z.number().optional(),
  }).optional(),
  error: z.string().optional(),
});

export type CCFTransaction = z.infer<typeof ccfTransactionSchema>;
export type CCFTableResult = z.infer<typeof ccfTableResultSchema>;
