# Qubic Quest - TODO List

**Last Updated:** December 7, 2025

## 🚧 Current Tasks

- [ ] Put database on cloud

### 📤 Add Export Functionality

**Status:** Not Started  
**Time:** 2-3 hours

- [ ] Add "Export CSV" button to table components
- [ ] Create `exportToCSV()` utility function
- [ ] Add "Share Query" button for shareable URLs
- [ ] Add "Copy as JSON" option

**Files:**

- `lib/export.ts` (new)
- All table components

### ⚡ Add WebSocket Live Updates

**Status:** Not Started  
**Time:** 3-4 hours

- [ ] Connect to Python `live_logger.py` via WebSocket
- [ ] Create `LiveFeed` component in sidebar
- [ ] Show real-time transactions
- [ ] Add notification alerts
- [ ] Add "Watch Asset" feature

**Files:**

- `components/live-feed.tsx` (new)
- `lib/websocket.ts` (new)
- `app/page.tsx`

---
