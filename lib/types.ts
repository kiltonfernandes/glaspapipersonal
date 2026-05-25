export type GlaspColor = "pink" | "yellow" | "blue" | "green" | string;

export type GlaspHighlight = {
  id: string;
  text: string;
  note: string;
  color: GlaspColor;
  highlighted_at: string;
  created_at: string;
  updated_at: string;
  url: string;
  location: number | null;
  location_type: "page" | "location" | "time_offset" | string;
  highlight_url: string;
};

export type GlaspDocument = {
  id: string;
  title: string;
  author: string;
  thumbnail_url: string;
  url: string;
  glasp_url: string;
  domain: string;
  category: "article" | "video" | "tweet" | "pdf" | "book" | string;
  document_note: string | null;
  summary: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  highlights: GlaspHighlight[];
};

export type HighlightRecord = {
  id: string;
  documentId: string;
  title: string;
  url: string;
  glaspUrl: string;
  domain: string;
  category: string;
  summary: string;
  documentNote: string;
  tags: string[];
  text: string;
  note: string;
  color: string;
  highlightedAt: string;
  highlightUrl: string;
  searchText: string;
};

export type SearchResult = HighlightRecord & {
  score: number;
  snippet: string;
};

export type HighlightResponse = {
  documents: GlaspDocument[];
  highlights: HighlightRecord[];
  meta: {
    documentCount: number;
    highlightCount: number;
    cachedAt: string;
    expiresAt: string;
  };
};
