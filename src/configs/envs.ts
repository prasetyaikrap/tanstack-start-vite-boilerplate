export const ENVS = {
	APP_ENV: import.meta.env.VITE_APP_ENV || "development",
	APP_HOST: import.meta.env.VITE_APP_HOST || "http://localhost:3000",
	APP_VERSION: import.meta.env.VITE_APP_VERSION ?? "dev-environment-v0.0.0",
	APP_ID: import.meta.env.VITE_APP_ID ?? "TANSTACK-VITE-BOILERPLATE",
	APP_USE_MOCK: Boolean(import.meta.env.VITE_APP_USE_MOCK === "true") ?? false,

	APP_AUTH_SERVICE_HOST:
		import.meta.env.VITE_APP_AUTH_SERVICE_HOST ?? "http://localhost:4000",
	APP_MOCK_SERVICE_HOST: "https://jsonplaceholder.typicode.com/",

	GOOGLE_ADSENSE_ACCOUNT: import.meta.env.VITE_APP_GOOGLE_ADSENSE_ACCOUNT ?? "",
};
