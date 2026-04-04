"use client";

import { createContext, useContext, useMemo } from "react";
import { AuthProvider } from "@/providers/authentications";
import { dataProviders } from "@/providers/data";
import type { DataProviders } from "@/providers/data/type";

type ResourceContextType = {
	authProvider: AuthProvider;
	dataProvider: DataProviders;
};

const ResourceContext = createContext<ResourceContextType | null>(null);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
	const value: ResourceContextType = useMemo(() => {
		const authProvider = new AuthProvider();
		return { authProvider, dataProvider: dataProviders };
	}, []);

	return (
		<ResourceContext.Provider value={value}>
			{children}
		</ResourceContext.Provider>
	);
}

export function useResourceContext() {
	const context = useContext(ResourceContext);
	if (!context) {
		throw new Error("useResourceContext must be used within ResourceProvider");
	}
	return context;
}
