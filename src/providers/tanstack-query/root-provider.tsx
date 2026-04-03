import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { MyRouterContext } from "@/types";

export function getContext(): MyRouterContext {
	const queryClient = new QueryClient();
	return {
		queryClient,
		permissions: [],
		authState: {
			isAuthenticated: false,
		},
	};
}

export function Provider({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
