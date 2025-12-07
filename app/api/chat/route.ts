import { openai } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
} from "ai";
import { z } from "zod";
import { 
  queryRecentTransactions, 
  queryAssetTrades,
  queryWalletActivity,
  queryWalletTransactions,
  getTickInfo,
  getTickTransactions,
  getDatabaseStats,
  queryQEARNTransactions,
  queryCCFTransactions,
  queryQBAYTransactions,
  queryTopHolders,
  queryWalletPortfolio,
  getMarketOverview,
  compareAssets,
  queryWhaleTransactions,
} from "@/lib/queries";
import { transactionTableResultSchema } from "@/components/tool-ui/transaction-table/schema";
import { assetTradesResultSchema } from "@/components/tool-ui/asset-trades/schema";
import { walletActivityResultSchema } from "@/components/tool-ui/wallet-activity/schema";
import { tickInfoResultSchema, databaseStatsResultSchema } from "@/components/tool-ui/info-cards/schema";
import { currentTickResultSchema } from "@/components/tool-ui/rpc-info/schema";
import { qearnTableResultSchema } from "@/components/tool-ui/qearn-table/schema";
import { ccfTableResultSchema } from "@/components/tool-ui/ccf-table/schema";
import { qbayTableResultSchema } from "@/components/tool-ui/qbay-table/schema";
import { topHoldersResultSchema } from "@/components/tool-ui/top-holders/schema";
import { assetPriceResultSchema } from "@/components/tool-ui/asset-price/schema";
import { qubicPriceResultSchema } from "@/components/tool-ui/qubic-price/schema";
import { walletPortfolioResultSchema } from "@/components/tool-ui/wallet-portfolio/schema";
import { marketOverviewResultSchema } from "@/components/tool-ui/market-overview/schema";
import { compareAssetsResultSchema } from "@/components/tool-ui/compare-assets/schema";
import { whaleTransactionsResultSchema } from "@/components/tool-ui/whale-transactions/schema";
import { nftCardResultSchema } from "@/components/tool-ui/nft-card/schema";
import { getCurrentTick, getWalletBalance, getAssetPrice, getQubicPriceDetails, getQubicPriceHistory, getNFTMetadata } from "@/lib/rpc";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Extract connected wallet from request headers or body
  const connectedWallet = req.headers.get("x-connected-wallet") || "";

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messages),
    system: `You are a helpful assistant that can query the Qubic blockchain database. 
${connectedWallet ? `\n**Connected Wallet**: ${connectedWallet}\nWhen the user says "my wallet", "my address", "my balance", or "my transactions", use this wallet address: ${connectedWallet}\n` : ""}
The database contains:

**Smart Contracts** (contract_name field):
- QX: Decentralized exchange for asset trading
- QEARN: Staking/locking mechanism
- CCF: Community fund governance
- QBAY: NFT marketplace

**Specialized Tools for Each Contract**:
- Use query_asset_trades for QX asset trading (GARTH, QUTIL, CFB, etc.)
- Use get_asset_price for current QX asset prices (CFB, QUTIL, etc.) in QUBIC and USD
- Use get_qubic_price for QUBIC cryptocurrency price with market data and price chart
- Use query_qearn_transactions for QEARN staking activity (lock/unlock)
- Use query_ccf_transactions for CCF governance (proposals/votes)
- Use query_qbay_transactions for QBAY NFT marketplace (mint/buy/transfer)
- Use get_nft_details to get detailed information about a specific NFT (image, traits, owner, collection)
- Use query_top_holders for questions about main QUBIC holders, richest wallets, or whale addresses
- Use query_whale_transactions to find large QUBIC transfers (default: 1M+ QUBIC)

**Portfolio & Market Analysis**:
- Use query_wallet_portfolio to see all QX assets owned by a wallet (includes QUBIC balance from RPC)
- Use get_market_overview for QX exchange statistics (total volume, traders, assets)
- Use compare_assets to compare multiple assets side-by-side (volumes, prices, performance)

**Transactions** - General blockchain transactions:
- tx_id, tick_number, source_id, dest_id, amount, timestamp
- category: 'defi', 'nft', 'heartbeat', 'system', 'user'
- contract_name: Smart contract name (QX, QEARN, CCF, QBAY)
- event: Event type for smart contracts
- decoded_summary: Human-readable summary

**QX Transactions** - QX exchange asset trades:
- Assets traded: GARTH, QMINE, QCAP, CFB, QUTIL, PORTAL, QXTRADE, QFT, MLM, QSILVER, etc.
- Events: Buy, Sell, Transfer, IssueAsset, CancelBuy, CancelSell
- price: Trade price in QUBIC
- shares: Number of shares traded

**QEARN Transactions** - Staking contract:
- Events: lock, unlock
- amount: QUBIC locked or unlocked
- locked_epoch: Epoch when originally locked

**CCF Transactions** - Community fund governance:
- Events: SetProposal, Vote
- Proposal details: type, URL, transfer amount
- Vote details: YES/NO, proposal index

**QBAY Transactions** - NFT marketplace:
- Events: mint, buy, transfer, listInMarket, cancelSale
- NFT details: nft_id, collection_id, price
- Payment: CFB (0) or QUBIC (1)

**Important**: 
- "Show me QUTIL activity" → use query_asset_trades (QUTIL is an asset)
- "Show me QEARN transactions" → use query_qearn_transactions (QEARN is a contract)
- "Show me QBAY NFTs" → use query_qbay_transactions (QBAY is a contract)
- "Show me NFT #4129" → use get_nft_details (specific NFT by ID)
- "Show me CCF proposals" → use query_ccf_transactions (CCF is a contract)

**Ticks** - Blockchain blocks:
- The database contains ticks from 38878613 to 38920294
- Not all ticks are stored - the blockchain may skip empty ticks
- If a specific tick is not found, suggest nearby ticks or use the database stats

Help users explore and understand Qubic blockchain data. Use the specialized tools for richer contract-specific data.`,
    tools: {
      query_recent_transactions: tool({
        description: "Query recent transactions from the Qubic blockchain database. Returns up to 20 transactions by default. Use this for general transaction queries or when filtering by contract name.",
        inputSchema: z.object({
          category: z.string().optional().describe("Filter by category: 'defi', 'nft', 'heartbeat', 'system', 'user'"),
          contract: z.string().optional().describe("Filter by smart contract: 'QX', 'QEARN', 'CCF', 'QBAY' (NOT asset names)"),
          limit: z.number().optional().describe("Maximum number of transactions to return (default: 20, max: 100)"),
        }),
        outputSchema: transactionTableResultSchema,
        execute: async (args) => {
          try {
            console.log('[query_recent_transactions] Args:', args);
            const transactions = queryRecentTransactions({
              limit: Math.min(args.limit || 20, 100),
              category: args.category,
              contract: args.contract,
            });
            console.log('[query_recent_transactions] Found', transactions.length, 'transactions');

            return {
              id: `tx-query-${Date.now()}`,
              role: "information" as const,
              success: true,
              count: transactions.length,
              transactions: transactions.map(tx => ({
                tx_id: tx.tx_id,
                tick: tx.tick_number,
                from: tx.source_id.substring(0, 12) + "...",
                to: tx.dest_id.substring(0, 12) + "...",
                amount: tx.amount,
                category: tx.category,
                contract: tx.contract_name,
                event: tx.event,
                summary: tx.decoded_summary,
              })),
              filters: {
                limit: args.limit,
                category: args.category,
                contract: args.contract,
              },
            };
          } catch (error) {
            return {
              id: `tx-query-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              count: 0,
              transactions: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      query_asset_trades: tool({
        description: "Query QX exchange asset trades and transactions. Use this for questions about CFB, QUTIL, QCAP, or other QX assets. Returns trading activity including buys, sells, transfers, and asset issuance.",
        inputSchema: z.object({
          assetName: z.string().optional().describe("Asset name to filter by (e.g., 'CFB', 'QUTIL', 'QCAP', 'RANDOM')"),
          event: z.string().optional().describe("Filter by event type: 'Buy', 'Sell', 'Transfer', 'IssueAsset', 'CancelBuy', 'CancelSell'"),
          limit: z.number().optional().describe("Maximum number of trades to return (default: 50, max: 100)"),
        }),
        outputSchema: assetTradesResultSchema,
        execute: async (args) => {
          try {
            console.log('[query_asset_trades] Args:', args);
            const trades = queryAssetTrades({
              assetName: args.assetName,
              limit: Math.min(args.limit || 50, 100),
              event: args.event,
            });
            console.log('[query_asset_trades] Found', trades.length, 'trades');

            // Generate intelligent analysis
            let analysis = '';
            if (trades.length > 0) {
              // Count trades by asset
              const assetCounts: Record<string, number> = {};
              const assetVolumes: Record<string, { shares: number; value: number }> = {};
              const eventCounts: Record<string, number> = {};
              
              trades.forEach(trade => {
                // Count by asset
                assetCounts[trade.asset_name] = (assetCounts[trade.asset_name] || 0) + 1;
                
                // Track volumes
                if (!assetVolumes[trade.asset_name]) {
                  assetVolumes[trade.asset_name] = { shares: 0, value: 0 };
                }
                if (trade.shares !== null) {
                  assetVolumes[trade.asset_name].shares += trade.shares;
                }
                if (trade.price !== null && trade.shares !== null) {
                  assetVolumes[trade.asset_name].value += trade.price * trade.shares;
                }
                
                // Count by event type
                eventCounts[trade.event] = (eventCounts[trade.event] || 0) + 1;
              });
              
              // Sort assets by transaction count
              const sortedAssets = Object.entries(assetCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
              
              // Sort events by count
              const sortedEvents = Object.entries(eventCounts)
                .sort(([,a], [,b]) => b - a);
              
              // Build analysis text
              const parts: string[] = [];
              
              if (args.assetName) {
                // Specific asset analysis
                const asset = args.assetName;
                const count = trades.length;
                const events = sortedEvents.map(([event, cnt]) => `${cnt} ${event}`).join(', ');
                parts.push(`${asset} has ${count} transaction${count !== 1 ? 's' : ''} in this period (${events}).`);
                
                if (assetVolumes[asset]) {
                  const vol = assetVolumes[asset];
                  if (vol.shares > 0) {
                    parts.push(`Total volume: ${vol.shares.toLocaleString()} shares traded.`);
                  }
                  if (vol.value > 0) {
                    parts.push(`Total value: ${vol.value.toLocaleString()} QUBIC.`);
                  }
                }
              } else {
                // General market analysis
                const topAssets = sortedAssets.slice(0, 3);
                const assetsList = topAssets.map(([asset, count]) => 
                  `${asset} (${count} transaction${count !== 1 ? 's' : ''})`
                ).join(', ');
                
                parts.push(`Based on ${trades.length} recent trades, the most active assets are: ${assetsList}.`);
                
                // Dominant asset
                if (topAssets.length > 0) {
                  const [dominantAsset, dominantCount] = topAssets[0];
                  const percentage = ((dominantCount / trades.length) * 100).toFixed(1);
                  parts.push(`${dominantAsset} dominates trading activity with ${percentage}% of all transactions.`);
                }
                
                // Event distribution
                if (sortedEvents.length > 0) {
                  const [topEvent, eventCount] = sortedEvents[0];
                  parts.push(`The primary activity type is ${topEvent} (${eventCount} events).`);
                }
              }
              
              analysis = parts.join(' ');
            }

            return {
              id: `asset-trades-${Date.now()}`,
              role: "information" as const,
              success: true,
              count: trades.length,
              trades: trades.map(trade => ({
                tx_id: trade.tx_id,
                tick: trade.tick_number,
                from: trade.source_id.substring(0, 12) + "...",
                event: trade.event,
                asset: trade.asset_name,
                price: trade.price,
                shares: trade.shares,
              })),
              filters: {
                assetName: args.assetName,
                limit: args.limit,
                event: args.event,
              },
              analysis: analysis || undefined,
            };
          } catch (error) {
            return {
              id: `asset-trades-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              count: 0,
              trades: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      query_wallet_activity: tool({
        description: "Look up information about a specific Qubic wallet address. Returns wallet statistics including transaction count, first/last activity, and address type. Also optionally returns recent transactions for that wallet.",
        inputSchema: z.object({
          walletId: z.string().describe("The Qubic wallet address (60 characters) to look up"),
          includeTransactions: z.boolean().optional().describe("Whether to include recent transactions (default: true)"),
          transactionLimit: z.number().optional().describe("Number of transactions to include if includeTransactions is true (default: 20, max: 50)"),
        }),
        outputSchema: walletActivityResultSchema,
        execute: async (args) => {
          try {
            console.log('[query_wallet_activity] Looking up wallet:', args.walletId);
            const activity = queryWalletActivity(args.walletId);
            console.log('[query_wallet_activity] Activity found:', activity !== null);
            
            if (!activity) {
              return {
                id: `wallet-${Date.now()}`,
                role: "information" as const,
                success: true,
                wallet: null,
                error: `Wallet address not found: ${args.walletId}`,
              };
            }

            let transactions: Array<{
              tx_id: string;
              tick: number;
              from: string;
              to: string;
              amount: number;
              category: string;
              summary: string | null;
            }> | undefined = undefined;
            
            if (args.includeTransactions !== false) {
              const txs = queryWalletTransactions(
                args.walletId,
                Math.min(args.transactionLimit || 20, 50)
              );
              transactions = txs.map(tx => ({
                tx_id: tx.tx_id,
                tick: tx.tick_number,
                from: tx.source_id.substring(0, 12) + "...",
                to: tx.dest_id.substring(0, 12) + "...",
                amount: tx.amount,
                category: tx.category,
                summary: tx.decoded_summary,
              }));
            }

            return {
              id: `wallet-${Date.now()}`,
              role: "information" as const,
              success: true,
              wallet: activity,
              transactions,
            };
          } catch (error) {
            return {
              id: `wallet-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              wallet: null,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      get_tick_info: tool({
        description: "Get detailed information about a specific tick (block) in the Qubic blockchain. Shows transaction counts by category and timestamp.",
        inputSchema: z.object({
          tickNumber: z.number().describe("The tick number to look up"),
        }),
        outputSchema: tickInfoResultSchema,
        execute: async (args) => {
          try {
            console.log('[get_tick_info] Querying tick:', args.tickNumber);
            const tick = getTickInfo(args.tickNumber);
            console.log('[get_tick_info] Query result:', tick);
            
            if (!tick) {
              console.log('[get_tick_info] Tick not found, getting stats for error message');
              // Get database tick range for helpful error message
              const stats = getDatabaseStats();
              return {
                id: `tick-${Date.now()}`,
                role: "information" as const,
                success: true,
                tick: null,
                error: `Tick ${args.tickNumber} not found in database. The database covers ticks ${stats.tickRange}. Note: Not all ticks are stored - the blockchain may skip some ticks.`,
              };
            }

            // Get transactions for this tick
            console.log('[get_tick_info] Fetching transactions for tick');
            const txs = getTickTransactions(args.tickNumber, 100);
            console.log('[get_tick_info] Found', txs.length, 'transactions');
            
            const transactions = txs.map(tx => ({
              tx_id: tx.tx_id,
              tick: tx.tick_number,
              from: tx.source_id.substring(0, 12) + "...",
              to: tx.dest_id.substring(0, 12) + "...",
              amount: tx.amount,
              category: tx.category,
              contract: tx.contract_name,
              event: tx.event,
              summary: tx.decoded_summary,
            }));

            console.log('[get_tick_info] Returning successful result with transactions');
            return {
              id: `tick-${Date.now()}`,
              role: "information" as const,
              success: true,
              tick,
              transactions,
            };
          } catch (error) {
            console.error('[get_tick_info] Error:', error);
            return {
              id: `tick-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              tick: null,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      get_database_stats: tool({
        description: "Get overview statistics about the entire blockchain database, including total transaction count, tick range, and coverage period.",
        inputSchema: z.object({}),
        outputSchema: databaseStatsResultSchema,
        execute: async () => {
          try {
            console.log('[get_database_stats] Fetching database statistics');
            const stats = getDatabaseStats();
            console.log('[get_database_stats] Stats:', stats);

            return {
              id: `stats-${Date.now()}`,
              role: "information" as const,
              success: true,
              stats,
            };
          } catch (error) {
            return {
              id: `stats-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      get_current_tick: tool({
        description: "Get the current tick number from the live Qubic network via RPC. Use this to show real-time network status or compare with historical data.",
        inputSchema: z.object({}),
        outputSchema: currentTickResultSchema,
        execute: async () => {
          try {
            console.log('[get_current_tick] Fetching current tick from RPC');
            const tickInfo = await getCurrentTick();
            console.log('[get_current_tick] Current tick:', tickInfo.tick);

            return {
              id: `current-tick-${Date.now()}`,
              role: "information" as const,
              success: true,
              currentTick: tickInfo.tick,
              epoch: tickInfo.epoch,
              timestamp: tickInfo.timestamp,
            };
          } catch (error) {
            return {
              id: `current-tick-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              error: error instanceof Error ? error.message : "Failed to connect to Qubic RPC",
            };
          }
        },
      }),
      query_qearn_transactions: tool({
        description: "Query QEARN staking contract transactions. Use this for QEARN staking activity, lock/unlock events. Returns detailed staking information including amounts and locked epochs.",
        inputSchema: z.object({
          event: z.string().optional().describe("Filter by event: 'lock' or 'unlock'"),
          limit: z.number().optional().describe("Maximum number of transactions to return (default: 50, max: 100)"),
        }),
        outputSchema: qearnTableResultSchema,
        execute: async (args) => {
          try {
            console.log('[query_qearn_transactions] Args:', args);
            const transactions = queryQEARNTransactions({
              event: args.event,
              limit: Math.min(args.limit || 50, 100),
            });
            console.log('[query_qearn_transactions] Found', transactions.length, 'transactions');

            return {
              id: `qearn-${Date.now()}`,
              role: "information" as const,
              success: true,
              count: transactions.length,
              transactions: transactions.map(tx => ({
                tx_id: tx.tx_id,
                tick: tx.tick_number,
                from: tx.source_id.substring(0, 12) + "...",
                event: tx.event,
                amount: tx.amount,
                locked_epoch: tx.locked_epoch,
              })),
              filters: {
                event: args.event,
                limit: args.limit,
              },
            };
          } catch (error) {
            return {
              id: `qearn-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              count: 0,
              transactions: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      query_ccf_transactions: tool({
        description: "Query CCF community fund governance transactions. Use this for CCF governance activity, proposals, and voting. Returns proposal details and vote results.",
        inputSchema: z.object({
          event: z.string().optional().describe("Filter by event: 'SetProposal' or 'Vote'"),
          limit: z.number().optional().describe("Maximum number of transactions to return (default: 50, max: 100)"),
        }),
        outputSchema: ccfTableResultSchema,
        execute: async (args) => {
          try {
            console.log('[query_ccf_transactions] Args:', args);
            const transactions = queryCCFTransactions({
              event: args.event,
              limit: Math.min(args.limit || 50, 100),
            });
            console.log('[query_ccf_transactions] Found', transactions.length, 'transactions');

            return {
              id: `ccf-${Date.now()}`,
              role: "information" as const,
              success: true,
              count: transactions.length,
              transactions: transactions.map(tx => ({
                tx_id: tx.tx_id,
                tick: tx.tick_number,
                from: tx.source_id.substring(0, 12) + "...",
                event: tx.event,
                proposal_type: tx.proposal_type,
                epoch: tx.epoch,
                url: tx.url,
                transfer_amount: tx.transfer_amount,
                proposal_index: tx.proposal_index,
                vote_text: tx.vote_text,
              })),
              filters: {
                event: args.event,
                limit: args.limit,
              },
            };
          } catch (error) {
            return {
              id: `ccf-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              count: 0,
              transactions: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      query_qbay_transactions: tool({
        description: "Query QBAY NFT marketplace transactions. Use this for QBAY NFT activity, minting, buying, selling, and transferring NFTs. Returns NFT details including IDs, prices, and payment methods.",
        inputSchema: z.object({
          event: z.string().optional().describe("Filter by event: 'mint', 'buy', 'transfer', 'listInMarket', etc."),
          limit: z.number().optional().describe("Maximum number of transactions to return (default: 50, max: 100)"),
        }),
        outputSchema: qbayTableResultSchema,
        execute: async (args) => {
          try {
            console.log('[query_qbay_transactions] Args:', args);
            const transactions = queryQBAYTransactions({
              event: args.event,
              limit: Math.min(args.limit || 50, 100),
            });
            console.log('[query_qbay_transactions] Found', transactions.length, 'transactions');

            return {
              id: `qbay-${Date.now()}`,
              role: "information" as const,
              success: true,
              count: transactions.length,
              transactions: transactions.map(tx => ({
                tx_id: tx.tx_id,
                tick: tx.tick_number,
                from: tx.source_id.substring(0, 12) + "...",
                event: tx.event,
                nft_id: tx.nft_id,
                collection_id: tx.collection_id,
                price: tx.price,
                payment_method: tx.payment_method,
                volume: tx.volume,
                uri: tx.uri,
              })),
              filters: {
                event: args.event,
                limit: args.limit,
              },
            };
          } catch (error) {
            return {
              id: `qbay-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              count: 0,
              transactions: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      query_top_holders: tool({
        description: "Query the top QUBIC holders based on transaction activity. Combines local database analysis with live RPC balance queries. Use this for questions about main holders, richest wallets, or whale addresses. Returns addresses with their balances and activity metrics.",
        inputSchema: z.object({
          limit: z.number().optional().describe("Maximum number of holders to return (default: 20, max: 50)"),
        }),
        outputSchema: topHoldersResultSchema,
        execute: async (args) => {
          try {
            console.log('[query_top_holders] Args:', args);
            const limit = Math.min(args.limit || 20, 50);
            
            // Get most active addresses from database
            const holders = queryTopHolders(limit);
            console.log('[query_top_holders] Found', holders.length, 'active addresses');

            // Fetch balances from RPC (in parallel for performance)
            const holdersWithBalances = await Promise.all(
              holders.map(async (holder) => {
                let balance: number | null = null;
                let balance_status: "loaded" | "loading" | "error" = "loading";

                try {
                  balance = await getWalletBalance(holder.address_id);
                  balance_status = "loaded";
                } catch (error) {
                  console.error(`Failed to get balance for ${holder.address_id}:`, error);
                  balance_status = "error";
                }

                return {
                  address_id: holder.address_id,
                  address_short: holder.address_id.substring(0, 12) + "...",
                  balance,
                  balance_status,
                  tx_count: holder.tx_count,
                  first_seen_tick: holder.first_seen_tick,
                  last_active_tick: holder.last_active_tick,
                };
              })
            );

            // Sort by balance (nulls last)
            holdersWithBalances.sort((a, b) => {
              if (a.balance === null) return 1;
              if (b.balance === null) return -1;
              return b.balance - a.balance;
            });

            // Generate intelligent analysis
            const validBalances = holdersWithBalances.filter(
              (h) => h.balance !== null && h.balance_status === "loaded"
            );
            
            let analysis = '';
            if (validBalances.length > 0) {
              const totalBalance = validBalances.reduce((sum, h) => sum + (h.balance || 0), 0);
              const topHolder = validBalances[0];
              const top3 = validBalances.slice(0, 3);
              const top3Balance = top3.reduce((sum, h) => sum + (h.balance || 0), 0);
              
              const parts: string[] = [];
              
              // Format large numbers
              const formatQU = (qu: number) => {
                if (qu >= 1e12) return `${(qu / 1e12).toFixed(2)}T`;
                if (qu >= 1e9) return `${(qu / 1e9).toFixed(2)}B`;
                if (qu >= 1e6) return `${(qu / 1e6).toFixed(2)}M`;
                return qu.toLocaleString();
              };
              
              parts.push(`Among the ${validBalances.length} most active addresses with confirmed balances, the top holder has ${formatQU(topHolder.balance!)} QU (${topHolder.address_short}).`);
              
              if (top3.length === 3) {
                const top3Percentage = ((top3Balance / totalBalance) * 100).toFixed(1);
                parts.push(`The top 3 addresses collectively hold ${formatQU(top3Balance)} QU, representing ${top3Percentage}% of the tracked balance.`);
              }
              
              // Activity metrics
              const avgTxCount = Math.round(validBalances.reduce((sum, h) => sum + h.tx_count, 0) / validBalances.length);
              parts.push(`These addresses average ${avgTxCount.toLocaleString()} transactions each.`);
              
              // Note about methodology
              parts.push(`Note: This analysis is based on transaction activity in the local database combined with live RPC balance queries.`);
              
              analysis = parts.join(' ');
            }

            return {
              id: `top-holders-${Date.now()}`,
              role: "information" as const,
              success: true,
              count: holdersWithBalances.length,
              holders: holdersWithBalances,
              analysis: analysis || undefined,
            };
          } catch (error) {
            return {
              id: `top-holders-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              count: 0,
              holders: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      get_asset_price: tool({
        description: "Get the current price of a QX asset. Returns the last traded price in both QUBIC and USD. Use this for price queries like 'What's the price of CFB?' or 'How much is QUTIL worth?'",
        inputSchema: z.object({
          assetName: z.string().describe("The asset name to get the price for (e.g., 'CFB', 'QUTIL', 'GARTH', 'QCAP')"),
        }),
        outputSchema: assetPriceResultSchema,
        execute: async (args) => {
          try {
            console.log('[get_asset_price] Getting price for:', args.assetName);
            const priceInfo = await getAssetPrice(args.assetName);
            console.log('[get_asset_price] Price info:', priceInfo);

            if (!priceInfo.priceInQubic) {
              return {
                id: `asset-price-${Date.now()}`,
                role: "information" as const,
                success: false,
                assetName: args.assetName,
                priceInQubic: null,
                priceInUSD: null,
                qubicPriceUSD: null,
                lastTradeEvent: null,
                lastTradeTick: null,
                lastTradeTimestamp: null,
                error: `No trading data found for ${args.assetName}. This asset may not exist or hasn't been traded recently.`,
              };
            }

            return {
              id: `asset-price-${Date.now()}`,
              role: "information" as const,
              success: true,
              assetName: priceInfo.assetName,
              priceInQubic: priceInfo.priceInQubic,
              priceInUSD: priceInfo.priceInUSD,
              qubicPriceUSD: priceInfo.qubicPriceUSD,
              lastTradeEvent: priceInfo.lastTradeEvent,
              lastTradeTick: priceInfo.lastTradeTick,
              lastTradeTimestamp: priceInfo.lastTradeTimestamp,
              volume24h: priceInfo.volume24h,
              trades24h: priceInfo.trades24h,
            };
          } catch (error) {
            return {
              id: `asset-price-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              assetName: args.assetName,
              priceInQubic: null,
              priceInUSD: null,
              qubicPriceUSD: null,
              lastTradeEvent: null,
              lastTradeTick: null,
              lastTradeTimestamp: null,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      get_qubic_price: tool({
        description: "Get the current QUBIC price in USD with market data and price chart. Use this when users ask about QUBIC price, market cap, or want to see price trends.",
        inputSchema: z.object({
          includePriceHistory: z.boolean().optional().describe("Whether to include 7-day price history for chart (default: true)"),
        }),
        outputSchema: qubicPriceResultSchema,
        execute: async (args) => {
          try {
            console.log('[get_qubic_price] Fetching QUBIC price data');
            
            // Fetch price details and history in parallel
            const [priceDetails, priceHistory] = await Promise.all([
              getQubicPriceDetails(),
              args.includePriceHistory !== false ? getQubicPriceHistory(7) : Promise.resolve(null),
            ]);

            if (!priceDetails) {
              return {
                id: `qubic-price-${Date.now()}`,
                role: "information" as const,
                success: false,
                currentPrice: null,
                priceChange24h: null,
                priceChangePercentage24h: null,
                marketCap: null,
                volume24h: null,
                error: "Unable to fetch QUBIC price from CoinGecko. The API may be temporarily unavailable.",
              };
            }

            return {
              id: `qubic-price-${Date.now()}`,
              role: "information" as const,
              success: true,
              currentPrice: priceDetails.currentPrice,
              priceChange24h: priceDetails.priceChange24h,
              priceChangePercentage24h: priceDetails.priceChangePercentage24h,
              marketCap: priceDetails.marketCap,
              volume24h: priceDetails.volume24h,
              priceHistory: priceHistory || undefined,
            };
          } catch (error) {
            return {
              id: `qubic-price-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              currentPrice: null,
              priceChange24h: null,
              priceChangePercentage24h: null,
              marketCap: null,
              volume24h: null,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      query_wallet_portfolio: tool({
        description: "Get all QX assets held by a specific wallet address. Shows current holdings with buy/sell history, profit/loss, and portfolio value. Use when users ask 'show me wallet assets', 'what does this wallet own', or 'wallet portfolio'.",
        inputSchema: z.object({
          walletId: z.string().describe("The Qubic wallet address (60 characters) to get portfolio for"),
        }),
        outputSchema: walletPortfolioResultSchema,
        execute: async (args) => {
          try {
            console.log('[query_wallet_portfolio] Getting portfolio for:', args.walletId);
            
            // Fetch assets and QUBIC balance in parallel
            const [assets, qubicBalance] = await Promise.all([
              Promise.resolve(queryWalletPortfolio(args.walletId)),
              getWalletBalance(args.walletId),
            ]);
            
            console.log('[query_wallet_portfolio] Found', assets.length, 'assets and', qubicBalance, 'QUBIC');

            return {
              id: `wallet-portfolio-${Date.now()}`,
              role: "information" as const,
              walletId: args.walletId,
              qubicBalance: qubicBalance,
              assets: assets,
            };
          } catch (error) {
            return {
              id: `wallet-portfolio-error-${Date.now()}`,
              role: "information" as const,
              walletId: args.walletId,
              qubicBalance: null,
              assets: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      get_market_overview: tool({
        description: "Get comprehensive QX market statistics including total assets, trading volume, unique traders, and most traded assets. Use when users ask about 'market overview', 'QX statistics', or 'exchange summary'.",
        inputSchema: z.object({}),
        outputSchema: marketOverviewResultSchema,
        execute: async () => {
          try {
            console.log('[get_market_overview] Fetching market stats');
            const overview = getMarketOverview();
            console.log('[get_market_overview] Overview:', overview);

            return {
              id: `market-overview-${Date.now()}`,
              role: "information" as const,
              ...overview,
            };
          } catch (error) {
            return {
              id: `market-overview-error-${Date.now()}`,
              role: "information" as const,
              total_assets: 0,
              total_trades: 0,
              total_volume_qubic: 0,
              unique_traders: 0,
              most_traded_asset: null,
              most_traded_count: 0,
              latest_tick: 0,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      compare_assets: tool({
        description: "Compare multiple QX assets side-by-side in a SINGLE comparison table. Shows trading volume, price changes, unique traders, and performance metrics for ALL assets together. IMPORTANT: When user asks to 'compare CFB, QUTIL, and GARTH', call this tool ONCE with assetNames: ['CFB', 'QUTIL', 'GARTH']. Do NOT call it multiple times.",
        inputSchema: z.object({
          assetNames: z.array(z.string()).min(2).describe("Array of 2 or more asset names to compare together (e.g., ['CFB', 'QUTIL', 'GARTH'])"),
        }),
        outputSchema: compareAssetsResultSchema,
        execute: async (args) => {
          try {
            console.log('[compare_assets] Comparing assets:', args.assetNames);
            const comparison = compareAssets(args.assetNames);
            console.log('[compare_assets] Comparison results:', comparison.length, 'assets');

            return {
              id: `compare-assets-${Date.now()}`,
              role: "information" as const,
              assets: comparison,
            };
          } catch (error) {
            return {
              id: `compare-assets-error-${Date.now()}`,
              role: "information" as const,
              assets: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      query_whale_transactions: tool({
        description:
          "Query whale transactions (large QUBIC transfers) above a specified minimum amount. " +
          "Returns transactions sorted by amount in descending order with summary statistics. " +
          "Use this for: 'Show me whale transactions', 'Large QUBIC transfers', 'Transactions over X QUBIC', 'Biggest movements'.",
        inputSchema: z.object({
          minAmount: z
            .number()
            .default(1_000_000)
            .describe(
              "Minimum amount in QUBIC to filter whale transactions. Default is 1 million QUBIC. Common values: 1M, 5M, 10M, 100M."
            ),
        }),
        outputSchema: whaleTransactionsResultSchema,
        execute: async ({
          minAmount,
        }): Promise<z.infer<typeof whaleTransactionsResultSchema>> => {
          try {
            const transactions = queryWhaleTransactions(minAmount);

            const totalValue = transactions.reduce(
              (sum, tx) => sum + tx.amount,
              0
            );
            const largestAmount =
              transactions.length > 0
                ? Math.max(...transactions.map((tx) => tx.amount))
                : 0;

            return {
              id: `whale-tx-${Date.now()}`,
              role: "information" as const,
              success: true,
              count: transactions.length,
              minAmount,
              totalValue,
              largestAmount,
              transactions: transactions.map(tx => ({
                tx_id: tx.tx_id,
                tick: tx.tick_number,
                from: tx.source_id,
                to: tx.dest_id,
                amount: tx.amount,
                category: tx.category,
                contract: tx.contract_name,
                event: tx.event,
                summary: tx.decoded_summary,
              })),
              filters: {
                minAmount,
              },
            };
          } catch (error) {
            return {
              id: `whale-tx-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              count: 0,
              minAmount,
              totalValue: 0,
              largestAmount: 0,
              transactions: [],
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to query whale transactions",
            };
          }
        },
      }),
      get_nft_details: tool({
        description: "Get detailed information about a specific NFT from QUBICBAY marketplace. Returns NFT image, metadata, traits, collection info, owner details, and trading history. Use this when users ask about a specific NFT by ID or want to see NFT details.",
        inputSchema: z.object({
          nftId: z.number().describe("The NFT ID to fetch details for"),
        }),
        outputSchema: nftCardResultSchema,
        execute: async (args) => {
          try {
            console.log('[get_nft_details] Fetching NFT:', args.nftId);
            
            const nftData = await getNFTMetadata(args.nftId);

            if (!nftData) {
              return {
                id: `nft-${args.nftId}-${Date.now()}`,
                role: "information" as const,
                success: false,
                error: `NFT #${args.nftId} not found. It may not exist or the QUBICBAY API is temporarily unavailable.`,
              };
            }

            return {
              id: `nft-${args.nftId}-${Date.now()}`,
              role: "information" as const,
              success: true,
              nft: nftData,
            };
          } catch (error) {
            return {
              id: `nft-error-${Date.now()}`,
              role: "information" as const,
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch NFT details",
            };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
