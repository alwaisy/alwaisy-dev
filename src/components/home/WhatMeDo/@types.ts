import { HugeiconsProps } from "hugeicons-react";

export interface WhatMeDoProps {
  className?: React.HTMLAttributes<HTMLElement>["className"];
}

export interface CarouselCardProps {
  icon: React.FC<
    Omit<HugeiconsProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  title: string;
  desc: string;
  className?: React.HTMLAttributes<HTMLElement>["className"];
}
