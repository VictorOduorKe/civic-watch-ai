import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './aiProvider.js';
import {
  SYSTEM_INSTRUCTION,
  GEMINI_RESPONSE_SCHEMA,
  buildUserPrompt,
  PROMPT_VERSION
} from './verificationPrompt.js';
import { aiVerificationResponseSchema } from '../../validators/verificationValidators.js';

export class GeminiProvider extends AIProvider {
  constructor(options = {}) {
    super('gemini');
    this.model = options.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.timeoutMs = options.timeoutMs || 25000;
    this.promptVersion = PROMPT_VERSION;
  }

  /**
   * Helper to initialize the GenAI client with key validation
   */
  _getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      const err = new Error('AI verification is currently unavailable. Please ensure GEMINI_API_KEY is configured on the backend.');
      err.code = 'AI_UNAVAILABLE';
      throw err;
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Execute verification on claim, source, and optional image
   */
  async verifyInformation({ claimText, sourceUrl, sourceTitle, imagePath, mimeType }) {
    const client = this._getClient();
    const startTime = Date.now();

    // Prepare contents array
    const contents = [];

    // Add user text prompt
    const promptText = buildUserPrompt({
      claimText,
      sourceUrl,
      sourceTitle,
      hasImage: Boolean(imagePath)
    });
    contents.push(promptText);

    // If image provided, attach as base64 inline data
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        const imageBuffer = fs.readFileSync(imagePath);
        contents.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBuffer.toString('base64')
          }
        });
      } catch (err) {
        console.error('[GeminiProvider] Error reading screenshot file:', err.message);
      }
    }

    // Call Gemini with timeout and retry logic
    let attempts = 0;
    const maxAttempts = 2;
    let lastError = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const callPromise = client.models.generateContent({
          model: this.model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: GEMINI_RESPONSE_SCHEMA,
            temperature: 0.2
          }
        });

        // Timeout wrapper
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            const timeoutErr = new Error('AI verification request timed out. Please try again.');
            timeoutErr.code = 'AI_TIMEOUT';
            reject(timeoutErr);
          }, this.timeoutMs);
        });

        const response = await Promise.race([callPromise, timeoutPromise]);
        const durationMs = Date.now() - startTime;

        if (!response || !response.text) {
          throw new Error('AI model returned an empty response.');
        }

        // Parse and validate response JSON against schema
        let parsed;
        try {
          parsed = JSON.parse(response.text);
        } catch (jsonErr) {
          const malformedErr = new Error('AI model output was not valid JSON.');
          malformedErr.code = 'AI_MALFORMED_RESPONSE';
          throw malformedErr;
        }

        const validatedResult = aiVerificationResponseSchema.parse(parsed);

        return {
          ...validatedResult,
          provider: this.name,
          model: this.model,
          promptVersion: this.promptVersion,
          durationMs
        };
      } catch (err) {
        lastError = err;

        // If permanent error (e.g. auth failure or invalid key), don't retry
        if (
          err.code === 'AI_UNAVAILABLE' ||
          err.status === 400 ||
          err.status === 401 ||
          err.status === 403 ||
          (err.message && err.message.includes('API_KEY_INVALID'))
        ) {
          break;
        }

        // Wait brief delay before retry on transient error
        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    // If we reach here, all attempts failed
    const errorMsg = lastError?.code === 'AI_UNAVAILABLE'
      ? lastError.message
      : lastError?.code === 'AI_TIMEOUT'
      ? 'The AI verification request timed out. Please try again later.'
      : 'AI verification could not be completed reliably right now. Please try again later.';

    const wrappedError = new Error(errorMsg);
    wrappedError.code = lastError?.code || 'AI_PROVIDER_ERROR';
    wrappedError.durationMs = Date.now() - startTime;
    throw wrappedError;
  }
}
