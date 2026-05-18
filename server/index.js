const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { isDbConnected } = require("./config/db");
const recipeRoutes = require("./routes/recipeRoutes");
const { initFirebaseAdmin } = require("./middleware/auth");

const app = express();

connectDB();

const firebaseReady = initFirebaseAdmin();
if (firebaseReady) {
  console.log("Firebase Admin initialized");
} else {
  console.warn(
    "Firebase Admin not configured — add FIREBASE_SERVICE_ACCOUNT to server/.env for add/edit/delete recipes."
  );
}

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

const isDev = process.env.NODE_ENV !== "production";

function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
    origin
  );
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      if (isDev && isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use((err, req, res, next) => {
  if (err.message?.includes("CORS")) {
    return res.status(403).json({ message: err.message });
  }
  next(err);
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    mongo: isDbConnected() ? "connected" : "disconnected",
    firebaseAdmin: firebaseReady ? "configured" : "missing",
  });
});

app.get("/api/health", (_req, res) => {
  const devBypass =
    process.env.DEV_AUTH_BYPASS === "true" &&
    process.env.NODE_ENV !== "production";

  res.json({
    ok: isDbConnected() && (firebaseReady || devBypass),
    mongo: isDbConnected(),
    firebaseAdmin: firebaseReady,
    devAuthBypass: devBypass,
    hint: !isDbConnected()
      ? "Start the server: cd server && npm run dev"
      : !firebaseReady && !devBypass
        ? "Set FIREBASE_SERVICE_ACCOUNT in server/.env (or DEV_AUTH_BYPASS=true for local dev)"
        : null,
  });
});

app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
