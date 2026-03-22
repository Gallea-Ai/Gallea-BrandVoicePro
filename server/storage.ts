import {
  type User, type InsertUser, users,
  type Company, type InsertCompany, companies,
  type AssessmentResponse, type InsertAssessmentResponse, assessmentResponses,
  type BrandVoiceProfile, type InsertBrandVoiceProfile, brandVoiceProfiles,
  type GeneratedContent, type InsertGeneratedContent, generatedContent,
  type VoiceRules, type InsertVoiceRules, voiceRules,
  type ChannelProfiles, type InsertChannelProfiles, channelProfiles,
  type PromptTemplate, type InsertPromptTemplate, promptTemplates,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// ── Auto-create all tables on startup ──
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    job_title TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    company_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo TEXT,
    primary_color TEXT DEFAULT '#000000',
    access_code TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'individual'
  );

  CREATE TABLE IF NOT EXISTS assessment_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    module_index INTEGER NOT NULL,
    responses TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS brand_voice_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    emotional_territories TEXT NOT NULL,
    brand_right_space TEXT NOT NULL,
    singularity_score INTEGER NOT NULL,
    differentiators TEXT NOT NULL,
    danger_zones TEXT NOT NULL,
    voice_prompt TEXT NOT NULL,
    positive_traits TEXT NOT NULL,
    negative_traits TEXT NOT NULL,
    mandatories TEXT
  );

  CREATE TABLE IF NOT EXISTS generated_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    content_type TEXT NOT NULL,
    content_idea TEXT NOT NULL,
    creative_brief TEXT,
    generated_text TEXT NOT NULL,
    tone_match INTEGER,
    vocabulary_fit INTEGER,
    brand_consistency INTEGER,
    emotional_resonance INTEGER,
    overall_score INTEGER,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS voice_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    sentence_style TEXT NOT NULL,
    vocabulary TEXT NOT NULL,
    tone TEXT NOT NULL,
    avoid TEXT NOT NULL,
    cta_style TEXT NOT NULL,
    formality TEXT NOT NULL,
    emotional_intensity TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS channel_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    profiles TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompt_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL,
    category TEXT NOT NULL,
    template TEXT NOT NULL,
    structure_guidance TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export const db = drizzle(sqlite);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByCompany(companyId: number): Promise<User[]>;
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByAccessCode(code: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company | undefined>;
  saveAssessmentResponse(response: InsertAssessmentResponse): Promise<AssessmentResponse>;
  getAssessmentResponses(companyId: number): Promise<AssessmentResponse[]>;
  saveBrandVoiceProfile(profile: InsertBrandVoiceProfile): Promise<BrandVoiceProfile>;
  getBrandVoiceProfile(companyId: number): Promise<BrandVoiceProfile | undefined>;
  saveVoiceRules(rules: InsertVoiceRules): Promise<VoiceRules>;
  getVoiceRules(companyId: number): Promise<VoiceRules | undefined>;
  saveChannelProfiles(cp: InsertChannelProfiles): Promise<ChannelProfiles>;
  getChannelProfiles(companyId: number): Promise<ChannelProfiles | undefined>;
  saveGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent>;
  getGeneratedContent(companyId: number): Promise<GeneratedContent[]>;
  deleteGeneratedContent(id: number): Promise<void>;
  getPromptTemplates(): Promise<PromptTemplate[]>;
  getPromptTemplate(contentType: string): Promise<PromptTemplate | undefined>;
  savePromptTemplate(template: InsertPromptTemplate): Promise<PromptTemplate>;
  updateGeneratedContent(id: number, data: Partial<InsertGeneratedContent>): Promise<void>;
  getSession(visitorId: string): Promise<{userId: number} | undefined>;
  saveSession(visitorId: string, userId: number): Promise<void>;
  deleteSession(visitorId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number) { return db.select().from(users).where(eq(users.id, id)).get(); }
  async getUserByUsername(username: string) { return db.select().from(users).where(eq(users.username, username)).get(); }
  async createUser(u: InsertUser) { return db.insert(users).values(u).returning().get(); }
  async getUsersByCompany(companyId: number) { return db.select().from(users).where(eq(users.companyId, companyId)).all(); }

  async getCompany(id: number) { return db.select().from(companies).where(eq(companies.id, id)).get(); }
  async getCompanyByAccessCode(code: string) { return db.select().from(companies).where(eq(companies.accessCode, code)).get(); }
  async createCompany(c: InsertCompany) { return db.insert(companies).values(c).returning().get(); }
  async updateCompany(id: number, data: Partial<InsertCompany>) { return db.update(companies).set(data).where(eq(companies.id, id)).returning().get(); }

  async saveAssessmentResponse(r: InsertAssessmentResponse) {
    db.delete(assessmentResponses).where(and(eq(assessmentResponses.companyId, r.companyId), eq(assessmentResponses.moduleIndex, r.moduleIndex))).run();
    return db.insert(assessmentResponses).values(r).returning().get();
  }
  async getAssessmentResponses(companyId: number) { return db.select().from(assessmentResponses).where(eq(assessmentResponses.companyId, companyId)).all(); }

  async saveBrandVoiceProfile(p: InsertBrandVoiceProfile) {
    db.delete(brandVoiceProfiles).where(eq(brandVoiceProfiles.companyId, p.companyId)).run();
    return db.insert(brandVoiceProfiles).values(p).returning().get();
  }
  async getBrandVoiceProfile(companyId: number) { return db.select().from(brandVoiceProfiles).where(eq(brandVoiceProfiles.companyId, companyId)).get(); }

  async saveVoiceRules(r: InsertVoiceRules) {
    db.delete(voiceRules).where(eq(voiceRules.companyId, r.companyId)).run();
    return db.insert(voiceRules).values(r).returning().get();
  }
  async getVoiceRules(companyId: number) { return db.select().from(voiceRules).where(eq(voiceRules.companyId, companyId)).get(); }

  async saveChannelProfiles(cp: InsertChannelProfiles) {
    db.delete(channelProfiles).where(eq(channelProfiles.companyId, cp.companyId)).run();
    return db.insert(channelProfiles).values(cp).returning().get();
  }
  async getChannelProfiles(companyId: number) { return db.select().from(channelProfiles).where(eq(channelProfiles.companyId, companyId)).get(); }

  async saveGeneratedContent(c: InsertGeneratedContent) { return db.insert(generatedContent).values(c).returning().get(); }
  async getGeneratedContent(companyId: number) { return db.select().from(generatedContent).where(eq(generatedContent.companyId, companyId)).orderBy(desc(generatedContent.id)).all(); }
  async deleteGeneratedContent(id: number) { db.delete(generatedContent).where(eq(generatedContent.id, id)).run(); }
  async getPromptTemplates() { return db.select().from(promptTemplates).all(); }
  async getPromptTemplate(contentType: string) { return db.select().from(promptTemplates).where(eq(promptTemplates.contentType, contentType)).get(); }
  async savePromptTemplate(t: InsertPromptTemplate) { return db.insert(promptTemplates).values(t).returning().get(); }
  async updateGeneratedContent(id: number, data: Partial<InsertGeneratedContent>) {
    db.update(generatedContent).set(data).where(eq(generatedContent.id, id)).run();
  }
  async getSession(visitorId: string) {
    const row = sqlite.prepare("SELECT user_id FROM sessions WHERE visitor_id = ?").get(visitorId) as any;
    return row ? { userId: row.user_id } : undefined;
  }
  async saveSession(visitorId: string, userId: number) {
    sqlite.prepare("INSERT OR REPLACE INTO sessions (visitor_id, user_id) VALUES (?, ?)").run(visitorId, userId);
  }
  async deleteSession(visitorId: string) {
    sqlite.prepare("DELETE FROM sessions WHERE visitor_id = ?").run(visitorId);
  }
}

export const storage = new DatabaseStorage();
