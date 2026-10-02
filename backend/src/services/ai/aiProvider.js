/**
 * AI Provider Interface
 * Defines standard contract for verification AI providers (Gemini, Claude, OpenAI, etc.)
 */
export class AIProvider {
  constructor(name = 'generic') {
    this.name = name;
  }

  /**
   * Verify information input
   * @param {Object} input - Input parameters
   * @param {string} [input.claimText] - The statement or text claim
   * @param {string} [input.sourceUrl] - Optional URL provided by user
   * @param {string} [input.sourceTitle] - Optional title of the post/article
   * @param {string} [input.imagePath] - Optional local path to uploaded image/screenshot
   * @param {string} [input.mimeType] - MIME type of the uploaded image
   * @returns {Promise<Object>} Structured verification result
   */
  async verifyInformation(input) {
    throw new Error(`verifyInformation() not implemented in provider "${this.name}"`);
  }
}
