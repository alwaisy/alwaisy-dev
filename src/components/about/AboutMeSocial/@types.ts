import { HugeiconsProps } from "hugeicons-react";

export interface AboutMeSocialProps {
  className?: React.HTMLAttributes<HTMLElement>["className"];
}

// className, href, children, icon: Icon
export interface SocialLinkProps {
  className?: React.HTMLAttributes<HTMLElement>["className"];
  href: string;
  children: React.ReactNode;
  icon: React.FC<
    Omit<HugeiconsProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}
