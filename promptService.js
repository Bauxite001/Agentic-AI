import OpenAI from "openai";

export class GooglePromptService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateImagePrompts(businessData, copyData, researchData) {
    console.log("⏳ OpenAI Agent: Drafting Multi-Variant Design Briefs...");

    const agentContextPrompt = `
      Identity: You are an Expert AI Visual Art Director responsible for generating premium graphic design prompts.
      Mission: Convert text assets into specific, highly vivid visual concepts for image generation engines.
      
      Operating Principles & Triggers:
      - Never look at text in isolation. Evaluate the Business Type (${businessData.type}) and targeted Location (${businessData.location}).
      - Output a variation array exactly matching three different marketing angles: Corporate Professional, Bold & Modern, and Minimalist Elegance.
      
      Inputs to parse:
      Headline text: "${copyData.headline}"
      Marketing Strategy context: "${researchData.marketingAngle}"
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: agentContextPrompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "prompt_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              corporatePrompt: { type: "string" },
              modernPrompt: { type: "string" },
              minimalistPrompt: { type: "string" },
            },
            required: ["corporatePrompt", "modernPrompt", "minimalistPrompt"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
