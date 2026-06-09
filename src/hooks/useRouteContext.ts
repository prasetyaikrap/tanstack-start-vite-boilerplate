import {
	useRouterState,
	useRouteContext as useTanstackRouteContext,
} from "@tanstack/react-router";

export function useRouteContext() {
	const matches = useRouterState({ select: (state) => state.matches });

	const routeContext = useTanstackRouteContext({
		from: matches.at(-1)?.routeId ?? "__root__",
	});

	return routeContext;
}
