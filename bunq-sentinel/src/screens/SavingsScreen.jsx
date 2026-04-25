import { PiggyBank, Car, Plane, Home, Plus, TrendingUp, ChevronRight } from 'lucide-react';

const GOALS = [
  {
    icon: <Car   className="w-5 h-5" />, bg: 'bg-blue-500/15 text-blue-400',
    name: 'New Car',      target: 15000, saved: 8250,
    color: 'from-blue-500 to-indigo-600', accent: 'text-blue-400',
  },
  {
    icon: <Plane className="w-5 h-5" />, bg: 'bg-violet-500/15 text-violet-400',
    name: 'Japan Trip',   target: 3500,  saved: 1200,
    color: 'from-violet-500 to-purple-600', accent: 'text-violet-400',
  },
  {
    icon: <Home  className="w-5 h-5" />, bg: 'bg-emerald-500/15 text-emerald-400',
    name: 'House deposit', target: 50000, saved: 12400,
    color: 'from-emerald-500 to-teal-600', accent: 'text-emerald-400',
  },
];

const INTEREST_PRODUCTS = [
  { label: 'Easy Savings',    rate: '2.46%', desc: 'Instant access',      badge: 'Popular' },
  { label: 'Term Deposit 6M', rate: '3.10%', desc: 'Lock for 6 months',   badge: '' },
  { label: 'Term Deposit 1Y', rate: '3.55%', desc: 'Lock for 12 months',  badge: 'Best rate' },
];

function fmt(n) {
  return `€ ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function SavingsScreen() {
  const totalSaved = GOALS.reduce((s, g) => s + g.saved, 0);

  return (
    <div className="screen-enter pb-8">
      {/* Hero */}
      <div className="px-5 pt-5 pb-4">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-5">
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.12em]">Total saved</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-[38px] font-black text-white leading-none tracking-tight">
              {fmt(totalSaved).split('.')[0]}
            </span>
            <span className="text-2xl font-black text-white/35 leading-none mb-0.5">
              .{fmt(totalSaved).split('.')[1]}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">Earning 2.46% APY on idle balance</span>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">Savings goals</h3>
          <button className="w-7 h-7 rounded-full bg-white/10 grid place-items-center text-white hover:bg-white/15 transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {GOALS.map(({ icon, bg, name, target, saved, color, accent }) => {
            const pct = Math.round((saved / target) * 100);
            return (
              <div key={name} className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-2xl ${bg} grid place-items-center shrink-0`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">{name}</p>
                    <p className="text-[11px] text-white/35 font-bold">{fmt(saved)} of {fmt(target)}</p>
                  </div>
                  <span className={`text-sm font-black ${accent}`}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interest products */}
      <div className="px-5">
        <h3 className="text-sm font-black text-white mb-3">Earn more interest</h3>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] overflow-hidden">
          {INTEREST_PRODUCTS.map(({ label, rate, desc, badge }, i) => (
            <button
              key={label}
              type="button"
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition ${i < INTEREST_PRODUCTS.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center shrink-0">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{label}</p>
                <p className="text-[11px] text-white/35 font-bold">{desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-black text-emerald-400">{rate}</span>
                {badge && (
                  <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
