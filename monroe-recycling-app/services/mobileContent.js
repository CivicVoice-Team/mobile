const API_URL = "https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/mobile_content";

export async function fetchMobileContent(skill_id) {
    try {
        const response = await fetch(
            `${API_URL}?skill_id=${skill_id}`
        );

        //console.log("STATUS:", response.status);

        const responseText = await response.text();

        //console.log("RAW RESPONSE:", responseText);

        if (!response.ok) {
            throw new Error(`Failed with status ${response.status}`);
        }

        return JSON.parse(responseText);
    } catch (err) {
        console.error(err);
        return [];
    }
}