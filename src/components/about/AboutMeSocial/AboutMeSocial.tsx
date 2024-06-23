import { Image } from "@nextui-org/react";
import { GithubIcon, Linkedin02Icon, TwitterIcon } from "hugeicons-react";
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
        <ul role="list">
          <SocialLink href="https://twitter.com/alvaisy" icon={TwitterIcon}>
            Follow on Twitter
          </SocialLink>

          <SocialLink
            href="https://github.com/alwaisy"
            icon={GithubIcon}
            className="mt-4"
          >
            Follow on GitHub
          </SocialLink>
          <SocialLink
            href="https://www.linkedin.com/in/alwaisy/"
            icon={Linkedin02Icon}
            className="mt-4"
          >
            Follow on LinkedIn
          </SocialLink>
        </ul>
      </div>
    </div>
  );
};

export default AboutMeSocial;
