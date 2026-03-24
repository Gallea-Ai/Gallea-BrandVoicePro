import { useState, useCallback, useEffect } from "react";
import { queryClient, apiRequest, clearVisitorId } from "./lib/queryClient";
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
  ChevronLeft,
} from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

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
  AssessmentIntroPage,
} from "@/pages/auth";
import AssessmentPage from "@/pages/assessment";
import CreatePage from "@/pages/create-page";
import LibraryPage from "@/pages/library-page";
import AnalyticsPage from "@/pages/analytics-page";
import BrandVoicePage from "@/pages/brand-voice-page";
import SettingsPage from "@/pages/settings-page";
import FaqPage from "@/pages/faq-page";
import ProcessingPage from "@/pages/processing-page";

type AppView =
  | "welcome" | "signin" | "signup" | "pricing" | "company-setup"
  | "workspace-setup" | "join-team" | "reset-password" | "assessment-intro" | "assessment"
  | "processing" | "create" | "library" | "analytics" | "brand-voice" | "settings" | "faq";

// Map view names to URL paths
const VIEW_TO_PATH: Record<string, string> = {
  welcome: "/",
  signin: "/login",
  signup: "/signup",
  "reset-password": "/reset-password",
  pricing: "/pricing",
  "company-setup": "/company-setup",
  "workspace-setup": "/workspace-setup",
  "join-team": "/join",
  "assessment-intro": "/assessment-intro",
  assessment: "/assessment",
  processing: "/processing",
  create: "/create",
  library: "/library",
  analytics: "/analytics",
  "brand-voice": "/brand-voice",
  settings: "/settings",
  faq: "/faq",
};

// Map URL paths back to view names
const PATH_TO_VIEW: Record<string, AppView> = {
  "/": "welcome",
  "/login": "signin",
  "/signup": "signup",
  "/reset-password": "reset-password",
  "/pricing": "pricing",
  "/company-setup": "company-setup",
  "/workspace-setup": "workspace-setup",
  "/join": "join-team",
  "/assessment-intro": "assessment-intro",
  "/assessment": "assessment",
  "/processing": "processing",
  "/create": "create",
  "/library": "library",
  "/analytics": "analytics",
  "/brand-voice": "brand-voice",
  "/settings": "settings",
  "/faq": "faq",
};

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
  { view: "library" as const, label: "Library", icon: BookOpen },
];

const BOTTOM_NAV = [
  { view: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { view: "brand-voice" as const, label: "Brand Voice", icon: AudioWaveform },
  { view: "settings" as const, label: "Settings", icon: Settings },
  { view: "faq" as const, label: "FAQ", icon: HelpCircle },
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
  collapsed,
  onToggleCollapse,
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
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const voiceActive = !!brandProfile;
  const territories = brandProfile?.emotionalTerritories
    ? JSON.parse(brandProfile.emotionalTerritories)
    : null;

  // Find the dominant territory
  let dominantTerritory = "";
  let intensityScore = 0;
  if (territories) {
    const entries = Object.entries(territories) as [string, number][];
    entries.sort((a, b) => (b[1] as number) - (a[1] as number));
    dominantTerritory = entries[0]?.[0]
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "";
    // Derive intensity from top territory score (0-100 mapped to 1-10)
    intensityScore = Math.max(1, Math.min(10, Math.round((entries[0]?.[1] as number || 50) / 10)));
  }

  const handleNav = (view: AppView) => {
    onNavigate(view);
    if (isMobile) onClose();
  };

  if (collapsed && !isMobile) {
    return (
      <aside
        className="fixed top-0 left-0 w-10 h-screen bg-white border-r border-[#E5E5E5] flex flex-col items-center py-4 overflow-hidden z-30"
        data-testid="sidebar-collapsed"
      >
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-[#F0F0F0] transition-colors rotate-180"
          data-testid="button-expand-sidebar"
        >
          <ChevronLeft className="w-4 h-4 text-black" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`bg-white border-r border-[#E5E5E5] flex flex-col py-4 px-2 overflow-y-auto ${isMobile ? "" : "fixed top-0 left-0 h-screen z-30"}`}
      style={{ width: isMobile ? "200px" : "140px" }}
      data-testid="sidebar"
    >
      {/* Close button on mobile */}
      {isMobile && (
        <button
          onClick={onClose}
          className="self-end mb-2 p-1 rounded-md hover:bg-[#F0F0F0] transition-colors"
          data-testid="button-close-sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Brand Header */}
      <div className="px-1 mb-3">
        <h1 className="text-[16px] font-medium text-black" data-testid="text-logo">
          Gallea Ai
        </h1>
      </div>

      {/* Voice Status Block — card treatment */}
      {voiceActive && (
        <div className="mx-1 mb-4 p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1">
          <p className="text-[13px] font-light text-black leading-tight">Voice Active</p>
          <p className="text-[10px] font-light text-[#9B9B9B] leading-tight">Primary Territory</p>
          <p className="text-[13px] font-light text-black leading-tight">{dominantTerritory}</p>
          <p className="text-[13px] font-medium leading-tight" style={{ color: "#FF8900" }}>
            {intensityScore}/10 Core
          </p>
          <p className="text-[13px] font-light text-black leading-tight">Current Voice</p>
        </div>
      )}

      {/* Divider */}
      {voiceActive && <div className="mx-1 mb-4 border-t border-[#E5E5E5]" />}

      {/* Top Nav Group */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => handleNav(view)}
            data-testid={`nav-${view}`}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded transition-colors ${
              currentView === view
                ? "font-medium text-black underline"
                : "font-light text-black hover:bg-[#F0F0F0]"
            }`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Nav Group */}
      <div className="space-y-0.5 mt-4">
        {BOTTOM_NAV.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => handleNav(view)}
            data-testid={`nav-${view}`}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded transition-colors ${
              currentView === view
                ? "font-medium text-black underline"
                : "font-light text-black hover:bg-[#F0F0F0]"
            }`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* Footer: User + Sign Out + Collapse */}
      <div className="border-t border-[#E5E5E5] pt-2 mt-3 px-1">
        <p className="text-[14px] font-light text-black truncate">{user.fullName}</p>
        <button
          onClick={() => {
            onSignOut();
            if (isMobile) onClose();
          }}
          className="text-[14px] font-light text-black hover:underline mt-0.5"
          data-testid="button-sign-out"
        >
          Sign Out
        </button>
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 text-[12px] text-[#585858] hover:text-black mt-2 transition-colors"
            data-testid="button-collapse-sidebar"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
        )}
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

// ─── Main App Content (with react-router) ───────────────────────────────────

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [company, setCompany] = useState<AppCompany | null>(null);
  const [contentVersion, setContentVersion] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [pendingAssessmentData, setPendingAssessmentData] = useState<Record<string, any>[] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { toast } = useToast();

  // Derive current "view" from URL path for sidebar highlighting
  const currentView: AppView = PATH_TO_VIEW[location.pathname] || "welcome";

  // Navigation helper: converts view names to URL paths
  const navigateTo = useCallback((viewOrPath: string) => {
    const path = VIEW_TO_PATH[viewOrPath] || viewOrPath;
    navigate(path);
  }, [navigate]);

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
            // Only redirect to /create if on an auth page or root
            const authPaths = ["/", "/login", "/signup", "/reset-password", "/pricing", "/company-setup", "/workspace-setup", "/join"];
            if (authPaths.includes(location.pathname)) {
              navigate("/create", { replace: true });
            }
          } else {
            navigate("/workspace-setup", { replace: true });
          }
        }
      } catch {
        // No session — stay on current page
      } finally {
        setSessionLoading(false);
      }
    };
    checkSession();
  }, []);

  // ── OAuth callback handler ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get("auth");

    if (authStatus === "success") {
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

        apiRequest("POST", "/api/auth/session", { userId: oauthUser.id }).catch(() => {});

        if (oauthUser.companyId) {
          apiRequest("GET", `/api/companies/${oauthUser.companyId}`)
            .then(r => r.json())
            .then(c => {
              setCompany(c);
              navigate("/create", { replace: true });
            })
            .catch(() => navigate("/workspace-setup", { replace: true }));
        } else {
          navigate("/workspace-setup", { replace: true });
        }

        toast({ title: "Signed in successfully", description: `Welcome, ${decodeURIComponent(fullName)}` });
      }
    } else if (authStatus === "failed") {
      toast({ title: "Sign in failed", description: "OAuth authentication was unsuccessful. Try again or use email/password.", variant: "destructive" });
      navigate("/", { replace: true });
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
      setPendingAssessmentData(null);
      // Navigation handled by ProcessingPage after minimum display time
      toast({ title: "Brand voice profile generated", description: "Your brand DNA has been analyzed and your voice profile is ready." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Seed demo brand voice profile (no API key needed)
  const seedDemo = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/brand-voice/seed-demo", {
        companyId: company!.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      refetchBrandProfile();
      toast({ title: "Demo data loaded", description: "A sample brand voice profile is now available for exploration." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleAuth = useCallback(async (userData: any, companyData: any) => {
    setUser(userData);

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
          navigate("/create");
        } else {
          navigate("/assessment-intro");
        }
      } catch {
        navigate("/assessment-intro");
      }
    } else {
      // New user without company — send to pricing (next step in onboarding)
      navigate("/pricing");
    }
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch {}
    clearVisitorId();
    setUser(null);
    setCompany(null);
    navigate("/");
  }, [navigate]);

  const handleAssessmentComplete = useCallback((responses: Record<string, any>[]) => {
    setPendingAssessmentData(responses);
    generateBrandVoice.mutate(responses);
    navigate("/processing");
  }, [generateBrandVoice, navigate]);

  const handleContentGenerated = useCallback(() => {
    setContentVersion(prev => prev + 1);
  }, []);

  const handleCompanySetupAuth = useCallback((u: any, c: any) => {
    if (c) setCompany(c);
    setUser(prev => prev ? { ...prev, companyId: c?.id || null } : null);
    navigate("/assessment-intro");
  }, [navigate]);

  const handleJoinTeamAuth = useCallback((u: any, c: any) => {
    if (c) setCompany(c);
    setUser(prev => prev ? { ...prev, companyId: c?.id || null } : null);
    navigate("/create");
  }, [navigate]);

  // ─── Loading spinner while checking session ──
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" data-testid="spinner-session" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // ─── Sidebar layout wrapper for authenticated platform pages ──
  const platformPages = ["/create", "/library", "/analytics", "/brand-voice", "/settings", "/faq"];
  const isPlatformPage = platformPages.includes(location.pathname);
  const showSidebar = !!user && !!company && isPlatformPage;

  // ─── Brand voice generation state for processing screen ──
  // isIdle means mutation was never triggered — redirect away from processing
  const isApiDone = generateBrandVoice.isIdle
    ? false
    : !generateBrandVoice.isPending && (generateBrandVoice.isSuccess || generateBrandVoice.isError);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Mobile top bar (only on platform pages) */}
      {showSidebar && isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 h-12 bg-white border-b border-[#E5E5E5] flex items-center px-3" data-testid="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-[#F0F0F0] transition-colors"
            data-testid="button-hamburger"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="ml-2 text-[16px] font-medium text-black">Gallea Ai</h1>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {showSidebar && isMobile && sidebarOpen && (
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
              currentView={currentView}
              onNavigate={(v) => { navigateTo(v); setSidebarOpen(false); }}
              user={user!}
              company={company}
              brandProfile={brandProfile}
              onSignOut={handleSignOut}
              onInviteTeam={() => setInviteModalOpen(true)}
              isMobile={true}
              onClose={() => setSidebarOpen(false)}
              collapsed={false}
              onToggleCollapse={() => {}}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {showSidebar && !isMobile && (
        <Sidebar
          currentView={currentView}
          onNavigate={navigateTo}
          user={user!}
          company={company}
          brandProfile={brandProfile}
          onSignOut={handleSignOut}
          onInviteTeam={() => setInviteModalOpen(true)}
          isMobile={false}
          onClose={() => {}}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
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

      <main className={`flex-1 overflow-auto ${showSidebar && isMobile ? "pt-12" : ""}`} style={showSidebar && !isMobile ? { marginLeft: sidebarCollapsed ? "40px" : "140px" } : undefined}>
        <Routes>
          {/* ── Auth / Onboarding routes ── */}
          <Route path="/" element={
            user && company ? <Navigate to="/create" replace /> :
            <WelcomePage onNavigate={navigateTo} onAuth={handleAuth} />
          } />
          <Route path="/login" element={
            user && company ? <Navigate to="/create" replace /> :
            <SignInPage onNavigate={navigateTo} onAuth={handleAuth} />
          } />
          <Route path="/signup" element={
            user && company ? <Navigate to="/create" replace /> :
            <SignUpPage onNavigate={navigateTo} onAuth={handleAuth} />
          } />
          <Route path="/reset-password" element={
            <ResetPasswordPage onNavigate={navigateTo} onAuth={handleAuth} />
          } />
          <Route path="/pricing" element={
            <PricingPage onNavigate={navigateTo} onAuth={handleAuth} />
          } />
          <Route path="/company-setup" element={
            user ? <CompanySetupPage onNavigate={navigateTo} onAuth={handleCompanySetupAuth} /> :
            <Navigate to="/" replace />
          } />
          <Route path="/workspace-setup" element={
            user ? <WorkspaceSetupPage onNavigate={navigateTo} onAuth={handleAuth} /> :
            <Navigate to="/" replace />
          } />
          <Route path="/join" element={
            user ? <JoinTeamPage onNavigate={navigateTo} onAuth={handleJoinTeamAuth} /> :
            <JoinTeamPage onNavigate={navigateTo} onAuth={handleAuth} />
          } />

          {/* ── Assessment Intro ── */}
          <Route path="/assessment-intro" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            <AssessmentIntroPage onNavigate={navigateTo} onAuth={handleAuth} />
          } />

          {/* ── Assessment ── */}
          <Route path="/assessment" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            <AssessmentPage
              onComplete={handleAssessmentComplete}
              onBack={() => navigate("/assessment-intro")}
              companyId={company?.id}
              userId={user?.id}
            />
          } />

          {/* ── Processing Screen ── */}
          <Route path="/processing" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            generateBrandVoice.isIdle ? <Navigate to="/create" replace /> :
            <ProcessingPage
              apiDone={isApiDone}
              onComplete={() => navigate("/brand-voice")}
            />
          } />

          {/* ── Platform pages (require auth + company) ── */}
          <Route path="/create" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            <CreatePage user={user} brandProfile={brandProfile} onContentGenerated={handleContentGenerated} />
          } />
          <Route path="/library" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            <LibraryPage user={user} key={contentVersion} onNavigateToCreate={() => navigate("/create")} />
          } />
          <Route path="/analytics" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            <AnalyticsPage user={user} />
          } />
          <Route path="/brand-voice" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            <BrandVoicePage
              brandProfile={brandProfile}
              onRetakeAssessment={() => navigate("/assessment-intro")}
              onLoadDemo={() => seedDemo.mutate()}
              demoLoading={seedDemo.isPending}
              userRole={user.role}
            />
          } />
          <Route path="/settings" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            <SettingsPage
              user={user}
              company={company}
              onUpdateCompany={(updates) => {
                setCompany(prev => prev ? { ...prev, ...updates } : null);
              }}
            />
          } />
          <Route path="/faq" element={
            !user ? <Navigate to="/" replace /> :
            !company ? <Navigate to="/workspace-setup" replace /> :
            <FaqPage />
          } />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {showSidebar && <PerplexityAttribution />}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
