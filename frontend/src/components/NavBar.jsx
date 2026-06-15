import { Link, useLocation } from "react-router-dom";
import { logout } from "../services/api";

const LINKS = [
  { label: "Portfolio", to: "/" },
  { label: "Realized", to: "/realized" },
  { label: "Trades", to: "/trades" },
];

function NavBar() {
  const { pathname } = useLocation();

  return (
    <>
      <div style={{
        position: "fixed",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        padding: "4px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        whiteSpace: "nowrap",
      }}>
        {LINKS.map(({ label, to }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="nav-link"
              style={{
                borderRadius: "10px",
                fontWeight: 500,
                textDecoration: "none",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                background: active ? "rgba(255,255,255,0.1)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div style={{
        position: "fixed",
        top: "12px",
        right: "12px",
        zIndex: 1000,
      }}>
        <button
          onClick={logout}
          className="nav-logout"
          style={{
            borderRadius: "10px",
            fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
            color: "rgba(255,255,255,0.45)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
}

export default NavBar;