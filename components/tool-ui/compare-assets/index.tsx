"use client";

import { CompareAssetsResult } from "./schema";

export function CompareAssets({ assets }: CompareAssetsResult) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Asset Comparison</h3>
        <p className="text-muted-foreground text-center py-8">
          No assets to compare. Please specify asset names.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Asset Comparison</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Side-by-side comparison of {assets.length} assets
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-muted/50 z-10">
                Metric
              </th>
              {assets.map((asset) => (
                <th 
                  key={asset.asset_name}
                  className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  <span className="font-mono font-bold text-sm text-foreground">
                    {asset.asset_name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Price Change */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Price Change
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right">
                  {asset.price_change_percent !== null ? (
                    <span className={asset.price_change_percent >= 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                      {asset.price_change_percent >= 0 ? '+' : ''}{asset.price_change_percent.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Last Price */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Last Price
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right font-mono font-semibold">
                  {asset.last_price !== null 
                    ? asset.last_price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Average Price */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Avg Price
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right font-mono">
                  {asset.avg_price !== null 
                    ? asset.avg_price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Price Range */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Price Range
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm">
                  {asset.min_price !== null && asset.max_price !== null ? (
                    <span>
                      {asset.min_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      {' - '}
                      {asset.max_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
              ))}
            </tr>

            {/* Total Volume */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Total Volume
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="font-semibold">
                    {(asset.total_volume / 1_000_000).toLocaleString(undefined, { 
                      maximumFractionDigits: 2 
                    })}M QUBIC
                  </span>
                </td>
              ))}
            </tr>

            {/* Total Trades */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Total Trades
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right font-medium">
                  {asset.total_trades.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Unique Traders */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Unique Traders
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right">
                  {asset.unique_traders.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Avg Trade Size */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Avg Trade Size
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right">
                  {asset.total_trades > 0 ? (
                    <span>
                      {((asset.total_volume / asset.total_trades) / 1_000_000).toLocaleString(undefined, { 
                        maximumFractionDigits: 2 
                      })}M QUBIC
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
              ))}
            </tr>

            {/* Last Trade Tick */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card z-10">
                Last Trade Tick
              </td>
              {assets.map((asset) => (
                <td key={asset.asset_name} className="px-6 py-4 whitespace-nowrap text-right font-mono text-xs text-muted-foreground">
                  #{asset.last_trade_tick.toLocaleString()}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Performance Indicators */}
      <div className="p-6 border-t border-border bg-muted/30">
        <h4 className="text-sm font-semibold mb-3">Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Best Performer */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">🏆 Best Performer</p>
            <p className="font-mono font-bold">
              {(() => {
                const best = assets.reduce((max, asset) => 
                  (asset.price_change_percent || -Infinity) > (max.price_change_percent || -Infinity) 
                    ? asset 
                    : max
                );
                if (best.price_change_percent === null) return 'N/A';
                
                const sign = best.price_change_percent >= 0 ? '+' : '';
                const color = best.price_change_percent >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400';
                
                return (
                  <span className={color}>
                    {best.asset_name} ({sign}{best.price_change_percent.toFixed(2)}%)
                  </span>
                );
              })()}
            </p>
          </div>

          {/* Most Traded */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">💹 Most Traded</p>
            <p className="font-mono font-bold">
              {(() => {
                const most = assets.reduce((max, asset) => 
                  asset.total_trades > max.total_trades ? asset : max
                );
                return `${most.asset_name} (${most.total_trades.toLocaleString()} trades)`;
              })()}
            </p>
          </div>

          {/* Highest Volume */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">💰 Highest Volume</p>
            <p className="font-mono font-bold">
              {(() => {
                const highest = assets.reduce((max, asset) => 
                  asset.total_volume > max.total_volume ? asset : max
                );
                return `${highest.asset_name} (${(highest.total_volume / 1_000_000).toFixed(2)}M)`;
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
