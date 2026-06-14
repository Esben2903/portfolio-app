import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortfolio } from "../services/api";
import PortfolioTable from "../components/PortfolioTable";
import StatCard from "../components/StatCard";
import TradeForm from "../components/TradeForm";
import NavBar from "../components/NavBar";

function PortfolioPage() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    const result = await getPortfolio();
    setData(result);
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "30px 0", background: "radial-gradient(ellipse at top, #1a1a1a 0%, #0b0b0f 100%)", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, Inter, sans-serif" }}>
      <NavBar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "45px 24px 0" }}>
        <h1 style={{ fontSize: "40px", fontWeight: 500, marginBottom: "22px", textAlign: "center"}}>
          Portfolio
        </h1>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "18px", flexWrap: "wrap", alignItems: "stretch" }}>
          <StatCard
            title="Portfolio Value"
            value={`${data.summary.total_market_value.toFixed(2)} €`}
          />

          <div onClick={() => navigate("/realized")} style={{ cursor: "pointer" }}>
            <StatCard
              title="Realized"
              value={`${data.summary.total_realized_pnl.toFixed(2)} €`}
              color={data.summary.total_realized_pnl >= 0 ? "#22c55e" : "#ef4444"}
            />
          </div>

          <StatCard
            title="Unrealized"
            value={`${data.summary.total_unrealized_pnl.toFixed(2)} €`}
            color={data.summary.total_unrealized_pnl >= 0 ? "#22c55e" : "#ef4444"}
          />

          <StatCard
            title="Total PnL"
            value={`${data.summary.total_pnl.toFixed(2)} €`}
            color={data.summary.total_pnl >= 0 ? "#22c55e" : "#ef4444"}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <TradeForm onTradeSuccess={loadPortfolio} />
        </div>

        <div style={{ background: "rgba(21, 14, 14, 0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "10px", backdropFilter: "blur(10px)" }}>
          <PortfolioTable positions={data.positions} />
        </div>
      </div>
    </div>
  );
}

export default PortfolioPage;