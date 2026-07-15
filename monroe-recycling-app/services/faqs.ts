export type FAQTag = {
    name: string;
    link?: string;
};

export type FAQItem = {
    hazardous: boolean;
    id: string;
    skill_id: string;
    question: string;
    answer: string;
    mobile?: string;
    description: string;
    tags: FAQTag[];
    updatedAt?: string;
}

export async function fetchFAQs(skill_id: string): Promise<FAQItem[]> {
    const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/faqs?skill_id=${skill_id}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch FAQs: ${res.status}`);
    }

    const data = await res.json();

    return (data || []).map((item: any) => {
        const hasMobile =
            typeof item.mobile === "string" && item.mobile.trim().length > 0;

        return {
            ...item,
            id: item.id,
            skill_id: item.skill_id,

            hazardous: item.hazardous ?? false,

            description: hasMobile ? item.mobile: item.answer,
            tags: item.tags ?? [],
        };
    });
}