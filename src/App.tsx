import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home.tsx";
import HomeV2 from "./pages/HomeV2.tsx";
import { AppLayout } from "./components/AppLayout.tsx";
import Explorer from "./pages/Explorer.tsx";
import Navigator from "./pages/Navigator.tsx";
import Expert from "./pages/Expert.tsx";
import Donor from "./pages/Donor.tsx";
import Freezing from "./pages/Freezing.tsx";
import CommunityV2 from "./pages/CommunityV2.tsx";
import PatientFlow from "./pages/PatientFlow.tsx";
import PatientUnlock from "./pages/PatientUnlock.tsx";
import PatientAdvanced from "./pages/PatientAdvanced.tsx";
import PatientReferral from "./pages/PatientReferral.tsx";
import ClinicLanding from "./pages/ClinicLanding.tsx";
import ClinicDashboard from "./pages/ClinicDashboard.tsx";
import Partners from "./pages/Partners.tsx";
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
import PricingLab from "./pages/PricingLab.tsx";
import PatientProfile from "./pages/PatientProfile.tsx";
import NotFound from "./pages/NotFound.tsx";
import { JourneyResumeBanner } from "./components/shared/JourneyResumeBanner.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
        <JourneyResumeBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home-legacy" element={<HomeV2 />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/navigator" element={<Navigator />} />
          <Route path="/expert" element={<Expert />} />
          <Route path="/donor" element={<Donor />} />
          <Route path="/freezing" element={<Freezing />} />
          <Route path="/patient" element={<PatientFlow />} />
          <Route path="/patient/unlock" element={<PatientUnlock />} />
          <Route path="/patient/advanced" element={<PatientAdvanced />} />
          <Route path="/patient/referral" element={<PatientReferral />} />
          <Route path="/clinic" element={<ClinicLanding />} />
          <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/community" element={<CommunityV2 />} />
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
          <Route path="/pricing-lab" element={<PricingLab />} />
          <Route path="/profile" element={<PatientProfile />} />
          <Route path="/me" element={<PatientProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
