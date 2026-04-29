import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import PatientFlow from "./pages/PatientFlow.tsx";
import PatientUnlock from "./pages/PatientUnlock.tsx";
import PatientAdvanced from "./pages/PatientAdvanced.tsx";
import PatientReferral from "./pages/PatientReferral.tsx";
import ClinicLanding from "./pages/ClinicLanding.tsx";
import ClinicDashboard from "./pages/ClinicDashboard.tsx";
import Partners from "./pages/Partners.tsx";
import Community from "./pages/Community.tsx";
import Assessment from "./pages/Assessment.tsx";
import AssessmentAdvanced from "./pages/AssessmentAdvanced.tsx";
import Results from "./pages/Results.tsx";
import Insights from "./pages/Insights.tsx";
import Import from "./pages/Import.tsx";
import AdminPricingDashboard from "./pages/AdminPricingDashboard.tsx";
import Admin from "./pages/Admin.tsx";
import AccountHub from "./pages/AccountHub.tsx";
import AccountPatient from "./pages/AccountPatient.tsx";
import AccountClinic from "./pages/AccountClinic.tsx";
import AccountPartner from "./pages/AccountPartner.tsx";
import EggBank from "./pages/EggBank.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/patient" element={<PatientFlow />} />
          <Route path="/patient/unlock" element={<PatientUnlock />} />
          <Route path="/patient/advanced" element={<PatientAdvanced />} />
          <Route path="/patient/referral" element={<PatientReferral />} />
          <Route path="/clinic" element={<ClinicLanding />} />
          <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/community" element={<Community />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/advanced" element={<AssessmentAdvanced />} />
          <Route path="/results" element={<Results />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/account" element={<AccountHub />} />
          <Route path="/account/patient" element={<AccountPatient />} />
          <Route path="/account/clinic" element={<AccountClinic />} />
          <Route path="/account/partner" element={<AccountPartner />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/import" element={<Import />} />
          <Route path="/admin/pricing-dashboard" element={<AdminPricingDashboard />} />
          <Route path="/egg-bank" element={<EggBank />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
