"use client";

import { useMemo } from "react";
import { useRouteContext } from "@/hooks/useRouteContext";
import { AuthProvider } from "@/providers/authentications";
import { dataProviders } from "@/providers/data";
import { menus } from "@/providers/menus";
import { RBACProvider } from "@/providers/rbac";
import { ResourceContext, type ResourceContextType } from "./context";

type ResourceProviderProps = {
	children: React.ReactNode;
};

export default function ResourceProvider({ children }: ResourceProviderProps) {
	const { authState } = useRouteContext();

	const value: ResourceContextType = useMemo(() => {
		const authProvider = new AuthProvider();
		const rbacProvider = new RBACProvider({
			userInfo: authState?.user || null,
		});

		return {
			authProvider,
			dataProvider: dataProviders,
			menuProvider: menus,
			rbacProvider,
		};
	}, [authState]);

	return (
		<ResourceContext.Provider value={value}>
			{children}
		</ResourceContext.Provider>
	);
}
