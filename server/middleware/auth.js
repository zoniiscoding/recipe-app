const admin = require("firebase-admin");

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return true;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return false;
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    return true;
  } catch (error) {
    console.error("Firebase Admin init failed:", error.message);
    return false;
  }
}

async function requireAuth(req, res, next) {
  const devBypass =
    process.env.DEV_AUTH_BYPASS === "true" &&
    process.env.NODE_ENV !== "production";

  if (!initFirebaseAdmin()) {
    if (devBypass) {
      req.user = { uid: "local-dev-user", email: "dev@recipe.local" };
      return next();
    }
    return res.status(503).json({
      message:
        "Add FIREBASE_SERVICE_ACCOUNT to server/.env — or set DEV_AUTH_BYPASS=true for local testing only.",
    });
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const token = header.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { requireAuth, initFirebaseAdmin };
