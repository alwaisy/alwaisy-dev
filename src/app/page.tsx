import { Biography, Header, Hero, Projects, WhatMeDo } from "@/components";

export default function Home() {
  return (
    <main className="space-y-20">
      <Header />
      <Hero />
      <Biography />
      <WhatMeDo />
      <Projects title="Projects" />
      <div>nw compienntr</div>
    </main>
  );
}
