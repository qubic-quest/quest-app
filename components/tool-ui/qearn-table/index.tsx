"use client";

import { useState, useMemo } from "react";
import { QEARNTableResult } from "./schema";
import { CopyButton } from "@/components/ui/copy-button";
import { Pagination } from "@/components/ui/pagination";

interface QEARNTableProps {
  result: QEARNTableResult;
}

const ITEMS_PER_PAGE = 10;

export function QEARNTable({ result }: QEARNTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!result.success) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load QEARN transactions"}
        </p>
      </div>
    );
  }

  if (result.count === 0) {
    return (
      <div className="my-4 rounded-lg border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No QEARN transactions found</p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(result.transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = useMemo(
    () => result.transactions.slice(startIndex, endIndex),
    [result.transactions, startIndex, endIndex]
  );

  return (
    <div className="my-4 rounded-lg border bg-card">
      <div className="border-b bg-muted/50 px-4 py-3">
        <h3 className="font-semibold">QEARN Staking Transactions ({result.count})</h3>
        {result.filters && (
          <p className="text-xs text-muted-foreground mt-1">
            {result.filters.event && `Event: ${result.filters.event}`}
            {result.filters.limit && ` • Limit: ${result.filters.limit}`}
          </p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-2 text-left font-medium">TX ID</th>
              <th className="px-4 py-2 text-left font-medium">Tick</th>
              <th className="px-4 py-2 text-left font-medium">From</th>
              <th className="px-4 py-2 text-left font-medium">Event</th>
              <th className="px-4 py-2 text-right font-medium">Amount</th>
              <th className="px-4 py-2 text-center font-medium">Locked Epoch</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentTransactions.map((tx) => (
              <tr key={tx.tx_id} className="group hover:bg-muted/50">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">{tx.tx_id.substring(0, 8)}...</span>
                    <CopyButton value={tx.tx_id} />
                  </div>
                </td>
                <td className="px-4 py-2 font-mono text-xs">
                  {tx.tick.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">{tx.from}</span>
                    <CopyButton value={tx.from} />
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    tx.event === 'lock' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {tx.event}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-mono font-semibold">
                  {tx.amount.toLocaleString()} QUBIC
                </td>
                <td className="px-4 py-2 text-center font-mono text-xs">
                  {tx.locked_epoch !== null ? tx.locked_epoch : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {result.transactions.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={result.transactions.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
