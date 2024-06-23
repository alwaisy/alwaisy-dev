import { Header } from "@/components";
import { AboutContainer } from "@/container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Awais Alwaisy",
  description: "",
};

export default function AboutPage() {
  return (
    <main className="space-y-20">
      <Header />
      <AboutContainer />
    </main>
  );
}
