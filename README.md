# Atlas: No-Code AI Trading Agent with Live Order Book & On-Chain Caps

autonomous trading agent platform where users configure trading rules through a **no-code visual builder**, enforce strict **spending caps and human approval thresholds on-chain**, and watch the agent trade against a **real-time order book and price chart**.

---

## 🏛️ System Architecture

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

---

## 🎬 5-Step Hackathon Live Demo Script

Follow this sequence to showcase the system to judges in under 2 minutes:

### Step 1: Build the Rule in < 30 Seconds
1. Navigate to `/builder` (or click **Rule Builder** in the navbar).
2. Note the three simple primitives:
   - **Trigger**: "Price Drops Below" `$3,050`
   - **Cap**: Max total spend `5.0 ETH`, max per-trade `1.5 ETH`
   - **Approval Threshold**: Require manual approval above `0.5 ETH`
3. Inspect the live-updating **Structured Rule JSON** on the right side.
4. Click **Deploy Agent & Escrow Funds** to transition to the live dashboard.

### Step 2: Live Price Trigger & Execution
1. On the `/dashboard`, point out the live **ETH/USDC TradingView Price Chart** and **Live Order Book Depth Ladder**.
2. In the **Live Demo Trigger Controller** toolbar, click **"Nudge Price -$25"** (or **"Trigger Normal Trade"**).
3. Watch the trigger fire:
   - An on-chart **Agent Bought Marker** appears dynamically on the chart.
   - The trade immediately registers in the **Live On-Chain Execution Stream** with volume and price.

### Step 3: Approval Threshold Gating (Human-in-the-Loop)
1. In the demo toolbar, click **"Trigger Gated Trade (>0.5 ETH)"** (e.g. 0.8 ETH trade).
2. Notice the trade is halted before execution:
   - A glowing **Manual Approval Required** modal immediately appears.
   - On-chain status shows `PENDING_APPROVAL`.
3. Click **"Approve Trade"** in the modal.
4. Watch the trade complete execution and the marker turn emerald green.

### Step 4: Cap Violation Enforcement
1. In the demo toolbar, click **"Trigger Cap Violation"** (attempts a 3.5 ETH trade exceeding the 1.5 ETH per-trade cap).
2. Point out that the smart contract rejects the transaction with `REJECTED: Exceeds max per-trade spend cap`. Escrow funds remain 100% protected.

### Step 5: Emergency Kill Switch
1. In the top-right header, click the red **"Emergency Kill Switch"** button.
2. Confirm the action in the prompt.
3. The dashboard switches to **KILL SWITCH TRIGGERED: VAULT HALTED**.
4. 100% of escrow balance is returned to the owner, and all future trade calls are blocked at the EVM level.

---

## 🔒 Scope & Hackathon Guardrails
- **Asset Pair**: ETH/USDC exclusively.
- **Trigger Type**: Price threshold (`PRICE_BELOW` or `PRICE_ABOVE`).
- **Live Depth**: Direct Binance ETH/USDC public order book with automated offline mock depth fallback.
- **Contract Security**: Strict checks-effects-interactions, reentrancy guards, and authorization checks.
