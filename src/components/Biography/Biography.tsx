import { Button } from "@nextui-org/react";
import { Linkedin02Icon, TwitterIcon } from "hugeicons-react";
import Image from "next/image";

export const socialIcons = [
  {
    Component: TwitterIcon,
    href: "https://twitter.com/alvaisy",
    label: "Twitter",
    id: "twitter",
  },

  {
    Component: Linkedin02Icon,
    href: "https://www.linkedin.com/in/alwaisy/",
    label: "Linkedin",
    id: "linkedin",
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
              <Button isIconOnly key={id}>
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
