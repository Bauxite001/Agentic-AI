import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";
import path from "path";

// 1. IMPORT SERVICE & CONTROLLER LAYERS
import { GoogleResearchService } from "./researchService.js";
import { GoogleCopywritingService } from "./copywritingService.js";
import { GooglePromptService } from "./promptService.js";
import { OpenAIImageService } from "./imageService.js";
import { AdController } from "./adController.js";

// 2. ENVIRONMENT & SERVER CONFIGURATION
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ GOOGLE_API_KEY is not set in your .env file.");
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is not set in your .env file.");
  process.exit(1);
}

const app = express();
const PORT =process.env.PORT || 3000;

// Increase payload limits to safely accept uploaded user image Base64 data strings
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));




// Automatically serve your UI files from the public folder root
app.use(express.static("public"));

// Image generation can take 20-40s per image (3 variants = up to 2 mins); raise timeout
app.use((req, res, next) => {
  res.setTimeout(180_000); // 3 minutes
  next();
});

// 3. INITIALIZATION & DEPENDENCY INJECTION ARCHITECTURE
const aiClient = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const researchService = new GoogleResearchService(aiClient);
const copywritingService = new GoogleCopywritingService(aiClient);
const promptService = new GooglePromptService(aiClient);
const imageService = new OpenAIImageService(); // OpenAI DALL-E 3 engine layer

// Inject worker services directly into the central Orchestration Flow Controller
const adController = new AdController(
  researchService,
  copywritingService,
  promptService,
  imageService,
);

// 4. REST API ENDPOINT BRIDGE
app.post("/api/generate-ad", async (req, res) => {
  try {
    const { businessData, userImage } = req.body;

    if (!businessData || !businessData.name || !businessData.type) {
      return res.status(400).json({
        error: "Missing required core business profiling parameters.",
      });
    }

    console.log(
      `\n📬 Incoming agent execution request received for: "${businessData.name}"`,
    );

    const fullCampaignAssets = await adController.generateFullAdCampaign(
      businessData,
      userImage,
    );

    return res.json(fullCampaignAssets);
  } catch (error) {
    console.error("☠️ Critical Orchestration Pipeline Crash:", error.message);
    return res.status(500).json({
      error:
        "The agentic framework encountered an internal runtime processing failure.",
      details: error.message,
    });
  }
});

// 5. BOOT ENGINE LISTENER
app.listen(PORT, () => {
  console.log(
    `\n=============================================================`,
  );
  console.log(`🚀 AGENTIC AD SUITE SERVER IS LIVE AND OPERATIONAL`);
  console.log(`🔗 Interface Dashboard URL: http://localhost:${PORT}`);
  console.log(
    `=============================================================\n`,
  );
});
