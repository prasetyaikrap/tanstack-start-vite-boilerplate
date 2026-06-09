import { useRouteContext } from "./useRouteContext";

export function useUserIdentity() {
  const { authState } = useRouteContext();

  return { userIdentity: authState?.user };
}
