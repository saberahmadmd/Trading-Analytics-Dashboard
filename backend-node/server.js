const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Simulated token data
const tokens = ['TOKEN1', 'TOKEN2', 'TOKEN3', 'TOKEN4', 'TOKEN5'];
const tokenData = {};

// Initialize token data
tokens.forEach(token => {
  tokenData[token] = {
    prices: Array.from({ length: 20 }, () => 0.001 + Math.random() * 0.01),
    rsi: 50
  };
});

// RSI calculation function
function calculateRSI(prices) {
  if (prices.length < 15) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  const avgGain = gains / 14;
  const avgLoss = losses / 14;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send initial data
  const initialData = tokens.map(token => ({
    token_address: token,
    price: tokenData[token].prices[tokenData[token].prices.length - 1],
    rsi: tokenData[token].rsi,
    timestamp: new Date().toISOString()
  }));

  ws.send(JSON.stringify({
    type: 'initial',
    data: initialData
  }));

  // Send updates every 2 seconds
  const interval = setInterval(() => {
    tokens.forEach(token => {
      // Simulate price movement
      const lastPrice = tokenData[token].prices[tokenData[token].prices.length - 1];
      const newPrice = lastPrice * (1 + (Math.random() - 0.5) * 0.1);
      
      tokenData[token].prices.push(newPrice);
      if (tokenData[token].prices.length > 50) {
        tokenData[token].prices.shift();
      }

      // Calculate RSI
      const rsi = calculateRSI(tokenData[token].prices);
      tokenData[token].rsi = rsi;

      // Send update
      const update = {
        type: 'update',
        data: {
          token_address: token,
          price: newPrice,
          rsi: rsi,
          timestamp: new Date().toISOString()
        }
      };

      ws.send(JSON.stringify(update));
    });
  }, 2000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

// REST API endpoint for current data
app.get('/api/data', (req, res) => {
  const currentData = tokens.map(token => ({
    token_address: token,
    price: tokenData[token].prices[tokenData[token].prices.length - 1],
    rsi: tokenData[token].rsi,
    timestamp: new Date().toISOString()
  }));

  res.json(currentData);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}`);
});