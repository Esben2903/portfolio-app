function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        padding: "14px 12px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        minWidth: "180px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontSize: "12px", opacity: 0.6 }}>
        {title}
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: 600,
          marginTop: "6px",
          color: color || "#fff",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default StatCard;