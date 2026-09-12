# Atlas: No-Code AI Trading Agent with Live Order Book & On-Chain Caps

autonomous trading agent platform where users configure trading rules through a **no-code visual builder**, enforce strict **spending caps and human approval thresholds on-chain**, and watch the agent trade against a **real-time order book and price chart**.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Next.js Trading Terminal                 │
│  - 60-Sec No-Code Builder (Trigger, Cap, Approval)    │
│  - TradingView Lightweight Charts with Trade Markers  │
│  - Real-Time Order Book Depth Ladder                   │
│  - Human Approval Modal & Emergency Kill-Switch       │
└───────────────────▲───────────────┬────────────────────┘
                    │ WebSocket /   │ Deploy /
                    │ Contract Logs │ Escrow Funds
                    │               ▼
┌───────────────────┴───────────────┐   ┌───────────────────────────────┐
│     Autonomous Agent Runner       │   │       AgentVault.sol          │
│  - Binance ETH/USDC Feed + Mock   ├───►  - Escrow Fund Storage        │
│  - JSON Schema Rule Engine        │   │  - Max Lifetime Total Cap     │
│  - Viem On-Chain Trade Dispatcher │   │  - Max Per-Trade Cap          │
│  - Event Broadcaster              │   │  - Approval Threshold Gating  │
└───────────────────────────────────┘   │  - Instant Refund Kill-Switch │
                                        └───────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: `v18+` (Tested on Node 20 / 24)
- **Foundry**: `forge` and `anvil`

### 2. Install Dependencies
```bash
# In project root
npm install

# Build agent runner and frontend
cd agent-runner && npm install && npm run build && cd ..
cd frontend && npm install && cd ..
```

### 3. Run Smart Contract Tests
Run the comprehensive Foundry test suite (16 tests verifying caps, approvals, and kill switch):
```bash
cd contracts
forge test -vvv
```

### 4. Start the Full Stack

**Option A: One-Command Boot (Mock / Testnet Mode)**
```bash
# Terminal 1: Start Agent Runner Backend (Port 3001)
cd agent-runner && npm run dev

# Terminal 2: Start Next.js Frontend (Port 3000)
cd frontend && npm run dev
```

**Option B: With Local Anvil Node & Contract Deployment**
```bash
# Terminal 1: Run local Anvil node
anvil

# Terminal 2: Deploy Contracts
cd contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast

# Terminal 3: Start Agent Runner & Frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

