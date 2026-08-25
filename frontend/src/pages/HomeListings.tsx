import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  animate,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import api from '../lib/api';
import { Property } from '../types';
import SearchFilter from '../components/SearchFilter';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, AlertCircle, ShieldCheck, CheckCircle2,
  TrendingUp, Calculator, Inbox, ArrowUpRight, Search, FileCheck2, KeyRound,
  Quote, Building2, ChevronLeft, ChevronRight, Sparkles, MapPin, Star, Flame
} from 'lucide-react';

/**
 * REDESIGN NOTES
 * ---------------
 * "Midnight & Citrus" — warm paper background, near-black ink surfaces,
 * a vivid coral/gold accent pair, animated with framer-motion.
 *
 * Fonts: Tailwind's built-in `font-serif` stack — no changes needed to index.html,
 * works with your existing Inter + JetBrains Mono setup from index.css.
 *
 * Tokens:  ink #12141C   paper #FAF8F5   card #FFFFFF   coral #FF6B35   gold #FBBF24
 *          teal #14B8A6   line #E7E2DA   muted (labels) #8A867C   copy (AA body) #55534C
 *
 * Motion respects prefers-reduced-motion via framer-motion's useReducedMotion() hook
 * (JS-level check) and CSS media queries on every custom keyframe animation
 * (belt-and-suspenders).
 *
 * HERO v2 additions:
 *  - Cursor-reactive coral spotlight (radial gradient tracking the pointer)
 *  - 3D tilt on the photo collage, driven by the same pointer position
 *  - Cycling headline word ("home" / "yours" / "right" / "permanent")
 *  - "Trending searches" ticker under the CTAs
 *  - Ambient diagonal light beam sweeping across the dark hero on a loop
 *  - Slow-"breathing" background grid opacity
 *  All of the above are skipped/frozen under prefers-reduced-motion.
 *
 * KNOWN DATA ISSUE carried over from before: "Cities covered" will read 0 if your API's
 * property objects don't expose a top-level `city` field — check cityCount below against
 * your actual schema (e.g. `p.address.city`) and update the accessor if needed.
 *
 * TESTIMONIALS below are still placeholder copy with invented names — swap for real
 * reviews (or a `/testimonials` endpoint) before this goes live; presenting invented
 * quotes as real customer testimonials is misleading once it's public.
 *
 * TRENDING SEARCHES in the hero ticker are also hardcoded placeholder strings —
 * same concern as testimonials. Wire to real search-frequency data before shipping,
 * or drop the ticker — a "live" indicator that isn't live is worse than none at all.
 */

interface FilterState {
  search: string;
  city: string;
  propertyType: string;
  bedrooms: string;
  minPrice: string;
  maxPrice: string;
}

const CONTAINER = 'max-w-[1400px] mx-auto px-6 lg:px-12';
const INK = '#12141C';
const CORAL = '#FF6B35';
const GOLD = '#FBBF24';
const FOCUS_RING_DARK = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12141C]';
const FOCUS_RING_LIGHT = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]';
const EASE = [0.22, 1, 0.36, 1] as const;
const PAGE_SIZE = 9;

const CITIES = [
  { name: 'Delhi NCR', img: 'photo-1587474260584-136574528ed5' },
  { name: 'Bengaluru', img: 'photo-1596176530529-78163a4f7af2' },
  { name: 'Mumbai', img: 'photo-1570168007204-dfb528c6958f' },
  { name: 'Pune', img: 'photo-1583417319070-4a69db38a482' },
  { name: 'Hyderabad', img: 'photo-1600100397608-f0d3c22b8e0f' },
  { name: 'Greater Noida', img: 'photo-1592595896616-c37162298647' },
];

const TESTIMONIALS = [
  {
    quote: "We shortlisted three flats in a weekend instead of three months. The price history alone saved us from overpaying.",
    name: 'Rohit Malhotra',
    role: 'Bought a 2BHK, Noida',
  },
  {
    quote: 'Listed our villa on a Monday, had a verified buyer visit by Thursday. No dead leads, no repeat calls from bots.',
    name: 'Ayesha Khan',
    role: 'Seller, Hyderabad',
  },
  {
    quote: 'The mortgage calculator matched what our bank quoted almost exactly. Made the whole negotiation easier.',
    name: 'Karthik Iyer',
    role: 'First-time buyer, Bengaluru',
  },
];

// Cycles in the hero headline — keep entries short, all read naturally before the "."
const HEADLINE_WORDS = ['home', 'yours', 'right', 'permanent'];

// Hero "trending searches" ticker — placeholder copy, see note above.
const TRENDING_SEARCHES = ['2BHK in Pune', 'Villas in Goa', 'Studio in Bengaluru', 'Plots in Greater Noida'];

const formatINR = (value: number): string => {
  if (!Number.isFinite(value)) return '—';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const getPageNumbers = (current: number, total: number): (number | '…')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push('…');
    result.push(p);
  });
  return result;
};

/* ---------- Small motion primitives ---------- */

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
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

const HomeListings: React.FC = () => {
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypeTab, setSelectedTypeTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // --- Hero interactivity: cursor-reactive spotlight + collage tilt ---
  const spotlightX = useMotionValue(300);
  const spotlightY = useMotionValue(170);
  const tiltSpringX = useSpring(spotlightX, { stiffness: 60, damping: 20 });
  const tiltSpringY = useSpring(spotlightY, { stiffness: 60, damping: 20 });
  const spotlightBg = useMotionTemplate`radial-gradient(560px circle at ${tiltSpringX}px ${tiltSpringY}px, rgba(255,107,53,0.16), transparent 55%)`;
  const collageRotateX = useTransform(tiltSpringY, [0, 340], [6, -6]);
  const collageRotateY = useTransform(tiltSpringX, [0, 700], [-6, 6]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spotlightX.set(e.clientX - rect.left);
    spotlightY.set(e.clientY - rect.top);
  };

  // --- Cycling headline word ---
  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setWordIndex((i) => (i + 1) % HEADLINE_WORDS.length), 2400);
    return () => clearInterval(id);
  }, [reducedMotion]);

  // --- Trending search ticker ---
  const [trendIndex, setTrendIndex] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setTrendIndex((i) => (i + 1) % TRENDING_SEARCHES.length), 2800);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const fetchProperties = async (filters?: FilterState) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters) {
        if (filters.search) params.search = filters.search;
        if (filters.city) params.city = filters.city;
        if (filters.propertyType) params.propertyType = filters.propertyType;
        if (filters.bedrooms) params.bedrooms = filters.bedrooms;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      }

      const response = await api.get('/properties', { params });
      const data = Array.isArray(response.data) ? response.data : [];
      setProperties(data);
    } catch (err: any) {
      setError('Failed to fetch property listings. Please try again later.');
      // eslint-disable-next-line no-console
      console.error('Error fetching properties:', err.response?.status, err.response?.data ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    setCurrentPage(1);
    fetchProperties(filters);
  };

  const handlePropertyDelete = async (id: string) => {
    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const typeTabs = useMemo(
    () =>
      [
        { id: 'all', label: 'All' },
        { id: 'apartment', label: 'Apartments' },
        { id: 'house', label: 'Houses' },
        { id: 'villa', label: 'Villas' },
        { id: 'plot', label: 'Plots' },
      ].map((t) => ({
        ...t,
        count: t.id === 'all' ? properties.length : properties.filter((p) => p.propertyType === t.id).length,
      })),
    [properties]
  );

  // Reads p.location.city to match the real API schema (confirmed via MarketTrends.tsx,
  // which already used this path) — previously read the non-existent top-level p.city,
  // which is why "Cities covered" always showed 0.
  const cityCount = useMemo(() => new Set(properties.map((p: any) => p.location?.city).filter(Boolean)).size, [properties]);
  const avgPrice = useMemo(() => {
    const prices = properties.map((p: any) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length === 0) return null;
    return prices.reduce((sum, n) => sum + n, 0) / prices.length;
  }, [properties]);

  const filteredProperties = useMemo(
    () => properties.filter((p) => selectedTypeTab === 'all' || p.propertyType === selectedTypeTab),
    [properties, selectedTypeTab]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [selectedTypeTab, filteredProperties.length, totalPages]);

  const paginatedProperties = useMemo(
    () => filteredProperties.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredProperties, currentPage]
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const gridVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reducedMotion ? 0 : 0.06 } },
  };
  const itemVariants = {
    hidden: reducedMotion ? {} : { opacity: 0, y: 18 },
    show: reducedMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  };

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#FAF8F5]">
      <style>{`
        @keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee-scroll 32s linear infinite; }
        .marquee-pause:hover .marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
        @keyframes gradient-pan { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animated-gradient { background-size: 200% 200%; animation: gradient-pan 8s ease infinite; }
        @media (prefers-reduced-motion: reduce) { .animated-gradient { animation: none; } }
        @keyframes beam-sweep {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        .beam-sweep { animation: beam-sweep 8s ease-in-out infinite; animation-delay: 1.5s; }
        @media (prefers-reduced-motion: reduce) { .beam-sweep { animation: none; } }
        @keyframes grid-breathe { 0%, 100% { opacity: 0.05; } 50% { opacity: 0.09; } }
        .grid-breathe { animation: grid-breathe 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .grid-breathe { animation: none; } }
      `}</style>

      <div className="pb-16">

        {/* ============ HERO ============ */}
        <section
          id="hero-banner"
          onMouseMove={reducedMotion ? undefined : handleHeroMouseMove}
          className="relative bg-[#12141C] overflow-hidden"
        >
          {/* cursor-reactive coral spotlight */}
          {!reducedMotion && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{ background: spotlightBg }}
              aria-hidden="true"
            />
          )}

          {/* ambient light beam sweeping across the hero */}
          <div
            className="beam-sweep pointer-events-none absolute inset-y-0 w-1/3 opacity-[0.05] bg-gradient-to-r from-transparent via-white to-transparent z-[1]"
            aria-hidden="true"
          ></div>

          {/* decorative floating blobs */}
          <motion.div
            aria-hidden="true"
            className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[110px] opacity-30"
            style={{ background: CORAL }}
            animate={reducedMotion ? undefined : { y: [0, 30, 0], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -bottom-32 right-0 w-[380px] h-[380px] rounded-full blur-[110px] opacity-20"
            style={{ background: '#14B8A6' }}
            animate={reducedMotion ? undefined : { y: [0, -24, 0], x: [0, -16, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="grid-breathe absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(to right, #FAF8F5 1px, transparent 1px), linear-gradient(to bottom, #FAF8F5 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
            aria-hidden="true"
          ></div>

          <div className={`relative z-[2] ${CONTAINER} pt-14 pb-10 md:pt-20 md:pb-14 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center`}>
            <div>
              <motion.div
                initial={reducedMotion ? undefined : { opacity: 0, y: -10 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" aria-hidden="true" />
                <span className="text-[#E8C97A] text-[11px] font-mono font-medium tracking-[0.2em] uppercase">
                  Verified listings, live
                </span>
              </motion.div>

              <motion.h1
                initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
                className="font-serif text-[#FAF8F5] text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-[1.05] max-w-xl"
              >
                Find the address that finally feels like{' '}
                <span className="relative inline-block bg-gradient-to-r from-[#FF6B35] to-[#FBBF24] bg-clip-text text-transparent min-w-[7ch] align-baseline">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={HEADLINE_WORDS[wordIndex]}
                      initial={reducedMotion ? undefined : { opacity: 0, y: 10, filter: 'blur(4px)' }}
                      animate={reducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: -10, filter: 'blur(4px)' }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="inline-block italic"
                    >
                      {HEADLINE_WORDS[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                .
              </motion.h1>

              <motion.p
                initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
                className="text-[#ABA69C] text-sm sm:text-base max-w-md mt-5 leading-relaxed font-light"
              >
                Apartments, houses, villas, and plots — verified, mapped, and matched to how you actually live. No noise, no dead listings.
              </motion.p>

              <motion.div
                initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
                className="flex flex-wrap items-center gap-4 mt-8"
              >
                <motion.a
                  href="#listings-section"
                  whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                  className={`inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A2A] text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors shadow-[0_8px_24px_-8px_rgba(255,107,53,0.6)] ${FOCUS_RING_DARK}`}
                >
                  Browse listings <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </motion.a>
                <Link
                  to="/agent-dashboard"
                  className={`text-[#FAF8F5]/80 hover:text-[#FAF8F5] text-sm font-medium underline decoration-[#FF6B35]/60 underline-offset-4 rounded ${FOCUS_RING_DARK}`}
                >
                  List a property instead
                </Link>
              </motion.div>

              {/* live trending-search ticker */}
              <motion.div
                initial={reducedMotion ? undefined : { opacity: 0 }}
                animate={reducedMotion ? undefined : { opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-2 mt-6 text-[11px] font-mono"
              >
                <Flame className="w-3.5 h-3.5 text-[#FF6B35]" aria-hidden="true" />
                <span className="text-[#8A867C] uppercase tracking-wider">Trending:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={TRENDING_SEARCHES[trendIndex]}
                    initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#E8C97A] font-medium"
                  >
                    {TRENDING_SEARCHES[trendIndex]}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Decorative floating photo collage — desktop only, now with cursor-reactive
                3D tilt driven by the same pointer position as the spotlight. Two overlapping
                frames anchored to the same corner so they read as one composition; the badge
                sits on the seam between them. */}
            <motion.div
              className="relative hidden lg:block w-full h-[340px]"
              style={reducedMotion ? undefined : { rotateX: collageRotateX, rotateY: collageRotateY, transformPerspective: 1000 }}
            >
              <motion.div
                className="absolute top-0 right-0 w-60 h-72 rounded-3xl overflow-hidden shadow-2xl rotate-[3deg] z-10"
                animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=70"
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                className="absolute bottom-0 right-40 w-44 h-48 rounded-3xl overflow-hidden shadow-2xl -rotate-[7deg] border-4 border-[#12141C] z-20"
                animate={reducedMotion ? undefined : { y: [0, 10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=500&q=70"
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
                className="absolute bottom-24 right-16 z-30 bg-[#FAF8F5] text-[#12141C] rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#FF6B35]" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-semibold leading-none">Verified</div>
                  <div className="text-[10px] text-[#8A867C] mt-0.5">by EstateHub</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* SIGNATURE ELEMENT: animated stat strip */}
          <div className="relative z-[2] border-t border-white/10 bg-[#0C0E13]">
            <div className={`${CONTAINER} grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10`}>
              {[
                { label: 'Active listings', value: properties.length, icon: CheckCircle2, format: undefined },
                { label: 'Cities covered', value: cityCount, icon: TrendingUp, format: undefined },
                { label: 'Avg. asking price', value: avgPrice ?? 0, icon: Inbox, format: avgPrice ? formatINR : () => '—' },
                { label: 'Verified & mapped', value: 100, icon: ShieldCheck, format: (n: number) => `${Math.round(n)}%` },
              ].map((item, i) => (
                <div key={i} className="py-4 px-4 sm:px-6 flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-[#FF6B35] shrink-0" aria-hidden="true" />
                  <div>
                    <div className="font-mono text-[#FAF8F5] text-lg sm:text-xl font-medium leading-none">
                      <Counter value={item.value} format={item.format} />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-[#8A867C] mt-1">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SEARCH FILTER ============ */}
        <section id="filter-section" className={`${CONTAINER} mt-8`} aria-label="Search and filter properties">
          <Reveal>
            <div className="bg-white border border-[#E7E2DA] rounded-3xl shadow-[0_20px_50px_-20px_rgba(18,20,28,0.25)] p-2">
              <SearchFilter onFilterChange={handleFilterChange} />
            </div>
          </Reveal>
        </section>

        {/* ============ MAIN LAYOUT ============ */}
        <div className={`${CONTAINER} mt-10 flex flex-col lg:flex-row gap-10 items-start`}>

          {/* ---- Sidebar: Site Index ---- */}
          <aside id="trust-sidebar" className="w-full lg:w-60 shrink-0 lg:sticky lg:top-6" aria-label="Why EstateHub">
            <Reveal>
              <div className="border border-[#E7E2DA] rounded-3xl overflow-hidden bg-white">
                <div className="px-4 py-3 border-b border-[#E7E2DA]">
                  <h3 className="text-[10px] uppercase font-semibold text-[#8A867C] tracking-[0.2em]">Why EstateHub</h3>
                </div>

                <div className="px-4 py-4 space-y-4">
                  {[
                    { label: 'Verified listings', desc: 'Ownership checked before it goes live', icon: ShieldCheck },
                    { label: 'Zero brokerage', desc: 'Talk to owners and agents directly', icon: KeyRound },
                    { label: 'Legal document check', desc: 'Title and paperwork reviewed upfront', icon: FileCheck2 },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <row.icon className="w-4 h-4 text-[#FF6B35]" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#12141C] leading-tight">{row.label}</div>
                        <div className="text-[11px] text-[#8A867C] mt-0.5 leading-snug">{row.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[#E7E2DA]"></div>

                <div className="px-4 py-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="font-mono text-xl font-medium text-[#12141C] leading-none">{properties.length}</div>
                    <div className="text-[10px] text-[#8A867C] mt-1 uppercase tracking-wide">Active</div>
                  </div>
                  <div>
                    <div className="font-mono text-xl font-medium text-[#12141C] leading-none">{cityCount}</div>
                    <div className="text-[10px] text-[#8A867C] mt-1 uppercase tracking-wide">Cities</div>
                  </div>
                </div>

                <div className="px-4 py-4 border-t border-[#E7E2DA] bg-[#12141C]">
                  <p className="text-[11px] text-[#ABA69C] leading-relaxed">
                    Every listing here is manually verified before it goes live — no scraped duplicates, no stale prices.
                  </p>
                </div>
              </div>
            </Reveal>
          </aside>

          {/* ---- Content ---- */}
          <section className="flex-1 w-full space-y-8 min-w-0">

            {/* Feature row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { to: '/market-trends', icon: TrendingUp, color: '#FF6B35', title: 'Market Intelligence', desc: 'Real-time price indexes and inventory levels by neighborhood.', cta: 'View trends' },
                { to: '/mortgage-calculator', icon: Calculator, color: '#14B8A6', title: 'Loan Calculator', desc: 'Work out EMI and total interest before you make an offer.', cta: 'Calculate payments' },
                { to: '/agent-dashboard', icon: Inbox, color: '#12141C', title: 'Agent Center', desc: 'Manage listings and reply to buyer inquiries in one place.', cta: 'Agent portal' },
              ].map((f, i) => (
                <Reveal key={f.to} delay={i * 0.08}>
                  <motion.div whileHover={reducedMotion ? undefined : { y: -4 }} transition={{ duration: 0.25, ease: EASE }}>
                    <Link to={f.to} className={`group border border-[#E7E2DA] hover:border-transparent bg-white rounded-3xl p-5 flex flex-col justify-between h-full transition-all hover:shadow-[0_16px_40px_-16px_rgba(18,20,28,0.25)] ${FOCUS_RING_LIGHT}`}>
                      <div className="space-y-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${f.color}14` }}>
                          <f.icon className="w-4 h-4" style={{ color: f.color }} aria-hidden="true" />
                        </div>
                        <h3 className="font-serif font-medium text-[#12141C] text-sm mt-3">{f.title}</h3>
                        <p className="text-[#55534C] text-[11px] leading-relaxed">{f.desc}</p>
                      </div>
                      <span className="text-[11px] font-semibold flex items-center gap-1 mt-4" style={{ color: f.color }}>
                        {f.cta} <ArrowUpRight className="w-3 h-3 motion-safe:group-hover:translate-x-0.5 motion-safe:transition-transform" aria-hidden="true" />
                      </span>
                    </Link>
                  </motion.div>
                </Reveal>
              ))}
            </div>

            {/* Listings */}
            <div id="listings-section" className="border-t border-[#E7E2DA] pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-[#FF6B35] tracking-wide">02 — Directory</span>
                  <h2 className="font-serif text-2xl font-medium text-[#12141C] tracking-tight mt-1">
                    Available listings
                  </h2>
                  <p className="text-xs text-[#55534C] mt-1">Matching properties currently live in the directory</p>
                </div>

                <div className="relative flex overflow-x-auto pb-1 gap-1.5 scrollbar-none" role="tablist" aria-label="Filter by property type">
                  {typeTabs.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={selectedTypeTab === tab.id}
                      onClick={() => setSelectedTypeTab(tab.id)}
                      className={`relative isolate py-1.5 px-3.5 text-xs font-semibold rounded-full transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${FOCUS_RING_LIGHT} ${
                        selectedTypeTab === tab.id ? 'text-white' : 'text-[#3A3630] hover:bg-[#F0ECE4]'
                      }`}
                    >
                      {selectedTypeTab === tab.id && (
                        <motion.span
                          layoutId="tab-pill"
                          className="absolute inset-0 rounded-full -z-10"
                          style={{ backgroundColor: INK }}
                          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 34 }}
                        />
                      )}
                      <span>{tab.label}</span>
                      <span className={`px-1.5 rounded-full text-[9px] font-mono ${
                        selectedTypeTab === tab.id ? 'bg-white/15 text-white' : 'bg-[#E7E2DA] text-[#55534C]'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border border-[#E7E2DA] rounded-3xl space-y-3" role="status" aria-live="polite">
                  <Loader2 className="h-7 w-7 motion-safe:animate-spin text-[#FF6B35]" aria-hidden="true" />
                  <p className="text-sm text-[#55534C] font-medium">Fetching active listings&hellip;</p>
                </div>
              ) : error ? (
                <div className="p-6 bg-[#FDECE7] border border-[#F3C3B0] rounded-3xl flex items-center gap-3 text-[#B4472A]" role="alert">
                  <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-20 bg-white border border-[#E7E2DA] rounded-3xl p-6">
                  <p className="text-[#12141C] font-semibold mb-1">No property listings match your criteria.</p>
                  <p className="text-[#55534C] text-xs">Try adjusting your filters or resetting your search query.</p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-white border border-[#E7E2DA] rounded-3xl p-6">
                  <p className="text-[#12141C] font-semibold mb-1">No matching properties in this category.</p>
                  <p className="text-[#55534C] text-xs">Select "All" listings or try adjusting search criteria.</p>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedTypeTab}-${currentPage}`}
                      variants={gridVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                      {paginatedProperties.map((property) => (
                        <motion.div key={property._id} variants={itemVariants}>
                          <PropertyCard property={property} onDelete={handlePropertyDelete} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

                  {/* ---- Pagination ---- */}
                  {totalPages > 1 && (
                    <nav aria-label="Listings pagination" className="flex items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-[#55534C] hidden sm:block">
                        Showing <span className="font-semibold text-[#12141C]">{(currentPage - 1) * PAGE_SIZE + 1}
                        &ndash;{Math.min(currentPage * PAGE_SIZE, filteredProperties.length)}</span> of{' '}
                        <span className="font-semibold text-[#12141C]">{filteredProperties.length}</span>
                      </p>

                      <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
                        <motion.button
                          whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="Previous page"
                          className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#E7E2DA] bg-white text-[#12141C] disabled:opacity-35 disabled:cursor-not-allowed hover:not-disabled:border-[#FF6B35]/40 transition-colors ${FOCUS_RING_LIGHT}`}
                        >
                          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        </motion.button>

                        {getPageNumbers(currentPage, totalPages).map((p, i) =>
                          p === '…' ? (
                            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#8A867C]">
                              &hellip;
                            </span>
                          ) : (
                            <motion.button
                              key={p}
                              whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                              onClick={() => goToPage(p)}
                              aria-label={`Page ${p}`}
                              aria-current={currentPage === p ? 'page' : undefined}
                              className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-mono font-medium transition-colors ${FOCUS_RING_LIGHT} ${
                                currentPage === p ? 'bg-[#12141C] text-white' : 'bg-white border border-[#E7E2DA] text-[#12141C] hover:border-[#FF6B35]/40'
                              }`}
                            >
                              {p}
                            </motion.button>
                          )
                        )}

                        <motion.button
                          whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          aria-label="Next page"
                          className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#E7E2DA] bg-white text-[#12141C] disabled:opacity-35 disabled:cursor-not-allowed hover:not-disabled:border-[#FF6B35]/40 transition-colors ${FOCUS_RING_LIGHT}`}
                        >
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </motion.button>
                      </div>

                      <span className="hidden sm:block w-24" aria-hidden="true"></span>
                    </nav>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* ============ EXPLORE BY CITY — auto-scrolling marquee ============ */}
        <section className={`${CONTAINER} mt-20`} aria-label="Explore properties by city">
          <Reveal>
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[11px] font-mono text-[#FF6B35] tracking-wide">03 — Regions</span>
                <h2 className="font-serif text-2xl font-medium text-[#12141C] tracking-tight mt-1">
                  Explore by city
                </h2>
              </div>
              <Building2 className="w-5 h-5 text-[#8A867C] hidden sm:block" aria-hidden="true" />
            </div>
          </Reveal>

          <div className="marquee-pause overflow-hidden -mx-6 lg:-mx-12 px-6 lg:px-12">
            <div className="marquee-track flex gap-4 w-max">
              {[...CITIES, ...CITIES].map((city, i) => (
                <button
                  key={`${city.name}-${i}`}
                  onClick={() => handleFilterChange({ search: '', city: city.name, propertyType: '', bedrooms: '', minPrice: '', maxPrice: '' })}
                  aria-label={`Filter listings by ${city.name}`}
                  className={`group relative rounded-2xl overflow-hidden w-44 h-56 shrink-0 text-left ${FOCUS_RING_LIGHT}`}
                >
                  <img
                    src={`https://images.unsplash.com/${city.img}?auto=format&fit=crop&w=400&q=70`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover motion-safe:group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141C]/85 via-[#12141C]/10 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold font-serif flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FBBF24]" aria-hidden="true" /> {city.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className={`${CONTAINER} mt-20`} aria-label="How EstateHub works">
          <Reveal>
            <div className="mb-10">
              <span className="text-[11px] font-mono text-[#FF6B35] tracking-wide">04 — Process</span>
              <h2 className="font-serif text-2xl font-medium text-[#12141C] tracking-tight mt-1">
                How EstateHub works
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <motion.div
              className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-[#E7E2DA] origin-left"
              initial={reducedMotion ? undefined : { scaleX: 0 }}
              whileInView={reducedMotion ? undefined : { scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE }}
              aria-hidden="true"
            ></motion.div>
            {[
              { n: '01', title: 'Search & filter', desc: 'Narrow by city, budget, and bedrooms until only real matches remain.', icon: Search },
              { n: '02', title: 'Verify & compare', desc: 'Every listing is checked for ownership and pricing before it goes live.', icon: FileCheck2 },
              { n: '03', title: 'Visit & move in', desc: 'Book a visit, run the numbers with our calculator, and close with confidence.', icon: KeyRound },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1} className="relative">
                <div className="relative bg-[#FAF8F5] pr-4">
                  <div className="w-12 h-12 rounded-full bg-[#12141C] text-white flex items-center justify-center relative z-10">
                    <step.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="font-mono text-[11px] text-[#FF6B35] mt-4">{step.n}</div>
                  <h3 className="font-serif text-lg font-medium text-[#12141C] mt-1">{step.title}</h3>
                  <p className="text-[#55534C] text-sm mt-2 leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section className={`${CONTAINER} mt-20`} aria-label="Customer testimonials">
          <Reveal>
            <div className="mb-10">
              <span className="text-[11px] font-mono text-[#FF6B35] tracking-wide">05 — From our users</span>
              <h2 className="font-serif text-2xl font-medium text-[#12141C] tracking-tight mt-1">
                Trusted by buyers and sellers alike
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.figure
                  whileHover={reducedMotion ? undefined : { y: -4 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="border border-[#E7E2DA] bg-white rounded-3xl p-6 flex flex-col justify-between h-full hover:shadow-[0_16px_40px_-16px_rgba(18,20,28,0.2)] transition-shadow"
                >
                  <div>
                    <Quote className="w-5 h-5 text-[#FF6B35]/50 mb-3" aria-hidden="true" />
                    <blockquote className="text-[#12141C] text-sm leading-relaxed">{t.quote}</blockquote>
                  </div>
                  <figcaption className="mt-6 pt-4 border-t border-[#E7E2DA] flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#12141C]">{t.name}</div>
                      <div className="text-xs text-[#55534C]">{t.role}</div>
                    </div>
                    <div className="flex gap-0.5" aria-hidden="true">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                      ))}
                    </div>
                  </figcaption>
                </motion.figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ AGENT CTA BANNER ============ */}
        <section className={`${CONTAINER} mt-20`}>
          <Reveal>
            <div
              className="relative rounded-3xl overflow-hidden px-8 py-12 md:px-14 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animated-gradient"
              style={{ backgroundImage: `linear-gradient(120deg, #12141C, #2A1F1A, #12141C)` }}
            >
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: 'linear-gradient(to right, #FAF8F5 1px, transparent 1px), linear-gradient(to bottom, #FAF8F5 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
                aria-hidden="true"
              ></div>
              <div className="relative max-w-lg">
                <h2 className="font-serif text-white text-2xl md:text-3xl font-medium tracking-tight">
                  Selling or renting out a property?
                </h2>
                <p className="text-[#ABA69C] text-sm mt-3 leading-relaxed">
                  List it in minutes and reach verified buyers directly — no broker chains, no listing fees to get started.
                </p>
              </div>
              <motion.div whileHover={reducedMotion ? undefined : { scale: 1.03 }} whileTap={reducedMotion ? undefined : { scale: 0.97 }}>
                <Link
                  to="/agent-dashboard"
                  className={`relative inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A2A] text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors shrink-0 ${FOCUS_RING_DARK}`}
                >
                  List your property <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
          </Reveal>
        </section>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[#E7E2DA] bg-white">
        <div className={`${CONTAINER} py-12 grid grid-cols-2 md:grid-cols-4 gap-8`}>
          <div className="col-span-2 md:col-span-1">
            <div className="font-serif text-lg font-medium text-[#12141C]">EstateHub</div>
            <p className="text-xs text-[#55534C] mt-2 leading-relaxed max-w-[220px]">
              Verified property listings across India, mapped and matched to how you live.
            </p>
          </div>
          <nav aria-label="Explore">
            <h4 className="text-[10px] uppercase tracking-wider text-[#8A867C] font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-[#12141C]">
              <li><Link to="/" className={`hover:text-[#FF6B35] rounded ${FOCUS_RING_LIGHT}`}>Listings</Link></li>
              <li><Link to="/market-trends" className={`hover:text-[#FF6B35] rounded ${FOCUS_RING_LIGHT}`}>Market trends</Link></li>
              <li><Link to="/mortgage-calculator" className={`hover:text-[#FF6B35] rounded ${FOCUS_RING_LIGHT}`}>Loan calculator</Link></li>
            </ul>
          </nav>
          <nav aria-label="For agents">
            <h4 className="text-[10px] uppercase tracking-wider text-[#8A867C] font-semibold mb-3">For agents</h4>
            <ul className="space-y-2 text-sm text-[#12141C]">
              <li><Link to="/agent-dashboard" className={`hover:text-[#FF6B35] rounded ${FOCUS_RING_LIGHT}`}>Agent portal</Link></li>
              <li><Link to="/agent-dashboard" className={`hover:text-[#FF6B35] rounded ${FOCUS_RING_LIGHT}`}>List a property</Link></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h4 className="text-[10px] uppercase tracking-wider text-[#8A867C] font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-[#12141C]">
              <li><a href="#" className={`hover:text-[#FF6B35] rounded ${FOCUS_RING_LIGHT}`}>About</a></li>
              <li><a href="#" className={`hover:text-[#FF6B35] rounded ${FOCUS_RING_LIGHT}`}>Contact</a></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-[#E7E2DA]">
          <div className={`${CONTAINER} py-4 text-[11px] text-[#55534C] flex flex-col sm:flex-row justify-between gap-2`}>
            <span>&copy; {new Date().getFullYear()} EstateHub. All rights reserved.</span>
            <span className="font-mono">Built by Priyanshu Panwar · priyanshupanwar841@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeListings;