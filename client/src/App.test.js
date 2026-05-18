import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./components/StatsBar", () => () => null);

jest.mock("./api/client", () => ({
  get: jest.fn((url) => {
    if (String(url).includes("stats")) {
      return Promise.resolve({
        data: { total: 0, topCategories: [], avgCookingTime: null },
      });
    }
    return Promise.resolve({
      data: {
        recipes: [],
        pagination: { page: 1, limit: 9, total: 0, totalPages: 1 },
      },
    });
  }),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock("./firebase", () => ({
  auth: {},
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback(null);
    return () => {};
  }),
  signOut: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

test("renders Recipe Garden heading", async () => {
  render(<App />);
  expect(
    await screen.findByRole("heading", { name: /recipe garden/i })
  ).toBeInTheDocument();
});
