import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaJSONSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/beta/json-schema";

const MODEL = "claude-opus-5-5";
type ImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export function aiMode(): "mock" | "live" | "off" {
  if (process.env.AI_MOCK === "1") return "mock";
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return "live";
  return "off";
}

export class AiUnavailableError extends Error {
  constructor(msg = "AI features need ANTHROPIC_API_KEY in .env.local") { super(msg); }
}

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

async function ask<T>(
  schema: { type: "object" } & Record<string, unknown>,
  prompt: string,
  image?: { data: string; mediaType: ImageType },
) {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } });
  content.push({ type: "text", text: prompt });

  const res = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaJSONSchemaOutputFormat(schema as { type: "object" }) },
    messages: [{ role: "user", content }],
  });
  if (res.stop_reason === "refusal") throw new Error("Claude declined this request.");
  if (!res.parsed_output) throw new Error("Could not read Claude's response.");
  return res.parsed_output as T;
}

// ---------- Meal photo ----------
const mealSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          grams: { type: "number" },
          kcal: { type: "number" },
          protein: { type: "number" },
        },
        required: ["name", "grams", "kcal", "protein"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
} as const;

export type MealItem = { name: string; grams: number; kcal: number; protein: number };

export async function analyzeMeal(data: string, mediaType: ImageType): Promise<MealItem[]> {
  const mode = aiMode();
  if (mode === "mock") return [
    { name: "Grilled chicken breast", grams: 150, kcal: 248, protein: 46 },
    { name: "White rice", grams: 180, kcal: 234, protein: 5 },
    { name: "Steamed broccoli", grams: 80, kcal: 27, protein: 2 },
  ];
  if (mode === "off") throw new AiUnavailableError();
  const out = await ask<{ items: MealItem[] }>(mealSchema,
    "Identify each food on this plate. Estimate the portion in grams and its calories (kcal) and protein (g). " +
    "Be realistic about portion sizes. If the image contains no food, return an empty items list.",
    { data, mediaType });
  return out.items;
}

// ---------- Receipt ----------
const receiptSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          qty: { type: "number" },
          unit: { type: "string", enum: ["g", "kg", "ml", "l", "pcs"] },
        },
        required: ["name", "qty", "unit"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
} as const;

export type ReceiptItem = { name: string; qty: number; unit: "g" | "kg" | "ml" | "l" | "pcs" };

export async function scanReceipt(data: string, mediaType: ImageType): Promise<ReceiptItem[]> {
  const mode = aiMode();
  if (mode === "mock") return [
    { name: "Chicken breast", qty: 1, unit: "kg" },
    { name: "Greek yogurt", qty: 500, unit: "g" },
    { name: "Blueberries", qty: 250, unit: "g" },
    { name: "Eggs", qty: 12, unit: "pcs" },
  ];
  if (mode === "off") throw new AiUnavailableError();
  const out = await ask<{ items: ReceiptItem[] }>(receiptSchema,
    "This is a grocery receipt. List only food items. Use a short generic food name (e.g. 'Greek yogurt', not the brand). " +
    "Infer the quantity and unit from the product description (pack size × count); use 'pcs' for countable items like eggs.",
    { data, mediaType });
  return out.items;
}

// ---------- Recipes ----------
const recipesSchema = {
  type: "object",
  properties: {
    recipes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          slot: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: { food: { type: "string" }, grams: { type: "number" }, inStock: { type: "boolean" } },
              required: ["food", "grams", "inStock"],
              additionalProperties: false,
            },
          },
          steps: { type: "array", items: { type: "string" } },
          kcal: { type: "number" },
          protein: { type: "number" },
        },
        required: ["name", "slot", "ingredients", "steps", "kcal", "protein"],
        additionalProperties: false,
      },
    },
  },
  required: ["recipes"],
  additionalProperties: false,
} as const;

export type AiRecipe = {
  name: string; slot: "breakfast" | "lunch" | "dinner" | "snack";
  ingredients: { food: string; grams: number; inStock: boolean }[];
  steps: string[]; kcal: number; protein: number;
};

export async function suggestRecipes(stock: { name: string; qty: number; unit: string }[], proteinTarget: number): Promise<AiRecipe[]> {
  const mode = aiMode();
  if (mode === "mock") return [{
    name: "Chicken & yogurt power bowl", slot: "lunch",
    ingredients: [{ food: "Chicken breast", grams: 180, inStock: true }, { food: "Greek yogurt", grams: 100, inStock: true }, { food: "Blueberries", grams: 50, inStock: true }],
    steps: ["Grill the chicken.", "Serve with a yogurt sauce and berries on the side."], kcal: 450, protein: 66,
  }];
  if (mode === "off") throw new AiUnavailableError();
  const list = stock.map((s) => `- ${s.name}: ${s.qty} ${s.unit}`).join("\n");
  const out = await ask<{ recipes: AiRecipe[] }>(recipesSchema,
    `I go to the gym and aim for ${proteinTarget} g protein a day. Suggest 3 high-protein recipes using mostly what I have. ` +
    `At least 70% of each recipe's ingredients must come from this pantry (mark inStock accordingly); basic spices are free.\n\nPantry:\n${list}`);
  return out.recipes;
}
