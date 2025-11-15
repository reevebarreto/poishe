import "@testing-library/jest-dom";
import { server } from "./server";

// Start MSW before all tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
