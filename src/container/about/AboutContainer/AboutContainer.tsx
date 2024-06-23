import { AboutMeContent, AboutMeSocial } from "@/components/about";

const AboutContainer = () => {
  return (
    <section className="section flex justify-between">
      <AboutMeContent />
      <AboutMeSocial />
    </section>
  );
};

export default AboutContainer;
