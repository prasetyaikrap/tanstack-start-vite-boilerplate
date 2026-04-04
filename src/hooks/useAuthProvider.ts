import { useResourceContext } from "@/components/layouts/resource-provider";

export function useAuthProvider() {
	const { authProvider } = useResourceContext();

	return authProvider;
}
