function MonthlyRealizedTable({ monthly }) {
  const formatEUR = (value) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);

  const formatMonth = (key) => {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  };

  const styles = {
    wrapper: {
      overflowX: "auto",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      marginBottom: "20px",
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
            <th style={styles.thLeft}>Month</th>
            <th style={styles.th}>PnL</th>
          </tr>
        </thead>
        <tbody>
          {monthly.map((m) => {
            const pnlColor = m.pnl >= 0 ? "#34d399" : "#fb7185";
            return (
              <tr key={m.month} style={styles.row}>
                <td style={styles.cellLeft}>{formatMonth(m.month)}</td>
                <td style={{ ...styles.cell, fontWeight: 600, color: pnlColor }}>
                  {m.pnl >= 0 ? "+" : ""}{formatEUR(m.pnl)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MonthlyRealizedTable;