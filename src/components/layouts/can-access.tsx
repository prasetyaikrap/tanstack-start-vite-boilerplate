import type { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

type CanAccessProps = {
	children: ReactNode;
	permissions: string[];
};

export function CanAccess({ children, permissions }: CanAccessProps) {
	const { rbacProvider } = usePermission();

	if (permissions.length <= 0) {
		return <>{children}</>;
	}

	if (!rbacProvider.hasPermission(permissions)) {
		return null;
	}

	return <>{children}</>;
}
