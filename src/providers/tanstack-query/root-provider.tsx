import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { MyRouterContext } from "@/types";
import { AuthProvider } from "../authentications";
import { dataProviders } from "../data";
import { menus } from "../menus";
import { RBACProvider } from "../rbac";

export function getContext(): MyRouterContext {
	const queryClient = new QueryClient();
	const authProvider = new AuthProvider({
		authDataProvider: dataProviders.auth,
	});
	const rbacProvider = new RBACProvider({
		userInfo: null,
	});

	return {
		queryClient,
		authProvider,
		menuProvider: menus,
		dataProviders,
		rbacProvider,

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
