import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
      if (!response.ok) throw new Error("Company not found. Check the ticker symbol.");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.financials?.map((year) => ({
    date: year.date.slice(0, 4),
    Revenue: parseFloat((year.revenue / 1e9).toFixed(1)),
    "Net Income": parseFloat((year.net_income / 1e9).toFixed(1)),
  })).reverse();

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "20px 40px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div>
          <h1 style={{ color: "white", margin: 0, fontSize: "24px", fontWeight: "700" }}>RiskRadar</h1>
          <p style={{ color: "#8888aa", margin: 0, fontSize: "13px" }}>Public Company Financial Risk Intelligence</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: "white", padding: "30px 40px", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ maxWidth: "600px", display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Enter ticker symbol (e.g. AAPL, MSFT, TD)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && search()}
            style={{ padding: "12px 16px", fontSize: "15px", flex: 1, borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
          />
          <button
            onClick={search}
            style={{ padding: "12px 28px", fontSize: "15px", borderRadius: "8px", background: "#0070f3", color: "white", border: "none", cursor: "pointer", fontWeight: "600" }}
          >
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>
        {error && <p style={{ color: "#dc3545", marginTop: "10px", fontSize: "14px" }}>{error}</p>}
      </div>

      {/* Results */}
      {data && (
        <div style={{ maxWidth: "1000px", margin: "30px auto", padding: "0 20px" }}>
          
          {/* Company Header */}
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

          {/* Metric Cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            <MetricCard
              title="Market Cap"
              value={`$${(data.profile.market_cap / 1e9).toFixed(0)}B`}
              subtitle="Total market value"
            />
            <MetricCard
              title="52-Week High"
              value={`$${data.price_data.fifty_two_week_high}`}
              subtitle="Yearly high"
            />
            <MetricCard
              title="52-Week Low"
              value={`$${data.price_data.fifty_two_week_low}`}
              subtitle="Yearly low"
            />
            <MetricCard
              title="Volume"
              value={data.price_data.volume?.toLocaleString()}
              subtitle="Shares traded today"
            />
          </div>

          {/* Risk Assessment */}
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

          {/* Chart */}
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 20px", color: "#1a1a2e" }}>Revenue vs Net Income (Billions USD)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}B`} />
                <Line type="monotone" dataKey="Revenue" stroke="#0070f3" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Net Income" stroke="#28a745" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Table */}
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

          {/* Company Description */}
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 12px", color: "#1a1a2e" }}>About {data.profile.name}</h3>
            <p style={{ color: "#555", lineHeight: "1.7", fontSize: "14px", margin: 0 }}>{data.profile.description}</p>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;