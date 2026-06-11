import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from "recharts";

const globalStyles = document.createElement("style");
globalStyles.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f8f7ff; font-family: 'Inter', 'Segoe UI', sans-serif; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.35s ease forwards; }
  .card { background: #ffffff; border: 1px solid #e8e6f0; border-radius: 14px; padding: 24px; margin-bottom: 14px; transition: border-color 0.15s ease; }
  .card:hover { border-color: #c4b8e8; }
  .metric-card { border-radius: 12px; padding: 18px 20px; flex: 1; min-width: 130px; transition: transform 0.15s ease; cursor: default; }
  .metric-card:hover { transform: translateY(-2px); }
  .feature-card { background: #ffffff; border: 1px solid #e8e6f0; border-radius: 16px; padding: 28px; flex: 1; min-width: 220px; transition: border-color 0.2s ease; }
  .feature-card:hover { border-color: #7c3aed; }
  .suggestion-item:hover { background: #f3f0ff !important; }
  input::placeholder { color: #b8b3cc; }
  input:focus { border-color: #7c3aed !important; }
  a { color: #7c3aed; text-decoration: none; }
  a:hover { text-decoration: underline; }
  button { transition: all 0.15s ease; }
`;
document.head.appendChild(globalStyles);

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f3f0ff";
const PURPLE_BORDER = "#c4b8e8";
const TEXT = "#1a1625";
const MUTED = "#6b6580";
const DIM = "#b8b3cc";
const SURFACE = "#ffffff";
const BG = "#f8f7ff";
const BORDER = "#e8e6f0";
const API_BASE = "https://riskradar-api.onrender.com";
const GREEN = "#059669";
const AMBER = "#d97706";
const RED = "#dc2626";

function RiskBadge({ label, color }) {
  const s = {
    green: { bg: "#ecfdf5", text: GREEN, border: "#a7f3d0" },
    yellow: { bg: "#fffbeb", text: AMBER, border: "#fde68a" },
    red: { bg: "#fef2f2", text: RED, border: "#fecaca" },
  }[color] || { bg: "#fffbeb", text: AMBER, border: "#fde68a" };
  return (
    <span style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}`, padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
      {label}
    </span>
  );
}

function RiskGauge({ score, label, color }) {
  const gaugeColor = { green: GREEN, yellow: AMBER, red: RED }[color] || AMBER;
  const circumference = Math.PI * 60;
  const dashOffset = circumference - (Math.max(0, Math.min(score / 5, 1))) * circumference;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 20px 12px" }}>
      <div style={{ width: "160px", height: "90px", overflow: "hidden" }}>
        <svg width="160" height="120" viewBox="0 0 160 120">
          <path d="M 16 96 A 60 60 0 0 1 144 96" fill="none" stroke="#ede9f8" strokeWidth="8" strokeLinecap="round" />
          <path d="M 16 96 A 60 60 0 0 1 144 96" fill="none" stroke={gaugeColor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s ease" }} />
          <text x="80" y="84" textAnchor="middle" fontSize="26" fontWeight="700" fill={TEXT}>{score}</text>
          <text x="80" y="100" textAnchor="middle" fontSize="10" fill={MUTED}>out of 5</text>
        </svg>
      </div>
      <RiskBadge label={label} color={color} />
      <div style={{ display: "flex", justifyContent: "space-between", width: "150px", marginTop: "10px" }}>
        <span style={{ color: GREEN, fontSize: "10px", fontWeight: "500" }}>Low</span>
        <span style={{ color: AMBER, fontSize: "10px", fontWeight: "500" }}>Moderate</span>
        <span style={{ color: RED, fontSize: "10px", fontWeight: "500" }}>Elevated</span>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color }) {
  const c = {
    purple: { bg: "#f3f0ff", border: "#c4b8e8", accent: PURPLE },
    green: { bg: "#ecfdf5", border: "#a7f3d0", accent: GREEN },
    amber: { bg: "#fffbeb", border: "#fde68a", accent: AMBER },
    blue: { bg: "#eff6ff", border: "#bfdbfe", accent: "#2563eb" },
  }[color] || {};
  return (
    <div className="metric-card" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div style={{ color: c.accent, fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>{title}</div>
      <div style={{ color: TEXT, fontSize: "20px", fontWeight: "700", marginBottom: "3px" }}>{value}</div>
      {subtitle && <div style={{ color: MUTED, fontSize: "11px" }}>{subtitle}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ color: MUTED, fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
      {children}
    </div>
  );
}

function CompanyCard({ company }) {
  const chartData = company.financials?.map((y) => ({
    date: y.date.slice(0, 4),
    Revenue: parseFloat((y.revenue / 1e9).toFixed(1)),
    "Net Income": parseFloat((y.net_income / 1e9).toFixed(1)),
  })).reverse();
  return (
    <div style={{ flex: 1, minWidth: "280px" }}>
      <div className="card">
        <h2 style={{ color: TEXT, fontSize: "18px", fontWeight: "700", marginBottom: "3px" }}>{company.profile.name}</h2>
        <p style={{ color: MUTED, fontSize: "12px", marginBottom: "12px" }}>{company.profile.sector} — {company.profile.industry}</p>
        <div style={{ fontSize: "26px", fontWeight: "700", color: TEXT, marginBottom: "10px" }}>${company.price_data.price}</div>
        <RiskBadge label={company.risk.label} color={company.risk.color} />
      </div>
      <div className="card">
        <SectionLabel>Risk</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <RiskBadge label={company.risk.label} color={company.risk.color} />
          <span style={{ color: MUTED, fontSize: "12px" }}>Score: {company.risk.score} / 5</span>
        </div>
        {company.risk.reasons.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", padding: "7px 0", borderBottom: i < company.risk.reasons.length - 1 ? `1px solid ${BORDER}` : "none" }}>
            <div style={{ width: "5px", height: "5px", background: PURPLE, borderRadius: "50%", marginTop: "5px", flexShrink: 0 }}></div>
            <span style={{ color: MUTED, fontSize: "13px" }}>{r}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <SectionLabel>Revenue vs Net Income</SectionLabel>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} />
            <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
            <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT }} formatter={(v) => `$${v}B`} />
            <Line type="monotone" dataKey="Revenue" stroke={PURPLE} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Net Income" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <SectionLabel>Financials</SectionLabel>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead><tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            <th style={{ textAlign: "left", padding: "7px 0", color: MUTED, fontWeight: "500" }}>Year</th>
            <th style={{ textAlign: "right", padding: "7px 0", color: MUTED, fontWeight: "500" }}>Revenue</th>
            <th style={{ textAlign: "right", padding: "7px 0", color: MUTED, fontWeight: "500" }}>Net Income</th>
          </tr></thead>
          <tbody>
            {company.financials?.map((y) => (
              <tr key={y.date} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: "9px 0", color: TEXT, fontWeight: "600" }}>{y.date.slice(0, 4)}</td>
                <td style={{ padding: "9px 0", textAlign: "right", color: MUTED }}>${(y.revenue / 1e9).toFixed(1)}B</td>
                <td style={{ padding: "9px 0", textAlign: "right", color: MUTED }}>${(y.net_income / 1e9).toFixed(1)}B</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const popularTickers = [
  { ticker: "AAPL", name: "Apple Inc." }, { ticker: "MSFT", name: "Microsoft Corporation" },
  { ticker: "GOOGL", name: "Alphabet Inc." }, { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "NVDA", name: "NVIDIA Corporation" }, { ticker: "META", name: "Meta Platforms Inc." },
  { ticker: "TSLA", name: "Tesla Inc." }, { ticker: "BRK-B", name: "Berkshire Hathaway" },
  { ticker: "JPM", name: "JPMorgan Chase" }, { ticker: "V", name: "Visa Inc." },
  { ticker: "JNJ", name: "Johnson & Johnson" }, { ticker: "WMT", name: "Walmart Inc." },
  { ticker: "XOM", name: "Exxon Mobil" }, { ticker: "MA", name: "Mastercard Inc." },
  { ticker: "PG", name: "Procter & Gamble" }, { ticker: "BAC", name: "Bank of America" },
  { ticker: "HD", name: "Home Depot" }, { ticker: "CVX", name: "Chevron Corporation" },
  { ticker: "MRK", name: "Merck & Co." }, { ticker: "ABBV", name: "AbbVie Inc." },
  { ticker: "TD", name: "Toronto-Dominion Bank" }, { ticker: "RY", name: "Royal Bank of Canada" },
  { ticker: "BNS", name: "Bank of Nova Scotia" }, { ticker: "BMO", name: "Bank of Montreal" },
  { ticker: "CM", name: "CIBC" }, { ticker: "CNR", name: "Canadian National Railway" },
  { ticker: "SHOP", name: "Shopify Inc." }, { ticker: "ENB", name: "Enbridge Inc." },
  { ticker: "CP", name: "Canadian Pacific Railway" }, { ticker: "SU", name: "Suncor Energy" },
  { ticker: "BABA", name: "Alibaba Group" }, { ticker: "TSM", name: "Taiwan Semiconductor" },
  { ticker: "NVO", name: "Novo Nordisk" }, { ticker: "ASML", name: "ASML Holding" },
  { ticker: "NFLX", name: "Netflix Inc." }, { ticker: "ADBE", name: "Adobe Inc." },
  { ticker: "CRM", name: "Salesforce Inc." }, { ticker: "ORCL", name: "Oracle Corporation" },
  { ticker: "INTC", name: "Intel Corporation" }, { ticker: "AMD", name: "Advanced Micro Devices" },
  { ticker: "PYPL", name: "PayPal Holdings" }, { ticker: "UBER", name: "Uber Technologies" },
  { ticker: "ABNB", name: "Airbnb Inc." }, { ticker: "COIN", name: "Coinbase Global" },
  { ticker: "GS", name: "Goldman Sachs" }, { ticker: "MS", name: "Morgan Stanley" },
  { ticker: "C", name: "Citigroup Inc." }, { ticker: "WFC", name: "Wells Fargo" },
  { ticker: "AXP", name: "American Express" }, { ticker: "BX", name: "Blackstone Inc." },
  { ticker: "CAE", name: "CAE Inc." }, { ticker: "MDA", name: "MDA Space Ltd." },
  { ticker: "IFC", name: "Intact Financial" }, { ticker: "PLTR", name: "Palantir Technologies" },
];

function SuggestionDropdown({ suggestions, onSelect }) {
  if (!suggestions.length) return null;
  return (
    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", marginTop: "4px", zIndex: 100, overflow: "hidden", minWidth: "260px", boxShadow: "0 4px 16px rgba(124,58,237,0.08)" }}>
      {suggestions.map((s, i) => (
        <div key={i} className="suggestion-item" onMouseDown={() => onSelect(s)}
          style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", borderBottom: i < suggestions.length - 1 ? `1px solid ${BORDER}` : "none", background: SURFACE }}>
          <span style={{ fontWeight: "600", color: TEXT, fontSize: "13px" }}>{s.ticker}</span>
          <span style={{ color: MUTED, fontSize: "12px" }}>{s.name}</span>
        </div>
      ))}
    </div>
  );
}

function Nav({ onLogoClick }) {
  return (
    <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "0 40px", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", height: "56px", gap: "8px" }}>
        <div onClick={onLogoClick} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <div style={{ width: "28px", height: "28px", background: PURPLE, borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "11px", height: "11px", border: "2px solid white", borderRadius: "50%" }}></div>
          </div>
          <span style={{ fontSize: "16px", fontWeight: "700", color: TEXT, letterSpacing: "-0.2px" }}>RiskRadar</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: "6px", height: "6px", background: GREEN, borderRadius: "50%" }}></div>
        <span style={{ color: MUTED, fontSize: "12px" }}>Live</span>
      </div>
    </div>
  );
}

function LandingPage({ onGetStarted }) {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <Nav onLogoClick={() => {}} />

      {/* Hero */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "90px 40px 70px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`, borderRadius: "6px", padding: "4px 12px", marginBottom: "24px" }}>
          <span style={{ color: PURPLE, fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px" }}>PUBLIC COMPANY FINANCIAL RISK INTELLIGENCE</span>
        </div>
        <h1 style={{ fontSize: "50px", fontWeight: "800", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "18px", color: TEXT }}>
          Understand the financial risk<br />of any public company
        </h1>
        <p style={{ color: MUTED, fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
          Enter a stock ticker and get a full financial risk dashboard — revenue trends, profit margins, market data, and a clear risk score.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
          <button onClick={onGetStarted} style={{ background: PURPLE, color: "white", border: "none", padding: "13px 30px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
            Open Dashboard
          </button>
          <span style={{ color: DIM, fontSize: "13px" }}>No account needed</span>
        </div>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          {["AAPL", "TD", "SHOP", "NVDA", "RY"].map((t) => (
            <button key={t} onClick={onGetStarted} style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: MUTED, padding: "4px 10px", borderRadius: "5px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Mock preview */}
      <div style={{ maxWidth: "820px", margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(124,58,237,0.06)" }}>
          <div style={{ height: "3px", background: PURPLE }}></div>
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ color: TEXT, fontSize: "20px", fontWeight: "700" }}>Apple Inc.</span>
                  <span style={{ background: PURPLE_LIGHT, color: PURPLE, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600" }}>AAPL</span>
                </div>
                <span style={{ color: MUTED, fontSize: "13px" }}>Technology — Consumer Electronics</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: MUTED, fontSize: "10px", fontWeight: "600", letterSpacing: "0.8px", marginBottom: "4px" }}>CURRENT PRICE</div>
                <div style={{ color: TEXT, fontSize: "26px", fontWeight: "700" }}>$298.42</div>
                <span style={{ background: "#ecfdf5", color: GREEN, border: "1px solid #a7f3d0", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600" }}>Low Risk</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { l: "MARKET CAP", v: "$4,383B", bg: PURPLE_LIGHT, border: PURPLE_BORDER, a: PURPLE },
                { l: "52W HIGH", v: "$300.92", bg: "#ecfdf5", border: "#a7f3d0", a: GREEN },
                { l: "52W LOW", v: "$193.46", bg: "#fffbeb", border: "#fde68a", a: AMBER },
                { l: "VOLUME", v: "19.5M", bg: "#eff6ff", border: "#bfdbfe", a: "#2563eb" },
              ].map((m, i) => (
                <div key={i} style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: "10px", padding: "12px 16px", flex: 1, minWidth: "100px" }}>
                  <div style={{ color: m.a, fontSize: "9px", fontWeight: "600", letterSpacing: "0.8px", marginBottom: "6px" }}>{m.l}</div>
                  <div style={{ color: TEXT, fontSize: "16px", fontWeight: "700" }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 40px 80px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.5px", marginBottom: "8px", textAlign: "center", color: TEXT }}>Everything in one place</h2>
        <p style={{ color: MUTED, textAlign: "center", marginBottom: "32px", fontSize: "15px" }}>Built for students, analysts, and curious investors</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
          {[
            { icon: "📊", title: "Real-Time Market Data", desc: "Live prices, 52-week ranges, trading volume, and 6-month price history from real market sources." },
            { icon: "⚡", title: "Risk Scoring Engine", desc: "Revenue growth, profit margins, and market performance combine into a clear Low / Moderate / Elevated score." },
            { icon: "📈", title: "Interactive Charts", desc: "6-month stock price history and 3-year revenue vs net income trends — all hoverable and interactive." },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: "22px", marginBottom: "12px" }}>{f.icon}</div>
              <h3 style={{ color: TEXT, fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ color: MUTED, fontSize: "13px", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { icon: "🔍", title: "Smart Search", desc: "Autocomplete across 60+ major tickers including Canadian banks, US tech, and international stocks." },
            { icon: "⚖️", title: "Company Comparison", desc: "Compare two companies side by side — risk scores, charts, and financial summaries." },
            { icon: "🕐", title: "Search History", desc: "Recent searches saved so you can quickly revisit companies you've already analyzed." },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: "22px", marginBottom: "12px" }}>{f.icon}</div>
              <h3 style={{ color: TEXT, fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ color: MUTED, fontSize: "13px", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "60px 40px", textAlign: "center", background: SURFACE }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-0.5px", marginBottom: "10px", color: TEXT }}>Ready to analyze a company?</h2>
        <p style={{ color: MUTED, fontSize: "15px", marginBottom: "24px" }}>No signup. Just enter a ticker and go.</p>
        <button onClick={onGetStarted} style={{ background: PURPLE, color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
          Open Dashboard
        </button>
        <div style={{ marginTop: "36px", color: DIM, fontSize: "12px" }}>
          Built with Python · FastAPI · React · yfinance · SQLite
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onBack }) {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);
  const [mode, setMode] = useState("single");
  const [ticker1, setTicker1] = useState("");
  const [ticker2, setTicker2] = useState("");
  const [compareData, setCompareData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => { loadRecent(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getFiltered = (v) => popularTickers.filter(
    (t) => t.ticker.startsWith(v.toUpperCase()) || t.name.toLowerCase().startsWith(v.toLowerCase())
  ).slice(0, 6);

  const loadRecent = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/recent`);
      const result = await res.json();
      setRecent(result.filter((item, i, self) => i === self.findIndex((r) => r.ticker === item.ticker)));
    } catch {}
  };

  const search = async (tickerOverride) => {
  const t = typeof tickerOverride === "string" ? tickerOverride : ticker;
    if (!t) return;
    setLoading(true); setError(null); setData(null); setCompareData(null); setShowSuggestions(false);
    try {
      const res = await fetch(`${API_BASE}/api/company/${t}`);
      if (!res.ok) throw new Error("Company not found. Check the ticker symbol.");
      setData(await res.json());
      loadRecent();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const compare = async () => {
    if (!ticker1 || !ticker2) return;
    setLoading(true); setError(null); setData(null); setCompareData(null); setShowSuggestions(false);
    try {
      const res = await fetch(`${API_BASE}/api/compare/${ticker1}/${ticker2}`);
      if (!res.ok) throw new Error("One or both companies not found.");
      setCompareData(await res.json());
      loadRecent();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const compareChartData = compareData ? compareData.company1.financials.map((y, i) => ({
    date: y.date.slice(0, 4),
    [compareData.company1.profile.name.split(" ")[0]]: parseFloat((y.revenue / 1e9).toFixed(1)),
    [compareData.company2.profile.name.split(" ")[0]]: parseFloat((compareData.company2.financials[i]?.revenue / 1e9).toFixed(1)),
  })).reverse() : [];

  const inputStyle = { background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT, padding: "11px 16px", borderRadius: "8px", fontSize: "14px", outline: "none", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <Nav onLogoClick={onBack} />

      {/* Search */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "18px 40px" }}>
        <div style={{ maxWidth: "700px" }}>
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {["single", "compare"].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{ padding: "6px 16px", borderRadius: "6px", border: `1px solid ${mode === m ? PURPLE : BORDER}`, fontSize: "12px", fontWeight: "600", cursor: "pointer", background: mode === m ? PURPLE_LIGHT : "transparent", color: mode === m ? PURPLE : MUTED }}>
                {m === "single" ? "Single Company" : "Compare Two"}
              </button>
            ))}
          </div>

          {mode === "single" ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input style={inputStyle} placeholder="Search ticker or company..." value={ticker}
                  onChange={(e) => { setTicker(e.target.value.toUpperCase()); setSuggestions(getFiltered(e.target.value)); setShowSuggestions(e.target.value.length > 0 ? "single" : false); }}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} />
                {showSuggestions === "single" && <SuggestionDropdown suggestions={suggestions} onSelect={(s) => { setTicker(s.ticker); setShowSuggestions(false); }} />}
              </div>
              <button onClick={() => search()} style={{ background: PURPLE, color: "white", border: "none", padding: "11px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input style={inputStyle} placeholder="Company A" value={ticker1}
                  onChange={(e) => { setTicker1(e.target.value.toUpperCase()); setSuggestions(getFiltered(e.target.value)); setShowSuggestions(e.target.value.length > 0 ? "t1" : false); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} />
                {showSuggestions === "t1" && <SuggestionDropdown suggestions={suggestions} onSelect={(s) => { setTicker1(s.ticker); setShowSuggestions(false); }} />}
              </div>
              <span style={{ color: MUTED, fontWeight: "600" }}>vs</span>
              <div style={{ position: "relative", flex: 1 }}>
                <input style={inputStyle} placeholder="Company B" value={ticker2}
                  onChange={(e) => { setTicker2(e.target.value.toUpperCase()); setSuggestions(getFiltered(e.target.value)); setShowSuggestions(e.target.value.length > 0 ? "t2" : false); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} />
                {showSuggestions === "t2" && <SuggestionDropdown suggestions={suggestions} onSelect={(s) => { setTicker2(s.ticker); setShowSuggestions(false); }} />}
              </div>
              <button onClick={compare} style={{ background: PURPLE, color: "white", border: "none", padding: "11px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
                {loading ? "Loading..." : "Compare"}
              </button>
            </div>
          )}

          {error && <p style={{ color: RED, marginTop: "10px", fontSize: "13px" }}>{error}</p>}

          {recent.length > 0 && (
            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" }}>
              <span style={{ color: DIM, fontSize: "11px", fontWeight: "600" }}>RECENT:</span>
              {recent.slice(0, 5).map((r, i) => (
                <button key={i} onClick={() => { setTicker(r.ticker); setMode("single"); search(r.ticker); }}
                  style={{ padding: "3px 9px", borderRadius: "5px", fontSize: "11px", fontWeight: "500", cursor: "pointer", border: `1px solid ${BORDER}`, background: "transparent", color: MUTED }}>
                  {r.ticker}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "60px", justifyContent: "center" }}>
          <div style={{ width: "18px", height: "18px", border: `2px solid ${BORDER}`, borderTop: `2px solid ${PURPLE}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: MUTED, fontSize: "13px" }}>Analyzing company data...</span>
        </div>
      )}

      {/* Single results */}
      {data && (
        <div className="fade-up" style={{ maxWidth: "1000px", margin: "28px auto", padding: "0 24px" }}>

          {/* Company card */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", overflow: "hidden", boxShadow: "0 2px 12px rgba(124,58,237,0.06)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: PURPLE }}></div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <h2 style={{ color: TEXT, fontSize: "26px", fontWeight: "700", letterSpacing: "-0.3px" }}>{data.profile.name}</h2>
                <span style={{ background: PURPLE_LIGHT, color: PURPLE, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600" }}>{data.ticker}</span>
              </div>
              <p style={{ color: MUTED, fontSize: "13px", marginBottom: "6px" }}>{data.profile.sector} — {data.profile.industry}</p>
              <p style={{ color: DIM, fontSize: "12px" }}>{data.profile.country} · <a href={data.profile.website}>{data.profile.website}</a></p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: MUTED, fontSize: "10px", fontWeight: "600", letterSpacing: "0.8px", marginBottom: "6px" }}>CURRENT PRICE</div>
              <div style={{ fontSize: "34px", fontWeight: "700", color: TEXT, letterSpacing: "-1px", lineHeight: 1 }}>${data.price_data.price}</div>
              <div style={{ marginTop: "10px" }}><RiskBadge label={data.risk.label} color={data.risk.color} /></div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
            <MetricCard title="Market Cap" value={`$${(data.profile.market_cap / 1e9).toFixed(0)}B`} subtitle="Total market value" color="purple" />
            <MetricCard title="52-Week High" value={`$${data.price_data.fifty_two_week_high}`} subtitle="Yearly high" color="green" />
            <MetricCard title="52-Week Low" value={`$${data.price_data.fifty_two_week_low}`} subtitle="Yearly low" color="amber" />
            <MetricCard title="Volume" value={data.price_data.volume?.toLocaleString()} subtitle="Shares today" color="blue" />
          </div>

          {/* Risk */}
          <div className="card" style={{ borderLeft: `3px solid ${PURPLE}` }}>
            <SectionLabel>Risk Assessment</SectionLabel>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
              <RiskGauge score={data.risk.score} label={data.risk.label} color={data.risk.color} />
              <div style={{ flex: 1, minWidth: "200px", paddingTop: "8px" }}>
                {data.risk.reasons.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", padding: "9px 0", borderBottom: i < data.risk.reasons.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                    <div style={{ width: "5px", height: "5px", background: PURPLE, borderRadius: "50%", marginTop: "6px", flexShrink: 0 }}></div>
                    <span style={{ color: MUTED, fontSize: "14px" }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price chart */}
          <div className="card">
            <SectionLabel>6-Month Stock Price (USD)</SectionLabel>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.price_history}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} interval={19} />
                <YAxis tick={{ fill: MUTED, fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT }} formatter={(v) => [`$${v}`, "Price"]} />
                <Area type="monotone" dataKey="close" stroke={PURPLE} strokeWidth={2} fill="url(#pg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue chart */}
          <div className="card">
            <SectionLabel>Revenue vs Net Income (Billions USD)</SectionLabel>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={(data.financials ?? []).map((y) => ({ date: y.date.slice(0, 4), Revenue: parseFloat((y.revenue / 1e9).toFixed(1)), "Net Income": parseFloat((y.net_income / 1e9).toFixed(1)) })).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 12 }} />
                <YAxis tick={{ fill: MUTED, fontSize: 12 }} />
                <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT }} formatter={(v) => `$${v}B`} />
                <Line type="monotone" dataKey="Revenue" stroke={PURPLE} strokeWidth={2.5} dot={{ r: 4, fill: PURPLE, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="Net Income" stroke={GREEN} strokeWidth={2.5} dot={{ r: 4, fill: GREEN, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="card">
            <SectionLabel>Financial Summary</SectionLabel>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Year", "Revenue", "Net Income", "Gross Profit"].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "9px 0", color: MUTED, fontWeight: "500", fontSize: "12px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.financials ?? []).map((y) => (
                  <tr key={y.date} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "12px 0", color: TEXT, fontWeight: "600" }}>{y.date.slice(0, 4)}</td>
                    <td style={{ padding: "12px 0", textAlign: "right", color: MUTED }}>${(y.revenue / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: "12px 0", textAlign: "right", color: MUTED }}>${(y.net_income / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: "12px 0", textAlign: "right", color: MUTED }}>${(y.gross_profit / 1e9).toFixed(1)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* About */}
          <div className="card">
            <SectionLabel>About {data.profile.name}</SectionLabel>
            <p style={{ color: MUTED, lineHeight: "1.75", fontSize: "14px" }}>{data.profile.description}</p>
          </div>
        </div>
      )}

      {/* Compare */}
      {compareData && (
        <div className="fade-up" style={{ maxWidth: "1100px", margin: "28px auto", padding: "0 24px" }}>
          <div className="card">
            <SectionLabel>Revenue Comparison (Billions USD)</SectionLabel>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={compareChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 12 }} />
                <YAxis tick={{ fill: MUTED, fontSize: 12 }} />
                <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT }} formatter={(v) => `$${v}B`} />
                <Legend wrapperStyle={{ color: MUTED }} />
                <Bar dataKey={compareData.company1.profile.name.split(" ")[0]} fill={PURPLE} radius={[4, 4, 0, 0]} />
                <Bar dataKey={compareData.company2.profile.name.split(" ")[0]} fill={GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <CompanyCard company={compareData.company1} />
            <CompanyCard company={compareData.company2} />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [page, setPage] = useState("landing");
  return page === "landing"
    ? <LandingPage onGetStarted={() => setPage("dashboard")} />
    : <Dashboard onBack={() => setPage("landing")} />;
}

export default App;