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
import PatientProfile from "./pages/PatientProfile.tsx";
import ClarityAssessment from "./pages/ClarityAssessment.tsx";
import { GlossaryProvider } from "@/modules/education";
import LearnIndex from "./pages/LearnIndex.tsx";
import LearnArticle from "./pages/LearnArticle.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const PUBLIC_PATHS = new Set<string>(["/"]);

function LayoutSwitch({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  if (pathname.startsWith("/widgets/")) {
    return <WidgetLayout>{children}</WidgetLayout>;
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WithGlossary>
        <LayoutSwitch>
          <Routes>
            {/* Public landing */}
            <Route path="/" element={<Landing />} />

            {/* Patient journey — the core modules */}
            <Route path="/situacion" element={<PatientProfile />} />
            <Route path="/orientacion" element={<ClarityAssessment />} />
            <Route path="/costes" element={<PricingLab />} />
            <Route path="/clinicas" element={<Clinics />} />
            <Route path="/asesoramiento" element={<Partners />} />
            <Route path="/aprende" element={<LearnIndex />} />
            <Route path="/aprende/:slug" element={<LearnArticle />} />
            <Route path="/community" element={<CommunityV2 />} />

            {/* Personal space */}
            <Route path="/me" element={<Navigate to="/situacion" replace />} />
            <Route path="/account" element={<AccountPatient />} />
            <Route path="/account/patient" element={<AccountPatient />} />
            <Route path="/account/clinic" element={<AccountClinic />} />
            <Route path="/account/partner" element={<AccountPartner />} />

            {/* Clinic-facing (B2B) */}
            <Route path="/clinic" element={<ClinicLanding />} />
            <Route path="/clinic/dashboard" element={<ClinicDashboard />} />

            {/* Embeddable widgets — chromeless layout for iframe distribution */}
            <Route path="/widgets/fiv-madrid" element={<WidgetFivMadrid />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutSwitch>
        </WithGlossary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
