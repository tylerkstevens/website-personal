export interface QuoteSource {
  cardQuote?: string;
  body?: string;
  sourceText?: string;
  title?: string;
}

const SKIP =
  /^(yesterday|here\b|this\b|check |make sure|if you|my point|more to come|let me know|just before|listen to|read the|watch the|join the|see my|click )/i;

function cleanInline(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function blocksOf(value: string) {
  const blocks: string[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push(paragraph.join(' '));
    paragraph = [];
  };
  for (const raw of value.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^#{1,6}\s/.test(line)) {
      flush();
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flush();
      blocks.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

function sentencesOf(value: string) {
  const sentences: string[] = [];
  for (const block of blocksOf(value)) {
    for (const sentence of cleanInline(block).split(/(?<=[.!?])\s+/)) {
      const trimmed = sentence.trim();
      if (trimmed.length < 24 || trimmed.length > 180) continue;
      if (/^https?:/i.test(trimmed) || /^—/.test(trimmed) || SKIP.test(trimmed)) continue;
      sentences.push(trimmed);
    }
  }
  return sentences;
}

function blockquotes(body: string) {
  const chunks: string[] = [];
  let current: string[] = [];
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*>/.test(line)) {
      current.push(line.replace(/^\s*>\s?/, ''));
    } else if (current.length) {
      chunks.push(current.join(' '));
      current = [];
    }
  }
  if (current.length) chunks.push(current.join(' '));
  return chunks;
}

function score(sentence: string, fromQuote: boolean) {
  const length = sentence.length;
  let value = 0;
  if (length >= 40 && length <= 120) value += 46;
  else if (length <= 140) value += 32;
  else value += 8;
  if (fromQuote) value += 28;
  if (/[.!]$/.test(sentence)) value += 6;
  if (/#|\bhttps?:/.test(sentence)) value -= 18;
  if (SKIP.test(sentence)) value -= 30;
  if (/^(basically|also|and |but |so |then |well|yes|that is|it is)\b/i.test(sentence)) value -= 22;
  if (/\bnot a\b/i.test(sentence)) value += 8;
  return value;
}

function best(candidates: { text: string; fromQuote: boolean }[], title?: string) {
  const titleKey = title ? cleanInline(title).toLowerCase() : '';
  let winner: { text: string; value: number } | undefined;
  for (const candidate of candidates) {
    if (titleKey && candidate.text.toLowerCase() === titleKey) continue;
    const value = score(candidate.text, candidate.fromQuote);
    if (!winner || value > winner.value) winner = { text: candidate.text, value };
  }
  return winner && winner.value > 0 ? winner.text : undefined;
}

/** A line from the post itself. Never writes new words. */
export function pickQuote({ cardQuote, body, sourceText, title }: QuoteSource) {
  const override = cardQuote?.trim();
  if (override) return override;

  const fromBody: { text: string; fromQuote: boolean }[] = [];
  if (body?.trim()) {
    for (const quote of blockquotes(body)) {
      for (const sentence of sentencesOf(quote)) fromBody.push({ text: sentence, fromQuote: true });
    }
    const withoutQuotes = body.replace(/^\s*>.*$/gm, '');
    for (const sentence of sentencesOf(withoutQuotes)) fromBody.push({ text: sentence, fromQuote: false });
    const chosen = best(fromBody, title);
    if (chosen) return chosen;
  }

  if (sourceText?.trim()) {
    const remote = sentencesOf(sourceText).map((text) => ({ text, fromQuote: false }));
    return best(remote, title);
  }

  return undefined;
}
