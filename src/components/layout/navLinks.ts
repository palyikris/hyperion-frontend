import {
  LayoutDashboard,
  Map,
  FlaskConical,
  Upload,
  Vault,
  Settings,
  BarChart3,
} from "lucide-react";
import type { NavLink } from "../../types/nav/links";

export const mainNavLinks: NavLink[] = [
  {
    labelKey: "nav.main.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    labelKey: "nav.main.map",
    href: "/map",
    icon: Map,
  },
  {
    labelKey: "nav.main.upload",
    href: "/upload",
    icon: Upload,
  },
  {
    labelKey: "nav.main.stats",
    href: "/stats",
    icon: BarChart3,
  },
  {
    labelKey: "nav.main.lab",
    href: "/lab/1",
    icon: FlaskConical,
  },
  {
    labelKey: "nav.main.vault",
    href: "/vault",
    icon: Vault,
  },
];

export const utilityLinks = [
  {
    labelKey: "nav.utility.settings",
    href: "/settings",
    icon: Settings,
  },
];
