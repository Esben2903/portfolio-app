import { useEffect, useState } from "react";
import { getTrades } from "../services/api";
import NavBar from "../components/NavBar";

function TradesPage() {
  const [trades, setTrades] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  async function loadTrades() {
    setLoading(true);
    setError(null);
    try {
      const result = await getTrades();
      setTrades(result);
    } catch (err) {
      setError(err.message || "Failed to load trades");
    } finally {
      setLoading(false);
    }
  }

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
    row: { background: "rgba(255,255,255,0.02)", transition: "all 0.2s ease" },
    cell: { padding: "14px 16px", textAlign: "right", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    cellLeft: { padding: "14px 16px", textAlign: "left", fontWeight: 600, borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  };

  const screenWrapper = {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui, sans-serif",
    gap: "16px",
    padding: "24px",
  };

  if (loading) {
    return (
      <div style={screenWrapper}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={screenWrapper}>
        <div style={{ fontSize: "16px", fontWeight: 500 }}>
          Couldn't load trades
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: "320px" }}>
          {error}
        </div>
        <button
          onClick={loadTrades}
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 500,
            background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!trades) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "30px 0", background: "radial-gradient(ellipse at top, #1a1a1a 0%, #0b0b0f 100%)", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, Inter, sans-serif" }}>
      <NavBar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "45px 24px 0" }}>
        <h1 style={{ fontSize: "40px", fontWeight: 500, marginBottom: "22px", textAlign: "center" }}>
          Trades
        </h1>
        <div style={styles.wrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thLeft}>Asset</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => {
                const isBuy = t.trade_type === "BUY";
                return (
                  <tr
                    key={t.id}
                    style={styles.row}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  >
                    <td style={styles.cellLeft}>
                      <div>{t.ticker}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>{t.name}</div>
                    </td>
                    <td style={{ ...styles.cell, fontWeight: 600, color: isBuy ? "#34d399" : "#fb7185" }}>
                      {t.trade_type}
                    </td>
                    <td style={styles.cell}>{formatDate(t.created_at)}</td>
                    <td style={styles.cell}>{t.quantity}</td>
                    <td style={styles.cell}>{formatEUR(t.price)}</td>
                    <td style={styles.cell}>{formatEUR(t.quantity * t.price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TradesPage;