import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react';

const HOLDINGS = [
  { symbol: 'BTC',  name: 'Bitcoin',        amount: 0.042,  price: 61240,  change: +2.34, color: 'bg-amber-500/15 text-amber-400'   },
  { symbol: 'ETH',  name: 'Ethereum',       amount: 0.85,   price: 2980,   change: +1.12, color: 'bg-indigo-500/15 text-indigo-400'  },
  { symbol: 'SOL',  name: 'Solana',         amount: 12.5,   price: 142.8,  change: +4.67, color: 'bg-violet-500/15 text-violet-400'  },
  { symbol: 'ADA',  name: 'Cardano',        amount: 850,    price: 0.44,   change: -1.20, color: 'bg-blue-500/15 text-blue-400'      },
];

const MARKET = [
  { symbol: 'XRP',  name: 'Ripple',         price: '€ 0.524',  change: '+3.1%', up: true  },
  { symbol: 'DOT',  name: 'Polkadot',       price: '€ 6.82',   change: '-0.9%', up: false },
  { symbol: 'LINK', name: 'Chainlink',      price: '€ 13.40',  change: '+1.7%', up: true  },
  { symbol: 'MATIC','name': 'Polygon',      price: '€ 0.58',   change: '-2.1%', up: false },
];

const totalValue = HOLDINGS.reduce((s, h) => s + h.amount * h.price, 0);

export default function CryptoScreen() {
  return (
    <div className="screen-enter pb-8">
      {/* Hero */}
      <div className="px-5 pt-5 pb-4">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-5">
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.12em]">Crypto portfolio</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-[38px] font-black text-white leading-none tracking-tight">
              € {Math.floor(totalValue).toLocaleString('en-US')}
            </span>
            <span className="text-2xl font-black text-white/35 leading-none mb-0.5">
              .{(totalValue % 1).toFixed(2).slice(2)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">+€ 248.70 today (+1.84%)</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-2xl bg-[#1c1c1e] border border-white/[0.06] py-3.5 flex items-center justify-center gap-2 text-white font-black text-sm hover:bg-white/[0.05] transition">
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Buy crypto
          </button>
          <button className="rounded-2xl bg-[#1c1c1e] border border-white/[0.06] py-3.5 flex items-center justify-center gap-2 text-white font-black text-sm hover:bg-white/[0.05] transition">
            <ArrowUpRight className="w-4 h-4 text-rose-400" /> Sell crypto
          </button>
        </div>
      </div>

      {/* Fake sparkline */}
      <div className="px-5 mb-5">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.12em]">BTC 7-day chart</p>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">+12.3%</span>
          </div>
          <svg viewBox="0 0 320 64" className="w-full h-16" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,54 C15,50 30,46 50,42 S80,34 100,30 S130,22 155,26 S185,32 200,22 S240,8 260,6 S295,8 320,4" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <path d="M0,54 C15,50 30,46 50,42 S80,34 100,30 S130,22 155,26 S185,32 200,22 S240,8 260,6 S295,8 320,4 L320,64 L0,64 Z" fill="url(#cg)" />
          </svg>
        </div>
      </div>

      {/* Holdings */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-black text-white mb-3">Your holdings</h3>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] overflow-hidden">
          {HOLDINGS.map(({ symbol, name, amount, price, change, color }, i) => {
            const value = amount * price;
            const up = change >= 0;
            return (
              <div key={symbol} className={`flex items-center gap-3 px-4 py-3.5 ${i < HOLDINGS.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl ${color} grid place-items-center shrink-0`}>
                  <span className="text-[9px] font-black">{symbol}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-white">{name}</p>
                  <p className="text-[11px] text-white/35 font-bold">{amount} {symbol} · € {price.toLocaleString('en-US')}</p>
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

      {/* Market */}
      <div className="px-5">
        <h3 className="text-sm font-black text-white mb-3">Market</h3>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] overflow-hidden">
          {MARKET.map(({ symbol, name, price, change, up }, i) => (
            <button
              key={symbol}
              type="button"
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition ${i < MARKET.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] grid place-items-center shrink-0">
                <span className="text-[9px] font-black text-white">{symbol.slice(0, 3)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{symbol}</p>
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
