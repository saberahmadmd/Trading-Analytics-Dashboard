import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './PriceChart.module.css';

export default function PriceChart({ data }) {
  return (
    <div className={`${styles.priceChart} card`}>
      <h2>Price Movement (SOL)</h2>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4d" />
            <XAxis
              dataKey="timestamp"
              stroke="#8884d8"
              tick={{ fill: '#8884d8' }}
            />
            <YAxis
              stroke="#8884d8"
              tick={{ fill: '#8884d8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #2d2d4d',
                borderRadius: '5px',
                color: 'white'
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#64ffda"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#64ffda' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}