# MakanAgent SG 🍜

Chat your craving, get Singapore dining picks grounded in **Qloo Taste AI**. Qloo Agentic Hackathon entry.

## Try it
Live: `https://mohammadharrisbin.github.io/makan-agent/` (after Pages deploy)
Local: open `index.html`. Paste your Qloo hackathon API key via 🔑 (stored in browser only), or tick Demo mode.

## How it works
Cuisine chip → Qloo `/v2/tags` resolve → `/v2/insights` (`filter.type=urn:entity:place`) → ranked place cards. Key sent as `X-Api-Key` header, never committed. Offline demo fallback included.

## License
MIT
