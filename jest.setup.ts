import "@testing-library/jest-dom";
import { server } from "./tests/mocks/server";

// Start MSW for API mocking
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
