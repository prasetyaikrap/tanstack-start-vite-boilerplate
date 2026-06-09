import { Container } from "@chakra-ui/react";
import type { ReactNode } from "react";
import ResourceProvider from "@/contexts/resource-provider";
import type { AuthProvider } from "@/providers/authentications";
import type { DataProviders } from "@/providers/data/type";
import type { MenuProvider } from "@/providers/menus/type";
import type { RBACProvider } from "@/providers/rbac";
import { UISystemProvider } from "./ui-system-provider";

type AppProvidersProps = {
	children: ReactNode;
	authProvider: AuthProvider;
	dataProviders: DataProviders;
	menuProvider: MenuProvider[];
	rbacProvider: RBACProvider;
};

export default function AppProviders({
	children,
	authProvider,
	dataProviders,
	menuProvider,
	rbacProvider,
}: Readonly<AppProvidersProps>) {
	return (
		<ResourceProvider
			authProvider={authProvider}
			dataProviders={dataProviders}
			menuProvider={menuProvider}
			rbacProvider={rbacProvider}
		>
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
