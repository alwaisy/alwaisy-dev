import { Button, Link } from "@nextui-org/react";
import { LinkCircle02Icon } from "hugeicons-react";
import { SnippetSingleProps } from "./@types";

const SnippetSingle: React.FC<SnippetSingleProps> = ({
  title,
  bio,
  lang,
  link,
}) => {
  return (
    <div className="bg-zinc-700 rounded-3xl h-72 px-10 py-6 grid">
      <div>
        <h4 className="h4 text-white">{title}</h4>
        <p className="text-body">{bio}</p>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex items-center mt-8">
          {lang.map((Component, i) => (
            <Component key={i} width={28} height={28} fill="#007BCD" />
          ))}
        </div>
        <Button
          isIconOnly
          variant="light"
          as={Link}
          href={link}
          target="_blank"
        >
          <LinkCircle02Icon />
        </Button>
      </div>
    </div>
  );
};

export default SnippetSingle;
