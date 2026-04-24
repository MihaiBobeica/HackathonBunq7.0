import { useState } from 'react';
import { Signal, Wifi, BatteryFull, ChevronLeft, UserRound, Sparkles, Mic, Home, CreditCard, CircleUserRound, PhoneCall } from 'lucide-react';
import './index.css';

import HomeScreen from './screens/HomeScreen';
import PaymentScreen from './screens/PaymentScreen';
import FlaggedScreen from './screens/FlaggedScreen';
import UploadScreen from './screens/UploadScreen';
import AnalysisResultScreen from './screens/AnalysisResultScreen';
import TrustScreen from './screens/TrustScreen';

const FLAGGED_IBAN = 'NL99 BUNQ 0123 4567 89';

const SCREEN_TITLES = {
  home: 'Home',
  payment: 'New payment',
  flagged: 'Security check',
  upload: 'Context',
  result: 'Finn result',
  trust: 'Confirmation',
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [prevScreen, setPrevScreen] = useState('home');
  const [simCall, setSimCall] = useState(true);
  const [isAudioListening, setIsAudioListening] = useState(false);
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [trustedIbans] = useState(new Set());

  const [iban, setIban] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [riskScore, setRiskScore] = useState(89);
  const [riskReasons, setRiskReasons] = useState([]);

  function nav(to) {
    setPrevScreen(screen);
    setScreen(to);
  }

  function goHome() {
    setScreen('home');
    setPrevScreen('home');
    setIsAudioListening(false);
    setShowCallOverlay(false);
    setIban('');
    setAmount('');
    setDescription('');
  }

  function goBack() {
    if (screen === 'home') return;
    setScreen(prevScreen === screen ? 'home' : prevScreen);
    setPrevScreen('home');
  }

  function startPayment() {
    nav('payment');
    if (simCall) setShowCallOverlay(true);
  }

  function handleSend() {
    const normalised = iban.trim().toUpperCase();
    if (!normalised) { alert('Please enter an IBAN.'); return; }
    if (trustedIbans.has(normalised)) { alert('Payment processed. This IBAN is trusted.'); goHome(); return; }

    if (isAudioListening) {
      showResult(96, [
        'Call pressure detected: urgent transfer requested while you were on the phone.',
        'Voice stress pattern increased when payment details were discussed.',
        'Recipient is not in your trusted bunq payment history.',
      ]);
    } else if (normalised === FLAGGED_IBAN) {
      nav('flagged');
    } else {
      alert('Payment processed successfully.');
      goHome();
    }
  }

  function showResult(score, reasons) {
    setRiskScore(score);
    setRiskReasons(reasons);
    nav('result');
  }

  function finalizePayment(type) {
    const normalised = iban.trim().toUpperCase();
    if (type === 'trusted' && normalised) trustedIbans.add(normalised);
    alert(type === 'trusted' ? 'Payment sent. IBAN marked as trusted.' : 'Payment sent. Finn warnings will persist next time.');
    goHome();
  }

  const showBack = screen !== 'home';
  const showBottomNav = screen === 'home';

  return (
    <div className="app-bg min-h-screen flex items-center justify-center p-4 text-slate-900">
      <main className="relative w-full max-w-[402px] h-[840px] rounded-[2.7rem] bg-slate-950 p-2 shadow-[0_35px_90px_rgba(15,23,42,0.35)]">
        <div className="h-full rounded-[2.2rem] overflow-hidden bg-[#f6f7fb] flex flex-col relative border border-slate-800">

          {/* Status bar */}
          <div className="h-8 bg-slate-950 text-white px-7 flex items-center justify-between text-[11px] font-semibold shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryFull className="w-4 h-4" />
            </div>
          </div>

          {/* Header */}
          <header className="bunq-gradient text-white px-5 pt-4 pb-4 shrink-0 relative z-30">
            <div className="flex items-center justify-between gap-3">
              {showBack ? (
                <button onClick={goBack} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : <div className="w-10" />}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white text-slate-950 grid place-items-center font-black text-[15px]">b</div>
                  <div className="leading-tight min-w-0">
                    <p className="text-[11px] font-bold opacity-85">bunqAI</p>
                    <h1 className="font-black text-[17px] truncate tracking-normal">{SCREEN_TITLES[screen]}</h1>
                  </div>
                </div>
              </div>

              <div className="w-10 h-10 grid place-items-center">
                {isAudioListening ? (
                  <div className="relative w-10 h-10 rounded-full bg-emerald-500 grid place-items-center mic-active">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition">
                    <UserRound className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Screens */}
          <section className="flex-1 min-h-0 overflow-y-auto relative no-scrollbar">
            {screen === 'home' && (
              <HomeScreen onStartPayment={startPayment} onForceAI={() => nav('upload')} />
            )}
            {screen === 'payment' && (
              <PaymentScreen
                iban={iban} setIban={setIban}
                amount={amount} setAmount={setAmount}
                description={description} setDescription={setDescription}
                isAudioListening={isAudioListening}
                onSend={handleSend}
                onForceAI={() => nav('upload')}
              />
            )}
            {screen === 'flagged' && (
              <FlaggedScreen
                onUpload={() => nav('upload')}
                onCancel={goHome}
                onIgnore={() => nav('trust')}
              />
            )}
            {screen === 'upload' && (
              <UploadScreen
                onAnalyze={(score, reasons) => showResult(score, reasons)}
                onBack={goBack}
              />
            )}
            {screen === 'result' && (
              <AnalysisResultScreen
                score={riskScore}
                reasons={riskReasons}
                onStop={goHome}
                onContinue={() => nav('trust')}
              />
            )}
            {screen === 'trust' && (
              <TrustScreen
                onTrust={() => finalizePayment('trusted')}
                onOnce={() => finalizePayment('once')}
                onBack={goBack}
              />
            )}
          </section>

          {/* Bottom nav */}
          {showBottomNav && (
            <nav className="absolute bottom-0 left-0 right-0 z-30 mx-4 mb-4 rounded-[1.75rem] glass border border-white/80 shadow-lg px-3 py-2">
              <div className="grid grid-cols-4 gap-1 text-[10px] font-black text-slate-400">
                <button className="h-14 rounded-2xl text-pink-600 bg-pink-50 grid place-items-center">
                  <span className="grid place-items-center gap-0.5"><Home className="w-5 h-5" />Home</span>
                </button>
                <button className="h-14 rounded-2xl hover:bg-slate-50 grid place-items-center">
                  <span className="grid place-items-center gap-0.5"><CreditCard className="w-5 h-5" />Cards</span>
                </button>
                <button onClick={() => nav('upload')} className="h-14 rounded-2xl hover:bg-slate-50 grid place-items-center">
                  <span className="grid place-items-center gap-0.5"><Sparkles className="w-5 h-5" />Finn</span>
                </button>
                <button className="h-14 rounded-2xl hover:bg-slate-50 grid place-items-center">
                  <span className="grid place-items-center gap-0.5"><CircleUserRound className="w-5 h-5" />Me</span>
                </button>
              </div>
            </nav>
          )}

          {/* Active call overlay */}
          {showCallOverlay && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-[80] flex items-center justify-center p-5">
              <div className="bg-white w-full rounded-[2rem] p-5 shadow-2xl">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 bg-indigo-50 rounded-3xl grid place-items-center text-indigo-600 mb-3">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase">bunqAI safety prompt</p>
                  <h3 className="font-black text-slate-950 text-2xl mt-1">Active call detected</h3>
                </div>
                <p className="text-sm text-slate-500 text-center mb-5 leading-relaxed">
                  Finn noticed that this payment started during a call. Audio pressure detection can help identify coercion before money leaves your account.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { setShowCallOverlay(false); setIsAudioListening(true); }}
                    className="w-full bunq-gradient text-white py-4 rounded-3xl font-black text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
                  >
                    <Mic className="w-5 h-5" />Allow audio analysis
                  </button>
                  <button
                    onClick={() => setShowCallOverlay(false)}
                    className="w-full bg-slate-100 text-slate-700 py-4 rounded-3xl font-black text-sm hover:bg-slate-200 transition"
                  >
                    Continue without audio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Demo toggle */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-3 rounded-full shadow-lg border border-slate-200">
        <label className="text-xs font-black text-slate-700 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={simCall}
            onChange={e => setSimCall(e.target.checked)}
            className="accent-pink-500 w-4 h-4"
          />
          Simulate active call
        </label>
      </div>
    </div>
  );
}
