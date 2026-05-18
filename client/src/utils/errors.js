export function getErrorMessage(error) {
  if (!error) return "Something went wrong";

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Cannot reach the server. Run: cd server && npm run dev — then check http://localhost:5001/api/health (port 5001 avoids macOS AirPlay on 5000)";
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (status === 503 && data?.message) {
    return data.message;
  }

  if (data?.message) return data.message;
  if (data?.error) return data.error;

  const code = error.code || error.message || "";

  if (code.includes("auth/network-request-failed")) {
    return "Firebase network error. Check your internet connection and that Email/Password sign-in is enabled in Firebase Console → Authentication → Sign-in method.";
  }
  if (code.includes("auth/email-already-in-use")) {
    return "That email is already registered. Try logging in instead.";
  }
  if (code.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code.includes("auth/weak-password")) {
    return "Password should be at least 6 characters.";
  }
  if (code.includes("auth/invalid-credential")) {
    return "Wrong email or password.";
  }

  return error.message || "Something went wrong";
}
