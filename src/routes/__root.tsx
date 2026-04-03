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
import { useTranslation } from "@/hooks/useTranslation";
import TanStackQueryDevtools from "@/providers/tanstack-query/devtools";
import appCss from "@/styles/styles.css?url";
import type { MyRouterContext } from "@/types";
import { generateMetadata } from "@/utils/metadata";

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => {
		const { metas, links } = generateMetadata(baseMetadata);
		return {
			meta: metas,
			links: [...links, { rel: "stylesheet", href: appCss }],
		};
	},

	shellComponent: RootDocument,
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
