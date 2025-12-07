"use client";

import { WalletActivityResult } from "./schema";
import { CopyButton } from "@/components/ui/copy-button";

interface WalletActivityCardProps {
  result: WalletActivityResult;
}

export function WalletActivityCard({ result }: WalletActivityCardProps) {
  if (!result.success || !result.wallet) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Wallet not found"}
        </p>
      </div>
    );
  }

  const { wallet, transactions } = result;
  const firstSeenDate = new Date(wallet.first_seen_timestamp);

  return (
    <div className="my-4 space-y-4">
      {/* Wallet Info Card */}
      <div className="rounded-lg border bg-card">
        <div className="border-b bg-muted/50 px-4 py-3">
          <h3 className="font-semibold">Wallet Information</h3>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Address */}
          <div className="group">
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm break-all">{wallet.address_id}</p>
              <CopyButton value={wallet.address_id} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                wallet.address_type === 'contract' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                wallet.address_type === 'system' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {wallet.address_type}
              </span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Label</p>
              <p className="text-sm font-medium">
                {wallet.label || <span className="text-muted-foreground">None</span>}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-sm font-semibold">{wallet.tx_count.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">First Seen</p>
              <p className="text-sm">Tick {wallet.first_seen_tick.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{firstSeenDate.toLocaleDateString()}</p>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Last Active</p>
              <p className="text-sm">Tick {wallet.last_active_tick.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions && transactions.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b bg-muted/50 px-4 py-3">
            <h3 className="font-semibold">Recent Transactions ({transactions.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Tick</th>
                  <th className="px-4 py-2 text-left font-medium">From</th>
                  <th className="px-4 py-2 text-left font-medium">To</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((tx) => (
                  <tr key={tx.tx_id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs">
                      {tx.tick.toLocaleString()}
                    </td>
                    <td className="group px-4 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-muted-foreground">{tx.from}</span>
                        <CopyButton value={tx.from} />
                      </div>
                    </td>
                    <td className="group px-4 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-muted-foreground">{tx.to}</span>
                        <CopyButton value={tx.to} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs">
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs text-muted-foreground">{tx.category}</span>
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
