"use client";

import { useState, useMemo, useEffect } from "react";
import { QBAYTableResult } from "./schema";
import { CopyButton } from "@/components/ui/copy-button";
import { Pagination } from "@/components/ui/pagination";

interface QBAYTableProps {
  result: QBAYTableResult;
}

interface NFTImage {
  id: number;
  imageUrl: string | null;
  name: string | null;
}

const ITEMS_PER_PAGE = 10;

export function QBAYTable({ result }: QBAYTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [nftImages, setNftImages] = useState<Map<number, NFTImage>>(new Map());
  const [loadingImages, setLoadingImages] = useState(false);

  // Extract unique NFT IDs from transactions
  const nftIds = useMemo(() => {
    const ids = new Set<number>();
    result.transactions.forEach(tx => {
      if (tx.nft_id !== null) {
        ids.add(tx.nft_id);
      }
    });
    return Array.from(ids);
  }, [result.transactions]);

  // Fetch NFT images on mount
  useEffect(() => {
    if (nftIds.length === 0) return;

    const fetchNFTImages = async () => {
      setLoadingImages(true);
      const images = new Map<number, NFTImage>();

      // Fetch in parallel with a limit to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < nftIds.length; i += batchSize) {
        const batch = nftIds.slice(i, i + batchSize);
        const promises = batch.map(async (nftId) => {
          try {
            const response = await fetch(`https://api.qubicbay.io/v1/nfts/${nftId}`);
            if (response.ok) {
              const data = await response.json();
              images.set(nftId, {
                id: nftId,
                imageUrl: data.imageUrl || null,
                name: data.name || null,
              });
            }
          } catch (error) {
            console.error(`Failed to fetch NFT ${nftId}:`, error);
          }
        });
        await Promise.all(promises);
      }

      setNftImages(images);
      setLoadingImages(false);
    };

    fetchNFTImages();
  }, [nftIds]);

  if (!result.success) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load QBAY transactions"}
        </p>
      </div>
    );
  }

  if (result.count === 0) {
    return (
      <div className="my-4 rounded-lg border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No QBAY transactions found</p>
      </div>
    );
  }

  const getPaymentMethod = (method: number | null) => {
    if (method === null) return '-';
    return method === 0 ? 'CFB' : 'QUBIC';
  };

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
        <h3 className="font-semibold">QBAY NFT Marketplace Transactions ({result.count})</h3>
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
              <th className="px-4 py-2 text-left font-medium">NFT</th>
              <th className="px-4 py-2 text-left font-medium">TX ID</th>
              <th className="px-4 py-2 text-left font-medium">Tick</th>
              <th className="px-4 py-2 text-left font-medium">From</th>
              <th className="px-4 py-2 text-left font-medium">Event</th>
              <th className="px-4 py-2 text-center font-medium">Collection</th>
              <th className="px-4 py-2 text-right font-medium">Price</th>
              <th className="px-4 py-2 text-center font-medium">Payment</th>
              <th className="px-4 py-2 text-center font-medium">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentTransactions.map((tx) => {
              const nftImage = tx.nft_id ? nftImages.get(tx.nft_id) : null;
              return (
              <tr key={tx.tx_id} className="group hover:bg-muted/50">
                <td className="px-4 py-2">
                  {tx.nft_id !== null ? (
                    <div className="flex items-center gap-2">
                      {loadingImages ? (
                        <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
                      ) : nftImage?.imageUrl ? (
                        <img
                          src={nftImage.imageUrl}
                          alt={nftImage.name || `NFT #${tx.nft_id}`}
                          className="h-10 w-10 rounded-md object-cover border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          #
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-medium">
                          {nftImage?.name || `#${tx.nft_id}`}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          ID: {tx.nft_id}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
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
                    tx.event === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    tx.event === 'mint' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    tx.event === 'transfer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    tx.event === 'listInMarket' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {tx.event}
                  </span>
                </td>
                <td className="px-4 py-2 text-center font-mono">
                  {tx.collection_id !== null ? `#${tx.collection_id}` : '-'}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {tx.price !== null ? tx.price.toLocaleString() : '-'}
                </td>
                <td className="px-4 py-2 text-center">
                  {tx.payment_method !== null ? (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      tx.payment_method === 0
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {getPaymentMethod(tx.payment_method)}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-2 text-center font-mono text-xs">
                  {tx.volume !== null ? tx.volume.toLocaleString() : '-'}
                </td>
              </tr>
              );
            })}
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
