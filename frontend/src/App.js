import { useState } from "react";

function App() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/company/${ticker}`);
      if (!response.ok) throw new Error("Company not found");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>RiskRadar</h1>
      <p>Public Company Financial Risk Intelligence</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter ticker symbol (e.g. AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && search()}
          style={{ padding: "10px", fontSize: "16px", flex: 1, borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button
          onClick={search}
          style={{ padding: "10px 20px", fontSize: "16px", borderRadius: "6px", background: "#0070f3", color: "white", border: "none", cursor: "pointer" }}
        >
          Analyze
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <h2>{data.profile.name} ({data.ticker})</h2>
          <p>{data.profile.sector} — {data.profile.industry}</p>
          <p>Current Price: ${data.price_data.price}</p>

          <div style={{ background: data.risk.color === "green" ? "#d4edda" : data.risk.color === "yellow" ? "#fff3cd" : "#f8d7da", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <h3>Risk Assessment: {data.risk.label}</h3>
            <ul>
              {data.risk.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
            </ul>
          </div>

          <h3>Financial Summary</h3>
          {data.financials.map((year) => (
            <div key={year.date} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
              <strong>{year.date}</strong>
              <p>Revenue: ${(year.revenue / 1e9).toFixed(1)}B</p>
              <p>Net Income: ${(year.net_income / 1e9).toFixed(1)}B</p>
              <p>Gross Profit: ${(year.gross_profit / 1e9).toFixed(1)}B</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;