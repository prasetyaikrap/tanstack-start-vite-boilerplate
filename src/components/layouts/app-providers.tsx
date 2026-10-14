import { Container } from "@chakra-ui/react";
import type { ReactNode } from "react";
import ResourceProvider from "@/contexts/resource-provider";
import { usePersistedStoresHydration } from "@/providers/zustand";
import { UISystemProvider } from "./ui-system-provider";

type AppProvidersProps = {
	children: ReactNode;
};

export default function AppProviders({
	children,
}: Readonly<AppProvidersProps>) {
	// Loads saved zustand state after the first render, so it matches the server-rendered HTML
	usePersistedStoresHydration();

	return (
		<ResourceProvider>
			<UISystemProvider>
				<Container
					minHeight="100vh"
					maxWidth="2560px"
					px="0"
					transition="all ease .5s"
					_light={{
						bg: "white",
					}}
				>
					{children}
				</Container>
			</UISystemProvider>
		</ResourceProvider>
	);
}
