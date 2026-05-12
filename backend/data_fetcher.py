import yfinance as yf
import requests
import os
from dotenv import load_dotenv

load_dotenv()

AV_KEY = os.getenv("ALPHA_VANTAGE_KEY")

def get_company_profile(ticker):
    stock = yf.Ticker(ticker)
    info = stock.info
    
    if not info or "shortName" not in info:
        return None
    
    return {
        "name": info.get("shortName"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "description": info.get("longBusinessSummary"),
        "market_cap": info.get("marketCap"),
        "country": info.get("country"),
        "website": info.get("website"),
    }

def get_stock_price(ticker):
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={AV_KEY}"
    response = requests.get(url)
    data = response.json()
    
    quote = data.get("Global Quote", {})
    
    return {
        "price": quote.get("05. price"),
        "change_percent": quote.get("10. change percent"),
        "volume": quote.get("06. volume"),
    }

def get_financial_statements(ticker):
    stock = yf.Ticker(ticker)
    
    financials = stock.financials
    
    if financials is None or financials.empty:
        return None
    
    statements = []
    for date in financials.columns[:3]:
        statements.append({
            "date": str(date.date()),
            "revenue": financials.loc["Total Revenue", date] if "Total Revenue" in financials.index else None,
            "net_income": financials.loc["Net Income", date] if "Net Income" in financials.index else None,
            "gross_profit": financials.loc["Gross Profit", date] if "Gross Profit" in financials.index else None,
        })
    
    return statements