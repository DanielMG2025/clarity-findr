import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageContext";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  return (
    <div role="group" aria-label="Language" className="no-print flex shrink-0 items-center text-sidebar-foreground">
      {(["en", "es"] as const).map((item, index) => (
        <span key={item} className="flex items-center">
          {index > 0 && <span aria-hidden="true" className="text-sidebar-foreground/50">·</span>}
          <Button type="button" variant="ghost" size="sm" aria-pressed={language === item} aria-label={item === "en" ? "English" : "Español"}
            onClick={() => setLanguage(item)}
            className={`h-8 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-sidebar-accent hover:text-sidebar-primary ${language === item ? "text-sidebar-primary" : "text-sidebar-foreground"}`}>
            {item.toUpperCase()}
          </Button>
        </span>
      ))}
    </div>
  );
}