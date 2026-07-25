export function haversineKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function routeDistanceKm(coords: [number, number][]) {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i]);
  }
  return total;
}

export function formatDistance(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toFixed(1)} km`;
}

export function calculateETA(distanceKm: number, speedKmh: number): string {
  if (distanceKm <= 0.03) return "Arrived"; // within 30m geofence
  if (!speedKmh || speedKmh <= 0) return "Stopped";

  const totalSeconds = (distanceKm / speedKmh) * 3600;

  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)} sec`;
  }

  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);

  if (secs === 0) {
    return `${mins} min`;
  }
  return `${mins} min ${secs} sec`;
}
