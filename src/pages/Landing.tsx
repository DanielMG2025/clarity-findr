import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  Wallet,
  Building2,
  Heart,
  Stethoscope,
  Lock,
  Lightbulb,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const HELP = [
  { icon: Lightbulb,   title: "Qué factores pueden influir",      desc: "Edad, reserva ovárica, historial y diagnóstico explicados sin tecnicismos." },
  { icon: Stethoscope, title: "Qué tratamientos suelen valorarse", desc: "Opciones que personas con perfiles similares suelen considerar." },
  { icon: Wallet,      title: "Cuánto podría costar",              desc: "Rangos normalizados con lo que está incluido — y lo que no." },
  { icon: Building2,   title: "Qué clínicas pueden encajar",       desc: "Comparativa transparente, ordenada según tus prioridades." },
  { icon: HeartHandshake, title: "Cuándo hablar con un experto",   desc: "Te indicamos cuándo una segunda opinión médica puede aportar claridad." },
];

const STEPS = [
  { n: 1, title: "Completa tu situación",          desc: "Comparte solo lo que quieras. Cada bloque mejora la orientación." },
  { n: 2, title: "Recibe una orientación explicada", desc: "Una lectura aproximada de los factores que pueden influir." },
  { n: 3, title: "Explora costes normalizados",     desc: "Rangos reales por escenario, con lo que suele estar incluido." },
  { n: 4, title: "Compara clínicas",                desc: "Opciones que pueden encajar con tu caso y prioridades." },
  { n: 5, title: "Decide los próximos pasos",       desc: "Asesoramiento experto o contacto con clínicas, solo si tú quieres." },
];

const TRUST = [
  { icon: Lock,        title: "Información confidencial", desc: "Tus datos son tuyos. Tú decides qué compartir y con quién." },
  { icon: ShieldCheck, title: "No sustituye a un médico", desc: "Es información orientativa, no un diagnóstico ni una recomendación clínica." },
  { icon: Lightbulb,   title: "Explicamos cada resultado",desc: "Siempre verás por qué ves lo que ves y qué datos lo influyen." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="container max-w-5xl py-20 md:py-28 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            <Compass className="size-3" /> De la incertidumbre a la claridad
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            De la incertidumbre a la claridad
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              en tu camino de fertilidad.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fertility Compass te ayuda a entender tus opciones, estimar costes reales, valorar
            factores que pueden influir en el éxito de un tratamiento y encontrar apoyo experto o
            clínicas que encajen con tus necesidades.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to="/clarity-assessment">Empezar mi evaluación <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="#como-funciona">Ver cómo funciona</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-2 max-w-xl mx-auto">
            Información orientativa basada en datos públicos y en lo que tú decides compartir. No sustituye una consulta médica.
          </p>
        </div>
      </section>

      {/* EMOTIONAL PROBLEM */}
      <section className="container max-w-4xl py-16 md:py-20 text-center">
        <Badge variant="secondary" className="mb-3">Lo que sentimos muchas personas</Badge>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Buscar información sobre fertilidad puede ser confuso, solitario y agotador.
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Foros, anuncios y webs de clínicas dicen cosas distintas. Es difícil saber qué es relevante
          para tu caso, qué preguntas hacer y qué esperar — emocional y económicamente.
        </p>
      </section>

      {/* WHAT WE HELP YOU UNDERSTAND */}
      <section className="bg-muted/40 border-y">
        <div className="container max-w-6xl py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <Badge variant="secondary" className="mb-3">En qué te ayudamos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Te acompañamos a entender, no a decidir por ti.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HELP.map((h) => (
              <Card key={h.title} className="p-6">
                <h.icon className="size-7 text-primary mb-3" />
                <h3 className="font-bold mb-1">{h.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="container max-w-6xl py-16 md:py-20">
        <div className="max-w-2xl mb-10">
          <Badge variant="secondary" className="mb-3">Cómo funciona</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Cinco pasos, a tu ritmo.</h2>
          <p className="text-muted-foreground mt-3">
            Sin presión y sin caminos forzados. Puedes parar, volver y completar cuando quieras.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-6 relative">
              <div className="absolute -top-3 left-6 size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center">{s.n}</div>
              <h3 className="font-bold mb-1 mt-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="bg-muted/40 border-y">
        <div className="container max-w-6xl py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <Badge variant="secondary" className="mb-3">Confianza y privacidad</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Confidencial, transparente y respetuoso.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TRUST.map((t) => (
              <Card key={t.title} className="p-6">
                <t.icon className="size-7 text-primary mb-3" />
                <h3 className="font-bold mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </Card>
            ))}
          </div>
          <Card className="p-5 mt-6 bg-background/60 border-dashed">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Aviso importante:</strong> Fertility Compass ofrece
              información orientativa basada en datos públicos, modelos estadísticos y la información
              que tú decides compartir. No sustituye una consulta médica, diagnóstico ni recomendación
              de tratamiento.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-primary text-primary-foreground">
        <div className="container max-w-4xl py-16 text-center space-y-5">
          <Heart className="size-8 mx-auto opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Da el primer paso hacia tu claridad.
          </h2>
          <p className="opacity-90 max-w-2xl mx-auto">
            Información, herramientas y orientación para tomar decisiones de fertilidad con más
            confianza, transparencia y confidencialidad.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/clarity-assessment">Empezar mi evaluación <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/pricing-lab"><Sparkles className="size-4" /> Explorar costes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
