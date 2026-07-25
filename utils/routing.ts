type Coord = [number, number]; // [lat, lng]

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

const cache = new Map<string, Coord[]>();

function cacheKey(coords: Coord[]): string {
  return coords.map((c) => `${c[0].toFixed(5)},${c[1].toFixed(5)}`).join(";");
}

export async function fetchRoadRoute(
  waypoints: Coord[]
): Promise<Coord[] | null> {
  if (waypoints.length < 2) return null;

  const key = cacheKey(waypoints);
  if (cache.has(key)) return cache.get(key)!;

  // OSRM expects lng,lat order
  const coords = waypoints.map((c) => `${c[1]},${c[0]}`).join(";");
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route?.geometry?.coordinates) return null;

    // GeoJSON coordinates are [lng, lat] — convert back to [lat, lng]
    const road: Coord[] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]]
    );

    cache.set(key, road);
    return road;
  } catch {
    return null;
  }
}
