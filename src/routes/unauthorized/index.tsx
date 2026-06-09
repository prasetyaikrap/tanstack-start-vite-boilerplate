import { createFileRoute } from "@tanstack/react-router";
import { UnauthorizedLayout } from "@/components/layouts/unauthorized-layout";

export const Route = createFileRoute("/unauthorized/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <UnauthorizedLayout />;
}
