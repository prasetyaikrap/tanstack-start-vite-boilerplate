import { LayoutDashboard } from "lucide-react";
import { MenuProvider } from "./type";

const defaultMenus: MenuProvider[] = [
  {
    name: "dashboard",
    meta: {
      label: "Dashboard",
      icon: <LayoutDashboard />,
    },
    path: "/dashboard",
  },
];

export const menus = {
  default: defaultMenus,
};
