import Link from "next/link";

export const Logo = () => {
  return <p className="text-2xl font-bold">Awais Alwaisy</p>;
};

const navMenu = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  {
    label: "Resume",
    path: "/Awais_Alwaisy_Frontend_Developer.pdf",
    target: "_blank",
  },
  {
    label: "Blog",
    path: "https://go.alwaisy.dev/amicoder",
    target: "_blank",
  },
  // { label: "Projects", path: "/projects" },
  // { label: "Contact", path: "/contact" },
];

const Header = () => {
  return (
    <header className="section h-32 flex items-center justify-between border-b-1 border-neutral-600">
      <Logo />
      <nav className="flex gap-x-8">
        {navMenu.map(({ label, path, target }) => (
          <Link
            key={label}
            className="text-base font-semibold"
            href={path}
            {...(target ? { target } : {})}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
