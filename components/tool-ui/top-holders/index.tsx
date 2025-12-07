"use client";

import { useState, useMemo } from "react";
import { TopHoldersResult } from "./schema";
import { CopyButton } from "@/components/ui/copy-button";
import { Pagination } from "@/components/ui/pagination";

interface TopHoldersTableProps {
  result: TopHoldersResult;
}

const ITEMS_PER_PAGE = 10;

export function TopHoldersTable({ result }: TopHoldersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!result.success) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          Error loading top holders
        </p>
        {result.error && (
          <p className="mt-1 text-xs text-muted-foreground">{result.error}</p>
        )}
      </div>
    );
  }

  if (result.count === 0) {
    return (
      <div className="my-4 rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          No holder data available.
        </p>
      </div>
    );
  }

  // Calculate total balance (excluding nulls and errors)
  const validBalances = result.holders.filter(
    (h) => h.balance !== null && h.balance_status === "loaded"
  );
  const totalBalance = validBalances.reduce((sum, h) => sum + (h.balance || 0), 0);

  // Format large numbers
  const formatQU = (qu: number) => {
    if (qu >= 1e12) return `${(qu / 1e12).toFixed(2)}T`;
    if (qu >= 1e9) return `${(qu / 1e9).toFixed(2)}B`;
    if (qu >= 1e6) return `${(qu / 1e6).toFixed(2)}M`;
    if (qu >= 1e3) return `${(qu / 1e3).toFixed(2)}K`;
    return qu.toLocaleString();
  };

  const top3 = result.holders.slice(0, 3);
  const remaining = result.holders.slice(3);
  
  // Calculate pagination for remaining holders (after top 3)
  const totalPages = Math.ceil(remaining.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentHolders = useMemo(
    () => remaining.slice(startIndex, endIndex),
    [remaining, startIndex, endIndex]
  );

  return (
    <div className="my-4 space-y-4">
      {/* Header */}
      <div className="rounded-lg border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Top QUBIC Holders</h3>
          <span className="text-sm text-muted-foreground">
            {result.count} address{result.count !== 1 ? "es" : ""}
            {validBalances.length > 0 && (
              <> • {formatQU(totalBalance)} QU tracked</>
            )}
          </span>
        </div>
      </div>

      {/* Top 3 Leaderboard */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {top3.map((holder, idx) => {
          const podiumColors = [
            "from-yellow-500/20 to-yellow-600/10 border-yellow-500/50", // 1st - Gold
            "from-gray-400/20 to-gray-500/10 border-gray-400/50", // 2nd - Silver
            "from-orange-600/20 to-orange-700/10 border-orange-600/50", // 3rd - Bronze
          ];
          const medals = ["🥇", "🥈", "🥉"];
          const textColors = [
            "text-yellow-600 dark:text-yellow-500",
            "text-gray-600 dark:text-gray-400",
            "text-orange-600 dark:text-orange-500",
          ];

          return (
            <div
              key={holder.address_id}
              className={`group rounded-lg border bg-linear-to-br p-4 ${podiumColors[idx]}`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{medals[idx]}</span>
                    <span className={`text-lg font-bold ${textColors[idx]}`}>
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="font-mono text-xs text-muted-foreground">
                      {holder.address_short}
                    </div>
                    <CopyButton value={holder.address_id} />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <div>
                  <div className="text-xs text-muted-foreground">Balance</div>
                  <div className="font-mono text-lg font-bold">
                    {holder.balance_status === "loading" && (
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    )}
                    {holder.balance_status === "error" && (
                      <span className="text-sm text-muted-foreground">Error</span>
                    )}
                    {holder.balance_status === "loaded" && holder.balance !== null && (
                      <span>{formatQU(holder.balance)} QU</span>
                    )}
                    {holder.balance_status === "loaded" && holder.balance === null && (
                      <span className="text-sm text-muted-foreground">Unknown</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{holder.tx_count.toLocaleString()} transactions</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remaining holders table */}
      {remaining.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">#</th>
                  <th className="px-4 py-2 text-left font-medium">Address</th>
                  <th className="px-4 py-2 text-right font-medium">Balance</th>
                  <th className="px-4 py-2 text-right font-medium">Activity</th>
                  <th className="px-4 py-2 text-right font-medium">First Seen</th>
                  <th className="px-4 py-2 text-right font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentHolders.map((holder, idx) => (
                  <tr
                    key={holder.address_id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-2 text-muted-foreground">
                      {startIndex + idx + 4}
                    </td>
                    <td className="group px-4 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-foreground">{holder.address_short}</span>
                        <CopyButton value={holder.address_id} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs">
                      {holder.balance_status === "loading" && (
                        <span className="text-muted-foreground">Loading...</span>
                      )}
                      {holder.balance_status === "error" && (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {holder.balance_status === "loaded" && holder.balance !== null && (
                        <span className="font-semibold text-foreground">
                          {formatQU(holder.balance)} QU
                        </span>
                      )}
                      {holder.balance_status === "loaded" && holder.balance === null && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs">
                      <span className="font-medium text-primary">
                        {holder.tx_count.toLocaleString()} tx
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">
                      {holder.first_seen_tick.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">
                      {holder.last_active_tick.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {remaining.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={remaining.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {result.analysis && (
        <div className="border-t bg-muted/30 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <svg
                className="size-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">Analysis</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.analysis}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
