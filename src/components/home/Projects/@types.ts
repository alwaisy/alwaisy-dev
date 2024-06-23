import { SvgIconProps } from "@/components/shared/icons/@types";

export interface ProjectsProps {
  title: string;
  className?: React.HTMLAttributes<HTMLElement>["className"];
}

export interface Project {
  id: number;
  title: string;
  bio: string;
  image: string;
  stack: React.FC<SvgIconProps>[];
  link: string;
  own: boolean;
}

export type ProjectSingleProps = Project;
