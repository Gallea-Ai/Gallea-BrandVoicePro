import { apiRequest } from "@/lib/queryClient";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Check } from "lucide-react";

// ─── Shared Layout Shell ───────────────────────────────────────────────────────

const STEP_LABELS = ["Create Account", "Choose Plan", "Set Up Workspace", "Company Details"];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="w-full max-w-md mb-6" data-testid="step-indicator">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < step;
          const isCurrent = stepNum === step;
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div className={`flex-1 h-0.5 ${isCompleted || isCurrent ? "bg-primary" : "bg-border"}`} />
                )}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary/80 text-primary-foreground ring-2 ring-primary/30"
                        : "bg-border text-muted-foreground"
                  }`}
                  data-testid={`step-dot-${stepNum}`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${isCompleted ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <span className={`text-[10px] mt-1 whitespace-nowrap ${isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuthShell({ children, showBackground = false, step }: { children: React.ReactNode; showBackground?: boolean; step?: number }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={
        showBackground
          ? {
              background:
                "linear-gradient(135deg, #87CEEB 0%, #B0D4F1 25%, #d4d4d8 50%, #e0e0e0 65%, #a8c8e8 80%, #87CEEB 100%)",
            }
          : { background: "hsl(var(--background))" }
      }
    >
      {step && <StepIndicator step={step} />}
      {children}
      <p className="mt-6 text-xs text-muted-foreground" data-testid="text-powered-by">
        Powered by Gallea Ai
      </p>
    </div>
  );
}

function LogoHeader() {
  return (
    <div className="text-center mb-6" data-testid="text-logo-header">
      <h1 className="text-xl font-medium tracking-tight text-foreground">
        GalleaBrandVoicePro
      </h1>
    </div>
  );
}

// ─── 1. Welcome Page ────────────────────────────────────────────────────────────

interface AuthPageProps {
  onNavigate: (view: string) => void;
  onAuth: (user: any, company: any) => void;
}

export function WelcomePage({ onNavigate }: AuthPageProps) {
  return (
    <AuthShell showBackground>
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1
            className="text-2xl font-medium tracking-tight text-foreground mb-2"
            data-testid="text-welcome-logo"
          >
            GalleaBrandVoicePro
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-welcome-subtitle">
            Every word your business writes — clear, consistent, and unmistakably yours.
          </p>
        </div>

        <Card className="p-8">
          <CardContent className="p-0 space-y-6">
            <h2 className="text-lg font-medium tracking-tight" data-testid="text-welcome-heading">
              Welcome to Gallea. Let's find your brand's voice.
            </h2>
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => onNavigate("signup")}
                data-testid="button-get-started"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => onNavigate("signin")}
                data-testid="button-sign-in"
              >
                Already have an account? Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}

// ─── Social Auth Buttons (wired to real OAuth flows) ────────────────────────────

function SocialAuthButtons() {
  const handleOAuth = (provider: string) => {
    // Redirect to the OAuth endpoint — the server handles the full OAuth dance
    // and redirects back with user data in the URL hash params
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-center gap-2"
        data-testid="button-google-auth"
        onClick={() => handleOAuth("google")}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full justify-center gap-2"
        data-testid="button-apple-auth"
        onClick={() => handleOAuth("apple")}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <path d="M14.94 9.88c-.02-2.06 1.68-3.04 1.76-3.1-1-1.46-2.5-1.66-3.02-1.68-1.28-.14-2.52.76-3.18.76-.66 0-1.66-.74-2.74-.72-1.4.02-2.7.82-3.42 2.08-1.48 2.56-.38 6.32 1.04 8.4.72 1.02 1.56 2.16 2.66 2.12 1.08-.04 1.48-.68 2.78-.68s1.66.68 2.78.66c1.14-.02 1.86-1.02 2.54-2.06.82-1.18 1.14-2.32 1.16-2.38-.02-.02-2.22-.86-2.24-3.4h-.12zM12.82 3.42c.58-.72.98-1.7.86-2.7-.84.04-1.88.58-2.48 1.28-.54.62-1.02 1.64-.88 2.6.92.08 1.88-.48 2.5-1.18z" />
        </svg>
        Continue with Apple
      </Button>
      <Button
        variant="outline"
        className="w-full justify-center gap-2"
        data-testid="button-facebook-auth"
        onClick={() => handleOAuth("facebook")}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#1877F2">
          <path d="M18 9a9 9 0 10-10.406 8.89v-6.29H5.309V9h2.285V7.017c0-2.255 1.343-3.501 3.4-3.501.984 0 2.014.176 2.014.176v2.215h-1.134c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.6h-2.097v6.29A9.002 9.002 0 0018 9z" />
        </svg>
        Continue with Facebook
      </Button>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-card px-3 text-muted-foreground">or</span>
      </div>
    </div>
  );
}

// ─── 2. Sign In Page ────────────────────────────────────────────────────────────

export function SignInPage({ onNavigate, onAuth }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await apiRequest("POST", "/api/auth/login", { username: email, password });
        const user = await res.json();
        if (user.companyId) {
          const compRes = await apiRequest("GET", `/api/companies/${user.companyId}`);
          const company = await compRes.json();
          onAuth(user, company);
        } else {
          onAuth(user, null);
        }
      } catch (err: any) {
        setError("Invalid email or password. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, onAuth],
  );

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <LogoHeader />
        <Card className="p-8">
          <CardContent className="p-0">
            <h2 className="text-lg font-medium tracking-tight text-center mb-6" data-testid="text-signin-heading">
              Sign In
            </h2>
            <SocialAuthButtons />
            <Divider />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-signin-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-signin-password"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" data-testid="button-signin-submit">
                Sign In
              </Button>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </form>
            <div className="mt-4 text-center space-y-2">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground underline"
                onClick={() => onNavigate("reset")}
                data-testid="link-forgot-password"
              >
                Forgot Password?
              </button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-foreground font-medium hover:underline"
                  onClick={() => onNavigate("signup")}
                  data-testid="link-get-started"
                >
                  Get Started
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}

// ─── 3. Sign Up Page ────────────────────────────────────────────────────────────

export function SignUpPage({ onNavigate, onAuth }: AuthPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await apiRequest("POST", "/api/auth/register", {
          username: email,
          password,
          fullName,
          role: "admin",
        });
        const user = await res.json();
        // Store user temporarily, navigate to pricing
        // The onAuth will be called later after company setup
        (window as any).__pendingUser = user;
        onNavigate("pricing");
      } catch (err: any) {
        setError("An account with this email already exists. Try signing in.");
      } finally {
        setLoading(false);
      }
    },
    [fullName, email, password, onNavigate],
  );

  return (
    <AuthShell step={1}>
      <div className="w-full max-w-md">
        <LogoHeader />
        <Card className="p-8">
          <CardContent className="p-0">
            <h2 className="text-lg font-medium tracking-tight text-center mb-6" data-testid="text-signup-heading">
              Create Your Account
            </h2>
            <SocialAuthButtons />
            <Divider />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  data-testid="input-signup-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-signup-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-signup-password"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" data-testid="button-signup-continue">
                Continue
              </Button>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-foreground font-medium hover:underline"
                  onClick={() => onNavigate("signin")}
                  data-testid="link-signin"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}

// ─── 4. Reset Password Page ─────────────────────────────────────────────────────

export function ResetPasswordPage({ onNavigate }: AuthPageProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onNavigate("signin");
    },
    [onNavigate],
  );

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <LogoHeader />
        <Card className="p-8">
          <CardContent className="p-0">
            <h2 className="text-lg font-medium tracking-tight text-center mb-2" data-testid="text-reset-heading">
              Reset Password
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-reset-email"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" data-testid="button-reset-submit">
                Reset
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground underline"
                onClick={() => onNavigate("signin")}
                data-testid="link-back-to-signin"
              >
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}

// ─── 5. Pricing Page ────────────────────────────────────────────────────────────

export function PricingPage({ onNavigate }: AuthPageProps) {
  const [selected, setSelected] = useState<"individual" | "enterprise">("individual");

  return (
    <AuthShell step={2}>
      <div className="w-full max-w-2xl">
        <LogoHeader />
        <h2 className="text-lg font-medium tracking-tight text-center mb-8" data-testid="text-pricing-heading">
          Choose Your Brand Voice Pro?
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Individual */}
          <Card
            className={`p-6 cursor-pointer transition-all ${
              selected === "individual" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelected("individual")}
            data-testid="card-pricing-individual"
          >
            <CardContent className="p-0 text-center space-y-4">
              <h3 className="text-base font-semibold">Individual</h3>
              <div>
                <span className="text-3xl font-semibold tracking-tight">$49.99</span>
                <span className="text-sm text-muted-foreground">/Month</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Single brand voice profile
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  AI content generation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Brand voice assessment
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  30 content pieces / month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Email support
                </li>
              </ul>
              <Button
                className="w-full"
                variant={selected === "individual" ? "default" : "outline"}
                onClick={() => {
                  setSelected("individual");
                  onNavigate("workspace-setup");
                }}
                data-testid="button-pricing-individual-continue"
              >
                Continue
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card
            className={`p-6 cursor-pointer transition-all ${
              selected === "enterprise" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelected("enterprise")}
            data-testid="card-pricing-enterprise"
          >
            <CardContent className="p-0 text-center space-y-4">
              <h3 className="text-base font-semibold">Enterprise</h3>
              <div>
                <span className="text-3xl font-semibold tracking-tight">$299.99</span>
                <span className="text-sm text-muted-foreground">/Month</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Unlimited brand voices
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Team collaboration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Unlimited content generation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Custom brand governance rules
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Analytics dashboard
                </li>
              </ul>
              <Button
                className="w-full"
                variant={selected === "enterprise" ? "default" : "outline"}
                onClick={() => {
                  setSelected("enterprise");
                  onNavigate("workspace-setup");
                }}
                data-testid="button-pricing-enterprise-continue"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthShell>
  );
}

// ─── 6. Company Setup Page ──────────────────────────────────────────────────────

export function CompanySetupPage({ onNavigate, onAuth }: AuthPageProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [brandColor, setBrandColor] = useState("#000000");
  const [dragOver, setDragOver] = useState(false);
  const [logoFileName, setLogoFileName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        // Create company via API
        const compRes = await apiRequest("POST", "/api/companies", {
          name: companyName,
          primaryColor: brandColor,
          plan: "individual",
        });
        const company = await compRes.json();

        // Get the pending user from signup and update their companyId in DB
        const pendingUser = (window as any).__pendingUser;
        if (pendingUser && pendingUser.id) {
          // Update user's companyId in the database
          await apiRequest("PATCH", `/api/users/${pendingUser.id}`, { companyId: company.id, jobTitle });
          onAuth({ ...pendingUser, jobTitle, companyId: company.id }, company);
          delete (window as any).__pendingUser;
        } else {
          onAuth({ id: 0, username: "user", fullName: "User", jobTitle, role: "admin", companyId: company.id }, company);
        }
      } catch (err: any) {
        setError("Failed to create company. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [companyName, jobTitle, brandColor, onAuth],
  );

  return (
    <AuthShell step={4}>
      <div className="w-full max-w-md">
        <LogoHeader />
        <Card className="p-8">
          <CardContent className="p-0">
            <h2 className="text-lg font-medium tracking-tight text-center mb-6" data-testid="text-company-heading">
              Your Company
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company / Brand Name</Label>
                <Input
                  id="company-name"
                  type="text"
                  autoComplete="organization"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  data-testid="input-company-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  type="text"
                  autoComplete="organization-title"
                  placeholder="Brand Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  data-testid="input-job-title"
                />
              </div>

              {/* Logo Upload — tap/click to browse + drag-and-drop on desktop */}
              <div className="space-y-2">
                <Label>Company Logo <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  id="logo-file-input"
                  data-testid="input-logo-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        setLogoFileName("");
                        return;
                      }
                      setLogoFileName(file.name);
                    }
                  }}
                />
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-muted-foreground/40 ${
                    dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) return;
                      setLogoFileName(file.name);
                    }
                  }}
                  onClick={() => document.getElementById("logo-file-input")?.click()}
                  data-testid="area-logo-upload"
                >
                  <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                  {logoFileName ? (
                    <div>
                      <p className="text-sm font-medium text-foreground">{logoFileName}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tap to change</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-foreground font-medium">Upload your logo</p>
                      <p className="text-xs text-muted-foreground mt-1">Tap to browse or drag a file here</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PNG, SVG, JPG, or WebP · Max 2 MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Brand Colour */}
              <div className="space-y-2">
                <Label htmlFor="brand-color">Primary Brand Colour</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="brand-color"
                    type="text"
                    placeholder="#000000"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1"
                    data-testid="input-brand-color"
                  />
                  <label
                    className="relative h-9 w-9 shrink-0 cursor-pointer"
                    data-testid="preview-brand-color"
                  >
                    <div
                      className="h-9 w-9 rounded-full border border-border"
                      style={{ backgroundColor: brandColor || "#000000" }}
                    />
                    <input
                      type="color"
                      value={brandColor || "#000000"}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      data-testid="input-color-picker"
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Type a hex code or tap the circle to pick</p>
              </div>

              <Button type="submit" className="w-full" size="lg" data-testid="button-company-continue">
                Continue
              </Button>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}

// ─── 7. Workspace Setup Page ────────────────────────────────────────────────────

export function WorkspaceSetupPage({ onNavigate }: AuthPageProps) {
  return (
    <AuthShell step={3}>
      <div className="w-full max-w-md">
        <LogoHeader />
        <Card className="p-8">
          <CardContent className="p-0">
            <h2
              className="text-lg font-medium tracking-tight text-center mb-2"
              data-testid="text-workspace-heading"
            >
              Let's Set Up Your Workspace
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Choose how you'd like to get started.
            </p>
            <div className="space-y-3">
              <Card
                className="p-5 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onNavigate("join-team")}
                data-testid="card-join-existing"
              >
                <CardContent className="p-0">
                  <h3 className="text-sm font-semibold mb-1">Join Existing Company</h3>
                  <p className="text-xs text-muted-foreground">
                    Enter an access code from your team admin to join an existing workspace.
                  </p>
                </CardContent>
              </Card>
              <Card
                className="p-5 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onNavigate("company-setup")}
                data-testid="card-create-new"
              >
                <CardContent className="p-0">
                  <h3 className="text-sm font-semibold mb-1">Create New Company</h3>
                  <p className="text-xs text-muted-foreground">
                    Set up a fresh workspace for your brand and invite your team later.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}

// ─── 8. Join Team Page ──────────────────────────────────────────────────────────

export function JoinTeamPage({ onNavigate, onAuth }: AuthPageProps) {
  const [accessCode, setAccessCode] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        // Look up company by access code
        const compRes = await apiRequest("POST", "/api/companies/join", { accessCode });
        const company = await compRes.json();

        const pendingUser = (window as any).__pendingUser;
        if (pendingUser && pendingUser.id) {
          await apiRequest("PATCH", `/api/users/${pendingUser.id}`, { companyId: company.id, jobTitle });
          onAuth({ ...pendingUser, jobTitle, companyId: company.id, role: "member" }, company);
          delete (window as any).__pendingUser;
        } else {
          onAuth({ id: 0, username: "user", fullName: "User", jobTitle, role: "member", companyId: company.id }, company);
        }
      } catch (err: any) {
        setError("Invalid access code. Check with your team admin.");
      } finally {
        setLoading(false);
      }
    },
    [accessCode, jobTitle, onAuth],
  );

  return (
    <AuthShell step={4}>
      <div className="w-full max-w-md">
        <LogoHeader />
        <Card className="p-8">
          <CardContent className="p-0">
            <h2 className="text-lg font-medium tracking-tight text-center mb-6" data-testid="text-join-heading">
              Join Your Team
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Company Access Code</Label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  data-testid="input-access-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="join-job-title">Job Title</Label>
                <Input
                  id="join-job-title"
                  type="text"
                  autoComplete="organization-title"
                  placeholder="Brand Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  data-testid="input-join-job-title"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" data-testid="button-join-company">
                Join Company
              </Button>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground underline"
                onClick={() => onNavigate("workspace-setup")}
                data-testid="link-back-to-workspace"
              >
                Back
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
