"use client";

import { TickInfoResult, DatabaseStatsResult } from "./schema";

interface TickInfoCardProps {
  result: TickInfoResult;
}

export function TickInfoCard({ result }: TickInfoCardProps) {
  if (!result.success || !result.tick) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Tick not found"}
        </p>
      </div>
    );
  }

  const { tick, transactions } = result;
  const tickDate = tick.timestamp ? new Date(tick.timestamp) : null;

  return (
    <div className="my-4 space-y-4">
      {/* Tick Summary Card */}
      <div className="rounded-lg border bg-card">
        <div className="border-b bg-muted/50 px-4 py-3">
          <h3 className="font-semibold">Tick #{tick.tick_number.toLocaleString()}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {tickDate ? tickDate.toLocaleString() : "No timestamp"} 
            {tick.epoch !== null && ` • Epoch ${tick.epoch}`}
          </p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-2xl font-bold">{tick.transaction_count.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">QX Exchange</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {tick.qx_count.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">QEARN Staking</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {tick.qearn_count.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">CCF Governance</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {tick.ccf_count.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">QBAY</p>
              <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                {tick.qbay_count.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">User Transactions</p>
              <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {tick.user_count.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {transactions && transactions.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b bg-muted/50 px-4 py-3">
            <h3 className="font-semibold">Transactions ({transactions.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">TX ID</th>
                  <th className="px-4 py-2 text-left font-medium">From</th>
                  <th className="px-4 py-2 text-left font-medium">To</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                  <th className="px-4 py-2 text-left font-medium">Contract</th>
                  <th className="px-4 py-2 text-left font-medium">Event</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((tx, idx) => (
                  <tr key={tx.tx_id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 font-mono text-xs">{tx.tx_id.substring(0, 8)}...</td>
                    <td className="px-4 py-2 font-mono text-xs">{tx.from}</td>
                    <td className="px-4 py-2 font-mono text-xs">{tx.to}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        tx.category === 'defi' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        tx.category === 'nft' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        tx.category === 'heartbeat' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {tx.contract ? (
                        <span className="font-semibold text-primary">{tx.contract}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {tx.event ? (
                        <span className="text-xs font-medium">{tx.event}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

interface DatabaseStatsCardProps {
  result: DatabaseStatsResult;
}

export function DatabaseStatsCard({ result }: DatabaseStatsCardProps) {
  if (!result.success || !result.stats) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load database statistics"}
        </p>
      </div>
    );
  }

  const { stats } = result;

  return (
    <div className="my-4 rounded-lg border bg-card">
      <div className="border-b bg-muted/50 px-4 py-3">
        <h3 className="font-semibold">Database Overview</h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-primary">
              {stats.totalTransactions.toLocaleString()}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Total Ticks</p>
            <p className="text-3xl font-bold text-primary">
              {stats.totalTicks.toLocaleString()}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Tick Range</p>
            <p className="text-lg font-mono font-semibold">
              {stats.tickRange}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
