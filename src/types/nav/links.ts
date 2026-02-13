import {type LucideProps} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  isActive?: boolean;
}