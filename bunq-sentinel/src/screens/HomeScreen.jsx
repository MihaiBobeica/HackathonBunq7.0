import { ArrowUp, ArrowDown, Plus, Shield } from 'lucide-react';

const FALLBACK_ACCOUNTS = [
  { id: 1, label: 'Main Account', sub: 'NL12 BUNQ 0001 2345 67', amount: '€ 4.200,00' },
  { id: 2, label: 'Savings',      sub: 'NL34 BUNQ 0007 6543 21', amount: '€ 12.500,00' },
];

const FALLBACK_TRANSACTIONS = [
  { id: 101, name: 'Albert Heijn', cat: 'Groceries',     amount: '- € 34,50' },
  { id: 102, name: 'Anthropic',    cat: 'Subscriptions', amount: '- € 19,99' },
  { id: 103, name: 'Salary',       cat: 'Income',        amount: '+ € 2.800,00' },
];

const ACCOUNT_ICONS = ['🏦', '💰', '🐷', '💳'];

function splitAmount(amount) {
  // Accept '€ 4.200,00' or '- € 4.200,00' or '+ € 4.200,00' -> { sign, whole, cents }
  const s = String(amount || '').trim();
  const m = s.match(/^([+\-]?)\s*([€$£]?)\s*([\d.,]+)$/);
  if (!m) return { sign: '', symbol: '€', whole: s, cents: '' };
  const sign = m[1] || '';
  const symbol = m[2] || '€';
  const num = m[3];
  const lastComma = num.lastIndexOf(',');
  const lastDot = num.lastIndexOf('.');
  let whole = num, cents = '00';
  if (lastComma > lastDot) {
    whole = num.slice(0, lastComma);
    cents = num.slice(lastComma + 1);
  } else if (lastDot > lastComma && num.length - lastDot - 1 === 2) {
    whole = num.slice(0, lastDot);
    cents = num.slice(lastDot + 1);
  }
  return { sign, symbol, whole, cents };
}

function Amount({ value, large = false }) {
  const { sign, symbol, whole, cents } = splitAmount(value);
  return (
    <span className={`font-black tracking-tight ${large ? 'text-2xl' : 'text-sm'} text-white`}>
      {sign && <span>{sign} </span>}
      {whole}
      {cents && <sup className={large ? 'text-base' : 'text-[10px]'}>,{cents}</sup>}
      <span className="ml-1 text-white/60">{symbol}</span>
    </span>
  );
}

function categoryColor(cat) {
  const map = {
    Groceries: 'bg-orange-500/20 text-orange-400',
    Income:    'bg-emerald-500/20 text-emerald-400',
    Subscriptions: 'bg-rose-500/20 text-rose-400',
    Payment:   'bg-blue-500/20 text-blue-400',
  };
  return map[cat] || 'bg-white/10 text-white/60';
}

export default function HomeScreen({ onStartPayment, onForceAI, accounts, transactions }) {
  const accs = accounts && accounts.length ? accounts : FALLBACK_ACCOUNTS;
  const txs  = transactions && transactions.length ? transactions : FALLBACK_TRANSACTIONS;

  return (
    <div className="screen-enter pb-8 bg-black">
      {/* ── Title ── */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-[40px] font-black text-white tracking-tight leading-none">Home</h1>
      </div>

      {/* ── Warden promo (signature green card) ── */}
      <div className="px-5 mt-5">
        <div className="rounded-3xl p-5 bunq-promo-card relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/25 grid place-items-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-base leading-tight" style={{ color: 'var(--bunq-promo-green-text)' }}>Warden is watching</p>
              <p className="text-[12px] mt-1 leading-snug" style={{ color: 'rgba(74,222,128,0.7)' }}>
                Every payment is checked for scam risk before it leaves your account.
              </p>
              <button
                onClick={onForceAI}
                className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-400 text-emerald-950 text-[12px] font-black"
              >
                Try a safety scan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick action pills ── */}
      <div className="px-5 mt-5 grid grid-cols-3 gap-2.5">
        <button
          onClick={onStartPayment}
          className="bunq-pay-pill rounded-3xl py-3 flex flex-col items-center gap-1 text-white font-black active:scale-95 transition"
        >
          <ArrowUp className="w-5 h-5" />
          <span className="text-xs">Pay</span>
        </button>
        <button className="bunq-req-pill rounded-3xl py-3 flex flex-col items-center gap-1 text-white font-black active:scale-95 transition">
          <ArrowDown className="w-5 h-5" />
          <span className="text-xs">Request</span>
        </button>
        <button className="bunq-add-pill rounded-3xl py-3 flex flex-col items-center gap-1 text-white font-black active:scale-95 transition">
          <Plus className="w-5 h-5" />
          <span className="text-xs">Add Money</span>
        </button>
      </div>

      {/* ── Bank Accounts ── */}
      <div className="px-5 mt-7">
        <h3 className="text-base font-black text-white mb-3">Bank Accounts</h3>
        <div className="rounded-3xl bunq-surface overflow-hidden">
          {accs.map((a, i) => (
            <div
              key={a.id ?? a.label ?? i}
              className={`flex items-center gap-3 px-4 py-4 ${i < accs.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl grid place-items-center shrink-0 text-xl ${i === 0 ? 'bg-blue-500/20' : 'bg-violet-500/20'}`}>
                <span>{ACCOUNT_ICONS[i] || '🏦'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white truncate">{a.label}</p>
                <p className="text-[11px] text-white/40 font-mono truncate">{a.sub}</p>
              </div>
              <Amount value={a.amount} />
            </div>
          ))}
          <button className="w-full text-center py-3 text-[12px] font-black text-[#0a9dff] border-t border-white/[0.05]">
            Add an Extra Bank Account
          </button>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-white">Recent</h3>
          <button onClick={onForceAI} className="text-[12px] font-black text-[#0a9dff]">
            Ask Finn
          </button>
        </div>
        <div className="rounded-3xl bunq-surface overflow-hidden">
          {txs.map((t, i) => (
            <div
              key={t.id ?? t.name ?? i}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < txs.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl grid place-items-center shrink-0 ${categoryColor(t.cat)}`}>
                <span className="text-base font-black">{(t.name || '?').slice(0, 1).toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white truncate">{t.name}</p>
                <p className="text-[11px] text-white/40 font-bold truncate">{t.cat}</p>
              </div>
              <Amount value={t.amount} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
