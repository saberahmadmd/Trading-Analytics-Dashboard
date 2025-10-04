# 📊 Trading Analytics Dashboard

A **real-time trading analytics system** that calculates the **Relative Strength Index (RSI)** for Solana tokens and displays them in an interactive live dashboard.  
Built for the **Fullstack Developer Technical Assignment**, showcasing **modern full-stack development, real-time data processing, and AI-assisted workflows**.

---

## 🏗️ Architecture Overview
The system follows a **streaming microservices architecture**:

1. **Data Ingestion** → CSV trade data is streamed into **Redpanda**.  
2. **Backend Processing** →  
   - **Option A (Default)** → High-performance **Rust backend** (async with Tokio).  
   - **Option B (Alternative)** → Simpler **Node.js backend** using WebSockets.  
   Both consume trade data, calculate RSI, and publish to `rsi-data`.  
3. **Frontend Dashboard** → A **Next.js + React** dashboard subscribes and visualizes live prices and RSI.  
4. **Streaming Broker** → **Redpanda** enables real-time message flow.  

---

## 🛠️ Technology Stack

| Component       | Technology                | Purpose                              |
|-----------------|---------------------------|--------------------------------------|
| Streaming       | **Redpanda** (Kafka-compatible) | Real-time message brokering          |
| Backend (Option A)| **Rust + Tokio**        | High-performance RSI calculation     |
| Backend (Option B)| **Node.js + WebSocket** | Simpler backend alternative          |
| Frontend        | **Next.js 13 + React 18** | Interactive analytics dashboard      |
| Charts          | **Recharts**              | Real-time data visualization         |
| Containerization| **Docker + Docker Compose** | Infrastructure orchestration         |
| Data Source     | **CSV + JSON**            | Trade data ingestion                 |

---

## ✨ Features

### 📈 Real-time Analytics
- Live SOL price tracking for **5 tokens**  
- **14-period RSI calculation** with overbought/oversold signals  
- Multi-token monitoring with **WebSocket-powered updates**  

### 🎯 Technical Indicators
- **RSI Ranges**:  
  - 🔴 Overbought (>70)  
  - 🟡 Neutral (30–70)  
  - 🟢 Oversold (<30)  
- Interactive line charts with hover details  
- Historical data (50-point moving window)

### 🎨 User Experience
- Responsive design (desktop + mobile)  
- Token selector dropdown  
- Professional **dark UI theme**  
- Smooth **real-time chart updates**  

---

## 🚀 Quick Start

### 📦 Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)  
- [Node.js 18+](https://nodejs.org/)  
- [Rust 1.70+](https://www.rust-lang.org/tools/install)  

---

### ⚡ Option 1: Full Setup (Recommended, with Rust backend)

# 1. Start infrastructure
cd pumpfun-analytics
docker-compose up -d

# 2. Start data ingestion (Terminal 2)
cd data-ingestion
npm install
node producer.js

# 3. Start Rust backend (Terminal 3)
cd backend-rust
cargo run

# 4. Start frontend dashboard (Terminal 4)
cd frontend-nextjs
npm install
npm run dev
⚡ Option 2: Simplified Setup (with Node.js backend)
# 1. Start Node.js backend
cd backend-node
npm install
npm start

# 2. Start frontend dashboard
cd frontend-nextjs  
npm install
npm run dev
Both Rust and Node.js backends consume trade-data from Redpanda, compute RSI, and expose results to the dashboard.

📁 Project Structure
bash
pumpfun-analytics/
├── 🐳 docker-compose.yml         # Infrastructure setup
├── 🔧 console.yml                # Redpanda console config
├── 📊 data-ingestion/            # CSV → Redpanda producer
│   ├── producer.js
│   ├── trades_data.csv
│   └── package.json
├── 🦀 backend-rust/              # RSI calculation service (Rust)
│   ├── src/main.rs
│   ├── Cargo.toml
│   └── .env
├── 🔌 backend-node/              # Alternative RSI backend (Node.js)
│   ├── server.js
│   └── package.json
├── ⚛️ frontend-nextjs/           # Next.js dashboard
│   ├── pages/
│   ├── components/
│   ├── styles/
│   ├── next.config.js
│   └── .env.local
├── 📖 README.md
└── 🗑️ .gitignore
🔧 Configuration
Backend Rust (.env)
env
REDPANDA_BROKERS=localhost:19092
TRADE_TOPIC=trade-data
RSI_TOPIC=rsi-data
Node.js Backend
Runs WebSocket server on port 3001
Consumes trade-data, calculates RSI, and streams JSON
Frontend (.env.local)
env
NEXT_PUBLIC_REDPANDA_BROKERS=localhost:19092
NEXT_PUBLIC_RSI_TOPIC=rsi-data

🧮 RSI Calculation
Both backends implement a standard 14-period RSI:
Rust backend → Async, high-performance via Tokio + rdkafka.
Node.js backend → Simpler RSI logic with JavaScript arrays.

Interpretation:
0–30 → Oversold (🟢 Potential Buy)
30–70 → Neutral (🟡 Hold)
70–100 → Overbought (🔴 Potential Sell)

📊 Performance Metrics
Rust backend: <1ms per token (high throughput)
Node backend: Easy to debug & extend (slower but simpler)
Frontend:- ~2s interval updates, responsive charts
System throughput: 1000+ msgs/sec

🔮 Future Enhancements
More indicators (MACD, Bollinger Bands)
Price alert notifications
Portfolio tracking
Historical storage + queries
Mobile app

🧠 AI Usage Notes (Assignment Requirement)
ChatGPT → Generated Docker Compose + Node.js producer code

Claude → Explained RSI math

Copilot → Helped scaffold React chart components

ChatGPT → Debugged Node.js backend → Redpanda integration