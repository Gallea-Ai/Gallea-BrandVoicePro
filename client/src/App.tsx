import { useState, useCallback, useEffect } from "react";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PenLine,
  BookOpen,
  BarChart3,
  AudioWaveform,
  Settings,
  HelpCircle,
  LogOut,
  Loader2,
  Menu,
  X,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

// Pages
import {
  WelcomePage,
  SignInPage,
  SignUpPage,
  ResetPasswordPage,
  PricingPage,
  CompanySetupPage,
  WorkspaceSetupPage,
  JoinTeamPage,
} from "@/pages/auth";
import AssessmentPage from "@/pages/assessment";
import CreatePage from "@/pages/create-page";
import LibraryPage from "@/pages/library-page";
import AnalyticsPage from "@/pages/analytics-page";
import BrandVoicePage from "@/pages/brand-voice-page";
import SettingsPage from "@/pages/settings-page";
import FaqPage from "@/pages/faq-page";

type AppView =
  | "welcome" | "signin" | "signup" | "pricing" | "company-setup"
  | "workspace-setup" | "join-team" | "reset-password" | "assessment"
  | "create" | "library" | "analytics" | "brand-voice" | "settings" | "faq";

interface AppUser {
  id: number;
  username: string;
  fullName: string;
  jobTitle: string | null;
  role: string;
  companyId: number | null;
}

interface AppCompany {
  id: number;
  name: string;
  logo: string | null;
  primaryColor: string;
  accessCode: string;
  plan: string;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { view: "create" as const, label: "Create", icon: PenLine },
  { view: "library" as const, label: "My Content", icon: BookOpen },
];

const BOTTOM_NAV = [
  { view: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { view: "brand-voice" as const, label: "My Brand", icon: AudioWaveform },
  { view: "settings" as const, label: "Settings", icon: Settings },
  { view: "faq" as const, label: "Help", icon: HelpCircle },
];

function Sidebar({
  currentView,
  onNavigate,
  user,
  company,
  brandProfile,
  onSignOut,
  onInviteTeam,
  isMobile,
  onClose,
}: {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: AppUser;
  company: AppCompany | null;
  brandProfile: any;
  onSignOut: () => void;
  onInviteTeam: () => void;
  isMobile: boolean;
  onClose: () => void;
}) {
  const voiceActive = !!brandProfile;
  const territories = brandProfile?.emotionalTerritories
    ? JSON.parse(brandProfile.emotionalTerritories)
    : null;

  // Find the dominant territory
  let dominantTerritory = "";
  if (territories) {
    const entries = Object.entries(territories) as [string, number][];
    entries.sort((a, b) => (b[1] as number) - (a[1] as number));
    dominantTerritory = entries[0]?.[0]
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "";
  }

  const handleNav = (view: AppView) => {
    onNavigate(view);
    if (isMobile) onClose();
  };

  return (
    <aside className="w-52 min-h-screen bg-card border-r border-border flex flex-col py-5 px-3" data-testid="sidebar">
      {/* Close button on mobile */}
      {isMobile && (
        <button
          onClick={onClose}
          className="self-end mb-2 p-1 rounded-md hover:bg-muted/50 transition-colors"
          data-testid="button-close-sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Logo */}
      <div className="px-2 mb-4">
        <h1 className="text-base font-bold tracking-tight" data-testid="text-logo">Gallea Ai</h1>
        {voiceActive && (
          <div className="mt-2 text-xs space-y-1">
            <p className="text-green-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              Voice Ready
            </p>
            <p className="text-foreground font-medium">{dominantTerritory}</p>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${brandProfile?.singularityScore || 0}%` }}
                />
              </div>
              <span className="text-amber-600 text-[10px] font-medium">{brandProfile?.singularityScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => handleNav(view)}
            data-testid={`nav-${view}`}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
              currentView === view
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-0.5 border-t border-border pt-3 mt-3">
        {BOTTOM_NAV.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => handleNav(view)}
            data-testid={`nav-${view}`}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
              currentView === view
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}

        {/* Invite Team button (admin only) */}
        {user.role === "admin" && company && (
          <button
            onClick={() => {
              onInviteTeam();
              if (isMobile) onClose();
            }}
            data-testid="button-invite-team"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Users className="w-4 h-4" />
            Invite Team
          </button>
        )}
      </div>

      {/* User */}
      <div className="border-t border-border pt-3 mt-3 px-2">
        <p className="text-sm font-medium truncate">Hey, {user.fullName.split(" ")[0]}</p>
        <button
          onClick={() => {
            onSignOut();
            if (isMobile) onClose();
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1 transition-colors"
          data-testid="button-sign-out"
        >
          <LogOut className="w-3 h-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Invite Team Modal ─────────────────────────────────────────────────────────

function InviteTeamModal({
  open,
  onClose,
  accessCode,
}: {
  open: boolean;
  onClose: () => void;
  accessCode: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="modal-invite-team">
        <DialogHeader>
          <DialogTitle>Invite Your Team</DialogTitle>
          <DialogDescription>
            Share this code with your teammates so they can join your workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border border-border bg-muted/50 px-4 py-3 text-center">
              <span className="text-2xl font-mono font-bold tracking-widest" data-testid="text-access-code">
                {accessCode}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              data-testid="button-copy-access-code"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Team members can enter this code during sign-up to join your company workspace.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main App Content ─────────────────────────────────────────────────────────

function AppContent() {
  const [view, setView] = useState<AppView>("welcome");
  const [user, setUser] = useState<AppUser | null>(null);
  const [company, setCompany] = useState<AppCompany | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("individual");
  const [contentVersion, setContentVersion] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { toast } = useToast();

  // ── Responsive listener ──
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Session persistence: check for existing session on load ──
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (data.company) {
            setCompany(data.company);
            setView("create");
          } else {
            setView("workspace-setup");
          }
        }
      } catch {
        // No session — stay on welcome
      } finally {
        setSessionLoading(false);
      }
    };
    checkSession();
  }, []);

  // ── OAuth callback handler ──
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("auth=success")) {
      const params = new URLSearchParams(hash.replace(/^#\/\?/, ""));
      const userId = params.get("userId");
      const username = params.get("username");
      const fullName = params.get("fullName");
      const role = params.get("role");
      const companyId = params.get("companyId");

      if (userId && username && fullName) {
        const oauthUser: AppUser = {
          id: parseInt(userId),
          username: decodeURIComponent(username),
          fullName: decodeURIComponent(fullName),
          jobTitle: null,
          role: role || "admin",
          companyId: companyId ? parseInt(companyId) : null,
        };
        setUser(oauthUser);

        // Save session for persistence (visitor ID sent automatically via apiRequest)
        apiRequest("POST", "/api/auth/session", { userId: oauthUser.id }).catch(() => {});

        if (oauthUser.companyId) {
          apiRequest("GET", `/api/companies/${oauthUser.companyId}`)
            .then(r => r.json())
            .then(c => {
              setCompany(c);
              setView("create");
            })
            .catch(() => setView("workspace-setup"));
        } else {
          setView("workspace-setup");
        }

        window.location.hash = "#/";
        toast({ title: "Signed in successfully", description: `Welcome, ${decodeURIComponent(fullName)}` });
      }
    } else if (hash.includes("auth=failed")) {
      toast({ title: "Sign in failed", description: "OAuth authentication was unsuccessful. Try again or use email/password.", variant: "destructive" });
      window.location.hash = "#/";
    }
  }, []);

  // Fetch brand voice profile when logged in
  const { data: brandProfile, refetch: refetchBrandProfile } = useQuery({
    queryKey: ["/api/brand-voice", company?.id],
    queryFn: async () => {
      if (!company?.id) return null;
      try {
        const res = await apiRequest("GET", `/api/brand-voice/${company.id}`);
        return await res.json();
      } catch { return null; }
    },
    enabled: !!company?.id,
  });

  // Generate brand voice from assessment
  const generateBrandVoice = useMutation({
    mutationFn: async (assessmentData: Record<string, any>[]) => {
      const res = await apiRequest("POST", "/api/brand-voice/generate", {
        companyId: company!.id,
        assessmentData,
      });
      return await res.json();
    },
    onSuccess: () => {
      refetchBrandProfile();
      setView("brand-voice");
      toast({ title: "Brand voice profile generated", description: "Your brand DNA has been analyzed and your voice profile is ready." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleNavigate = useCallback((v: string) => setView(v as AppView), []);

  const handleAuth = useCallback(async (userData: any, companyData: any) => {
    setUser(userData);

    // Save session for persistence (visitor ID sent automatically via apiRequest)
    if (userData?.id) {
      try {
        await apiRequest("POST", "/api/auth/session", { userId: userData.id });
      } catch {}
    }

    if (companyData) {
      setCompany(companyData);
      try {
        const res = await apiRequest("GET", `/api/brand-voice/${companyData.id}`);
        if (res.ok) {
          setView("create");
        } else {
          setView("assessment");
        }
      } catch {
        setView("assessment");
      }
    } else {
      setView("workspace-setup");
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    // Destroy session on server (visitor ID sent automatically via apiRequest)
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch {}
    setUser(null);
    setCompany(null);
    setView("welcome");
  }, []);

  const handleAssessmentComplete = useCallback((responses: Record<string, any>[]) => {
    generateBrandVoice.mutate(responses);
  }, [generateBrandVoice]);

  const handleContentGenerated = useCallback(() => {
    setContentVersion(prev => prev + 1);
  }, []);

  // ─── Loading spinner while checking session ──
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" data-testid="spinner-session" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // ─── Auth screens ──
  if (!user) {
    switch (view) {
      case "signin":
        return <SignInPage onNavigate={handleNavigate} onAuth={handleAuth} />;
      case "signup":
        return <SignUpPage onNavigate={handleNavigate} onAuth={handleAuth} />;
      case "reset-password":
        return <ResetPasswordPage onNavigate={handleNavigate} onAuth={handleAuth} />;
      case "pricing":
        return <PricingPage onNavigate={(v) => {
          if (v === "company-setup") {
            handleNavigate("company-setup");
          } else {
            handleNavigate(v);
          }
        }} onAuth={handleAuth} />;
      case "company-setup":
        return <CompanySetupPage onNavigate={handleNavigate} onAuth={handleAuth} />;
      case "workspace-setup":
        return <WorkspaceSetupPage onNavigate={handleNavigate} onAuth={handleAuth} />;
      case "join-team":
        return <JoinTeamPage onNavigate={handleNavigate} onAuth={handleAuth} />;
      default:
        return <WelcomePage onNavigate={handleNavigate} onAuth={handleAuth} />;
    }
  }

  // ─── Workspace setup (after signup, before company) ──
  if (!company) {
    switch (view) {
      case "workspace-setup":
        return <WorkspaceSetupPage onNavigate={handleNavigate} onAuth={handleAuth} />;
      case "company-setup":
        return <CompanySetupPage onNavigate={handleNavigate} onAuth={(u, c) => {
          if (c) setCompany(c);
          setUser(prev => prev ? { ...prev, companyId: c?.id || null } : null);
          setView("assessment");
        }} />;
      case "join-team":
        return <JoinTeamPage onNavigate={handleNavigate} onAuth={(u, c) => {
          if (c) setCompany(c);
          setUser(prev => prev ? { ...prev, companyId: c?.id || null } : null);
          setView("create");
        }} />;
      case "pricing":
        return <PricingPage onNavigate={handleNavigate} onAuth={handleAuth} />;
      default:
        return <WorkspaceSetupPage onNavigate={handleNavigate} onAuth={handleAuth} />;
    }
  }

  // ─── Assessment (generating brand voice) ──
  if (view === "assessment") {
    if (generateBrandVoice.isPending) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
          <p className="text-lg font-medium">Analyzing your brand DNA...</p>
          <p className="text-sm text-muted-foreground">Building voice rules, channel profiles, and archetype mapping</p>
        </div>
      );
    }
    return (
      <AssessmentPage
        onComplete={handleAssessmentComplete}
        onBack={() => setView("create")}
        companyId={company?.id}
        userId={user?.id}
      />
    );
  }

  // ─── Main app with sidebar ──
  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile top bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 h-12 bg-card border-b border-border flex items-center px-3" data-testid="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
            data-testid="button-hamburger"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="ml-2 text-sm font-bold tracking-tight">Gallea Ai</h1>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-backdrop"
        >
          <div
            className="absolute left-0 top-0 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              currentView={view}
              onNavigate={setView}
              user={user}
              company={company}
              brandProfile={brandProfile}
              onSignOut={handleSignOut}
              onInviteTeam={() => setInviteModalOpen(true)}
              isMobile={true}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          currentView={view}
          onNavigate={setView}
          user={user}
          company={company}
          brandProfile={brandProfile}
          onSignOut={handleSignOut}
          onInviteTeam={() => setInviteModalOpen(true)}
          isMobile={false}
          onClose={() => {}}
        />
      )}

      {/* Invite Team Modal */}
      {company && (
        <InviteTeamModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          accessCode={company.accessCode}
        />
      )}

      <main className={`flex-1 overflow-auto ${isMobile ? "pt-12" : ""}`}>
        {view === "create" && (
          <CreatePage user={user} brandProfile={brandProfile} onContentGenerated={handleContentGenerated} />
        )}
        {view === "library" && <LibraryPage user={user} key={contentVersion} onNavigateToCreate={() => setView("create")} />}
        {view === "analytics" && <AnalyticsPage user={user} />}
        {view === "brand-voice" && (
          <BrandVoicePage
            brandProfile={brandProfile}
            onRetakeAssessment={() => setView("assessment")}
          />
        )}
        {view === "settings" && (
          <SettingsPage
            user={user}
            company={company}
            onUpdateCompany={(updates) => {
              setCompany(prev => prev ? { ...prev, ...updates } : null);
            }}
          />
        )}
        {view === "faq" && <FaqPage />}
        <PerplexityAttribution />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
