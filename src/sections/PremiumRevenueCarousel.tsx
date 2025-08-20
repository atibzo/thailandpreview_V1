import React, { useEffect, useRef, useState } from "react";

/* -------------------- Utilities -------------------- */
function useCountUp(to: number, ms = 800) {
  const [val, setVal] = useState(to);
  useEffect(() => {
    const from = val;
    const start = performance.now();
    let raf = requestAnimationFrame(function step(ts) {
      const p = Math.min(1, (ts - start) / ms);
      setVal(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, ms]);
  return val;
}
function formatK(n: number) {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return `${n}`;
}
// Parse ranges from "฿280–330" or "Occ: 30–60%"
function parseRange(str: string): [number, number] {
  const nums = (str.match(/\d+/g) || []).map(Number);
  if (nums.length >= 2) return [nums[0], nums[1]];
  if (nums.length === 1) return [nums[0], nums[0]];
  return [0, 0];
}
/* -------------------- Image helper -------------------- */
// Always-on, seeded image generator (free + stable)
const imageFor = (seed: string) =>
`https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`


/* -------------------- City dataset -------------------- */
const CITY_DATA: Record<
  string,
  { adr: string; occ: string; tagline: string; image: string }
> = {
  Bangkok: {
    adr: "฿460-700",
    occ: "Occ: 75–85%",
    tagline: "Khao San • Chinatown • Sukhumvit transit",
    image: imageFor("Bangkok"),
  },
  Phuket: {
    adr: "฿460–520",
    occ: "Occ: 75–85%",
    tagline: "Old Town • Kata/Karon • Patong nightlife",
    image: imageFor("Phuket"),
  },
  "Chiang Mai": {
    adr: "฿330-700",
    occ: "Occ: 65–80%",
    tagline: "Old City • Nimman cafés • Santitham long-stays",
    image: imageFor("Chiang Mai"),
  },
  Krabi: {
    adr: "฿370–390",
    occ: "Occ: 60–70%",
    tagline: "Ao Nang piers • Railay premium • Krabi Town markets",
    image: imageFor("Krabi"),
  },
  "Koh Phangan": {
    adr: "฿380",
    occ: "Occ: 60–70%",
    tagline: "Haad Rin parties • Srithanu wellness • Baan Tai transit",
    image: imageFor("Koh Phangan"),
  },
  "Koh Tao": {
    adr: "฿425",
    occ: "Occ: 60–70%",
    tagline: "Sairee dive row • Mae Haad pier • Chalok chill",
    image: imageFor("Koh Tao"),
  },

  // Extended
  Pai: {
    adr: "฿280–330",
    occ: "Occ: 30–60%",
    tagline: "Walking Street • riverside & rice fields",
    image: imageFor("Pai"),
  },
  "Koh Lanta": {
    adr: "฿400–450",
    occ: "Occ: 55–70%",
    tagline: "Long Beach • Klong Khong • Old Town stilt houses",
    image: imageFor("Koh Lanta"),
  },
  "Chiang Rai": {
    adr: "฿290–320",
    occ: "Occ: 30–60%",
    tagline: "Clock Tower • Night Bazaar • riverside sois",
    image: imageFor("Chiang Rai"),
  },
  Ayutthaya: {
    adr: "฿290–550",
    occ: "Occ: 25–55%",
    tagline: "Historical Park perimeter • train/ferry access",
    image: imageFor("Ayutthaya"),
  },
  "Koh Samui": {
    adr: "฿350–700",
    occ: "Occ: 65–80%",
    tagline: "Chaweng • Lamai • Fisherman’s Village",
    image: imageFor("Koh Samui"),
  },
  Sukhothai: {
    adr: "฿300–500",
    occ: "Occ: 20–50%",
    tagline: "Old City (Mueang Kao) lanes & ruins",
    image: imageFor("Sukhothai"),
  },
  Kanchanaburi: {
    adr: "฿300–500",
    occ: "Occ: 20–50%",
    tagline: "River Kwai • raft stays • town center",
    image: imageFor("Kanchanaburi"),
  },
  "Hua Hin / Pranburi": {
    adr: "฿400–700",
    occ: "Occ: 40–60%",
    tagline: "Beachfront strips • Khao Takiab vibe",
    image: imageFor("Hua Hin Pranburi"),
  },
  "Koh Chang": {
    adr: "฿350–600",
    occ: "Occ: 40–60%",
    tagline: "White Sand • Lonely Beach • Klong Prao",
    image: imageFor("Koh Chang"),
  },
  "Koh Lipe": {
    adr: "฿500–900",
    occ: "Occ: 30–55%",
    tagline: "Underrated gem • Sunrise & Sunset beaches",
    image: imageFor("Koh Lipe"),
  },
};

/* -------------------- Component -------------------- */
export default function PremiumRevenueCarousel() {
  const cities = Object.keys(CITY_DATA);
  const top6 = ["Bangkok", "Phuket", "Chiang Mai", "Krabi", "Koh Phangan", "Koh Tao"];
  const extended = cities.filter((c) => !top6.includes(c));

  const slides = [...top6, "custom"];

  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);

  const [rooms, setRooms] = useState(20);
  const [bedsPerRoom, setBedsPerRoom] = useState(6);
  const [selectedCity, setSelectedCity] = useState(extended[0]);

  // touch swipe
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 40) setIdx((i) => (i - 1 + slides.length) % slides.length);
    if (dx < -40) setIdx((i) => (i + 1) % slides.length);
    touchX.current = null;
  };

  // derive city
  const isCustom = slides[idx] === "custom";
  const cityKey = isCustom ? selectedCity : slides[idx];
  const city = CITY_DATA[cityKey];

  const [adrMin, adrMax] = parseRange(city.adr);
  const [occMin, occMax] = parseRange(city.occ);

  const [adr, setAdr] = useState(Math.round((adrMin + adrMax) / 2));
  const [occ, setOcc] = useState(Math.round((occMin + occMax) / 2));

  // recalc sliders when city changes
  useEffect(() => {
    setAdr(Math.round((adrMin + adrMax) / 2));
    setOcc(Math.round((occMin + occMax) / 2));
  }, [cityKey]);

  const totalBeds = rooms * bedsPerRoom;
  const monthlyTHB = totalBeds * adr * (occ / 100) * 30;
  const revAnim = useCountUp(monthlyTHB);

  // image resilience
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => {
    setImgOk(true);
  }, [cityKey]);

  return (
    <section className="px-3 mt-8">
      <div
        className="relative rounded-xl overflow-hidden h-[420px]"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft")
            setIdx((i) => (i - 1 + slides.length) % slides.length);
          if (e.key === "ArrowRight")
            setIdx((i) => (i + 1) % slides.length);
        }}
      >
        {/* Background */}
        {imgOk ? (
          <img
            src={city.image}
            alt={cityKey}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 1200px"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Foreground card */}
        <div className="relative z-10 flex items-center justify-center h-full px-4">
          <div className="bg-white/90 backdrop-blur rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{isCustom ? "🎯" : "🏝"}</span>
              <h3 className="font-bold">
                {isCustom ? "Not from these? Select your own city" : cityKey}
              </h3>
            </div>
            <p className="text-sm text-gray-600">{city.tagline}</p>

            {isCustom && (
              <select
                className="mt-2 w-full border rounded p-1"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {extended.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}

            {/* Rooms + beds */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="block text-sm">
                Rooms
                <input
                  type="number"
                  className="mt-1 w-full border rounded p-1"
                  value={rooms}
                  min={1}
                  onChange={(e) => setRooms(Number(e.target.value))}
                />
              </label>
              <label className="block text-sm">
                Beds/Room
                <input
                  type="number"
                  className="mt-1 w-full border rounded p-1"
                  value={bedsPerRoom}
                  min={1}
                  onChange={(e) => setBedsPerRoom(Number(e.target.value))}
                />
              </label>
            </div>

            {/* Sliders */}
            <div className="mt-4">
              <label className="block text-sm font-semibold">
                ADR: ฿{adr}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Avg. Daily Rate per bed/night
              </p>
              <input
                type="range"
                min={adrMin}
                max={adrMax}
                value={adr}
                onChange={(e) => setAdr(Number(e.target.value))}
                className="w-full"
              />

              <label className="block text-sm font-semibold mt-3">
                Occupancy: {occ}%
              </label>
              <input
                type="range"
                min={occMin}
                max={occMax}
                value={occ}
                onChange={(e) => setOcc(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Result */}
            <div className="mt-4 text-center">
              <div className="text-gray-600 text-sm">
                {rooms} rooms × {bedsPerRoom} beds = {totalBeds} beds
              </div>
              <div className="text-lg font-extrabold text-[var(--brand)]">
                Monthly Revenue: ฿{formatK(revAnim)}
              </div>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white items-center justify-center hover:scale-105 transition z-20"
          onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white items-center justify-center hover:scale-105 transition z-20"
          onClick={() => setIdx((i) => (i + 1) % slides.length)}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((s, i) => (
          <button
            key={s}
            onClick={() => setIdx(i)}
            className={`h-2 w-8 rounded-full ${i === idx ? "bg-[var(--brand)]" : "bg-gray-300"}`}
            aria-label={`Go to ${s === "custom" ? "custom city" : s}`}
          />
        ))}
      </div>
    </section>
  );
}
