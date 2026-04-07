import { LayoutDashboard } from "lucide-react";
import { MenuProvider } from "./type";

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
