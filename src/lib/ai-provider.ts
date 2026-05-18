/**
 * AI Provider — Multi-Key Rotation & Fallback Utility
 *
 * Centralizes all Gemini AI interactions behind a singleton that:
 *  • Loads up to 10 API keys from GEMINI_API_KEY_1 … GEMINI_API_KEY_10
 *  • Falls back to legacy GOOGLE_GEMINI_API_KEY if no indexed keys are found
 *  • De-duplicates keys so same-project keys don't waste retry slots
 *  • Rotates keys automatically on 429 (rate-limit) errors
 *  • Falls back across model tiers (2.5-flash → 2.5-flash-lite → 1.5-flash)
 *  • Applies linear backoff between retries (1 s, 2 s, 3 s …)
 *  • Provides a typed JSON helper so routes never hand-parse AI output
 *
 * IMPORTANT: Google rate-limits are per-PROJECT, not per-key.
 * For rotation to actually help, each key must come from a DIFFERENT
 * Google Cloud project (i.e. a different Google account).
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_KEY_SLOTS = 10;
const BASE_BACKOFF_MS = 1000; // 1 second — scales linearly per attempt

/**
 * Model fallback chain — tried in order when a model returns an error.
 * gemini-2.5-flash is the current recommended free-tier model (May 2026).
 * gemini-2.0-flash is deprecated (shutdown June 1, 2026) — NOT included.
 */
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

const DEFAULT_MODEL = MODEL_FALLBACK_CHAIN[0]; // gemini-2.5-flash

// ─── Custom Errors ────────────────────────────────────────────────────────────

/**
 * Thrown when every available API key has been exhausted (all returned 429).
 * API routes should catch this and return a 429 to the client.
 */
export class ProviderOverloadedError extends Error {
  constructor(keyCount: number, details?: string) {
    super(
      `All ${keyCount} AI provider key(s) are rate-limited. ` +
        `The service is temporarily overloaded — please try again in a few minutes.` +
        (details ? ` [Last error: ${details}]` : "")
    );
    this.name = "ProviderOverloadedError";
  }
}

// ─── Key Loader ───────────────────────────────────────────────────────────────

/**
 * Collects every non-empty GEMINI_API_KEY_{1..10} from the environment.
 * If none are found, falls back to the legacy GOOGLE_GEMINI_API_KEY variable.
 * De-duplicates so identical keys (same project) don't waste retry slots.
 */
function loadApiKeys(): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];

  for (let i = 1; i <= MAX_KEY_SLOTS; i++) {
    const value = process.env[`GEMINI_API_KEY_${i}`];
    if (value && value.trim().length > 0 && !seen.has(value.trim())) {
      seen.add(value.trim());
      keys.push(value.trim());
    }
  }

  // Legacy fallback — keeps backward-compatibility
  if (keys.length === 0) {
    const legacy = process.env.GOOGLE_GEMINI_API_KEY;
    if (legacy && legacy.trim().length > 0) {
      keys.push(legacy.trim());
    }
  }

  return keys;
}

// ─── JSON Cleaner ─────────────────────────────────────────────────────────────

/**
 * Strips markdown fences (```json … ```) that Gemini sometimes wraps around
 * its output and parses the result as JSON.
 */
function cleanAndParseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

// ─── Error Classifiers ───────────────────────────────────────────────────────

/**
 * Returns true for 429 / quota-exhausted errors that warrant key rotation.
 */
function isRateLimitError(error: unknown): boolean {
  const msg = getErrorMessage(error);
  if (msg.includes("429") || msg.includes("Resource has been exhausted") || msg.includes("RESOURCE_EXHAUSTED")) {
    return true;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number }).status === 429
  ) {
    return true;
  }
  return false;
}

/**
 * Returns true for errors where the model itself is unavailable (404, deprecated)
 * so we should try a different model rather than a different key.
 */
function isModelError(error: unknown): boolean {
  const msg = getErrorMessage(error);
  return (
    msg.includes("404") ||
    msg.includes("not found") ||
    msg.includes("is not supported") ||
    msg.includes("deprecated")
  );
}

/**
 * Extracts a readable message from any error shape.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || "";
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

// ─── Sleep Helper ─────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── AIProvider Class ─────────────────────────────────────────────────────────

export class AIProvider {
  private keys: string[];
  private currentKeyIndex: number;

  constructor() {
    this.keys = loadApiKeys();
    this.currentKeyIndex = 0;

    if (this.keys.length === 0) {
      console.warn(
        "[AIProvider] ⚠ No API keys found. Set GEMINI_API_KEY_1 … _10 or GOOGLE_GEMINI_API_KEY in .env"
      );
    } else {
      console.log(
        `[AIProvider] ✓ Loaded ${this.keys.length} unique API key(s) — rotation enabled.`
      );
      if (this.keys.length < 3) {
        console.warn(
          `[AIProvider] ⚠ Only ${this.keys.length} unique key(s). For reliable rotation, use keys from DIFFERENT Google Cloud projects (different Google accounts).`
        );
      }
    }
  }

  // ── Key Management ──────────────────────────────────────────────────────

  /** Returns the number of loaded keys. */
  get keyCount(): number {
    return this.keys.length;
  }

  /** Returns true when at least one key is available. */
  get hasKeys(): boolean {
    return this.keys.length > 0;
  }

  /** Advances to the next key in the rotation. */
  private rotateKey(): void {
    const prevIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    console.log(
      `[AIProvider] 🔄 Key #${prevIndex + 1} hit rate-limit → rotating to key #${this.currentKeyIndex + 1}`
    );
  }

  // ── Model Factory ───────────────────────────────────────────────────────

  /**
   * Returns a `GenerativeModel` instance initialised with the current API key.
   *
   * @param modelName  Gemini model identifier (default: `gemini-2.5-flash`)
   */
  getGeminiModel(modelName: string = DEFAULT_MODEL): GenerativeModel {
    if (!this.hasKeys) {
      throw new Error(
        "[AIProvider] No API keys configured. Cannot create a model instance."
      );
    }
    const genAI = new GoogleGenerativeAI(this.keys[this.currentKeyIndex]);
    return genAI.getGenerativeModel({ model: modelName });
  }

  // ── Core Execution with Fallback ────────────────────────────────────────

  /**
   * Sends a prompt to Gemini and returns the raw text response.
   *
   * Strategy (two-level fallback):
   *  1. For each model in the fallback chain:
   *     a. Try every API key (with rotation + linear backoff on 429)
   *     b. If ALL keys fail for this model, try the next model
   *  2. If a non-429 model error (404/deprecated) hits, skip to next model immediately
   *  3. If every model × every key is exhausted, throw ProviderOverloadedError
   */
  async runWithFallback(
    prompt: string,
    modelName?: string
  ): Promise<string> {
    if (!this.hasKeys) {
      throw new ProviderOverloadedError(0);
    }

    // If caller specified an exact model, only try that one.
    // Otherwise, walk the full fallback chain.
    const modelsToTry = modelName
      ? [modelName]
      : [...MODEL_FALLBACK_CHAIN];

    let lastErrorMsg = "";

    for (const model of modelsToTry) {
      console.log(`[AIProvider] 🤖 Trying model: ${model}`);

      const maxAttempts = this.keys.length;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const geminiModel = this.getGeminiModel(model);
          const result = await geminiModel.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          console.log(
            `[AIProvider] ✅ Success on key #${this.currentKeyIndex + 1} with model ${model}`
          );
          return text;
        } catch (error: unknown) {
          lastErrorMsg = getErrorMessage(error);

          // Model doesn't exist / deprecated → skip to next model immediately
          if (isModelError(error)) {
            console.warn(
              `[AIProvider] ❌ Model "${model}" unavailable: ${lastErrorMsg.slice(0, 120)}`
            );
            break; // break inner key loop, continue to next model
          }

          // Rate limit → rotate key and retry
          if (isRateLimitError(error)) {
            console.warn(
              `[AIProvider] ⚡ Attempt ${attempt}/${maxAttempts} — 429 on key #${this.currentKeyIndex + 1} (model: ${model})`
            );
            console.warn(
              `[AIProvider] 📋 Error detail: ${lastErrorMsg.slice(0, 200)}`
            );

            if (attempt < maxAttempts) {
              this.rotateKey();
              const delayMs = attempt * BASE_BACKOFF_MS;
              console.log(`[AIProvider] ⏳ Backing off for ${delayMs} ms …`);
              await sleep(delayMs);
            }
            // If last attempt for this model, fall through to try next model
          } else {
            // Unknown error — log full detail and rethrow
            console.error(
              `[AIProvider] 💥 Non-retryable error on key #${this.currentKeyIndex + 1}: ${lastErrorMsg}`
            );
            throw error;
          }
        }
      }

      // All keys exhausted for this model — try next model in chain
      console.warn(
        `[AIProvider] ⛔ All keys exhausted for model "${model}". Trying next model…`
      );
    }

    // Every model × every key failed
    throw new ProviderOverloadedError(this.keys.length, lastErrorMsg);
  }

  // ── JSON Convenience Wrapper ────────────────────────────────────────────

  /**
   * Like `runWithFallback` but also strips markdown fences and parses the
   * response as JSON.  Every current tool route can use this directly.
   */
  async runWithFallbackJSON<T = unknown>(
    prompt: string,
    modelName?: string
  ): Promise<T> {
    const raw = await this.runWithFallback(prompt, modelName);
    return cleanAndParseJSON<T>(raw);
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const aiProvider = new AIProvider();
