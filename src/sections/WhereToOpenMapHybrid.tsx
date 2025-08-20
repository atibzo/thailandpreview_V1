import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Building2,
  Landmark,
  Umbrella,
  Mountain,
  MoonStar,
  LifeBuoy,
} from "lucide-react";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type Loc = {
  id: string;
  name: string;
  type: "urban" | "island" | "wellness";
  lat: number;
  lng: number;
  icon: IconType;
  tagline: string;
  areas: string;
  price: string; // "Average ADR: ..."
  bullets: string[];
};

/** =========================
 *  City dataset (THB-only)
 *  ========================= */
const LOCS: Loc[] = [
  // Top 6
  {
    id: "bangkok",
    name: "Bangkok",
    type: "urban",
    lat: 13.7563,
    lng: 100.5018,
    icon: Building2,
    tagline: "Year-round transit + party traffic",
    areas: "Khao San / Chinatown / Lower Sukhumvit",
    price: "Average ADR: ~฿460 per night",
    bullets: [
      "Walking distance to Khao San nightlife",
      "Chinatown shophouses",
      "BTS-adjacent townhouses",
    ],
  },
  {
    id: "chiangmai",
    name: "Chiang Mai",
    type: "urban",
    lat: 18.7883,
    lng: 98.9853,
    icon: Landmark,
    tagline: "Digital nomad + café culture",
    areas: "Old City / Nimman / Santitham",
    price: "Average ADR: ~฿330 per night",
    bullets: [
      "Old City lanes near markets",
      "Nimman café streets",
      "Santitham value long-stays",
    ],
  },
  {
    id: "phuket",
    name: "Phuket",
    type: "island",
    lat: 7.8804,
    lng: 98.3923,
    icon: Umbrella,
    tagline: "Beach + long-stay demand",
    areas: "Old Town / Kata-Karon / Rawai-Chalong / Patong",
    price: "Average ADR: ~฿460–520 per night",
    bullets: [
      "Old Town heritage streets",
      "Walkable beach belts",
      "Rawai/Chalong long-stay & fitness",
      "Patong nightlife volume",
    ],
  },
  {
    id: "krabi",
    name: "Krabi",
    type: "island",
    lat: 8.0863,
    lng: 98.9063,
    icon: Mountain,
    tagline: "Iconic cliffs + island hops",
    areas: "Ao Nang / Railay / Krabi Town",
    price: "Average ADR: ~฿370–390 per night",
    bullets: [
      "Ao Nang near long-tail piers",
      "Railay premium nights (limited stock)",
      "Krabi Town night markets",
    ],
  },
  {
    id: "kohphangan",
    name: "Koh Phangan",
    type: "island",
    lat: 9.7319,
    lng: 99.994,
    icon: MoonStar,
    tagline: "Full-Moon spikes + wellness",
    areas: "Haad Rin / Thong Sala-Baan Tai / Srithanu",
    price: "Average ADR: ~฿380 per night",
    bullets: [
      "Haad Rin party weeks",
      "Thong Sala/Baan Tai transit",
      "Srithanu wellness stays",
    ],
  },
  {
    id: "kohtao",
    name: "Koh Tao",
    type: "island",
    lat: 10.101,
    lng: 99.822,
    icon: LifeBuoy,
    tagline: "Dive certification engine",
    areas: "Sairee / Mae Haad / Chalok",
    price: "Average ADR: ~฿425 per night",
    bullets: ["Sairee dive school row", "Mae Haad pier access", "Chalok chill long-stays"],
  },

  // Extended list (from PremiumRevenueCarousel)
  {
    id: "pai",
    name: "Pai",
    type: "wellness",
    lat: 19.3615,
    lng: 98.4397,
    icon: Landmark,
    tagline: "Walking Street • riverside & rice fields",
    areas: "Walking Street radius / riverside lanes",
    price: "Average ADR: ~฿280–330 per night",
    bullets: ["Quiet lanes by the river", "Rice field vistas", "Slow-stay vibe"],
  },
  {
    id: "kohlanta",
    name: "Koh Lanta",
    type: "island",
    lat: 7.6145,
    lng: 99.0515,
    icon: Umbrella,
    tagline: "Long beach walks + mellow stays",
    areas: "Long Beach / Klong Khong / Old Town",
    price: "Average ADR: ~฿400–450 per night",
    bullets: ["Sunset strips", "Café rows", "Old Town stilt houses"],
  },
  {
    id: "chiangrai",
    name: "Chiang Rai",
    type: "urban",
    lat: 19.9105,
    lng: 99.8406,
    icon: Building2,
    tagline: "Night Bazaar + riverside lanes",
    areas: "Clock Tower / Night Bazaar / Riverside",
    price: "Average ADR: ~฿290–320 per night",
    bullets: ["Markets & street food", "Temples & art", "Riverside sois"],
  },
  {
    id: "ayutthaya",
    name: "Ayutthaya",
    type: "urban",
    lat: 14.3532,
    lng: 100.5689,
    icon: Landmark,
    tagline: "UNESCO ruins + easy access",
    areas: "Historical Park perimeter / train & ferry",
    price: "Average ADR: ~฿290–550 per night",
    bullets: ["Temple loops", "Canal rides", "Old-city cafés"],
  },
  {
    id: "kohsamui",
    name: "Koh Samui",
    type: "island",
    lat: 9.512,
    lng: 100.013,
    icon: Umbrella,
    tagline: "East-coast nightlife + calm coves",
    areas: "Chaweng / Lamai / Fisherman’s Village",
    price: "Average ADR: ~฿350–700 per night",
    bullets: ["Beach clubs", "Pierfront dining", "Waterfall day trips"],
  },
  {
    id: "sukhothai",
    name: "Sukhothai",
    type: "urban",
    lat: 17.0061,
    lng: 99.822,
    icon: Landmark,
    tagline: "Old City (Mueang Kao) lanes & ruins",
    areas: "Old City / Park perimeter",
    price: "Average ADR: ~฿300–500 per night",
    bullets: ["Bicycle loops", "Moats & ruins", "Laid-back cafés"],
  },
  {
    id: "kanchanaburi",
    name: "Kanchanaburi",
    type: "wellness",
    lat: 14.0228,
    lng: 99.5328,
    icon: Mountain,
    tagline: "River Kwai stays + trails",
    areas: "River Kwai / town center",
    price: "Average ADR: ~฿300–500 per night",
    bullets: ["Raft stays", "Bridge & museums", "Waterfalls"],
  },
  {
    id: "huahin",
    name: "Hua Hin / Pranburi",
    type: "island",
    lat: 12.5684,
    lng: 99.9577,
    icon: Umbrella,
    tagline: "Beachfront strips • Khao Takiab vibe",
    areas: "Soi 51–55 / Khao Takiab / Pranburi coast",
    price: "Average ADR: ~฿400–700 per night",
    bullets: ["Seafood shacks", "Beach walks", "Markets at night"],
  },
  {
    id: "kohchang",
    name: "Koh Chang",
    type: "island",
    lat: 12.049,
    lng: 102.322,
    icon: LifeBuoy,
    tagline: "Lush island + beach-hop days",
    areas: "White Sand / Lonely / Klong Prao",
    price: "Average ADR: ~฿350–600 per night",
    bullets: ["Palm bays", "Waterfalls", "Scooter loops"],
  },
  {
    id: "kohlipe",
    name: "Koh Lipe",
    type: "island",
    lat: 6.4881,
    lng: 99.3016,
    icon: LifeBuoy,
    tagline: "Underrated gem • Sunrise & Sunset beaches",
    areas: "Sunrise / Sunset / Pattaya (central strip)",
    price: "Average ADR: ~฿500–900 per night",
    bullets: ["House reefs", "Walkable island", "Clear-water bays"],
  },
];

const centerTH = { lat: 15.87, lng: 100.9925 };

/** Make pretty pin icons by type */
function makePinIcon(color: string) {
  const svg = `<svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" fill="${color}" fill-opacity="0.9" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="11" r="3" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "z-pin",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const iconByType: Record<Loc["type"], L.DivIcon> = {
  urban: makePinIcon("#ff5a1f"), // brand orange
  island: makePinIcon("#0ea5e9"), // sky
  wellness: makePinIcon("#10b981"), // emerald
};

/** Smoothly pan the map to a given city when selection changes */
function PanTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    // pan smoothly (less jank than aggressive flyTo)
    map.setView([lat, lng], 6, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function WhereToOpenMapHybrid() {
  const [selected, setSelected] = useState<string>("phuket");
  const [filter, setFilter] = useState<"all" | "urban" | "island" | "wellness">(
    "all"
  );
  const selLoc = useMemo(
    () => LOCS.find((l) => l.id === selected) || LOCS[0],
    [selected]
  );
  const listRef = useRef<HTMLDivElement>(null);

  // ensure selected card is centered in the scroll list
  useEffect(() => {
    const el = document.getElementById("card-" + selected);
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selected]);

  const filtered = LOCS.filter((l) => filter === "all" || l.type === filter);

  return (
    <section id="where" className="px-3 mt-10">
      <p className="text-center text-sm text-slate-600 mt-1">
        All amounts in THB. Figures are indicative.
      </p>

      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        {/* Map side */}
        <div className="lg:w-1/2 w-full h-[360px] rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-soft">
          <MapContainer
            center={[centerTH.lat, centerTH.lng]}
            zoom={5.2}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            preferCanvas={true}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {LOCS.map((l) => (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={iconByType[l.type]}
                eventHandlers={{ click: () => setSelected(l.id) }}
              />
            ))}
            {/* Smooth pan when selection changes */}
            <PanTo lat={selLoc.lat} lng={selLoc.lng} />
          </MapContainer>
        </div>

        {/* Cards side */}
        <div className="lg:w-1/2 w-full">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-3">
            {(["all", "urban", "island", "wellness"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  filter === f
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Scroll list */}
          <div
            ref={listRef}
            className="max-h-[360px] overflow-y-auto pr-1 space-y-3"
          >
            {filtered.map((l) => {
              const Icon = l.icon;
              const active = l.id === selected;
              return (
                <article
                  key={l.id}
                  id={"card-" + l.id}
                  onMouseEnter={() => setSelected(l.id)}
                  onClick={() => setSelected(l.id)}
                  className={`relative bg-white rounded-2xl p-4 ring-1 ${
                    active ? "ring-brand" : "ring-slate-200"
                  } shadow-soft hover:-translate-y-0.5 transition`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 ring-1 ring-brand/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold truncate">
                          {l.name}
                        </h3>
                        <span className="text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 rounded-full px-2 py-0.5 whitespace-nowrap">
                          {l.price}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 italic mt-0.5">
                        {l.areas}
                      </p>
                      <p className="text-sm mt-1">{l.tagline}</p>
                      <ul className="mt-2 list-disc pl-4 text-sm text-slate-700 space-y-1">
                        {l.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
