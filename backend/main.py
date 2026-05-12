from fastapi import FastAPI # importing the FastAPI class from the fastapi module
from fastapi.middleware.cors import CORSMiddleware 
app = FastAPI() # creating an instance of the FastAPI application


app.add_middleware( # frontend vs backend communication, allowing cross-origin requests from the specified origin (localhost:3000)
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "RiskRadar API is running"}

@app.get("/api/company/{ticker}")
def get_company(ticker: str):
    return {"ticker": ticker.upper(), "status": "coming soon"}

