import type { LocationItem } from "@/types/location";

export function getLocationImageUrl(locationId: string, cacheKey: string) {
    const base = `https://civicvoice-images.s3.us-east-1.amazonaws.com/public/locations/${locationId}`;
    return `${base}?v=${encodeURIComponent(cacheKey)}`;
}

export async function fetchLocations(skill_id:string): Promise<LocationItem[]> {
    const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/locations?skill_id=${skill_id}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch locations: ${res.status}`);
    }

    const locations: LocationItem[] = await res.json();
    const imageCacheKey = String(Date.now());

    return locations.map((item) => ({
      ...item,
      imageCacheKey,
    }));
}