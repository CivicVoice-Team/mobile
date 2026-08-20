const SAVE_IMAGE_SEARCH_ENDPOINT =
  "https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/save_image_search";

export async function saveImageSearch({
    skillId,
    imageId,
    keywords,
    selectedKeyword,
}: {
    skillId: string;
    imageId: string;
    keywords: string[];
    selectedKeyword: string;
}) {
    const response = await fetch(SAVE_IMAGE_SEARCH_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            skill_id: skillId,
            image_id: imageId,
            keywords,
            selected_keyword: selectedKeyword,
        }),
    });

    const responseText = await response.text();

    console.log("Save image search HTTP status:", response.status);
    console.log("Save image search response:", responseText);

    let result;

    try {
        result = JSON.parse(responseText);
    } catch {
        result = {};
    }

    if (!response.ok) {
        throw new Error(
            result.error || `Failed to save image search (${response.status})`
        );
    }

    return result;
}