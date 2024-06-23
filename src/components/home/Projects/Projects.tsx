import { $cn } from "@/utils";
import { NextJs, Tailwind, Typescript } from "../../shared";
import { ProjectsProps } from "./@types";
import ProjectSingle from "./_project";

export const projects = [
  {
    id: 0,
    title: "SaaSy Thursday",
    bio: "SaaSyThursday: Your ultimate hub for SaaS makers. Access top articles, 300+ AI-powered ideas, essential tools, and resources for dev and no-code. Join our community today!",
    image: "/saasy-thursday.png",
    stack: [NextJs, Tailwind, Typescript],
    link: "https://go.alwaisy.dev/saasy-thursday-tp",
    own: true,
  },
  /* {
    id: 0,
    title: "VueNpm",
    bio: "Nothing else, just a simple VueJs packages search engine. Also there is a curated list of popular Vue 3 packages.",
    image: "/vuenpm.png",
    own: true,
  }, */
  {
    id: 1,
    title: "Avatown",
    bio: "World's best Avatar Marketplace. Targeting VRChat platform. The growing avatar marketplace on VRChat and Discord",
    image: "/avatown.jpeg",
    stack: [NextJs, Tailwind, Typescript],
    link: "https://go.alwaisy.dev/avatown-tp",
    own: false,
  },
];

const Projects: React.FC<ProjectsProps> = ({ title, className }) => {
  const classes = $cn("section space-y-9", className);

  return (
    <section className={classes}>
      <h3 className="h3">{title}</h3>
      <div className="space-y-9">
        {projects.map((project) => (
          <ProjectSingle key={project.id} {...project} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
