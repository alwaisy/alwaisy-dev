import {
  Biography,
  CodeSnippets,
  Header,
  Hero,
  Projects,
  WhatMeDo,
} from "@/components";

export default function Home() {
  return (
    <main className="space-y-20">
      <Header />
      <Hero />
      <Biography />
      <WhatMeDo />
      <Projects title="Projects" />
      <CodeSnippets title="Code Snippets" />
      <div>nw compienntr</div>
    </main>
  );
}
