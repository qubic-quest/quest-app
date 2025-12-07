import { createClient, Client } from "@libsql/client";

let db: Client | null = null;

export function getDatabase() {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error("TURSO_DATABASE_URL environment variable is not set");
    }

    db = createClient({
      url,
      authToken,
    });
  }
  return db;
}

export interface Transaction {
  tx_id: string;
  tick_number: number;
  source_id: string;
  dest_id: string;
  amount: number;
  timestamp: number;
  category: string;
  contract_name: string | null;
  event: string | null;
  decoded_summary: string | null;
}

export interface QXTrade {
  tx_id: string;
  tick_number: number;
  source_id: string;
  timestamp: number;
  event: string;
  asset_name: string;
  issuer_hex: string | null;
  price: number | null;
  shares: number | null;
  receiver_hex: string | null;
  money_flew: boolean;
}

export interface WalletActivity {
  address_id: string;
  first_seen_tick: number;
  first_seen_timestamp: number;
  address_type: string;
  label: string | null;
  tx_count: number;
  last_active_tick: number;
}

export interface TickInfo {
  tick_number: number;
  timestamp: number | null;
  epoch: number | null;
  transaction_count: number;
  fetched_at: number | null;
  qx_count: number;
  qearn_count: number;
  ccf_count: number;
  qbay_count: number;
  heartbeat_count: number;
  user_count: number;
}

export interface QEARNTransaction {
  tx_id: string;
  tick_number: number;
  source_id: string;
  timestamp: number | null;
  event: string;
  amount: number;
  locked_epoch: number | null;
  money_flew: boolean;
}

export interface CCFTransaction {
  tx_id: string;
  tick_number: number;
  source_id: string;
  timestamp: number | null;
  event: string;
  proposal_type: number | null;
  epoch: number | null;
  url: string | null;
  transfer_dest_hex: string | null;
  transfer_amount: number | null;
  proposal_index: number | null;
  option_index: number | null;
  vote_text: string | null;
  money_flew: boolean;
}

export interface QBAYTransaction {
  tx_id: string;
  tick_number: number;
  source_id: string;
  timestamp: number | null;
  event: string;
  nft_id: number | null;
  collection_id: number | null;
  price: number | null;
  payment_method: number | null;
  volume: number | null;
  royalty: number | null;
  max_size: number | null;
  uri: string | null;
  receiver_hex: string | null;
  ask_price: number | null;
  possessed_nft: number | null;
  another_nft: number | null;
  money_flew: boolean;
}
