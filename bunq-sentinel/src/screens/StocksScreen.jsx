import { TrendingUp, TrendingDown, BarChart3, ChevronRight } from 'lucide-react';

const PORTFOLIO = [
  { ticker: 'AAPL',  name: 'Apple Inc.',          shares: 5,   price: 189.30, change: +1.24, value: 946.50  },
  { ticker: 'MSFT',  name: 'Microsoft Corp.',      shares: 3,   price: 415.20, change: +0.87, value: 1245.60 },
  { ticker: 'NVDA',  name: 'NVIDIA Corp.',         shares: 2,   price: 875.40, change: +3.12, value: 1750.80 },
  { ticker: 'ASML',  name: 'ASML Holding',         shares: 1,   price: 782.60, change: -0.55, value: 782.60  },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.',      shares: 4,   price: 184.70, change: -1.08, value: 738.80  },
];

const DISCOVER = [
  { ticker: 'TSLA', name: 'Tesla',           price: '€ 162.40', change: '+4.2%', up: true  },
  { ticker: 'META', name: 'Meta Platforms',  price: '€ 514.90', change: '+1.8%', up: true  },
  { ticker: 'ADBE', name: 'Adobe Inc.',      price: '€ 378.10', change: '-0.6%', up: false },
];

const totalValue = PORTFOLIO.reduce((s, s2) => s + s2.value, 0);
const totalGain  = 312.40;

export default function StocksScreen() {
  return (
    <div className="screen-enter pb-8">
      {/* Hero */}
      <div className="px-5 pt-5 pb-4">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-5">
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.12em]">Portfolio value</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-[38px] font-black text-white leading-none tracking-tight">
              € {Math.floor(totalValue).toLocaleString('en-US')}
            </span>
            <span className="text-2xl font-black text-white/35 leading-none mb-0.5">.{(totalValue % 1).toFixed(2).slice(2)}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">+€ {totalGain.toFixed(2)} all time</span>
          </div>
        </div>
      </div>

      {/* Fake sparkline area */}
      <div className="px-5 mb-5">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.12em]">1 month performance</p>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">+5.8%</span>
          </div>
          <svg viewBox="0 0 320 64" className="w-full h-16" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,50 C20,48 40,44 60,40 S100,28 120,24 S160,18 180,16 S220,12 240,10 S280,8 320,6" fill="none" stroke="#10b981" strokeWidth="2" />
            <path d="M0,50 C20,48 40,44 60,40 S100,28 120,24 S160,18 180,16 S220,12 240,10 S280,8 320,6 L320,64 L0,64 Z" fill="url(#sg)" />
          </svg>
        </div>
      </div>

      {/* Holdings */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-black text-white mb-3">Your holdings</h3>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] overflow-hidden">
          {PORTFOLIO.map(({ ticker, name, shares, price, change, value }, i) => {
            const up = change >= 0;
            return (
              <div key={ticker} className={`flex items-center gap-3 px-4 py-3.5 ${i < PORTFOLIO.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] grid place-items-center shrink-0">
                  <span className="text-[10px] font-black text-white">{ticker.slice(0, 2)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-white">{ticker}</p>
                  <p className="text-[11px] text-white/35 font-bold">{shares} shares · € {price.toFixed(2)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-white">€ {value.toFixed(2)}</p>
                  <p className={`text-[10px] font-black mt-0.5 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {up ? '+' : ''}{change.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discover */}
      <div className="px-5">
        <h3 className="text-sm font-black text-white mb-3">Discover</h3>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] overflow-hidden">
          {DISCOVER.map(({ ticker, name, price, change, up }, i) => (
            <button
              key={ticker}
              type="button"
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition ${i < DISCOVER.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] grid place-items-center shrink-0">
                <BarChart3 className="w-4 h-4 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{ticker}</p>
                <p className="text-[11px] text-white/35 font-bold">{name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-black text-white">{price}</p>
                  <p className={`text-[10px] font-black ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{change}</p>
                </div>
                {up ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
