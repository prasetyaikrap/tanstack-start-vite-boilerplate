import { authProvider } from "./auth-provider";

export const dataProviders = {
  auth: authProvider(),
  default: authProvider(),
};
