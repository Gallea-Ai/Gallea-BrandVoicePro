# GalleaBrandVoicePro -- Complete Platform Specification
# For Claude Code Implementation
# Last updated: March 23, 2026 (includes all March 23 change tracker items)

---

# PART 1: GLOBAL DESIGN SYSTEM

## Typography
All text uses the Elza font family exclusively. No other typefaces anywhere.

| Weight | Size | Color | Usage |
|--------|------|-------|-------|
| Extralight (200) | 60px | #000000 | Hero headings on auth/onboarding cards |
| Medium (500) | 36px | #000000 | Page titles (Settings, Analytics, FAQ, Brand Voice, etc.) |
| Medium (500) | 20px | #000000 | Questionnaire question text, section headers |
| Light (300) | 20px | #000000 | Body text, descriptions, subtitles |
| Light (300) | 20px | #FFFFFF | Button text on auth/onboarding cards |
| Regular (400) | 16px | #000000 | "GalleaBrandVoicePro" logo on inner platform pages |
| Regular (400) | 16px | #FFFFFF | Logo in dark/header contexts |
| Semibold (600) | 16px | #000000 | Brand Voice section titles |
| Regular (400) | 16px | #000000 | Brand Voice header action links (Retake Assessment, Upload) |
| Medium (500) | 14px | #000000 | Tab labels, field labels, nav items, card headers, accordion labels, selection limit instructions |
| Medium (500) | 14px | #FF8900 | Voice intensity indicator ("3/10 Core") |
| Medium (500) | 14px | #1F9A15 | Score badges (Library, Analytics) |
| Medium (500) | 14px | #EAEAEA | Selected tag/chip text on questionnaire |
| Medium Oblique (500) | 12px | #000000 | Italic input labels on Library cards |
| Light (300) | 14px | #000000 | Answer options, helper text, footer, small labels, body text |
| Light (300) | 14px | #FFFFFF | Button text on dark buttons |
| Light (300) | 14px | #585858 | Muted helper text ("Already have an account?") |
| Light (300) | 14px | #9B9B9B | Input placeholder text |
| Light (300) | 14px | #7E7E7E | Muted counts, filter labels |
| Regular (400) | 14px | #7E7E7E | Empty state text ("Your rewritten content will appear here") |
| Light (300) | 12px | #9B9B9B | Card helper text, chart subtitles |
| Light (300) | 12px | #FF0000 | Negative change indicators (Analytics) |
| Light (300) | 8px | #8E8E8E | Micro helper text under inputs |

## Color Palette

| Hex | Usage |
|-----|-------|
| #FFFFFF | Page backgrounds, input bgs, card bgs, inactive tab fills |
| #EAEAEA | Auth card background, selected questionnaire tag bg |
| #F0F0F0 | Creative Brief input field backgrounds |
| #E5E5E5 | Card borders, dividers |
| #B7B7B7 | Light gray borders, inactive elements, slider track |
| #9B9B9B | Placeholder text in inputs |
| #8E8E8E | Micro helper text |
| #7E7E7E | Empty state text, muted labels |
| #707070 | Input borders |
| #585858 | Muted helper text |
| #000000 | Primary text, active tabs, CTA buttons, borders, selected states, slider thumb |
| #00000029 | Card box-shadow on auth/onboarding cards |
| #111111 | Brand Voice emotional territory map dark background |
| #FF8900 | Orange accent -- voice intensity ("3/10 Core") in sidebar |
| #FF0000 | Red -- negative change indicators, danger zone highlights |
| #1F9A15 | Green -- score badges, "Excellent" badge, positive indicators |

## Component Patterns

### Buttons
- **Primary CTA:** Black (#000000) bg, white text, border-radius 10px, full width within context, Elza Light 14-20px depending on context
- **Auth/onboarding CTA:** 368px wide, 42px tall, Elza Light 20px #FFFFFF
- **Questionnaire Continue:** Full width of content column, black bg, Elza Light 14px #FFFFFF
- **Generate button:** Full width of left input panel, black bg, dynamic text "Generate [Content Type]", Elza Light 14px #FFFFFF

### Tab Pills (Create Page, Brand Voice toggle)
- **Active:** Black (#000000) fill, white (#FFFFFF) text, border-radius ~20px
- **Inactive:** White/transparent fill, 1px solid #000000 border, black text

### Cards
- White bg, 1px solid #E5E5E5 border, border-radius ~8-12px
- Auth/onboarding cards: #EAEAEA background with subtle gradient header band, box-shadow 0px 3px 6px #00000029
- Overall card treatments should feel polished, warm, and premium consulting-grade

### Accordions (Settings, FAQ)
- Full width row, white bg, 1px solid #E5E5E5 border, border-radius ~8px, padding ~16px 24px
- Label: Elza Medium 14px #000000 (left), chevron down arrow (right)
- Expanded: chevron rotates up, content area appears below header with smooth animation (max-height transition 0.25s ease)

### Tag/Chip (Questionnaire)
- Unselected: white bg, 1px solid #000000 border, border-radius ~4px, Elza Light 14px #000000
- Selected: black bg, Elza Medium 14px #FFFFFF (or #EAEAEA)
- Grid layout, ~5 per row with consistent gap

### Draggable Slider (Questionnaire -- replaces number scale buttons)
- **Track:** Full width, 4px tall, #B7B7B7 background, border-radius 2px
- **Thumb:** 20px circle, #000000 fill, draggable
- **Filled portion:** #000000 from left edge to thumb position
- **Bipolar labels:** Elza Light 14px at each end of the track
- **Value display:** Small label above or below thumb showing current position (optional)
- Backend maps position to numeric value (1-7 or 1-10 depending on question)

### Tooltips / Info Icons
- Small "i" icon (circle, 16px, #B7B7B7 border, #585858 text)
- On hover/click: tooltip popover with explanation text, Elza Light 12px #000000 on white bg, max-width 280px, subtle shadow

### Selection Limit Instructions (Questionnaire -- GLOBAL)
- **CRITICAL:** All "Select up to X" / "Select at least X" instructions must appear ABOVE the options, not at the end of the question text
- Style: Elza Medium 14px, #000000, displayed as a distinct line between the question text and the answer options
- Example layout: Question text (Elza Medium 20px) > Selection instruction (Elza Medium 14px, e.g., "Select up to 3") > Answer options below

### "All of the Above" Option (Questionnaire -- GLOBAL)
- On any multi-select question where it makes contextual sense, include an "All of the Above" tag/option
- Selecting "All of the Above" auto-selects all other options
- Deselecting any individual option after "All of the Above" was selected should deselect the "All of the Above" tag

---

# PART 2: SIDEBAR (Global, all platform pages)

## Layout
- Width: ~140px, fixed left, full viewport height
- Border-right: 1px solid #E5E5E5
- **Overflow: hidden.** No sidebar content may bleed past the right border under any circumstance.

## Content (top to bottom)

### Brand Header
- "Gallea Ai" -- Elza Medium ~16px, #000000

### Voice Status Block
- "Voice Active" -- Elza Light 14px, #000000
- "[Primary Territory]" (e.g. "Excitement / Energy") -- Elza Light 14px, #000000
- "[Intensity]/10 Core" (e.g. "3/10 Core") -- Elza Medium 14px, #FF8900
- "Current Voice" -- Elza Light 14px, #000000
- **Values must update dynamically** when brand voice profile changes

### Top Nav Group
1. **Create** (default landing page after login)
2. **Library**

### Bottom Nav Group (separated by visual spacing)
3. **Analytics**
4. **Brand Voice**
5. **Settings**
6. **FAQ**

### Footer
- "[User Name]" -- Elza Light 14px, #000000
- "Sign Out" -- Elza Light 14px, #000000
- Collapse chevron (<)

### Active State
- Active nav item: bold/underlined text
- All other items: regular weight

---

# PART 3: AUTH + ONBOARDING FLOW

All auth/onboarding screens share: full-bleed gradient/sky background image, centered card with #EAEAEA top band fading to white, "Back" link top-left in white, "Powered by Gallea Ai" footer below card.

## Page 1: Landing / Welcome
- **[NEEDS ATTENTION]** Layout and visual hierarchy must feel polished. Centered card, clean hierarchy, brand name prominent, architectural background.
- GalleaBrandVoicePro logo
- "AI-powered content that sounds exactly like your brand." -- Elza Medium 36px
- "Welcome. Let's Get You Started." -- Elza Extralight 60px
- "Get Started" button (black, 368px)
- "Already have an account? Sign in" button
- reCAPTCHA / Terms footer text

## Page 2: Create Account
- "Create Your Account" heading
- OAuth buttons: Google, Apple, Facebook (white bg, bordered, 368px) -- OAuth ABOVE manual fields
- "Or" divider
- Full Name, Email, Password input fields
- "Continue" button (black)
- "Already have an account? Sign in"

## Page 3: Choose Your Plan
- "Choose Your Brand Voice Pro?" heading
- **3 tier cards side by side:**
  - **Individual:** "$149.99/Month", person icon, "For freelancers, solo creators, and small teams."
    - Feature list: Brand voice assessment, 30 content types, brand alignment scoring, Library
  - **Growth (up to 10 users):** "$999/Month", team icon, "For growing teams scaling their content."
    - Feature list: Everything in Individual + brand governance, corporate compliance, document upload, team analytics, access key distribution
  - **Enterprise (up to 100 users):** "$7,500/Month", building icon, "For organizations enforcing brand at scale."
    - Feature list: Everything in Growth + additional compliance layer (TBD), dedicated support, advanced reporting
- **Each card needs a visible feature list.** Reference Perplexity's pricing page for the level of detail expected.
- Each card: white bg, border-radius, icon, title, description, price, feature list, "Continue" button

## Page 4: Your Company
- "Your Company" heading
- "Tell us about your brand. You'll be the administrator."
- Company/Brand Name input
- Your Job Title input
- Logo upload zone: dashed border, upload icon, "Drag and Drop Your Company Logo Here. (Optional) PNG, SVG, or JPG. Max 5MB"
- **REMOVED:** Primary Brand Colour -- not implemented
- "Continue" button

## Page 5: Set Up Your Workspace
- "Let's Set Up Your Workspace" heading
- Two selection cards (stacked vertically):
  - "Join Existing Company" / "I have a company access code"
  - "Create New Company" / "Set up as administrator"

## Page 21: Sign In (returning users)
- "Welcome Back" heading
- "Sign in to continue where you left off."
- OAuth buttons (Google, Apple, Facebook) -- above manual fields
- "Or" divider
- Email, Password input fields
- "Sign In" button (black)
- "Forgot Password?" link (underlined)
- "Don't have an account? Get Started"

## Page 22: Reset Password
- "Reset Password" heading
- Email input field
- "Reset" button (black)
- **Success state after submission:** "Check your email for a reset link."
- **Backend:** Email sending needs implementation
- "Don't have an account? Get Started"

## Page 23: Brand Voice Assessment Intro
- "Brand Voice Assessment" heading
- Stats block: "96 positive and negative emotions" / "182 personality associations" / "38 functional attributes" / "Mapping your position across 8 emotional territories" / "to generate your unique brand voice profile"
- Info card: ~40 Minutes | 7 Modules | Ai Voice Profile
- **[NEEDS ATTENTION]** Step indicators were re-flagged as too big/visually heavy. Make them proportionate and subtle.
- Helper text: "Take your time with each question. The more thoughtful your responses, the more accurate your brand voice profile will be."
- "Begin Assessment" button (black)

## Page 24: Join Your Team (Enterprise seat-holders)
- "Join Your Team" heading
- "Enter the access code shared by your company administrator. You'll inherit the company's brand voice automatically."
- Company Access Code input
- Your Job Title input
- "Join Company" button (black)
- **ROUTING:** Skips questionnaire, lands on Create page with brand voice locked.

---

# PART 4: BRAND MAPPING QUESTIONNAIRE

All questionnaire screens share: white page background (#FFFFFF), top bar with "Back" (left) + "GalleaBrandVoicePro" logo (center) + "X / 7" counter (right), module header centered with title + description + 7 progress dots, "Continue" button full width at bottom, "Powered by Gallea Ai" footer.

**GLOBAL QUESTIONNAIRE RULES:**
1. Selection limit instructions ("Select up to 3", "Select at least 3") must appear ABOVE the options in prominent text (Elza Medium 14px), not buried at the end of the question.
2. Multi-select questions should include "All of the Above" where contextually appropriate.
3. If user selected "New brand (0-2 years)" in Module 1, skip/hide questions about historical performance across all modules (Module 6 Q6 specifically, and any others referencing past performance).

## Module 1: Brand Fundamentals (8 questions, all radio-select)
- "Establish baseline brand identity and category context"
- Q1: Industry/category (14 options)
- Q2: Brand age (4 options) -- **NOTE: "New brand (0-2 years)" selection triggers conditional skip logic for performance questions in later modules**
- Q3: Market position (5 options)
- Q4: Primary customer base (4 options)
- Q5: Price spectrum (5 options)
- Q6: Geographic reach (4 options)
- Q7: Brand awareness level (4 options)
- Q8: Primary business objective (5 options)

## Module 2: Emotional Territory (18 questions -- UPDATED from 16)
- "Map your brand's emotional positioning across 8 territories"

**Emotion Ranking (4 questions):**
- Q1: "Select your PRIMARY emotion" -- radio, 8 options. **Make clear this is the first of four ranked picks.**
- Q2: "Select your SECONDARY emotion" -- radio, 8 options. **Explicitly label as second of four.**
- Q3: "Select your TERTIARY emotion" -- radio, 8 options. **NEW from change tracker.**
- Q4: "Select your QUATERNARY emotion" -- radio, 8 options. **NEW from change tracker. These four selections become the user's brand pillars.**

**Emotional Strength:**
- Q5: "How STRONGLY do customers feel these emotions toward your brand?" -- draggable slider, 1-10. **Add helper text: "1 = Weak/no association, 10 = Extremely strong emotional connection. This refers to the emotions you selected above."**

**Bipolar Spectrum Ratings (12 questions -- consolidated on ONE scrollable page with sliders):**
- Q6-Q17: All presented on a single scrollable page. Each shows two poles at each end of a draggable slider bar. No repeated "Rate where your brand falls" header per question. One intro at the top: "Position your brand on each spectrum by dragging the slider."
  - Reliable/Secure vs Unpredictable/Risky
  - Ambitious/Achieving vs Modest/Humble
  - Bold/Exciting vs Calm/Subdued
  - Independent/Free vs Traditional/Conforming
  - Warm/Connected vs Distant/Detached
  - Intelligent/Expert vs Simple/Basic
  - Indulgent/Pleasurable vs Practical/Functional
  - Caring/Nurturing vs Tough/Demanding
  - Playful/Humorous vs Serious/Composed
  - Nostalgic/Heritage-driven vs Future-forward/Progressive
  - Luxurious/Premium vs Accessible/Everyday
  - Rebellious/Disruptive vs Established/Institutional
- **Backend:** Each slider position maps to 1-7 numeric value for scoring.

**Motivation:**
- Q18: "What motivates customers to choose your brand over competitors?" -- multi-select, 8 options

## Module 3: Brand Personality (10 questions, multi-select tags + text)
- "Identify traits and danger zone risks"

**Positive Traits:**
- Q1: "Which POSITIVE traits describe your brand?" -- multi-select tag grid, 24 tags
  - **Add selection limit: "Select up to 10"** (instruction above options, prominent)
  - **Add "Positive Zone" category labels** to group the positive traits, matching the danger zone labeling style (e.g., "Security positive zone", "Achievement positive zone", etc.)

**Danger Zones (Q2-Q9):** Same as before, with "None of these" option per zone
- Q2: Security danger zone (5 tags)
- Q3: Achievement danger zone (5 tags)
- Q4: Excitement danger zone (5 tags)
- Q5: Freedom danger zone (5 tags)
- Q6: Connection danger zone (5 tags)
- Q7: Wisdom danger zone (5 tags)
- Q8: Pleasure danger zone (5 tags)
- Q9: Care danger zone (5 tags)

**Customer Description:**
- Q10: "How do your most loyal customers describe your brand to others?" -- text area, 250 char max

## Module 4: Competitive Positioning (7 questions, mixed)
- "Understand competitive emotional territory and differentiation"
- Q1: Number of competitors (radio, 4)
- Q2: Competitor emotions (multi-select tags, **"Select up to 3" instruction above options, prominent**)
- Q3: Category baseline expectations (multi-select tags, 10, + "All of the Above")
- Q4: Differentiation level (radio, 4)
- Q5: Key differentiators (multi-select tags)
- Q6: Unowned territories (radio, 4)
- Q7: Desired territory to own (radio, 8)

## Module 5: Brand Coherence (8 questions, mixed)
- "Assess Brand Singularity, is your message unified or fragmented?"
- Q1: Active communication channels (multi-select tags, 23 options + **"All of the Above"**)
- Q2-7: Emotional consistency per touchpoint (radio, 5 options each)
- Q8: Overall unified experience (radio, 4)

## Module 6: Performance Indicators (6 questions -- UPDATED, was 7)
- "Understand brand health and improvement opportunities"
- **FIX: Remove duplicate Q5** ("Can you charge a price premium" appeared twice)
- **FIX: Last question had wrong header** ("SECOND most important emotion" label was misplaced). Correct the header to match the actual answer options (brand challenges).
- **CONDITIONAL: If "New brand (0-2 years)" was selected in Module 1 Q2, skip Q6 (brand performance over past 2 years) entirely.**
- Q1: Market recognition % (radio, 5)
- Q2: Purchase consideration % (radio, 5)
- Q3: Customer retention rate (radio, 5)
- Q4: Recommendation rate (radio, 4)
- Q5: Price premium capability (radio, 5)
- Q6: Brand performance trend (radio, 5) -- **conditional, hidden for new brands**
- Q7: "What are your brand's biggest challenges right now?" -- multi-select, 10 options + "All of the Above"

## Module 7: Brand Strategy & Foundations (6 questions, mixed with conditional logic + file upload)
- "Capture your existing brand strategy assets and organizational context"
- Q1: Organization size (radio, 6 options)
- Q2: Has positioning statement? (radio: Yes/No)
- Q3: Positioning statement input -- **CONDITIONAL: only show if Q2 = Yes**
  - Text area for paste/type
  - **PLUS drag-and-drop file upload zone** as alternative ("Or upload your positioning statement document. PDF, DOCX, TXT.")
- Q4: Has brand essence/DNA document? (radio: Yes/No)
  - **If Yes: show drag-and-drop file upload zone** ("Upload your brand essence or brand DNA document. PDF, DOCX, TXT.")
- Q5: Knows brand pillars? (radio: Yes/No)
- Q6: List brand pillars -- **CONDITIONAL: only show if Q5 = Yes**
  - **4 separate input fields** (one per pillar, aligned with the 4 emotion selections from Module 2)
  - **PLUS drag-and-drop file upload zone** as alternative
- **Final button: "Build My Brand Voice"** (not "Complete Assessment", not "Continue")

## Total: 7 modules, ~64 questions (varies with conditional logic)

---

# PART 5: PROCESSING / CALCULATION SCREEN

After clicking "Build My Brand Voice" on Module 7, show an animated processing experience.

- **Full-screen, no sidebar**
- **Animated visualization:** Brain neural network graphic with electric pulses traveling across neural pathways. This should feel premium and visually engaging, not a basic spinner.
- **Cycling progress messages** (fade in/out, 3-4 seconds each):
  1. "Analyzing your brand DNA..."
  2. "Crafting your brand pillars..."
  3. "Mapping emotional territories..."
  4. "Building your voice profile..."
- **Minimum display time: 20 seconds** (even if API completes faster)
- On completion: auto-route to /brand-voice

---

# PART 6: MODULE COMPLETION INTERSTITIALS

Between each module, show a brief interstitial screen.

- White background, centered content
- Animated checkmark icon (green #1F9A15, draws in with CSS animation)
- "Module Complete!" -- Elza Medium 20px
- "[Module Name] Captured" -- Elza Light 14px
- "You've completed [X] of 7 modules." -- Elza Light 14px, #585858
- Auto-advance after 2 seconds, OR user clicks "Continue to [Next Module Name]"

---

# PART 7: MAIN PLATFORM PAGES

## Create Page (default landing after login)

### Layout
- Sidebar (left) + main content area
- "GalleaBrandVoicePro" wordmark centered above content
- Three pill tabs: Traditional | Digital | Social
- **[NEEDS ATTENTION]** Remove any extra navigation above these tabs that exists in the deployed version. Only these three tabs.
- Two-column layout below tabs: left input panel (~45-48%) + right output panel (~52-55%)
- Footer: "Powered by Gallea Ai"

### Left Input Panel (top to bottom order -- UPDATED)
1. "Content Type" label + dropdown select
2. "Import Existing Content" link with **plus (+) icon** (underlined) -- **must be functional, not just visual**
3. **"Creative Brief (Optional)" collapsible section -- ABOVE content input, not below it**
4. "Your Content Idea" label + text area (~120px tall, #F0F0F0 bg)
5. Generate button: "Generate [Content Type Name]" (black, full width)

### Creative Brief Fields (when expanded)
- Project Name (text input, #F0F0F0 bg)
- Background (text area, placeholder: "Briefly describe your organization and why this content matters.")
- Objectives (text area)
- Target Audience (text area)
- Key Messages (text area)
- Tone Notes (text area)
- **FIX: Remove duplicate "Deliverables and Format" field** (appears twice in current build)

### Right Output Panel
- **Empty state:** pen/quill icon + "Your rewritten content will appear here" (#7E7E7E)
- **After generation:** Formatted content card with:
  - Generated text
  - Brand alignment scores with **info icon tooltips** explaining each metric:
    - toneMatch: "How closely the output matches your brand's established tone"
    - vocabularyFit: "How well the word choice aligns with your brand vocabulary"
    - brandConsistency: "Overall coherence with your brand voice profile"
    - emotionalResonance: "How effectively the content evokes your target emotions"
  - Action buttons with **info icon tooltips**:
    - "Copy" -- copies to clipboard
    - "Edit" -- makes content editable inline
    - "Regenerate" -- **opens a text input** where user can describe what needs to change. This feedback is logged and used for continuous output improvement.

### Content Type Dropdowns

**Traditional (9 types):**
Tagline / Slogan, Headline, Subheadline, Body Copy, Brochure, Print Ad, Direct Mail, Radio Script, Sales Sheet / One-Pager

**Digital (13 types):**
Blog Post, Landing Page, Website Page Copy, Case Study, White Paper, Product Description, Press Release, Newsletter, Email Campaign, Sales Outreach Email, Follow-up Email, Google / Search Ad Copy, Video Script

**Social (8 types):**
LinkedIn Post, Twitter / X Post, Instagram Caption, Facebook Post, TikTok Script, Social Ad Copy, Reddit Post, YouTube Script

### Dynamic Placeholder Text
Each content type gets contextually appropriate placeholder text in the content idea field.

### Content Generation Loading State
- **Do not leave the output panel static during generation.**
- Show animated loading with stage messages:
  - "Analyzing your brand voice..."
  - "Crafting your [content type]..."
  - "Scoring brand alignment..."
- Creates perceived speed improvement during API wait time.

---

## Library Page

### Layout
- "Library" in sidebar. Page header: "Content History" -- Elza Medium 36px
- "All AI-generated content is automatically saved with brand alignment scores."
- **[NEEDS ATTENTION]** Confirm "Library" label is used everywhere (sidebar, breadcrumbs, any references). Not "My Content."

### Content Cards (stacked vertically)
- Header row: tag pills (black bg, white text) for content type + generator + tone | score badge "XX/100" in green (#1F9A15)
- Body: italic input label + original prompt preview + generated content preview (truncated)
- Metrics row: toneMatch | vocabularyFit | brandConsistency | emotionalResonance
- Footer: timestamp | "Copy" + "Delete" links

---

## Analytics Page

### Layout
- "Analytics" heading + "Track your content creation metrics."
- 4 metric cards (row): Your Content | Team Content | Writing | Optimizations
  - Each: large number, "pieces this month" subtitle, % change (red/green)
- 3 summary cards (row): Average Brand Alignment (% + progress bar + badge) | Content by Tool | All-Time Stats
- Line chart: "Content Creation Over Time" -- You (solid black) vs Team (dashed gray), last 6 months

---

## Brand Voice Page

### Header Row
- "Brand Voice" title (left)
- "Retake Assessment" link (right) -- routes directly to Module 1 Q1. **[NEEDS ATTENTION]** Confirm both buttons are prominent and visually clear.
- "Upload Brand Documents" link (right)

### Section 1: Emotional Territory Map
- "Your Emotional Territory Map" section title
- Description referencing 96 emotions, 182 personality associations, 38 functional attributes
- Full-width dark background (#111111), large horizontal ellipse
- 8 territories around perimeter
- Dense word cloud inside each territory segment (180+ words total)
- Heat map overlay: green-to-red gradient
- **[NET NEW]** Outer/outlier trait labels (e.g., "independent", "knowledgeable") need bolder, more prominent treatment. Currently hard to read.
- **[NET NEW]** Visual must NOT look like Hotspex brand maps. Differentiate the visual style.
- Three toggle views: "Heat Map" (default active) | "Brand Profile" | "Territory Map"
  - **[NEEDS ATTENTION]** Confirm all three views are designed and implemented, not just Heat Map.
- Legend: "Low Affinity" [gradient bar] "High Affinity"
- **[NET NEW] Mobile responsiveness:** Heat map labels and trait data are too small on mobile. Full responsive layout required.

### Section 2: Results Cards
- **"Your Brand Right Space" card:**
  - Shows label like "Fun + Knowledgeable"
  - **[NET NEW] Add description/tooltip** explaining what Brand Right Space means and how it was derived from the assessment data.

- **"Brand Singularity Score" card:**
  - Shows score number (e.g., 58)
  - **[NET NEW] Add visible description** explaining the scale (0-100), methodology, and what good vs poor looks like. Tooltip or expandable info section.

### Section 3: Brand Strengths, Risks, and Differentiators
- Positive traits and danger zone flags summary
- **[NET NEW] Trait scores need explanation.** Each numeric score should have a tooltip or inline description explaining methodology.
- **[NET NEW] Danger Zones need improved readability.** Increase contrast, increase label size, add brief explanations for what each zone means in practice.
- **[NET NEW] Differentiators need to be actionable.** Tags like "Expertise-Led" and "Fresh Perspective" should include guidance on how to leverage each one in content and positioning.

### Section 4: Additional Charts/Graphs (NET NEW)
- **[NET NEW] Add 3-4 additional visualizations:**
  1. **Voice Dimension Breakdown:** Bar or radar chart showing relative strength across voice dimensions
  2. **Competitive Positioning Radar:** Spider/radar chart showing your brand vs category averages across emotional territories
  3. **Emotional Territory Distribution:** Pie or donut chart showing percentage allocation across the 8 territories
  4. **Brand Consistency Scorecard:** Visual scorecard from Module 5 data showing touchpoint-by-touchpoint alignment

### Section 5: Voice Documents
- Uploaded brand materials that compound with questionnaire voice profile

---

## Settings Page

### Layout
- "Settings" heading
- 6 accordion sections:

1. **Team Members** (expanded by default): user list with Name | Role (Admin/Team) | "Remove" link
2. **Company Logo:** upload/replace company logo
3. **Access Key:** generate/view enterprise access keys
4. **Logo Display:** control where company logo appears
5. **Format Presets:** content formatting preferences
6. **Account:** email, password change, sign out, plan management

---

## FAQ Page

### Layout
- "FAQ" heading + "Common questions about the platform."
- 8 accordion items:

1. "How does this agent work?" -- "It uses AI with Gallea Ai's Brand DNA embedded in every prompt, ensuring output matches your strategic positioning."
2. "What is AEO?" -- (Answer needed)
3. "Can I edit the output?" -- (Answer needed)
4. "How is data handled?" -- (Answer needed)
5. "How does it strengthen the brand voice?" -- (Answer needed)
6. "What ROI can we expect?" -- (Answer needed)
7. "How adaptable is it?" -- (Answer needed)
8. "Future capabilities?" -- (Answer needed)

---

# PART 8: PLATFORM FUNCTIONALITY (Non-Visual)

## Content Generation Pipeline
- Each "Generate" call sends to Claude Sonnet API with brand voice profile, content type context, user prompt, Creative Brief, and imported content
- Response: generated content + brand alignment scores (toneMatch, vocabularyFit, brandConsistency, emotionalResonance)
- **Regeneration with feedback:** When user clicks Regenerate, they input what needs to change. This feedback is sent alongside the original prompt + previous output for improved generation. Feedback is logged for continuous improvement.
- Auto-saves to Library with all metadata
- **Loading state during generation** with animated progress messages

## Brand Voice Algorithm
- 7 modules, ~64 questions
- 4 emotion selections (primary, secondary, tertiary, quaternary) become the user's brand pillars
- Scoring weights: 40% direct emotional (Module 2 Q1-5), 30% semantic differentials (Module 2 Q6-17 sliders), 20% personality traits (Module 3), 10% customer description with AI sentiment (Module 3 Q10)
- Output: 8-territory emotional positioning map, primary/secondary/tertiary/quaternary territory, intensity level (1-10), danger zone flags, Brand Singularity coherence score, Brand Right Space, 4+ charts/visualizations
- Conditional logic: new brands skip performance history questions

## Document Upload
- Available in Module 7 (positioning statement, brand essence/DNA, brand pillars)
- Available on Brand Voice page (Upload Brand Documents)
- Accepts PDF, DOCX, TXT
- Uploaded documents compound with questionnaire-derived voice profile

## Enterprise Access Flow
- Admin generates access keys in Settings
- Team members enter access key on Join Team screen
- Team members inherit locked brand voice, skip questionnaire
- Team members: Brand Voice page read-only, Retake Assessment hidden, document upload disabled
- Admin retains full access

## Scoring and Metrics
- Brand alignment composite score (0-100)
- Sub-scores with tooltips: toneMatch, vocabularyFit, brandConsistency, emotionalResonance
- Analytics tracks: content volume, content by tool, all-time stats, creation trend

---

# PART 9: IMPLEMENTATION NOTES FOR CLAUDE CODE

## Tech Stack
- React/Vite, GitHub-connected
- Express backend, SQLite database
- Claude Sonnet API for content generation
- Deployed at testbed.joeyai.app

## Routing
- / --> Landing
- /login --> Sign In
- /signup --> Create Account flow
- /reset-password --> Reset Password
- /join --> Join Team
- /assessment-intro --> Assessment Intro
- /assessment --> Questionnaire (Modules 1-7)
- /processing --> Processing screen
- /create --> Create page (default after login)
- /library --> Library / Content History
- /analytics --> Analytics
- /brand-voice --> Brand Voice results
- /settings --> Settings
- /faq --> FAQ

## Key State
- Auth state (logged in / out / onboarding)
- Brand voice profile (exists / not started / in progress)
- User role (admin / team member)
- Brand age selection from Module 1 (triggers conditional skip logic)
- Active questionnaire module and question index
- Current Create tab and selected content type
- Creative Brief collapsed/expanded state and field values
- Regeneration feedback history per content piece

## Known Issues to Fix
- Sidebar bleeding past right border
- Brand mapping processing screen being skipped after questionnaire
- "Retake Assessment" routing to broken screen instead of Module 1 Q1
- Responsive design for iPad/iPhone not functioning
- Import Existing Content button non-functional in deployed version
- Duplicate "Deliverables and Format" in Creative Brief
- Duplicate Q5 in Module 6
- Misplaced question header at bottom of Module 6

## Mobile Responsiveness Audit
Full responsive audit needed across all pages. Specifically flagged:
- Brand Voice results page (heat map labels too small, trait data unreadable)
- Questionnaire modules (slider interactions on touch devices)
- Overall layout on iPad and iPhone

## Design Quality Bar
General feedback: the design has not yet hit the desired quality bar. Should feel polished, warm, and premium consulting-grade. Applies to typography weight, spacing, card treatments, and visual hierarchy across every page. This is a cross-cutting concern that affects every screen.

## Priority Build Order
1. Auth flow (all screens including 3-tier pricing)
2. Questionnaire (7 modules, sliders, conditional logic, file uploads, interstitials, processing screen)
3. Create page (3 tabs, 30 content types, Creative Brief above input, output panel with tooltips, regeneration feedback, loading states)
4. Brand Voice results page (heat map with visual differentiation from Hotspex, toggle views, results cards with explanations, 4 additional charts, danger zone improvements, mobile responsive)
5. Library (content cards, scoring, filter, copy/delete)
6. Analytics (metric cards, charts, data aggregation)
7. Settings (6 accordion sections with full functionality)
8. FAQ (8 items with answers)
9. Enterprise access flow (key generation, join flow, role-based restrictions)
10. Mobile responsiveness audit (all pages)
