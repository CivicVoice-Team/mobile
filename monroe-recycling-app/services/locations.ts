import type { LocationItem } from "@/types/location";

export async function fetchLocations(skill_id:string): Promise<LocationItem[]> {
    const params = new URLSearchParams({ skill_id });

    const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/locations?skill_id=${skill_id}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch locations: ${res.status}`);
    }

    return res.json();
}