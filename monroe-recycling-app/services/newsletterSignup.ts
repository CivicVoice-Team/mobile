export async function signupNewsletter(
  skill_id: string,
  email: string
): Promise<{ skill_id: string; email: string; created_at: string }> {
  const url =
    "https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/signup_newsletter";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      skill_id,
      email,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Failed to sign up: ${res.status}`);
  }
  return data;
}
