"use client";

import { WalletPortfolioResult } from "./schema";

export function WalletPortfolio({ walletId, qubicBalance, assets }: WalletPortfolioResult) {
  const totalValue = assets.reduce((sum, asset) => {
    const value = asset.last_trade_price 
      ? asset.net_shares * asset.last_trade_price 
      : 0;
    return sum + value;
  }, 0);

  const totalPortfolioValue = totalValue + (qubicBalance || 0);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Wallet Portfolio</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Address: <span className="font-mono text-xs">{walletId}</span>
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">QUBIC Balance</p>
            <p className="text-2xl font-bold">
              {qubicBalance !== null 
                ? qubicBalance.toLocaleString() 
                : 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">QX Assets</p>
            <p className="text-2xl font-bold">{assets.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">
              {totalPortfolioValue.toLocaleString()} <span className="text-sm text-muted-foreground">QUBIC</span>
            </p>
          </div>
        </div>
      </div>
      
      {assets.length === 0 && qubicBalance !== null && qubicBalance > 0 ? (
        <div className="p-6">
          <p className="text-muted-foreground text-center py-4">
            This wallet holds <span className="font-bold">{qubicBalance.toLocaleString()} QUBIC</span> but has no QX asset holdings.
          </p>
        </div>
      ) : assets.length === 0 ? (
        <div className="p-6">
          <p className="text-muted-foreground text-center py-4">
            No assets or QUBIC balance found for this wallet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Holdings
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Avg Buy
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  P&L %
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Trades
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.map((asset, idx) => {
                const value = asset.last_trade_price 
                  ? asset.net_shares * asset.last_trade_price 
                  : 0;
                
                const plPercent = asset.avg_buy_price && asset.last_trade_price
                  ? ((asset.last_trade_price - asset.avg_buy_price) / asset.avg_buy_price) * 100
                  : null;

                return (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-sm">
                        {asset.asset_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-medium">{asset.net_shares.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-1">shares</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm">
                      {asset.avg_buy_price 
                        ? asset.avg_buy_price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm font-medium">
                      {asset.last_trade_price 
                        ? asset.last_trade_price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {plPercent !== null ? (
                        <span className={plPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-muted-foreground text-sm">
                      {asset.trade_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="px-6 py-3 bg-muted/30 text-xs text-muted-foreground border-t border-border">
        <p>
          💡 <strong>Note:</strong> QUBIC balance is fetched live from RPC. QX holdings are based on Buy/Sell transactions. 
          Values are calculated using the last traded price for each asset.
        </p>
      </div>
    </div>
  );
}
