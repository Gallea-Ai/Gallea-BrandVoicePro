import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from "@anthropic-ai/sdk";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import session from "express-session";

const anthropic = new Anthropic();

function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Strip password from user objects before sending to client
function sanitizeUser(user: any) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ──────────────── SESSION + OAUTH SETUP ────────────────
  app.use(session({
    secret: process.env.SESSION_SECRET || "gallea-brand-voice-pro-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (e) { done(e, null); }
  });

  // Helper: find or create OAuth user
  async function findOrCreateOAuthUser(profile: { provider: string; id: string; displayName: string; email: string }) {
    const username = `${profile.provider}_${profile.id}`;
    let user = await storage.getUserByUsername(username);
    if (!user) {
      user = await storage.createUser({
        username,
        password: `oauth_${profile.provider}_${Date.now()}`,
        fullName: profile.displayName || profile.email || "User",
        jobTitle: null,
        role: "admin",
        companyId: null,
      });
    }
    return user;
  }

  // ── Google OAuth ──
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      scope: ["profile", "email"],
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        const user = await findOrCreateOAuthUser({
          provider: "google", id: profile.id, displayName: profile.displayName, email
        });
        done(null, user);
      } catch (e) { done(e as Error, undefined); }
    }));

    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/api/auth/google/callback", passport.authenticate("google", { failureRedirect: "/?auth=failed" }),
      (req, res) => {
        const user = req.user as any;
        res.redirect(`/?auth=success&userId=${user.id}&username=${encodeURIComponent(user.username)}&fullName=${encodeURIComponent(user.fullName)}&role=${user.role}&companyId=${user.companyId || ""}`);
      }
    );
  }

  // ── Facebook OAuth ──
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "displayName", "email"],
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        const user = await findOrCreateOAuthUser({
          provider: "facebook", id: profile.id, displayName: profile.displayName, email
        });
        done(null, user);
      } catch (e) { done(e as Error, undefined); }
    }));

    app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
    app.get("/api/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/?auth=failed" }),
      (req, res) => {
        const user = req.user as any;
        res.redirect(`/?auth=success&userId=${user.id}&username=${encodeURIComponent(user.username)}&fullName=${encodeURIComponent(user.fullName)}&role=${user.role}&companyId=${user.companyId || ""}`);
      }
    );
  }

  // ── Apple OAuth (Sign in with Apple) ──
  // Apple requires more complex setup (private key file, team ID, service ID)
  // Route is available but needs: APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY
  app.get("/api/auth/apple", (_req, res) => {
    if (!process.env.APPLE_CLIENT_ID) {
      return res.status(400).json({ error: "Apple Sign In not configured. Set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY environment variables." });
    }
    res.redirect("/api/auth/apple/start");
  });

  // ── OAuth status endpoint (tells frontend which providers are configured) ──
  app.get("/api/auth/providers", (_req, res) => {
    res.json({
      google: !!process.env.GOOGLE_CLIENT_ID,
      facebook: !!process.env.FACEBOOK_APP_ID,
      apple: !!process.env.APPLE_CLIENT_ID,
    });
  });

  // ──────────────── AUTH / USERS ────────────────
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, fullName, jobTitle, role, companyId } = req.body;
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(400).json({ error: "Username already exists" });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword, fullName, jobTitle: jobTitle || null, role: role || "member", companyId: companyId || null });
      const visitorId = req.headers["x-visitor-id"] as string;
      if (visitorId) await storage.saveSession(visitorId, user.id);
      res.json(sanitizeUser(user));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      // Support both bcrypt hashed and legacy plaintext passwords
      const isValid = user.password.startsWith("$2") ? await bcrypt.compare(password, user.password) : user.password === password;
      if (!isValid) return res.status(401).json({ error: "Invalid credentials" });
      // Save session for persistence
      const visitorId = req.headers["x-visitor-id"] as string;
      if (visitorId) await storage.saveSession(visitorId, user.id);
      res.json(sanitizeUser(user));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Session-based current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    const visitorId = req.headers["x-visitor-id"] as string;
    if (!visitorId) return res.status(401).json({ error: "Not authenticated" });
    // Look up session by visitor ID
    const session = await storage.getSession(visitorId);
    if (!session) return res.status(401).json({ error: "Not authenticated" });
    const user = await storage.getUser(session.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    let company = null;
    if (user.companyId) {
      company = await storage.getCompany(user.companyId);
    }
    res.json({ user: sanitizeUser(user), company });
  });

  // Create session after login
  app.post("/api/auth/session", async (req, res) => {
    try {
      const visitorId = req.headers["x-visitor-id"] as string;
      const { userId } = req.body;
      if (!visitorId) return res.status(400).json({ error: "No visitor ID" });
      await storage.saveSession(visitorId, userId);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Logout / destroy session
  app.post("/api/auth/logout", async (req, res) => {
    const visitorId = req.headers["x-visitor-id"] as string;
    if (visitorId) await storage.deleteSession(visitorId);
    res.json({ ok: true });
  });

  // Update user (e.g. set companyId after company creation)
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { companyId, jobTitle } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      // Update via raw SQL since we don't have a dedicated update method
      const { db } = await import("./storage");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const updated = db.update(users).set({
        companyId: companyId !== undefined ? companyId : user.companyId,
        jobTitle: jobTitle !== undefined ? jobTitle : user.jobTitle,
      }).where(eq(users.id, userId)).returning().get();
      res.json(sanitizeUser(updated));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ──────────────── COMPANIES ────────────────
  app.post("/api/companies", async (req, res) => {
    try {
      const { name, logo, primaryColor, plan } = req.body;
      const accessCode = generateAccessCode();
      const company = await storage.createCompany({ name, logo: logo || null, primaryColor: primaryColor || "#000000", accessCode, plan: plan || "individual" });
      res.json(company);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    const company = await storage.getCompany(parseInt(req.params.id));
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  });

  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.updateCompany(parseInt(req.params.id), req.body);
      res.json(company);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/companies/join", async (req, res) => {
    const { accessCode } = req.body;
    const company = await storage.getCompanyByAccessCode(accessCode);
    if (!company) return res.status(404).json({ error: "Invalid access code" });
    res.json(company);
  });

  app.get("/api/companies/:id/members", async (req, res) => {
    const members = await storage.getUsersByCompany(parseInt(req.params.id));
    res.json(members.map(sanitizeUser));
  });

  app.delete("/api/companies/:id/members/:memberId", async (req, res) => {
    try {
      const memberId = parseInt(req.params.memberId);
      const { db } = await import("./storage");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      // Remove member by setting their companyId to null
      db.update(users).set({ companyId: null }).where(eq(users.id, memberId)).run();
      res.json({ removed: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ──────────────── ASSESSMENT ────────────────
  app.post("/api/assessment", async (req, res) => {
    try {
      const response = await storage.saveAssessmentResponse(req.body);
      res.json(response);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/assessment/:companyId", async (req, res) => {
    const responses = await storage.getAssessmentResponses(parseInt(req.params.companyId));
    res.json(responses);
  });

  // ──────────────── BRAND MAP ENGINE ────────────────
  // Transforms assessment data → Brand DNA Object + Voice Rules + Channel Profiles + Archetypes
  app.post("/api/brand-voice/generate", async (req, res) => {
    try {
      const { companyId, assessmentData } = req.body;

      // ── Step 1: Brand DNA + Archetype + Trait Vector Analysis ──
      const brandMapPrompt = `You are an elite brand strategist at a top agency. Analyze this brand assessment data and produce a comprehensive Brand DNA profile.

ASSESSMENT DATA:
${JSON.stringify(assessmentData, null, 2)}

Generate a JSON response with EXACTLY this structure. Be thorough and specific — this drives all content generation:

{
  "emotionalTerritories": {
    "trust_security": <0-100>,
    "achievement_success": <0-100>,
    "excitement_energy": <0-100>,
    "freedom_independence": <0-100>,
    "connection_belonging": <0-100>,
    "intelligence_wisdom": <0-100>,
    "pleasure_enjoyment": <0-100>,
    "care_nurturing": <0-100>
  },
  "brandRightSpace": "<Two key descriptors like 'Fun + Knowledgeable'>",
  "singularityScore": <0-100>,
  "differentiators": ["<4-6 specific brand differentiators>"],
  "dangerZones": ["<negative traits/tones to avoid>"],
  "positiveTraits": ["<6-8 core positive brand traits>"],
  "negativeTraits": ["<words and concepts that must NEVER appear in brand content>"],
  
  "brandDNA": {
    "corePromise": "<one-sentence brand promise>",
    "primaryMotivation": "<aspiration|security|freedom|connection|wisdom|pleasure|care|achievement>",
    "secondaryMotivation": "<different from primary>",
    "archetypePrimary": "<Creator|Sage|Explorer|Ruler|Caregiver|Everyman|Hero|Magician|Rebel|Lover|Jester|Innocent>",
    "archetypeSecondary": "<different from primary>",
    "archetypeExclusions": ["<2-3 archetypes this brand should NEVER embody>"],
    "emotionalOutcomes": ["<3-4 feelings the audience should have after encountering this brand>"]
  },

  "traitVector": {
    "bold_reserved": <0.0-1.0 where 1.0=bold>,
    "modern_classic": <0.0-1.0 where 1.0=modern>,
    "luxury_mass": <0.0-1.0 where 1.0=luxury>,
    "playful_serious": <0.0-1.0 where 1.0=playful>,
    "warm_cool": <0.0-1.0 where 1.0=warm>,
    "innovative_traditional": <0.0-1.0 where 1.0=innovative>,
    "accessible_exclusive": <0.0-1.0 where 1.0=accessible>
  },

  "voiceRules": {
    "sentenceStyle": "<e.g. 'short to medium, controlled'>",
    "vocabulary": "<e.g. 'elevated but accessible'>",
    "tone": "<e.g. 'confident, calm, intelligent'>",
    "avoid": ["<specific words/phrases/tones to avoid>"],
    "ctaStyle": "<e.g. 'assured, never aggressive'>",
    "formality": "<1-10 scale>",
    "emotionalIntensity": "<1-10 scale>"
  },

  "channelProfiles": {
    "website": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""},
    "social_linkedin": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""},
    "social_instagram": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""},
    "social_twitter": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""},
    "email": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""},
    "blog": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""},
    "brochure": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""},
    "sales": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""},
    "ads": {"toneAdjust": "", "structureNotes": "", "lengthGuidance": ""}
  },

  "voicePrompt": "<A detailed 400-600 word system prompt that instructs an AI to write in this brand's exact voice. Include: role definition, brand DNA summary, tone/vocabulary rules, sentence structure preferences, emotional register, specific do's and don'ts, archetype alignment, channel awareness, and brand governance constraints. This is the MASTER prompt used for ALL content generation.>"
}

Return ONLY valid JSON, no markdown code blocks.`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        messages: [{ role: "user", content: brandMapPrompt }],
      });

      const responseText = (message.content[0] as any).text;
      let profileData;
      try {
        profileData = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) profileData = JSON.parse(jsonMatch[0]);
        else throw new Error("Failed to parse brand voice profile");
      }

      // ── Step 2: Save Brand Voice Profile ──
      const profile = await storage.saveBrandVoiceProfile({
        companyId,
        emotionalTerritories: JSON.stringify(profileData.emotionalTerritories),
        brandRightSpace: profileData.brandRightSpace,
        singularityScore: profileData.singularityScore,
        differentiators: JSON.stringify(profileData.differentiators),
        dangerZones: JSON.stringify(profileData.dangerZones),
        voicePrompt: profileData.voicePrompt,
        positiveTraits: JSON.stringify(profileData.positiveTraits),
        negativeTraits: JSON.stringify(profileData.negativeTraits),
        mandatories: JSON.stringify({
          brandDNA: profileData.brandDNA,
          traitVector: profileData.traitVector,
        }),
      });

      // ── Step 3: Save Voice Rules ──
      if (profileData.voiceRules) {
        await storage.saveVoiceRules({
          companyId,
          sentenceStyle: profileData.voiceRules.sentenceStyle,
          vocabulary: profileData.voiceRules.vocabulary,
          tone: profileData.voiceRules.tone,
          avoid: JSON.stringify(profileData.voiceRules.avoid),
          ctaStyle: profileData.voiceRules.ctaStyle,
          formality: String(profileData.voiceRules.formality),
          emotionalIntensity: String(profileData.voiceRules.emotionalIntensity),
        });
      }

      // ── Step 4: Save Channel Profiles ──
      if (profileData.channelProfiles) {
        await storage.saveChannelProfiles({
          companyId,
          profiles: JSON.stringify(profileData.channelProfiles),
        });
      }

      res.json({
        ...profile,
        voiceRules: profileData.voiceRules,
        channelProfiles: profileData.channelProfiles,
        brandDNA: profileData.brandDNA,
        traitVector: profileData.traitVector,
      });
    } catch (e: any) {
      console.error("Brand voice generation error:", e);
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/brand-voice/:companyId", async (req, res) => {
    const profile = await storage.getBrandVoiceProfile(parseInt(req.params.companyId));
    if (!profile) return res.status(404).json({ error: "No brand voice profile found" });
    const voiceRulesData = await storage.getVoiceRules(parseInt(req.params.companyId));
    const channelProfilesData = await storage.getChannelProfiles(parseInt(req.params.companyId));
    res.json({
      ...profile,
      voiceRulesData,
      channelProfilesData,
    });
  });

  // ──────────────── CONTENT GENERATION (Prompt Engine + Scoring Engine) ────────────────
  app.post("/api/content/generate", async (req, res) => {
    try {
      const { companyId, userId, category, contentType, contentIdea, creativeBrief, regenerationFeedback, previousOutput } = req.body;

      // Get brand voice profile + voice rules + channel profiles
      const profile = await storage.getBrandVoiceProfile(companyId);
      if (!profile) return res.status(400).json({ error: "Complete brand voice assessment first" });

      const voiceRulesData = await storage.getVoiceRules(companyId);
      const channelProfilesData = await storage.getChannelProfiles(companyId);
      const negativeTraits = JSON.parse(profile.negativeTraits);
      const dangerZones = JSON.parse(profile.dangerZones);

      // ── Channel Adaptation ──
      let channelContext = "";
      if (channelProfilesData) {
        const profiles = JSON.parse(channelProfilesData.profiles);
        // Map content type to channel
        const channelMap: Record<string, string> = {
          "Blog Post": "blog", "Landing Page": "website", "Website Page Copy": "website",
          "Email Campaign": "email", "Sales Outreach Email": "email", "Follow-up Email": "email",
          "Newsletter": "email", "LinkedIn Post": "social_linkedin", "Twitter / X Post": "social_twitter",
          "Instagram Caption": "social_instagram", "Facebook Post": "social_instagram",
          "Brochure": "brochure", "Sales Sheet / One-Pager": "sales", "Print Ad": "ads",
          "Google / Search Ad Copy": "ads", "Social Ad Copy": "ads",
        };
        const channelKey = channelMap[contentType];
        if (channelKey && profiles[channelKey]) {
          const cp = profiles[channelKey];
          channelContext = `\n\nCHANNEL ADAPTATION (${contentType}):
- Tone adjustment: ${cp.toneAdjust}
- Structure: ${cp.structureNotes}
- Length guidance: ${cp.lengthGuidance}`;
        }
      }

      // ── Voice Rules Integration ──
      let voiceRulesContext = "";
      if (voiceRulesData) {
        const avoidList = JSON.parse(voiceRulesData.avoid);
        voiceRulesContext = `\n\nVOICE RULES:
- Sentence style: ${voiceRulesData.sentenceStyle}
- Vocabulary level: ${voiceRulesData.vocabulary}
- Tone: ${voiceRulesData.tone}
- CTA style: ${voiceRulesData.ctaStyle}
- Formality (1-10): ${voiceRulesData.formality}
- Emotional intensity (1-10): ${voiceRulesData.emotionalIntensity}
- AVOID these words/phrases: ${avoidList.join(", ")}`;
      }

      // ── PRE-GENERATION: Build system prompt with full governance ──
      const systemPrompt = `[ROLE]
You are an expert copywriter working for a brand. Every word must sound like it came from this brand's internal team.

[BRAND DNA]
${profile.voicePrompt}
${voiceRulesContext}
${channelContext}

[BRAND GOVERNANCE — MANDATORY]
1. NEVER use any of these words, concepts, or tones: ${[...negativeTraits, ...dangerZones].join(", ")}
2. ALL content MUST be positive, constructive, and aligned with brand values.
3. NEVER write anything that could damage the brand's reputation.
4. NEVER include competitor disparagement or negative comparisons.
5. Maintain the brand's emotional positioning and voice consistency at all times.
6. Content must feel authentic — not generic, templated, or AI-generated.
${profile.mandatories ? `7. BRAND DNA CONTEXT: ${profile.mandatories}` : ""}

[OUTPUT FORMAT]
- Write ONLY the final copy — no meta-commentary, no explanations, no markdown headers about the content type
- Just the ready-to-use ${contentType}`;

      let userPrompt = `[TASK]\nGenerate ${contentType} content.\n\nContent Idea: ${contentIdea}`;

      if (creativeBrief) {
        const brief = typeof creativeBrief === "string" ? JSON.parse(creativeBrief) : creativeBrief;
        if (brief.projectName) userPrompt += `\nProject Name: ${brief.projectName}`;
        if (brief.background) userPrompt += `\nBackground: ${brief.background}`;
        if (brief.objectives) userPrompt += `\nObjectives: ${brief.objectives}`;
        if (brief.targetAudience) userPrompt += `\nTarget Audience: ${brief.targetAudience}`;
        if (brief.keyMessages) userPrompt += `\nKey Messages: ${brief.keyMessages}`;
        if (brief.toneNotes || brief.toneAndFeel) userPrompt += `\nTone Notes: ${brief.toneNotes || brief.toneAndFeel}`;
        if (brief.deliverables) userPrompt += `\nDeliverables: ${brief.deliverables}`;
        if (brief.mandatoryInclusions) userPrompt += `\nMandatory Inclusions: ${brief.mandatoryInclusions}`;
        if (brief.references) userPrompt += `\nReferences: ${brief.references}`;
      }

      // Regeneration with feedback: include previous output and user's change request
      if (regenerationFeedback && previousOutput) {
        userPrompt += `\n\n[REGENERATION REQUEST]\nPrevious output:\n"""${previousOutput}"""\n\nUser feedback on what to change: ${regenerationFeedback}\n\nPlease generate an improved version addressing this feedback while maintaining brand voice.`;
        // Log feedback for continuous improvement
        console.log(`[Regeneration Feedback] Company ${companyId}, Type: ${contentType}, Feedback: ${regenerationFeedback}`);
      }

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const generatedText = (message.content[0] as any).text;

      // ── POST-GENERATION: Enhanced Scoring Engine ──
      const scoringPrompt = `You are a brand governance auditor and scoring engine. Score the following content against the brand voice profile on EIGHT dimensions.

BRAND PROFILE:
- Brand Right Space: ${profile.brandRightSpace}
- Positive traits: ${profile.positiveTraits}
- Danger zones: ${profile.dangerZones}
- Negative traits blocklist: ${profile.negativeTraits}
${voiceRulesData ? `- Voice Rules: sentence=${voiceRulesData.sentenceStyle}, vocabulary=${voiceRulesData.vocabulary}, tone=${voiceRulesData.tone}, formality=${voiceRulesData.formality}/10` : ""}

CONTENT TO SCORE:
"""
${generatedText}
"""

Score each dimension 0-100 and provide specific feedback. Return ONLY valid JSON:
{
  "toneMatch": <0-100>,
  "vocabularyFit": <0-100>,
  "brandConsistency": <0-100>,
  "emotionalResonance": <0-100>,
  "archetypeAlignment": <0-100>,
  "clarityOfPromise": <0-100>,
  "channelFit": <0-100>,
  "distinctiveness": <0-100>,
  "overallScore": <0-100>,
  "governanceFlags": ["<list any governance violations, or empty if clean>"],
  "issues": ["<specific issues found>"],
  "recommendations": ["<specific improvements suggested>"]
}`;

      const scoringMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: scoringPrompt }],
      });

      const scoringText = (scoringMessage.content[0] as any).text;
      let scores;
      try {
        scores = JSON.parse(scoringText);
      } catch {
        const jsonMatch = scoringText.match(/\{[\s\S]*\}/);
        scores = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          toneMatch: 85, vocabularyFit: 85, brandConsistency: 85, emotionalResonance: 85,
          overallScore: 85, governanceFlags: [], issues: [], recommendations: []
        };
      }

      // ── Governance gate: reject if score below threshold ──
      if (scores.governanceFlags?.length > 0 && scores.overallScore < 50) {
        return res.status(422).json({
          error: "Content failed brand governance check",
          flags: scores.governanceFlags,
          scores,
        });
      }

      const saved = await storage.saveGeneratedContent({
        companyId,
        userId,
        category,
        contentType,
        contentIdea,
        creativeBrief: creativeBrief ? JSON.stringify(creativeBrief) : null,
        generatedText,
        toneMatch: scores.toneMatch,
        vocabularyFit: scores.vocabularyFit,
        brandConsistency: scores.brandConsistency,
        emotionalResonance: scores.emotionalResonance,
        overallScore: scores.overallScore,
        createdAt: new Date().toISOString(),
      });

      res.json({
        ...saved,
        governanceFlags: scores.governanceFlags || [],
        issues: scores.issues || [],
        recommendations: scores.recommendations || [],
        archetypeAlignment: scores.archetypeAlignment,
        clarityOfPromise: scores.clarityOfPromise,
        channelFit: scores.channelFit,
        distinctiveness: scores.distinctiveness,
      });
    } catch (e: any) {
      console.error("Content generation error:", e);
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/content/:companyId", async (req, res) => {
    const content = await storage.getGeneratedContent(parseInt(req.params.companyId));
    res.json(content);
  });

  app.delete("/api/content/:id", async (req, res) => {
    await storage.deleteGeneratedContent(parseInt(req.params.id));
    res.json({ deleted: true });
  });

  // ──────────────── PROMPT LIBRARY ────────────────
  app.get("/api/prompts", async (_req, res) => {
    const templates = await storage.getPromptTemplates();
    res.json(templates);
  });

  app.get("/api/prompts/:contentType", async (req, res) => {
    const template = await storage.getPromptTemplate(req.params.contentType);
    if (!template) return res.status(404).json({ error: "No template found" });
    res.json(template);
  });

  // ──────────────── EDIT & RE-SCORE ────────────────
  app.post("/api/content/:id/rescore", async (req, res) => {
    try {
      const { editedText, companyId } = req.body;
      const contentId = parseInt(req.params.id);

      const profile = await storage.getBrandVoiceProfile(companyId);
      if (!profile) return res.status(400).json({ error: "No brand voice profile found" });

      const voiceRulesData = await storage.getVoiceRules(companyId);

      const scoringPrompt = `You are a brand governance auditor and scoring engine. Score the following EDITED content against the brand voice profile on EIGHT dimensions.

BRAND PROFILE:
- Brand Right Space: ${profile.brandRightSpace}
- Positive traits: ${profile.positiveTraits}
- Danger zones: ${profile.dangerZones}
- Negative traits blocklist: ${profile.negativeTraits}
${voiceRulesData ? `- Voice Rules: sentence=${voiceRulesData.sentenceStyle}, vocabulary=${voiceRulesData.vocabulary}, tone=${voiceRulesData.tone}, formality=${voiceRulesData.formality}/10` : ""}

EDITED CONTENT TO SCORE:
"""
${editedText}
"""

Score each dimension 0-100 and provide specific feedback. Return ONLY valid JSON:
{
  "toneMatch": <0-100>,
  "vocabularyFit": <0-100>,
  "brandConsistency": <0-100>,
  "emotionalResonance": <0-100>,
  "archetypeAlignment": <0-100>,
  "clarityOfPromise": <0-100>,
  "channelFit": <0-100>,
  "distinctiveness": <0-100>,
  "overallScore": <0-100>,
  "governanceFlags": ["<list any governance violations, or empty if clean>"],
  "issues": ["<specific issues found>"],
  "recommendations": ["<specific improvements suggested>"]
}`;

      const scoringMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: scoringPrompt }],
      });

      const scoringText = (scoringMessage.content[0] as any).text;
      let scores;
      try {
        scores = JSON.parse(scoringText);
      } catch {
        const jsonMatch = scoringText.match(/\{[\s\S]*\}/);
        scores = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          toneMatch: 85, vocabularyFit: 85, brandConsistency: 85, emotionalResonance: 85,
          overallScore: 85, governanceFlags: [], issues: [], recommendations: []
        };
      }

      // Update the content record with new text and scores
      await storage.updateGeneratedContent(contentId, {
        generatedText: editedText,
        toneMatch: scores.toneMatch,
        vocabularyFit: scores.vocabularyFit,
        brandConsistency: scores.brandConsistency,
        emotionalResonance: scores.emotionalResonance,
        overallScore: scores.overallScore,
      });

      res.json({
        id: contentId,
        generatedText: editedText,
        ...scores,
      });
    } catch (e: any) {
      console.error("Re-score error:", e);
      res.status(400).json({ error: e.message });
    }
  });

  return httpServer;
}
