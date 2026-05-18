# Recipe Garden — Tech Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library, component model, hooks |
| **Create React App** | Build tooling, dev server, production bundle |
| **Tailwind CSS 3** | Utility-first styling, dark mode (`class` strategy) |
| **Axios** | HTTP client with auth interceptors |
| **Firebase SDK** | Authentication (email/password) + Storage (image uploads) |

## Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express 5** | REST API, routing, middleware |
| **MongoDB** | Document database for recipes |
| **Mongoose 9** | ODM, schemas, validation, aggregation |
| **Firebase Admin** | Verify ID tokens, secure write routes |
| **dotenv** | Environment configuration |
| **CORS** | Cross-origin access for deployed client |

## Architecture

```
Browser (React)
    ↓ HTTPS
    ├── Firebase Auth / Storage (client SDK)
    └── Express API → MongoDB
            ↑
    Firebase Admin (token verification)
```

## Deployment

| Service | Hosts |
|---------|--------|
| **Vercel** | React static build (`client/`) |
| **Render** | Express API (`server/`) |
| **MongoDB Atlas** | Cloud database (recommended for production) |
| **Firebase** | Auth, Storage, service account for API |

## Key features ↔ tech

- **Server-side search & pagination** — Express + Mongoose queries
- **Star ratings** — Embedded `ratings[]` on Recipe documents
- **Image upload** — Firebase Storage + download URLs in MongoDB
- **Shopping list merge** — Client-side ingredient parsing (no extra DB)
- **Cook mode / print / share** — React UI + Web APIs (`navigator.share`, `window.print`)
- **Dark mode** — Tailwind `dark:` + `localStorage`
- **Persistent cart & favorites** — `localStorage` per Firebase `uid`
