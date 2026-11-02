import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logBetaEvent } from "./logger";

/** Mounted once inside the Router: logs a page_view on every route change (pathname only). */
export function BetaPageViews() {
  const { pathname } = useLocation();
  useEffect(() => { logBetaEvent("page_view", { path: pathname }); }, [pathname]);
  return null;
}
