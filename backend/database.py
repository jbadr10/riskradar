import sqlite3
import json
from datetime import datetime

DB_PATH = "riskradar.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS company_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            name TEXT,
            sector TEXT,
            risk_label TEXT,
            risk_score INTEGER,
            current_price REAL,
            market_cap REAL,
            data_json TEXT,
            searched_at TEXT
        )
    """)
    
    conn.commit()
    conn.close()

def save_company(ticker, profile, price_data, financials, risk):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO company_snapshots 
        (ticker, name, sector, risk_label, risk_score, current_price, market_cap, data_json, searched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticker,
        profile.get("name"),
        profile.get("sector"),
        risk.get("label"),
        risk.get("score"),
        price_data.get("price"),
        profile.get("market_cap"),
        json.dumps({"profile": profile, "price_data": price_data, "financials": financials, "risk": risk}),
        datetime.now().isoformat()
    ))
    
    conn.commit()
    conn.close()

def get_recent_searches(limit=10):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT ticker, name, sector, risk_label, risk_score, current_price, searched_at
        FROM company_snapshots
        ORDER BY searched_at DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "ticker": row[0],
            "name": row[1],
            "sector": row[2],
            "risk_label": row[3],
            "risk_score": row[4],
            "current_price": row[5],
            "searched_at": row[6],
        }
        for row in rows
    ]