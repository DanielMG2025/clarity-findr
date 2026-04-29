import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  MessagesSquare,
  Database,
  CreditCard,
  Target,
  BarChart3,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

import OverviewTab from "@/components/admin/OverviewTab";
import PatientsTab from "@/components/admin/PatientsTab";
import ClinicsTab from "@/components/admin/ClinicsTab";
import PartnersTab from "@/components/admin/PartnersTab";
import CommunityTab from "@/components/admin/CommunityTab";
import LeadsTab from "@/components/admin/LeadsTab";
import MonetizationTab from "@/components/admin/MonetizationTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";

const TABS = [
  { v: "overview", icon: LayoutDashboard, label: "Overview" },
  { v: "patients", icon: Users, label: "Patients" },
  { v: "clinics", icon: Building2, label: "Clinics" },
  { v: "partners", icon: Handshake, label: "Partners" },
  { v: "community", icon: MessagesSquare, label: "Community" },
  { v: "leads", icon: Target, label: "Leads" },
  { v: "monetization", icon: CreditCard, label: "Monetization" },
  { v: "data-engine", icon: Database, label: "Data engine" },
  { v: "analytics", icon: BarChart3, label: "Analytics" },
];

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="container max-w-7xl py-8 md:py-10 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <ShieldCheck className="size-3 mr-1" /> Admin · mock auth
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Roles: patient · clinic · partner · admin
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold">Platform admin</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                One control surface for patients, clinics, partners, the community, monetization and the
                data engine. Every section is read-only in this build — moderation and write actions are
                stubbed pending real admin auth.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/admin/pricing-dashboard">
                Open standalone data dashboard <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto -mx-2 px-2">
              <TabsList className="inline-flex w-auto">
                {TABS.map((t) => (
                  <TabsTrigger key={t.v} value={t.v} className="text-xs md:text-sm">
                    <t.icon className="size-3.5 mr-1.5" /> {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-6">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="patients" className="mt-6">
              <PatientsTab />
            </TabsContent>
            <TabsContent value="clinics" className="mt-6">
              <ClinicsTab />
            </TabsContent>
            <TabsContent value="partners" className="mt-6">
              <PartnersTab />
            </TabsContent>
            <TabsContent value="community" className="mt-6">
              <CommunityTab />
            </TabsContent>
            <TabsContent value="leads" className="mt-6">
              <LeadsTab />
            </TabsContent>
            <TabsContent value="monetization" className="mt-6">
              <MonetizationTab />
            </TabsContent>
            <TabsContent value="data-engine" className="mt-6">
              <div className="rounded-xl border-2 border-dashed bg-card p-6 text-sm text-muted-foreground">
                <p className="mb-3">
                  <span className="font-semibold text-foreground">Data engine lives in a dedicated dashboard</span> —
                  it has its own deep tooling for raw vs normalized pricing, matching accuracy and dataset growth.
                </p>
                <Button asChild variant="hero">
                  <Link to="/admin/pricing-dashboard">
                    Open data engine dashboard <ExternalLink className="size-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="mt-6">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Admin;
