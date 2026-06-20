import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortfolio } from "../services/api";
import PortfolioTable from "../components/PortfolioTable";
import StatCard from "../components/StatCard";
import TradeForm from "../components/TradeForm";
import NavBar from "../components/NavBar";

function PortfolioPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    setLoading(true);
    setError(null);
    try {
      const result = await getPortfolio();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load portfolio");
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
    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
      Loading your portfolio...
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)}

        {!loading && error && (
          <div style={centerContent}>
            <div style={{ fontSize: "16px", fontWeight: 500 }}>
              Couldn't load your portfolio
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: "320px" }}>
              {error}
            </div>
            <button
              onClick={loadPortfolio}
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

        {!loading && !error && data && (
          <>
            <h1 style={{ fontSize: "40px", fontWeight: 500, marginBottom: "22px", textAlign: "center" }}>
              Portfolio
            </h1>

            <div className="stat-cards">
              <div>
                <StatCard
                  title="Portfolio Value"
                  value={`${data.summary.total_market_value.toFixed(2)} €`}
                />
              </div>

              <div onClick={() => navigate("/realized")} style={{ cursor: "pointer" }}>
                <StatCard
                  title="Realized"
                  value={`${data.summary.total_realized_pnl.toFixed(2)} €`}
                  color={data.summary.total_realized_pnl >= 0 ? "#22c55e" : "#ef4444"}
                />
              </div>

              <div>
                <StatCard
                  title="Unrealized"
                  value={`${data.summary.total_unrealized_pnl.toFixed(2)} €`}
                  color={data.summary.total_unrealized_pnl >= 0 ? "#22c55e" : "#ef4444"}
                />
              </div>

              <div>
                <StatCard
                  title="Total PnL"
                  value={`${data.summary.total_pnl.toFixed(2)} €`}
                  color={data.summary.total_pnl >= 0 ? "#22c55e" : "#ef4444"}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <TradeForm onTradeSuccess={loadPortfolio} />
            </div>

            <div style={{ background: "rgba(21, 14, 14, 0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "10px", backdropFilter: "blur(10px)" }}>
              <PortfolioTable positions={data.positions} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PortfolioPage;