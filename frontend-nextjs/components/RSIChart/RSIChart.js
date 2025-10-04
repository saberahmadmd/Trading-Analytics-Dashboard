import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import styles from './RSIChart.module.css';

export default function RSIChart({ data }) {
  return (
    <div className={`${styles.rsiChart} card`}>
      <h2>RSI Indicator</h2>
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
              domain={[0, 100]}
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
            <ReferenceLine y={70} stroke="#ff6b6b" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#4ecdc4" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#ffd166"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#ffd166' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.rsiLegends}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.oversold}`}></span>
          <span>Oversold (&lt;30)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.neutral}`}></span>
          <span>Neutral (30-70)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.overbought}`}></span>
          <span>Overbought (&gt;70)</span>
        </div>
      </div>
    </div>
  );
}