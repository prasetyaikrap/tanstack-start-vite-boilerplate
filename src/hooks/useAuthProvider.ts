import { useResourceContext } from "@/contexts/resource-provider/context";

export function useAuthProvider() {
	const { authProvider } = useResourceContext();

	return authProvider;
}
