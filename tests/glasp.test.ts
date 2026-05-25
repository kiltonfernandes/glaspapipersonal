import { describe, expect, it, vi } from "vitest";
import { GlaspApiError, GlaspClient } from "@/lib/glasp";
import { makeDocument } from "./fixtures";

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  } as Response;
}

describe("GlaspClient", () => {
  it("busca todas as paginas usando pageCursor", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({ count: 1, nextPageCursor: "next", results: [makeDocument()] }))
      .mockResolvedValueOnce(response({ count: 1, nextPageCursor: null, results: [makeDocument({ id: "doc-2" })] }));

    const documents = await new GlaspClient("token", fetcher).exportHighlights();

    expect(documents).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(String(fetcher.mock.calls[1][0])).toContain("pageCursor=next");
  });

  it("falha quando o token nao existe", async () => {
    await expect(new GlaspClient("").exportHighlights()).rejects.toThrow("Configure GLASP_ACCESS_TOKEN");
  });

  it("traduz erro 401", async () => {
    const fetcher = vi.fn().mockResolvedValue(response({}, 401));

    await expect(new GlaspClient("bad-token", fetcher).exportHighlights()).rejects.toMatchObject({
      status: 401,
      message: expect.stringContaining("Token do Glasp invalido")
    } satisfies Partial<GlaspApiError>);
  });

  it("traduz erro 429", async () => {
    const fetcher = vi.fn().mockResolvedValue(response({}, 429));

    await expect(new GlaspClient("token", fetcher).exportHighlights()).rejects.toMatchObject({
      status: 429,
      message: expect.stringContaining("Limite de requisicoes")
    } satisfies Partial<GlaspApiError>);
  });
});
