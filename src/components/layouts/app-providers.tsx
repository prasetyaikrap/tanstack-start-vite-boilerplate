"use client";

import { Container } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { UISystemProvider } from "@/components/ui/provider";

type AppProvidersProps = {
	children: ReactNode;
};

const queryClient = new QueryClient();

export default function AppProviders({
	children,
}: Readonly<AppProvidersProps>) {
	return (
		<QueryClientProvider client={queryClient}>
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
		</QueryClientProvider>
	);
}
