from fastapi import FastAPI, HTTPException # importing the FastAPI class from the fastapi module
from fastapi.middleware.cors import CORSMiddleware 
from data_fetcher import get_stock_price, get_company_profile, get_financial_statements # importing functions from the data_fetcher module
from risk_scorer import calculate_risk_score

app = FastAPI() # creating an instance of the FastAPI application

app.add_middleware( 
# frontend vs backend communication, allowing cross-origin requests from the 
# specified origin (localhost:3000)
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/") 
# route for the root endpoint, 
# which returns a simple message indicating that the API is running
def root():
    return {"message": "RiskRadar API is running"}

@app.get("/api/company/{ticker}") 
# route for getting company information based on the ticker symbol, 
#  currently returns a placeholder response indicating that the feature is coming soon
def get_company(ticker: str):
    ticker = ticker.upper()
    
    profile = get_company_profile(ticker)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Company {ticker} not found")
    
    price_data = get_stock_price(ticker)
    financials = get_financial_statements(ticker)

    risk = calculate_risk_score(financials, price_data, profile)


    return {
        "profile": profile,
        "price_data": price_data,
        "financials": financials,
        "risk": risk,
    }   

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

