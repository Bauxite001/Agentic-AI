import OpenAI from "openai";

export class GoogleCopywritingService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateCopy(businessData, researchData) {
    console.log("⏳ OpenAI Agent: Executing Copywriting Engine...");

    const prompt = `
      Create localized marketing copy based on this data:
      Business Name: ${businessData.name}
      Sells: ${businessData.product}
      Target Audience Location: ${businessData.location} 
      Pain Points to target: ${researchData.painPoints}
      Marketing Angle: ${researchData.marketingAngle}
      Style: ${researchData.adStyle}
      Contact Info: ${businessData.contactInfo}

      CRITICAL: You must weave the target location (${businessData.location}) naturally into the headline, ad text, or captions so local customers know it is for them.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "copy_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              headline: { type: "string" },
              adText: { type: "string" },
              cta: { type: "string" },
              facebookCaption: { type: "string" },
              whatsappCaption: { type: "string" },
            },
            required: [
              "headline",
              "adText",
              "cta",
              "facebookCaption",
              "whatsappCaption",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
