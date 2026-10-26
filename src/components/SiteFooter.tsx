import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const SiteFooter = () => {
  const { language } = useLanguage();
  return (
    <footer className="border-t bg-muted/30 mt-24">
      <div className="container py-10 text-sm text-muted-foreground space-y-3">
        <nav className="flex gap-5 text-xs font-medium">
          <Link to="/descubre" className="hover:text-primary">{language === "es" ? "Descubre" : "Discover"}</Link>
        </nav>
        <p className="max-w-3xl">
          This platform provides informational insights based on aggregated user data. It is not
          medical advice. Always consult a qualified healthcare provider before making treatment
          decisions.
        </p>
        <p className="text-xs">Prices are estimates; actual costs may vary by clinic and case.</p>
        <p className="text-xs">© {new Date().getFullYear()} Fertility Compass — a decision platform prototype.</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
