const REKOGNITION_ENDPOINT = "https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/detect-image";

export async function detectImage(base64Image: string) {
    const response = await fetch(REKOGNITION_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image: base64Image,
        }),
    });

    const result = await response.json();

    console.log("Lambda status:", response.status);
    console.log("Lambda response", result);

    if (!response.ok) {
        throw new Error("Image detection failed");
    }

    return result;
}