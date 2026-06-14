function PortfolioTable({ positions }) {
  const formatEUR = (value) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);

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
    row: {
      background: "rgba(255,255,255,0.02)",
      transition: "all 0.2s ease",
      borderRadius: "12px",
    },
    cell: {
      padding: "14px 16px",
      textAlign: "right",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    cellLeft: {
      padding: "14px 16px",
      textAlign: "left",
      fontWeight: 600,
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
  };

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.thLeft}>Asset</th>
            <th style={styles.th}>Shares</th>
            <th style={styles.th}>Avg</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Value</th>
            <th style={styles.th}>PnL</th>
            <th style={styles.th}>PnL %</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => {
            const pnlColor = p.unrealized_pnl >= 0 ? "#34d399" : "#fb7185";
            return (
              <tr
                key={p.ticker}
                style={styles.row}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              >
                <td style={styles.cellLeft}>
                  <div>{p.ticker}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 400, marginTop: "2px" }}>
                    {p.name}
                  </div>
                </td>
                <td style={styles.cell}>{p.shares}</td>
                <td style={styles.cell}>{formatEUR(p.avg_price)}</td>
                <td style={styles.cell}>{formatEUR(p.live_price)}</td>
                <td style={styles.cell}>{formatEUR(p.market_value)}</td>
                <td style={{ ...styles.cell, fontWeight: 600, color: pnlColor }}>
                  {p.unrealized_pnl >= 0 ? "+" : ""}
                  {formatEUR(p.unrealized_pnl)}
                </td>
                <td style={{ ...styles.cell, fontWeight: 600, color: pnlColor }}>
                  {p.unrealized_pnl >= 0 ? "+" : ""}
                  {p.total_invest > 0 ? ((p.unrealized_pnl / p.total_invest) * 100).toFixed(2) : "0.00"}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PortfolioTable;