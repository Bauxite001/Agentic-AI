// check-models.js
// Run this ONCE to see exactly which models your API key can use.
// Usage: node check-models.js
// It will print every available model and whether it supports image generation.

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const result = await ai.models.list();

console.log("\n=== ALL MODELS AVAILABLE ON YOUR KEY ===\n");

const imageModels = [];
const textModels = [];

for await (const model of result) {
  const name = model.name;
  const methods = model.supportedGenerationMethods || [];
  const isImage =
    name.includes("image") ||
    name.includes("imagen") ||
    name.includes("banana") ||
    methods.includes("generateImages");

  if (isImage) {
    imageModels.push({ name, methods });
  } else {
    textModels.push({ name, methods });
  }
}

console.log("🖼️  IMAGE-CAPABLE MODELS:");
if (imageModels.length === 0) {
  console.log("   (none — image generation requires billing on your account)");
} else {
  imageModels.forEach((m) =>
    console.log(`   ✅ ${m.name}  [${m.methods.join(", ")}]`),
  );
}

console.log("\n📝 TEXT MODELS:");
textModels.forEach((m) => console.log(`   ${m.name}`));

const response = await fetch("https://api.openai.com/v1/models", {
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

const data = await response.json();

console.log(data.data.map((model) => model.id));

console.log("\n========================================\n");
