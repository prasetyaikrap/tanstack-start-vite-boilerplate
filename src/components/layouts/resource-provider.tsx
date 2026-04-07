"use client";

import { createContext, useContext, useMemo } from "react";
import { AuthProvider } from "@/providers/authentications";
import { dataProviders } from "@/providers/data";
import type { DataProviders } from "@/providers/data/type";
import { MenuProvider } from "@/providers/menus/type";

type ResourceContextType = {
  authProvider: AuthProvider;
  dataProvider: DataProviders;
  menuProvider: MenuProvider[];
};

const ResourceContext = createContext<ResourceContextType | null>(null);

type ResourceProviderProps = {
  children: React.ReactNode;
  menuProvider?: MenuProvider[];
};

export function ResourceProvider({
  children,
  menuProvider = [],
}: ResourceProviderProps) {
  const value: ResourceContextType = useMemo(() => {
    const authProvider = new AuthProvider();
    return { authProvider, dataProvider: dataProviders, menuProvider };
  }, [menuProvider]);

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
