"use client";

interface RouteMiniMapProps {
  coordinates: [number, number][];
  active?: boolean;
}

const VIEW_W = 300;
const VIEW_H = 130;
const PAD = 14;

export default function RouteMiniMap({ coordinates, active }: RouteMiniMapProps) {
  if (!coordinates || coordinates.length < 2) {
    return (
      <div className="flex h-[130px] w-full items-center justify-center rounded-xl bg-sidebar text-xs text-sidebar-muted">
        No path mapped yet
      </div>
    );
  }

  const lats = coordinates.map((c) => c[0]);
  const lngs = coordinates.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  const project = ([lat, lng]: [number, number]) => {
    const x = PAD + ((lng - minLng) / lngRange) * (VIEW_W - PAD * 2);
    // invert y since lat increases upward
    const y = PAD + (1 - (lat - minLat) / latRange) * (VIEW_H - PAD * 2);
    return [x, y];
  };

  const points = coordinates.map(project);
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const [startX, startY] = points[0];
  const [endX, endY] = points[points.length - 1];

  return (
    <div className="relative h-[130px] w-full overflow-hidden rounded-xl bg-sidebar">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

        <path
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={active ? "0" : "5 4"}
          opacity={0.9}
        />

        <circle cx={startX} cy={startY} r="4" fill="var(--accent)" />
        <circle cx={endX} cy={endY} r="4" fill="#ffffff" opacity="0.85" />
        {active && (
          <circle cx={endX} cy={endY} r="4" fill="var(--accent)">
            <animate attributeName="r" values="4;8;4" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.6s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}
