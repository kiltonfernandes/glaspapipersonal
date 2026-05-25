"use client";

import { useEffect, useMemo, useState } from "react";
import type { SearchResult } from "@/lib/types";

type SearchPayload = {
  results: SearchResult[];
  facets: {
    tags: string[];
    domains: string[];
    colors: string[];
  };
  meta: {
    documentCount: number;
    highlightCount: number;
    cachedAt: string;
    expiresAt: string;
  };
};

const emptyPayload: SearchPayload = {
  results: [],
  facets: { tags: [], domains: [], colors: [] },
  meta: { documentCount: 0, highlightCount: 0, cachedAt: "", expiresAt: "" }
};

export function GlaspSearchApp() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [domain, setDomain] = useState("");
  const [color, setColor] = useState("");
  const [payload, setPayload] = useState<SearchPayload>(emptyPayload);
  const [contextText, setContextText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const searchUrl = useMemo(() => {
    const params = new URLSearchParams({ limit: "30" });
    if (query.trim()) params.set("q", query.trim());
    if (tag) params.set("tag", tag);
    if (domain) params.set("domain", domain);
    if (color) params.set("color", color);
    return `/api/search?${params.toString()}`;
  }, [query, tag, domain, color]);

  const contextUrl = useMemo(() => {
    const params = new URLSearchParams({ limit: "12" });
    if (query.trim()) params.set("q", query.trim());
    if (tag) params.set("tag", tag);
    if (domain) params.set("domain", domain);
    if (color) params.set("color", color);
    return `/api/context?${params.toString()}`;
  }, [query, tag, domain, color]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const [searchResponse, contextResponse] = await Promise.all([
          fetch(searchUrl, { signal: controller.signal }),
          fetch(contextUrl, { signal: controller.signal })
        ]);

        if (!searchResponse.ok) {
          const body = await searchResponse.json().catch(() => ({}));
          throw new Error(body.error || "Nao foi possivel buscar seus highlights.");
        }

        setPayload((await searchResponse.json()) as SearchPayload);
        setContextText(await contextResponse.text());
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Erro inesperado.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [searchUrl, contextUrl]);

  async function refresh() {
    setRefreshing(true);
    setError("");

    try {
      const response = await fetch("/api/refresh", { method: "POST" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Nao foi possivel atualizar o cache.");
      }
      const searchResponse = await fetch(searchUrl);
      setPayload((await searchResponse.json()) as SearchPayload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado.");
    } finally {
      setRefreshing(false);
    }
  }

  async function copyContext() {
    await navigator.clipboard.writeText(contextText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="app-shell">
      <section className="search-band">
        <div className="search-header">
          <div>
            <p className="eyebrow">Glasp API Personal</p>
            <h1>Encontre a agulha nos seus highlights.</h1>
          </div>
          <button className="icon-button" onClick={refresh} disabled={refreshing} title="Atualizar cache">
            {refreshing ? "..." : "↻"}
          </button>
        </div>

        <label className="search-box">
          <span>Busca</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Digite uma ideia, termo, autor, tag ou trecho..."
          />
        </label>

        <div className="filters">
          <Select label="Tag" value={tag} onChange={setTag} options={payload.facets.tags} />
          <Select label="Domínio" value={domain} onChange={setDomain} options={payload.facets.domains} />
          <Select label="Cor" value={color} onChange={setColor} options={payload.facets.colors} />
        </div>

        <div className="stats">
          <span>{payload.meta.documentCount} documentos</span>
          <span>{payload.meta.highlightCount} highlights</span>
          {payload.meta.cachedAt ? <span>cache: {new Date(payload.meta.cachedAt).toLocaleTimeString("pt-BR")}</span> : null}
        </div>
      </section>

      {error ? <div className="error-panel">{error}</div> : null}

      <section className="content-grid">
        <div className="results-panel">
          <div className="panel-title">
            <h2>Resultados</h2>
            <span>{loading ? "buscando..." : `${payload.results.length} itens`}</span>
          </div>

          <div className="result-list">
            {payload.results.map((result) => (
              <article className="result-card" key={result.id}>
                <div className="card-meta">
                  <span className={`color-dot color-${result.color || "default"}`} />
                  <span>{result.domain || "sem dominio"}</span>
                  {result.highlightedAt ? <span>{new Date(result.highlightedAt).toLocaleDateString("pt-BR")}</span> : null}
                </div>
                <h3>{result.title}</h3>
                <p>{result.snippet}</p>
                {result.note ? <blockquote>{result.note}</blockquote> : null}
                <div className="tag-row">
                  {result.tags.slice(0, 6).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div className="links">
                  {result.url ? (
                    <a href={result.url} target="_blank" rel="noreferrer">
                      Abrir fonte
                    </a>
                  ) : null}
                  {result.highlightUrl || result.glaspUrl ? (
                    <a href={result.highlightUrl || result.glaspUrl} target="_blank" rel="noreferrer">
                      Abrir no Glasp
                    </a>
                  ) : null}
                </div>
              </article>
            ))}

            {!loading && !payload.results.length ? (
              <div className="empty-state">Nada encontrado. Tente uma palavra relacionada, tag, domínio ou trecho aproximado.</div>
            ) : null}
          </div>
        </div>

        <aside className="context-panel">
          <div className="panel-title">
            <h2>Contexto para IA</h2>
            <button onClick={copyContext} disabled={!contextText}>
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <textarea readOnly value={contextText} />
        </aside>
      </section>
    </main>
  );
}

function Select({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
