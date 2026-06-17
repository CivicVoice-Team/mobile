export type FAQItem = {
    id: string;
    skill_id: string;
    question: string;
    answer: string;
}

export async function fetchFAQs(skill_id: string): Promise<FAQItem[]> {
    const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/faqs?skill_id=${skill_id}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch FAQs: ${res.status}`);
    }

    return res.json();
}