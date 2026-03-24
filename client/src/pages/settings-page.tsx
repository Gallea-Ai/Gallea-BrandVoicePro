import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, Trash2, Copy, Check, Users, Shield, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User, Company } from "@shared/schema";

interface SettingsPageProps {
  user: User;
  company: Company | null;
  onUpdateCompany: (updates: Partial<Company>) => void;
}

interface TeamMember {
  id: number;
  fullName: string;
  role: string;
  username: string;
}

export default function SettingsPage({
  user,
  company,
  onUpdateCompany,
}: SettingsPageProps) {
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState(
    company?.primaryColor || "#000000"
  );
  const [logoDisplay, setLogoDisplay] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const isAdmin = user.role === "admin";

  // Fetch team members
  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/companies", company?.id, "members"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/companies/${company?.id}/members`
      );
      return res.json();
    },
    enabled: !!company?.id,
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      await apiRequest(
        "DELETE",
        `/api/companies/${company?.id}/members/${memberId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/companies", company?.id, "members"],
      });
      toast({ title: "Team member removed" });
    },
  });

  const handleCopyAccessCode = async () => {
    if (!company?.accessCode) return;
    try {
      await navigator.clipboard.writeText(company.accessCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleColorSave = () => {
    onUpdateCompany({ primaryColor });
    toast({ title: "Brand colour saved" });
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="settings-page">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" data-testid="text-page-title">
          Settings
        </h1>
      </div>

      {/* Invite Team Card — admin only, shown first */}
      {isAdmin && company && (
        <Card className="mb-6 border-primary/20 bg-primary/5" data-testid="card-invite-team">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold mb-1">Invite Your Team</h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Share this access code with teammates so they can join your workspace.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-center">
                    <span className="text-lg font-mono font-bold tracking-widest" data-testid="text-invite-access-code">
                      {company.accessCode}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyAccessCode}
                    data-testid="button-copy-invite-code"
                  >
                    {codeCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members — admin only */}
      {isAdmin && <Card className="mb-6" data-testid="card-team-members">
        <CardContent className="p-5">
          <h2 className="text-sm font-medium mb-4">Team Members</h2>
          <div className="space-y-3">
            {/* Current user always shown */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium"
                  data-testid="avatar-current-user"
                >
                  {user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.username}
                  </p>
                </div>
              </div>
              <Badge
                className={`text-xs gap-1 ${
                  user.role === "admin"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-secondary text-secondary-foreground"
                }`}
                variant="outline"
                data-testid="badge-role-current"
              >
                {user.role === "admin" ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                {user.role === "admin" ? "Admin" : "Member"}
              </Badge>
            </div>

            {/* Other team members */}
            {teamMembers
              ?.filter((m) => m.id !== user.id)
              .map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2"
                  data-testid={`row-member-${member.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">
                      {member.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs gap-1 ${
                        member.role === "admin"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {member.role === "admin" ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {member.role === "admin" ? "Admin" : "Member"}
                    </Badge>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        data-testid={`button-remove-${member.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

            {(!teamMembers || teamMembers.length <= 1) && (
              <p className="text-xs text-muted-foreground py-2">
                No other team members yet. Share your access code to invite
                teammates.
              </p>
            )}
          </div>
        </CardContent>
      </Card>}

      {/* Accordion sections */}
      <Accordion
        type="multiple"
        defaultValue={isAdmin ? ["access-key"] : []}
        className="space-y-2"
        data-testid="settings-accordion"
      >
        {/* Company Logo — admin only */}
        {isAdmin && (
          <AccordionItem
            value="company-logo"
            className="bg-card rounded-lg border px-4"
          >
            <AccordionTrigger
              className="text-sm font-medium"
              data-testid="trigger-company-logo"
            >
              Company Logo
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-foreground/20 transition-colors"
                  data-testid="upload-logo-area"
                >
                  <Upload className="w-6 h-6 mb-2 opacity-50" />
                  <p className="text-xs">Click or drag to upload your logo</p>
                  <p className="text-[10px] mt-1 opacity-60">
                    PNG, SVG, or JPG up to 2MB
                  </p>
                </div>
                {company?.logo && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                      <img
                        src={company.logo}
                        alt="Company logo"
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Current logo
                    </span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Access Key — admin only */}
        {isAdmin && (
          <AccordionItem
            value="access-key"
            className="bg-card rounded-lg border px-4"
          >
            <AccordionTrigger
              className="text-sm font-medium"
              data-testid="trigger-access-key"
            >
              Access Key
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Share this code with your team so they can join your workspace.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-center">
                    <span className="text-lg font-mono font-bold tracking-widest" data-testid="input-access-code">
                      {company?.accessCode || "—"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleCopyAccessCode}
                    className="h-10 px-4"
                    data-testid="button-copy-access-code"
                  >
                    {codeCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1.5 text-sm">{codeCopied ? "Copied!" : "Copy"}</span>
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Logo Display */}
        <AccordionItem
          value="logo-display"
          className="bg-card rounded-lg border px-4"
        >
          <AccordionTrigger
            className="text-sm font-medium"
            data-testid="trigger-logo-display"
          >
            Logo Display
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-logo" className="text-sm">
                  Show logo in generated content
                </Label>
                <Switch
                  id="show-logo"
                  checked={logoDisplay}
                  onCheckedChange={setLogoDisplay}
                  data-testid="switch-logo-display"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="logo-header" className="text-sm">
                  Display logo in header
                </Label>
                <Switch
                  id="logo-header"
                  defaultChecked
                  data-testid="switch-logo-header"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Colours */}
        <AccordionItem
          value="brand-colours"
          className="bg-card rounded-lg border px-4"
        >
          <AccordionTrigger
            className="text-sm font-medium"
            data-testid="trigger-brand-colours"
          >
            Brand Colours
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-2 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Primary Brand Colour
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: primaryColor }}
                    data-testid="color-preview"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#000000"
                    className="font-mono text-sm w-32 bg-background"
                    data-testid="input-primary-color"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleColorSave}
                    data-testid="button-save-color"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Format Presets */}
        <AccordionItem
          value="format-presets"
          className="bg-card rounded-lg border px-4"
        >
          <AccordionTrigger
            className="text-sm font-medium"
            data-testid="trigger-format-presets"
          >
            Format Presets
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-2">
              <p className="text-xs text-muted-foreground">
                Custom format presets for generated content coming soon.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Account */}
        <AccordionItem
          value="account"
          className="bg-card rounded-lg border px-4"
        >
          <AccordionTrigger
            className="text-sm font-medium"
            data-testid="trigger-account"
          >
            Account
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-2 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Full Name
                </Label>
                <p className="text-sm" data-testid="text-account-name">
                  {user.fullName}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm" data-testid="text-account-email">
                  {user.username}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Role</Label>
                <p className="text-sm capitalize" data-testid="text-account-role">
                  {user.role}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Company
                </Label>
                <p className="text-sm" data-testid="text-account-company">
                  {company?.name || "—"}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Plan</Label>
                <p className="text-sm capitalize" data-testid="text-account-plan">
                  {company?.plan || "—"}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
