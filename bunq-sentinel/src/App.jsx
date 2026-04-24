import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Signal, Wifi, ChevronLeft,
  Home, CreditCard, PiggyBank, BarChart3, Shield,
  UserRound,
} from 'lucide-react';
import './index.css';

import HomeScreen           from './screens/HomeScreen';
import PaymentScreen        from './screens/PaymentScreen';
import FlaggedScreen        from './screens/FlaggedScreen';
import UploadScreen         from './screens/UploadScreen';
import AnalysisResultScreen from './screens/AnalysisResultScreen';
import TrustScreen          from './screens/TrustScreen';
import SuccessScreen        from './screens/SuccessScreen';

const FLAGGED_IBAN = 'NL99 BUNQ 0123 4567 89';

const SCREEN_TITLES = {
  home:    'Home',
  payment: 'New payment',
  flagged: 'Security check',
  upload:  'Context',
  result:  'Warden result',
  trust:   'Confirmation',
  success: 'Done',
};

const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function App() {
  const [screen, setScreen]         = useState('home');
  const [prevScreen, setPrevScreen] = useState('home');
  const [trustedIbans]              = useState(new Set());

  const [iban, setIban]               = useState('');
  const [amount, setAmount]           = useState('');
  const [description, setDescription] = useState('');
  const [riskScore, setRiskScore]     = useState(89);
  const [riskReasons, setRiskReasons] = useState([]);
  const [analysisVerdict, setAnalysisVerdict] = useState(null);

  const [successAmount,    setSuccessAmount]    = useState('');
  const [successRecipient, setSuccessRecipient] = useState('');
  const [successTrusted,   setSuccessTrusted]   = useState(false);

  function nav(to) { setPrevScreen(screen); setScreen(to); }

  function goHome() {
    setScreen('home'); setPrevScreen('home');
    setIban(''); setAmount(''); setDescription('');
    setAnalysisVerdict(null);
    setSuccessAmount(''); setSuccessRecipient(''); setSuccessTrusted(false);
  }

  function goBack() {
    if (screen === 'home') return;
    setScreen(prevScreen === screen ? 'home' : prevScreen);
    setPrevScreen('home');
  }

  function showSuccess(amt, recipient, trusted = false) {
    setSuccessAmount(amt);
    setSuccessRecipient(recipient);
    setSuccessTrusted(trusted);
    nav('success');
  }

  function handleSend() {
    const n = iban.trim().toUpperCase();
    if (!n) return;
    if (trustedIbans.has(n)) {
      showSuccess(amount, n);
      return;
    }
    if (n === FLAGGED_IBAN) {
      nav('flagged');
    } else {
      showSuccess(amount, n);
    }
  }

  function showResult(verdictOrScore, reasons = []) {
    const verdict = typeof verdictOrScore === 'object'
      ? verdictOrScore
      : {
          risk_level: verdictOrScore >= 70 ? 'high' : verdictOrScore >= 35 ? 'medium' : 'low',
          risk_score: verdictOrScore,
          headline: 'Warden completed the scam check.',
          reasons,
          safe_actions: [],
        };

    setAnalysisVerdict(verdict);
    setRiskScore(verdict.risk_score ?? 0);
    setRiskReasons(verdict.reasons ?? []);
    nav('result');
  }

  function finalizePayment(type) {
    const n = iban.trim().toUpperCase();
    const trusted = type === 'trusted';
    if (trusted && n) trustedIbans.add(n);
    showSuccess(amount, n, trusted);
  }

  const isHome    = screen === 'home';
  const isSuccess = screen === 'success';

  return (
    <div className="app-bg min-h-screen flex items-center justify-center p-4">
      <main className="relative w-full max-w-[402px] h-[840px] rounded-[2.7rem] bg-neutral-950 p-[3px] shadow-[0_36px_100px_rgba(0,0,0,0.75)]">
        <div className="h-full rounded-[2.4rem] overflow-hidden bg-black flex flex-col relative">
          <div className="relative h-11 bg-black text-white px-9 flex items-center justify-between text-[18px] font-semibold shrink-0">
            <span className="font-extrabold">9:41</span>
            <div className="flex items-center gap-1.5 text-white">
              <Signal className="w-4 h-4" />
              <Wifi className="w-4 h-4" />
              <div className="h-5 min-w-8 rounded-md bg-yellow-400 px-1 text-[12px] font-black leading-5 text-black">41</div>
            </div>
          </div>

          {!isSuccess && !isHome && (
            <header className="bg-black px-6 pt-4 pb-5 shrink-0 relative z-30">
              <div className="flex items-center justify-between gap-3">
                <motion.button
                  onClick={goBack}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                  className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <span className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white text-[15px]">
                  {SCREEN_TITLES[screen]}
                </span>

                <div className="w-10 h-10 grid place-items-center">
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white/70 transition">
                    <UserRound className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </header>
          )}

          <section className="flex-1 min-h-0 overflow-y-auto relative no-scrollbar">
            {screen === 'home'    && <HomeScreen onStartPayment={() => nav('payment')} onForceAI={() => nav('upload')} />}
            {screen === 'payment' && (
              <PaymentScreen
                iban={iban} setIban={setIban}
                amount={amount} setAmount={setAmount}
                description={description} setDescription={setDescription}
                onSend={handleSend}
                onForceAI={() => nav('upload')}
              />
            )}
            {screen === 'flagged' && (
              <FlaggedScreen onUpload={() => nav('upload')} onCancel={goHome} onIgnore={() => nav('trust')} />
            )}
            {screen === 'upload'  && (
              <UploadScreen onAnalyze={showResult} onBack={goBack} />
            )}
            {screen === 'result'  && (
              <AnalysisResultScreen verdict={analysisVerdict} score={riskScore} reasons={riskReasons} onStop={goHome} onContinue={() => nav('trust')} />
            )}
            {screen === 'trust'   && (
              <TrustScreen onTrust={() => finalizePayment('trusted')} onOnce={() => finalizePayment('once')} onBack={goBack} />
            )}
            {screen === 'success' && (
              <SuccessScreen
                amount={successAmount}
                recipient={successRecipient}
                trusted={successTrusted}
                onDone={goHome}
              />
            )}
          </section>

          {isHome && (
            <nav className="shrink-0 bg-[#171717]/95 backdrop-blur-xl px-4 pb-5 pt-3 shadow-[0_-22px_44px_rgba(0,0,0,0.8)]">
              <div className="grid grid-cols-5 gap-1 text-[11px] font-bold">
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[#0a9dff]">
                  <Home className="w-6 h-6 fill-current" />
                  <span>Home</span>
                </motion.button>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition">
                  <CreditCard className="w-6 h-6" />
                  <span>Cards</span>
                </motion.button>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition">
                  <PiggyBank className="w-6 h-6 fill-current" />
                  <span>Savings</span>
                </motion.button>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition">
                  <BarChart3 className="w-6 h-6" />
                  <span>Stocks</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                  className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition"
                  type="button"
                >
                  <Shield className="w-6 h-6 fill-current" />
                  <span>Crypto</span>
                </motion.button>
              </div>
            </nav>
          )}
        </div>
      </main>
    </div>
  );
}
