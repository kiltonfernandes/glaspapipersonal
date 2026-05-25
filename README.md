# Glasp API Personal

Web app pessoal para buscar highlights do Glasp e gerar contexto pronto para usar em ChatGPT, Codex, Gemini ou qualquer outra IA.

## O que ele faz

- Busca seus highlights pela API oficial do Glasp.
- Mantem um cache em memoria por 15 minutos.
- Pesquisa por titulo, URL, dominio, tags, resumo, nota e texto do highlight.
- Gera um bloco de contexto copiavel para IA.
- Expoe endpoints JSON/texto para automacoes.

## Aviso de privacidade

Este projeto nao implementa login. Se voce publicar na Vercel sem protecao adicional, qualquer pessoa com a URL podera pesquisar seus highlights. O `GLASP_ACCESS_TOKEN` fica protegido no servidor e nunca e enviado ao navegador.

## Rodando localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env.local`:

```bash
GLASP_ACCESS_TOKEN=seu_token_do_glasp
```

3. Rode o app:

```bash
npm run dev
```

4. Abra `http://localhost:3000`.

## Deploy na Vercel

1. Importe este repositorio na Vercel.
2. Em `Project Settings` > `Environment Variables`, adicione:

```bash
GLASP_ACCESS_TOKEN=seu_token_do_glasp
```

3. Marque os ambientes em que voce quer usar o token, normalmente `Production`, `Preview` e `Development`.
4. Faca um novo deploy. Variaveis adicionadas depois do deploy nao alteram deployments antigos.

> GitHub Secrets nao sao enviados automaticamente para a Vercel. Se a Vercel estiver conectada ao repo pelo painel, configure `GLASP_ACCESS_TOKEN` tambem na propria Vercel.

## Endpoints

### `GET /api/highlights`

Retorna documentos normalizados, highlights e metadados do cache.

### `GET /api/search?q=termo&limit=20`

Retorna highlights ranqueados. Parametros opcionais:

- `tag`
- `domain`
- `color`
- `limit`, entre 1 e 100

### `GET /api/context?q=termo&limit=12`

Retorna texto puro com os melhores highlights formatados para colar em uma IA.

### `POST /api/refresh`

Limpa o cache em memoria e recarrega os dados do Glasp.

### `GET /api/health`

Mostra se `GLASP_ACCESS_TOKEN` existe no runtime do servidor, sem revelar o valor do token.

## Scripts

```bash
npm run dev
npm run build
npm run test
```

## Limites do MVP

- A busca e textual/fuzzy, nao semantica por embeddings.
- O cache e em memoria; em serverless ele pode ser perdido quando a funcao reiniciar.
- Sem banco externo para manter custo zero.
