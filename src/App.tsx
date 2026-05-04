import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home.tsx";
import Landing from "./pages/Landing.tsx";
import Clinics from "./pages/Clinics.tsx";
import { AppLayout } from "./components/AppLayout.tsx";
import { PublicLayout } from "./components/PublicLayout.tsx";
import CommunityV2 from "./pages/CommunityV2.tsx";
import ClinicLanding from "./pages/ClinicLanding.tsx";
import ClinicDashboard from "./pages/ClinicDashboard.tsx";
import Partners from "./pages/Partners.tsx";
import Insights from "./pages/Insights.tsx";
import Import from "./pages/Import.tsx";
import AdminPricingDashboard from "./pages/AdminPricingDashboard.tsx";
import AdminPricing from "./pages/AdminPricing.tsx";
import AdminClinicDiscovery from "./pages/AdminClinicDiscovery.tsx";
import Admin from "./pages/Admin.tsx";
import AccountPatient from "./pages/AccountPatient.tsx";
import AccountClinic from "./pages/AccountClinic.tsx";
import AccountPartner from "./pages/AccountPartner.tsx";
import EggBank from "./pages/EggBank.tsx";
import PricingLab from "./pages/PricingLab.tsx";
import PatientProfile from "./pages/PatientProfile.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const PUBLIC_PATHS = new Set<string>(["/"]);

function LayoutSwitch({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  if (PUBLIC_PATHS.has(pathname)) {
    return <PublicLayout>{children}</PublicLayout>;
  }
  return <AppLayout>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LayoutSwitch>
          <Routes>
            {/* Public landing */}
            <Route path="/" element={<Landing />} />

            {/* Core 6 modules */}
            <Route path="/profile" element={<PatientProfile />} />
            <Route path="/pricing-lab" element={<PricingLab />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/community" element={<CommunityV2 />} />
            <Route path="/account" element={<AccountPatient />} />

            {/* Aliases */}
            <Route path="/dashboard" element={<Home />} />
            <Route path="/me" element={<Navigate to="/profile" replace />} />
            <Route path="/services" element={<Navigate to="/partners" replace />} />
            <Route path="/account/patient" element={<AccountPatient />} />
            <Route path="/account/clinic" element={<AccountClinic />} />
            <Route path="/account/partner" element={<AccountPartner />} />

            {/* Legacy persona/journey routes — redirect to new modules */}
            <Route path="/explorer"            element={<Navigate to="/profile" replace />} />
            <Route path="/navigator"           element={<Navigate to="/clinics" replace />} />
            <Route path="/expert"              element={<Navigate to="/profile" replace />} />
            <Route path="/donor"               element={<Navigate to="/profile" replace />} />
            <Route path="/freezing"            element={<Navigate to="/profile" replace />} />
            <Route path="/home-legacy"         element={<Navigate to="/" replace />} />
            <Route path="/patient"             element={<Navigate to="/profile" replace />} />
            <Route path="/patient/unlock"      element={<Navigate to="/partners" replace />} />
            <Route path="/patient/advanced"    element={<Navigate to="/partners" replace />} />
            <Route path="/patient/referral"    element={<Navigate to="/clinics" replace />} />
            <Route path="/assessment"          element={<Navigate to="/profile" replace />} />
            <Route path="/assessment/advanced" element={<Navigate to="/profile" replace />} />
            <Route path="/results"             element={<Navigate to="/clinics" replace />} />

            {/* Clinic / admin / misc */}
            <Route path="/clinic" element={<ClinicLanding />} />
            <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/import" element={<Import />} />
            <Route path="/admin/pricing-dashboard" element={<AdminPricingDashboard />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/clinic-discovery" element={<AdminClinicDiscovery />} />
            <Route path="/egg-bank" element={<EggBank />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutSwitch>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
