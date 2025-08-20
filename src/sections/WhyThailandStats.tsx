
import React, { useEffect, useRef, useState } from 'react'
import { Trophy, MapPinned, TrendingUp, Waves } from 'lucide-react'

type Tile = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  stat: string,
  label: string,
  proof: string,
  source: string
}

const tiles: Tile[] = [
  {
    icon: Trophy,
    stat: '#1',
    label: 'hostel / solo destination',
    proof: 'Thailand captures one of the largest global shares of solo-traveller hostel bookings—build where the world already stays.',
    source: 'Source: Global OTA & industry datasets.'
  },
  {
    icon: MapPinned,
    stat: '200+',
    label: 'cities & islands',
    proof: 'Category depth + nationwide breadth—demand spans island chains and northern loops, not just one hotspot.',
    source: 'Source: Thailand hostel inventory scans.'
  },
  {
    icon: TrendingUp,
    stat: '↑',
    label: 'Momentum & pricing power',
    proof: 'Healthy occupancies across peak seasons and event weeks—hostels monetize nightly turnover better than hotels.',
    source: 'Source: Market comp sets & operator interviews.'
  },
  {
    icon: Waves,
    stat: '12',
    label: 'year-round circuits',
    proof: 'Staggered peaks across Gulf & Andaman routes keep shoulder months profitable and properties busy all year.',
    source: 'Source: route calendars & events.'
  },
]

function useInViewOnce(ref: React.RefObject<HTMLElement>, threshold = 0.2){
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if(!el || seen) return
    const io = new IntersectionObserver(([e]) => {
      if(e.isIntersecting){ setSeen(True); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, seen, threshold])
  return seen
}

export default function WhyThailandStats(){
  const containerRef = useRef<HTMLDivElement>(null)
  const seen = useInViewOnce(containerRef)

  return (
    <section className="px-3 mt-8">
      <div className="text-center text-xs uppercase tracking-wide text-slate-500">Stats that matter</div>
      

      <div ref={containerRef} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t, i) => {
          const Icon = t.icon
          return (
            <article key={i} className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-soft p-4 hover:-translate-y-0.5 transition">
              <div className="w-10 h-10 rounded-full bg-brand/10 ring-1 ring-brand/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-2xl font-extrabold text-brand">{t.stat}</div>
                <div className="font-bold">{t.label}</div>
              </div>
              <p className="mt-2 text-sm text-slate-700">{t.proof}</p>
              <div className="mt-3 text-xs text-slate-500">{t.source}</div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
