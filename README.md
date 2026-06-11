# RawVoice

Paste AI-generated or stiff text. Get back natural, human-sounding writing.

No new content is added — it only fixes grammar, tone, and flow using the [blader/humanizer](https://github.com/blader/humanizer) skill as the AI prompt.

## Stack

- [TanStack Start](https://tanstack.com/start) — React full-stack framework
- [Cloudflare Workers](https://workers.cloudflare.com/) — deployment target
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) — `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- [Cloudflare KV](https://developers.cloudflare.com/kv/) — rate limiting storage

## How it works

1. User pastes text into the left textarea
2. Clicks **Make It Human**
3. A TanStack Start server function sends the text to Cloudflare Workers AI with the full humanizer skill as the system prompt
4. The rewritten text appears on the right

The humanizer skill detects and fixes 33 AI writing patterns including em dash overuse, AI vocabulary words ("delve", "tapestry", "vibrant"), passive voice, rule-of-three lists, sycophantic openers, and more.

## Rate limiting

100 total requests per day (global), tracked in Cloudflare KV. Resets at midnight UTC. Free tier, zero cost.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Cloudflare AI and KV bindings are proxied to Cloudflare's API during local dev. You need to be logged in:

```bash
npx wrangler login
```

## Deploy

```bash
npm run deploy
```

## Bindings (wrangler.jsonc)

| Binding | Type | Purpose |
|---------|------|---------|
| `AI` | Workers AI | Text humanization |
| `RATE_LIMIT` | KV Namespace | Daily request counter |

To recreate the KV namespace on a new machine:

```bash
npx wrangler kv namespace create RATE_LIMIT
```

Paste the returned `id` into `wrangler.jsonc`.
