import { apiRequest } from "@/lib/queryClient";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Check, User, Users, Building2, Clock, Layers, Brain, ChevronLeft, CheckCircle2 } from "lucide-react";

// ─── Shared Layout Shell ───────────────────────────────────────────────────────

const STEP_LABELS = ["Create Account", "Choose Plan", "Set Up Workspace", "Company Details"];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="w-full max-w-md mb-4" data-testid="step-indicator">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < step;
          const isCurrent = stepNum === step;
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 0 && <div className={`flex-1 h-[1px] ${isCompleted || isCurrent ? "bg-black" : "bg-[#E5E5E5]"}`} />}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0 transition-colors ${
                  isCompleted ? "bg-black text-white" : isCurrent ? "bg-black/80 text-white" : "bg-[#E5E5E5] text-[#585858]"
                }`}>
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : stepNum}
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-[1px] ${isCompleted ? "bg-black" : "bg-[#E5E5E5]"}`} />}
              </div>
              <span className={`text-[9px] mt-1 whitespace-nowrap ${isCurrent ? "text-black font-medium" : "text-[#9B9B9B]"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuthShell({ children, showBackground = false, step, onBack }: {
  children: React.ReactNode; showBackground?: boolean; step?: number; onBack?: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative"
      style={showBackground ? {
        background: "linear-gradient(135deg, #87CEEB 0%, #B0D4F1 25%, #d4d4d8 50%, #e0e0e0 65%, #a8c8e8 80%, #87CEEB 100%)",
      } : { background: "#FFFFFF" }}
    >
      {/* Back link top-left */}
      {onBack && (
        <button onClick={onBack}
          className={`absolute top-6 left-6 flex items-center gap-1 text-[14px] font-light ${showBackground ? "text-white" : "text-black"} hover:underline`}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      {step && <StepIndicator step={step} />}
      {children}
      <p className="mt-6 text-[12px] font-light text-[#585858]">Powered by Gallea Ai</p>
    </div>
  );
}

// Auth card wrapper with #EAEAEA top band and shadow
function AuthCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}
      style={{ boxShadow: "0px 3px 6px #00000029" }}>
      {/* EAEAEA top band fading to white */}
      <div style={{ background: "linear-gradient(to bottom, #EAEAEA 0%, #FFFFFF 40%)" }} className="p-8">
        {children}
      </div>
    </div>
  );
}

// ─── Social Auth Buttons ────────────────────────────────────────────────────────

function SocialAuthButtons() {
  const handleOAuth = (provider: string) => { window.location.href = `/api/auth/${provider}`; };
  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full justify-center gap-2 border-[#E5E5E5] bg-white h-11" style={{ width: "368px", maxWidth: "100%" }} onClick={() => handleOAuth("google")}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
        Continue with Google
      </Button>
      <Button variant="outline" className="w-full justify-center gap-2 border-[#E5E5E5] bg-white h-11" style={{ width: "368px", maxWidth: "100%" }} onClick={() => handleOAuth("apple")}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M14.94 9.88c-.02-2.06 1.68-3.04 1.76-3.1-1-1.46-2.5-1.66-3.02-1.68-1.28-.14-2.52.76-3.18.76-.66 0-1.66-.74-2.74-.72-1.4.02-2.7.82-3.42 2.08-1.48 2.56-.38 6.32 1.04 8.4.72 1.02 1.56 2.16 2.66 2.12 1.08-.04 1.48-.68 2.78-.68s1.66.68 2.78.66c1.14-.02 1.86-1.02 2.54-2.06.82-1.18 1.14-2.32 1.16-2.38-.02-.02-2.22-.86-2.24-3.4h-.12zM12.82 3.42c.58-.72.98-1.7.86-2.7-.84.04-1.88.58-2.48 1.28-.54.62-1.02 1.64-.88 2.6.92.08 1.88-.48 2.5-1.18z"/></svg>
        Continue with Apple
      </Button>
      <Button variant="outline" className="w-full justify-center gap-2 border-[#E5E5E5] bg-white h-11" style={{ width: "368px", maxWidth: "100%" }} onClick={() => handleOAuth("facebook")}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#1877F2"><path d="M18 9a9 9 0 10-10.406 8.89v-6.29H5.309V9h2.285V7.017c0-2.255 1.343-3.501 3.4-3.501.984 0 2.014.176 2.014.176v2.215h-1.134c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.6h-2.097v6.29A9.002 9.002 0 0018 9z"/></svg>
        Continue with Facebook
      </Button>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E5E5E5]" /></div>
      <div className="relative flex justify-center text-[12px]"><span className="bg-white px-3 text-[#585858]">Or</span></div>
    </div>
  );
}

interface AuthPageProps {
  onNavigate: (view: string) => void;
  onAuth: (user: any, company: any) => void;
}

// ═══ 1. Welcome Page ═══════════════════════════════════════════════════════════

export function WelcomePage({ onNavigate }: AuthPageProps) {
  return (
    <AuthShell showBackground>
      <div className="w-full max-w-md text-center px-4">
        <div className="mb-8">
          <h1 className="text-[16px] font-normal text-black mb-4" data-testid="text-welcome-logo">
            GalleaBrandVoicePro
          </h1>
          <p className="text-[24px] sm:text-[36px] font-medium text-black leading-tight mb-4">
            AI-powered content that sounds exactly like your brand.
          </p>
          <p className="text-[36px] sm:text-[60px] font-extralight text-black leading-[1.1]" data-testid="text-welcome-heading">
            Welcome. Let's Get You Started.
          </p>
        </div>

        <AuthCard>
          <div className="space-y-4">
            <Button className="w-full bg-black text-white hover:bg-black/90 rounded-[10px] h-[42px] text-[20px] font-light"
              style={{ width: "368px", maxWidth: "100%" }}
              onClick={() => onNavigate("signup")} data-testid="button-get-started">
              Get Started
            </Button>
            <Button variant="outline" className="w-full border-black text-black rounded-[10px] h-[42px] text-[14px] font-light"
              onClick={() => onNavigate("signin")} data-testid="button-sign-in">
              Already have an account? Sign in
            </Button>
          </div>
        </AuthCard>

        {/* reCAPTCHA / Terms footer */}
        <p className="mt-4 text-[11px] text-[#9B9B9B] max-w-sm mx-auto">
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>
      </div>
    </AuthShell>
  );
}

// ═══ 2. Sign In Page ═══════════════════════════════════════════════════════════

export function SignInPage({ onNavigate, onAuth }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username: email, password });
      const user = await res.json();
      if (user.companyId) {
        const compRes = await apiRequest("GET", `/api/companies/${user.companyId}`);
        onAuth(user, await compRes.json());
      } else { onAuth(user, null); }
    } catch { setError("Invalid email or password. Please try again."); } finally { setLoading(false); }
  }, [email, password, onAuth]);

  return (
    <AuthShell onBack={() => onNavigate("welcome")}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6"><h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1></div>
        <AuthCard>
          <h2 className="text-[20px] font-medium text-black text-center mb-2">Welcome Back</h2>
          <p className="text-[14px] font-light text-[#585858] text-center mb-6">Sign in to continue where you left off.</p>
          <SocialAuthButtons />
          <Divider />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Email</Label>
              <Input type="email" autoComplete="email" placeholder="you@company.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Password</Label>
              <Input type="password" autoComplete="current-password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-[10px] h-[42px] text-[14px] font-light" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            {error && <p className="text-[14px] text-[#FF0000] text-center">{error}</p>}
          </form>
          <div className="mt-4 text-center space-y-2">
            <button type="button" className="text-[14px] text-[#585858] underline" onClick={() => onNavigate("reset-password")}>
              Forgot Password?
            </button>
            <p className="text-[14px] text-[#585858]">
              Don't have an account?{" "}
              <button type="button" className="text-black font-medium hover:underline" onClick={() => onNavigate("signup")}>Get Started</button>
            </p>
          </div>
        </AuthCard>
      </div>
    </AuthShell>
  );
}

// ═══ 3. Sign Up Page ══════════════════════════════════════════════════════════

export function SignUpPage({ onNavigate, onAuth }: AuthPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", { username: email, password, fullName, role: "admin" });
      const user = await res.json();
      (window as any).__pendingUser = user;
      onNavigate("pricing");
    } catch { setError("An account with this email already exists. Try signing in."); } finally { setLoading(false); }
  }, [fullName, email, password, onNavigate]);

  return (
    <AuthShell step={1} onBack={() => onNavigate("welcome")}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6"><h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1></div>
        <AuthCard>
          <h2 className="text-[20px] font-medium text-black text-center mb-6">Create Your Account</h2>
          <SocialAuthButtons />
          <Divider />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Full Name</Label>
              <Input type="text" autoComplete="name" placeholder="Jane Smith" value={fullName}
                onChange={(e) => setFullName(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Email</Label>
              <Input type="email" autoComplete="email" placeholder="you@company.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Password</Label>
              <Input type="password" autoComplete="new-password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-[10px] h-[42px] text-[14px] font-light" disabled={loading}>
              {loading ? "Creating..." : "Continue"}
            </Button>
            {error && <p className="text-[14px] text-[#FF0000] text-center">{error}</p>}
          </form>
          <p className="mt-4 text-[14px] text-[#585858] text-center">
            Already have an account?{" "}
            <button type="button" className="text-black font-medium hover:underline" onClick={() => onNavigate("signin")}>Sign In</button>
          </p>
        </AuthCard>
      </div>
    </AuthShell>
  );
}

// ═══ 4. Reset Password Page ═══════════════════════════════════════════════════

export function ResetPasswordPage({ onNavigate }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Backend email sending is a stub — just show success state
    setSubmitted(true);
  }, []);

  return (
    <AuthShell onBack={() => onNavigate("signin")}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6"><h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1></div>
        <AuthCard>
          <h2 className="text-[20px] font-medium text-black text-center mb-2">Reset Password</h2>

          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#1F9A15] mx-auto" />
              <p className="text-[16px] font-medium text-black">Check your email for a reset link.</p>
              <p className="text-[14px] font-light text-[#585858]">
                We've sent a password reset link to <strong>{email}</strong>. It may take a few minutes to arrive.
              </p>
              <Button variant="outline" className="mt-4 border-[#E5E5E5]" onClick={() => onNavigate("signin")}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <p className="text-[14px] font-light text-[#585858] text-center mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[14px] font-medium text-black">Email</Label>
                  <Input type="email" autoComplete="email" placeholder="you@company.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required className="border-[#707070] bg-white" />
                </div>
                <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-[10px] h-[42px] text-[14px] font-light">
                  Reset
                </Button>
              </form>
              <p className="mt-4 text-[14px] text-[#585858] text-center">
                Don't have an account?{" "}
                <button type="button" className="text-black font-medium hover:underline" onClick={() => onNavigate("signup")}>Get Started</button>
              </p>
            </>
          )}
        </AuthCard>
      </div>
    </AuthShell>
  );
}

// ═══ 5. Pricing Page (3 tiers) ═══════════════════════════════════════════════

const PLANS = [
  {
    id: "individual", title: "Individual", price: "$149.99", period: "/Month",
    icon: User, description: "For freelancers, solo creators, and small teams.",
    features: ["Brand voice assessment", "30 content types", "Brand alignment scoring", "Content Library", "Email support"],
  },
  {
    id: "growth", title: "Growth", price: "$999", period: "/Month", badge: "Up to 10 users",
    icon: Users, description: "For growing teams scaling their content.",
    features: ["Everything in Individual", "Brand governance", "Corporate compliance", "Document upload", "Team analytics", "Access key distribution"],
  },
  {
    id: "enterprise", title: "Enterprise", price: "$7,500", period: "/Month", badge: "Up to 100 users",
    icon: Building2, description: "For organizations enforcing brand at scale.",
    features: ["Everything in Growth", "Additional compliance layer", "Dedicated support", "Advanced reporting", "Custom integrations", "SLA guarantees"],
  },
];

export function PricingPage({ onNavigate }: AuthPageProps) {
  const [selected, setSelected] = useState("individual");

  return (
    <AuthShell step={2} onBack={() => onNavigate("signup")}>
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-6"><h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1></div>
        <h2 className="text-[20px] font-medium text-black text-center mb-8">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.id;
            return (
              <div key={plan.id} onClick={() => setSelected(plan.id)}
                className={`rounded-xl bg-white p-6 cursor-pointer transition-all border-2 ${
                  isSelected ? "border-black" : "border-[#E5E5E5]"
                }`} style={{ boxShadow: "0px 3px 6px #00000029" }}>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#F0F0F0] flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-black">{plan.title}</h3>
                  {plan.badge && <span className="text-[11px] text-[#585858] bg-[#F0F0F0] px-2 py-0.5 rounded-full mt-1 inline-block">{plan.badge}</span>}
                </div>
                <div className="text-center mb-3">
                  <span className="text-[28px] font-semibold text-black">{plan.price}</span>
                  <span className="text-[14px] text-[#585858]">{plan.period}</span>
                </div>
                <p className="text-[13px] font-light text-[#585858] text-center mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-black">
                      <Check className="w-3.5 h-3.5 text-[#1F9A15] shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-[10px] h-[42px] text-[14px] font-light ${
                    isSelected ? "bg-black text-white hover:bg-black/90" : "bg-white text-black border border-black hover:bg-[#F0F0F0]"
                  }`}
                  onClick={() => { setSelected(plan.id); onNavigate("workspace-setup"); }}>
                  Continue
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </AuthShell>
  );
}

// ═══ 6. Company Setup Page ═══════════════════════════════════════════════════

export function CompanySetupPage({ onNavigate, onAuth }: AuthPageProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [logoFileName, setLogoFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const compRes = await apiRequest("POST", "/api/companies", { name: companyName, plan: "individual" });
      const company = await compRes.json();
      const pendingUser = (window as any).__pendingUser;
      if (pendingUser?.id) {
        await apiRequest("PATCH", `/api/users/${pendingUser.id}`, { companyId: company.id, jobTitle });
        onAuth({ ...pendingUser, jobTitle, companyId: company.id }, company);
        delete (window as any).__pendingUser;
      } else {
        onAuth({ id: 0, username: "user", fullName: "User", jobTitle, role: "admin", companyId: company.id }, company);
      }
    } catch { setError("Failed to create company. Please try again."); } finally { setLoading(false); }
  }, [companyName, jobTitle, onAuth]);

  return (
    <AuthShell step={4} onBack={() => onNavigate("workspace-setup")}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6"><h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1></div>
        <AuthCard>
          <h2 className="text-[20px] font-medium text-black text-center mb-2">Your Company</h2>
          <p className="text-[14px] font-light text-[#585858] text-center mb-6">Tell us about your brand. You'll be the administrator.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Company / Brand Name</Label>
              <Input type="text" placeholder="Acme Inc." value={companyName}
                onChange={(e) => setCompanyName(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Your Job Title</Label>
              <Input type="text" placeholder="Brand Manager" value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Company Logo <span className="font-light text-[#585858]">(Optional)</span></Label>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" id="logo-file-input"
                onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 5 * 1024 * 1024) setLogoFileName(f.name); }} />
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragOver ? "border-black bg-[#F0F0F0]" : "border-[#B7B7B7]"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f && f.size <= 5*1024*1024) setLogoFileName(f.name); }}
                onClick={() => document.getElementById("logo-file-input")?.click()}>
                <Upload className="w-5 h-5 text-[#585858] mx-auto mb-2" />
                {logoFileName ? <p className="text-[14px] font-medium text-black">{logoFileName}</p> : (
                  <>
                    <p className="text-[14px] font-light text-[#585858]">Drag and Drop Your Company Logo Here.</p>
                    <p className="text-[12px] text-[#9B9B9B] mt-1">PNG, SVG, or JPG. Max 5MB</p>
                  </>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-[10px] h-[42px] text-[14px] font-light" disabled={loading}>
              {loading ? "Creating..." : "Continue"}
            </Button>
            {error && <p className="text-[14px] text-[#FF0000] text-center">{error}</p>}
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}

// ═══ 7. Workspace Setup Page ═══════════════════════════════════════════════════

export function WorkspaceSetupPage({ onNavigate }: AuthPageProps) {
  return (
    <AuthShell step={3} onBack={() => onNavigate("pricing")}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6"><h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1></div>
        <AuthCard>
          <h2 className="text-[20px] font-medium text-black text-center mb-2">Let's Set Up Your Workspace</h2>
          <p className="text-[14px] font-light text-[#585858] text-center mb-6">Choose how you'd like to get started.</p>
          <div className="space-y-3">
            <div className="border border-[#E5E5E5] rounded-lg p-5 cursor-pointer hover:bg-[#F0F0F0] transition-colors"
              onClick={() => onNavigate("join-team")}>
              <h3 className="text-[14px] font-semibold text-black mb-1">Join Existing Company</h3>
              <p className="text-[13px] font-light text-[#585858]">I have a company access code</p>
            </div>
            <div className="border border-[#E5E5E5] rounded-lg p-5 cursor-pointer hover:bg-[#F0F0F0] transition-colors"
              onClick={() => onNavigate("company-setup")}>
              <h3 className="text-[14px] font-semibold text-black mb-1">Create New Company</h3>
              <p className="text-[13px] font-light text-[#585858]">Set up as administrator</p>
            </div>
          </div>
        </AuthCard>
      </div>
    </AuthShell>
  );
}

// ═══ 8. Join Team Page ═══════════════════════════════════════════════════════

export function JoinTeamPage({ onNavigate, onAuth }: AuthPageProps) {
  const [accessCode, setAccessCode] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const compRes = await apiRequest("POST", "/api/companies/join", { accessCode });
      const company = await compRes.json();
      const pendingUser = (window as any).__pendingUser;
      if (pendingUser?.id) {
        await apiRequest("PATCH", `/api/users/${pendingUser.id}`, { companyId: company.id, jobTitle });
        onAuth({ ...pendingUser, jobTitle, companyId: company.id, role: "member" }, company);
        delete (window as any).__pendingUser;
      } else {
        onAuth({ id: 0, username: "user", fullName: "User", jobTitle, role: "member", companyId: company.id }, company);
      }
    } catch { setError("Invalid access code. Check with your team admin."); } finally { setLoading(false); }
  }, [accessCode, jobTitle, onAuth]);

  return (
    <AuthShell onBack={() => onNavigate("workspace-setup")}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6"><h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1></div>
        <AuthCard>
          <h2 className="text-[20px] font-medium text-black text-center mb-2">Join Your Team</h2>
          <p className="text-[14px] font-light text-[#585858] text-center mb-6">
            Enter the access code shared by your company administrator. You'll inherit the company's brand voice automatically.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Company Access Code</Label>
              <Input type="text" placeholder="Enter access code" value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-black">Your Job Title</Label>
              <Input type="text" placeholder="Brand Manager" value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)} required className="border-[#707070] bg-white" />
            </div>
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-[10px] h-[42px] text-[14px] font-light" disabled={loading}>
              {loading ? "Joining..." : "Join Company"}
            </Button>
            {error && <p className="text-[14px] text-[#FF0000] text-center">{error}</p>}
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}

// ═══ 9. Assessment Intro Page ═══════════════════════════════════════════════

export function AssessmentIntroPage({ onNavigate }: AuthPageProps) {
  return (
    <AuthShell onBack={() => onNavigate("create")}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6"><h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1></div>
        <AuthCard>
          <h2 className="text-[20px] font-medium text-black text-center mb-6">Brand Voice Assessment</h2>

          {/* Stats block */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#F0F0F0] rounded-lg p-3 text-center">
              <p className="text-[20px] font-medium text-black">96</p>
              <p className="text-[12px] font-light text-[#585858]">positive and negative emotions</p>
            </div>
            <div className="bg-[#F0F0F0] rounded-lg p-3 text-center">
              <p className="text-[20px] font-medium text-black">182</p>
              <p className="text-[12px] font-light text-[#585858]">personality associations</p>
            </div>
            <div className="bg-[#F0F0F0] rounded-lg p-3 text-center">
              <p className="text-[20px] font-medium text-black">38</p>
              <p className="text-[12px] font-light text-[#585858]">functional attributes</p>
            </div>
            <div className="bg-[#F0F0F0] rounded-lg p-3 text-center">
              <p className="text-[20px] font-medium text-black">8</p>
              <p className="text-[12px] font-light text-[#585858]">emotional territories</p>
            </div>
          </div>

          <p className="text-[14px] font-light text-[#585858] text-center mb-6">
            Mapping your position across 8 emotional territories to generate your unique brand voice profile.
          </p>

          {/* Info card */}
          <div className="flex justify-center gap-6 mb-6 py-4 border-y border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#585858]" />
              <div>
                <p className="text-[14px] font-medium text-black">~40 Minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#585858]" />
              <div>
                <p className="text-[14px] font-medium text-black">7 Modules</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#585858]" />
              <div>
                <p className="text-[14px] font-medium text-black">Ai Voice Profile</p>
              </div>
            </div>
          </div>

          <p className="text-[13px] font-light text-[#585858] text-center mb-6">
            Take your time with each question. The more thoughtful your responses, the more accurate your brand voice profile will be.
          </p>

          <Button className="w-full bg-black text-white hover:bg-black/90 rounded-[10px] h-[42px] text-[14px] font-light"
            onClick={() => onNavigate("assessment")}>
            Begin Assessment
          </Button>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
