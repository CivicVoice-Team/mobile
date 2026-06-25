export async function searchFAQs(query: string, skillId: string) {
  const res = await fetch("https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/search_faq", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      skill_id: skillId,
    }),
  });

  const data = await res.json();

  return (data.results || []).map((item: any) => ({
    ...item,
    id: item.id ?? item.objectID,
  }));

//   return data.results || [];
}