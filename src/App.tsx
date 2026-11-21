import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Clinics from "./pages/Clinics.tsx";
import { AppLayout } from "./components/AppLayout.tsx";
import { PublicLayout } from "./components/PublicLayout.tsx";
import { WidgetLayout } from "./components/WidgetLayout.tsx";
import WidgetFivMadrid from "./pages/widgets/WidgetFivMadrid.tsx";
import CommunityV2 from "./pages/CommunityV2.tsx";
import ClinicLanding from "./pages/ClinicLanding.tsx";
import ClinicDashboard from "./pages/ClinicDashboard.tsx";
import Partners from "./pages/Partners.tsx";
import AccountPatient from "./pages/AccountPatient.tsx";
import AccountClinic from "./pages/AccountClinic.tsx";
import AccountPartner from "./pages/AccountPartner.tsx";
import PricingLab from "./pages/PricingLab.tsx";
import SourcesDossier from "./pages/SourcesDossier.tsx";
import ReferenceCentre from "./pages/ReferenceCentre.tsx";
import PatientProfile from "./pages/PatientProfile.tsx";
import PatientReport from "./pages/PatientReport.tsx";
import ClarityAssessment from "./pages/ClarityAssessment.tsx";
import OrientationSummary from "./pages/OrientationSummary.tsx";
import { GlossaryProvider } from "@/modules/education";
import LearnArticle from "./pages/LearnArticle.tsx";
import DemoRoom from "./pages/DemoRoom.tsx";
import Descubre from "./pages/Descubre.tsx";
import Regulation from "./pages/Regulation.tsx";
import Science from "./pages/Science.tsx";
import Unirse from "./pages/Unirse.tsx";
import Admin from "./pages/Admin.tsx";
import AdminFeedback from "./pages/AdminFeedback.tsx";
import { FeedbackWidget } from "./modules/feedback/FeedbackWidget";
import { useJourneyAnswers } from "./modules/journey-v2/accountSync";
import { BetaPageViews } from "./modules/beta-analytics/BetaPageViews";
import { BackToTopButton, ScrollToTopOnNavigate } from "./components/nav/PageScroll";
import NotFound from "./pages/NotFound.tsx";
import LandingV2 from "./pages/v2/LandingV2.tsx";
import HowItWorks from "./pages/v2/HowItWorks.tsx";
import Basics from "./pages/v2/Basics.tsx";
import WhatYouNeed from "./pages/v2/WhatYouNeed.tsx";
import GuideV2 from "./pages/v2/GuideV2.tsx";
import PrepareV2 from "./pages/v2/PrepareV2.tsx";
import { MinimalLayout } from "./pages/v2/MinimalLayout";
import { AuthConfirm } from "./modules/access/AuthConfirm";
import { isAuthConfirmPath } from "./modules/access/policy";
import { ACCOUNT_PATH, BASICS_PATH, LIBRARY_PATH, NEEDS_PATH, PREPARE_PATH, START_PATH } from "./modules/journey-v2/paths";
import { LanguageProvider } from "./i18n/LanguageContext";
import { AccessGate } from "./modules/access/AccessGate";
import { FEATURES, type FeatureFlag, FLAG_FALLBACK_PATH } from "@/config/features";

const queryClient = new QueryClient();

const PUBLIC_PATHS = new Set<string>(["/", "/demo", "/descubre", "/unirse"]);

/** Journey v2 pages that use the public chrome (header + footer) instead of the case sidebar. */
const V2_PUBLIC_PATHS = new Set<string>([START_PATH, BASICS_PATH, NEEDS_PATH, PREPARE_PATH, LIBRARY_PATH, ACCOUNT_PATH]);

function LayoutSwitch({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  if (pathname.startsWith("/widgets/")) {
    return <WidgetLayout>{children}</WidgetLayout>;
  }
  if (isAuthConfirmPath(pathname)) return <>{children}</>;
  if (FEATURES.recorridoV2) {
    if (pathname === "/") return <MinimalLayout>{children}</MinimalLayout>;
    if (V2_PUBLIC_PATHS.has(pathname) || pathname.startsWith("/guia/")) return <PublicLayout>{children}</PublicLayout>;
  }
  if (PUBLIC_PATHS.has(pathname)) {
    return <PublicLayout>{children}</PublicLayout>;
  }
  return <AppLayout>{children}</AppLayout>;
}

/** Provides the glossary context, routing "Learn more" to the full guide. */
function WithGlossary({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return <GlossaryProvider openGuide={(slug) => navigate(`/aprende/${slug}`)}>{children}</GlossaryProvider>;
}

/** Hide, never delete: a switched-off surface redirects to the fallback path. */
function Flagged({ flag, children }: { flag: FeatureFlag; children: ReactNode }) {
  if (!FEATURES[flag]) return <Navigate to={FLAG_FALLBACK_PATH} replace />;
  return <>{children}</>;
}

/** Journey v2 switch, read at render: flag off renders the current page (or sends a v2-only path home). */
function V2Switch({ v1, v2 }: { v1: ReactNode; v2: ReactNode }) {
  return <>{FEATURES.recorridoV2 ? v2 : v1}</>;
}

/** Keeps query and hash when an old route hands over to its v2 replacement. */
function RedirectKeep({ to }: { to: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace />;
}

/** The invite gate itself is switch-controlled (default on). */
function MaybeGate({ children }: { children: ReactNode }) {
  if (!FEATURES.accessGate) return <>{children}</>;
  return <AccessGate>{children}</AccessGate>;
}

/** One source of truth for the person's answers (journey v2): binds "lo básico" and the case, and saves them to the account when signed in. */
function JourneyAnswers() { useJourneyAnswers(); return null; }

const App = () => (
  <LanguageProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTopOnNavigate />
        <BackToTopButton />
        {FEATURES.betaBanner && <BetaPageViews />}
        {FEATURES.recorridoV2 && <JourneyAnswers />}
        <MaybeGate>
        <WithGlossary>
        <LayoutSwitch>
          <Routes>
            {/* Public landing + demo room */}
            <Route path="/" element={<V2Switch v1={<Landing />} v2={<LandingV2 />} />} />
            <Route path="/demo" element={<Flagged flag="demoRoom"><DemoRoom /></Flagged>} />
            <Route path="/descubre" element={<V2Switch v1={<Flagged flag="discover"><Descubre /></Flagged>} v2={<RedirectKeep to={LIBRARY_PATH} />} />} />

            {/* Journey v2 (FEATURES.recorridoV2); with the flag off every one of these goes home */}
            <Route path={START_PATH} element={<V2Switch v1={<Navigate to="/" replace />} v2={<HowItWorks />} />} />
            <Route path={BASICS_PATH} element={<V2Switch v1={<Navigate to="/" replace />} v2={<Basics />} />} />
            <Route path={NEEDS_PATH} element={<V2Switch v1={<Navigate to="/" replace />} v2={<WhatYouNeed />} />} />
            <Route path="/guia/:tratamiento" element={<V2Switch v1={<Navigate to="/" replace />} v2={<GuideV2 />} />} />
            <Route path={PREPARE_PATH} element={<V2Switch v1={<Navigate to="/situacion" replace />} v2={<PrepareV2 />} />} />
            <Route path={LIBRARY_PATH} element={<V2Switch v1={<Navigate to="/descubre" replace />} v2={<Descubre variant="biblioteca" />} />} />
            {/* Behind the gate on purpose: signed out it shows the sign-in screen, signed in it returns to the report */}
            <Route path={ACCOUNT_PATH} element={<V2Switch v1={<Navigate to="/" replace />} v2={<Navigate to={`${PREPARE_PATH}?paso=informe`} replace />} />} />
            <Route path="/auth/confirmar" element={<AuthConfirm />} />
            <Route path="/descubre/regulacion" element={<Flagged flag="discover"><Regulation /></Flagged>} />
            <Route path="/descubre/ciencia" element={<Flagged flag="discover"><Science /></Flagged>} />
            {/* Invite-only join page — the one route AccessGate lets through without access */}
            <Route path="/unirse" element={<Unirse />} />

            {/* Patient journey — the core modules */}
            <Route path="/situacion" element={<V2Switch v1={<PatientProfile />} v2={<Navigate to={PREPARE_PATH} replace />} />} />
            <Route path="/summary" element={<OrientationSummary />} />
            <Route path="/report" element={<PatientReport />} />
            <Route path="/orientacion" element={<ClarityAssessment />} />
            <Route path="/sources" element={<Flagged flag="sourcesDossier"><SourcesDossier /></Flagged>} />
            <Route path="/library" element={<Flagged flag="referenceLibrary"><ReferenceCentre /></Flagged>} />
            <Route path="/costes" element={<Flagged flag="costsLab"><PricingLab /></Flagged>} />
            <Route path="/clinicas" element={<Clinics />} />
            <Route path="/asesoramiento" element={<Flagged flag="guidancePage"><Partners /></Flagged>} />
            <Route path="/aprende" element={<Navigate to={FEATURES.recorridoV2 ? `${LIBRARY_PATH}#basicos` : "/descubre#basicos"} replace />} />
            <Route path="/aprende/:slug" element={<LearnArticle />} />
            <Route path="/community" element={<Flagged flag="community"><CommunityV2 /></Flagged>} />

            {/* Personal space */}
            <Route path="/me" element={<Navigate to="/situacion" replace />} />
            <Route path="/account" element={<Flagged flag="accountArea"><AccountPatient /></Flagged>} />
            <Route path="/account/patient" element={<Flagged flag="accountArea"><AccountPatient /></Flagged>} />
            <Route path="/account/clinic" element={<Flagged flag="accountArea"><AccountClinic /></Flagged>} />
            <Route path="/account/partner" element={<Flagged flag="accountArea"><AccountPartner /></Flagged>} />

            {/* Clinic-facing (B2B) */}
            <Route path="/clinic" element={<Flagged flag="clinicSide"><ClinicLanding /></Flagged>} />
            <Route path="/clinic/dashboard" element={<Flagged flag="clinicSide"><ClinicDashboard /></Flagged>} />

            {/* Embeddable widgets — chromeless layout for iframe distribution */}
            <Route path="/widgets/fiv-madrid" element={<Flagged flag="widgets"><WidgetFivMadrid /></Flagged>} />

            {/* Admin — tabbed control surface (Pills tab is role-gated) */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutSwitch>
        {FEATURES.feedback && <FeedbackWidget />}
        </WithGlossary>
        </MaybeGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </LanguageProvider>
);

export default App;
