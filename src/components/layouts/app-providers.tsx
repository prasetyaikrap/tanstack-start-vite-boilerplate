import { Container } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { ResourceProvider } from "./resource-provider";
import { UISystemProvider } from "./ui-system-provider";

type AppProvidersProps = {
	children: ReactNode;
};

export default function AppProviders({
	children,
}: Readonly<AppProvidersProps>) {
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
