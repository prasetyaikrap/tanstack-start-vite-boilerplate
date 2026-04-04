import { authProvider } from "./auth-provider";
import { mockProvider } from "./mock-provider";

export const dataProviders = {
	auth: authProvider(),
	default: mockProvider(),
};
