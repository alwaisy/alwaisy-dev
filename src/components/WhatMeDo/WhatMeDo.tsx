import WhatMeDoCarousel from "./_carousel";

const WhatMeDo = () => {
  return (
    <section className="section flex gap-x-9 justify-between">
      <div className="w-2/5">
        <h4 className="h4">What I do</h4>
        <p className="text-lg text-rose-200">
          Craft and manage websites. Write dev & tech-savvy articles. Combat
          <b className="text-green-300"> imposter </b> syndrome with dev
          content. Weekends? I transform ideas into{" "}
          <b className="gradient-v1">SaaS</b> solutions.
        </p>
      </div>

      <WhatMeDoCarousel className="w-3/5" />
    </section>
  );
};

export default WhatMeDo;
