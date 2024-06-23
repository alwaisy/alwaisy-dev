import { Button, Chip, Image, Link } from "@nextui-org/react";
import { Link01Icon } from "hugeicons-react";
import { ProjectSingleProps } from "./@types";

const ProjectSingle: React.FC<ProjectSingleProps> = ({
  title,
  bio,
  image,
  stack,
  link,
  own,
}) => {
  return (
    <div className="grid grid-cols-2 gap-x-9">
      <Image src={image} alt={title} />

      <div className="grid content-between">
        <div>
          <h3 className="h3 mb-4">{title}</h3>
          {own ? (
            <Chip color="success" variant="faded" size="sm">
              Own / Public
            </Chip>
          ) : (
            <Chip color="warning" variant="faded" size="sm">
              Contributor/Company
            </Chip>
          )}
          <p className="text-body text-neutral-300 mt-2">{bio}</p>
        </div>
        <div className="flex items-center gap-x-2">
          {stack.map((Component, i) => (
            <Component key={i} />
          ))}
        </div>
        <div>
          <Button
            size="sm"
            variant="flat"
            color="success"
            endContent={<Link01Icon />}
            as={Link}
            href={link}
            target="_blank"
          >
            Visit Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSingle;
