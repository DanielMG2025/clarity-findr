import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";

const SiteHeader = () => {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Home" },
    { to: "/profile", label: "My profile" },
    { to: "/pricing-lab", label: "Configurator" },
    { to: "/clinics", label: "Clinics" },
    { to: "/partners", label: "Services" },
    { to: "/community", label: "Community" },
    { to: "/account", label: "My space" },
  ];
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid place-items-center size-8 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-4" />
          </span>
          Fertility Compass
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-smooth hover:text-primary ${
                pathname === l.to ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
