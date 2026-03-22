import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  jobTitle: text("job_title"),
  role: text("role").notNull().default("member"), // admin | member
  companyId: integer("company_id"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Companies table
export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  logo: text("logo"), // base64 or URL
  primaryColor: text("primary_color").default("#000000"),
  accessCode: text("access_code").notNull(),
  plan: text("plan").notNull().default("individual"), // individual | enterprise
});

export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Assessment responses
export const assessmentResponses = sqliteTable("assessment_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  moduleIndex: integer("module_index").notNull(), // 0-6
  responses: text("responses").notNull(), // JSON string of all answers
  completedAt: text("completed_at"),
});

export const insertAssessmentResponseSchema = createInsertSchema(assessmentResponses).omit({ id: true });
export type InsertAssessmentResponse = z.infer<typeof insertAssessmentResponseSchema>;
export type AssessmentResponse = typeof assessmentResponses.$inferSelect;

// Brand voice profiles (generated from assessment)
export const brandVoiceProfiles = sqliteTable("brand_voice_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: integer("company_id").notNull(),
  emotionalTerritories: text("emotional_territories").notNull(), // JSON: scores for 8 territories
  brandRightSpace: text("brand_right_space").notNull(), // e.g. "Fun + Knowledgeable"
  singularityScore: integer("singularity_score").notNull(),
  differentiators: text("differentiators").notNull(), // JSON array
  dangerZones: text("danger_zones").notNull(), // JSON array
  voicePrompt: text("voice_prompt").notNull(), // The master system prompt for LLM
  positiveTraits: text("positive_traits").notNull(), // JSON array
  negativeTraits: text("negative_traits").notNull(), // JSON array - governance blocklist
  mandatories: text("mandatories"), // JSON: mandatory inclusions
});

export const insertBrandVoiceProfileSchema = createInsertSchema(brandVoiceProfiles).omit({ id: true });
export type InsertBrandVoiceProfile = z.infer<typeof insertBrandVoiceProfileSchema>;
export type BrandVoiceProfile = typeof brandVoiceProfiles.$inferSelect;

// Generated content
export const generatedContent = sqliteTable("generated_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(), // Traditional | Digital | Social
  contentType: text("content_type").notNull(), // e.g. "Blog Post", "LinkedIn Post"
  contentIdea: text("content_idea").notNull(),
  creativeBrief: text("creative_brief"), // JSON of brief fields
  generatedText: text("generated_text").notNull(),
  toneMatch: integer("tone_match"), // 0-100
  vocabularyFit: integer("vocabulary_fit"), // 0-100
  brandConsistency: integer("brand_consistency"), // 0-100
  emotionalResonance: integer("emotional_resonance"), // 0-100
  overallScore: integer("overall_score"), // 0-100
  createdAt: text("created_at").notNull(),
});

export const insertGeneratedContentSchema = createInsertSchema(generatedContent).omit({ id: true });
export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
export type GeneratedContent = typeof generatedContent.$inferSelect;

// Content type definitions
export const TRADITIONAL_CONTENT_TYPES = [
  "Tagline/Slogan",
  "Headline",
  "Subheadline",
  "Body Copy",
  "Brochure",
  "Print Ad",
  "Direct Mail",
  "Radio Script",
  "Sales Sheet / One-Pager",
] as const;

export const DIGITAL_CONTENT_TYPES = [
  "Blog Post",
  "Landing Page",
  "Website Page Copy",
  "Case Study",
  "White Paper",
  "Product Description",
  "Press Release",
  "Newsletter",
  "Email Campaign",
  "Sales Outreach Email",
  "Follow-up Email",
  "Google / Search Ad Copy",
  "Video Script",
] as const;

export const SOCIAL_CONTENT_TYPES = [
  "LinkedIn Post",
  "Twitter / X Post",
  "Instagram Caption",
  "Facebook Post",
  "TikTok Script",
  "Social Ad Copy",
  "Reddit Post",
  "YouTube Script",
] as const;

// Emotional territories
export const EMOTIONAL_TERRITORIES = [
  "Trust and security",
  "Achievement and success",
  "Excitement and energy",
  "Freedom and independence",
  "Connection and belonging",
  "Intelligence and wisdom",
  "Pleasure and enjoyment",
  "Care and nurturing",
] as const;

// Voice Rules table (from blueprint Voice Rules Engine)
export const voiceRules = sqliteTable("voice_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: integer("company_id").notNull(),
  sentenceStyle: text("sentence_style").notNull(),
  vocabulary: text("vocabulary").notNull(),
  tone: text("tone").notNull(),
  avoid: text("avoid").notNull(), // JSON array
  ctaStyle: text("cta_style").notNull(),
  formality: text("formality").notNull(), // 1-10
  emotionalIntensity: text("emotional_intensity").notNull(), // 1-10
});

export const insertVoiceRulesSchema = createInsertSchema(voiceRules).omit({ id: true });
export type InsertVoiceRules = z.infer<typeof insertVoiceRulesSchema>;
export type VoiceRules = typeof voiceRules.$inferSelect;

// Channel Profiles table (from blueprint Channel Adaptation Engine)
export const channelProfiles = sqliteTable("channel_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: integer("company_id").notNull(),
  profiles: text("profiles").notNull(), // JSON: per-channel adaptations
});

export const insertChannelProfilesSchema = createInsertSchema(channelProfiles).omit({ id: true });
export type InsertChannelProfiles = z.infer<typeof insertChannelProfilesSchema>;
export type ChannelProfiles = typeof channelProfiles.$inferSelect;

// Brand Archetypes
export const BRAND_ARCHETYPES = [
  "Creator", "Sage", "Explorer", "Ruler", "Caregiver",
  "Everyman", "Hero", "Magician", "Rebel", "Lover",
  "Jester", "Innocent",
] as const;

// Prompt Library (structured templates per content type, dynamically populated with brand data)
export const promptTemplates = sqliteTable("prompt_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentType: text("content_type").notNull(), // e.g. "Blog Post", "LinkedIn Post"
  category: text("category").notNull(), // Traditional | Digital | Social
  template: text("template").notNull(), // The prompt template with {{placeholders}}
  structureGuidance: text("structure_guidance").notNull(), // How to structure this content type
  isDefault: integer("is_default").notNull().default(1), // 1=system default, 0=custom
});

export const insertPromptTemplateSchema = createInsertSchema(promptTemplates).omit({ id: true });
export type InsertPromptTemplate = z.infer<typeof insertPromptTemplateSchema>;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
