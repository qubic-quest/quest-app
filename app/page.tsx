"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { 
  AssistantRuntimeProvider, 
  makeAssistantToolUI,
  useAssistantEvent,
} from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { TransactionTable } from "@/components/tool-ui/transaction-table";
import { transactionTableResultSchema } from "@/components/tool-ui/transaction-table/schema";
import { AssetTradesTable } from "@/components/tool-ui/asset-trades";
import { assetTradesResultSchema } from "@/components/tool-ui/asset-trades/schema";
import { WalletActivityCard } from "@/components/tool-ui/wallet-activity";
import { walletActivityResultSchema } from "@/components/tool-ui/wallet-activity/schema";
import { TickInfoCard, DatabaseStatsCard } from "@/components/tool-ui/info-cards";
import { tickInfoResultSchema, databaseStatsResultSchema } from "@/components/tool-ui/info-cards/schema";
import { CurrentTickCard } from "@/components/tool-ui/rpc-info";
import { currentTickResultSchema } from "@/components/tool-ui/rpc-info/schema";
import { QEARNTable } from "@/components/tool-ui/qearn-table";
import { qearnTableResultSchema } from "@/components/tool-ui/qearn-table/schema";
import { CCFTable } from "@/components/tool-ui/ccf-table";
import { ccfTableResultSchema } from "@/components/tool-ui/ccf-table/schema";
import { QBAYTable } from "@/components/tool-ui/qbay-table";
import { qbayTableResultSchema } from "@/components/tool-ui/qbay-table/schema";
import { TopHoldersTable } from "@/components/tool-ui/top-holders";
import { topHoldersResultSchema } from "@/components/tool-ui/top-holders/schema";
import { AssetPriceCard } from "@/components/tool-ui/asset-price";
import { assetPriceResultSchema } from "@/components/tool-ui/asset-price/schema";
import { QubicPriceCard } from "@/components/tool-ui/qubic-price";
import { qubicPriceResultSchema } from "@/components/tool-ui/qubic-price/schema";
import { WalletPortfolio } from "@/components/tool-ui/wallet-portfolio";
import { walletPortfolioResultSchema } from "@/components/tool-ui/wallet-portfolio/schema";
import { WhaleTransactions } from "@/components/tool-ui/whale-transactions";
import { whaleTransactionsResultSchema } from "@/components/tool-ui/whale-transactions/schema";
import { MarketOverview } from "@/components/tool-ui/market-overview";
import { marketOverviewResultSchema } from "@/components/tool-ui/market-overview/schema";
import { CompareAssets } from "@/components/tool-ui/compare-assets";
import { compareAssetsResultSchema } from "@/components/tool-ui/compare-assets/schema";
import { NFTCard } from "@/components/tool-ui/nft-card";
import { nftCardResultSchema } from "@/components/tool-ui/nft-card/schema";
import { Navbar } from "@/components/navbar";
import { useState, useEffect } from "react";

// Register the Tool UI for transaction queries
const TransactionTableUI = makeAssistantToolUI({
  toolName: "query_recent_transactions",
  render: ({ result }) => {
    // Handle loading state when result is not yet available
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Querying blockchain transactions...
            </p>
          </div>
        </div>
      );
    }

    // The result is the raw tool output, parse it safely
    const parsed = transactionTableResultSchema.safeParse(result);
    
    if (!parsed.success) {
      // If parsing fails, show the raw result for debugging
      console.error("Schema validation failed:", parsed.error);
      
      // Try to render anyway if we have the basic data
      if (result && typeof result === 'object' && 'transactions' in result) {
        return (
          <TransactionTable 
            transactions={(result as any).transactions || []}
            count={(result as any).count || 0}
            filters={(result as any).filters}
            maxWidth="100%"
          />
        );
      }
      
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to query transactions"}
          </p>
        </div>
      );
    }

    const data = parsed.data;
    
    if (!data.success) {
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {data.error || "Failed to query transactions"}
          </p>
        </div>
      );
    }

    return (
      <TransactionTable 
        transactions={data.transactions}
        count={data.count}
        filters={data.filters}
        maxWidth="100%"
      />
    );
  },
});

// Register the Tool UI for asset trades
const AssetTradesUI = makeAssistantToolUI({
  toolName: "query_asset_trades",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Querying QX asset trades...
            </p>
          </div>
        </div>
      );
    }

    const parsed = assetTradesResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Asset trades schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to query asset trades"}
          </p>
        </div>
      );
    }

    return <AssetTradesTable result={parsed.data} />;
  },
});

// Register the Tool UI for wallet activity
const WalletActivityUI = makeAssistantToolUI({
  toolName: "query_wallet_activity",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Looking up wallet information...
            </p>
          </div>
        </div>
      );
    }

    const parsed = walletActivityResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Wallet activity schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to query wallet"}
          </p>
        </div>
      );
    }

    return <WalletActivityCard result={parsed.data} />;
  },
});

// Register the Tool UI for tick info
const TickInfoUI = makeAssistantToolUI({
  toolName: "get_tick_info",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Loading tick information...
            </p>
          </div>
        </div>
      );
    }

    const parsed = tickInfoResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Tick info schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to load tick info"}
          </p>
        </div>
      );
    }

    return <TickInfoCard result={parsed.data} />;
  },
});

// Register the Tool UI for database stats
const DatabaseStatsUI = makeAssistantToolUI({
  toolName: "get_database_stats",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Loading database statistics...
            </p>
          </div>
        </div>
      );
    }

    const parsed = databaseStatsResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Database stats schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to load stats"}
          </p>
        </div>
      );
    }

    return <DatabaseStatsCard result={parsed.data} />;
  },
});

// Register the Tool UI for current tick (RPC)
const CurrentTickUI = makeAssistantToolUI({
  toolName: "get_current_tick",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Connecting to Qubic network...
            </p>
          </div>
        </div>
      );
    }

    const parsed = currentTickResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Current tick schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to get current tick"}
          </p>
        </div>
      );
    }

    return <CurrentTickCard result={parsed.data} />;
  },
});

// Register the Tool UI for QEARN transactions
const QEARNTableUI = makeAssistantToolUI({
  toolName: "query_qearn_transactions",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Querying QEARN staking transactions...
            </p>
          </div>
        </div>
      );
    }

    const parsed = qearnTableResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("QEARN transactions schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to query QEARN transactions"}
          </p>
        </div>
      );
    }

    return <QEARNTable result={parsed.data} />;
  },
});

// Register the Tool UI for CCF transactions
const CCFTableUI = makeAssistantToolUI({
  toolName: "query_ccf_transactions",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Querying CCF governance transactions...
            </p>
          </div>
        </div>
      );
    }

    const parsed = ccfTableResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("CCF transactions schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to query CCF transactions"}
          </p>
        </div>
      );
    }

    return <CCFTable result={parsed.data} />;
  },
});

// Register the Tool UI for QBAY transactions
const QBAYTableUI = makeAssistantToolUI({
  toolName: "query_qbay_transactions",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Querying QBAY NFT transactions...
            </p>
          </div>
        </div>
      );
    }

    const parsed = qbayTableResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("QBAY transactions schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to query QBAY transactions"}
          </p>
        </div>
      );
    }

    return <QBAYTable result={parsed.data} />;
  },
});

// Register the Tool UI for top holders
const TopHoldersUI = makeAssistantToolUI({
  toolName: "query_top_holders",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Analyzing top holders and fetching balances from RPC...
            </p>
          </div>
        </div>
      );
    }

    const parsed = topHoldersResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Top holders schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to query top holders"}
          </p>
        </div>
      );
    }

    return <TopHoldersTable result={parsed.data} />;
  },
});

// Register the Tool UI for asset prices
const AssetPriceUI = makeAssistantToolUI({
  toolName: "get_asset_price",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Fetching asset price data...
            </p>
          </div>
        </div>
      );
    }

    const parsed = assetPriceResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Asset price schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to get asset price"}
          </p>
        </div>
      );
    }

    return <AssetPriceCard result={parsed.data} />;
  },
});

// Register the Tool UI for QUBIC price
const QubicPriceUI = makeAssistantToolUI({
  toolName: "get_qubic_price",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Fetching QUBIC price data from CoinGecko...
            </p>
          </div>
        </div>
      );
    }

    const parsed = qubicPriceResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("QUBIC price schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to get QUBIC price"}
          </p>
        </div>
      );
    }

    return <QubicPriceCard result={parsed.data} />;
  },
});

// Register the Tool UI for wallet portfolio
const WalletPortfolioUI = makeAssistantToolUI({
  toolName: "query_wallet_portfolio",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Loading wallet portfolio...
            </p>
          </div>
        </div>
      );
    }

    const parsed = walletPortfolioResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Wallet portfolio schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to get wallet portfolio"}
          </p>
        </div>
      );
    }

    return <WalletPortfolio {...parsed.data} />;
  },
});

// Register the Tool UI for market overview
const MarketOverviewUI = makeAssistantToolUI({
  toolName: "get_market_overview",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Analyzing QX market data...
            </p>
          </div>
        </div>
      );
    }

    const parsed = marketOverviewResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Market overview schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to get market overview"}
          </p>
        </div>
      );
    }

    return <MarketOverview {...parsed.data} />;
  },
});

// Register the Tool UI for asset comparison
const CompareAssetsUI = makeAssistantToolUI({
  toolName: "compare_assets",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Comparing assets...
            </p>
          </div>
        </div>
      );
    }

    const parsed = compareAssetsResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Compare assets schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to compare assets"}
          </p>
        </div>
      );
    }

    return <CompareAssets {...parsed.data} />;
  },
});

// Register the Tool UI for whale transactions
const WhaleTransactionsUI = makeAssistantToolUI({
  toolName: "query_whale_transactions",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Finding whale transactions...
            </p>
          </div>
        </div>
      );
    }

    const parsed = whaleTransactionsResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("Whale transactions schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to query whale transactions"}
          </p>
        </div>
      );
    }

    return <WhaleTransactions {...parsed.data} />;
  },
});

// Register the Tool UI for NFT details
const NFTCardUI = makeAssistantToolUI({
  toolName: "get_nft_details",
  render: ({ result }) => {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Fetching NFT details...
            </p>
          </div>
        </div>
      );
    }

    const parsed = nftCardResultSchema.safeParse(result);
    
    if (!parsed.success) {
      console.error("NFT card schema validation failed:", parsed.error);
      return (
        <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error: {(result as any)?.error || "Failed to fetch NFT details"}
          </p>
        </div>
      );
    }

    return <NFTCard result={parsed.data} />;
  },
});

// Simple message logger - just logs when messages are sent
function MessageLogger() {
  useAssistantEvent("composer.send", (event) => {
    console.log("Message sent:", event);
  });
  
  return null;
}

export default function Home() {
  const [connectedWallet, setConnectedWallet] = useState<string>("");

  // Create runtime with AI SDK integration and wallet context
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      headers: () => ({
        "x-connected-wallet": connectedWallet,
      }),
    }),
  });

  const handleWalletChange = (address: string) => {
    setConnectedWallet(address);
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar onWalletChange={handleWalletChange} />
      
      <AssistantRuntimeProvider runtime={runtime}>
        <TransactionTableUI />
        <AssetTradesUI />
        <WalletActivityUI />
        <TickInfoUI />
        <DatabaseStatsUI />
        <CurrentTickUI />
        <QEARNTableUI />
        <CCFTableUI />
        <QBAYTableUI />
        <TopHoldersUI />
        <AssetPriceUI />
        <QubicPriceUI />
        <WalletPortfolioUI />
        <MarketOverviewUI />
        <CompareAssetsUI />
        <WhaleTransactionsUI />
        <NFTCardUI />
        <MessageLogger />
        
        {/* Main content - full width, no sidebar for now */}
        <div className="flex-1 overflow-hidden">
          <Thread />
        </div>
      </AssistantRuntimeProvider>
    </div>
  );
}
