export class AdController {
  constructor(
    researchService,
    copywritingService,
    promptService,
    imageService,
  ) {
    this.researchService = researchService;
    this.copywritingService = copywritingService;
    this.promptService = promptService;
    this.imageService = imageService;
  }

  async generateFullAdCampaign(businessData, userImageBase64 = null) {
    console.log("📬 Incoming agent execution request received.");
    console.log("🚀 Agent Trigger Condition initiated.");

    // 1. Run Research via Gemini Intelligence Agent
    const researchResults =
      await this.researchService.performResearch(businessData);
    console.log("⏳ OpenAI Agent: Running Market Research...");

    // 2. Run Copywriting via Gemini Creative Copy Engine
    const copyResults = await this.copywritingService.generateCopy(
      businessData,
      researchResults,
    );
    console.log("⏳ OpenAI Agent: Executing Copywriting Engine...");

    let finalFlyerUrl = "";

    // 3. Conditional Image Handling
    if (userImageBase64) {
      console.log(
        "📸 [Asset Pipeline] User image detected. Bypassing AI generation to use exact source image...",
      );
      // Use your exact uploaded image as the layout base
      finalFlyerUrl = userImageBase64;
    } else {
      console.log("⏳ OpenAI Agent: Drafting Multi-Variant Design Briefs...");
      const designPrompts = await this.promptService.generateImagePrompts(
        businessData,
        copyResults,
        researchResults,
      );

      console.log(
        "🎨 [Asset Pipeline] No image uploaded. Generating fallback AI layout via gpt-image-1...",
      );
      finalFlyerUrl = await this.imageService.generateFlyer(
        designPrompts.modernPrompt,
        businessData.type,
      );
    }

    console.log("✅ Asset mapping successfully completed.");

    return {
      flyerUrl: finalFlyerUrl,
      headline: copyResults.headline || "",
      adText: copyResults.adText || "",
      cta: copyResults.cta || "",
      facebookCaption: copyResults.facebookCaption || "",
      whatsappCaption: copyResults.whatsappCaption || "",
    };
  }
}
