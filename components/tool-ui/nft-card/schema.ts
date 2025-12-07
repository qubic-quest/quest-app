import { z } from "zod";

export const nftMetadataSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  uri: z.string().nullable(),
  metadata: z.array(z.object({
    value: z.string(),
    trait_type: z.string(),
  })),
  creatorId: z.string(),
  ownerId: z.string(),
  collectionId: z.number(),
  royalty: z.number(),
  lastPrice: z.string().nullable(),
  totalTrades: z.number(),
  totalTradeVolume: z.string(),
  status: z.string(),
  collection: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    imageUrl: z.string().nullable(),
    bannerUrl: z.string().nullable(),
    floorPrice: z.string(),
    totalTrades: z.number(),
    verified: z.boolean(),
  }).optional(),
  owner: z.object({
    id: z.string(),
    username: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }).optional(),
  listings: z.array(z.object({
    id: z.number(),
    price: z.string(),
    status: z.string(),
  })).optional(),
});

export const nftCardResultSchema = z.object({
  id: z.string(),
  role: z.literal("information"),
  success: z.boolean(),
  nft: nftMetadataSchema.optional(),
  error: z.string().optional(),
});

export type NFTMetadata = z.infer<typeof nftMetadataSchema>;
export type NFTCardResult = z.infer<typeof nftCardResultSchema>;
