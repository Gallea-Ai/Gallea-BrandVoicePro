// All 7 assessment modules — updated to match complete spec (March 2026)

export interface AssessmentOption {
  label: string;
  value: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: "single" | "multi" | "scale" | "spectrum" | "spectrumGroup" | "textarea" | "pillars" | "fileUpload";
  required: boolean;
  options?: AssessmentOption[];
  scaleLabels?: { left: string; right: string };
  scalePoints?: number;
  maxSelections?: number;
  placeholder?: string;
  maxLength?: number;
  helperText?: string;
  selectionInstruction?: string; // Shown ABOVE options in prominent text
  hasAllOfAbove?: boolean;
  // For spectrumGroup: all sliders on one page
  spectrums?: { id: string; left: string; right: string; points: number }[];
  // Conditional display
  showIf?: { questionId: string; value: string; moduleIndex: number };
  // Conditional skip (hide entire question if condition met)
  hideIf?: { questionId: string; value: string; moduleIndex: number };
  // Category labels for grouped options
  categoryLabels?: { label: string; startIndex: number; endIndex: number }[];
  // File upload config
  acceptTypes?: string;
  uploadLabel?: string;
}

export interface AssessmentModule {
  index: number;
  title: string;
  subtitle: string;
  questions: AssessmentQuestion[];
}

const opt = (label: string): AssessmentOption => ({ label, value: label.toLowerCase().replace(/[\s\/]+/g, "_") });

const EMOTION_OPTIONS = ["Trust and security","Achievement and success","Excitement and energy","Freedom and independence","Connection and belonging","Intelligence and wisdom","Pleasure and enjoyment","Care and nurturing"].map(opt);

export const ASSESSMENT_MODULES: AssessmentModule[] = [
  // ═══ MODULE 1: Brand Fundamentals (8 questions, all radio) ═══
  {
    index: 0,
    title: "Brand Fundamentals",
    subtitle: "Establish baseline brand identity and category context",
    questions: [
      {
        id: "bf_1", text: "What industry or category does your brand operate in?", type: "single", required: true,
        options: ["Technology","Financial Services","Healthcare","Retail / E-Commerce","Food & Beverage","Automotive","Real Estate","Education","Professional Services","Media & Entertainment","Travel & Hospitality","Manufacturing","Nonprofit","Other"].map(opt)
      },
      {
        id: "bf_2", text: "How old is your brand?", type: "single", required: true,
        options: ["New brand (0–2 years)","Emerging brand (3–5 years)","Established brand (6–15 years)","Legacy brand (15+ years)"].map(opt)
      },
      {
        id: "bf_3", text: "What is your brand's market position?", type: "single", required: true,
        options: ["Market leader","Strong challenger","Growing competitor","Niche player","New entrant"].map(opt)
      },
      {
        id: "bf_4", text: "Who is your primary customer base?", type: "single", required: true,
        options: ["Business to Consumer","Business to Business","Business to Business to Consumer","Direct to Consumer"].map(opt)
      },
      {
        id: "bf_5", text: "Where does your brand sit on the price spectrum?", type: "single", required: true,
        options: ["Premium / Luxury","Above average","Mid-market","Value-oriented","Budget / Discount"].map(opt)
      },
      {
        id: "bf_6", text: "What is your brand's geographic reach?", type: "single", required: true,
        options: ["Local / Regional","National","International","Global"].map(opt)
      },
      {
        id: "bf_7", text: "What is your current brand awareness level in your target market?", type: "single", required: true,
        options: ["High awareness (70%+)","Moderate awareness (40–70%)","Low awareness (10–40%)","Minimal awareness (<10%)"].map(opt)
      },
      {
        id: "bf_8", text: "What is your primary business objective right now?", type: "single", required: true,
        options: ["Growth / Acquisition","Retention / Loyalty","Repositioning","New market entry","Turnaround / Revival"].map(opt)
      },
    ]
  },

  // ═══ MODULE 2: Emotional Territory (18 questions — 4 emotion ranks, 1 strength, 12 bipolar sliders, 1 motivation) ═══
  {
    index: 1,
    title: "Emotional Territory",
    subtitle: "Map your brand's emotional positioning across 8 territories",
    questions: [
      // Q1-Q4: Four ranked emotion picks (become brand pillars)
      {
        id: "et_1", text: "Select your PRIMARY emotion — the ONE emotion customers feel most strongly about your brand.", type: "single", required: true,
        helperText: "This is the first of four ranked selections that will become your brand pillars.",
        options: EMOTION_OPTIONS
      },
      {
        id: "et_2", text: "Select your SECONDARY emotion — the second most important emotion your brand evokes.", type: "single", required: true,
        helperText: "Second of four ranked selections.",
        options: EMOTION_OPTIONS
      },
      {
        id: "et_3", text: "Select your TERTIARY emotion — the third most important emotion your brand evokes.", type: "single", required: true,
        helperText: "Third of four ranked selections.",
        options: EMOTION_OPTIONS
      },
      {
        id: "et_4", text: "Select your QUATERNARY emotion — the fourth emotion that rounds out your brand's emotional profile.", type: "single", required: true,
        helperText: "Fourth and final ranked selection. These four emotions become your brand pillars.",
        options: EMOTION_OPTIONS
      },
      // Q5: Emotional strength slider
      {
        id: "et_5", text: "How STRONGLY do customers feel these emotions toward your brand?", type: "scale", required: true,
        scaleLabels: { left: "Weak / no association", right: "Extremely strong" }, scalePoints: 10,
        helperText: "1 = Weak/no association, 10 = Extremely strong emotional connection. This refers to the emotions you selected above."
      },
      // Q6-Q17: All 12 bipolar spectrums consolidated on one scrollable page
      {
        id: "et_bipolar", text: "Position your brand on each spectrum by dragging the slider.", type: "spectrumGroup", required: true,
        spectrums: [
          { id: "et_6", left: "Reliable / Secure", right: "Unpredictable / Risky", points: 7 },
          { id: "et_7", left: "Ambitious / Achieving", right: "Modest / Humble", points: 7 },
          { id: "et_8", left: "Bold / Exciting", right: "Calm / Subdued", points: 7 },
          { id: "et_9", left: "Independent / Free", right: "Traditional / Conforming", points: 7 },
          { id: "et_10", left: "Warm / Connected", right: "Distant / Detached", points: 7 },
          { id: "et_11", left: "Intelligent / Expert", right: "Simple / Basic", points: 7 },
          { id: "et_12", left: "Indulgent / Pleasurable", right: "Practical / Functional", points: 7 },
          { id: "et_13", left: "Caring / Nurturing", right: "Tough / Demanding", points: 7 },
          { id: "et_14", left: "Playful / Humorous", right: "Serious / Composed", points: 7 },
          { id: "et_15", left: "Nostalgic / Heritage-driven", right: "Future-forward / Progressive", points: 7 },
          { id: "et_16", left: "Luxurious / Premium", right: "Accessible / Everyday", points: 7 },
          { id: "et_17", left: "Rebellious / Disruptive", right: "Established / Institutional", points: 7 },
        ]
      },
      // Q18: Motivation
      {
        id: "et_18", text: "What motivates customers to choose your brand over competitors?", type: "multi", required: true,
        hasAllOfAbove: true,
        options: ["They trust us to deliver consistently","We help them achieve their goals","We make them feel excited/energized","We give them freedom and flexibility","They feel part of a community","We provide expert knowledge","We deliver enjoyment and reward","We take care of their needs"].map(opt)
      },
    ]
  },

  // ═══ MODULE 3: Brand Personality (10 questions) ═══
  {
    index: 2,
    title: "Brand Personality",
    subtitle: "Identify traits and danger zone risks",
    questions: [
      {
        id: "bp_1", text: "Which POSITIVE traits describe your brand?", type: "multi", required: true,
        maxSelections: 10,
        selectionInstruction: "Select up to 10",
        categoryLabels: [
          { label: "Security positive zone", startIndex: 0, endIndex: 2 },
          { label: "Achievement positive zone", startIndex: 3, endIndex: 5 },
          { label: "Excitement positive zone", startIndex: 6, endIndex: 8 },
          { label: "Freedom positive zone", startIndex: 9, endIndex: 11 },
          { label: "Connection positive zone", startIndex: 12, endIndex: 14 },
          { label: "Wisdom positive zone", startIndex: 15, endIndex: 17 },
          { label: "Pleasure positive zone", startIndex: 18, endIndex: 20 },
          { label: "Care positive zone", startIndex: 21, endIndex: 23 },
        ],
        options: [
          // Security
          "Reliable","Dependable","Trustworthy",
          // Achievement
          "Accomplished","Successful","Confident",
          // Excitement
          "Bold","Dynamic","Adventurous",
          // Freedom
          "Independent","Liberating","Free-spirited",
          // Connection
          "Friendly","Inclusive","Warm",
          // Wisdom
          "Intelligent","Expert","Insightful",
          // Pleasure
          "Rewarding","Enjoyable","Luxurious",
          // Care
          "Caring","Supportive","Protective",
        ].map(opt)
      },
      {
        id: "bp_2", text: "Do any of these NEGATIVE traits describe your brand? (Security danger zone)", type: "multi", required: false,
        options: ["Cautious","Rigid","Boring","Stagnant","Predictable","None of these"].map(opt)
      },
      {
        id: "bp_3", text: "Do any of these NEGATIVE traits describe your brand? (Achievement danger zone)", type: "multi", required: false,
        options: ["Aggressive","Arrogant","Elitist","Intimidating","Ruthless","None of these"].map(opt)
      },
      {
        id: "bp_4", text: "Do any of these NEGATIVE traits describe your brand? (Excitement danger zone)", type: "multi", required: false,
        options: ["Reckless","Chaotic","Overwhelming","Exhausting","Superficial","None of these"].map(opt)
      },
      {
        id: "bp_5", text: "Do any of these NEGATIVE traits describe your brand? (Freedom danger zone)", type: "multi", required: false,
        options: ["Detached","Unreliable","Uncommitted","Irresponsible","Scattered","None of these"].map(opt)
      },
      {
        id: "bp_6", text: "Do any of these NEGATIVE traits describe your brand? (Connection danger zone)", type: "multi", required: false,
        options: ["Clingy","Needy","Intrusive","Suffocating","Overbearing","None of these"].map(opt)
      },
      {
        id: "bp_7", text: "Do any of these NEGATIVE traits describe your brand? (Wisdom danger zone)", type: "multi", required: false,
        options: ["Condescending","Know-it-all","Complicated","Inaccessible","Pretentious","None of these"].map(opt)
      },
      {
        id: "bp_8", text: "Do any of these NEGATIVE traits describe your brand? (Pleasure danger zone)", type: "multi", required: false,
        options: ["Excessive","Frivolous","Superficial","Self-indulgent","Hedonistic","None of these"].map(opt)
      },
      {
        id: "bp_9", text: "Do any of these NEGATIVE traits describe your brand? (Care danger zone)", type: "multi", required: false,
        options: ["Overprotective","Patronizing","Smothering","Controlling","Martyr-like","None of these"].map(opt)
      },
      {
        id: "bp_10", text: "How do your most loyal customers describe your brand to others?", type: "textarea", required: true,
        placeholder: "Type your answer..", maxLength: 250
      },
    ]
  },

  // ═══ MODULE 4: Competitive Positioning (7 questions) ═══
  {
    index: 3,
    title: "Competitive Positioning",
    subtitle: "Understand competitive emotional territory and differentiation",
    questions: [
      {
        id: "cp_1", text: "How many direct competitors operate in your space?", type: "single", required: true,
        options: ["Few (2–5)","Moderate (6–15)","Many (16–50)","Highly fragmented (50+)"].map(opt)
      },
      {
        id: "cp_2", text: "What emotions do your COMPETITORS primarily evoke?", type: "multi", required: true, maxSelections: 3,
        selectionInstruction: "Select up to 3",
        options: ["Security / Trust","Freedom / Independence","Leisure / Indulgence","Achievement / Success","Connection / Belonging","Care / Nurturing","Excitement / Energy","Wisdom / Intelligence"].map(opt)
      },
      {
        id: "cp_3", text: "What are the baseline expectations customers have for any brand in your category?", type: "multi", required: true,
        hasAllOfAbove: true,
        options: ["Reliability / Quality","Innovation","Social responsibility","Good value","Heritage / Experience","Performance","Convenience","Expertise","Design / Aesthetics","Customer service"].map(opt)
      },
      {
        id: "cp_4", text: "How differentiated is your brand from competitors?", type: "single", required: true,
        options: ["Highly distinctive (unique positioning)","Moderately differentiated","Somewhat similar (minor differences)","Largely undifferentiated (commodity-like)"].map(opt)
      },
      {
        id: "cp_5", text: "What MOST differentiates you from competitors?", type: "multi", required: true,
        hasAllOfAbove: true,
        options: ["Product / service features","Price / value","Community / connection","Customer experience","Convenience / accessibility","Innovation","Brand personality / emotion","Expertise / knowledge","Heritage / tradition"].map(opt)
      },
      {
        id: "cp_6", text: "Are there emotional territories in your category that NO major competitor owns?", type: "single", required: true,
        options: ["Yes, clear gaps exist","Possibly, but uncertain","No, category is saturated","Don't know"].map(opt)
      },
      {
        id: "cp_7", text: "If you could 'own' ONE emotional territory in your customers' minds, which would create the most business value?", type: "single", required: true,
        options: ["Security / Trust","Achievement / Success","Excitement / Energy","Freedom / Independence","Connection / Belonging","Wisdom / Intelligence","Leisure / Indulgence","Care / Nurturing"].map(opt)
      },
    ]
  },

  // ═══ MODULE 5: Brand Coherence (8 questions) ═══
  {
    index: 4,
    title: "Brand Coherence",
    subtitle: "Assess Brand Singularity — is your message unified or fragmented?",
    questions: [
      {
        id: "bc_1", text: "How does your brand connect with its customers? Select all channels your brand actively uses.", type: "multi", required: true,
        hasAllOfAbove: true,
        options: ["Website","Social Media","Email Marketing","Content Marketing / Blog","Direct Mail","Paid Advertising","PR and Media Relations","SMS / Text","Events and Conferences","Podcasts / Video Content","Partnerships and Sponsorships","Sales Team / Direct Outreach","In-Store / Physical Locations","Advertising (TV / Radio / Print)","Mobile App","Packaging","Customer Service","Product / Service Delivery","Public Speaking / Thought Leadership","Community / Forums"].map(opt)
      },
      {
        id: "bc_2", text: "Website emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_3", text: "Social media emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_4", text: "Advertising emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_5", text: "Physical experience emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_6", text: "Customer service emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_7", text: "Product / packaging emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_8", text: "Overall, when customers experience your brand across different touchpoints, does it feel like a unified, coherent experience?", type: "single", required: true,
        options: ["Yes, very consistent (strong red thread)","Mostly consistent (minor gaps)","Inconsistent (fragmented experience)","Very inconsistent (feels like different brands)"].map(opt)
      },
    ]
  },

  // ═══ MODULE 6: Performance Indicators (6 questions + 1 challenges multi) ═══
  {
    index: 5,
    title: "Performance Indicators",
    subtitle: "Understand brand health and improvement opportunities",
    questions: [
      {
        id: "pi_1", text: "What percentage of your target market recognizes your brand?", type: "single", required: true,
        options: ["0–10%","11–25%","26–50%","51–75%","76–100%"].map(opt)
      },
      {
        id: "pi_2", text: "Among those aware of your brand, what percentage would consider purchasing?", type: "single", required: true,
        options: ["0–20%","21–40%","41–60%","61–80%","81–100%"].map(opt)
      },
      {
        id: "pi_3", text: "What is your customer retention / repeat purchase rate?", type: "single", required: true,
        options: ["Very high (80%+ retention)","High (60–79%)","Moderate (40–59%)","Low (20–39%)","Very low (<20%)"].map(opt)
      },
      {
        id: "pi_4", text: "What percentage of customers actively recommend your brand to others?", type: "single", required: true,
        options: ["Very high (50%+ are promoters)","High (30–49%)","Moderate (15–29%)","Low (<15%)"].map(opt)
      },
      {
        id: "pi_5", text: "Can you charge a price premium compared to category average?", type: "single", required: true,
        options: ["Significant premium (20%+ above avg)","Moderate premium (10–20%)","Slight premium (5–10%)","At parity (category avg)","Below average (discount)"].map(opt)
      },
      // Q6: Conditional — hidden for new brands (0-2 years)
      {
        id: "pi_6", text: "How has your brand performed over the past 2 years?", type: "single", required: true,
        hideIf: { questionId: "bf_2", value: "new_brand_(0–2_years)", moduleIndex: 0 },
        options: ["Strong growth (20%+ annual)","Moderate growth (10–20%)","Slight growth (5–10%)","Flat / Stagnant (0–5%)","Declining (negative growth)"].map(opt)
      },
      // Q7: FIXED header — was wrongly labeled "SECOND most important emotion"
      {
        id: "pi_7", text: "What are your brand's biggest challenges right now?", type: "multi", required: true,
        hasAllOfAbove: true,
        options: ["Low awareness / discoverability","Weak differentiation","Inconsistent brand experience","Poor conversion rates","Low customer retention","Price pressure / commoditization","Outdated positioning","Fragmented brand identity","Competitive pressure","Category disruption"].map(opt)
      },
    ]
  },

  // ═══ MODULE 7: Brand Strategy & Foundations (6 questions with conditionals + file uploads) ═══
  {
    index: 6,
    title: "Brand Strategy & Foundations",
    subtitle: "Capture your existing brand strategy assets and organizational context",
    questions: [
      {
        id: "bs_1", text: "How many employees does your organization have?", type: "single", required: true,
        options: ["1–5","6–15","26–100","101–500","501–2,000","2,000+"].map(opt)
      },
      {
        id: "bs_2", text: "Do you have an existing brand positioning statement?", type: "single", required: true,
        options: ["Yes","No"].map(opt)
      },
      // Q3: Conditional — only show if Q2=Yes. Textarea + file upload
      {
        id: "bs_3", text: "Paste or type your current brand positioning statement here.", type: "textarea", required: false,
        placeholder: "Type your answer..",
        showIf: { questionId: "bs_2", value: "yes", moduleIndex: 6 },
      },
      {
        id: "bs_3_file", text: "Or upload your positioning statement document.", type: "fileUpload", required: false,
        showIf: { questionId: "bs_2", value: "yes", moduleIndex: 6 },
        acceptTypes: ".pdf,.docx,.txt",
        uploadLabel: "Upload positioning statement (PDF, DOCX, TXT)"
      },
      {
        id: "bs_4", text: "Do you have an existing brand essence or brand DNA document?", type: "single", required: true,
        options: ["Yes","No"].map(opt)
      },
      // File upload if Q4=Yes
      {
        id: "bs_4_file", text: "Upload your brand essence or brand DNA document.", type: "fileUpload", required: false,
        showIf: { questionId: "bs_4", value: "yes", moduleIndex: 6 },
        acceptTypes: ".pdf,.docx,.txt",
        uploadLabel: "Upload brand essence document (PDF, DOCX, TXT)"
      },
      {
        id: "bs_5", text: "Do you know what your brand pillars are?", type: "single", required: true,
        options: ["Yes","No"].map(opt)
      },
      // Q6: Conditional — 4 separate pillar inputs, only if Q5=Yes
      {
        id: "bs_6", text: "List your brand pillars below (one per field).", type: "pillars", required: false,
        showIf: { questionId: "bs_5", value: "yes", moduleIndex: 6 },
      },
      // File upload alternative for pillars
      {
        id: "bs_6_file", text: "Or upload a document with your brand pillars.", type: "fileUpload", required: false,
        showIf: { questionId: "bs_5", value: "yes", moduleIndex: 6 },
        acceptTypes: ".pdf,.docx,.txt",
        uploadLabel: "Upload brand pillars document (PDF, DOCX, TXT)"
      },
    ]
  },
];
