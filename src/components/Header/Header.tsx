import Link from "next/link";

export const Logo = () => {
  return <p className="text-2xl font-bold">Awais Alwaisy</p>;
};

const navMenu = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Projects", path: "/projects" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  return (
    <header className="section h-32 flex items-center justify-between border-b-1 border-neutral-600">
      <Logo />
      <nav className="flex gap-x-16">
        {navMenu.map(({ label, path }) => (
          <Link key={label} className="text-base font-semibold" href={path}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
