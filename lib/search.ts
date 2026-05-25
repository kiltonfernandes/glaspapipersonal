import type { HighlightRecord, SearchResult } from "@/lib/types";

type SearchOptions = {
  q?: string | null;
  limit?: number;
  tag?: string | null;
  domain?: string | null;
  color?: string | null;
};

export function searchHighlights(highlights: HighlightRecord[], options: SearchOptions): SearchResult[] {
  const query = normalize(options.q || "");
  const terms = query.split(/\s+/).filter(Boolean);
  const limit = clampLimit(options.limit);
  const tag = normalize(options.tag || "");
  const domain = normalize(options.domain || "");
  const color = normalize(options.color || "");

  const filtered = highlights.filter((record) => {
    if (tag && !record.tags.some((item) => normalize(item) === tag)) return false;
    if (domain && normalize(record.domain) !== domain) return false;
    if (color && normalize(record.color) !== color) return false;
    return true;
  });

  if (!terms.length) {
    return filtered
      .slice()
      .sort((a, b) => Date.parse(b.highlightedAt || "0") - Date.parse(a.highlightedAt || "0"))
      .slice(0, limit)
      .map((record) => ({ ...record, score: 0, snippet: snippetFor(record, []) }));
  }

  return filtered
    .map((record) => ({ record, score: scoreRecord(record, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ record, score }) => ({ ...record, score, snippet: snippetFor(record, terms) }));
}

export function buildFacets(highlights: HighlightRecord[]) {
  return {
    tags: uniqueSorted(highlights.flatMap((record) => record.tags)),
    domains: uniqueSorted(highlights.map((record) => record.domain).filter(Boolean)),
    colors: uniqueSorted(highlights.map((record) => record.color).filter(Boolean))
  };
}

function scoreRecord(record: HighlightRecord, terms: string[]) {
  const fields = [
    { value: record.title, weight: 10 },
    { value: record.tags.join(" "), weight: 9 },
    { value: record.text, weight: 8 },
    { value: record.note, weight: 7 },
    { value: record.documentNote, weight: 6 },
    { value: record.summary, weight: 4 },
    { value: record.domain, weight: 3 },
    { value: record.url, weight: 2 }
  ];

  let score = 0;
  for (const term of terms) {
    let bestTermScore = 0;
    for (const field of fields) {
      const normalized = normalize(field.value);
      if (!normalized) continue;
      if (normalized.includes(term)) {
        bestTermScore = Math.max(bestTermScore, field.weight * 10);
        continue;
      }
      const tokens = normalized.split(/\s+/);
      if (tokens.some((token) => token.startsWith(term) || term.startsWith(token))) {
        bestTermScore = Math.max(bestTermScore, field.weight * 6);
        continue;
      }
      if (tokens.some((token) => levenshteinDistance(token, term) <= typoTolerance(term))) {
        bestTermScore = Math.max(bestTermScore, field.weight * 3);
      }
    }
    score += bestTermScore;
  }

  if (terms.every((term) => record.searchText.includes(term))) {
    score += 25;
  }

  return score;
}

function snippetFor(record: HighlightRecord, terms: string[]) {
  const source = record.text || record.note || record.summary || record.title;
  if (!source) return "";
  if (!terms.length) return trimSnippet(source, 220);

  const lower = normalize(source);
  const firstIndex = terms
    .map((term) => lower.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (firstIndex === undefined) {
    return trimSnippet(source, 220);
  }

  const start = Math.max(0, firstIndex - 80);
  return `${start > 0 ? "..." : ""}${trimSnippet(source.slice(start), 220)}`;
}

function trimSnippet(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length).trim()}...` : value;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function clampLimit(limit?: number) {
  if (!Number.isFinite(limit)) return 20;
  return Math.min(Math.max(Number(limit), 1), 100);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function typoTolerance(term: string) {
  if (term.length <= 4) return 0;
  if (term.length <= 7) return 1;
  return 2;
}

function levenshteinDistance(a: string, b: string) {
  const matrix = Array.from({ length: b.length + 1 }, (_, index) => [index]);
  for (let index = 0; index <= a.length; index += 1) {
    matrix[0][index] = index;
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      matrix[row][column] =
        b[row - 1] === a[column - 1]
          ? matrix[row - 1][column - 1]
          : Math.min(matrix[row - 1][column - 1] + 1, matrix[row][column - 1] + 1, matrix[row - 1][column] + 1);
    }
  }

  return matrix[b.length][a.length];
}
