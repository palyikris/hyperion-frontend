import {type LucideProps} from "lucide-react";

export interface NavLink {
  labelKey: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  isActive?: boolean;
}