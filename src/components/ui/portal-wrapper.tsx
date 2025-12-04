import { Portal } from "@chakra-ui/react";
import type { ReactNode } from "react";

type PortalWrapperProps = {
	portal: boolean;
	children: ReactNode;
};
export function PortalWrapper({ portal, children }: PortalWrapperProps) {
	if (portal) {
		return <Portal>{children}</Portal>;
	}

	return children;
}
