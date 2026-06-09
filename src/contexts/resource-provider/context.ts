import { createContext, useContext } from "react";
import type { AuthProvider } from "@/providers/authentications";
import type { DataProviders } from "@/providers/data/type";
import type { MenuProvider } from "@/providers/menus/type";
import type { RBACProvider } from "@/providers/rbac";

export type ResourceContextType = {
	authProvider: AuthProvider;
	dataProvider: DataProviders;
	menuProvider: MenuProvider[];
	rbacProvider: RBACProvider;
};

export const ResourceContext = createContext<ResourceContextType | null>(null);

export function useResourceContext() {
	const context = useContext(ResourceContext);
	if (!context) {
		throw new Error("useResourceContext must be used within ResourceProvider");
	}
	return context;
}
