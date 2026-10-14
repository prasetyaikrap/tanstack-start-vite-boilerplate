import { useMediaQuery } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/ui-store";

/**
 * Sidebar collapsed state. On large screens it is the user's saved preference (useUIStore, kept across visits).
 * On small screens the sidebar starts collapsed to save space; toggling it there is temporary and does not
 * change the saved preference.
 */
export function useSidebarCollapse() {
	const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
	const toggleSidebar = useUIStore((state) => state.toggleSidebar);

	const [isSmallScreen] = useMediaQuery(["(max-width: 768px)"]);
	const [smallScreenCollapsed, setSmallScreenCollapsed] = useState(true);

	// Collapse again every time the screen becomes small
	useEffect(() => {
		if (isSmallScreen) setSmallScreenCollapsed(true);
	}, [isSmallScreen]);

	const collapsed = isSmallScreen ? smallScreenCollapsed : sidebarCollapsed;

	const toggleCollapsed = (isCollapsed?: boolean) => {
		if (isSmallScreen) {
			setSmallScreenCollapsed((prev) => isCollapsed ?? !prev);
			return;
		}
		toggleSidebar(isCollapsed);
	};

	return { collapsed, toggleCollapsed };
}
