# Recipe Garden 🍓

React + Express + MongoDB recipe app with Firebase Auth & Storage.

## Features

- Recipe CRUD with **Firebase Storage** image upload or URL
- **Server-side** search, filters, sort, and pagination
- **Star ratings** (1–5) with averages on cards
- **Smart shopping list** — add from any recipe, merge duplicate ingredients (e.g. `2 cups` + `1 cup` → `3 cups flour`)
- **Servings scaler** on recipe detail
- **Cook mode** — step-by-step fullscreen instructions
- **Share** (native or copy link) & **print** recipes
- **My recipes** / **Favorites** / **All** tabs
- **Stats dashboard** (total recipes, avg cook time, top categories)
- **Dark mode** + skeleton loaders
- Deploy-ready for **Vercel** (client) + **Render** (API)

See [TECH_STACK.md](./TECH_STACK.md) for the full technology breakdown.

## Troubleshooting “Network Error”

1. **Server terminal** — must show `Server running on http://localhost:5001` (we use **5001** because macOS AirPlay uses port **5000**).
2. **Restart the React app** after changing `.env` (stop `npm start` and run again).
3. **MongoDB** — if you see `connect ECONNREFUSED 127.0.0.1:27017`, the server auto-starts an in-memory DB for dev. Or install MongoDB / use Atlas:
   - Install & start: `brew install mongodb-community && brew services start mongodb-community`
   - Or use free [MongoDB Atlas](https://www.mongodb.com/atlas) and set `MONGO_URI` in `server/.env`
3. **Add recipe** — needs `FIREBASE_SERVICE_ACCOUNT` in `server/.env` (Firebase Console → Service accounts → private key JSON).
4. **Sign up** — uses Firebase directly; enable **Email/Password** in Firebase Console → Authentication → Sign-in method.
5. Open http://localhost:5001/api/health — should show `"mongo": true`. With `DEV_AUTH_BYPASS=true` in `server/.env`, you can add recipes without Firebase Admin (local only).

## Local setup

### Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

`server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/recipeDB
PORT=5000
CLIENT_URL=http://localhost:3000
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Client

```bash
cd client
cp .env.example .env
npm install
npm start
```

`client/.env` needs `REACT_APP_API_URL=http://localhost:5000/api` and Firebase web config keys.

### Firebase Storage (image upload)

1. Firebase Console → **Storage** → Get started.
2. Deploy rules from `firebase-storage.rules.example` (Storage → Rules).
3. Ensure `REACT_APP_FIREBASE_STORAGE_BUCKET` matches your bucket in `.env`.

## Deploy

### API on Render

1. Push this repo to GitHub.
2. [Render](https://render.com) → **New Web Service** → connect repo.
3. Render detects `render.yaml` (root dir `server`).
4. Set environment variables:
   - `MONGO_URI` — MongoDB Atlas connection string
   - `FIREBASE_SERVICE_ACCOUNT` — full service account JSON (single line)
   - `CLIENT_URL` — your Vercel URL, e.g. `https://your-app.vercel.app`
5. Deploy. Note the API URL (e.g. `https://recipe-garden-api.onrender.com`).

### Client on Vercel

1. [Vercel](https://vercel.com) → **Add New Project** → import repo.
2. Set **Root Directory** to `client`.
3. Environment variables:
   - `REACT_APP_API_URL` = `https://your-api.onrender.com/api`
   - All `REACT_APP_FIREBASE_*` keys from Firebase web app settings
4. Deploy.

Update Render `CLIENT_URL` to your final Vercel domain if needed.

## API

`GET /api/recipes?page=1&limit=9&title=&ingredient=&category=&difficulty=&maxTime=&favoriteIds=id1,id2`

Response:

```json
{
  "recipes": [],
  "pagination": { "page": 1, "limit": 9, "total": 0, "totalPages": 1 }
}
```
