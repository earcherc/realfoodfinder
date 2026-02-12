import "server-only";

const GEOCODE_ENDPOINT = "https://nominatim.openstreetmap.org/search";

type GeocodeResult = {
  lat: string;
  lon: string;
};

export async function geocodeAddress(query: string) {
  const url = new URL(GEOCODE_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "realfoodfinder-app/1.0",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GeocodeResult[];
  const first = data[0];

  if (!first) {
    return null;
  }

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}
