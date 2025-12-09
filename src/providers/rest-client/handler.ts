import type { RestRoute, RestRouter } from "./type";

export function contract<T extends Record<string, RestRoute>>(
	routes: RestRouter<T>,
) {
	return routes;
}
