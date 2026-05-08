import fs from "fs";
import axios from "axios";
import replicate from "../../config/ai.js";

const loadImage = async (path: string, mimetype: string) => {
  try {
    const data = await fs.promises.readFile(path);
    return {
      type: "image_url",
      image_url: {
        url: `data:${mimetype};base64,${data.toString("base64")}`,
      },
    };
  } finally {
    // Clean up the file on the server
    await fs.promises.unlink(path).catch(() => {
      console.error(`Failed to delete temp file: ${path}`);
    });
  }
};

export const generateAIImage = async (
  images: Express.Multer.File[],
  promptText: string,
  aspectRatio?: string,
) => {
  try {
    const img1 = await loadImage(images[0].path, images[0].mimetype);
    const img2 = await loadImage(images[1].path, images[1].mimetype);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-image-1",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
${promptText}.
Combine both images naturally.
Model should interact with the product realistically.
Professional advertisement, high detail, studio lighting.
Aspect ratio ${aspectRatio || "9:16"}.
                `,
              },
              img1,
              img2,
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Handle both array content and string content responses
    const message = response.data?.choices?.[0]?.message;
    const content = message?.content;

    let image: string | undefined;

    if (Array.isArray(content)) {
      // Content is array of parts — find the image_url part
      const imagePart = content.find((c: any) => c.type === "image_url");
      image = imagePart?.image_url?.url;
    } else if (typeof content === "string" && content.startsWith("data:image")) {
      image = content;
    }

    if (!image) {
      console.error("Unexpected response structure:", JSON.stringify(response.data));
      throw new Error("No image returned");
    }

    return image;
  } catch (err: any) {
    console.error("AI Image Error:", err.response?.data || err.message);
    throw new Error("Image generation failed");
  }
};

export const generateVideoFromImage = async (
  imageUrl: string,
  prompt: string,
  aspectRatio: string = "9:16",
) => {
  try {
    const output = await replicate.run("minimax/video-01", {
      input: {
        prompt: `
${prompt}.
Cinematic advertisement, smooth motion,
professional lighting, high quality.
Aspect ratio ${aspectRatio}.
          `,
        image: imageUrl,
      },
    });

    const videoUrl = Array.isArray(output) ? output[0] : output;

    if (!videoUrl) {
      throw new Error("No video returned");
    }

    return videoUrl;
  } catch (err: any) {
    console.error("AI Video Error:", err.message);
    throw new Error("Video generation failed");
  }
};
