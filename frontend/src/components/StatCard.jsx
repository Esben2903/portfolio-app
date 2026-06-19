function StatCard({ title, value, color }) {
  return (
    <div
      className="stat-card-inner"
      style={{
        borderRadius: "14px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div className="stat-card-title" style={{ opacity: 0.6, whiteSpace: "nowrap" }}>
        {title}
      </div>
      <div
        className="stat-card-value"
        style={{
          fontWeight: 600,
          marginTop: "6px",
          color: color || "#fff",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default StatCard;