"use client";

import { NFTCardResult } from "./schema";
import { CopyButton } from "@/components/ui/copy-button";

interface NFTCardProps {
  result: NFTCardResult;
}

// Helper function to format IPFS URLs
const formatImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's just an IPFS hash, use the public IPFS gateway
  if (url.startsWith('bafk') || url.startsWith('bafybe') || url.startsWith('Qm')) {
    return `https://ipfs.io/ipfs/${url}`;
  }
  
  return url;
};

export function NFTCard({ result }: NFTCardProps) {
  if (!result.success) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load NFT details"}
        </p>
      </div>
    );
  }

  if (!result.nft) {
    return (
      <div className="my-4 rounded-lg border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">NFT not found</p>
      </div>
    );
  }

  const { nft } = result;

  const formatPrice = (price: string | null) => {
    if (!price) return "N/A";
    const priceNum = parseInt(price);
    return (priceNum / 1_000_000_000).toFixed(2) + " QUBIC";
  };

  return (
    <div className="my-4 rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/50 px-4 py-3">
        <h3 className="font-semibold text-lg">NFT Details</h3>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
            <img
              src={formatImageUrl(nft.imageUrl) || ''}
              alt={nft.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666" font-size="24">No Image</text></svg>';
              }}
            />
          </div>

          {/* Traits */}
          {nft.metadata && nft.metadata.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Traits</h4>
              <div className="grid grid-cols-2 gap-2">
                {nft.metadata.map((trait, idx) => (
                  <div key={idx} className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {trait.trait_type}
                    </p>
                    <p className="text-sm font-medium mt-1">{trait.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-4">
          {/* Name & Description */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{nft.name}</h2>
            <p className="text-sm text-muted-foreground">{nft.description}</p>
          </div>

          {/* Collection Info */}
          {nft.collection && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3 mb-2">
                {nft.collection.imageUrl && (
                  <img
                    src={formatImageUrl(nft.collection.imageUrl) || ''}
                    alt={nft.collection.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Collection</p>
                  <p className="font-semibold">{nft.collection.name}</p>
                </div>
                {nft.collection.verified && (
                  <span className="text-blue-500 text-xs">✓ Verified</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {nft.collection.description}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium capitalize">{nft.status.toLowerCase()}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Total Trades</p>
              <p className="text-sm font-medium">{nft.totalTrades}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Last Price</p>
              <p className="text-sm font-medium">{formatPrice(nft.lastPrice)}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Royalty</p>
              <p className="text-sm font-medium">{nft.royalty}%</p>
            </div>
          </div>

          {/* Owner Info */}
          {nft.owner && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-2">Owner</p>
              <div className="flex items-center gap-3 mb-2">
                {nft.owner.avatarUrl && (
                  <img
                    src={formatImageUrl(nft.owner.avatarUrl) || ''}
                    alt={nft.owner.username || "Owner"}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{nft.owner.username || "Unknown"}</p>
                  <div className="flex items-center gap-1">
                    <p className="font-mono text-xs text-muted-foreground">
                      {nft.ownerId.substring(0, 12)}...
                    </p>
                    <CopyButton value={nft.ownerId} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listings */}
          {nft.listings && nft.listings.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-2">Active Listings</p>
              <div className="space-y-2">
                {nft.listings.map((listing) => (
                  <div key={listing.id} className="flex justify-between items-center">
                    <span className="text-sm">{formatPrice(listing.price)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      listing.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collection Stats */}
          {nft.collection && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-3">Collection Stats</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Floor Price</span>
                  <span className="text-sm font-medium">
                    {formatPrice(nft.collection.floorPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Trades</span>
                  <span className="text-sm font-medium">{nft.collection.totalTrades}</span>
                </div>
              </div>
            </div>
          )}

          {/* IDs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">NFT ID:</span>
              <span className="font-mono text-xs">#{nft.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Collection ID:</span>
              <span className="font-mono text-xs">#{nft.collectionId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Creator:</span>
              <span className="font-mono text-xs">{nft.creatorId.substring(0, 12)}...</span>
              <CopyButton value={nft.creatorId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
