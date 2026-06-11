import OpenAI from "openai";

export class GoogleResearchService {
  // Keeping your exact class name so index.js never breaks!
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyzeImageContext(base64Data) {
    // Strips the header data URL tag if present to isolate the clean base64 chunk
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: "image/png",
      },
    };

    const prompt =
      "Analyze this image layout. Identify the primary color hex codes, core design theme (e.g. corporate, high-end tech, minimalist), text written on it, and central objects. Output a concise 2-sentence visual design rule summary.";

    // Call your Gemini model natively (e.g., gemini-2.5-flash or lite)
    const response = await this.model.generateContent([prompt, imagePart]);
    return response.response.text();
  }

  async performResearch(businessData) {
    console.log("⏳ OpenAI Agent: Running Market Research...");

    const prompt = `
      Analyze this business for marketing angles:
      Business Name: ${businessData.name}
      Business Type: ${businessData.type}
      Product/Service: ${businessData.product}
      Target Location: ${businessData.location}
      Special Offer: ${businessData.specialOffer || "None"}
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "research_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              painPoints: { type: "string" },
              desires: { type: "string" },
              marketingAngle: { type: "string" },
              adStyle: { type: "string" },
            },
            required: ["painPoints", "desires", "marketingAngle", "adStyle"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
