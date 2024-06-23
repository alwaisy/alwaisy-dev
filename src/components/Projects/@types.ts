export interface ProjectsProps {
  title: string;
  className?: React.HTMLAttributes<HTMLElement>["className"];
}

export interface Project {
  id: number;
  title: string;
  bio: string;
  image: string;
  stack: (() => JSX.Element)[];
  link: string;
  own: boolean;
}

export type ProjectSingleProps = Project;
