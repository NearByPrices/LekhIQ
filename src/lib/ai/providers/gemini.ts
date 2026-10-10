/**
 * Google Gemini AI Provider
 * Integrates Gemini API for text generation
 */

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

class GeminiProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model || process.env.GEMINI_MODEL || 'gemini-pro';

    if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
      console.warn('[Gemini] API key not configured. Set GEMINI_API_KEY in .env.local');
    }
  }

  /**
   * Generate text using Gemini
   */
  async generateText(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    try {
      const response = await this.callAPI(payload);
      return this.extractText(response);
    } catch (error) {
      console.error('[Gemini] Error generating text:', error);
      throw error;
    }
  }

  /**
   * Generate text with conversation history
   */
  async generateWithHistory(messages: GeminiMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const contents = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const payload = { contents };

    try {
      const response = await this.callAPI(payload);
      return this.extractText(response);
    } catch (error) {
      console.error('[Gemini] Error in conversation:', error);
      throw error;
    }
  }

  /**
   * Call Gemini API
   */
  private async callAPI(payload: any): Promise<GeminiResponse> {
    const url = `${API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: GeminiResponse = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || `API Error: ${response.status}`;
      throw new Error(`[${response.status}] ${errorMessage}`);
    }

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data;
  }

  /**
   * Extract text from Gemini response
   */
  private extractText(response: GeminiResponse): string {
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No text in Gemini response');
    }

    return text;
  }

  /**
   * Check if API is configured and working
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.generateText('Say "ok" in one word');
      return response.toLowerCase().includes('ok');
    } catch (error) {
      console.error('[Gemini] Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const gemini = new GeminiProvider();

export default GeminiProvider;
