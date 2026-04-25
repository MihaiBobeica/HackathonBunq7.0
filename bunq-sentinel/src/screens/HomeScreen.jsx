import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  WalletCards, PiggyBank, ShoppingBasket, Film,
  ArrowUp, ArrowDown, Plus, CreditCard,
  TrendingUp, AlertTriangle, X, Loader2, FileText, ShieldAlert, ScanSearch,
  Send, CheckCircle, Clock3,
} from 'lucide-react';
import { FLAGGED_IBAN } from '../constants';

const ACCOUNTS = [
  {
    label: 'Main Account',
    amount: '€ 4,200.00',
    sub: 'NL99 BUNQ 1234 5678 90',
    icon: <WalletCards className="w-5 h-5" />,
    iconBg: 'bg-orange-500/20 text-orange-400',
  },
  {
    label: 'Savings Goal',
    amount: '€ 8,250.00',
    sub: 'New Car',
    icon: <PiggyBank className="w-5 h-5" />,
    iconBg: 'bg-violet-500/20 text-violet-400',
  },
];

const VIRTUAL_CARDS = [
  { gradient: 'from-indigo-600 via-purple-600 to-violet-700', last4: '1234', type: 'Mastercard' },
  { gradient: 'from-orange-500 via-rose-500 to-pink-600',     last4: '5678', type: 'Visa'       },
  { gradient: 'from-emerald-500 via-teal-500 to-cyan-600',    last4: '9012', type: 'Mastercard' },
];

const TRANSACTIONS = [
  {
    icon: <ShoppingBasket className="w-5 h-5" />,
    bg: 'bg-orange-500/15 text-orange-400',
    name: 'Albert Heijn',
    cat: 'Groceries',
    amount: '- €34.50',
  },
  {
    icon: <Film className="w-5 h-5" />,
    bg: 'bg-rose-500/15 text-rose-400',
    name: 'Anthropic',
    cat: 'Subscriptions',
    amount: '- €19.99',
  },
];

const QUICK_ACTIONS = [
  { label: 'Check',   action: 'check',   icon: <ScanSearch className="w-6 h-6" />, color: 'bg-orange-500 shadow-orange-500/30' },
  { label: 'Pay',     action: 'pay',     icon: <ArrowUp    className="w-6 h-6" />, color: 'bg-emerald-500 shadow-emerald-500/30' },
  { label: 'Request', action: 'request', icon: <ArrowDown  className="w-6 h-6" />, color: 'bg-blue-500 shadow-blue-500/30'    },
  { label: 'Add',     action: 'add',     icon: <Plus       className="w-6 h-6" />, color: 'bg-violet-500 shadow-violet-500/30' },
];

// Default dev API (override with VITE_API_URL)
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

const spring = { type: 'spring', stiffness: 420, damping: 28 };

const OUTCOME_HEADLINES = {
  no_strong_scam_presence: 'No strong scam presence detected',
  legitimate_consistent_evidence: 'Consistent with invoice',
  scam_identified: 'Scam identified',
};

const RISK_STYLES = {
  Low: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  Medium: 'text-amber-200 bg-amber-500/10 border-amber-500/25',
  High: 'text-rose-200 bg-rose-500/10 border-rose-500/25',
};

function fileKey(f) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

function parsePaymentAmount(value) {
  const clean = value.replace(/[^\d.,]/g, '');
  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');
  let normalized = clean;

  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot
      ? clean.replace(/\./g, '').replace(',', '.')
      : clean.replace(/,/g, '');
  } else if (lastComma >= 0) {
    const decimals = clean.length - lastComma - 1;
    normalized = decimals === 3 ? clean.replace(/,/g, '') : clean.replace(',', '.');
  } else if (lastDot >= 0) {
    const decimals = clean.length - lastDot - 1;
    normalized = decimals === 3 ? clean.replace(/\./g, '') : clean;
  }

  const n = Number.parseFloat(normalized);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function formatPaymentAmount(value) {
  const n = parsePaymentAmount(value);
  if (!n) return value.trim();
  return `EUR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function finnScanPayment({ iban, amount, description }) {
  const normalizedIban = iban.trim().toUpperCase();
  const amountNumber = parsePaymentAmount(amount);
  const text = `${description} ${iban}`.toLowerCase();
  const reasons = [];

  if (normalizedIban === FLAGGED_IBAN) reasons.push('IBAN seen in bunq fraud signals');
  if (amountNumber >= 1000) reasons.push('High first transfer amount');
  if (/marktplaats|escrow|deposit|urgent|whatsapp|crypto|gift card|invoice/.test(text)) {
    reasons.push('Context matches common scam language');
  }

  return {
    flagged: reasons.length > 0,
    reasons: reasons.slice(0, 3),
  };
}

export default function HomeScreen() {
  const [assistOpen, setAssistOpen] = useState(false);
  const [assistMode, setAssistMode] = useState('flagged');
  const [assistText, setAssistText] = useState('');
  const [assistFiles, setAssistFiles] = useState([]);
  const [assistSubmitting, setAssistSubmitting] = useState(false);
  const [assistError, setAssistError] = useState('');
  const [assistResult, setAssistResult] = useState(null);
  const [wardenPayments, setWardenPayments] = useState([]);
  const [selectedWardenPayment, setSelectedWardenPayment] = useState(null);
  const [fraudTxCanceled, setFraudTxCanceled] = useState(false);
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payIban, setPayIban] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDescription, setPayDescription] = useState('');
  const [finnResult, setFinnResult] = useState(null);
  const assistFileRef = useRef(null);

  const openAssist = useCallback((mode = 'flagged', payment = null) => {
    setAssistMode(mode);
    if (mode === 'flagged') {
      setSelectedWardenPayment(payment ?? wardenPayments[0] ?? null);
    }
    setAssistOpen(true);
    setAssistError('');
    setAssistResult(null);
  }, [wardenPayments]);

  const closeAssist = useCallback(() => {
    setAssistOpen(false);
    setAssistSubmitting(false);
    setAssistError('');
    setAssistResult(null);
    setAssistText('');
    setAssistFiles([]);
    if (assistFileRef.current) assistFileRef.current.value = '';
  }, []);

  const openPay = useCallback(() => {
    setPayOpen(true);
    setPayIban('');
    setPayAmount('');
    setPayDescription('');
    setFinnResult(null);
    setPaymentNotice(null);
  }, []);

  const closePay = useCallback(() => {
    setPayOpen(false);
    setFinnResult(null);
  }, []);

  const removeAssistFile = useCallback((key) => {
    setAssistFiles((prev) => prev.filter((x) => fileKey(x) !== key));
  }, []);

  const onAssistFilesChange = useCallback((e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    setAssistFiles((prev) => {
      const seen = new Set(prev.map(fileKey));
      const next = [...prev];
      for (const f of picked) {
        const k = fileKey(f);
        if (!seen.has(k)) {
          seen.add(k);
          next.push(f);
        }
      }
      return next;
    });
  }, []);

  const submitAssist = useCallback(async () => {
    setAssistError('');
    setAssistSubmitting(true);
    const form = new FormData();
    const paymentContext = assistMode === 'flagged' && selectedWardenPayment
      ? [
          `Payment under Warden review: ${selectedWardenPayment.recipient}`,
          `IBAN: ${selectedWardenPayment.iban}`,
          `Amount: ${selectedWardenPayment.amount}`,
          `Description: ${selectedWardenPayment.description}`,
          `Cooldown: ${selectedWardenPayment.cooldown} in the 24h safety window`,
        ].join('\n')
      : '';
    form.append('text', [paymentContext, assistText].filter(Boolean).join('\n\n'));
    form.append('mode', assistMode);
    for (const f of assistFiles) {
      form.append('files', f);
    }
    try {
      const res = await fetch(`${API_BASE}/cancellable-assist`, {
        method: 'POST',
        body: form,
      });
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (!res.ok) {
        let msg = (data && (data.detail || data.message)) || raw || `Request failed (${res.status})`;
        if (Array.isArray(data?.detail)) {
          msg = data.detail.map((d) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join('; ');
        }
        setAssistError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        return;
      }
      setAssistResult(data);
    } catch (err) {
      setAssistError(err?.message || 'Network error — is the backend running?');
    } finally {
      setAssistSubmitting(false);
    }
  }, [assistText, assistFiles, assistMode, selectedWardenPayment]);

  const isScamIdentified = assistResult?.outcome === 'scam_identified';
  const isConsistentEvidence = assistResult?.outcome === 'legitimate_consistent_evidence';
  const displayedRisk = isConsistentEvidence ? 'Low' : assistResult?.risk_factor;
  const riskClass = RISK_STYLES[displayedRisk] || 'text-white/70 bg-white/10 border-white/10';
  const isFlaggedReview = assistMode === 'flagged';
  const isPaymentReady = payIban.trim() && payAmount.trim();

  const submitPayment = useCallback(() => {
    if (!payIban.trim() || !payAmount.trim()) return;

    const scan = finnScanPayment({
      iban: payIban,
      amount: payAmount,
      description: payDescription,
    });
    const payment = {
      id: `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      recipient: payDescription.trim() || 'New payment',
      iban: payIban.trim().toUpperCase(),
      amount: formatPaymentAmount(payAmount),
      description: payDescription.trim() || 'No description',
      time: 'now',
      cooldown: '24h left',
      reasons: scan.reasons.length ? scan.reasons : ['Finn risk model matched this transfer'],
    };

    if (scan.flagged) {
      setWardenPayments((prev) => [payment, ...prev]);
      setSelectedWardenPayment(payment);
      setFraudTxCanceled(false);
      setPaymentNotice({
        status: 'flagged',
        title: 'Finn raised a flag',
        body: 'The payment is now in a 24h safety window. Warden can investigate it.',
      });
      setPayOpen(false);
      setFinnResult(null);
      setPayIban('');
      setPayAmount('');
      setPayDescription('');
      return;
    }

    setTransactions((prev) => [
      {
        id: payment.id,
        icon: <ArrowUp className="w-5 h-5" />,
        bg: 'bg-emerald-500/15 text-emerald-400',
        name: payment.recipient,
        cat: payment.iban,
        amount: `- ${payment.amount}`,
      },
      ...prev,
    ]);
    setPaymentNotice({
      status: 'clear',
      title: 'Payment added',
      body: 'Finn found no strong risk signal, so it was added to Recent.',
    });
    setPayOpen(false);
    setFinnResult(null);
    setPayIban('');
    setPayAmount('');
    setPayDescription('');
  }, [payAmount, payDescription, payIban]);

  const cancelFraudTransaction = useCallback(() => {
    setWardenPayments((prev) => prev.filter((payment) => payment.id !== selectedWardenPayment?.id));
    setSelectedWardenPayment(null);
    setFraudTxCanceled(true);
    setAssistOpen(false);
    setAssistResult(null);
    setAssistText('');
    setAssistFiles([]);
    setAssistError('');
    if (assistFileRef.current) assistFileRef.current.value = '';
  }, [selectedWardenPayment]);

  return (
    <div className="screen-enter pb-8">

      {/* ── Balance Hero ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-5">
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.12em]">Total Balance</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-[40px] font-black text-white leading-none tracking-tight">€ 12,450</span>
            <span className="text-2xl font-black text-white/35 leading-none mb-0.5">.00</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">+2.4% this month</span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      {paymentNotice && (
        <div className="px-5 mb-5">
          <div className={`rounded-[1.7rem] border px-4 py-4 flex items-start gap-3 ${
            paymentNotice.status === 'flagged'
              ? 'bg-rose-500/10 border-rose-500/25'
              : 'bg-emerald-500/10 border-emerald-500/25'
          }`}>
            <div className={`w-10 h-10 rounded-2xl grid place-items-center shrink-0 ${
              paymentNotice.status === 'flagged'
                ? 'bg-rose-500/15 text-rose-300'
                : 'bg-emerald-500/15 text-emerald-300'
            }`}>
              {paymentNotice.status === 'flagged' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white">{paymentNotice.title}</p>
              <p className="text-[12px] text-white/55 font-semibold mt-1 leading-snug">{paymentNotice.body}</p>
              {paymentNotice.status === 'flagged' && (
                <button
                  type="button"
                  onClick={() => openAssist('flagged')}
                  className="mt-3 text-[11px] font-black bunq-text-gradient"
                >
                  Let Warden look into it
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setPaymentNotice(null)}
              className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-white/60 hover:text-white transition shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="px-5 mb-5">
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, action, icon, color }) => (
            <button
              key={label}
              type="button"
              onClick={action === 'check' ? () => openAssist('self') : action === 'pay' ? openPay : undefined}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-2xl ${color} shadow-lg grid place-items-center text-white transition hover:scale-105`}>
                {icon}
              </div>
              <span className="text-[11px] font-bold text-white/50">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Accounts ── */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">Accounts</h3>
          <button className="text-[11px] font-bold text-white/35 hover:text-white/60 transition">See all</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ACCOUNTS.map(({ label, amount, sub, icon, iconBg }) => (
            <div key={label} className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4">
              <div className={`w-9 h-9 rounded-xl ${iconBg} grid place-items-center mb-3`}>
                {icon}
              </div>
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-wide">{label}</p>
              <p className="font-black text-white mt-1 text-[15px]">{amount}</p>
              <p className="text-[10px] text-white/25 mt-1 font-mono truncate">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Warden alerts ── */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">Warden alerts</h3>
          {wardenPayments.length > 0 && (
            <button
              type="button"
              onClick={() => openAssist('flagged', wardenPayments[0])}
              className="text-[11px] font-bold text-white/35 hover:text-white/60 transition"
            >
              View all
            </button>
          )}
        </div>
        {wardenPayments.length > 0 ? (
          <div className="rounded-[1.7rem] bg-[#19191b] border border-white/[0.08] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.12em]">Revocable payments</p>
                <p className="text-sm font-black text-white mt-0.5">{wardenPayments.length} Finn flag{wardenPayments.length === 1 ? '' : 's'}</p>
              </div>
              <span className="text-[10px] font-black text-rose-200 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-full">
                Investigate?
              </span>
            </div>
            {wardenPayments.map((payment, i) => (
              <button
                key={payment.id}
                type="button"
                onClick={() => openAssist('flagged', payment)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition ${i < wardenPayments.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.08] grid place-items-center shrink-0">
                  <div className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-300 grid place-items-center">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-white truncate">{payment.recipient}</p>
                  <p className="text-[11px] text-white/35 font-semibold truncate">{payment.description} - {payment.iban}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-white">- {payment.amount}</p>
                  <p className="text-[10px] text-white/35 font-bold mt-0.5">{payment.cooldown}</p>
                </div>
              </button>
            ))}
          </div>
        ) : fraudTxCanceled ? (
          <div className="rounded-[1.7rem] bg-[#19191b] border border-emerald-500/20 px-4 py-3.5">
            <p className="text-sm font-black text-emerald-300">Payment revoked</p>
            <p className="text-[11px] text-white/35 font-semibold mt-1">No active Warden alerts.</p>
          </div>
        ) : (
          <div className="rounded-[1.7rem] bg-[#19191b] border border-white/[0.06] px-4 py-3.5">
            <p className="text-sm font-black text-white/70">No Warden alerts</p>
          </div>
        )}
      </div>

      {/* ── Warden self-check ── */}
      <div className="px-5 mb-5">
        <button
          type="button"
          onClick={() => openAssist('self')}
          className="w-full rounded-[1.7rem] bg-[#19191b] border border-white/[0.08] px-4 py-4 text-left flex items-center gap-3 hover:bg-white/[0.03] transition"
        >
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 text-orange-400 grid place-items-center shrink-0">
            <ScanSearch className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white">Warden self-check</p>
            <p className="text-[11px] text-white/35 font-semibold mt-0.5 leading-snug">
              Scan a weird message, invoice, or PDF before you act.
            </p>
          </div>
        </button>
      </div>

      <div className="mb-5">
        <div className="px-5 flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">My Cards</h3>
          <button className="text-[11px] font-bold text-white/35 hover:text-white/60 transition">Manage</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
          {VIRTUAL_CARDS.map(({ gradient, last4, type }) => (
            <div
              key={last4}
              className={`shrink-0 w-[195px] h-[115px] rounded-3xl bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between shadow-xl relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between relative">
                <CreditCard className="w-5 h-5 text-white/70" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">{type}</span>
              </div>
              <div className="relative">
                <p className="text-white font-black text-sm tracking-[0.18em]">•••• {last4}</p>
                <p className="text-[10px] text-white/50 mt-0.5 font-semibold uppercase tracking-widest">John Doe</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">Recent</h3>
          <button onClick={() => openAssist('self')} className="text-[11px] font-black bunq-text-gradient">
            Warden
          </button>
        </div>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] overflow-hidden">
          {transactions.map(({ id, icon, bg, name, cat, amount }, i) => (
            <div
              key={id ?? `${name}-${cat}-${i}`}
              className={`flex justify-between items-center gap-3 px-4 py-3.5 ${i < transactions.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-2xl ${bg} grid place-items-center shrink-0`}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white truncate">{name}</p>
                  <p className="text-[11px] text-white/35 font-bold">{cat}</p>
                </div>
              </div>
              <span className="text-sm text-white font-black shrink-0">{amount}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {payOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[290] flex items-end justify-center sm:items-center p-4 bg-black/65"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pay-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={spring}
              className="w-full max-w-[min(100%,380px)] rounded-[2rem] bg-[#141414] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.85)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <h2 id="pay-title" className="text-[15px] font-black text-white truncate">
                    {finnResult ? 'Finn safety scan' : 'Add payment'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closePay}
                  className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white hover:bg-white/15 transition shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {!finnResult ? (
                  <>
                    <p className="text-[12px] text-white/45 font-semibold leading-relaxed">
                      Finn scans the payment after you add it. Clear payments go to Recent; flagged payments get a 24h safety window and Warden asks whether to investigate.
                    </p>
                    <label className="block">
                      <span className="text-[10px] font-black text-white/35 uppercase tracking-[0.12em]">To IBAN</span>
                      <input
                        type="text"
                        value={payIban}
                        onChange={(e) => setPayIban(e.target.value)}
                        placeholder="NL99 BUNQ 0000 0000 00"
                        className="mt-2 w-full p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] text-sm text-white placeholder-white/25 focus:ring-2 focus:ring-emerald-500/40 outline-none font-semibold"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black text-white/35 uppercase tracking-[0.12em]">Amount</span>
                      <input
                        type="text"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="EUR 0.00"
                        className="mt-2 w-full p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] text-lg text-white placeholder-white/25 focus:ring-2 focus:ring-emerald-500/40 outline-none font-black"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black text-white/35 uppercase tracking-[0.12em]">Description</span>
                      <input
                        type="text"
                        value={payDescription}
                        onChange={(e) => setPayDescription(e.target.value)}
                        placeholder="Invoice, marketplace item, rent..."
                        className="mt-2 w-full p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] text-sm text-white placeholder-white/25 focus:ring-2 focus:ring-emerald-500/40 outline-none font-semibold"
                      />
                    </label>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className={`rounded-2xl border px-4 py-4 ${finnResult.status === 'flagged' ? 'bg-rose-500/10 border-rose-500/25' : 'bg-emerald-500/10 border-emerald-500/25'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl grid place-items-center shrink-0 ${finnResult.status === 'flagged' ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                          {finnResult.status === 'flagged' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white">
                            {finnResult.status === 'flagged' ? 'Finn raised a flag' : 'Finn cleared it'}
                          </p>
                          <p className="text-[12px] text-white/55 font-semibold mt-1 leading-snug">
                            {finnResult.status === 'flagged'
                              ? 'The payment is on a 24h cooldown. Warden can investigate the source before the customer decides what to do.'
                              : 'No strong risk signal was found, so the payment was added to Recent.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {finnResult.status === 'flagged' && (
                      <div className="rounded-2xl bg-[#1c1c1e] border border-white/[0.06] px-4 py-3">
                        <div className="flex items-center gap-2 text-amber-200">
                          <Clock3 className="w-4 h-4" />
                          <span className="text-[11px] font-black uppercase tracking-[0.1em]">24h safety window</span>
                        </div>
                        <ul className="mt-3 space-y-2">
                          {finnResult.payment.reasons.map((reason) => (
                            <li key={reason} className="text-[12px] text-white/60 font-semibold">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-5 pb-5 pt-2 space-y-2 border-t border-white/[0.06]">
                {!finnResult ? (
                  <>
                    <button
                      type="button"
                      onClick={submitPayment}
                      disabled={!isPaymentReady}
                      className={`w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.24)] flex justify-center items-center gap-2 ${!isPaymentReady ? 'opacity-45 cursor-not-allowed' : ''}`}
                    >
                      <Send className="w-5 h-5" />
                      Add payment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPayIban(FLAGGED_IBAN);
                        setPayAmount('EUR 1,500.00');
                        setPayDescription('Marketplace deposit');
                      }}
                      className="w-full py-3.5 rounded-2xl bg-white/10 text-white/80 font-black text-sm hover:bg-white/14 transition"
                    >
                      Fill flagged demo
                    </button>
                  </>
                ) : finnResult.status === 'flagged' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        closePay();
                        openAssist('flagged');
                      }}
                      className="w-full bunq-gradient text-white font-black py-4 rounded-2xl rainbow-shadow"
                    >
                      Let Warden look into it
                    </button>
                    <button
                      type="button"
                      onClick={closePay}
                      className="w-full py-3.5 rounded-2xl bg-white/10 text-white/80 font-black text-sm hover:bg-white/14 transition"
                    >
                      Later
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={closePay}
                    className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.24)]"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assistOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center p-4 bg-black/65"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assist-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={spring}
              className="w-full max-w-[min(100%,380px)] max-h-[min(86vh,720px)] rounded-[2rem] bg-[#141414] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
            >
              <div className="shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-orange-500/15 text-orange-400 grid place-items-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h2 id="assist-title" className="text-[15px] font-black text-white truncate">
                    {assistResult ? 'Warden verdict' : isFlaggedReview ? 'Investigate flagged payment?' : 'Check this'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeAssist}
                  className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white hover:bg-white/15 transition shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
                {!assistResult && (
                  <>
                    <p className="text-[12px] text-white/45 font-semibold leading-relaxed">
                      {isFlaggedReview
                        ? 'bunqAI flagged this completed payment. Add context so Warden can investigate the source before you decide what to do.'
                        : 'Got a strange message, email, invoice, or PDF telling you to make a payment? Let Warden check it for scam signals first.'}
                    </p>
                    <p className="text-[12px] text-white/45 font-semibold leading-relaxed">
                      {isFlaggedReview
                        ? 'Upload screenshots, invoices, chats, or letters linked to this transfer.'
                        : 'Upload the document or paste the message. No payment needs to exist for this scan.'}
                    </p>
                    <textarea
                      rows={4}
                      value={assistText}
                      onChange={(e) => setAssistText(e.target.value)}
                      placeholder={isFlaggedReview ? 'Why you sent money, what they told you, what concerns you...' : 'Paste the suspicious instructions or describe what feels off...'}
                      className="w-full p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] text-sm text-white placeholder-white/25 focus:ring-2 focus:ring-orange-500/40 outline-none resize-none font-semibold"
                    />
                    <input
                      ref={assistFileRef}
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf"
                      multiple
                      onChange={onAssistFilesChange}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={spring}
                      onClick={() => assistFileRef.current?.click()}
                      className="w-full rounded-2xl border border-dashed border-white/15 py-4 px-4 text-left hover:border-white/25 transition"
                    >
                      <p className="text-xs font-black text-white">{isFlaggedReview ? 'Upload evidence' : 'Upload message or PDF'}</p>
                      <p className="text-[11px] text-white/35 font-semibold mt-1">JPEG, PNG, or PDF only</p>
                    </motion.button>
                    {assistFiles.length > 0 && (
                      <ul className="space-y-2">
                        {assistFiles.map((f) => {
                          const k = fileKey(f);
                          const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
                          return (
                            <li
                              key={k}
                              className="flex items-center gap-3 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] px-3 py-2.5"
                            >
                              <div className="w-9 h-9 rounded-xl bg-white/10 text-white/70 grid place-items-center shrink-0">
                                {isPdf ? <FileText className="w-4 h-4" /> : <span className="text-[10px] font-black">IMG</span>}
                              </div>
                              <span className="text-[11px] font-bold text-white/80 truncate flex-1 min-w-0">{f.name}</span>
                              <button
                                type="button"
                                onClick={() => removeAssistFile(k)}
                                className="text-[11px] font-black text-rose-400 shrink-0 px-2 py-1 rounded-lg hover:bg-rose-500/10"
                              >
                                Remove
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                )}

                {assistResult && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-[#1c1c1e] border border-white/[0.08] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.1em]">
                            Assessment
                          </p>
                          <h3 className="text-lg font-black text-white mt-1 leading-tight">
                            {isScamIdentified ? assistResult.scam_type || 'Scam identified' : OUTCOME_HEADLINES[assistResult.outcome]}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-black border px-2 py-1 rounded-full shrink-0 ${riskClass}`}>
                          {displayedRisk || 'Unknown'} risk
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 py-3">
                      <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.1em]">
                        {OUTCOME_HEADLINES[assistResult.outcome] || 'Assessment'}
                      </p>
                      <p className="text-sm font-bold text-white/80 mt-2 leading-snug">
                        {assistResult.summary}
                      </p>
                    </div>

                    {isScamIdentified && assistResult.reasons?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-white/35 uppercase tracking-wide mb-2">3 reasons</p>
                        <ul className="space-y-2">
                          {assistResult.reasons.slice(0, 3).map((reason, i) => (
                            <li key={reason} className="flex gap-2 text-[12px] text-white/65 font-semibold">
                              <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-200 grid place-items-center text-[10px] font-black shrink-0">
                                {i + 1}
                              </span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className={`rounded-2xl border px-4 py-4 ${isScamIdentified ? 'bg-rose-500/10 border-rose-500/25' : isConsistentEvidence ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.04] border-white/[0.06]'}`}>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-wide">Recommended</p>
                      <p className="text-sm font-black text-white mt-2 leading-relaxed">
                        {assistResult.recommended_action}
                      </p>
                    </div>
                  </div>
                )}

                {assistError && (
                  <p className="text-[12px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                    {assistError}
                  </p>
                )}
              </div>

              <div className="shrink-0 px-5 pb-5 pt-2 space-y-2 border-t border-white/[0.06]">
                {!assistResult ? (
                  <>
                    <motion.button
                      type="button"
                      disabled={assistSubmitting}
                      whileHover={!assistSubmitting ? { y: -2 } : undefined}
                      whileTap={!assistSubmitting ? { scale: 0.98 } : undefined}
                      transition={spring}
                      onClick={submitAssist}
                      className={`w-full bunq-gradient text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 rainbow-shadow ${assistSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {assistSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing…
                        </>
                      ) : (
                        isFlaggedReview ? 'Investigate payment' : 'Check for fraud'
                      )}
                    </motion.button>
                    <button
                      type="button"
                      onClick={closeAssist}
                      className="w-full py-3.5 rounded-2xl bg-white/10 text-white/80 font-black text-sm hover:bg-white/14 transition"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    {isScamIdentified && isFlaggedReview && (
                      <button
                        type="button"
                        onClick={cancelFraudTransaction}
                        className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-[0_20px_50px_rgba(244,63,94,0.22)]"
                      >
                        Cancel transaction
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={closeAssist}
                      className="w-full py-3.5 rounded-2xl bg-white/10 text-white/80 font-black text-sm hover:bg-white/14 transition"
                    >
                      {isScamIdentified && isFlaggedReview ? 'Not now (proceed with caution)' : 'Done'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
