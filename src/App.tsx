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
import { WidgetLayout } from "./components/WidgetLayout.tsx";
import WidgetFivMadrid from "./pages/widgets/WidgetFivMadrid.tsx";
import AdminPartners from "./pages/AdminPartners.tsx";
import AdminMvp from "./pages/AdminMvp.tsx";
import { AdminLayout } from "./components/admin/AdminLayout.tsx";
import AdminDataIntelligence from "./pages/admin/AdminDataIntelligence.tsx";
import AdminPatientOps from "./pages/admin/AdminPatientOps.tsx";
import AdminClinicOps from "./pages/admin/AdminClinicOps.tsx";
import AdminWidgetPartners from "./pages/admin/AdminWidgetPartners.tsx";
import AdminServicePartners from "./pages/admin/AdminServicePartners.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminUpload from "./pages/AdminUpload.tsx";
import AdminNormalizePrices from "./pages/AdminNormalizePrices.tsx";
import AdminPatientPreview from "./pages/AdminPatientPreview.tsx";
import AdminDemo from "./pages/AdminDemo.tsx";
import { AdminModeButton } from "./components/AdminModeButton.tsx";
import CommunityV2 from "./pages/CommunityV2.tsx";
import ClinicLanding from "./pages/ClinicLanding.tsx";
import ClinicDashboard from "./pages/ClinicDashboard.tsx";
import Partners from "./pages/Partners.tsx";
import Insights from "./pages/Insights.tsx";
import Import from "./pages/Import.tsx";
import AdminPricingDashboard from "./pages/AdminPricingDashboard.tsx";
import AdminPricing from "./pages/AdminPricing.tsx";
import AdminClinicDiscovery from "./pages/AdminClinicDiscovery.tsx";
import AdminDataImport from "./pages/AdminDataImport.tsx";
import AdminPricingSources from "./pages/AdminPricingSources.tsx";
import Admin from "./pages/Admin.tsx";
import AccountPatient from "./pages/AccountPatient.tsx";
import AccountClinic from "./pages/AccountClinic.tsx";
import AccountPartner from "./pages/AccountPartner.tsx";
import EggBank from "./pages/EggBank.tsx";
import PricingLab from "./pages/PricingLab.tsx";
import PatientProfile from "./pages/PatientProfile.tsx";
import ClarityAssessment from "./pages/ClarityAssessment.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const PUBLIC_PATHS = new Set<string>(["/"]);

function LayoutSwitch({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  if (pathname.startsWith("/widgets/")) {
    return <WidgetLayout>{children}</WidgetLayout>;
  }
  // Admin Operating System owns its own chrome (sidebar + topbar) via <AdminLayout>
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }
  if (PUBLIC_PATHS.has(pathname)) {
    return <><PublicLayout>{children}</PublicLayout><AdminModeButton /></>;
  }
  return <><AppLayout>{children}</AppLayout><AdminModeButton /></>;
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
            <Route path="/clarity-assessment" element={<ClarityAssessment />} />
            <Route path="/situacion" element={<Navigate to="/profile" replace />} />
            <Route path="/orientacion" element={<Navigate to="/clarity-assessment" replace />} />
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
            {/* Admin Operating System — nested under persistent AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminMvp />} />
              <Route path="mvp" element={<AdminMvp />} />
              <Route path="legacy" element={<Admin />} />

              {/* Data Intelligence */}
              <Route path="data" element={<AdminDataIntelligence />} />
              <Route path="data/imports" element={<AdminUpload />} />
              <Route path="upload" element={<AdminUpload />} />
              <Route path="data-import" element={<AdminDataImport />} />
              <Route path="import" element={<Import />} />
              <Route path="pricing-sources" element={<AdminPricingSources />} />
              <Route path="normalize-prices" element={<AdminNormalizePrices />} />
              <Route path="patient-preview" element={<AdminPatientPreview />} />
              <Route path="pricing-dashboard" element={<AdminPricingDashboard />} />
              <Route path="pricing" element={<AdminPricing />} />

              {/* Patient Operations */}
              <Route path="patients" element={<AdminPatientOps />} />
              <Route path="patients/:tab" element={<AdminPatientOps />} />

              {/* Clinic Operations */}
              <Route path="clinics" element={<AdminClinicOps />} />
              <Route path="clinic-discovery" element={<AdminClinicDiscovery />} />
              <Route path="clinics/:tab" element={<AdminClinicOps />} />

              {/* Widget Partners */}
              <Route path="widget-partners" element={<AdminWidgetPartners />} />
              <Route path="widget-partners/:tab" element={<AdminWidgetPartners />} />
              <Route path="partners" element={<AdminPartners />} />

              {/* Service Partners */}
              <Route path="service-partners" element={<AdminServicePartners />} />
              <Route path="service-partners/:tab" element={<AdminServicePartners />} />

              <Route path="demo" element={<AdminDemo />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Embeddable widgets — chromeless layout for iframe distribution */}
            <Route path="/widgets/fiv-madrid" element={<WidgetFivMadrid />} />
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
