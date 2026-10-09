export interface NormalisationOptions {
  trimWhitespace?: boolean;
  normaliseLineEndings?: boolean;
  reduceBlankLines?: boolean;
}

export function normaliseContent(
  text: string,
  options: NormalisationOptions = {}
): string {
  const {
    trimWhitespace = true,
    normaliseLineEndings = true,
    reduceBlankLines = true,
  } = options;

  let result = text;

  // Normalise line endings to \n
  if (normaliseLineEndings) {
    result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  // Reduce excessive blank lines (more than 2 consecutive)
  if (reduceBlankLines) {
    result = result.replace(/\n\n\n+/g, '\n\n');
  }

  // Trim leading/trailing whitespace
  if (trimWhitespace) {
    result = result.trim();
  }

  return result;
}

export function calculateWordCount(text: string): number {
  const words = text.match(/\b\w+\b/g) || [];
  return words.length;
}

export function calculateCharacterCount(text: string): number {
  return text.length;
}

export function extractTitle(text: string): string | null {
  // Try to extract title from first line if it looks like a title
  const firstLine = text.split('\n')[0].trim();

  if (
    firstLine.length > 10 &&
    firstLine.length < 200 &&
    !firstLine.endsWith('.') &&
    !firstLine.endsWith(',')
  ) {
    return firstLine;
  }

  return null;
}
