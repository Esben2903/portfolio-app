const API_URL = "https://portfolio-app-production-b439.up.railway.app";

// -------------------------
// TOKEN
// -------------------------
function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// -------------------------
// PORTFOLIO
// -------------------------
export async function getPortfolio() {
  const res = await fetch(`${API_URL}/portfolio/fifo`, { headers: authHeaders() });
  if (res.status === 401) { logout(); return; }
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

// -------------------------
// STOCKS
// -------------------------
export async function getStocks() {
  const res = await fetch(`${API_URL}/stocks`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch stocks");
  return res.json();
}

// -------------------------
// TRADES
// -------------------------
export async function getTrades() {
  const res = await fetch(`${API_URL}/trades`, { headers: authHeaders() });
  if (res.status === 401) { logout(); return; }
  if (!res.ok) throw new Error("Failed to fetch trades");
  return res.json();
}

// -------------------------
// CREATE TRADE
// -------------------------
export async function createTrade(trade) {
  const res = await fetch(`${API_URL}/trades`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(trade),
  });

  if (res.status === 401) { logout(); return; }

  if (!res.ok) {
    let message = "Trade failed";
    try {
      const data = await res.json();
      if (data.detail) message = data.detail;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

// -------------------------
// REALIZED
// -------------------------
export async function getRealizedTrades() {
  const res = await fetch(`${API_URL}/portfolio/realized`, { headers: authHeaders() });
  if (res.status === 401) { logout(); return; }
  if (!res.ok) throw new Error("Failed to fetch realized trades");
  return res.json();
}

export async function getRealizedMonthly() {
  const res = await fetch(`${API_URL}/portfolio/realized/monthly`, { headers: authHeaders() });
  if (res.status === 401) { logout(); return; }
  if (!res.ok) throw new Error("Failed to fetch monthly realized");
  return res.json();
}

// -------------------------
// AUTH
// -------------------------
export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  const data = await res.json();
  localStorage.setItem("token", data.access_token);
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}


export async function register(username, password, inviteCode) {
  const res = await fetch(
    `${API_URL}/auth/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&invite_code=${encodeURIComponent(inviteCode)}`,
    { method: "POST" }
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Registration failed");
  }
  return res.json();
}