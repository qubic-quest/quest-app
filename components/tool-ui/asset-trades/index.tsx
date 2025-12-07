"use client";

import { useState, useMemo } from "react";
import { AssetTradesResult } from "./schema";
import { CopyButton } from "@/components/ui/copy-button";
import { Pagination } from "@/components/ui/pagination";

interface AssetTradesTableProps {
  result: AssetTradesResult;
}

const ITEMS_PER_PAGE = 10;

export function AssetTradesTable({ result }: AssetTradesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!result.success) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          Error loading asset trades
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
          No asset trades found matching your criteria.
        </p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(result.trades.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTrades = useMemo(
    () => result.trades.slice(startIndex, endIndex),
    [result.trades, startIndex, endIndex]
  );

  return (
    <div className="my-4 rounded-lg border bg-card">
      <div className="border-b bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">QX Asset Trades</h3>
          <span className="text-sm text-muted-foreground">
            {result.count} trade{result.count !== 1 ? "s" : ""}
            {result.filters?.assetName && ` • ${result.filters.assetName}`}
            {result.filters?.event && ` • ${result.filters.event}`}
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Tick</th>
              <th className="px-4 py-2 text-left font-medium">Event</th>
              <th className="px-4 py-2 text-left font-medium">Asset</th>
              <th className="px-4 py-2 text-right font-medium">Price</th>
              <th className="px-4 py-2 text-right font-medium">Shares</th>
              <th className="px-4 py-2 text-left font-medium">From</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentTrades.map((trade, idx) => (
              <tr 
                key={trade.tx_id} 
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-2 font-mono text-xs">
                  {trade.tick.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    trade.event === 'Buy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    trade.event === 'Sell' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    trade.event === 'Transfer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    trade.event === 'IssueAsset' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {trade.event}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="font-semibold text-foreground">
                    {trade.asset}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-mono text-xs">
                  {trade.price !== null ? (
                    <span>{trade.price.toLocaleString()} QUBIC</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right font-mono text-xs">
                  {trade.shares !== null ? (
                    <span>{trade.shares.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="group px-4 py-2">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-muted-foreground">{trade.from}</span>
                    <CopyButton value={trade.from} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {result.trades.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={result.trades.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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
