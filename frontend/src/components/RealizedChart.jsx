import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const RANGES = ["1W", "1M", "1Y", "MAX"];

function RealizedChart({ trades }) {
  const [range, setRange] = useState("MAX");

  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const sorted = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

    const now = new Date();
    const cutoff = {
      "1W": new Date(now - 7 * 24 * 60 * 60 * 1000),
      "1M": new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      "1Y": new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      "MAX": new Date(0),
    }[range];

    // cumulative before cutoff (starting point)
    let cumulative = 0;
    sorted
      .filter((t) => new Date(t.date) < cutoff)
      .forEach((t) => (cumulative += t.pnl));

    // merge trades by date key
    const byDate = {};
    sorted
      .filter((t) => new Date(t.date) >= cutoff)
      .forEach((t) => {
        const key = new Date(t.date).toISOString().slice(0, 10);
        byDate[key] = (byDate[key] || 0) + t.pnl;
      })
      ;

    // build cumulative points
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, pnl]) => {
        cumulative += pnl;
        const d = new Date(key);
        const label = d.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          ...(range === "1Y" || range === "MAX" ? { year: "2-digit" } : {}),
        });
        return { date: label, pnl: Math.round(cumulative * 100) / 100 };
      });
  }, [trades, range]);

  const isPositive = chartData.length === 0 || chartData[chartData.length - 1]?.pnl >= 0;
  const color = isPositive ? "#34d399" : "#fb7185";

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    return (
      <div style={{
        background: "rgba(20,20,25,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "13px",
        color: "#fff",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>{payload[0].payload.date}</div>
        <div style={{ color, fontWeight: 600 }}>
          {val >= 0 ? "+" : ""}{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(val)}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      borderRadius: "20px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      padding: "24px",
      marginBottom: "20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>Realized PnL</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>Cumulative history</div>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
                background: range === r ? "rgba(255,255,255,0.12)" : "transparent",
                color: range === r ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s ease",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
          No data for this range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}€`}
              width={55}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="pnl"
              stroke={color}
              strokeWidth={2}
              fill="url(#pnlGradient)"
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default RealizedChart;