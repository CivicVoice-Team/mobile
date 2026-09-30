export type MobileHelpItem = {
  skill_id: string;
  title?: string;
  phone?: string;
  email?: string;
  updated_at?: string;
};

export async function fetchMobileHelp(
  skill_id: string
): Promise<MobileHelpItem | null> {
  const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/get_mobile_help?skill_id=${encodeURIComponent(skill_id)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch mobile help: ${res.status}`);
  }
  const data = await res.json();
  return data || null;
}
