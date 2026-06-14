import { useState } from "react";
import { login, register } from "../services/api";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function switchMode(newMode) {
    setMode(newMode);
    setError(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setInviteCode("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await login(username, password);
        navigate("/");
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        await register(username, password, inviteCode);
        await login(username, password);
        navigate("/");
      }
    } catch (err) {
      setError(err.message || (mode === "login" ? "Invalid username or password" : "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  };

  const label = {
    fontSize: "10px",
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,0.45)",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1a1a1a 0%, #0b0b0f 100%)",
      color: "#fff",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "5vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, Inter, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "360px",
        padding: "32px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>

        {/* TOGGLE */}
        <div style={{
          display: "flex",
          gap: "4px",
          padding: "4px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          marginBottom: "28px",
        }}>
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                transition: "all 0.2s ease",
                background: mode === m ? "rgba(255,255,255,0.1)" : "transparent",
                color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
              }}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 500, marginBottom: "6px" }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>
          {mode === "login" ? "Sign in to your portfolio" : "Register with an invite code"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={label}>USERNAME</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={input}
              placeholder="your username"
              autoComplete="username"
            />
          </div>

          <div>
            <label style={label}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label style={label}>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={input}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label style={label}>INVITE CODE</label>
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  style={input}
                  placeholder="enter invite code"
                />
              </div>
            </>
          )}

          {error && (
            <div style={{ fontSize: "12px", color: "#ef4444" }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 500,
              background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s ease",
              marginTop: "4px",
            }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;