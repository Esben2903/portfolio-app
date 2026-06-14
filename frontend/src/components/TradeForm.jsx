import { useEffect, useMemo, useState } from "react";
import { createTrade, getStocks } from "../services/api";

function TradeForm({ onTradeSuccess = () => {} }) {

  // -------------------------
  // TRADE STATE
  // -------------------------
  const [tradeType, setTradeType] = useState("BUY");
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  // -------------------------
  // UI STATE
  // -------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------------
  // STOCK SEARCH
  // -------------------------
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // -------------------------
  // LOAD STOCKS
  // -------------------------
  useEffect(() => {
    loadStocks();
  }, []);

  async function loadStocks() {
    try {
      const data = await getStocks();
      setStocks(data);
    } catch (err) {
      console.error(err);
    }
  }

  // -------------------------
  // FILTERED STOCKS
  // -------------------------
  const filteredStocks = useMemo(() => {

    if (!search.trim()) {
      return [];
    }

    const q = search.toLowerCase();

    return stocks
      .filter((s) => {
        return (
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);

  }, [search, stocks]);

  // -------------------------
  // STYLES
  // -------------------------
  const glass = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(18px)",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    overflow: "hidden",
  };

  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };

  const select = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid #2a2f36",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    transition: "all 0.2s ease",
  };

  const label = {
    fontSize: "10px",
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,0.45)",
    marginBottom: "6px",
    display: "block",
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  async function handleSubmit(e) {

    e.preventDefault();

    setLoading(true);
    setError(null);

    try {

      await createTrade({
        trade_type: tradeType,
        ticker,
        quantity: Number(quantity),
        price: Number(price),
      });

      // RESET
      setTicker("");
      setSearch("");
      setQuantity("");
      setPrice("");

      onTradeSuccess();

    } catch (err) {

      setError(err.message || "Trade failed");

    } finally {

      setLoading(false);
    }
  }

  return (
    <div style={glass}>

      {/* HEADER */}
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>
            Trade Execution
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Market order interface
          </div>
        </div>

        <div
          style={{
            fontSize: "11px",
            padding: "6px 10px",
            borderRadius: "999px",
            background:
              tradeType === "BUY"
                ? "rgba(34,197,94,0.12)"
                : "rgba(239,68,68,0.12)",
            color:
              tradeType === "BUY"
                ? "#22c55e"
                : "#ef4444",
          }}
        >
          {tradeType}
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 14px",
          alignItems: "start",
        }}
      >

        {/* TYPE */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={label}>TYPE</label>

          <select
            value={tradeType}
            onChange={(e) => setTradeType(e.target.value)}
            style={select}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        {/* ASSET SEARCH */}
        <div style={{ position: "relative" }}>

          <label style={label}>ASSET</label>

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={input}
            placeholder="Apple, Tesla, NVIDIA..."
          />

          {/* SUGGESTIONS */}
          {showSuggestions && filteredStocks.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "75px",
                left: 0,
                right: 0,
                background: "#111",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                overflow: "hidden",
                zIndex: 100,
                boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
              }}
            >

              {filteredStocks.map((stock) => (
                <div
                  key={stock.ticker}
                  onClick={() => {
                    setTicker(stock.ticker);
                    setSearch(
                      `${stock.name} (${stock.ticker})`
                    );
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: "12px 14px",
                    cursor: "pointer",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "transparent";
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#fff",
                    }}
                  >
                    {stock.name}
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.45)",
                      marginTop: "2px",
                    }}
                  >
                    {stock.ticker}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUANTITY */}
        <div>
          <label style={label}>QUANTITY</label>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={input}
            placeholder="0"
          />
        </div>

        {/* PRICE */}
        <div>
          <label style={label}>PRICE</label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={input}
            placeholder="0.00"
          />
        </div>

        {/* ACTION */}
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "6px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#ef4444",
            }}
          >
            {error}
          </div>

          <button
            type="submit"
            disabled={loading || !ticker}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              fontSize: "12px",
              letterSpacing: "0.08em",
              background:
                tradeType === "BUY"
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #ef4444, #dc2626)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Executing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TradeForm;