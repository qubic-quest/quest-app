"use client";

import { useState, useMemo } from "react";
import { Transaction } from "./schema";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import { Pagination } from "@/components/ui/pagination";

interface TransactionTableProps {
  transactions: Transaction[];
  count: number;
  filters?: {
    limit?: number;
    category?: string;
    contract?: string;
  };
  maxWidth?: string;
}

const ITEMS_PER_PAGE = 10;

export function TransactionTable({ 
  transactions, 
  count, 
  filters,
  maxWidth = "100%" 
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = useMemo(
    () => transactions.slice(startIndex, endIndex),
    [transactions, startIndex, endIndex]
  );

  return (
    <div 
      className="my-4 overflow-hidden rounded-lg border bg-card"
      style={{ maxWidth }}
    >
      {/* Header with filters */}
      <div className="border-b bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Recent Transactions
          </h3>
          <span className="text-xs text-muted-foreground">
            {count} result{count !== 1 ? 's' : ''}
          </span>
        </div>
        {filters && (filters.category || filters.contract || filters.limit) && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {filters.category && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                Category: {filters.category}
              </span>
            )}
            {filters.contract && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                Contract: {filters.contract}
              </span>
            )}
            {filters.limit && (
              <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                Limit: {filters.limit}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30 text-xs">
              <th className="px-4 py-3 text-left font-medium">Tick</th>
              <th className="px-4 py-3 text-left font-medium">From</th>
              <th className="px-4 py-3 text-left font-medium">To</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((tx, idx) => (
              <tr
                key={tx.tx_id}
                className={cn(
                  "border-b text-sm transition-colors hover:bg-muted/50",
                  idx === currentTransactions.length - 1 && "border-b-0"
                )}
              >
                <td className="px-4 py-3 font-mono text-xs">{tx.tick.toLocaleString()}</td>
                <td className="group px-4 py-3">
                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {tx.from}
                    </code>
                    <CopyButton value={tx.from} />
                  </div>
                </td>
                <td className="group px-4 py-3">
                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {tx.to}
                    </code>
                    <CopyButton value={tx.to} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {tx.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    {tx.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {tx.contract && (
                    <span className="mr-2 font-semibold text-foreground">
                      {tx.contract}
                    </span>
                  )}
                  {tx.event && (
                    <span className="text-muted-foreground">
                      {tx.event}
                    </span>
                  )}
                  {tx.summary && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {tx.summary}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactions.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={transactions.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
