import OpenAI from "openai";

// Helper to convert raw base64 data strings into a standard data URL the browser can render
function toDataURL(b64, format = "png") {
  return `data:image/${format};base64,${b64}`;
}

// Multi-tier extractor that catches whatever format the gateway throws back
function extractImageUrl(response) {
  const item = response?.data?.[0];
  if (!item) return null;

  // Route 1: If it's a standard web link URL
  if (item.url) return item.url;

  // Route 2: If it's a raw Base64 data matrix (highly likely for gpt-image-1)
  if (item.b64_json) {
    return toDataURL(item.b64_json, response?.output_format || "png");
  }

  return null;
}

export class OpenAIImageService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateFlyer(prompt, businessType = "") {
    console.log(
      "🎨 [imageService] Executing targeted contextual generation via gpt-image-1...",
    );

    const finalPrompt = `High-end commercial flyer design layout for a ${businessType || "business"}. Visual concept: ${prompt}. Clean premium tech energy aesthetic, graphic design composition, sharp focus.`;

    try {
      const response = await this.openai.images.generate({
        model: "gpt-image-1",
        prompt: finalPrompt,
        size: "1024x1536",
        quality: "high",
      });

      // Pass the response payload through the robust extractor function
      const imageUrl = extractImageUrl(response);

      if (!imageUrl) {
        throw new Error(
          "No displayable image URL or base64 data string could be parsed from the response payload structure.",
        );
      }

      return imageUrl;
    } catch (error) {
      console.error("[imageService] Pipeline Error Root Cause:", error.message);
      throw new Error(
        `OpenAI Graphic Engine rejected request. Reason: ${error.message}`,
      );
    }
  }
}
