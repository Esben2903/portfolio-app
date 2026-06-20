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

  const pageWrapper = {
    minHeight: "100vh",
    padding: "30px 0",
    background: "radial-gradient(ellipse at top, #1a1a1a 0%, #0b0b0f 100%)",
    color: "#fff",
    fontFamily: "-apple-system, BlinkMacSystemFont, Inter, sans-serif",
  };

  const centerContent = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "100px 24px",
  };

  return (
    <div style={pageWrapper}>
      <NavBar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "45px 24px 0" }}>

        {loading && (
          <div style={centerContent}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "rgba(255,255,255,0.6)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={centerContent}>
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
        )}

        {!loading && !error && data && monthly && (
          <>
            <h1 style={{ fontSize: "40px", fontWeight: 500, marginBottom: "22px", textAlign: "center" }}>
              Realized Trades
            </h1>

            <RealizedChart trades={data.realized_trades} />
            <MonthlyRealizedTable monthly={monthly} />
            <RealizedTable trades={data.realized_trades} />
          </>
        )}
      </div>
    </div>
  );
}

export default RealizedPage;