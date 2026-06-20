import { useEffect, useState } from "react";
import { getRealizedTrades, getRealizedMonthly } from "../services/api";
import RealizedTable from "../components/RealizedTable";
import MonthlyRealizedTable from "../components/MonthlyRealizedTable";
import RealizedChart from "../components/RealizedChart";
import NavBar from "../components/NavBar";

function RealizedPage() {
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [tradesRes, monthlyRes] = await Promise.all([
        getRealizedTrades(),
        getRealizedMonthly(),
      ]);
      setData(tradesRes);
      setMonthly(monthlyRes?.monthly);
    } catch (err) {
      setError(err.message || "Failed to load realized trades");
    } finally {
      setLoading(false);
    }
  }

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
          Couldn't load realized trades
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: "320px" }}>
          {error}
        </div>
        <button
          onClick={loadData}
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

  if (!data || !monthly) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "30px 0", background: "radial-gradient(ellipse at top, #1a1a1a 0%, #0b0b0f 100%)", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, Inter, sans-serif" }}>
      <NavBar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "45px 24px 0" }}>
        <h1 style={{ fontSize: "40px", fontWeight: 500, marginBottom: "22px", textAlign: "center" }}>
          Realized Trades
        </h1>

        <RealizedChart trades={data.realized_trades} />
        <MonthlyRealizedTable monthly={monthly} />
        <RealizedTable trades={data.realized_trades} />
      </div>
    </div>
  );
}

export default RealizedPage;