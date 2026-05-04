import type { ReactNode } from "react";
import SiteFooter from "./SiteFooter";

interface Props {
  children: ReactNode;
}

export function PublicLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
