"use client";

import { WhaleTransactionsResult } from "./schema";
import { Pagination } from "@/components/ui/pagination";
import { CopyButton } from "@/components/ui/copy-button";
import { useState } from "react";

export function WhaleTransactions({ success, count, minAmount, totalValue, largestAmount, transactions, filters, error }: WhaleTransactionsResult) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  if (!success || error) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          {error || "Failed to fetch whale transactions"}
        </p>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="my-4 rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground text-center">
          No whale transactions found with minimum amount of {minAmount.toLocaleString()} QUBIC
        </p>
      </div>
    );
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(2)}B`;
    } else if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(2)}M`;
    }
    return amount.toLocaleString();
  };

  return (
    <div className="my-4 rounded-lg border border-border bg-card">
      {/* Header with Stats */}
      <div className="border-b border-border bg-linear-to-r from-blue-500/10 to-purple-500/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">🐋</span>
          <h3 className="text-lg font-semibold">Whale Transactions</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Large QUBIC transfers exceeding {minAmount.toLocaleString()} QUBIC, sorted by amount
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Value Moved</p>
            <p className="text-2xl font-bold">{formatAmount(totalValue)} QUBIC</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Largest Transfer</p>
            <p className="text-2xl font-bold">{formatAmount(largestAmount)} QUBIC</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tick
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentTransactions.map((tx, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐋</span>
                    <div>
                      <p className="font-bold text-lg">{formatAmount(tx.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.amount.toLocaleString()} QUBIC
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {tx.from.substring(0, 12)}...
                    </span>
                    <CopyButton value={tx.from} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {tx.to.substring(0, 12)}...
                    </span>
                    <CopyButton value={tx.to} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">
                    #{tx.tick.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tx.category === 'defi' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      tx.category === 'nft' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                      'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tx.category}
                    </span>
                    {tx.contract && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {tx.contract}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {tx.summary ? (
                      <p className="text-sm text-muted-foreground">{tx.summary}</p>
                    ) : tx.event ? (
                      <p className="text-sm font-medium">{tx.event}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Standard transfer</p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                      {tx.tx_id}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-border p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={transactions.length}
          />
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-muted/30 text-xs text-muted-foreground border-t border-border">
        <p>
          🐋 <strong>Whale Transactions</strong> are significant QUBIC movements that may indicate major market activity, 
          institutional transfers, or large-scale operations. Sorted by amount from largest to smallest.
        </p>
      </div>
    </div>
  );
}
