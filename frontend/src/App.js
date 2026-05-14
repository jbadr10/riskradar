import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

function RiskBadge({ label, color }) {
  const colors = {
    green: { background: "#d4edda", color: "#155724", border: "#c3e6cb" },
    yellow: { background: "#fff3cd", color: "#856404", border: "#ffeeba" },
    red: { background: "#f8d7da", color: "#721c24", border: "#f5c6cb" },
  };
  const style = colors[color] || colors.yellow;
  return (
    <span style={{ ...style, padding: "6px 16px", borderRadius: "20px", fontWeight: "600", fontSize: "14px", border: `1px solid ${style.border}` }}>
      {label}
    </span>
  );
}

function MetricCard({ title, value, subtitle }) {
  return (
    <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "20px", flex: 1, minWidth: "150px" }}>
      <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e" }}>{value}</div>
      {subtitle && <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{subtitle}</div>}
    </div>
  );
}

function CompanyCard({ company }) {
  const chartData = company.financials?.map((year) => ({
    date: year.date.slice(0, 4),
    Revenue: parseFloat((year.revenue / 1e9).toFixed(1)),
    "Net Income": parseFloat((year.net_income / 1e9).toFixed(1)),
  })).reverse();

  return (
    <div style={{ flex: 1, minWidth: "300px" }}>
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "20px", color: "#1a1a2e" }}>{company.profile.name}</h2>
        <p style={{ margin: "0 0 8px", color: "#666", fontSize: "13px" }}>{company.profile.sector} — {company.profile.industry}</p>
        <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e", margin: "12px 0 4px" }}>${company.price_data.price}</div>
        <RiskBadge label={company.risk.label} color={company.risk.color} />
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: "#1a1a2e" }}>Risk Assessment</h3>
        <div style={{ marginBottom: "10px" }}>
          <span style={{ color: "#666", fontSize: "13px" }}>Score: {company.risk.score} / 5</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: "18px", color: "#444", lineHeight: "1.8", fontSize: "13px" }}>
          {company.risk.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
        </ul>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px", color: "#1a1a2e" }}>Revenue vs Net Income</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => `$${value}B`} />
            <Line type="monotone" dataKey="Revenue" stroke="#0070f3" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Net Income" stroke="#28a745" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: "#1a1a2e" }}>Financials</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "8px", color: "#666" }}>Year</th>
              <th style={{ textAlign: "right", padding: "8px", color: "#666" }}>Revenue</th>
              <th style={{ textAlign: "right", padding: "8px", color: "#666" }}>Net Income</th>
            </tr>
          </thead>
          <tbody>
            {company.financials.map((year) => (
              <tr key={year.date} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "8px", fontWeight: "600" }}>{year.date.slice(0, 4)}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>${(year.revenue / 1e9).toFixed(1)}B</td>
                <td style={{ padding: "8px", textAlign: "right" }}>${(year.net_income / 1e9).toFixed(1)}B</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);


  const [mode, setMode] = useState("single");
  const [ticker1, setTicker1] = useState("");
  const [ticker2, setTicker2] = useState("");
  const [compareData, setCompareData] = useState(null);

  const search = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setData(null);
    setCompareData(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/company/${ticker}`);
      if (!response.ok) throw new Error("Company not found. Check the ticker symbol.");
      const result = await response.json();
      setData(result);
      loadRecent();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const compare = async () => {
    if (!ticker1 || !ticker2) return;
    setLoading(true);
    setError(null);
    setData(null);
    setCompareData(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/compare/${ticker1}/${ticker2}`);
      if (!response.ok) throw new Error("One or both companies not found.");
      const result = await response.json();
      setCompareData(result);
      loadRecent();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const loadRecent = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/recent");
    const result = await response.json();
    const unique = result.filter((item, index, self) =>
        index === self.findIndex((r) => r.ticker === item.ticker)
    );
    setRecent(unique);
};

  const compareChartData = compareData ? compareData.company1.financials.map((year, i) => ({
    date: year.date.slice(0, 4),
    [compareData.company1.profile.name.split(" ")[0]]: parseFloat((year.revenue / 1e9).toFixed(1)),
    [compareData.company2.profile.name.split(" ")[0]]: parseFloat((compareData.company2.financials[i]?.revenue / 1e9).toFixed(1)),
  })).reverse() : [];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "20px 40px" }}>
        <h1 style={{ color: "white", margin: "0 0 4px", fontSize: "24px", fontWeight: "700" }}>RiskRadar</h1>
        <p style={{ color: "#8888aa", margin: 0, fontSize: "13px" }}>Public Company Financial Risk Intelligence</p>
      </div>

{recent.length > 0 && (
        <div style={{ background: "white", padding: "12px 40px", borderBottom: "1px solid #e0e0e0", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>Recent:</span>
          {recent.map((r, i) => (
            <button
              key={i}
              onClick={() => { setTicker(r.ticker); setMode("single"); }}
              style={{ padding: "4px 12px", borderRadius: "20px", border: "1px solid #ddd", background: "#f8f9fa", fontSize: "13px", cursor: "pointer", color: "#444" }}
            >
              {r.ticker} · {r.risk_label}
            </button>
          ))}
        </div>
      )}

      {/* Mode Toggle */}
      <div style={{ background: "white", padding: "20px 40px", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <button
            onClick={() => setMode("single")}
            style={{ padding: "8px 20px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: mode === "single" ? "#0070f3" : "#f0f2f5", color: mode === "single" ? "white" : "#444" }}
          >
            Single Company
          </button>
          <button
            onClick={() => setMode("compare")}
            style={{ padding: "8px 20px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: mode === "compare" ? "#0070f3" : "#f0f2f5", color: mode === "compare" ? "white" : "#444" }}
          >
            Compare Two Companies
          </button>
        </div>

        {mode === "single" ? (
          <div style={{ maxWidth: "600px", display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Enter ticker symbol (e.g. AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && search()}
              style={{ padding: "12px 16px", fontSize: "15px", flex: 1, borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
            />
            <button onClick={search} style={{ padding: "12px 28px", fontSize: "15px", borderRadius: "8px", background: "#0070f3", color: "white", border: "none", cursor: "pointer", fontWeight: "600" }}>
              {loading ? "Loading..." : "Analyze"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Company A (e.g. AAPL)"
              value={ticker1}
              onChange={(e) => setTicker1(e.target.value.toUpperCase())}
              style={{ padding: "12px 16px", fontSize: "15px", width: "200px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
            />
            <span style={{ fontWeight: "600", color: "#666" }}>vs</span>
            <input
              type="text"
              placeholder="Company B (e.g. MSFT)"
              value={ticker2}
              onChange={(e) => setTicker2(e.target.value.toUpperCase())}
              style={{ padding: "12px 16px", fontSize: "15px", width: "200px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
            />
            <button onClick={compare} style={{ padding: "12px 28px", fontSize: "15px", borderRadius: "8px", background: "#0070f3", color: "white", border: "none", cursor: "pointer", fontWeight: "600" }}>
              {loading ? "Loading..." : "Compare"}
            </button>
          </div>
        )}

        {error && <p style={{ color: "#dc3545", marginTop: "10px", fontSize: "14px" }}>{error}</p>}
      </div>

      {/* Single Company Results */}
      {data && (
        <div style={{ maxWidth: "1000px", margin: "30px auto", padding: "0 20px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "26px", color: "#1a1a2e" }}>{data.profile.name}</h2>
              <p style={{ margin: "0 0 8px", color: "#666", fontSize: "14px" }}>{data.profile.sector} — {data.profile.industry}</p>
              <p style={{ margin: 0, color: "#444", fontSize: "13px" }}>{data.profile.country} · {data.profile.website}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "32px", fontWeight: "700", color: "#1a1a2e" }}>${data.price_data.price}</div>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Current Price</div>
              <RiskBadge label={data.risk.label} color={data.risk.color} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            <MetricCard title="Market Cap" value={`$${(data.profile.market_cap / 1e9).toFixed(0)}B`} subtitle="Total market value" />
            <MetricCard title="52-Week High" value={`$${data.price_data.fifty_two_week_high}`} subtitle="Yearly high" />
            <MetricCard title="52-Week Low" value={`$${data.price_data.fifty_two_week_low}`} subtitle="Yearly low" />
            <MetricCard title="Volume" value={data.price_data.volume?.toLocaleString()} subtitle="Shares traded today" />
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 16px", color: "#1a1a2e" }}>Risk Assessment</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <RiskBadge label={data.risk.label} color={data.risk.color} />
              <span style={{ color: "#666", fontSize: "14px" }}>Score: {data.risk.score} / 5</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#444", lineHeight: "1.8" }}>
              {data.risk.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
            </ul>
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 20px", color: "#1a1a2e" }}>Revenue vs Net Income (Billions USD)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.financials.map((year) => ({ date: year.date.slice(0, 4), Revenue: parseFloat((year.revenue / 1e9).toFixed(1)), "Net Income": parseFloat((year.net_income / 1e9).toFixed(1)) })).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}B`} />
                <Line type="monotone" dataKey="Revenue" stroke="#0070f3" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Net Income" stroke="#28a745" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 16px", color: "#1a1a2e" }}>Financial Summary</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: "10px", color: "#666" }}>Year</th>
                  <th style={{ textAlign: "right", padding: "10px", color: "#666" }}>Revenue</th>
                  <th style={{ textAlign: "right", padding: "10px", color: "#666" }}>Net Income</th>
                  <th style={{ textAlign: "right", padding: "10px", color: "#666" }}>Gross Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.financials.map((year) => (
                  <tr key={year.date} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "600" }}>{year.date.slice(0, 4)}</td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}>${(year.revenue / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}>${(year.net_income / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}>${(year.gross_profit / 1e9).toFixed(1)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 12px", color: "#1a1a2e" }}>About {data.profile.name}</h3>
            <p style={{ color: "#555", lineHeight: "1.7", fontSize: "14px", margin: 0 }}>{data.profile.description}</p>
          </div>
        </div>
      )}

      {/* Compare Results */}
      {compareData && (
        <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
          
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 20px", color: "#1a1a2e" }}>Revenue Comparison (Billions USD)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={compareChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}B`} />
                <Legend />
                <Bar dataKey={compareData.company1.profile.name.split(" ")[0]} fill="#0070f3" />
                <Bar dataKey={compareData.company2.profile.name.split(" ")[0]} fill="#28a745" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <CompanyCard company={compareData.company1} />
            <CompanyCard company={compareData.company2} />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;