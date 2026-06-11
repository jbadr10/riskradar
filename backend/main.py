from fastapi import FastAPI, HTTPException # importing the FastAPI class from the fastapi module
from fastapi.middleware.cors import CORSMiddleware 
from data_fetcher import get_stock_price, get_company_profile, get_financial_statements, get_price_history
from risk_scorer import calculate_risk_score
from database import init_db, save_company, get_recent_searches


app = FastAPI() # creating an instance of the FastAPI application
init_db() # initializing the database by calling the init_db function from the database module


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://riskradar-sqkq.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/") 
# route for the root endpoint, 
# which returns a simple message indicating that the API is running
def root():
    return {"message": "RiskRadar API is running"}

from fastapi import HTTPException
import traceback

@app.get("/api/company/{ticker}")
def get_company(ticker: str):
    try:
        ticker = ticker.upper()

        print("STEP 1: getting profile")
        profile = get_company_profile(ticker)
        if not profile:
            raise HTTPException(status_code=404, detail=f"Company {ticker} not found")

        print("STEP 2: getting stock price")
        price_data = get_stock_price(ticker)

        print("STEP 3: getting financial statements")
        financials = get_financial_statements(ticker)

        print("STEP 4: getting price history")
        price_history = get_price_history(ticker)

        print("STEP 5: calculating risk")
        risk = calculate_risk_score(financials, price_data, profile)

        # TEMPORARILY DISABLE THIS
        # print("STEP 6: saving company")
        # save_company(ticker, profile, price_data, financials, risk)

        print("STEP 7: returning response")
        return {
            "ticker": ticker,
            "profile": profile,
            "price_data": price_data,
            "financials": financials,
            "risk": risk,
            "price_history": price_history,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("BACKEND ERROR:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/compare/{ticker1}/{ticker2}")
def compare_companies(ticker1: str, ticker2: str):
    ticker1 = ticker1.upper()
    ticker2 = ticker2.upper()
    
    profile1 = get_company_profile(ticker1)
    profile2 = get_company_profile(ticker2)

    if not profile1:
        raise HTTPException(status_code=404, detail=f"Company {ticker1} not found")
    if not profile2:
        raise HTTPException(status_code=404, detail=f"Company {ticker2} not found")
    
    price_data1 = get_stock_price(ticker1)
    price_data2 = get_stock_price(ticker2)

    financials1 = get_financial_statements(ticker1)
    financials2 = get_financial_statements(ticker2)

    risk1 = calculate_risk_score(financials1, price_data1, profile1)
    risk2 = calculate_risk_score(financials2, price_data2, profile2)
    save_company(ticker1, profile1, price_data1, financials1, risk1)
    save_company(ticker2, profile2, price_data2, financials2, risk2)

    return {
        "company1": {
            "profile": profile1,
            "price_data": price_data1,
            "financials": financials1,
            "risk": risk1,
        },
        "company2": {
            "profile": profile2,
            "price_data": price_data2,
            "financials": financials2,
            "risk": risk2,
        },
    }

@app.get("/api/recent")
def recent_searches():
    return get_recent_searches()