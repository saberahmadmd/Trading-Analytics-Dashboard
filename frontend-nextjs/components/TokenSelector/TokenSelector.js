import styles from './TokenSelector.module.css';

export default function TokenSelector({ selectedToken, onTokenChange, tokens }) {
  return (
    <div className={styles.tokenSelector}>
      <label htmlFor="token-select" className={styles.tokenLabel}>
        Select Token:
      </label>
      <select
        id="token-select"
        value={selectedToken}
        onChange={(e) => onTokenChange(e.target.value)}
        className={styles.tokenSelect}
      >
        <option value="">All Tokens</option>
        {tokens.map((token) => (
          <option key={token} value={token}>
            {token}
          </option>
        ))}
      </select>
    </div>
  );
}