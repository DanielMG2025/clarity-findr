/**
 * Shared header treatment for every patient journey page:
 * a small uppercase eyebrow, one H1, one calm sub-line and an optional note.
 * Purely presentational — keeps the journey feeling like a single product.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  note,
  aside,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  note?: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2 max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground leading-relaxed">{subtitle}</p>}
        {note && <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}
