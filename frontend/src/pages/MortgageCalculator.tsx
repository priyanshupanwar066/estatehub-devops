import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  IndianRupee, Percent, HelpCircle, TrendingDown, ShieldCheck,
  ArrowRight, Landmark, Info, Wallet
} from 'lucide-react';


const EASE = [0.22, 1, 0.36, 1] as const;

const formatINR = (value: number): string => {
  if (!Number.isFinite(value)) return '—';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};
const formatFull = (value: number): string => `₹${Math.round(value).toLocaleString('en-IN')}`;

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

const MortgageCalculator: React.FC = () => {
  const reducedMotion = useReducedMotion();

  const [homeValue, setHomeValue] = useState<number>(4500000); // ₹45L default
  const [downPayment, setDownPayment] = useState<number>(900000); // 20% default
  const [interestRate, setInterestRate] = useState<number>(8.5); // typical Indian home loan rate
  const [loanTerm, setLoanTerm] = useState<number>(20); // years
  const [maintenanceCharges, setMaintenanceCharges] = useState<number>(2500); // monthly society maintenance, editable
  const [stampDutyRate, setStampDutyRate] = useState<number>(7); // % — varies by state, editable

  const downPaymentPercent = Math.round((downPayment / homeValue) * 100);

  const handleHomeValueChange = (val: number) => {
    setHomeValue(val);
    const pct = downPaymentPercent / 100;
    setDownPayment(Math.round(val * pct));
  };

  const handleDownPaymentChange = (val: number) => {
    setDownPayment(val > homeValue ? homeValue : val);
  };

  const { loanAmount, monthlyEMI, numberOfPayments, totalPayment, totalInterest } = useMemo(() => {
    const principal = homeValue - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const n = loanTerm * 12;
    let emi = 0;
    if (interestRate > 0 && principal > 0) {
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    } else if (principal > 0) {
      emi = principal / n;
    }
    if (isNaN(emi) || !isFinite(emi)) emi = 0;
    const total = emi * n;
    const interest = Math.max(0, total - principal);
    return { loanAmount: principal, monthlyEMI: emi, numberOfPayments: n, totalPayment: total, totalInterest: interest };
  }, [homeValue, downPayment, interestRate, loanTerm]);

  const stampDutyAmount = homeValue * (stampDutyRate / 100);
  const upfrontCashNeeded = downPayment + stampDutyAmount;

  // Lifetime Principal vs Interest donut — the honest way to visualize a loan,
  // rather than an invented monthly fee bundle.
  const donutData = [
    { name: 'Principal', value: loanAmount, color: '#14B8A6' },
    { name: 'Interest', value: totalInterest, color: '#FF6B35' },
  ];
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0) || 1;
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutCumulative = 0;

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto">
      {/* Header */}
      <Reveal>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-[#12141C] tracking-tight">
            EMI & affordability calculator
          </h1>
          <p className="text-sm text-[#55534C] mt-1.5 max-w-2xl">
            Estimate your home loan EMI, see the lifetime principal-vs-interest split, and get a clear picture of the one-time and recurring costs an EMI alone doesn't cover.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Inputs */}
        <Reveal delay={0.05} className="lg:col-span-7">
          <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 sm:p-8 space-y-8 shadow-[0_4px_16px_-8px_rgba(18,20,28,0.08)]">

            {/* Property Value */}
            <div className="space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <label htmlFor="home-value" className="text-sm font-bold text-[#12141C] flex items-center gap-1.5">
                  Property value <HelpCircle className="h-3.5 w-3.5 text-[#8A867C]" aria-hidden="true" />
                </label>
                <div className="relative rounded-lg border border-[#E7E2DA] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 focus-within:border-[#FF6B35] transition-all">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8A867C] font-bold">₹</span>
                  <input
                    id="home-value"
                    type="number"
                    value={homeValue}
                    onChange={(e) => handleHomeValueChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-40 pl-6 pr-3 py-1.5 text-right font-extrabold text-[#12141C] text-sm outline-none rounded-lg"
                  />
                </div>
              </div>
              <input
                type="range"
                min="1000000"
                max="50000000"
                step="100000"
                value={homeValue}
                onChange={(e) => handleHomeValueChange(parseInt(e.target.value))}
                aria-label="Property value slider"
                className="w-full h-2 bg-[#F0ECE4] rounded-lg appearance-none cursor-pointer accent-[#FF6B35] focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#8A867C] uppercase tracking-wider">
                <span>₹10L</span>
                <span>₹2.5Cr</span>
                <span>₹5Cr+</span>
              </div>
            </div>

            {/* Down Payment */}
            <div className="space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <label htmlFor="down-payment" className="text-sm font-bold text-[#12141C]">
                  Down payment <span className="text-xs font-semibold text-[#FF6B35] ml-1">({downPaymentPercent}% of total)</span>
                </label>
                <div className="relative rounded-lg border border-[#E7E2DA] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 focus-within:border-[#FF6B35] transition-all">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8A867C] font-bold">₹</span>
                  <input
                    id="down-payment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-40 pl-6 pr-3 py-1.5 text-right font-extrabold text-[#12141C] text-sm outline-none rounded-lg"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={homeValue}
                step="10000"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(parseInt(e.target.value))}
                aria-label="Down payment slider"
                className="w-full h-2 bg-[#F0ECE4] rounded-lg appearance-none cursor-pointer accent-[#FF6B35] focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#8A867C] uppercase tracking-wider">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              {downPaymentPercent < 10 && (
                <p className="text-[11px] text-[#B4472A] flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Most Indian lenders require at least 10&ndash;25% down payment depending on loan amount — check your bank's LTV norms.
                </p>
              )}
            </div>

            {/* Interest Rate & Term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="interest-rate" className="text-sm font-bold text-[#12141C]">Interest rate</label>
                  <div className="relative rounded-lg border border-[#E7E2DA] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 focus-within:border-[#FF6B35] transition-all">
                    <input
                      id="interest-rate"
                      type="number"
                      step="0.05"
                      min="0"
                      max="18"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 pl-3 pr-6 py-1.5 text-right font-extrabold text-[#12141C] text-sm outline-none rounded-lg"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#8A867C] font-bold">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="6"
                  max="14"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  aria-label="Interest rate slider"
                  className="w-full h-2 bg-[#F0ECE4] rounded-lg appearance-none cursor-pointer accent-[#FF6B35] focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#12141C] block">Loan term</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map((term) => (
                    <button
                      key={term}
                      onClick={() => setLoanTerm(term)}
                      aria-pressed={loanTerm === term}
                      className={`py-2 px-1 border text-xs font-extrabold rounded-lg cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 ${
                        loanTerm === term
                          ? 'bg-[#12141C] border-[#12141C] text-white'
                          : 'border-[#E7E2DA] text-[#55534C] bg-[#FAF8F5] hover:bg-[#F0ECE4]'
                      }`}
                    >
                      {term} yrs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Costs not covered by EMI */}
            <div className="space-y-3 pt-2 border-t border-[#E7E2DA]">
              <h4 className="text-xs uppercase font-bold text-[#8A867C] tracking-wider flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Costs your EMI doesn't include
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="stamp-duty" className="text-xs font-semibold text-[#12141C]">Stamp duty &amp; registration</label>
                  <div className="relative rounded-lg border border-[#E7E2DA]">
                    <input
                      id="stamp-duty"
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={stampDutyRate}
                      onChange={(e) => setStampDutyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-3 pr-8 py-1.5 text-sm font-bold text-[#12141C] outline-none rounded-lg"
                    />
                    <span className="absolute right-3 top-2 text-xs text-[#8A867C] font-bold">%</span>
                  </div>
                  <p className="text-[10px] text-[#8A867C]">One-time, paid to your state — rates vary widely (roughly 3&ndash;10%), confirm locally.</p>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="maintenance" className="text-xs font-semibold text-[#12141C]">Society maintenance (monthly)</label>
                  <div className="relative rounded-lg border border-[#E7E2DA]">
                    <span className="absolute left-3 top-2 text-xs text-[#8A867C] font-bold">₹</span>
                    <input
                      id="maintenance"
                      type="number"
                      step="500"
                      min="0"
                      value={maintenanceCharges}
                      onChange={(e) => setMaintenanceCharges(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full pl-6 pr-3 py-1.5 text-sm font-bold text-[#12141C] outline-none rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-[#8A867C]">Paid to your RWA/builder, not your lender — varies a lot by building.</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-[#8A867C] tracking-wider">Loan basics</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-[#55534C]">
                <p>Loan amount: <span className="text-[#12141C]">{formatFull(loanAmount)}</span></p>
                <p>Number of EMIs: <span className="text-[#12141C]">{numberOfPayments}</span></p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Right: Results */}
        <Reveal delay={0.1} className="lg:col-span-5">
          <div className="bg-[#12141C] text-white rounded-3xl p-6 sm:p-8 space-y-7 relative overflow-hidden">
            <motion.div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[100px] opacity-20"
              style={{ background: '#FF6B35' }}
              animate={reducedMotion ? undefined : { y: [0, 16, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative text-center space-y-2 border-b border-white/10 pb-6">
              <span className="text-[#FBBF24] font-extrabold uppercase tracking-widest text-xs">Estimated monthly EMI</span>
              <div className="font-serif text-4xl sm:text-5xl font-medium text-white">
                {formatFull(monthlyEMI)}
                <span className="text-sm font-sans font-medium text-[#8A867C]">/mo</span>
              </div>
              <p className="text-xs text-[#8A867C] font-medium">Principal + interest only — this is the actual amount your bank charges each month</p>
            </div>

            {/* Principal vs Interest donut */}
            <div className="relative flex items-center gap-6">
              <svg viewBox="0 0 160 160" className="w-28 h-28 shrink-0 -rotate-90" role="img" aria-label="Principal versus interest, lifetime split">
                <circle cx="80" cy="80" r={donutRadius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
                {donutData.map((d) => {
                  const fraction = d.value / donutTotal;
                  const dash = fraction * donutCircumference;
                  const offset = donutCumulative;
                  donutCumulative += dash;
                  return (
                    <motion.circle
                      key={d.name}
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      fill="none"
                      stroke={d.color}
                      strokeWidth="18"
                      strokeDasharray={`${dash} ${donutCircumference - dash}`}
                      initial={reducedMotion ? undefined : { strokeDashoffset: -offset, opacity: 0 }}
                      animate={{ strokeDashoffset: -offset, opacity: 1 }}
                      transition={{ duration: 0.8, ease: EASE }}
                    />
                  );
                })}
              </svg>
              <div className="space-y-2 flex-1 min-w-0">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm font-semibold gap-2">
                    <span className="flex items-center gap-2 text-[#ABA69C]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="text-white font-bold text-right shrink-0">{formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Costs not in EMI */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-[10px] uppercase font-bold text-[#8A867C] tracking-wider flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5" aria-hidden="true" /> Paid separately from your EMI
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#ABA69C]">Stamp duty &amp; registration (one-time)</span>
                <span className="text-white font-bold">{formatINR(stampDutyAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#ABA69C]">Society maintenance (monthly)</span>
                <span className="text-white font-bold">{formatFull(maintenanceCharges)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                <span className="text-[#ABA69C]">Cash needed upfront (down payment + stamp duty)</span>
                <span className="text-[#FBBF24] font-bold">{formatINR(upfrontCashNeeded)}</span>
              </div>
            </div>

            {/* Lifetime */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-[#8A867C] tracking-wider flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" /> Over the life of the loan
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#8A867C] uppercase">Total interest paid</span>
                  <p className="text-base font-black text-[#FF6B35]">{formatINR(totalInterest)}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#8A867C] uppercase">Total repayment</span>
                  <p className="text-base font-black text-[#14B8A6]">{formatINR(totalPayment)}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Advisory section — general, India-relevant, no invented statistics */}
      <Reveal delay={0.15}>
        <div className="bg-white border border-[#E7E2DA] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div className="space-y-1.5">
            <h3 className="text-sm font-extrabold text-[#12141C] uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#14B8A6]" aria-hidden="true" /> Before you apply
            </h3>
            <p className="text-xs text-[#55534C] leading-relaxed max-w-2xl font-medium">
              Compare fixed vs. floating rates — floating-rate home loans usually track the bank's repo-linked rate, so your EMI can move with RBI policy changes. Check your CIBIL score beforehand, since it directly affects the rate you're offered. Under RBI rules, banks can't charge foreclosure or prepayment penalties on floating-rate loans to individual borrowers, so paying off early is usually free — worth confirming with your specific lender. This calculator gives estimates only; your bank's sanction letter is the number that actually counts.
            </p>
          </div>
          <button className="bg-[#12141C] hover:bg-[#1E212B] text-white font-bold text-xs py-2.5 px-5 rounded-full flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2">
            <span>Talk to a listed agent</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </Reveal>
    </div>
  );
};

export default MortgageCalculator;
