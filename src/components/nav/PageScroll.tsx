import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/** On every route change, start at the top so the header is in view (anchors still work). */
export function ScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView();
        else window.scrollTo(0, 0);
      }, 50);
      return () => window.clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/** Floating "back to top" button, shown once the page has been scrolled down. */
export function BackToTopButton() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  if (!show || pathname.startsWith("/widgets/")) return null;
  const label = language === "es" ? "Volver arriba" : "Back to top";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="no-print fixed bottom-20 right-4 z-40 flex h-12 items-center gap-1.5 rounded-full border border-accent/70 bg-card px-4 text-sm font-medium text-primary shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-24 sm:right-6"
    >
      <ArrowUp className="size-5" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
