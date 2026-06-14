from collections import deque


# -----------------------
# FIFO CALCULATION
# -----------------------
def calculate_fifo(trades):
    lots = deque()
    realized_pnl = 0.0

    for t in trades:
        trade_type = t.trade_type
        qty = float(t.quantity)
        price = float(t.price)

        if trade_type == "BUY":
            lots.append({
                "quantity": qty,
                "price": price
            })

        elif trade_type == "SELL":
            qty_to_sell = qty
            sell_price = price

            while qty_to_sell > 0 and lots:
                lot = lots[0]

                lot_qty = lot["quantity"]
                lot_price = lot["price"]

                # partial sell
                if lot_qty > qty_to_sell:
                    realized_pnl += qty_to_sell * (sell_price - lot_price)
                    lot["quantity"] -= qty_to_sell
                    qty_to_sell = 0

                # full lot
                else:
                    realized_pnl += lot_qty * (sell_price - lot_price)
                    qty_to_sell -= lot_qty
                    lots.popleft()

    return lots, realized_pnl

##monthly realized 
# ADD THIS NEW FUNCTION
def group_realized_by_month(realized_trades):
    monthly = {}

    for rt in realized_trades:
        key = rt["date"].strftime("%Y-%m")
        monthly[key] = monthly.get(key, 0.0) + rt["pnl"]

    result = [
        {"month": k, "pnl": round(v, 2)}
        for k, v in monthly.items()
    ]

    result.sort(key=lambda x: x["month"], reverse=True)

    return result


## History

# ADD THIS NEW FUNCTION — does not touch calculate_fifo
def calculate_fifo_with_history(trades):
    lots = deque()
    realized_pnl = 0.0
    realized_trades = []

    for t in trades:
        trade_type = t.trade_type
        qty = float(t.quantity)
        price = float(t.price)
        date = t.created_at

        if trade_type == "BUY":
            lots.append({"quantity": qty, "price": price})

        elif trade_type == "SELL":
            qty_to_sell = qty
            sell_price = price

            while qty_to_sell > 0 and lots:
                lot = lots[0]
                lot_qty = lot["quantity"]
                lot_price = lot["price"]

                if lot_qty > qty_to_sell:
                    matched_qty = qty_to_sell
                    pnl = matched_qty * (sell_price - lot_price)
                    lot["quantity"] -= matched_qty
                    qty_to_sell = 0
                else:
                    matched_qty = lot_qty
                    pnl = matched_qty * (sell_price - lot_price)
                    qty_to_sell -= matched_qty
                    lots.popleft()

                realized_pnl += pnl

                realized_trades.append({
                    "date": date,
                    "quantity": matched_qty,
                    "buy_price": lot_price,
                    "sell_price": sell_price,
                    "pnl": pnl
                })

    return lots, realized_pnl, realized_trades

# -----------------------
# PORTFOLIO BUILDER (SAFE)
# -----------------------
def build_portfolio(lots, current_price, realized_pnl, ticker=None):

    total_qty = sum(l["quantity"] for l in lots)

    total_cost = sum(
        l["quantity"] * l["price"]
        for l in lots
    )

    avg_price = (
        total_cost / total_qty
        if total_qty > 0 else 0
    )

    # -----------------------
    # SAFETY CHECK (CRITICAL)
    # -----------------------
    if current_price is None:
        print(f"⚠️ Missing price for {ticker}")

        return {
            "shares": total_qty,
            "avg_price": avg_price,
            "live_price": 0,
            "total_invest": total_cost,
            "market_value": 0,
            "unrealized_pnl": 0,
            "realized_pnl": realized_pnl,
            "total_pnl": realized_pnl,
            "status": "PRICE_MISSING"
        }

    # -----------------------
    # SAFE CALCULATIONS
    # -----------------------
    market_value = current_price * total_qty
    unrealized_pnl = market_value - total_cost
    total_pnl = realized_pnl + unrealized_pnl

    return {
        "shares": total_qty,
        "avg_price": avg_price,
        "live_price": current_price,
        "total_invest": total_cost,
        "market_value": market_value,
        "unrealized_pnl": unrealized_pnl,
        "realized_pnl": realized_pnl,
        "total_pnl": total_pnl,
        "status": "OK"
    }