import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const AdminSettings = () => (
  <AdminShell title="Settings" subtitle="Admin Operating System preferences and environment.">
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Environment</h3>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Demo</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Switch the environment label shown in the topbar. Affects only the visual badge.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Demo</Button>
          <Button size="sm" variant="outline">Staging</Button>
          <Button size="sm" variant="outline">Production</Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Patient-facing publishing</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="auto" className="text-sm">Require manual approval before publishing prices</Label>
          <Switch id="auto" defaultChecked />
        </div>
        <p className="text-xs text-muted-foreground">Recommended. Prevents unreviewed pricing from going live.</p>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Admin profile</h3>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs">Display name</Label>
          <Input id="name" defaultValue="Fertility Compass" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs">Email</Label>
          <Input id="email" defaultValue="ops@fertilitycompass.eu" />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Notifications</h3>
        {["New imports", "Sources needing review", "Patient quotes", "Partner alerts"].map((n) => (
          <div key={n} className="flex items-center justify-between">
            <Label className="text-sm">{n}</Label>
            <Switch defaultChecked />
          </div>
        ))}
      </Card>
    </div>
  </AdminShell>
);

export default AdminSettings;
