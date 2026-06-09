import type { ParsedLocation } from "@tanstack/react-router";
import type { UserInfo } from "@/types";

export type RBACProviderProps = {
	userInfo: UserInfo | null;
	params?: RBACProviderParams;
};

type RBACProviderParams = Record<string, any>;

export type CheckRoutePermissionPayload = {
	permissions: string[];
	unauthenticatedRedirectTo?: string;
	unauthorizedRedirectTo?: string;
	location?: ParsedLocation<{}>;
};

export type RBACProviderReturnType = {
	getUserPermissions: () => string[];
	hasPermission: (permissions: string[], strict?: boolean) => boolean;
	checkRoutePermission: (payload: CheckRoutePermissionPayload) => void;
	setUserInfo: (userInfo: UserInfo | null) => void;
	setParams: (params: RBACProviderParams) => void;
};
