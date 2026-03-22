// Simple app state management using React context
// No localStorage — all state in React, persistent data via API

export interface AppUser {
  id: number;
  username: string;
  fullName: string;
  jobTitle: string | null;
  role: string;
  companyId: number | null;
}

export interface AppCompany {
  id: number;
  name: string;
  logo: string | null;
  primaryColor: string;
  accessCode: string;
  plan: string;
}

export type AppView =
  | "welcome"
  | "signin"
  | "signup"
  | "pricing"
  | "company-setup"
  | "join-team"
  | "reset-password"
  | "assessment"
  | "create"
  | "library"
  | "analytics"
  | "brand-voice"
  | "settings"
  | "faq";
