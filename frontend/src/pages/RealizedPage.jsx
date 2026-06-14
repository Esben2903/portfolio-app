import { useEffect, useState } from "react";
import { getRealizedTrades, getRealizedMonthly } from "../services/api";
import RealizedTable from "../components/RealizedTable";
import MonthlyRealizedTable from "../components/MonthlyRealizedTable";
import RealizedChart from "../components/RealizedChart";
import NavBar from "../components/NavBar";

function RealizedPage() {
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState(null);

  useEffect(() => {
    getRealizedTrades().then(setData).catch(console.error);
    getRealizedMonthly().then((res) => setMonthly(res.monthly)).catch(console.error);
  }, []);

  if (!data || !monthly) {
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