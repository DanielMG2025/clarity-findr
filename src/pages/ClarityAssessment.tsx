import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Wallet, Building2, Stethoscope, Heart, Info, Compass } from "lucide-react";
import { useProfileStore } from "@/modules/profile/store";
import { usePatientProfileStore } from "@/modules/patient-profile/store";
import { overallCompletion, BLOCKS, blockProgress } from "@/modules/patient-profile/blocks";
import { SuccessOrientationCard } from "@/components/patient/SuccessOrientationCard";

function ExplainBlock({
  why,
  influences,
  missing,
  doctor,
}: {
  why: string;
  influences: string;
  missing: string;
  doctor: string;
}) {
  return (
    <details className="text-xs text-muted-foreground mt-3">
      <summary className="cursor-pointer font-semibold text-foreground inline-flex items-center gap-1">
        <Info className="size-3.5" /> Por qué vemos esto
      </summary>
      <div className="mt-2 space-y-1.5 leading-relaxed">
        <p><strong>Por qué:</strong> {why}</p>
        <p><strong>Qué datos influyen:</strong> {influences}</p>
        <p><strong>Qué falta para afinar:</strong> {missing}</p>
        <p><strong>Qué deberías confirmar con un médico:</strong> {doctor}</p>
      </div>
    </details>
  );
}

export default function ClarityAssessment() {
  const profile = useProfileStore();
  const pp = usePatientProfileStore();
  const completion = overallCompletion(profile, pp);

  const nudges = BLOCKS
    .map((b) => ({ b, p: blockProgress(b.key, profile, pp) }))
    .filter((x) => x.p < 60)
    .slice(0, 3);

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      {/* Header */}
      <header className="space-y-3 max-w-3xl">
        <Badge variant="secondary" className="text-[11px]">Tu evaluación de claridad</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
          <Compass className="size-7 text-primary" /> De la incertidumbre a la claridad
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Una vista única, explicable y confidencial de tu situación. Cada bloque te dice
          <em> por qué</em> ves lo que ves y qué datos influyen.
        </p>
      </header>

      {/* Profile summary + completion */}
      <Card className="p-5 bg-gradient-card border-2">
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumen de tu situación</div>
            <div className="text-lg font-bold">
              {profile.age ? `${profile.age} años` : "Edad sin compartir"} · {profile.country || "País sin compartir"} · {profile.treatment ? profile.treatment.toUpperCase() : "Sin tratamiento definido"}
            </div>
          </div>
          <Link to="/profile" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
            Editar mi historia <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Progress value={completion} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{completion}% completado · cuanto más compartas, más afinada será la orientación.</p>

        {nudges.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-3 gap-2">
            {nudges.map(({ b }) => (
              <Link key={b.key} to="/profile" className="rounded-lg border p-3 hover:border-primary/50 transition-smooth bg-background/60">
                <div className="text-xs font-semibold">Añade: {b.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{b.subtitle}</div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Two-column: success orientation + supporting cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SuccessOrientationCard />

        <div className="space-y-6">
          {/* Cost estimate card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="grid place-items-center size-9 rounded-xl bg-accent-soft text-accent"><Wallet className="size-5" /></span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coste aproximado</div>
                <h3 className="font-bold text-lg">Rango de inversión estimada</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Estimamos rangos para escenarios <strong>básico</strong>, <strong>premium</strong> y
              <strong> garantía</strong>, según los factores que has compartido. Te mostramos qué
              suele estar incluido y qué no.
            </p>
            <ExplainBlock
              why="Para que sepas el orden de magnitud antes de pedir presupuestos a clínicas."
              influences="País, tratamiento, edad, necesidad de ICSI, PGT-A o donante."
              missing={completion < 60 ? "Más datos médicos y preferencias afinarían el rango." : "Cobertura de datos suficiente."}
              doctor="La idoneidad real del tratamiento y add-ons recomendados para tu caso."
            />
            <Button asChild size="sm" className="mt-4 gap-1"><Link to="/pricing-lab">Abrir configurador <ArrowRight className="size-3.5" /></Link></Button>
          </Card>

          {/* Clinic fit */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="grid place-items-center size-9 rounded-xl bg-primary-soft text-primary"><Building2 className="size-5" /></span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Encaje con clínicas</div>
                <h3 className="font-bold text-lg">Clínicas que pueden encajar</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Una vez tienes orientación y costes, te mostramos clínicas con precios normalizados
              y un <em>por qué</em> transparente para cada sugerencia. Tú decides si contactas.
            </p>
            <ExplainBlock
              why="Para comparar peras con peras: precios, experiencia y tratamientos comparables."
              influences="País, presupuesto, prioridades (coste, éxito, cercanía) y tratamiento."
              missing="Tus prioridades y tu apertura a viajar afinan el orden."
              doctor="Cualquier criterio clínico específico (protocolo, equipo médico, técnicas)."
            />
            <Button asChild size="sm" variant="outline" className="mt-4 gap-1"><Link to="/clinics">Ver clínicas <ArrowRight className="size-3.5" /></Link></Button>
          </Card>

          {/* Expert guidance */}
          <Card className="p-6 bg-primary-soft/30 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground"><Stethoscope className="size-5" /></span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Asesoramiento experto</div>
                <h3 className="font-bold text-lg">Cuándo puede tener sentido hablar con un experto</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Si tu caso tiene factores complejos, datos contradictorios, o simplemente quieres una
              segunda opinión antes de iniciar un tratamiento, puede ayudarte hablar con un
              profesional independiente.
            </p>
            <ExplainBlock
              why="Una conversación con un experto puede aclarar dudas que la información orientativa no resuelve."
              influences="La complejidad de tus factores y la confianza con que necesitas tomar la decisión."
              missing="No aplica — esto es siempre opcional y voluntario."
              doctor="Cualquier diagnóstico, plan de tratamiento o medicación."
            />
            <Button asChild size="sm" className="mt-4 gap-1"><Link to="/partners"><Heart className="size-3.5" /> Buscar asesoramiento <ArrowRight className="size-3.5" /></Link></Button>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="p-5 bg-muted/30 border-dashed">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Aviso importante:</strong> Fertility Compass ofrece
          información orientativa basada en datos públicos, modelos estadísticos y la información
          que tú decides compartir. No sustituye una consulta médica, diagnóstico ni recomendación
          de tratamiento. Toda decisión clínica debe tomarse con un profesional sanitario.
        </p>
      </Card>
    </div>
  );
}
