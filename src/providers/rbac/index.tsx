import { redirect } from "@tanstack/react-router";
import type { UserInfo } from "@/types";
import type {
	CheckRoutePermissionPayload,
	RBACProviderProps,
	RBACProviderReturnType,
} from "./type";

export class RBACProvider implements RBACProviderReturnType {
	private payload: RBACProviderProps;

	constructor(payload: RBACProviderProps) {
		this.payload = payload;

		this.setUserInfo = this.setUserInfo.bind(this);
		this.setParams = this.setParams.bind(this);
		this.getUserPermissions = this.getUserPermissions.bind(this);
		this.hasPermission = this.hasPermission.bind(this);
		this.checkRoutePermission = this.checkRoutePermission.bind(this);
	}

	setUserInfo(userInfo: UserInfo | null) {
		this.payload.userInfo = userInfo;
	}

	setParams(params: RBACProviderProps["params"]) {
		this.payload.params = params;
	}

	getUserPermissions(): string[] {
		const currentPermissions: string[] =
			this.payload.userInfo?.permissions || [];

		const appPermissions: string[] = [...currentPermissions];

		return appPermissions;
	}

	hasPermission(permissions: string[], strict: boolean = false): boolean {
		const userPermissions = this.getUserPermissions();

		if (strict) {
			return permissions.every((perm) => userPermissions.includes(perm));
		}

		return permissions.some((perm) => userPermissions.includes(perm));
	}

	checkRoutePermission({
		permissions,
		unauthenticatedRedirectTo = "/login",
		unauthorizedRedirectTo = "/unauthorized",
		location,
	}: CheckRoutePermissionPayload) {
		if (!this.payload.userInfo) {
			throw redirect({
				to: unauthenticatedRedirectTo,
				search: {
					// Use the current location to power a redirect after login
					// (Do not use `router.state.resolvedLocation` as it can
					// potentially lag behind the actual current location)
					redirect: location?.href,
				},
			});
		}

		if (!this.hasPermission(permissions)) {
			throw redirect({
				to: unauthorizedRedirectTo,
			});
		}
	}
}
