import { SvgIconProps } from "../../shared/icons/@types";

export interface CodeSnippetsProps {
  title: string;
  className?: React.HTMLAttributes<HTMLElement>["className"];
}

export interface Snippet {
  title: string;
  bio: string;
  lang: React.FC<SvgIconProps>[];
  link: string;
}

export type SnippetSingleProps = Snippet;
