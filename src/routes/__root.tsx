import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { baseMetadata } from "@/configs/metadata";
import "@/providers/i18n";
import AppProviders from "@/components/layouts/app-providers";
import NotFoundLayout from "@/components/ui/not-found";
import { ENVS } from "@/configs/envs";
import { useTranslation } from "@/hooks/useTranslation";
import TanStackQueryDevtools from "@/providers/tanstack-query/devtools";
import appCss from "@/styles/styles.css?url";
import type { MyRouterContext } from "@/types";
import {
	generateGoogleAdsenseMetadata,
	generateMetadata,
} from "@/utils/metadata";

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => {
		const { metas, links } = generateMetadata(baseMetadata);
		const googleAdsenseScript = generateGoogleAdsenseMetadata(
			ENVS.GOOGLE_ADSENSE_ACCOUNT,
		);
		return {
			meta: metas,
			links: [...links, { rel: "stylesheet", href: appCss }],
			scripts: [...googleAdsenseScript],
		};
	},

	shellComponent: RootDocument,
	notFoundComponent: NotFoundLayout,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { getLocale } = useTranslation();
	return (
		<html lang={getLocale()} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<AppProviders>{children}</AppProviders>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
