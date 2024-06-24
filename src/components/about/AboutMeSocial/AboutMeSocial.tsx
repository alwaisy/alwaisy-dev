import { socialIcons } from "@/components/home/Biography/Biography";
import { Image } from "@nextui-org/react";
import { Mailbox01Icon } from "hugeicons-react";
import SocialLink from "./_social-link";

const AboutMeSocial = () => {
  return (
    <div>
      <Image
        src="/portrait.jpg"
        alt="Me Awais Alwaisy"
        width={400}
        height={400}
      />

      <div className="mt-9">
        <ul role="list" className="space-y-4">
          {socialIcons.map(({ Component, href, label, id }) => (
            <SocialLink key={id} href={href} icon={Component}>
              Follow {label}
            </SocialLink>
          ))}
          <SocialLink
            href={"mailto:hello@alwaisy.dev?subject=Hello"}
            icon={Mailbox01Icon}
          >
            hello@alwaisy.dev
          </SocialLink>
        </ul>
      </div>
    </div>
  );
};

export default AboutMeSocial;
