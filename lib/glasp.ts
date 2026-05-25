import type { GlaspDocument } from "@/lib/types";

const GLASP_EXPORT_URL = "https://api.glasp.co/v1/highlights/export";

export class GlaspApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "GlaspApiError";
  }
}

type GlaspExportResponse = {
  count: number;
  nextPageCursor: string | null;
  results: GlaspDocument[];
};

export type GlaspFetch = typeof fetch;

export class GlaspClient {
  constructor(
    private readonly token = process.env.GLASP_ACCESS_TOKEN,
    private readonly fetcher: GlaspFetch = fetch
  ) {}

  async exportHighlights(): Promise<GlaspDocument[]> {
    if (!this.token || this.token === "cole_seu_token_aqui") {
      throw new GlaspApiError("Configure GLASP_ACCESS_TOKEN para carregar seus highlights.");
    }

    const documents: GlaspDocument[] = [];
    let pageCursor: string | null = null;

    do {
      const url = new URL(GLASP_EXPORT_URL);
      if (pageCursor) {
        url.searchParams.set("pageCursor", pageCursor);
      }

      const response = await this.fetcher(url, {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new GlaspApiError(this.messageForStatus(response.status), response.status);
      }

      const data = (await response.json()) as GlaspExportResponse;
      documents.push(...(Array.isArray(data.results) ? data.results : []));
      pageCursor = data.nextPageCursor || null;
    } while (pageCursor);

    return documents;
  }

  private messageForStatus(status: number) {
    if (status === 401) {
      return "Token do Glasp invalido ou expirado. Gere um novo token nas configuracoes do Glasp.";
    }
    if (status === 429) {
      return "Limite de requisicoes do Glasp atingido. Tente novamente em alguns minutos.";
    }
    return `Erro ao consultar a API do Glasp. Status HTTP ${status}.`;
  }
}
