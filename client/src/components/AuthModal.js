import React from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { getErrorMessage } from "../utils/errors";

const EMPTY_AUTH = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function AuthModal({ onClose, onToast }) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [authForm, setAuthForm] = React.useState(EMPTY_AUTH);

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          authForm.email,
          authForm.password
        );
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          authForm.email,
          authForm.password
        );
        await updateProfile(userCredential.user, {
          displayName: `${authForm.firstName} ${authForm.lastName}`.trim(),
        });
      }
      setAuthForm(EMPTY_AUTH);
      onClose();
    } catch (error) {
      onToast(getErrorMessage(error));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[28px] w-full max-w-md mx-4 shadow-xl relative">
        <h2 className="text-2xl font-semibold text-pink-500 mb-6">
          {isLogin ? "Login 🍓" : "Sign Up 🍓"}
        </h2>

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="First Name"
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 p-4 rounded-2xl mb-4"
              value={authForm.firstName}
              onChange={(e) =>
                setAuthForm({ ...authForm, firstName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 p-4 rounded-2xl mb-4"
              value={authForm.lastName}
              onChange={(e) =>
                setAuthForm({ ...authForm, lastName: e.target.value })
              }
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 p-4 rounded-2xl mb-4"
          value={authForm.email}
          onChange={(e) =>
            setAuthForm({ ...authForm, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 p-4 rounded-2xl mb-6"
          value={authForm.password}
          onChange={(e) =>
            setAuthForm({ ...authForm, password: e.target.value })
          }
        />

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-pink-500 text-white py-3 rounded-full hover:bg-pink-400 transition"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

        <p
          className="text-sm text-center text-gray-500 mt-4 cursor-pointer"
          onClick={() => {
            setIsLogin(!isLogin);
            setAuthForm(EMPTY_AUTH);
          }}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 text-xl"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
