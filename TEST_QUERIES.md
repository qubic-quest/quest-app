# DeepSight AI Assistant - Test Queries 🧪

Use these queries to test all the new features!

---

## 📚 Understanding Qubic Terminology

**Smart Contracts** (use with `query_recent_transactions` + `contract` filter):
- **QX**: Decentralized exchange where assets are traded
- **QEARN**: Staking/locking smart contract
- **CCF**: Community fund governance
- **QBAY**: NFT marketplace

**Assets** (use with `query_asset_trades` + `assetName` filter):
- **GARTH, QMINE, QCAP, CFB, QUTIL, etc.** - Tokens traded on the QX exchange

**Important**: When you ask about "QUTIL contract activity", the AI will interpret this as QUTIL asset trading activity on the QX exchange, since QUTIL is an asset, not a contract.

---

## 🎯 Quick Start Tests

### 1. Database Overview
```
Show me database stats
```
**Expected:** Card showing total transactions, ticks, and tick range

### 2. Current Network Status
```
What's the current tick?
```
**Expected:** Live tick number with animated green indicator

### 3. Recent Transactions
```
Show me the most recent transactions
```
**Expected:** Table with 20 recent transactions

---

## 💎 Asset Trading Queries

**Top Assets by Volume**: GARTH, QMINE, QCAP, PORTAL, QXTRADE, QFT, CFB, MLM, QSILVER, QUTIL

### GARTH (Most Active Asset)
```
Show me GARTH trades
```
```
What are the latest GARTH Buy orders?
```
```
Show me GARTH trading activity
```

### QMINE
```
Show me QMINE asset activity
```
```
Get recent QMINE trades
```

### QCAP
```
Show me QCAP transactions
```
```
Show me QCAP trading on QX
```

### CFB (Carbon Credit)
```
Show me CFB trades
```
```
What are the latest CFB Buy orders?
```

### QUTIL
```
Show me QUTIL trading activity
```
```
Get the last 30 QUTIL trades
```

### Other Assets
```
Show me PORTAL trades
```
```
Show me QXTRADE activity
```
```
Show me QFT trading
```
```
Show me MLM asset trades
```
```
Show me QSILVER activity
```

### All QX Activity
```
Show me recent QX exchange trades
```
```
What's happening on QX?
```
```
Show me all assets being traded
```

### Filtered Queries
```
Show me all Buy orders on QX
```
```
Show me Transfer events for assets
```
```
Show me the last 50 asset trades
```

---

## 👛 Wallet Lookup Queries

**Note:** Replace with actual wallet addresses from your database

### Check Wallet Info
```
Look up wallet [60-character-address]
```
```
What's the activity for [address]?
```
```
Show me wallet [address] details
```

### Find Wallet Transactions
```
Show me transactions for wallet [address]
```

### System Wallets
```
Look up the QX exchange wallet
```

---

## 📍 Tick Information Queries

**Note:** The database contains ticks from **38878613 to 38920294** (with some gaps)

### Specific Tick
```
What happened in tick 38903764?
```
```
Show me tick 38903800 details
```
```
Tell me about tick 38915000
```

### Tick Comparisons
```
Compare tick 38903764 and 38903800
```

---

## 🔍 Smart Contract Queries

### QX Exchange Contract
```
Show me recent QX contract transactions
```
```
What's the latest QX exchange activity?
```
```
Show me all QX exchange trades
```

### QEARN Contract
```
Show me QEARN contract transactions
```
```
Show me QEARN lock events
```
```
Show me QEARN staking activity
```

### QUTIL Asset
```
Show me QUTIL asset activity
```
```
Get recent QUTIL trades
```
```
Show me QUTIL trading on QX
```

### CCF Contract
```
Show me CCF contract activity
```
```
Show me CCF governance transactions
```

### QBAY Contract
```
Show me QBAY contract transactions
```
```
Show me QBAY NFT activity
```

---

## 🔥 Complex Multi-Tool Queries

These will trigger multiple tools:

### Trading Analysis
```
Show me recent CFB trades and what's the current tick?
```

### Wallet + Trades
```
Look up wallet [address] and show me their recent QX trades
```

### Network Overview
```
Show me database stats and current network status
```

### Historical vs Current
```
What happened in tick 38903800 and what's the current tick?
```

### Complete Analysis
```
Give me a complete overview: database stats, current tick, and recent CFB trades
```

---

## 💬 Natural Language Variations

The AI should understand these variations:

### Asset Trading
- "What's happening with CFB?"
- "CFB trading volume"
- "Latest CFB activity"
- "CFB market"
- "How's CFB doing?"

### Network Status
- "Current network tick"
- "What tick are we on?"
- "Network status"
- "Live tick"
- "Where's the network at?"

### Database Info
- "Database overview"
- "How much data do we have?"
- "Database size"
- "Total transactions"
- "Data coverage"

### Wallet Lookups
- "Check this wallet: [address]"
- "Wallet [address] info"
- "Tell me about [address]"
- "Look up [address]"
- "[address] activity"

---

## 🐛 Edge Cases to Test

### Error Handling
```
Look up wallet INVALID_ADDRESS_123
```
**Expected:** Error message about wallet not found

```
What happened in tick 99999999?
```
**Expected:** Error message about tick not found with database range info

### Empty Results
```
Show me trades for NONEXISTENT_ASSET
```
**Expected:** "No trades found" message

### Large Limits
```
Show me 100 recent transactions
```
**Expected:** Table with 100 rows (max limit)

```
Show me 200 transactions
```
**Expected:** Table with 100 rows (capped at max)

---

## 📊 Expected Behavior

### Tool Selection
When you ask a question, the AI should:
1. Understand your intent
2. Select the appropriate tool(s)
3. Execute the query
4. Format results naturally

### Example Flow

**You:** "Show me CFB trades"

**AI Actions:**
1. Recognizes asset trading query
2. Calls `query_asset_trades` tool with `assetName: "CFB"`
3. Displays custom AssetTradesTable UI
4. Summarizes results in text

**Expected Response:**
```
I found [N] CFB trades in the database:
[Beautiful color-coded table with trades]
The most recent trade was a [Buy/Sell] of [X] shares at [Y] QUBIC.
```

---

## 🎨 UI Features to Check

### AssetTradesTable
- ✅ Color-coded events (Buy=green, Sell=red, Transfer=blue)
- ✅ Responsive on mobile
- ✅ Shows price and shares
- ✅ Tick numbers formatted with commas
- ✅ Truncated addresses with "..."

### WalletActivityCard
- ✅ Address displayed in monospace
- ✅ Type badge (contract/system/user)
- ✅ Transaction count
- ✅ First seen and last active ticks
- ✅ Optional recent transactions table

### TickInfoCard
- ✅ Transaction breakdown by category
- ✅ Color-coded statistics
- ✅ Epoch and timestamp
- ✅ Grid layout
- ✅ **NEW**: Transactions table showing all transactions in that tick

### DatabaseStatsCard
- ✅ Total transactions and ticks
- ✅ Tick range display
- ✅ Clean overview

### CurrentTickCard
- ✅ Animated pulse indicator
- ✅ Green gradient background
- ✅ Large, readable tick number
- ✅ Timestamp

### QEARNTable (NEW)
- ✅ Staking transactions (lock/unlock)
- ✅ Amount in QUBIC
- ✅ Locked epoch display
- ✅ Color-coded events (lock=blue, unlock=orange)

### CCFTable (NEW)
- ✅ Governance transactions (SetProposal/Vote)
- ✅ Proposal details with URL links
- ✅ Vote results (YES/NO badges)
- ✅ Transfer amounts

### QBAYTable (NEW)
- ✅ NFT marketplace transactions
- ✅ NFT ID and Collection ID
- ✅ Price and payment method (CFB/QUBIC)
- ✅ Color-coded events (mint, buy, transfer, list)

---

## 🚀 Performance Checks

### Response Time
- Database queries should return in < 100ms
- AI response should stream within 1-2 seconds
- Tool visualizations should render immediately

### Streaming
- Watch for text streaming word-by-word
- Tool results should appear as soon as available
- No blocking or freezing

### Error Recovery
- Invalid queries should show friendly error messages
- Network errors (RPC) should not crash the app
- Database errors should be caught and displayed

---

## 📝 Notes for Testing

1. **Database must be connected** - Check that deepsight.db exists at the configured path
2. **OpenAI API key must be valid** - Check .env.local
3. **RPC endpoint may be slow** - Current tick query might take 1-2 seconds
4. **First query is slower** - Cold start takes longer, subsequent queries are fast

---

## ✅ Testing Checklist

Copy this to track your testing:

### Basic Functionality
- [ ] Database stats query works
- [ ] Current tick query works
- [ ] Recent transactions query works

### Asset Trading
- [ ] CFB trades query works
- [ ] QUTIL trades query works
- [ ] Asset filtering works
- [ ] Event filtering works (Buy/Sell)
- [ ] UI displays correctly

### Wallet Queries
- [ ] Wallet lookup works
- [ ] Wallet transactions work
- [ ] Wallet type displayed correctly
- [ ] UI displays correctly

### Tick Info
- [ ] Tick info query works
- [ ] Transaction breakdown correct
- [ ] Timestamp formatted correctly
- [ ] UI displays correctly

### Complex Queries
- [ ] Multi-tool queries work
- [ ] Natural language variations understood
- [ ] AI provides good summaries

### Error Handling
- [ ] Invalid wallet shows error
- [ ] Invalid tick shows error
- [ ] Network errors handled gracefully

### UI/UX
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Colors are readable
- [ ] Tables scroll on mobile
- [ ] Loading states appear

---

## 🎯 Success Criteria

Your implementation is successful if:

1. ✅ All 6 tools respond to queries
2. ✅ Custom UI appears for each tool type
3. ✅ Errors are handled gracefully
4. ✅ Queries complete in < 2 seconds
5. ✅ Natural language variations work
6. ✅ Mobile layout is usable
7. ✅ Dark mode looks good

---

**Happy Testing! 🚀**

Visit http://localhost:3000 and start asking questions!

---

## 🔍 Real-World Example Queries

Based on your actual database, here are queries that will definitely work:

### Asset Trading Examples
```
Show me all GARTH trades
```
```
What's happening with QMINE?
```
```
Show me QCAP Buy orders
```
```
Get recent PORTAL activity
```

### Contract Activity Examples
```
Show me all QX contract transactions (defi category)
```
```
Show me QEARN lock events
```
```
Show me QEARN staking activity
```
```
Show me QBAY NFT transfers
```
```
```
Show me QBAY mint events
```
```
Show me CCF proposals
```
```
Show me CCF governance activity
```

### Smart Queries the AI Understands
```
Show me Qutil contract activity
→ AI interprets as: QUTIL asset trading on QX
```
```
What tokens are being traded the most?
→ AI will query QX transactions and rank by asset
```
```
Show me DeFi activity
→ AI filters by category='defi' (QX, QEARN, CCF)
```
```
Show me NFT transactions
→ AI filters by category='nft' (QBAY)
```

---

## 📊 Database Quick Facts

- **Total Contracts**: QX (112 txs), QEARN (18 txs), QBAY (14 txs), CCF (1 tx)
- **Top Assets**: GARTH (33), QMINE (21), QCAP (10), PORTAL (6), QXTRADE (6), QFT (5)
- **QX Events**: Buy (38), Sell (27), CancelSell (22), CancelBuy (19), Transfer (5)
- **QEARN Events**: lock (18 transactions)
- **QBAY Events**: transfer, buy, mint, listInMarket, cancelSale (14 total)
- **CCF Events**: SetProposal (1)
- **Categories**: defi, nft, heartbeat, system, user


what tokens are being traded the most?
who are the main holders of qubic?