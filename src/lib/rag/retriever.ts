
function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function chunkText(text: string, chunkSize = 700, overlap = 120) {
  const clean = text.trim();
  const chunks: string[] = [];
  let i = 0;

  while (i < clean.length) {
    const end = Math.min(i + chunkSize, clean.length);
    chunks.push(clean.slice(i, end));
    i += chunkSize - overlap;
  }

  return chunks;
}

const CHUNKS: string[] = [];

export function retrieveContext(query: string, k = 4) {
  const q = normalize(query);
  const qTerms = new Set(q.split(/\s+/).filter(Boolean));

  const scored = CHUNKS.map((chunk) => {
    const c = normalize(chunk);
    let score = 0;
    for (const term of qTerms) {
      if (term.length < 3) continue;
      // count occurrences
      const matches = c.split(term).length - 1;
      score += matches * (term.length >= 6 ? 2 : 1);
    }
    // small bonus for headings
    if (c.includes("#")) score += 1;
    return { chunk, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return scored.map((s, idx) => `SOURCE ${idx + 1}:\n${s.chunk}`).join("\n\n---\n\n");
}
