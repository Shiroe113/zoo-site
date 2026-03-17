# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**300 Улюбленців** — a Ukrainian-language pet supply e-commerce SPA. Zero dependencies, no build step, no backend. Open `index.html` directly in a browser or serve with any static file server.

```bash
# Quick local server options (required — fetch() won't work via file://)
python -m http.server 8000
npx http-server
```

## Architecture

Four files:

- `index.html` — markup; mixes inline `onclick` handlers and elements targeted by `addEventListener`
- `style.css` — design system via CSS custom properties; breakpoints at 768px and 480px
- `app.js` — all application logic
- `products.json` — product catalog (fetched at runtime via `fetch()`)

### app.js structure

| Section | Responsibility |
|---------|---------------|
| State | `PRODUCTS` (populated from fetch), `cart`, `activeCategory`, `activeType`, `searchQuery` |
| Init / DOMContentLoaded | Renders cart, binds categories, fetches `products.json`, calls `renderProducts()` |
| Categories & Types | `.cat-card` buttons set `activeCategory`; `.type-btn` buttons set `activeType` |
| Search | `handleSearch()` — filters by name + description, case-insensitive, resets category to "all" |
| `renderProducts()` | Filters by category + type + search, sorts (price-asc/price-desc/name), renders grid via `productCardHTML()` |
| Product modal | `openModal(id)` / `closeModal()` — full-detail overlay per product |
| Cart | `addToCart`, `changeQty`, `saveCart`, `renderCart`, `toggleCart` — persists to `localStorage` key `zm_cart` |
| Checkout modal | `checkout()` / `closeCheckout()` / `submitCheckout()` — order summary form, mock submission |
| Contact form | `submitForm()` — mock; `APPS_SCRIPT_URL` placeholder for Google Apps Script integration |
| Toast | `showToast(message)` — 2.8s auto-dismiss |

### Data flow

User action → handler in `app.js` → update state → call render function → set `innerHTML` → optionally write to `localStorage`.

### Product schema (`products.json`)

```json
{ "id": 1, "name": "...", "desc": "...", "price": 299, "oldPrice": 399,
  "cat": "dogs", "type": "food", "emoji": "🦴", "image": "filename.jpg",
  "inStock": true, "badge": "Хіт" }
```

- `cat`: `dogs | cats | birds | fish | rodents`
- `image` (optional): served from `images/`; falls back to `emoji` if absent
- `inStock: false` renders "Немає в наявності" badge and disables add-to-cart
- `oldPrice` renders a strikethrough price

### Design tokens (CSS custom properties)

- Primary: `#4caf50` (green)
- Accent: `#ff7043` (orange)
- Defined on `:root` in `style.css`

## Key constraints

- **Requires a local server** — `fetch("products.json")` fails over `file://`.
- **No build process** — changes take effect immediately on browser reload.
- **No backend** — checkout and contact forms are mocks; cart persists in `localStorage` only. `APPS_SCRIPT_URL` in `app.js` is a placeholder for optional Google Apps Script integration.
- **Mixed event binding** — category/type/search use `addEventListener`; product cards and cart items use inline `onclick` attributes in generated HTML.
- **All UI text is Ukrainian.**
