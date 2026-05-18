import { useEffect, useState } from "react";
import axios from "axios";

const API_ROOT =
  process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5001";

export default function SystemStatusBanner() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${API_ROOT}/api/health`, {
          timeout: 4000,
        });
        setStatus(res.data);
      } catch {
        setStatus({
          ok: false,
          mongo: false,
          firebaseAdmin: false,
          hint: "Server is not running. Run: cd server && npm run dev",
        });
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!status || status.ok) return null;

  if (status.mongo && status.devAuthBypass && !status.firebaseAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto mb-6 relative z-20 rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 p-4 text-sm text-amber-900 dark:text-amber-100">
      <p className="font-semibold mb-1">⚠️ Setup needed</p>
      <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
        {!status.mongo && (
          <li>
            <strong>MongoDB</strong> is not connected — start local MongoDB or set{" "}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">MONGO_URI</code>{" "}
            in{" "}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">server/.env</code>{" "}
            to a MongoDB Atlas URL.
          </li>
        )}
        {status.mongo && !status.firebaseAdmin && (
          <li>
            <strong>Firebase Admin</strong> is missing — add{" "}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">
              FIREBASE_SERVICE_ACCOUNT
            </code>{" "}
            to{" "}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">server/.env</code>{" "}
            to add or edit recipes.
          </li>
        )}
        {status.hint && <li>{status.hint}</li>}
      </ul>
    </div>
  );
}
