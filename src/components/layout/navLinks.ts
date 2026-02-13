import {
  LayoutDashboard,
  Map,
  FlaskConical,
  Upload,
  Vault,
  Settings,
} from "lucide-react";
import type { NavLink } from "../../types/nav/links";

export const mainNavLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Map",
    href: "/map",
    icon: Map,
  },
  {
    label: "Lab",
    href: "/lab/1",
    icon: FlaskConical,
  },
  {
    label: "Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    label: "Vault",
    href: "/vault",
    icon: Vault,
  },
];

export const utilityLinks = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
