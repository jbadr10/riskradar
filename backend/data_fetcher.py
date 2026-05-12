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
    stock = yf.Ticker(ticker)
    info = stock.info
    
    return {
        "price": info.get("currentPrice"),
        "change_percent": info.get("52WeekChange"),
        "volume": info.get("volume"),
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
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