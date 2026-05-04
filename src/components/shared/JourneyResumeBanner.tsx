import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveJourney, clearActiveJourney } from "@/hooks/useJourneyState";

/**
 * Floating banner that appears on non-journey pages when a user has a journey
 * in progress. Lets them jump back to the exact step where they left off.
 */
export function JourneyResumeBanner() {
  const location = useLocation();
  const [snap, setSnap] = useState(() => getActiveJourney());

  // Re-read when route changes (covers tab switches inside the SPA)
  useEffect(() => {
    setSnap(getActiveJourney());
  }, [location.pathname]);

  if (!snap) return null;

  // Hide while the user is on the journey itself
  if (location.pathname === snap.path) return null;

  const stepLabel =
    snap.totalSteps && snap.totalSteps > 0
      ? `Step ${snap.step + 1} of ${snap.totalSteps}`
      : `Step ${snap.step + 1}`;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-xl rounded-2xl border bg-card/95 backdrop-blur shadow-lg p-3 pl-4 flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">You were in the middle of…</div>
        <div className="text-sm font-semibold truncate">
          {snap.label} <span className="text-muted-foreground font-normal">· {stepLabel}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        title="Discard progress"
        onClick={() => {
          clearActiveJourney(snap.key);
          setSnap(null);
        }}
      >
        <RotateCcw className="size-4" />
      </Button>
      <Button asChild size="sm">
        <Link to={snap.path}>
          Resume <ArrowRight className="size-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Dismiss"
        onClick={() => setSnap(null)}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
