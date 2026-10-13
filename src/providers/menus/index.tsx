import { LayoutDashboard } from "lucide-react";
import type { MenuProvider } from "./type";

export const menus: MenuProvider[] = [
	{
		name: "dashboard",
		meta: {
			label: "Dashboard",
			icon: <LayoutDashboard />,
		},
		path: "/dashboard",
	},
];
