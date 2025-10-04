import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import TokenSelector from '../components/TokenSelector/TokenSelector';
import PriceChart from '../components/PriceChart/PriceChart';
import RSIChart from '../components/RSIChart/RSIChart';
import CurrentValues from '../components/CurrentValues/CurrentValues';

export default function Home() {
  const [selectedToken, setSelectedToken] = useState('');
  const [priceData, setPriceData] = useState({});
  const [rsiData, setRsiData] = useState({});
  const [currentData, setCurrentData] = useState({});
  const [availableTokens, setAvailableTokens] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const tokens = ['TOKEN1', 'TOKEN2', 'TOKEN3', 'TOKEN4', 'TOKEN5'];
    setAvailableTokens(tokens);

    // Initialize data structures
    const initialPriceData = {};
    const initialRsiData = {};
    const initialCurrentData = {};

    tokens.forEach(token => {
      initialPriceData[token] = [];
      initialRsiData[token] = [];
      initialCurrentData[token] = { price: 0, rsi: 50 };
    });

    setPriceData(initialPriceData);
    setRsiData(initialRsiData);
    setCurrentData(initialCurrentData);

    // Connect to WebSocket backend
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to backend');
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'initial') {
          // Initialize with all data
          message.data.forEach(item => {
            setPriceData(prev => ({
              ...prev,
              [item.token_address]: [...(prev[item.token_address] || []), {
                timestamp: item.timestamp,
                price: item.price
              }]
            }));

            setRsiData(prev => ({
              ...prev,
              [item.token_address]: [...(prev[item.token_address] || []), {
                timestamp: item.timestamp,
                rsi: item.rsi
              }]
            }));

            setCurrentData(prev => ({
              ...prev,
              [item.token_address]: { price: item.price, rsi: item.rsi }
            }));
          });
        } else if (message.type === 'update') {
          const item = message.data;

          setPriceData(prev => ({
            ...prev,
            [item.token_address]: [...(prev[item.token_address] || []).slice(-49), {
              timestamp: item.timestamp,
              price: item.price
            }]
          }));

          setRsiData(prev => ({
            ...prev,
            [item.token_address]: [...(prev[item.token_address] || []).slice(-49), {
              timestamp: item.timestamp,
              rsi: item.rsi
            }]
          }));

          setCurrentData(prev => ({
            ...prev,
            [item.token_address]: { price: item.price, rsi: item.rsi }
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');

      // Fallback to simulated data if WebSocket fails
      simulateDataStream();
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionStatus('disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Fallback simulated data (original code)
  const simulateDataStream = () => {
    const tokens = ['TOKEN1', 'TOKEN2', 'TOKEN3', 'TOKEN4', 'TOKEN5'];
    setAvailableTokens(tokens);

    const initialPriceData = {};
    const initialRsiData = {};
    const initialCurrentData = {};

    tokens.forEach(token => {
      initialPriceData[token] = [];
      initialRsiData[token] = [];
      initialCurrentData[token] = { price: 0, rsi: 50 };
    });

    setPriceData(initialPriceData);
    setRsiData(initialRsiData);
    setCurrentData(initialCurrentData);

    const interval = setInterval(() => {
      tokens.forEach(token => {
        const newPrice = Math.random() * 0.01;
        const newRsi = 30 + Math.random() * 50;
        const timestamp = new Date().toISOString();

        setPriceData(prev => ({
          ...prev,
          [token]: [...(prev[token] || []).slice(-49), { timestamp, price: newPrice }]
        }));

        setRsiData(prev => ({
          ...prev,
          [token]: [...(prev[token] || []).slice(-49), { timestamp, rsi: newRsi }]
        }));

        setCurrentData(prev => ({
          ...prev,
          [token]: { price: newPrice, rsi: newRsi }
        }));
      });
    }, 2000);

    return () => clearInterval(interval);
  };

  const getFilteredData = (data) => {
    if (!selectedToken) {
      return Object.values(data).flat().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    return data[selectedToken] || [];
  };

  if (availableTokens.length === 0) {
    return (
      <Layout>
        <div className="container">
          <div className="loading">
            Loading Dashboard... {connectionStatus && `(${connectionStatus})`}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        <div className="header">
          <h1>Trading Analytics</h1>
          <p>Real-time RSI and Price Monitoring</p>
          <div className="connection-status">
            Status: <span className={`status ${connectionStatus}`}>{connectionStatus}</span>
          </div>
        </div>

        <TokenSelector
          selectedToken={selectedToken}
          onTokenChange={setSelectedToken}
          tokens={availableTokens}
        />

        <div className="dashboard">
          <div className="charts-container">
            <PriceChart data={getFilteredData(priceData)} />
            <RSIChart data={getFilteredData(rsiData)} />
          </div>

          <div className="status-overview">
            <CurrentValues currentData={currentData} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
