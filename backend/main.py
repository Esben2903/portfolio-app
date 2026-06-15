from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import Literal

from auth import verify_password, create_access_token, decode_token, oauth2_scheme, hash_password
from fastapi.security import OAuth2PasswordRequestForm
from services.portfolio_service import calculate_fifo, build_portfolio, calculate_fifo_with_history, group_realized_by_month
from services.market_data import get_live_price, get_portfolio_prices

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# DATABASE
import os

_db_url = os.environ.get("DATABASE_URL", "postgresql+psycopg2://postgres:project26@localhost:5432/data")

if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

DATABASE_URL = _db_url

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
# -----------------------
# GET CURRENT USER
# -----------------------
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"id": int(payload["sub"]), "username": payload["username"]}

# -----------------------
# MODELS
# -----------------------
class TradeCreate(BaseModel):
    trade_type: Literal["BUY", "SELL"]
    ticker: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0)
    price: float = Field(..., gt=0)

# -----------------------
# AUTH
# -----------------------
@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    try:
        

        user = db.execute(
            text("SELECT id, username, hashed_password FROM users WHERE username = :username"),
            {"username": form_data.username}
        ).fetchone()

        

        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token({"sub": str(user.id), "username": user.username})
        return {"access_token": token, "token_type": "bearer"}

    finally:
        db.close()


@app.post("/auth/register")
def register(username: str, password: str, invite_code: str):
    db = SessionLocal()
    try:
        valid = db.execute(
            text("SELECT code FROM invite_codes WHERE code = :code"),
            {"code": invite_code}
        ).fetchone()

        if not valid:
            raise HTTPException(status_code=400, detail="Invalid invite code")

        existing = db.execute(
            text("SELECT id FROM users WHERE username = :username"),
            {"username": username}
        ).fetchone()

        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")

        hashed = hash_password(password)
        db.execute(
            text("INSERT INTO users (username, hashed_password) VALUES (:username, :hashed_password)"),
            {"username": username, "hashed_password": hashed}
        )
        db.commit()
        return {"message": f"User '{username}' created"}

    finally:
        db.close()
    

# -----------------------
# STOCKS
# -----------------------
@app.get("/stocks")
def get_stocks():
    db = SessionLocal()
    try:
        result = db.execute(text("""
            SELECT id, ticker, name
            FROM stocks
            ORDER BY ticker
        """))

        return [
            {"id": row.id, "ticker": row.ticker, "name": row.name}
            for row in result
        ]
    finally:
        db.close()

# -----------------------
# TRADES
# -----------------------
@app.get("/trades")
def get_trades(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(text("""
            SELECT
                t.id,
                s.ticker,
                s.name,
                t.trade_type,
                t.quantity,
                t.price,
                t.created_at
            FROM trades t
            JOIN stocks s ON t.stock_id = s.id
            WHERE t.user_id = :user_id
            ORDER BY t.created_at DESC
        """), {"user_id": current_user["id"]})

        return [
            {
                "id": row.id,
                "ticker": row.ticker,
                "name": row.name,
                "trade_type": row.trade_type,
                "quantity": float(row.quantity),
                "price": float(row.price),
                "created_at": row.created_at
            }
            for row in result
        ]
    finally:
        db.close()

# -----------------------
# ADD TRADE
# -----------------------
@app.post("/trades")
def add_trade(trade: TradeCreate, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        if trade.trade_type not in ["BUY", "SELL"]:
            raise HTTPException(400, "trade_type muss BUY oder SELL sein")

        stock = db.execute(
            text("SELECT id FROM stocks WHERE ticker = :ticker"),
            {"ticker": trade.ticker.upper()}
        ).fetchone()

        if not stock:
            raise HTTPException(404, "Ticker nicht gefunden")

        stock_id = stock.id

        if trade.trade_type == "SELL":
            result = db.execute(text("""
                SELECT COALESCE(SUM(
                    CASE
                        WHEN trade_type = 'BUY' THEN quantity
                        ELSE -quantity
                    END
                ), 0)
                FROM trades
                WHERE stock_id = :stock_id AND user_id = :user_id
            """), {"stock_id": stock_id, "user_id": current_user["id"]}).fetchone()

            owned = float(result[0])
            if owned < trade.quantity:
                raise HTTPException(400, "Nicht genug Aktien vorhanden")

        db.execute(text("""
            INSERT INTO trades (stock_id, trade_type, quantity, price, user_id)
            VALUES (:stock_id, :trade_type, :quantity, :price, :user_id)
        """), {
            "stock_id": stock_id,
            "trade_type": trade.trade_type,
            "quantity": trade.quantity,
            "price": trade.price,
            "user_id": current_user["id"]
        })

        db.commit()
        return {"message": "Trade gespeichert"}

    finally:
        db.close()

# -----------------------
# PORTFOLIO FIFO
# -----------------------
@app.get("/portfolio/fifo")
def get_portfolio_fifo(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        stocks = db.execute(text("""
            SELECT DISTINCT s.id, s.ticker, s.name
            FROM stocks s
            JOIN trades t ON t.stock_id = s.id
            WHERE t.user_id = :user_id
            ORDER BY s.ticker
        """), {"user_id": current_user["id"]}).fetchall()

        result = []
        total_realized_pnl = 0
        total_unrealized_pnl = 0
        total_market_value = 0
        prepared_positions = []
        open_tickers = []

        for stock in stocks:
            trades = db.execute(text("""
                SELECT trade_type, quantity, price
                FROM trades
                WHERE stock_id = :stock_id AND user_id = :user_id
                ORDER BY created_at ASC, id ASC
            """), {"stock_id": stock.id, "user_id": current_user["id"]}).fetchall()

            lots, realized_pnl = calculate_fifo(trades)

            shares = sum(lot["quantity"] for lot in lots)
            total_realized_pnl += realized_pnl

            if shares <= 0:
                continue

            prepared_positions.append({
                "stock": stock,
                "lots": lots,
                "realized_pnl": realized_pnl
            })
            open_tickers.append(stock.ticker)

        live_prices = get_portfolio_prices(open_tickers)

        for item in prepared_positions:
            stock = item["stock"]
            live_price = live_prices.get(stock.ticker)
            portfolio = build_portfolio(item["lots"], live_price, item["realized_pnl"])

            if portfolio["unrealized_pnl"] is not None:
                total_unrealized_pnl += portfolio["unrealized_pnl"]
            if portfolio["market_value"] is not None:
                total_market_value += portfolio["market_value"]

            result.append({
                "ticker": stock.ticker,
                "name": stock.name,
                "status": "OPEN",
                **portfolio
            })

        return {
            "positions": result,
            "summary": {
                "total_realized_pnl": round(total_realized_pnl, 2),
                "total_unrealized_pnl": round(total_unrealized_pnl, 2),
                "total_pnl": round(total_realized_pnl + total_unrealized_pnl, 2),
                "total_market_value": round(total_market_value, 2)
            }
        }

    finally:
        db.close()

# -----------------------
# REALIZED TRADES
# -----------------------
@app.get("/portfolio/realized")
def get_realized_trades(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        stocks = db.execute(text("""
            SELECT DISTINCT s.id, s.ticker, s.name
            FROM stocks s
            JOIN trades t ON t.stock_id = s.id
            WHERE t.user_id = :user_id
            ORDER BY s.ticker
        """), {"user_id": current_user["id"]}).fetchall()

        all_realized = []

        for stock in stocks:
            trades = db.execute(text("""
                SELECT trade_type, quantity, price, created_at
                FROM trades
                WHERE stock_id = :stock_id AND user_id = :user_id
                ORDER BY created_at ASC, id ASC
            """), {"stock_id": stock.id, "user_id": current_user["id"]}).fetchall()

            _, _, realized_trades = calculate_fifo_with_history(trades)

            for rt in realized_trades:
                all_realized.append({
                    "ticker": stock.ticker,
                    "name": stock.name,
                    **rt
                })

        all_realized.sort(key=lambda x: x["date"], reverse=True)
        return {"realized_trades": all_realized}

    finally:
        db.close()

# -----------------------
# REALIZED MONTHLY
# -----------------------
@app.get("/portfolio/realized/monthly")
def get_realized_monthly(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        stocks = db.execute(text("""
            SELECT DISTINCT s.id, s.ticker, s.name
            FROM stocks s
            JOIN trades t ON t.stock_id = s.id
            WHERE t.user_id = :user_id
            ORDER BY s.ticker
        """), {"user_id": current_user["id"]}).fetchall()

        all_realized = []

        for stock in stocks:
            trades = db.execute(text("""
                SELECT trade_type, quantity, price, created_at
                FROM trades
                WHERE stock_id = :stock_id AND user_id = :user_id
                ORDER BY created_at ASC, id ASC
            """), {"stock_id": stock.id, "user_id": current_user["id"]}).fetchall()

            _, _, realized_trades = calculate_fifo_with_history(trades)
            all_realized.extend(realized_trades)

        monthly = group_realized_by_month(all_realized)
        return {"monthly": monthly}

    finally:
        db.close()