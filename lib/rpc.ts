// Qubic RPC API utilities
// Official documentation: https://qubic.github.io/integration/Partners/swagger/qubic-rpc-doc.html
const RPC_URL = process.env.QUBIC_RPC_URL || "https://rpc.qubic.org";

export interface CurrentTickResponse {
  tick: number;
  epoch: number;
  timestamp?: number;
}

export interface TickInfo {
  tickNumber: number;
  epoch: number;
  timestamp?: string;
}

/**
 * Get the current tick number from the Qubic network
 * Endpoint: GET /v1/tick-info
 * Returns current network state including tick information and epoch details
 */
export async function getCurrentTick(): Promise<CurrentTickResponse> {
  try {
    const response = await fetch(`${RPC_URL}/v1/tick-info`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // Cache for 5 seconds to avoid hammering the RPC
      next: { revalidate: 5 },
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse response from tick-info endpoint
    // Response format: { tickInfo: { tick: number, epoch: number, timestamp?: string } }
    const tickInfo = data.tickInfo || data;
    
    return {
      tick: tickInfo.tick || tickInfo.tickNumber || 0,
      epoch: tickInfo.epoch || 0,
      timestamp: tickInfo.timestamp ? new Date(tickInfo.timestamp).getTime() : Date.now(),
    };
  } catch (error) {
    console.error("Failed to get current tick from RPC:", error);
    throw new Error(
      `Unable to fetch current tick from Qubic RPC: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get wallet balance from RPC
 * Endpoint: GET /v1/balances/{identityId}
 * Query QU balance for any identity using the 256-bit public key as the identifier
 */
export async function getWalletBalance(address: string): Promise<number | null> {
  try {
    const response = await fetch(`${RPC_URL}/v1/balances/${address}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 10 },
    });

    if (!response.ok) {
      console.warn(`Failed to get balance for ${address}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Response format: { balance: { id: string, balance: string, validForTick: number, ... } }
    return data.balance?.balance ? parseInt(data.balance.balance) : null;
  } catch (error) {
    console.error(`Failed to get balance for ${address}:`, error);
    return null;
  }
}

/**
 * Get assets owned by an identity
 * Endpoint: GET /v1/assets/{identity}/owned
 * Retrieve all assets owned by an identity, includes asset names, quantities, and metadata
 */
export async function getOwnedAssets(address: string): Promise<any[] | null> {
  try {
    const response = await fetch(`${RPC_URL}/v1/assets/${address}/owned`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 10 },
    });

    if (!response.ok) {
      console.warn(`Failed to get assets for ${address}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.ownedAssets || data.assets || [];
  } catch (error) {
    console.error(`Failed to get assets for ${address}:`, error);
    return null;
  }
}

/**
 * Get detailed tick information
 * Endpoint: GET /v2/ticks/{tickNumber}
 * Retrieves detailed information about a specific tick including all transactions
 */
export async function getTickDetails(tickNumber: number): Promise<any | null> {
  try {
    const response = await fetch(`${RPC_URL}/v2/ticks/${tickNumber}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn(`Failed to get tick ${tickNumber}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to get tick ${tickNumber}:`, error);
    return null;
  }
}

/**
 * Get network status
 * Endpoint: GET /v1/status
 * Returns current network state including tick information, epoch details, and network health metrics
 */
export async function getNetworkStatus(): Promise<any | null> {
  try {
    const response = await fetch(`${RPC_URL}/v1/status`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 5 },
    });

    if (!response.ok) {
      console.warn(`Failed to get network status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get network status:", error);
    return null;
  }
}

/**
 * Get current QUBIC price in USD from CoinGecko
 * Returns null if API call fails
 */
export interface QubicPriceInfo {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: number;
}

export async function getQubicPrice(): Promise<number | null> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=qubic-network&vs_currencies=usd",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        // Cache for 60 seconds
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to get QUBIC price: ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Response format: { "qubic-network": { "usd": 0.00000123 } }
    return data["qubic-network"]?.usd || null;
  } catch (error) {
    console.error("Failed to get QUBIC price from CoinGecko:", error);
    return null;
  }
}

/**
 * Get detailed QUBIC price information with market data
 * Returns comprehensive price info including 24h changes and historical data
 */
export async function getQubicPriceDetails(): Promise<QubicPriceInfo | null> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/qubic-network?localization=false&tickers=false&community_data=false&developer_data=false",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        // Cache for 60 seconds
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to get QUBIC details: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const marketData = data.market_data;

    if (!marketData) {
      return null;
    }

    return {
      currentPrice: marketData.current_price?.usd || 0,
      priceChange24h: marketData.price_change_24h || 0,
      priceChangePercentage24h: marketData.price_change_percentage_24h || 0,
      marketCap: marketData.market_cap?.usd || 0,
      volume24h: marketData.total_volume?.usd || 0,
      lastUpdated: new Date(data.last_updated).getTime(),
    };
  } catch (error) {
    console.error("Failed to get QUBIC price details from CoinGecko:", error);
    return null;
  }
}

/**
 * Get QUBIC price history from CoinGecko
 * Returns array of [timestamp, price] pairs
 */
export async function getQubicPriceHistory(days: number = 7): Promise<Array<{ timestamp: number; price: number }> | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/qubic-network/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to get QUBIC price history: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.prices || !Array.isArray(data.prices)) {
      return null;
    }

    // Convert from [[timestamp, price], ...] to [{ timestamp, price }, ...]
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch (error) {
    console.error("Failed to get QUBIC price history from CoinGecko:", error);
    return null;
  }
}

/**
 * Get asset price from database (last traded price)
 * Uses the most recent Buy or Sell transaction for the asset
 * Returns price in QUBIC and USD (if QUBIC price is available)
 */
export interface AssetPriceInfo {
  assetName: string;
  priceInQubic: number | null;
  priceInUSD: number | null;
  qubicPriceUSD: number | null;
  lastTradeEvent: "Buy" | "Sell" | null;
  lastTradeTick: number | null;
  lastTradeTimestamp: number | null;
  volume24h?: number;
  trades24h?: number;
}

export async function getAssetPrice(assetName: string): Promise<AssetPriceInfo> {
  // Import here to avoid circular dependency
  const { getDatabase } = await import("./db");
  
  try {
    const db = getDatabase();
    
    // Get the most recent trade
    const lastTrade = db
      .prepare(
        `SELECT price, event, tick_number, timestamp, shares
         FROM qx_transactions 
         WHERE asset_name = ? AND event IN ('Buy', 'Sell') AND price IS NOT NULL
         ORDER BY tick_number DESC 
         LIMIT 1`
      )
      .get(assetName) as {
        price: number;
        event: "Buy" | "Sell";
        tick_number: number;
        timestamp: number;
        shares: number;
      } | undefined;

    if (!lastTrade) {
      return {
        assetName,
        priceInQubic: null,
        priceInUSD: null,
        qubicPriceUSD: null,
        lastTradeEvent: null,
        lastTradeTick: null,
        lastTradeTimestamp: null,
      };
    }

    // Get current QUBIC price in USD
    const qubicPriceUSD = await getQubicPrice();
    const priceInUSD = qubicPriceUSD ? lastTrade.price * qubicPriceUSD : null;

    // Calculate 24h volume and trade count (last ~8640 ticks = 24 hours at 10 ticks/sec)
    const ticksIn24h = 8640;
    const cutoffTick = lastTrade.tick_number - ticksIn24h;
    
    const volume24h = db
      .prepare(
        `SELECT 
          COUNT(*) as trade_count,
          SUM(shares) as total_shares
         FROM qx_transactions 
         WHERE asset_name = ? 
           AND event IN ('Buy', 'Sell') 
           AND tick_number > ?
           AND shares IS NOT NULL`
      )
      .get(assetName, cutoffTick) as { trade_count: number; total_shares: number | null } | undefined;

    return {
      assetName,
      priceInQubic: lastTrade.price,
      priceInUSD,
      qubicPriceUSD,
      lastTradeEvent: lastTrade.event,
      lastTradeTick: lastTrade.tick_number,
      lastTradeTimestamp: lastTrade.timestamp,
      volume24h: volume24h?.total_shares || 0,
      trades24h: volume24h?.trade_count || 0,
    };
  } catch (error) {
    console.error(`Failed to get price for ${assetName}:`, error);
    return {
      assetName,
      priceInQubic: null,
      priceInUSD: null,
      qubicPriceUSD: null,
      lastTradeEvent: null,
      lastTradeTick: null,
      lastTradeTimestamp: null,
    };
  }
}

/**
 * NFT Metadata Interface
 */
export interface NFTMetadata {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  uri: string;
  metadata: Array<{
    value: string;
    trait_type: string;
  }>;
  creatorId: string;
  ownerId: string;
  collectionId: number;
  royalty: number;
  lastPrice: string | null;
  totalTrades: number;
  totalTradeVolume: string;
  status: string;
  collection?: {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    bannerUrl: string;
    floorPrice: string;
    totalTrades: number;
    verified: boolean;
  };
  owner?: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  listings?: Array<{
    id: number;
    price: string;
    status: string;
  }>;
}

const QUBICBAY_API_URL = "https://api.qubicbay.io/v1";

/**
 * Get NFT metadata from QUBICBAY API
 * Endpoint: GET /v1/nfts/{id}
 * Returns detailed NFT information including images, traits, collection, and owner data
 */
export async function getNFTMetadata(nftId: number): Promise<NFTMetadata | null> {
  try {
    const response = await fetch(`${QUBICBAY_API_URL}/nfts/${nftId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      console.warn(`Failed to get NFT metadata for ID ${nftId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data as NFTMetadata;
  } catch (error) {
    console.error(`Failed to fetch NFT metadata for ID ${nftId}:`, error);
    return null;
  }
}

/**
 * Get multiple NFT metadata in batch
 * Useful for fetching metadata for multiple NFTs at once
 */
export async function getNFTMetadataBatch(nftIds: number[]): Promise<Map<number, NFTMetadata>> {
  const results = new Map<number, NFTMetadata>();
  
  // Fetch all NFTs in parallel
  const promises = nftIds.map(async (id) => {
    const metadata = await getNFTMetadata(id);
    if (metadata) {
      results.set(id, metadata);
    }
  });

  await Promise.all(promises);
  return results;
}
