import { getDatabase, Transaction, QXTrade, WalletActivity, TickInfo, QEARNTransaction, CCFTransaction, QBAYTransaction } from "./db";

export async function queryRecentTransactions(params: {
  limit?: number;
  category?: string;
  contract?: string;
}): Promise<Transaction[]> {
  const db = getDatabase();
  const { limit = 20, category, contract } = params;

  let sql = "SELECT * FROM transactions WHERE 1=1";
  const sqlParams: any[] = [];

  if (category) {
    sql += " AND category = ?";
    sqlParams.push(category);
  }

  if (contract) {
    sql += " AND contract_name = ?";
    sqlParams.push(contract);
  }

  sql += " ORDER BY tick_number DESC LIMIT ?";
  sqlParams.push(limit);

  const result = await db.execute({ sql, args: sqlParams });
  return result.rows as unknown as Transaction[];
}

export async function queryAssetTrades(params: {
  assetName?: string;
  limit?: number;
  event?: string;
}): Promise<QXTrade[]> {
  const db = getDatabase();
  const { assetName, limit = 50, event } = params;

  let sql = "SELECT * FROM qx_transactions WHERE 1=1";
  const sqlParams: any[] = [];

  if (assetName) {
    sql += " AND asset_name = ?";
    sqlParams.push(assetName);
  }

  if (event) {
    sql += " AND event = ?";
    sqlParams.push(event);
  }

  sql += " ORDER BY tick_number DESC LIMIT ?";
  sqlParams.push(limit);

  const result = await db.execute({ sql, args: sqlParams });
  return result.rows as unknown as QXTrade[];
}

export async function queryWalletActivity(walletId: string): Promise<WalletActivity | null> {
  const db = getDatabase();
  
  const result = await db.execute({
    sql: "SELECT * FROM addresses WHERE address_id = ?",
    args: [walletId],
  });

  return (result.rows[0] as unknown as WalletActivity) || null;
}

export async function queryWalletTransactions(
  walletId: string,
  limit: number = 50
): Promise<Transaction[]> {
  const db = getDatabase();
  
  const result = await db.execute({
    sql: `SELECT * FROM transactions 
       WHERE source_id = ? OR dest_id = ? 
       ORDER BY tick_number DESC 
       LIMIT ?`,
    args: [walletId, walletId, limit],
  });

  return result.rows as unknown as Transaction[];
}

export async function getTickInfo(tickNumber: number): Promise<TickInfo | null> {
  const db = getDatabase();
  
  const result = await db.execute({
    sql: "SELECT * FROM ticks WHERE tick_number = ?",
    args: [tickNumber],
  });

  return (result.rows[0] as unknown as TickInfo) || null;
}

export async function getTickTransactions(tickNumber: number, limit: number = 100): Promise<Transaction[]> {
  const db = getDatabase();
  
  const result = await db.execute({
    sql: `SELECT * FROM transactions 
       WHERE tick_number = ? 
       ORDER BY tx_id 
       LIMIT ?`,
    args: [tickNumber, limit],
  });

  return result.rows as unknown as Transaction[];
}

export async function getDatabaseStats() {
  const db = getDatabase();
  
  const totalTx = await db.execute({
    sql: "SELECT COUNT(*) as count FROM transactions",
    args: [],
  });
    
  const totalTicks = await db.execute({
    sql: "SELECT COUNT(*) as count FROM ticks",
    args: [],
  });
    
  const tickRange = await db.execute({
    sql: "SELECT MIN(tick_number) as min, MAX(tick_number) as max FROM ticks",
    args: [],
  });

  return {
    totalTransactions: (totalTx.rows[0] as any).count,
    totalTicks: (totalTicks.rows[0] as any).count,
    tickRange: `${(tickRange.rows[0] as any).min} → ${(tickRange.rows[0] as any).max}`,
  };
}

export async function queryQEARNTransactions(params: {
  event?: string;
  limit?: number;
}): Promise<QEARNTransaction[]> {
  const db = getDatabase();
  const { event, limit = 50 } = params;

  let sql = "SELECT * FROM qearn_transactions WHERE 1=1";
  const sqlParams: any[] = [];

  if (event) {
    sql += " AND event = ?";
    sqlParams.push(event);
  }

  sql += " ORDER BY tick_number DESC LIMIT ?";
  sqlParams.push(limit);

  const result = await db.execute({ sql, args: sqlParams });
  return result.rows as unknown as QEARNTransaction[];
}

export async function queryCCFTransactions(params: {
  event?: string;
  limit?: number;
}): Promise<CCFTransaction[]> {
  const db = getDatabase();
  const { event, limit = 50 } = params;

  let sql = "SELECT * FROM ccf_transactions WHERE 1=1";
  const sqlParams: any[] = [];

  if (event) {
    sql += " AND event = ?";
    sqlParams.push(event);
  }

  sql += " ORDER BY tick_number DESC LIMIT ?";
  sqlParams.push(limit);

  const result = await db.execute({ sql, args: sqlParams });
  return result.rows as unknown as CCFTransaction[];
}

export async function queryQBAYTransactions(params: {
  event?: string;
  limit?: number;
}): Promise<QBAYTransaction[]> {
  const db = getDatabase();
  const { event, limit = 50 } = params;

  let sql = "SELECT * FROM qbay_transactions WHERE 1=1";
  const sqlParams: any[] = [];

  if (event) {
    sql += " AND event = ?";
    sqlParams.push(event);
  }

  sql += " ORDER BY tick_number DESC LIMIT ?";
  sqlParams.push(limit);

  const result = await db.execute({ sql, args: sqlParams });
  return result.rows as unknown as QBAYTransaction[];
}

export interface TopHolder {
  address_id: string;
  tx_count: number;
  first_seen_tick: number;
  last_active_tick: number;
  address_type?: string;
}

export async function queryTopHolders(limit: number = 20): Promise<TopHolder[]> {
  const db = getDatabase();
  
  // Get most active addresses (excluding system addresses)
  const result = await db.execute({
    sql: `SELECT 
        source_id as address_id,
        COUNT(*) as tx_count,
        MIN(tick_number) as first_seen_tick,
        MAX(tick_number) as last_active_tick
       FROM transactions 
       WHERE category != 'heartbeat' 
         AND category != 'system'
       GROUP BY source_id 
       ORDER BY tx_count DESC 
       LIMIT ?`,
    args: [limit],
  });

  return result.rows as unknown as TopHolder[];
}

export interface WalletAsset {
  asset_name: string;
  total_bought: number;
  total_sold: number;
  net_shares: number;
  avg_buy_price: number | null;
  avg_sell_price: number | null;
  last_trade_price: number | null;
  last_trade_tick: number;
  trade_count: number;
}

export async function queryWalletPortfolio(walletId: string): Promise<WalletAsset[]> {
  const db = getDatabase();
  
  // Get all assets this wallet has traded
  const result = await db.execute({
    sql: `SELECT 
        asset_name,
        SUM(CASE WHEN event = 'Buy' THEN shares ELSE 0 END) as total_bought,
        SUM(CASE WHEN event = 'Sell' THEN shares ELSE 0 END) as total_sold,
        SUM(CASE WHEN event = 'Buy' THEN shares WHEN event = 'Sell' THEN -shares ELSE 0 END) as net_shares,
        AVG(CASE WHEN event = 'Buy' THEN price END) as avg_buy_price,
        AVG(CASE WHEN event = 'Sell' THEN price END) as avg_sell_price,
        MAX(price) as last_trade_price,
        MAX(tick_number) as last_trade_tick,
        COUNT(*) as trade_count
       FROM qx_transactions 
       WHERE source_id = ? 
         AND (event = 'Buy' OR event = 'Sell')
         AND shares IS NOT NULL
       GROUP BY asset_name
       HAVING net_shares > 0
       ORDER BY net_shares DESC`,
    args: [walletId],
  });

  return result.rows as unknown as WalletAsset[];
}

export interface MarketOverview {
  total_assets: number;
  total_trades: number;
  total_volume_qubic: number;
  unique_traders: number;
  most_traded_asset: string | null;
  most_traded_count: number;
  latest_tick: number;
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const db = getDatabase();
  
  const statsResult = await db.execute({
    sql: `SELECT 
        COUNT(DISTINCT asset_name) as total_assets,
        COUNT(*) as total_trades,
        SUM(CASE WHEN price IS NOT NULL AND shares IS NOT NULL THEN price * shares ELSE 0 END) as total_volume_qubic,
        COUNT(DISTINCT source_id) as unique_traders,
        MAX(tick_number) as latest_tick
       FROM qx_transactions
       WHERE event IN ('Buy', 'Sell')`,
    args: [],
  });
  const stats = statsResult.rows[0] as any;
    
  const topAssetResult = await db.execute({
    sql: `SELECT asset_name, COUNT(*) as trade_count
       FROM qx_transactions
       WHERE event IN ('Buy', 'Sell')
       GROUP BY asset_name
       ORDER BY trade_count DESC
       LIMIT 1`,
    args: [],
  });
  const topAsset = topAssetResult.rows[0] as any;

  return {
    total_assets: stats?.total_assets || 0,
    total_trades: stats?.total_trades || 0,
    total_volume_qubic: stats?.total_volume_qubic || 0,
    unique_traders: stats?.unique_traders || 0,
    most_traded_asset: topAsset?.asset_name || null,
    most_traded_count: topAsset?.trade_count || 0,
    latest_tick: stats?.latest_tick || 0,
  };
}

export interface AssetComparison {
  asset_name: string;
  total_trades: number;
  total_volume: number;
  unique_traders: number;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  last_price: number | null;
  last_trade_tick: number;
  price_change_percent: number | null;
}

export async function compareAssets(assetNames: string[]): Promise<AssetComparison[]> {
  const db = getDatabase();
  
  const results: AssetComparison[] = [];
  
  for (const assetName of assetNames) {
    const statsResult = await db.execute({
      sql: `SELECT 
          ? as asset_name,
          COUNT(*) as total_trades,
          SUM(CASE WHEN price IS NOT NULL AND shares IS NOT NULL THEN price * shares ELSE 0 END) as total_volume,
          COUNT(DISTINCT source_id) as unique_traders,
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          MAX(tick_number) as last_trade_tick
         FROM qx_transactions
         WHERE asset_name = ?
           AND event IN ('Buy', 'Sell')
           AND price IS NOT NULL`,
      args: [assetName, assetName],
    });
    const stats = statsResult.rows[0] as any;
      
    // Get first and last price for change calculation
    const firstPriceResult = await db.execute({
      sql: `SELECT price FROM qx_transactions
         WHERE asset_name = ? AND price IS NOT NULL AND event IN ('Buy', 'Sell')
         ORDER BY tick_number ASC LIMIT 1`,
      args: [assetName],
    });
    const firstPrice = firstPriceResult.rows[0] as any;
      
    const lastPriceResult = await db.execute({
      sql: `SELECT price FROM qx_transactions
         WHERE asset_name = ? AND price IS NOT NULL AND event IN ('Buy', 'Sell')
         ORDER BY tick_number DESC LIMIT 1`,
      args: [assetName],
    });
    const lastPrice = lastPriceResult.rows[0] as any;
      
    const priceChange = firstPrice?.price && lastPrice?.price
      ? ((lastPrice.price - firstPrice.price) / firstPrice.price) * 100
      : null;

    results.push({
      asset_name: assetName,
      total_trades: stats?.total_trades || 0,
      total_volume: stats?.total_volume || 0,
      unique_traders: stats?.unique_traders || 0,
      avg_price: stats?.avg_price || null,
      min_price: stats?.min_price || null,
      max_price: stats?.max_price || null,
      last_price: lastPrice?.price || null,
      last_trade_tick: stats?.last_trade_tick || 0,
      price_change_percent: priceChange,
    });
  }
  
  return results;
}

export async function queryWhaleTransactions(minAmount: number = 1000000): Promise<Transaction[]> {
  const db = getDatabase();

  const sql = "SELECT * FROM transactions WHERE amount >= ? ORDER BY amount DESC, tick_number DESC LIMIT 50";

  const result = await db.execute({ sql, args: [minAmount] });
  return result.rows as unknown as Transaction[];
}
