import { $cn } from "@/utils";
import Link from "next/link";
import { SocialLinkProps } from "./@types";

const SocialLink: React.FC<SocialLinkProps> = ({
  className,
  children,
  href,
  icon: Icon,
}) => {
  return (
    <li className={$cn(className, "flex")}>
      <Link
        href={href}
        className="flex items-center text-sm font-medium transition hover:text-blue-400 dark:text-zinc-200 dark:hover:text-blue-400"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-blue-400" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  );
};

export default SocialLink;
