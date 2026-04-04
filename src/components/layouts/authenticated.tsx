import { redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useResourceContext } from "./resource-provider";

type AuthenticatedProps = {
	children: ReactNode;
	resource?: string;
	redirectTo?: string;
};

export async function Authenticated({
	children,
	resource = "",
	redirectTo,
}: AuthenticatedProps) {
	const { authProvider } = useResourceContext();
	const { authenticated, redirectTo: authRedirect } = await authProvider.check({
		resource,
	});

	if (!authenticated) {
		redirect({ to: redirectTo ?? authRedirect ?? "/login" });
	}

	return <>{children}</>;
}
