function RealizedTable({ trades }) {
  const formatEUR = (value) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  const styles = {
    wrapper: {
      overflowX: "auto",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0 6px",
      fontFamily: "-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif",
      fontSize: "13px",
      color: "rgba(255,255,255,0.9)",
    },
    th: {
      padding: "14px 16px",
      textAlign: "right",
      fontWeight: 500,
      fontSize: "12px",
      color: "rgba(255,255,255,0.5)",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
    thLeft: {
      padding: "14px 16px",
      textAlign: "left",
      fontWeight: 500,
      fontSize: "12px",
      color: "rgba(255,255,255,0.5)",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
    row: { background: "rgba(255,255,255,0.02)" },
    cell: { padding: "14px 16px", textAlign: "right", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    cellLeft: { padding: "14px 16px", textAlign: "left", fontWeight: 600, borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  };

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.thLeft}>Asset</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Buy Price</th>
            <th style={styles.th}>Sell Price</th>
            <th style={styles.th}>PnL</th>
            <th style={styles.th}>PnL %</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => {
            const pnlColor = t.pnl >= 0 ? "#34d399" : "#fb7185";
            const pnlPct = t.buy_price > 0
              ? ((t.sell_price - t.buy_price) / t.buy_price * 100).toFixed(2)
              : "0.00";
            return (
              <tr key={i} style={styles.row}>
                <td style={styles.cellLeft}>{t.ticker}</td>
                <td style={styles.cell}>{formatDate(t.date)}</td>
                <td style={styles.cell}>{t.quantity}</td>
                <td style={styles.cell}>{formatEUR(t.buy_price)}</td>
                <td style={styles.cell}>{formatEUR(t.sell_price)}</td>
                <td style={{ ...styles.cell, fontWeight: 600, color: pnlColor }}>
                  {t.pnl >= 0 ? "+" : ""}{formatEUR(t.pnl)}
                </td>
                <td style={{ ...styles.cell, fontWeight: 600, color: pnlColor }}>
                  {pnlPct >= 0 ? "+" : ""}{pnlPct}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RealizedTable;