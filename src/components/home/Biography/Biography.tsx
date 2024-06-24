import { Button, Link } from "@nextui-org/react";
import { GithubIcon, Linkedin02Icon, TwitterIcon } from "hugeicons-react";
import Image from "next/image";

export const socialIcons = [
  {
    Component: TwitterIcon,
    href: "https://go.alwaisy.dev/twitter",
    label: "Twitter",
    id: "twitter",
  },

  {
    Component: Linkedin02Icon,
    href: "https://go.alwaisy.dev/linkedin",
    label: "Linkedin",
    id: "linkedin",
  },
  {
    Component: GithubIcon,
    href: "https://go.alwaisy.dev/github",
    label: "Github",
    id: "github",
  },
];

const Biography = () => {
  return (
    <section className="section h-44 flex gap-x-9 items-center">
      <div>
        <Image
          src="/avatar-v2.png"
          alt="Me Awais Alwaisy"
          width={156}
          height={156}
          className="rounded-full"
        />
      </div>

      <div className="flex justify-between">
        <div className="w-4/6">
          <h4 className="h4 text-zinc-50">Biography</h4>
          <p className="text-lg text-zinc-300">
            <span className="text-green-400 font-bold">Self-taught</span>{" "}
            software engineer with a medical background. Founding engineer at a
            US VR startup. Passionate{" "}
            <span className="text-cyan-300 font-bold">IndieHacker</span>{" "}
            contributing to the internet.
          </p>
        </div>
        <div className="w-auto">
          <h4 className="h4 text-zinc-50">Let&apos;s connect</h4>
          <div className="flex gap-x-4">
            {socialIcons.map(({ Component, href, label, id }) => (
              <Button as={Link} isIconOnly key={id} href={href} target="_blank">
                <Component />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Biography;
