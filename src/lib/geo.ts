// Geolocation utility functions and Haversine distance calculations

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

// Known coordinates for reference locations in demo dataset
export const LOCATION_COORDINATES: Record<string, GeoCoordinates> = {
  'indiranagar, bangalore': { lat: 12.9784, lng: 77.6408 },
  'koramangala, bangalore': { lat: 12.9352, lng: 77.6245 },
  'hsr layout, bangalore': { lat: 12.9121, lng: 77.6446 },
  'whitefield, bangalore': { lat: 12.9698, lng: 77.7500 },
  'jayanagar, bangalore': { lat: 12.9308, lng: 77.5838 },
  'malleshwaram, bangalore': { lat: 13.0031, lng: 77.5643 },
  'electronic city, bangalore': { lat: 12.8452, lng: 77.6602 },
  'bandra west, mumbai': { lat: 19.0596, lng: 72.8295 },
  'andheri east, mumbai': { lat: 19.1136, lng: 72.8697 },
  'hauz khas, new delhi': { lat: 28.5494, lng: 77.2001 },
  'connaught place, new delhi': { lat: 28.6315, lng: 77.2167 },
  'gachibowli, hyderabad': { lat: 17.4401, lng: 78.3489 },
  't nagar, chennai': { lat: 13.0418, lng: 80.2341 },
};

// Default fallback coordinate (Bangalore central coordinates)
export const DEFAULT_COORDINATES: GeoCoordinates = { lat: 12.9716, lng: 77.5946 };

/**
 * Calculates great-circle distance between two points in kilometers using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Extracts or approximates coordinates from a worker's location string
 */
export function getCoordinatesFromLocation(locationString: string | null | undefined): GeoCoordinates {
  if (!locationString) return DEFAULT_COORDINATES;

  const key = locationString.toLowerCase().trim();
  if (LOCATION_COORDINATES[key]) {
    return LOCATION_COORDINATES[key];
  }

  // Partial match
  for (const [locKey, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (key.includes(locKey) || locKey.includes(key)) {
      return coords;
    }
  }

  // Deterministic hash pseudo-coords around default location
  let hash = 0;
  for (let i = 0; i < locationString.length; i++) {
    hash = (hash << 5) - hash + locationString.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((hash % 100) / 1000) * 0.5;
  const lngOffset = (((hash >> 2) % 100) / 1000) * 0.5;

  return {
    lat: DEFAULT_COORDINATES.lat + latOffset,
    lng: DEFAULT_COORDINATES.lng + lngOffset,
  };
}

/**
 * Calculates estimated reach time in minutes
 */
export function calculateReachTimeMinutes(distanceKm: number): number {
  // Urban transit avg speed ~20km/h => 3 mins per km + 2 min prep buffer
  const minutes = Math.round(distanceKm * 3.2 + 2);
  return Math.max(3, minutes);
}

/**
 * Prompt browser geolocation API with fallback
 */
export function getUserLiveCoordinates(): Promise<GeoCoordinates> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_COORDINATES);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(DEFAULT_COORDINATES);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  });
}
