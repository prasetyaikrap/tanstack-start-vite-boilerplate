import { useResourceContext } from "@/contexts/resource-provider/context";

export function usePermission() {
	const { rbacProvider } = useResourceContext();

	return {
		rbacProvider,
	};
}
