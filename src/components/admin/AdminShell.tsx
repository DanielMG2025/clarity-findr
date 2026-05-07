import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

/**
 * Page-level header used inside the global AdminLayout.
 * Sidebar, topbar, breadcrumbs and env badge are provided by AdminLayout.
 */
export function AdminShell({ title, subtitle, children, actions }: Props) {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}
