import styles from './CurrentValues.module.css';

export default function CurrentValues({ currentData }) {
  const getRsiClass = (rsi) => {
    if (rsi > 70) return styles.overbought;
    if (rsi < 30) return styles.oversold;
    return styles.neutral;
  };

  return (
    <div className={`${styles.currentValues} card`}>
      <h2>Current Values</h2>
      <div className={styles.valuesGrid}>
        {Object.entries(currentData).map(([token, data]) => (
          <div key={token} className={`${styles.valueItem} ${getRsiClass(data.rsi)}`}>
            <div className={styles.tokenName}>{token}</div>
            <div className={styles.price}>Price: {data.price?.toFixed(6)} SOL</div>
            <div className={`${styles.rsi} ${getRsiClass(data.rsi)}`}>
              RSI: {data.rsi?.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}