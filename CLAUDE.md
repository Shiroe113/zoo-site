# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**300 Улюбленців** — a Ukrainian-language pet supply e-commerce SPA. Zero dependencies, no build step, no backend. Open `index.html` directly in a browser or serve with any static file server.

```bash
# Quick local server options
python -m http.server 8000
npx http-server
```

## Architecture

Three files, total ~32KB:

- `index.html` — markup and inline `onclick` event handlers
- `style.css` — design system via CSS custom properties; breakpoints at 768px and 480px
- `app.js` — all application logic

### app.js structure

| Lines | Responsibility |
|-------|---------------|
| 1–36 | `PRODUCTS` array (24 hardcoded products) and state variables (`cart`, `activeCategory`, `searchQuery`) |
| 50–62 | Category filter buttons |
| 64–79 | Real-time search (name + description, case-insensitive) |
| 81–128 | `renderProducts()` — generates product grid HTML; supports 4 sort modes |
| 130–210 | Cart: add/remove/update quantity, localStorage persistence (`zm_cart`), sidebar toggle |
| 211–216 | Contact form mock submission |
| 218–226 | Toast notifications (2.8s auto-dismiss) |

### Data flow

User action → handler in `app.js` → update state → call render function → set `innerHTML` → optionally write to `localStorage`.

### Design tokens (CSS custom properties)

- Primary: `#4caf50` (green)
- Accent: `#ff7043` (orange)
- Defined on `:root` in `style.css`

## Key constraints

- **No build process** — changes take effect immediately on browser reload.
- **No backend** — form submission is a mock; cart persists in `localStorage` only.
- **Inline handlers** — event handlers are `onclick=""` attributes in HTML, not JS event listeners.
- **Emoji as images** — products use Unicode emojis; there are no image assets.
- **All UI text is Ukrainian.**
