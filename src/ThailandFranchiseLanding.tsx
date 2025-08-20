import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import WhyThailandStats from "./sections/WhyThailandStats";
import PremiumRevenueCarousel from "./sections/PremiumRevenueCarousel";
import WhereToOpenMapHybrid from "./sections/WhereToOpenMapHybrid";

/* =========================
   Helpers (local-only)
========================= */
function formatTHB(n: number) {
  if (n >= 1000) return `฿${Math.round(n / 1000)}k`;
  return `฿${n}`;
}
function useAutoplay(length: number, paused: boolean, durMs = 4500) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % length), durMs);
    return () => clearInterval(t);
  }, [length, paused, durMs]);
  return [idx, setIdx] as const;
}
function AnimatedNumber({
  from,
  to,
  duration = 1200,
}: {
  from: number;
  to: number;
  duration?: number;
}) {
  const [val, setVal] = useState(from);
  useEffect(() => {
    const start = performance.now();
    let raf = requestAnimationFrame(function step(ts) {
      const p = Math.min(1, (ts - start) / duration);
      setVal(from + (to - from) * p);
      if (p < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration]);
  return <span>{formatTHB(val)}</span>;
}

/* =========================
   Scenario Carousel Data
========================= */
type Scenario = {
  key: string;
  emoji: string;
  title: string;
  tagline: string;
  adr: string;
  occ: string;
  revMin: number;
  revMax: number;
  inrRange: string;
  bullets: string[];
  image: string;
  custom?: boolean;
};

const SCENARIOS: Scenario[] = [
  {
    key: "phuket",
    emoji: "🏝",
    title: "Phuket",
    tagline: "Beach + Long-Stay Demand",
    adr: "ADR: ฿460–฿520",
    occ: "Occ: 65–75%",
    revMin: 538000,
    revMax: 702000,
    inrRange: "₹14.5L–₹19.0L",
    bullets: [
      "Heritage streets + walkable beaches",
      "Strong fitness & long-stay market",
    ],
    image:
      "https://images.unsplash.com/photo-1576458088443-04a19bb13bd0?q=80&w=1600&auto=format&fit=crop",
  },
  {
    key: "bangkok",
    emoji: "🏙",
    title: "Bangkok",
    tagline: "Year-Round Transit & Party Traffic",
    adr: "ADR: ~฿460",
    occ: "Occ: 65–80%",
    revMin: 538000,
    revMax: 662000,
    inrRange: "₹14.5L–₹17.9L",
    bullets: [
      "High year-round demand",
      "Works near Khao San, Chinatown, BTS hubs",
    ],
    image:
      "https://images.unsplash.com/photo-1555829228-75b4d4b88a0e?q=80&w=1600&auto=format&fit=crop",
  },
  {
    key: "chiangmai",
    emoji: "🌿",
    title: "Chiang Mai",
    tagline: "Digital Nomad + Café Culture",
    adr: "ADR: ~฿330",
    occ: "Occ: 65–80%",
    revMin: 386000,
    revMax: 475000,
    inrRange: "₹10.4L–₹12.8L",
    bullets: [
      "Long-stay nomads, café culture",
      "Stable low-season bookings",
    ],
    image:
      "https://images.unsplash.com/photo-1589291779351-9a9a9d0f1f7b?q=80&w=1600&auto=format&fit=crop",
  },
  {
    key: "custom",
    emoji: "🎯",
    title: "Custom Scenario",
    tagline: "Your Location, Your Numbers",
    adr: "Inputs: Beds, ADR",
    occ: "Inputs: Occupancy",
    revMin: 0,
    revMax: 0,
    inrRange: "1 THB ≈ ₹2.70",
    bullets: [
      "Assumes dorm inventory & 30-day month",
      "Transparent, editable assumptions",
    ],
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
    custom: true,
  },
];

/* =========================
   Split-band (Who should apply)
========================= */
function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, seen };
}
type SplitProps = {
  image: string;
  imageAlt: string;
  align: "left" | "right";
  heading: string;
  sub: string;
  body: string;
  cta: string;
  href?: string;
};
function SplitBand(props: SplitProps) {
  const { ref, seen } = useInView<HTMLDivElement>(0.25);
  const Img = (
    <div className="relative w-full sm:w-1/2 rounded-xl overflow-hidden">
      <img
        src={props.image}
        alt={props.imageAlt}
        className="w-full h-[180px] sm:h-[220px] object-cover kenburns"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
  const Text = (
    <div className="w-full sm:w-1/2 px-3 sm:px-4">
      <div
        className={`rounded-xl p-3 card-glass ${
          seen ? "fade-slide" : "opacity-0"
        }`}
      >
        <h3 className="text-base font-bold text-[#111]">{props.heading}</h3>
        <p className="text-sm text-[#333]/90 mt-1 italic">{props.sub}</p>
        <p className="text-sm text-[#333] mt-2">{props.body}</p>
        <a
          href={props.href || "#"}
          className="mt-3 inline-block text-sm font-semibold rounded-full px-3 py-1 bg-[var(--brand)] text-white hover:opacity-95 active:opacity-90"
        >
          {props.cta}
        </a>
      </div>
    </div>
  );
  return (
    <div
      ref={ref}
      className="px-3 sm:px-4 py-2 sm:py-3 bg-[#fff7f3] rounded-2xl"
    >
      <div
        className={`flex flex-col ${
          props.align === "right" ? "sm:flex-row-reverse" : "sm:flex-row"
        } gap-3`}
      >
        {Img}
        {Text}
      </div>
    </div>
  );
}

/* =========================
   Scenario Snapshot Carousel
========================= */
function ScenarioCarousel({ slides = SCENARIOS }: { slides?: Scenario[] }) {
  const durMs = 4500;
  const [paused, setPaused] = useState(false);
  const [idx, setIdx] = useAutoplay(slides.length, paused, durMs);
  const touchX = useRef<number | null>(null);

  // Custom scenario inputs
  const [beds, setBeds] = useState(60);
  const [adr, setAdr] = useState(460);
  const [occ, setOcc] = useState(70);
  const customTHB = useMemo(
    () => Math.round(beds * 30 * adr * (occ / 100)),
    [beds, adr, occ]
  );
  const thbFrom = Math.round(customTHB * 0.92);
  const thbTo = Math.round(customTHB * 1.08);

  const isCustom = slides[idx]?.custom;

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 32) setIdx((idx - 1 + slides.length) % slides.length);
    if (dx < -32) setIdx((idx + 1) % slides.length);
    touchX.current = null;
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden h-[340px] sm:h-[380px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ ["--dotDur" as any]: `${durMs}ms` }}
    >
      {slides.map((s, i) => (
        <div
          key={s.key}
          className={`absolute inset-0 ${
            i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
          } transition-opacity duration-500`}
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover kenburns"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.65) 100%)",
              }}
            />
            <div
              className="absolute -inset-x-6 -bottom-6 h-16 opacity-30"
              style={{
                background:
                  "radial-gradient(50% 100% at 50% 100%, #ff5a1f 0%, transparent 75%)",
              }}
            />
          </div>

          {/* Foreground Card */}
          <div className="absolute inset-0 flex items-center justify-center px-3">
            <div className="fade-slide card-glass rounded-xl p-3 w-full max-w-[420px] min-h-[196px] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-lg">
                  {s.emoji}
                </div>
                <div>
                  <div className="text-white text-base font-bold">
                    {s.title}
                  </div>
                  <div className="text-white/90 text-sm">{s.tagline}</div>
                </div>
              </div>

              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="text-white text-sm">
                  <div>{s.adr}</div>
                  <div>{s.occ}</div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--brand-light)] text-sm">
                    Monthly Revenue
                  </div>
                  <div className="text-[var(--brand)] text-2xl font-extrabold leading-none">
                    {i === idx && !isCustom ? (
                      <>
                        <AnimatedNumber from={s.revMin} to={s.revMax} />{" "}
                        <span className="text-white text-sm align-middle">
                          ({s.inrRange})
                        </span>
                      </>
                    ) : i === idx && isCustom ? (
                      <>
                        <AnimatedNumber from={thbFrom} to={thbTo} />{" "}
                        <span className="text-white text-sm align-middle">
                          (~₹{Math.round((customTHB * 2.7) / 100000)}L)
                        </span>
                      </>
                    ) : (
                      <>
                        {formatTHB(s.revMin)}–{formatTHB(s.revMax)}{" "}
                        <span className="text-white text-sm align-middle">
                          ({s.inrRange})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <ul className="mt-2 list-disc pl-4 text-white/95 text-sm space-y-1">
                {s.custom ? (
                  <>
                    <li>Adjust inputs to preview monthly revenue</li>
                    <li>Assumes 30-day month; dorm inventory</li>
                  </>
                ) : (
                  s.bullets.map((b) => <li key={b}>{b}</li>)
                )}
              </ul>

              {s.custom && i === idx && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <label className="text-sm text-white/90">
                    Beds
                    <input
                      type="number"
                      className="mt-1 w-full rounded border border-white/40 bg-white/80 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[var(--brand)]"
                      value={beds}
                      min={10}
                      max={200}
                      onChange={(e) => setBeds(Number(e.target.value || 0))}
                    />
                  </label>
                  <label className="text-sm text-white/90">
                    ADR (฿)
                    <input
                      type="number"
                      className="mt-1 w-full rounded border border-white/40 bg-white/80 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[var(--brand)]"
                      value={adr}
                      min={150}
                      max={1200}
                      onChange={(e) => setAdr(Number(e.target.value || 0))}
                    />
                  </label>
                  <label className="text-sm text-white/90">
                    Occ (%)
                    <input
                      type="number"
                      className="mt-1 w-full rounded border border-white/40 bg-white/80 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[var(--brand)]"
                      value={occ}
                      min={20}
                      max={95}
                      onChange={(e) => setOcc(Number(e.target.value || 0))}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Arrows (desktop) */}
      <button
        className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white items-center justify-center hover:scale-105 transition"
        onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white items-center justify-center hover:scale-105 transition"
        onClick={() => setIdx((idx + 1) % slides.length)}
        aria-label="Next"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
        {slides.map((s, iDot) => (
          <div
            key={s.key}
            className={`h-1.5 w-8 rounded-full bg-white/30 overflow-hidden ${
              iDot === idx ? "ring-1 ring-white/50" : ""
            }`}
            onClick={() => setIdx(iDot)}
            role="button"
            aria-label={`Go to ${s.title}`}
          >
            <div
              className={`${
                iDot === idx && !paused ? "dot-anim" : ""
              } h-full ${iDot === idx ? "bg-[var(--brand)]" : "bg-white/50"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function ThailandFranchiseLanding() {
  return (
    <div className="bg-white pb-10">
      {/* Header */}
      <header className="px-3 pt-2 pb-2 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-6 h-6 rounded bg-[var(--brand)]"
              aria-label="Zostel logo"
            />
            <span className="text-sm font-semibold tracking-tight">ZOSTEL</span>
          </div>
          <div className="flex-1">
            <label className="relative block">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="search"
                placeholder="Search"
                className="w-full rounded-full border border-gray-200 pl-8 pr-3 py-1.5 text-base outline-none focus:border-gray-300"
              />
            </label>
          </div>
          <a
            href="#become"
            className="shrink-0 rounded-full bg-black text-white text-sm px-3 py-1 font-semibold"
          >
            Become a Zostel owner
          </a>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <nav className="flex items-center gap-3 overflow-x-auto scrollbar-hide text-base text-gray-700">
            <a className="whitespace-nowrap hover:text-black">⭐ Zostel</a>
            <a className="whitespace-nowrap hover:text-black">⭐ Zostel Plus</a>
            <a className="whitespace-nowrap hover:text-black">🏡 Homes</a>
            <a className="whitespace-nowrap hover:text-black">🎒 Zo Trips</a>
            <a className="whitespace-nowrap hover:text-black">
              \\z/ Zo Selections
            </a>
            <a className="whitespace-nowrap hover:text-black">🗺️ Destinations</a>
          </nav>
          <a
            href="#plan-india"
            className="ml-2 whitespace-nowrap text-base text-gray-800 hover:text-black"
          >
            ✈️ Plan a Trip to India
          </a>
        </div>
      </header>
{/* Hero */}
<section className="px-3 mt-3">
  <div className="relative h-[420px] sm:h-[520px] rounded-xl overflow-hidden">
    {/* Image */}
    <img
      src="https://images.unsplash.com/photo-1551418843-01c6b62e864d?q=80&w=1600&auto=format&fit=crop"
      alt="Zostel Phuket hero"
      className="absolute inset-0 w-full h-full object-cover z-0"
    />

    {/* Top fade (keeps the center readable, does NOT bleed below hero) */}
    <div
      className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/60 via-black/35 to-transparent"
    />

    {/* Bottom fade to page background so it never ‘blacks out’ the next section */}
    <div
      className="absolute inset-x-0 bottom-0 h-24 z-10 pointer-events-none bg-gradient-to-b from-transparent to-white"
    />

    {/* Foreground content */}
    <div className="relative z-20 flex h-full flex-col items-center justify-center text-center px-4">
      <h1 className="text-white leading-tight">
        <span className="block text-3xl sm:text-4xl font-extrabold">
          Zostel is now in Thailand
        </span>
        <span className="block text-xl sm:text-2xl mt-1 opacity-90">
          Phuket is live.
        </span>
      </h1>

      <p className="mt-3 text-white/90 text-sm sm:text-base max-w-xl">
        World’s largest backpacker hostel chain • <b>90+ properties</b> •
        <b> 4M+ travelers hosted</b>
      </p>

      <div className="mt-4 flex items-center gap-2">
        <a
          href="#become"
          className="rounded-full bg-[var(--brand)] text-white text-sm sm:text-base px-4 py-2 font-semibold"
        >
          Become a Zostel owner
        </a>
        <a
          href="#book-phuket"
          className="rounded-full text-white text-sm sm:text-base px-4 py-2 font-semibold border border-white/70"
        >
          Join the team in Thailand
        </a>
      </div>
    </div>
  </div>
</section>


      {/* Why hostels win */}
<h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="text-[#0f172a]">Why hostels </span>
          <span className="text-[var(--brand)]">Win in Thailand</span>
        </h2>
      <WhyThailandStats />

      {/* Where to open (Map + Cards) */}
<h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="text-[#0f172a]"> Where to </span>
          <span className="text-[var(--brand)]">Open</span>
        </h2>
      <WhereToOpenMapHybrid />

      {/* What could you make? */}
      <section className="px-3 mt-8">
<h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="text-[#0f172a]">What could </span>
          <span className="text-[var(--brand)]">you make?</span>
        </h2>
<PremiumRevenueCarousel />
        <div className="mt-2 text-xs text-gray-500 text-center">
          Indicative only. Actuals vary by property condition, microlocation,
          seasonality, dorm/private mix, distribution costs, and operator
          effectiveness.
        </div>
{/* Why Own a Zostel? */}
<section className="px-3 mt-10">
  <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight">
    <span className="text-[#0f172a]">Why own a </span>
    <span className="text-[var(--brand)]">Zostel?</span>{" "}
    <span className="text-[#0f172a]">What we offer</span>
  </h2>

  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Card 1 */}
    <article className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-soft p-5">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 mb-3 text-2xl">
        💰
      </div>
      <h3 className="font-extrabold text-lg text-slate-900">
        Tech-enabled booking. Built for operational efficiency
      </h3>
      <ul className="mt-3 text-sm text-slate-700 space-y-2">
        <li>Leaner operating costs with tech-enabled booking tool.</li>
        <li>Centralized booking + dynamic pricing tools.</li>
        <li>Optimized for both offbeat and high-footfall locations.</li>
      </ul>
    </article>

    {/* Card 2 */}
    <article className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-soft p-5">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 mb-3 text-2xl">
        💻
      </div>
      <h3 className="font-extrabold text-lg text-slate-900">
        Tech-first operations that scale
      </h3>
      <ul className="mt-3 text-sm text-slate-700 space-y-2">
        <li>Manage everything remotely via our proprietary dashboard.</li>
        <li>Automation for bookings, housekeeping, reviews & more.</li>
        <li>Real-time visibility, fewer manual tasks.</li>
      </ul>
    </article>

    {/* Card 3 */}
    <article className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-soft p-5">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 mb-3 text-2xl">
        🌍
      </div>
      <h3 className="font-extrabold text-lg text-slate-900">
        Global brand recognition
      </h3>
      <ul className="mt-3 text-sm text-slate-700 space-y-2">
        <li>90+ properties across the Indo-Pacific & SE Asia.</li>
        <li>Zostel has welcomed over 4M+ travelers.</li>
        <li>Leverage Zostel’s reputation, recall, and brand love.</li>
      </ul>
    </article>

    {/* Card 4 */}
    <article className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-soft p-5">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 mb-3 text-2xl">
        🤝
      </div>
      <h3 className="font-extrabold text-lg text-slate-900">
        End-to-end support from day one
      </h3>
      <ul className="mt-3 text-sm text-slate-700 space-y-2">
        <li>Assistance with design, launch, hiring & training.</li>
        <li>Ongoing support with marketing, reviews & optimization.</li>
        <li>Perfect for first-time or seasoned hospitality investors.</li>
      </ul>
    </article>
  </div>
</section>
{/* Who should apply / We’re looking for */}
<section id="who" className="mt-8">
  <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight">
    <span className="text-[#0f172a]">What are </span>
    <span className="text-[var(--brand)]">we looking for</span>
  </h2>

  <div className="space-y-4">
    <SplitBand
      image="https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1600&auto=format&fit=crop"
      imageAlt="Chinatown Bangkok shophouse street"
      align="left"
      heading="Existing Hotel / Hostel / BnB and other property owners"
      sub="Own a place in Bangkok’s buzzing lanes, Chiang Mai’s cultural quarters, or Phuket’s beach belts?"
      body="Turn your property into a global traveller magnet and unlock its full earning potential."
    />
    <SplitBand
      image="https://images.unsplash.com/photo-1619943379563-554c6aa358c5?q=80&w=1740&auto=format&fit=crop"
      imageAlt="Krabi long-tail boat piers"
      align="right"
      heading="People in the industry seeking Opportunities"
      sub="See potential in Krabi’s tour-boat strips, Srithanu’s yoga streets, or Koh Tao’s pierfronts?"
      body="Build a thriving brand from the ground up — we’ll give you the blueprint."
    />
    <SplitBand
      image="https://images.unsplash.com/photo-1728525978104-b84e5a95578e?q=80&w=1546&auto=format&fit=crop"
      imageAlt="Ao Nang sunset with palms"
      align="left"
      heading="Lifestyle Investors and Dreamers"
      sub="Drawn to Ao Nang’s sunsets, Old Town heritage rows, or Pai’s walking streets?"
      body="Earn consistent cashflow while owning a property with character."
    />
    <SplitBand
      https://images.unsplash.com/photo-1675936822147-8aac7e572780?q=80&w=1740&auto=format&fit=crop"
      imageAlt="Beach bonfire gathering"
      align="right"
      heading="Community Hosts"
      sub="From Ayutthaya’s history loops to Lanta’s long-stay beaches…"
      body="Create spaces where backpackers, nomads, and locals connect. Own a small unbranded chain of property or local BnB — let's make it into everyone's favourite destination."
    />
  </div>

  {/* Unified CTA at the end */}
  <div className="mt-6 flex justify-center">
    <a
      href="#become"
      className="inline-flex items-center rounded-full bg-[var(--brand)] text-white px-6 py-3 text-lg font-semibold shadow hover:opacity-95 active:opacity-90"
    >
      Become a Zostel Owner →
    </a>
  </div>
</section>
</section>

     
{/* What our associated partners say about us */}
<section id="partner-testimonials" className="px-3 mt-12">
  <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight">
    <span className="text-[#0f172a]">What our associated partners </span>
    <span className="text-[var(--brand)]">say about us</span>
  </h2>

  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {[
      {
        quote:
          "Being a franchise partner of Zostel for my first-ever business venture was a rewarding experience for me. The vibe of Zostel as a whole fell in sync with my vision for a property that functions as a space that allows people to meet a different version of themselves in a slow-paced, healing environment. Having the autonomy to cater to the needs of my guests and weave my personal style into the core of my establishment makes the collaborative effort shine through.",
        name: "Bala",
        role: "Owner @ ",
        linkText: "Zostel Poombarai",
        href: "#",
        avatar: "🗻",
      },
      {
        quote:
          "I have been working with Zostel as a franchise partner, and I am pleased to say that I like the brand love from the guests. This aligned with my goal to operate Zostel in West Sikkim (Rinchenpong) as well. The relationship with Zostel has been very collaborative. It's a valuable partnership to be a part of.",
        name: "Karma",
        role: "Owner @ ",
        linkText: "Zostel Gangtok",
        href: "#",
        avatar: "🧗‍♂️",
      },
      {
        quote:
          "Zostel has been a fulfilling part and a cornerstone of my professional journey since 2018. It enables me to provide guests with a unique backpacker stay experience in my city and has contributed to tourism here. The Central Team is always just a call or Slack away—professional, fair, and helpful. I’m honored to be part of this community and have grown alongside it over the years.",
        name: "Yuvraj Khedkar",
        role: "Owner @ ",
        linkText: "Zostel Aurangabad",
        href: "#",
        avatar: "🏕️",
      },
    ].map((t) => (
      <article
        key={t.name}
        className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-soft p-6 sm:p-7 flex flex-col justify-between"
      >
        {/* badge */}
        <div className="w-11 h-11 rounded-full bg-[color-mix(in_srgb,var(--brand)_12%,white)] ring-1 ring-[color-mix(in_srgb,var(--brand)_22%,white)] flex items-center justify-center text-xl">
          {t.avatar}
        </div>

        {/* quote */}
        <p className="mt-3 text-slate-800 leading-relaxed text-base">
          {t.quote}
        </p>

        {/* person */}
        <div className="mt-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
            {t.avatar}
          </div>
          <div className="text-sm">
            <div className="font-semibold text-slate-900">{t.name}</div>
            <div className="text-slate-600">
              {t.role}
              <a
                className="underline underline-offset-2 decoration-slate-300 hover:text-slate-800"
                href={t.href}
              >
                {t.linkText}
              </a>
            </div>
          </div>
        </div>
      </article>
    ))}
  </div>

  {/* fine print */}
  <p className="mt-8 text-center text-xs text-slate-500 max-w-3xl mx-auto">
    These testimonials reflect individual experiences of franchise owners. Results are not typical and may vary from one property to another.
  </p>
</section>


      {/* Careers */}
      <section id="join-team" className="mt-12 px-3 sm:px-4">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="text-[#0f172a]">Join the </span>
          <span className="text-[var(--brand)]">team in Thailand</span>
        </h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[
            {
              title: "Property Manager",
              applyBy: "Dec 31, 2025",
              exp: "2 years",
              blurb: "Lead daily ops across destinations.",
            },
            {
              title: "Zostel Buddy",
              applyBy: "Dec 31, 2025",
              exp: "1 year",
              blurb: "Coordinate guests & properties in real-time.",
            },
            {
              title: "Sr. Software Engineer (Backend)",
              applyBy: "Jun 5, 2025",
              exp: "4 years",
              blurb: "Build scalable services for Zostel.",
            },
            {
              title: "Housekeeping Team",
              applyBy: "Jun 1, 2026",
              exp: "1 year",
              blurb: "Own cleanliness & guest comfort.",
            },
            {
              title: "Kitchen Team",
              applyBy: "Jul 1, 2026",
              exp: "1 year",
              blurb: "Run pantry and daily meals.",
            },
            {
              title: "Vibe Curator",
              applyBy: "Oct 4, 2025",
              exp: "0 years",
              blurb:
                "Host events & social mixers to bring travellers together.",
            },
          ].map((r) => (
            <article
              key={r.title}
              className="rounded-2xl bg-white shadow-[0_6px_24px_-12px_rgba(0,0,0,0.15)] ring-1 ring-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-900">{r.title}</h3>
                <hr className="mt-3 mb-5 border-slate-200" />
                <div className="flex items-center justify-between text-slate-900/90 font-semibold">
                  <div>
                    <div className="uppercase tracking-wide text-xs text-slate-500">
                      Apply By:
                    </div>
                    <span className="underline underline-offset-2 decoration-slate-300">
                      {r.applyBy}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="uppercase tracking-wide text-xs text-slate-500">
                      Min Exp:
                    </div>
                    <div>{r.exp}</div>
                  </div>
                </div>
                <p className="mt-5 text-slate-700 leading-relaxed">{r.blurb}</p>
                <div className="mt-6 flex justify-end">
                  <button className="inline-flex items-center rounded-xl bg-slate-900 text-white px-5 py-2 text-sm font-semibold hover:bg-slate-800">
                    Apply
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
{/* FAQs */}
<section id="faqs" className="px-3 mt-12">
  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">
    <span className="text-[#0f172a]">FAQs</span>
  </h2>

  {/*
    Data: add / reorder questions here.
    (Answers are optional—leave empty string "" if you only want the accordion row.)
  */}
  {[
    { q: "What is the franchise model?", a: "" },
    { q: "What is the franchise onboarding process?", a: "" },
    { q: "Where can I learn about Zostel’s fee structure and obligations?", a: "" },
    { q: "How much time does it take to start a Zostel?", a: "" },
    { q: "What is the difference between a Zostel Hostel, Zostel Home, and Zostel Plus?", a: "" },
    { q: "What factors influence the initial investment for a Zostel franchise?", a: "" },
    { q: "Does Zostel assist franchisees with financing options?", a: "" },
    { q: "Who will look after the design of the property?", a: "" },
    { q: "How can I convert my property into Zostel?", a: "" },
    { q: "What support does Zostel provide to franchisees?", a: "" },
    { q: "How can I establish a Zostel Franchise If I don't own property?", a: "" },
    { q: "How do I choose which location would be best for me to open a Zostel?", a: "" },
  ].map((item, i) => (
    <details
      key={item.q}
      className="group border-b last:border-b-0 border-slate-200 py-5"
    >
      <summary className="list-none flex items-center justify-between gap-4 cursor-pointer">
        <h3 className="text-sm sm:text-esm font-semibold text-[#0f172a]">
          {item.q}
        </h3>
        <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-transform group-open:rotate-180">
          {/* chevron */}
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </summary>

      {/* Answer (optional). If empty, show a subtle note or leave blank. */}
      {item.a ? (
        <p className="mt-3 text-slate-700 leading-relaxed">{item.a}</p>
      ) : null}
    </details>
  ))}

  {/* Section CTA */}
  <div className="mt-8 flex justify-center">
    <a
      href="#become"
      className="inline-flex items-center rounded-full bg-[var(--brand)] text-white px-6 py-3 text-lg font-semibold shadow hover:opacity-95 active:opacity-90"
    >
      Become a Zostel Owner →
    </a>
  </div>
</section>


      {/* Footer */}
      <footer className="mt-10 px-3 text-center text-xs text-gray-500">
        © Zostel 2025 • <a href="#" className="underline">Book Phuket</a> •
        Socials • <span className="mx-1">Figures are indicative only.</span>
        <a href="#" className="underline">Full disclaimer & legal</a>
      </footer>
    </div>
  );
}
