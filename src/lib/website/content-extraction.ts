import { load } from 'cheerio';
import { Readability } from 'mozilla-readability';
import { JSDOM } from 'jsdom';
import type { CheerioAPI } from 'cheerio';

/**
 * Website Content Extraction
 * Extracts structured content from HTML using Cheerio and Mozilla Readability
 */

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; LekhIQ/1.0; +https://lekhiq.example.com)';

export interface ExtractedContent {
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  h1: string[];
  h2: string[];
  h3: string[];
  paragraphs: string[];
  lists: string[];
  mainText: string;
  wordCount: number;
  characterCount: number;
  extractionMethod: 'static' | 'readability';
  extractionQuality: 'high' | 'medium' | 'low';
  links: {
    internal: Array<{ text: string; href: string }>;
    external: Array<{ text: string; href: string }>;
  };
  metadata: {
    author?: string;
    publishedDate?: string;
    modifiedDate?: string;
  };
}

export interface FetchOptions {
  timeout?: number;
  maxSize?: number;
  userAgent?: string;
}

async function fetchUrl(
  url: string,
  options: FetchOptions = {}
): Promise<{
  html: string;
  finalUrl: string;
  contentType: string;
}> {
  const { timeout = DEFAULT_TIMEOUT, maxSize = DEFAULT_MAX_SIZE, userAgent = DEFAULT_USER_AGENT } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error(`Not an HTML page (Content-Type: ${contentType})`);
    }

    const html = await response.text();

    if (html.length > maxSize) {
      throw new Error(`Page size exceeds limit (${html.length} > ${maxSize})`);
    }

    return {
      html,
      finalUrl: response.url,
      contentType,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractStaticContent(html: string, baseUrl: string, $?: CheerioAPI): Omit<ExtractedContent, 'extractionMethod' | 'extractionQuality'> {
  const cheerio = $ || load(html);

  // Meta tags
  const metaTitle = cheerio("meta[property='og:title']").attr('content') || cheerio('meta[name="title"]').attr('content') || '';
  const metaDescription = cheerio("meta[property='og:description']").attr('content') || cheerio('meta[name="description"]').attr('content') || '';
  const canonicalUrl = cheerio('link[rel="canonical"]').attr('href') || null;

  // Title
  const title = cheerio('title').text() || metaTitle;

  // Headings
  const h1: string[] = [];
  const h2: string[] = [];
  const h3: string[] = [];

  cheerio('h1').each((_, el) => {
    const text = cheerio(el).text().trim();
    if (text) h1.push(text);
  });

  cheerio('h2').each((_, el) => {
    const text = cheerio(el).text().trim();
    if (text) h2.push(text);
  });

  cheerio('h3').each((_, el) => {
    const text = cheerio(el).text().trim();
    if (text) h3.push(text);
  });

  // Paragraphs
  const paragraphs: string[] = [];
  cheerio('p').each((_, el) => {
    const text = cheerio(el).text().trim();
    if (text && text.length > 20) paragraphs.push(text);
  });

  // Lists
  const lists: string[] = [];
  cheerio('ul, ol').each((_, el) => {
    const items: string[] = [];
    cheerio(el)
      .find('li')
      .each((_, liEl) => {
        const text = cheerio(liEl).text().trim();
        if (text) items.push(text);
      });
    if (items.length > 0) {
      lists.push(items.join('\n'));
    }
  });

  // Links
  const baseUrlObj = new URL(baseUrl);
  const internal: Array<{ text: string; href: string }> = [];
  const external: Array<{ text: string; href: string }> = [];

  cheerio('a').each((_, el) => {
    const href = cheerio(el).attr('href');
    const text = cheerio(el).text().trim();
    if (!href || !text) return;

    try {
      const linkUrl = new URL(href, baseUrl);
      const linkData = { text, href: linkUrl.toString() };

      if (linkUrl.hostname === baseUrlObj.hostname) {
        internal.push(linkData);
      } else {
        external.push(linkData);
      }
    } catch {
      // Invalid URL, skip
    }
  });

  // Main text
  const mainText = [
    ...paragraphs,
    ...lists,
    ...h2.map(h => `# ${h}`),
    ...h3.map(h => `## ${h}`),
  ].join('\n\n');

  const wordCount = mainText.split(/\s+/).filter(w => w.length > 0).length;
  const characterCount = mainText.length;

  // Metadata
  const author = cheerio('meta[name="author"]').attr('content') || undefined;
  const publishedDate = cheerio('meta[property="article:published_time"]').attr('content') || undefined;
  const modifiedDate = cheerio('meta[property="article:modified_time"]').attr('content') || undefined;

  return {
    title,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    canonicalUrl,
    h1,
    h2,
    h3,
    paragraphs,
    lists,
    mainText,
    wordCount,
    characterCount,
    links: { internal, external },
    metadata: { author, publishedDate, modifiedDate },
  };
}

function evaluateExtractionQuality(content: Omit<ExtractedContent, 'extractionMethod' | 'extractionQuality'>): 'high' | 'medium' | 'low' {
  let score = 0;

  // Word count (higher is better, but needs to be meaningful)
  if (content.wordCount > 500) score += 3;
  else if (content.wordCount > 250) score += 2;
  else if (content.wordCount > 100) score += 1;

  // Heading count
  if (content.h1.length > 0) score += 1;
  if (content.h2.length > 1) score += 1;
  if (content.h3.length > 1) score += 1;

  // Paragraph count
  if (content.paragraphs.length > 5) score += 2;
  else if (content.paragraphs.length > 2) score += 1;

  // Links count (indicates structured content)
  if (content.links.internal.length > 5 || content.links.external.length > 5) score += 1;

  // Meta tags
  if (content.metaTitle) score += 1;
  if (content.metaDescription) score += 1;

  if (score >= 8) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function extractReadabilityContent(html: string, baseUrl: string): Omit<ExtractedContent, 'extractionMethod' | 'extractionQuality'> | null {
  try {
    const dom = new JSDOM(html, { url: baseUrl });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.content) return null;

    // Parse the readability result
    const $ = load(article.content);
    const staticContent = extractStaticContent(article.content, baseUrl, $);

    // Use readability's title if better
    if (article.title && !staticContent.title) {
      staticContent.title = article.title;
    }

    return staticContent;
  } catch {
    return null;
  }
}

export async function extractWebsiteContent(
  url: string,
  options: FetchOptions = {}
): Promise<{ success: true; content: ExtractedContent; finalUrl: string } | { success: false; error: string }> {
  try {
    // Fetch the page
    const fetchResult = await fetchUrl(url, options);
    const { html, finalUrl } = fetchResult;

    // Try static extraction first
    let content = extractStaticContent(html, finalUrl);
    let extractionMethod: 'static' | 'readability' = 'static';

    // Evaluate quality
    let extractionQuality = evaluateExtractionQuality(content);

    // If quality is low and content seems JS-heavy, try Readability
    if (extractionQuality === 'low' && content.wordCount < 200) {
      const readabilityContent = extractReadabilityContent(html, finalUrl);
      if (readabilityContent && readabilityContent.wordCount > content.wordCount) {
        content = readabilityContent;
        extractionMethod = 'readability';
        extractionQuality = evaluateExtractionQuality(content);
      }
    }

    return {
      success: true,
      content: {
        ...content,
        extractionMethod,
        extractionQuality,
      },
      finalUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during extraction',
    };
  }
}
