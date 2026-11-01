import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical, Scale, Wallet, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import { useMasterRecord } from "@/modules/master-record";
import { caseReferences, findingsByIds } from "@/modules/content/caseReferences";
import { REGULATION } from "@/modules/content/regulation";

const linkCls = "inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline";

function BridgeRow({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-semibold leading-snug">{title}</p>
        {children}
      </div>
    </div>
  );
}

/** Links the case to the reference pillars; shows no engine data. */
export function CaseReferences() {
  const { language } = useLanguage();
  const es = language === "es";
  const L = (e: string, n: string) => (es ? e : n);
  const country = useMasterRecord((s) => s.identity?.country_of_residence);
  const treatment = useMasterRecord((s) => s.intent?.treatment_interest);
  const goal = useMasterRecord((s) => s.intent?.goal);

  const ref = caseReferences({ country, treatment_interest: treatment, goal });
  const regRow = ref.regCountryEn ? REGULATION.find((r) => r.country_en === ref.regCountryEn) : undefined;
  const findings = findingsByIds(ref.findingIds).slice(0, 3);

  return (
    <Card className="space-y-5 border-accent/40 p-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {L("Referencias para tu caso", "References for your case")}
        </div>
        <h3 className="text-lg font-bold">{L("Los tres pilares, filtrados a ti", "The three pillars, filtered to you")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {L("Cada dato con su fuente y su fecha. Profundiza donde quieras.", "Every datum with its source and date. Go deeper wherever you want.")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {regRow ? (
          <BridgeRow icon={Scale} title={L(`Regulación en ${regRow.country_es}`, `Regulation in ${regRow.country_en}`)}>
            <Link to={`/descubre/regulacion?country=${encodeURIComponent(regRow.country_en)}`} className={linkCls}>
              {L("Ver la ficha comparada", "See the comparison")} <ArrowRight className="size-3.5" />
            </Link>
          </BridgeRow>
        ) : (
          <BridgeRow icon={Scale} title={L("Regulación comparada en Europa", "Regulation compared across Europe")}>
            <Link to="/descubre/regulacion" className={linkCls}>
              {L("Ver la ficha comparada", "See the comparison")} <ArrowRight className="size-3.5" />
            </Link>
          </BridgeRow>
        )}
        <BridgeRow icon={FlaskConical} title={L("Qué dice la evidencia para tu caso", "What the evidence says for your case")}>
          <ul className="space-y-1.5">
            {findings.map((f) => (
              <li key={f.id}>
                <Link to={`/descubre/ciencia?finding=${f.id}`} className="text-sm leading-snug text-foreground underline-offset-2 hover:text-primary hover:underline">
                  {L(f.title_es, f.title_en)}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/descubre/ciencia" className={linkCls}>
            {L("Ver todo", "See all")} <ArrowRight className="size-3.5" />
          </Link>
        </BridgeRow>
        <BridgeRow icon={Wallet} title={L("Precio de referencia, con su procedencia", "Reference price, with its provenance")}>
          <Link to="/costes" className={linkCls}>
            {L("Ver costes", "See costs")} <ArrowRight className="size-3.5" />
          </Link>
        </BridgeRow>
      </div>
    </Card>
  );
}
