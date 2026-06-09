"use client";

import { useMemo } from "react";
import type { AuthProvider } from "@/providers/authentications";
import type { DataProviders } from "@/providers/data/type";
import type { MenuProvider } from "@/providers/menus/type";
import type { RBACProvider } from "@/providers/rbac";
import { ResourceContext, type ResourceContextType } from "./context";

type ResourceProviderProps = {
	children: React.ReactNode;
	authProvider: AuthProvider;
	dataProviders: DataProviders;
	menuProvider: MenuProvider[];
	rbacProvider: RBACProvider;
};

export default function ResourceProvider({
	children,
	authProvider,
	dataProviders,
	menuProvider,
	rbacProvider,
}: ResourceProviderProps) {
	const value: ResourceContextType = useMemo(() => {
		return {
			authProvider,
			dataProvider: dataProviders,
			menuProvider,
			rbacProvider,
		};
	}, [authProvider, dataProviders, menuProvider, rbacProvider]);

	return (
		<ResourceContext.Provider value={value}>
			{children}
		</ResourceContext.Provider>
	);
}
