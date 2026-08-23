import React, { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, animate, useReducedMotion } from 'framer-motion';
import api from '../lib/api';
import { Property } from '../types';
import {
  TrendingUp, Home, IndianRupee, Building, PieChart,
  MapPin, Loader2, ArrowUpRight, BarChart2, ShieldAlert, Layers, Percent
} from 'lucide-react';

interface CityStat {
  city: string;
  avgPrice: number;
  count: number;
}

interface TypeStat {
  type: string;
  count: number;
  avgPrice: number;
  color: string;
}

interface PriceBucket {
  label: string;
  count: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const TYPE_COLORS: Record<string, string> = {
  apartment: '#FF6B35',
  house: '#14B8A6',
  villa: '#FBBF24',
  plot: '#12141C',
};

const formatINR = (value: number): string => {
  if (!Number.isFinite(value)) return '—';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

/* ---------- Small motion primitives (mirrors HomeListings) ---------- */

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

const Counter: React.FC<{ value: number; format?: (n: number) => string }> = ({ value, format }) => {
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(format ? format(0) : '0');

  useEffect(() => {
    if (reduced) {
      setDisplay(format ? format(value) : String(value));
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (latest) => setDisplay(format ? format(latest) : String(Math.round(latest))),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);

  return <>{display}</>;
};

const MarketTrends: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [cityStats, setCityStats] = useState<CityStat[]>([]);
  const [typeStats, setTypeStats] = useState<TypeStat[]>([]);
  const [overallAvgPrice, setOverallAvgPrice] = useState<number>(0);
  const [ratioSale, setRatioSale] = useState<number>(50);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/properties');
        const list: Property[] = Array.isArray(response.data) ? response.data : [];
        setProperties(list);

        if (list.length === 0) {
          setLoading(false);
          return;
        }

        const totalSum = list.reduce((sum, p: any) => sum + (Number(p.price) || 0), 0);
        setOverallAvgPrice(Math.round(totalSum / list.length));

        const saleCount = list.filter((p: any) => p.status === 'for-sale').length;
        setRatioSale(Math.round((saleCount / list.length) * 100));

        // Group by city — reads p.location.city to match the actual API schema.
        const cityMap: Record<string, { sum: number; count: number }> = {};
        list.forEach((p: any) => {
          const c = p.location?.city || 'Unknown';
          if (!cityMap[c]) cityMap[c] = { sum: 0, count: 0 };
          cityMap[c].sum += Number(p.price) || 0;
          cityMap[c].count += 1;
        });

        const groupedCities: CityStat[] = Object.keys(cityMap)
          .map((city) => ({
            city,
            avgPrice: Math.round(cityMap[city].sum / cityMap[city].count),
            count: cityMap[city].count,
          }))
          .sort((a, b) => b.avgPrice - a.avgPrice);
        setCityStats(groupedCities);

        // Group by property type
        const typeMap: Record<string, { sum: number; count: number }> = {};
        list.forEach((p: any) => {
          const t = p.propertyType || 'apartment';
          if (!typeMap[t]) typeMap[t] = { sum: 0, count: 0 };
          typeMap[t].sum += Number(p.price) || 0;
          typeMap[t].count += 1;
        });

        const groupedTypes: TypeStat[] = Object.keys(typeMap).map((type) => ({
          type,
          count: typeMap[type].count,
          avgPrice: Math.round(typeMap[type].sum / typeMap[type].count),
          color: TYPE_COLORS[type] || '#8A867C',
        })).sort((a, b) => b.count - a.count);
        setTypeStats(groupedTypes);

      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Error calculating market trends:', err);
        setError('Unable to compile market analytics. Please check your data connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const maxCityPrice = cityStats.length > 0 ? Math.max(...cityStats.map((c) => c.avgPrice)) : 1;
  const totalTypeCount = typeStats.reduce((s, t) => s + t.count, 0) || 1;

  // Price distribution histogram — 5 buckets spanning the real min→max range in this dataset.
  const priceBuckets: PriceBucket[] = useMemo(() => {
    if (properties.length === 0) return [];
    const prices = properties.map((p: any) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length === 0) return [];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const bucketCount = 5;
    const width = (max - min) / bucketCount || 1;
    const buckets: PriceBucket[] = Array.from({ length: bucketCount }, (_, i) => {
      const lo = min + i * width;
      const hi = i === bucketCount - 1 ? max : min + (i + 1) * width;
      return { label: `${formatINR(lo)}–${formatINR(hi)}`, count: 0 };
    });
    prices.forEach((price) => {
      let idx = Math.floor((price - min) / width);
      if (idx >= bucketCount) idx = bucketCount - 1;
      if (idx < 0) idx = 0;
      buckets[idx].count += 1;
    });
    return buckets;
  }, [properties]);
  const maxBucketCount = Math.max(1, ...priceBuckets.map((b) => b.count));

  // Donut chart geometry for property-type distribution
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutCumulative = 0;

  // Honest, data-derived market read — no invented cities or unsourced percentages.
  const topCity = cityStats[0];
  const topType = typeStats[0];
  const cheapestType = [...typeStats].sort((a, b) => a.avgPrice - b.avgPrice)[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-10 w-10 motion-safe:animate-spin text-[#FF6B35]" aria-hidden="true" />
        <p className="text-sm text-[#55534C] font-semibold">Compiling real-time real estate analytics&hellip;</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#FDECE7] border border-[#F3C3B0] rounded-2xl flex items-center space-x-3 text-[#B4472A] max-w-xl mx-auto my-12" role="alert">
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1400px] mx-auto">
      {/* ============ HEADER ============ */}
      <Reveal>
        <div className="relative rounded-3xl overflow-hidden bg-[#12141C] px-8 py-10 md:px-12 md:py-12">
          <motion.div
            aria-hidden="true"
            className="absolute -top-20 -right-16 w-72 h-72 rounded-full blur-[100px] opacity-25"
            style={{ background: '#FF6B35' }}
            animate={reducedMotion ? undefined : { y: [0, 20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 text-[#E8C97A] text-[11px] font-mono font-medium tracking-[0.2em] uppercase mb-4">
              <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" /> Live Analytics
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-white tracking-tight max-w-2xl">
              Market trends & pricing intelligence
            </h1>
            <p className="text-[#ABA69C] text-sm md:text-base mt-4 max-w-xl leading-relaxed">
              Real-time property values, category breakdowns, and geographic insight across your active inventory of {properties.length} listings.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ============ TOP STATS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Average price', icon: IndianRupee, color: '#FF6B35', value: overallAvgPrice, format: formatINR, sub: 'Across all properties' },
          { label: 'Total inventory', icon: Building, color: '#14B8A6', value: properties.length, format: (n: number) => String(Math.round(n)), sub: '100% active listings' },
          { label: 'Most premium city', icon: TrendingUp, color: '#FBBF24', value: topCity?.avgPrice ?? 0, format: formatINR, sub: topCity?.city || 'N/A', isCity: true },
          { label: 'For-sale vs rent', icon: PieChart, color: '#12141C', value: ratioSale, format: (n: number) => `${Math.round(n)}% / ${100 - Math.round(n)}%`, sub: 'Sale vs rent listings' },
        ].map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.06}>
            <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 shadow-[0_4px_16px_-8px_rgba(18,20,28,0.08)] flex items-start gap-4 h-full">
              <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: `${stat.color}14` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#8A867C] font-bold uppercase tracking-wider block">{stat.label}</span>
                {stat.isCity ? (
                  <>
                    <span className="text-lg font-black text-[#12141C] truncate block mt-0.5">{stat.sub}</span>
                    <span className="text-xs font-bold block mt-0.5" style={{ color: stat.color }}>
                      Avg: <Counter value={stat.value} format={stat.format} />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-extrabold text-[#12141C] block mt-0.5">
                      <Counter value={stat.value} format={stat.format} />
                    </span>
                    <span className="text-[10px] text-[#8A867C] font-medium block mt-0.5">{stat.sub}</span>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ============ CITY BAR CHART + TYPE DONUT ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Reveal className="lg:col-span-2">
          <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 md:p-8 shadow-[0_4px_16px_-8px_rgba(18,20,28,0.08)] space-y-6 h-full">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4">
              <div>
                <h3 className="font-serif font-medium text-[#12141C] text-lg">Average listing price by city</h3>
                <p className="text-xs text-[#8A867C] font-medium mt-0.5">Comparison of property valuations across active metro areas</p>
              </div>
              <BarChart2 className="h-5 w-5 text-[#8A867C] shrink-0" aria-hidden="true" />
            </div>

            {cityStats.length === 0 ? (
              <p className="text-sm text-[#55534C] py-8 text-center">No city data available yet.</p>
            ) : (
              <div className="space-y-5">
                {cityStats.map((item) => {
                  const percent = Math.max(6, (item.avgPrice / maxCityPrice) * 100);
                  return (
                    <div key={item.city} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#12141C] flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#FF6B35]" aria-hidden="true" />
                          {item.city}
                          <span className="text-[10px] font-normal text-[#8A867C]">({item.count} listings)</span>
                        </span>
                        <span className="text-[#12141C] font-bold">{formatINR(item.avgPrice)}</span>
                      </div>
                      <div className="h-3.5 w-full bg-[#F0ECE4] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FBBF24]"
                          initial={reducedMotion ? undefined : { width: 0 }}
                          whileInView={reducedMotion ? undefined : { width: `${percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: EASE }}
                          style={reducedMotion ? { width: `${percent}%` } : undefined}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>

        {/* Type donut + breakdown */}
        <Reveal delay={0.1}>
          <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 md:p-8 shadow-[0_4px_16px_-8px_rgba(18,20,28,0.08)] space-y-6 h-full">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4">
              <div>
                <h3 className="font-serif font-medium text-[#12141C] text-lg">Category insights</h3>
                <p className="text-xs text-[#8A867C] font-medium mt-0.5">Distribution per asset type</p>
              </div>
              <Home className="h-5 w-5 text-[#8A867C] shrink-0" aria-hidden="true" />
            </div>

            {typeStats.length === 0 ? (
              <p className="text-sm text-[#55534C] py-8 text-center">No category data available yet.</p>
            ) : (
              <>
                <div className="flex justify-center py-2">
                  <svg viewBox="0 0 160 160" className="w-36 h-36 -rotate-90" role="img" aria-label="Property type distribution donut chart">
                    <circle cx="80" cy="80" r={donutRadius} fill="none" stroke="#F0ECE4" strokeWidth="18" />
                    {typeStats.map((t) => {
                      const fraction = t.count / totalTypeCount;
                      const dash = fraction * donutCircumference;
                      const offset = donutCumulative;
                      donutCumulative += dash;
                      return (
                        <motion.circle
                          key={t.type}
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="none"
                          stroke={t.color}
                          strokeWidth="18"
                          strokeDasharray={`${dash} ${donutCircumference - dash}`}
                          initial={reducedMotion ? undefined : { strokeDashoffset: -offset, opacity: 0 }}
                          whileInView={reducedMotion ? undefined : { strokeDashoffset: -offset, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: EASE }}
                          style={reducedMotion ? { strokeDashoffset: -offset } : undefined}
                          strokeLinecap="butt"
                        />
                      );
                    })}
                    <text x="80" y="86" textAnchor="middle" className="rotate-90 origin-center" fontSize="22" fontWeight="700" fill="#12141C" transform="rotate(90 80 80)">
                      {properties.length}
                    </text>
                  </svg>
                </div>

                <div className="space-y-3">
                  {typeStats.map((item) => (
                    <div key={item.type} className="p-3.5 rounded-2xl border border-[#E7E2DA] flex items-center justify-between hover:bg-[#FAF8F5] transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <h4 className="text-xs font-bold capitalize text-[#12141C]">{item.type}s</h4>
                          <span className="text-[10px] font-semibold text-[#8A867C] uppercase tracking-wider">
                            {item.count} &middot; {Math.round((item.count / totalTypeCount) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#12141C] block">{formatINR(item.avgPrice)}</span>
                        <span className="text-[9px] font-bold text-[#8A867C] block mt-0.5">Avg value</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="bg-[#12141C] rounded-2xl p-4">
              <h4 className="text-xs font-extrabold text-[#FBBF24] uppercase tracking-wider mb-1">Market read</h4>
              <p className="text-xs text-[#ABA69C] leading-relaxed">
                {topType && cheapestType ? (
                  <>
                    <span className="text-white font-semibold capitalize">{topType.type}s</span> lead your directory with {topType.count} active listings,
                    while <span className="text-white font-semibold capitalize">{cheapestType.type}s</span> carry the lowest average asking price at {formatINR(cheapestType.avgPrice)} —
                    typically the easiest entry point for first-time buyers.
                  </>
                ) : (
                  'Add more listings to unlock category-level insight here.'
                )}
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ============ PRICE DISTRIBUTION HISTOGRAM ============ */}
      <Reveal>
        <div className="bg-white border border-[#E7E2DA] rounded-3xl p-6 md:p-8 shadow-[0_4px_16px_-8px_rgba(18,20,28,0.08)] space-y-6">
          <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <h3 className="font-serif font-medium text-[#12141C] text-lg">Price distribution</h3>
              <p className="text-xs text-[#8A867C] font-medium mt-0.5">How many active listings fall into each price band</p>
            </div>
            <Layers className="h-5 w-5 text-[#8A867C] shrink-0" aria-hidden="true" />
          </div>

          {priceBuckets.length === 0 ? (
            <p className="text-sm text-[#55534C] py-8 text-center">No pricing data available yet.</p>
          ) : (
            <div className="grid grid-cols-5 gap-3 md:gap-5 items-end h-56 pt-4">
              {priceBuckets.map((bucket, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-xs font-bold text-[#12141C]">{bucket.count}</span>
                  <motion.div
                    className="w-full max-w-[64px] rounded-t-xl"
                    style={{
                      background: `linear-gradient(to top, #FF6B35, #FBBF24)`,
                      ...(reducedMotion
                        ? { height: `${Math.max(6, (bucket.count / maxBucketCount) * 100)}%` }
                        : {}),
                    }}
                    initial={reducedMotion ? undefined : { height: 0 }}
                    whileInView={reducedMotion ? undefined : { height: `${Math.max(6, (bucket.count / maxBucketCount) * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                  />
                  <span className="text-[9px] text-[#8A867C] text-center leading-tight">{bucket.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* ============ GUIDANCE ROW ============ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Reveal>
          <div className="bg-[#12141C] text-white rounded-3xl p-8 space-y-4 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/10 rounded-full blur-2xl" aria-hidden="true"></div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest text-[#FBBF24] bg-[#FBBF24]/10 px-3 py-1 rounded-full">
              <Percent className="w-3 h-3" aria-hidden="true" /> Buying guide
            </span>
            <h3 className="text-lg font-serif font-medium text-white">Should you buy now or wait?</h3>
            <p className="text-[#ABA69C] text-xs leading-relaxed">
              Timing the market perfectly is nearly impossible even for professionals. What matters more is your own readiness — a stable down payment, predictable EMI affordability, and a time horizon of several years. Building equity earlier tends to compound in your favor the longer you hold, but that's a general principle, not a guarantee tied to this month's listings.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="bg-white border border-[#E7E2DA] rounded-3xl p-8 space-y-4 shadow-[0_4px_16px_-8px_rgba(18,20,28,0.08)] h-full">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest text-[#14B8A6] bg-[#14B8A6]/10 px-3 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" aria-hidden="true" /> Selling strategy
            </span>
            <h3 className="text-lg font-serif font-medium text-[#12141C]">Maximize listing exposure</h3>
            <p className="text-[#55534C] text-xs leading-relaxed">
              {topCity ? (
                <>Listings in <span className="font-semibold text-[#12141C]">{topCity.city}</span> currently command the highest average price on the platform ({formatINR(topCity.avgPrice)}) — a useful benchmark if you're pricing a comparable property there. </>
              ) : null}
              Across the board, complete listing profiles with accurate square footage, clear pricing, and high-resolution photos consistently draw more buyer inquiries than sparse ones — that's a pattern worth following regardless of city.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default MarketTrends;