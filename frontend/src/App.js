import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const globalStyles = document.createElement("style");
globalStyles.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #ffffff; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
`;
document.head.appendChild(globalStyles);

function RiskBadge({ label, color }) {
  const styles = {
    green: { background: "#f0fdf4", color: "#15803d", border: "1.5px solid #bbf7d0" },
    yellow: { background: "#fffbeb", color: "#b45309", border: "1.5px solid #fde68a" },
    red: { background: "#fef2f2", color: "#b91c1c", border: "1.5px solid #fecaca" },
  };
  const s = styles[color] || styles.yellow;
  return (
    <span style={{ ...s, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
      {label}
    </span>
  );
}

function RiskGauge({ score, label, color }) {
  const maxScore = 5;
  const percentage = Math.min((score / maxScore) * 100, 100);
  const gaugeColor = color === "green" ? "#16a34a" : color === "yellow" ? "#d97706" : "#dc2626";
  const bgColor = color === "green" ? "#f0fdf4" : color === "yellow" ? "#fffbeb" : "#fef2f2";
  const borderColor = color === "green" ? "#bbf7d0" : color === "yellow" ? "#fde68a" : "#fecaca";

  const radius = 54;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      <div style={{ position: "relative", width: "140px", height: "80px", overflow: "hidden" }}>
        <svg width="140" height="110" viewBox="0 0 140 110">
          <path
            d="M 14 84 A 54 54 0 0 1 126 84"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 14 84 A 54 54 0 0 1 126 84"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
          <text x="70" y="78" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0a0a0a">{score}</text>
          <text x="70" y="94" textAnchor="middle" fontSize="10" fill="#9ca3af">out of {maxScore}</text>
        </svg>
      </div>
      <div style={{ background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: "20px", padding: "6px 16px", marginTop: "8px" }}>
        <span style={{ color: gaugeColor, fontSize: "13px", fontWeight: "700" }}>{label}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "140px", marginTop: "8px" }}>
        <span style={{ color: "#16a34a", fontSize: "10px", fontWeight: "600" }}>Low</span>
        <span style={{ color: "#d97706", fontSize: "10px", fontWeight: "600" }}>Moderate</span>
        <span style={{ color: "#dc2626", fontSize: "10px", fontWeight: "600" }}>Elevated</span>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle }) {
  return (
    <div style={{ background: "#f8faff", border: "1.5px solid #e8eeff", borderRadius: "12px", padding: "16px", flex: 1, minWidth: "130px" }}>
      <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{title}</div>
      <div style={{ color: "#0a0a0a", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" }}>{value}</div>
      {subtitle && <div style={{ color: "#9ca3af", fontSize: "11px", marginTop: "3px" }}>{subtitle}</div>}
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
      <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "14px" }}>
        <h2 style={{ color: "#0a0a0a", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "4px" }}>{company.profile.name}</h2>
        <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "12px" }}>{company.profile.sector} — {company.profile.industry}</p>
        <div style={{ fontSize: "28px", fontWeight: "800", color: "#0a0a0a", letterSpacing: "-1px", marginBottom: "8px" }}>${company.price_data.price}</div>
        <RiskBadge label={company.risk.label} color={company.risk.color} />
      </div>

      <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "14px" }}>
        <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Risk Assessment</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <RiskBadge label={company.risk.label} color={company.risk.color} />
          <span style={{ color: "#9ca3af", fontSize: "13px" }}>Score: {company.risk.score} / 5</span>
        </div>
        {company.risk.reasons.map((reason, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: i < company.risk.reasons.length - 1 ? "1px solid #f9fafb" : "none" }}>
            <div style={{ width: "6px", height: "6px", background: "#2563eb", borderRadius: "50%", flexShrink: 0 }}></div>
            <span style={{ color: "#374151", fontSize: "13px" }}>{reason}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "14px" }}>
        <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Revenue vs Net Income</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
            <XAxis dataKey="date" fontSize={11} tick={{ fill: "#9ca3af" }} />
            <YAxis fontSize={11} tick={{ fill: "#9ca3af" }} />
            <Tooltip formatter={(value) => `$${value}B`} />
            <Line type="monotone" dataKey="Revenue" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb" }} />
            <Line type="monotone" dataKey="Net Income" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: "#16a34a" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px" }}>
        <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Financials</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid #f0f0f0" }}>
              <th style={{ textAlign: "left", padding: "8px 0", color: "#9ca3af", fontWeight: "600" }}>Year</th>
              <th style={{ textAlign: "right", padding: "8px 0", color: "#9ca3af", fontWeight: "600" }}>Revenue</th>
              <th style={{ textAlign: "right", padding: "8px 0", color: "#9ca3af", fontWeight: "600" }}>Net Income</th>
            </tr>
          </thead>
          <tbody>
            {company.financials.map((year) => (
              <tr key={year.date} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "10px 0", fontWeight: "700", color: "#0a0a0a" }}>{year.date.slice(0, 4)}</td>
                <td style={{ padding: "10px 0", textAlign: "right", color: "#374151" }}>${(year.revenue / 1e9).toFixed(1)}B</td>
                <td style={{ padding: "10px 0", textAlign: "right", color: "#374151" }}>${(year.net_income / 1e9).toFixed(1)}B</td>
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

  const loadRecent = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/recent");
    const result = await response.json();
    const unique = result.filter((item, index, self) =>
      index === self.findIndex((r) => r.ticker === item.ticker)
    );
    setRecent(unique);
  };

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

  const compareChartData = compareData ? compareData.company1.financials.map((year, i) => ({
    date: year.date.slice(0, 4),
    [compareData.company1.profile.name.split(" ")[0]]: parseFloat((year.revenue / 1e9).toFixed(1)),
    [compareData.company2.profile.name.split(" ")[0]]: parseFloat((compareData.company2.financials[i]?.revenue / 1e9).toFixed(1)),
  })).reverse() : [];

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1.5px solid #f0f0f0", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px", color: "#0a0a0a" }}>
            Risk<span style={{ color: "#2563eb" }}>Radar</span>
          </div>
          <div style={{ color: "#9ca3af", fontSize: "11px", marginTop: "2px" }}>Public Company Financial Risk Intelligence</div>
        </div>
        <div style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "600" }}>Live Market Data</div>
      </div>

      {/* Search */}
      <div style={{ background: "#fafafa", borderBottom: "1.5px solid #f0f0f0", padding: "16px 40px", display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "8px", padding: "3px", gap: "2px", marginRight: "8px" }}>
          <button onClick={() => setMode("single")} style={{ padding: "6px 14px", borderRadius: "6px", border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer", background: mode === "single" ? "white" : "transparent", color: mode === "single" ? "#0a0a0a" : "#9ca3af", boxShadow: mode === "single" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            Single
          </button>
          <button onClick={() => setMode("compare")} style={{ padding: "6px 14px", borderRadius: "6px", border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer", background: mode === "compare" ? "white" : "transparent", color: mode === "compare" ? "#0a0a0a" : "#9ca3af", boxShadow: mode === "compare" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            Compare
          </button>
        </div>

        {mode === "single" ? (
          <>
            <input
              type="text"
              placeholder="Enter ticker (e.g. AAPL, TD, SHOP)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && search()}
              style={{ background: "white", border: "1.5px solid #e5e7eb", color: "#0a0a0a", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", flex: 1, maxWidth: "380px", outline: "none" }}
            />
            <button onClick={search} style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 22px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
              {loading ? "Loading..." : "Analyze"}
            </button>
          </>
        ) : (
          <>
            <input type="text" placeholder="Company A (e.g. AAPL)" value={ticker1} onChange={(e) => setTicker1(e.target.value.toUpperCase())} style={{ background: "white", border: "1.5px solid #e5e7eb", color: "#0a0a0a", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", width: "180px", outline: "none" }} />
            <span style={{ fontWeight: "700", color: "#9ca3af" }}>vs</span>
            <input type="text" placeholder="Company B (e.g. MSFT)" value={ticker2} onChange={(e) => setTicker2(e.target.value.toUpperCase())} style={{ background: "white", border: "1.5px solid #e5e7eb", color: "#0a0a0a", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", width: "180px", outline: "none" }} />
            <button onClick={compare} style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 22px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
              {loading ? "Loading..." : "Compare"}
            </button>
          </>
        )}
        {error && <span style={{ color: "#dc2626", fontSize: "13px" }}>{error}</span>}
      </div>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div style={{ background: "#fafafa", borderBottom: "1.5px solid #f0f0f0", padding: "10px 40px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "700" }}>Recent:</span>
          {recent.map((r, i) => (
            <button key={i} onClick={() => { setTicker(r.ticker); setMode("single"); }}
              style={{ background: "white", border: "1.5px solid #e5e7eb", color: "#374151", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", cursor: "pointer",
                ...(r.risk_label === "Low Risk" ? { borderColor: "#bbf7d0", color: "#15803d", background: "#f0fdf4" } : r.risk_label === "Elevated Risk" ? { borderColor: "#fecaca", color: "#b91c1c", background: "#fef2f2" } : { borderColor: "#fde68a", color: "#b45309", background: "#fffbeb" })
              }}>
              {r.ticker} · {r.risk_label}
            </button>
          ))}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "30px 40px" }}>
          <div style={{ width: "18px", height: "18px", border: "2.5px solid #e5e7eb", borderTop: "2.5px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>Analyzing company data...</span>
        </div>
      )}

      {/* Single company results */}
      {data && (
        <div className="fade-in" style={{ maxWidth: "1000px", margin: "28px auto", padding: "0 24px" }}>

          <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ color: "#0a0a0a", fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "4px" }}>{data.profile.name}</h2>
              <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "6px" }}>{data.profile.sector} — {data.profile.industry}</p>
              <p style={{ color: "#9ca3af", fontSize: "12px" }}>{data.profile.country} · <a href={data.profile.website} style={{ color: "#2563eb" }}>{data.profile.website}</a></p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Current Price</div>
              <div style={{ fontSize: "32px", fontWeight: "800", color: "#0a0a0a", letterSpacing: "-1px" }}>${data.price_data.price}</div>
              <div style={{ marginTop: "8px" }}><RiskBadge label={data.risk.label} color={data.risk.color} /></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <MetricCard title="Market Cap" value={`$${(data.profile.market_cap / 1e9).toFixed(0)}B`} subtitle="Total market value" />
            <MetricCard title="52-Week High" value={`$${data.price_data.fifty_two_week_high}`} subtitle="Yearly high" />
            <MetricCard title="52-Week Low" value={`$${data.price_data.fifty_two_week_low}`} subtitle="Yearly low" />
            <MetricCard title="Volume" value={data.price_data.volume?.toLocaleString()} subtitle="Shares traded today" />
          </div>

<div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>Risk Assessment</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
              <RiskGauge score={data.risk.score} label={data.risk.label} color={data.risk.color} />
              <div style={{ flex: 1, minWidth: "200px", paddingTop: "16px" }}>
                {data.risk.reasons.map((reason, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < data.risk.reasons.length - 1 ? "1px solid #f9fafb" : "none" }}>
                    <div style={{ width: "6px", height: "6px", background: "#2563eb", borderRadius: "50%", flexShrink: 0 }}></div>
                    <span style={{ color: "#374151", fontSize: "14px" }}>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>Revenue vs Net Income (Billions USD)</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.financials.map((year) => ({ date: year.date.slice(0, 4), Revenue: parseFloat((year.revenue / 1e9).toFixed(1)), "Net Income": parseFloat((year.net_income / 1e9).toFixed(1)) })).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip formatter={(value) => `$${value}B`} />
                <Line type="monotone" dataKey="Revenue" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                <Line type="monotone" dataKey="Net Income" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: "#16a34a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>Financial Summary</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #f0f0f0" }}>
                  <th style={{ textAlign: "left", padding: "10px 0", color: "#9ca3af", fontWeight: "600" }}>Year</th>
                  <th style={{ textAlign: "right", padding: "10px 0", color: "#9ca3af", fontWeight: "600" }}>Revenue</th>
                  <th style={{ textAlign: "right", padding: "10px 0", color: "#9ca3af", fontWeight: "600" }}>Net Income</th>
                  <th style={{ textAlign: "right", padding: "10px 0", color: "#9ca3af", fontWeight: "600" }}>Gross Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.financials.map((year) => (
                  <tr key={year.date} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "12px 0", fontWeight: "700", color: "#0a0a0a" }}>{year.date.slice(0, 4)}</td>
                    <td style={{ padding: "12px 0", textAlign: "right", color: "#374151" }}>${(year.revenue / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: "12px 0", textAlign: "right", color: "#374151" }}>${(year.net_income / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: "12px 0", textAlign: "right", color: "#374151" }}>${(year.gross_profit / 1e9).toFixed(1)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>About {data.profile.name}</div>
            <p style={{ color: "#374151", lineHeight: "1.7", fontSize: "14px" }}>{data.profile.description}</p>
          </div>
        </div>
      )}

      {/* Compare results */}
      {compareData && (
        <div className="fade-in" style={{ maxWidth: "1200px", margin: "28px auto", padding: "0 24px" }}>
          <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
            <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>Revenue Comparison (Billions USD)</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={compareChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip formatter={(value) => `$${value}B`} />
                <Legend />
                <Bar dataKey={compareData.company1.profile.name.split(" ")[0]} fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey={compareData.company2.profile.name.split(" ")[0]} fill="#16a34a" radius={[4, 4, 0, 0]} />
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