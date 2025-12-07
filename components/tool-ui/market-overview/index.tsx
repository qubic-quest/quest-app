"use client";

import { MarketOverviewResult } from "./schema";

export function MarketOverview(props: MarketOverviewResult) {
  const {
    total_assets,
    total_trades,
    total_volume_qubic,
    unique_traders,
    most_traded_asset,
    most_traded_count,
    latest_tick,
  } = props;

  const avgTradeVolume = total_trades > 0 ? total_volume_qubic / total_trades : 0;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">QX Market Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive statistics for the Qubic Exchange
        </p>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Assets */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold">{total_assets}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Unique assets traded on QX
          </p>
        </div>

        {/* Total Trades */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-xl">💹</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold">{total_trades.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            All-time buy & sell transactions
          </p>
        </div>

        {/* Total Volume */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">
                {(total_volume_qubic / 1_000_000).toLocaleString(undefined, { 
                  maximumFractionDigits: 2 
                })}M
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            QUBIC traded across all assets
          </p>
        </div>

        {/* Unique Traders */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique Traders</p>
              <p className="text-2xl font-bold">{unique_traders.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Active wallets on the exchange
          </p>
        </div>

        {/* Most Traded Asset */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Most Traded</p>
              <p className="text-2xl font-bold font-mono">
                {most_traded_asset || 'N/A'}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {most_traded_count.toLocaleString()} trades
          </p>
        </div>

        {/* Average Trade Volume */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Trade Size</p>
              <p className="text-2xl font-bold">
                {avgTradeVolume.toLocaleString(undefined, { 
                  maximumFractionDigits: 0 
                })}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            QUBIC per transaction
          </p>
        </div>
      </div>

      <div className="px-6 py-3 bg-muted/30 text-xs text-muted-foreground border-t border-border">
        <p>
          📊 <strong>Latest Data:</strong> Tick #{latest_tick.toLocaleString()} • 
          All statistics are calculated from historical QX trade data
        </p>
      </div>
    </div>
  );
}
