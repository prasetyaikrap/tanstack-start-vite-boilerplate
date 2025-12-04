import type { Metadata } from "@/types";
import { ENVS } from "./envs";

export const baseMetadata: Metadata = {
	title: "Tanstack Start Vite Boilerplate",
	description: "Frontend Boilerplate with Tanstack Start Vite and Chakra UI",
	applicationName: "Tanstack Start Vite Boilerplate",
	creator: "Prasetya Ikra Priyadi",
	publisher: "Prasetya Ikra Priyadi",
	authors: [
		{
			name: "Prasetya Ikra Priyadi",
			url: "https://www.linkedin.com/in/prasetya-ikrapriyadi",
		},
	],
	alternates: {
		canonical: ENVS.APP_HOST,
	},
	icons: `${ENVS.APP_HOST}/favicon.ico`,
	openGraph: {
		title: "Tanstack Start Vite Boilerplate",
		description: "Frontend Boilerplate with Tanstack Start Vite and Chakra UI",
		url: ENVS.APP_HOST,
		siteName: "Tanstack Start Vite Boilerplate",
		emails: ["prasetya.ikrapriyadi@gmail.com"],
		locale: "id_ID",
		alternateLocale: ["en_US"],
		countryName: "Indonesia",
		type: "website",
		images: [`${ENVS.APP_HOST}/main.png`],
	},
	twitter: {
		card: "summary_large_image",
		title: "Tanstack Start Vite Boilerplate",
		description: "Frontend Boilerplate with Tanstack Start Vite and Chakra UI",
	},
	category: "technology",
	robots: "index, follow",
	charSet: "utf-8",
	viewport: "width=device-width, initial-scale=1",
};
