// All 7 assessment modules with complete question sets from the GalleaBrandVoicePro UX spec

export interface AssessmentOption {
  label: string;
  value: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: "single" | "multi" | "scale" | "spectrum" | "textarea";
  required: boolean;
  options?: AssessmentOption[];
  scaleLabels?: { left: string; right: string };
  scalePoints?: number;
  maxSelections?: number;
  placeholder?: string;
  maxLength?: number;
}

export interface AssessmentModule {
  index: number;
  title: string;
  subtitle: string;
  questions: AssessmentQuestion[];
}

const opt = (label: string): AssessmentOption => ({ label, value: label.toLowerCase().replace(/[\s\/]+/g, "_") });

export const ASSESSMENT_MODULES: AssessmentModule[] = [
  // MODULE 1: Brand Fundamentals
  {
    index: 0,
    title: "Brand Fundamentals",
    subtitle: "Establish baseline brand identity and category context",
    questions: [
      {
        id: "bf_1", text: "1. What industry or category does your brand operate in?", type: "single", required: true,
        options: ["Technology","Financial Services","Healthcare","Retail / E-Commerce","Food & Beverage","Automotive","Real Estate","Education","Professional Services","Media & Entertainment","Travel & Hospitality","Manufacturing","Nonprofit","Other"].map(opt)
      },
      {
        id: "bf_2", text: "2. How old is your brand?", type: "single", required: true,
        options: ["New brand (0–2 years)","Emerging brand (3–5 years)","Established brand (6–15 years)","Legacy brand (15+ years)"].map(opt)
      },
      {
        id: "bf_3", text: "3. What is your brand's market position?", type: "single", required: true,
        options: ["Market leader","Strong challenger","Growing competitor","Niche player","New entrant"].map(opt)
      },
      {
        id: "bf_4", text: "4. Who is your primary customer base?", type: "single", required: true,
        options: ["Business to Consumer","Business to Business","Business to Business to Consumer","Direct to Consumer"].map(opt)
      },
      {
        id: "bf_5", text: "5. Where does your brand sit on the price spectrum?", type: "single", required: true,
        options: ["Premium / Luxury","Above average","Mid-market","Value-oriented","Budget / Discount"].map(opt)
      },
      {
        id: "bf_6", text: "6. What is your brand's geographic reach?", type: "single", required: true,
        options: ["Local / Regional","National","International","Global"].map(opt)
      },
      {
        id: "bf_7", text: "7. What is your current brand awareness level in your target market?", type: "single", required: true,
        options: ["High awareness (70%+)","Moderate awareness (40–70%)","Low awareness (10–40%)","Minimal awareness (<10%)"].map(opt)
      },
      {
        id: "bf_8", text: "8. What is your primary business objective right now?", type: "single", required: true,
        options: ["Growth / Acquisition","Retention / Loyalty","Repositioning","New market entry","Turnaround / Revival"].map(opt)
      },
    ]
  },

  // MODULE 2: Emotional Territory
  {
    index: 1,
    title: "Emotional Territory",
    subtitle: "Map your brand's emotional positioning across 8 territories",
    questions: [
      {
        id: "et_1", text: "1. When customers think about your brand, which ONE emotion do they feel most strongly?", type: "single", required: true,
        options: ["Trust and security","Achievement and success","Excitement and energy","Freedom and independence","Connection and belonging","Intelligence and wisdom","Pleasure and enjoyment","Care and nurturing"].map(opt)
      },
      {
        id: "et_2", text: "2. What is the SECOND most important emotion your brand evokes?", type: "single", required: true,
        options: ["Trust and security","Achievement and success","Excitement and energy","Freedom and independence","Connection and belonging","Intelligence and wisdom","Pleasure and enjoyment","Care and nurturing"].map(opt)
      },
      {
        id: "et_3", text: "3. How STRONGLY do customers feel these emotions toward your brand?", type: "scale", required: true,
        scaleLabels: { left: "Weak association", right: "Extremely strong" }, scalePoints: 10
      },
      {
        id: "et_4", text: "4. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Masculine / Serious", right: "Compassionate / Warm" }, scalePoints: 10
      },
      {
        id: "et_5", text: "5. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Ambitious / Achieving", right: "Modest / Gentle" }, scalePoints: 10
      },
      {
        id: "et_6", text: "6. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Bold / Exciting", right: "Calm / Subdued" }, scalePoints: 10
      },
      {
        id: "et_7", text: "7. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Independent / Free", right: "Traditional / Conforming" }, scalePoints: 10
      },
      {
        id: "et_8", text: "8. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Warm / Connected", right: "Distant / Selective" }, scalePoints: 10
      },
      {
        id: "et_9", text: "9. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Intelligent / Expert", right: "Simple / Mass" }, scalePoints: 10
      },
      {
        id: "et_10", text: "10. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Indulgent / Pleasurable", right: "Practical / Functional" }, scalePoints: 10
      },
      {
        id: "et_11", text: "11. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Caring / Nurturing", right: "Tough / Demanding" }, scalePoints: 10
      },
      {
        id: "et_12", text: "12. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Playful / Humorous", right: "Serious / Composed" }, scalePoints: 10
      },
      {
        id: "et_13", text: "13. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Nostalgic / Heritage-driven", right: "Future-forward / Progressive" }, scalePoints: 10
      },
      {
        id: "et_14", text: "14. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Luxurious / Premium", right: "Accessible / Everyday" }, scalePoints: 10
      },
      {
        id: "et_15", text: "15. Rate where your brand falls on this spectrum.", type: "spectrum", required: true,
        scaleLabels: { left: "Rebellious / Disruptive", right: "Dependable / Institutional" }, scalePoints: 10
      },
      {
        id: "et_16", text: "16. What motivates customers to choose your brand over competitors?", type: "multi", required: true,
        options: ["They trust us to deliver consistently","We help them achieve their goals","We make them feel excited/energized","We give them freedom and flexibility","They feel part of a community","We provide expert knowledge","We deliver enjoyment and reward","We take care of their needs"].map(opt)
      },
      {
        id: "et_17", text: "17. Choose 5 colours that best represent your brand's emotions.", type: "multi", required: true, maxSelections: 5,
        options: [
          "Deep Navy Blue — Trust, authority, depth",
          "Bright Red — Passion, energy, urgency",
          "Forest Green — Growth, stability, nature",
          "Gold / Amber — Premium, wisdom, achievement",
          "Pure White — Clarity, simplicity, purity",
          "Charcoal Black — Sophistication, power, elegance",
          "Sky Blue — Openness, calm, reliability",
          "Warm Orange — Creativity, enthusiasm, warmth",
          "Royal Purple — Luxury, imagination, spirituality",
          "Soft Pink — Compassion, nurturing, approachability",
          "Emerald Green — Prosperity, renewal, balance",
          "Silver Grey — Modernity, neutrality, precision",
          "Coral / Salmon — Friendly, vibrant, youthful",
          "Teal — Sophistication, clarity, confidence",
          "Burgundy / Maroon — Heritage, richness, maturity",
          "Bright Yellow — Optimism, energy, happiness",
          "Earth Brown — Reliability, warmth, grounded",
          "Lavender — Calm, grace, creativity",
          "Copper / Bronze — Strength, heritage, craftsmanship",
          "Ivory / Cream — Elegance, warmth, understated luxury"
        ].map(opt)
      },
      {
        id: "et_18", text: "18. If your brand were an animal, which would it be?", type: "single", required: true,
        options: [
          "Lion — Commanding, confident, leader of the pack",
          "Eagle — Visionary, precise, sees the big picture",
          "Dolphin — Intelligent, playful, social and approachable",
          "Wolf — Loyal, strategic, strong in a pack",
          "Owl — Wise, thoughtful, trusted advisor",
          "Panther — Sleek, powerful, quietly dominant",
          "Horse — Dependable, free-spirited, hardworking",
          "Fox — Clever, adaptable, quick-thinking",
          "Bear — Strong, protective, grounded",
          "Cheetah — Fast, agile, results-driven",
          "Swan — Elegant, graceful, refined",
          "Elephant — Wise, enduring, never forgets",
          "Hummingbird — Energetic, joyful, always moving",
          "Hawk — Focused, sharp, action-oriented",
          "Butterfly — Transformative, creative, beautiful"
        ].map(opt)
      },
    ]
  },

  // MODULE 3: Brand Personality
  {
    index: 2,
    title: "Brand Personality",
    subtitle: "Identify traits and danger zone risks",
    questions: [
      {
        id: "bp_1", text: "1. Which POSITIVE traits describe your brand?", type: "multi", required: true,
        options: ["Reliable","Accomplished","Independent","Intelligent","Rewarding","Trustworthy","Bold","Liberating","Expert","Caring","Dependable","Adventurous","Friendly","Insightful","Supportive","Confident","Dynamic","Warm","Enjoyable","Protective","Successful","Free-spirited","Inclusive","Luxurious"].map(opt)
      },
      {
        id: "bp_2", text: "2. Do any of these NEGATIVE traits describe your brand? (Security danger zone)", type: "multi", required: false,
        options: ["Cautious","Rigid","Boring","Stagnant","Predictable","None of these"].map(opt)
      },
      {
        id: "bp_3", text: "3. Do any of these NEGATIVE traits describe your brand? (Achievement danger zone)", type: "multi", required: false,
        options: ["Aggressive","Arrogant","Elitist","Intimidating","Ruthless","None of these"].map(opt)
      },
      {
        id: "bp_4", text: "4. Do any of these NEGATIVE traits describe your brand? (Excitement danger zone)", type: "multi", required: false,
        options: ["Reckless","Chaotic","Overwhelming","Exhausting","Superficial","None of these"].map(opt)
      },
      {
        id: "bp_5", text: "5. Do any of these NEGATIVE traits describe your brand? (Freedom danger zone)", type: "multi", required: false,
        options: ["Detached","Unreliable","Uncommitted","Irresponsible","Scattered","None of these"].map(opt)
      },
      {
        id: "bp_6", text: "6. Do any of these NEGATIVE traits describe your brand? (Connection danger zone)", type: "multi", required: false,
        options: ["Clingy","Needy","Intrusive","Suffocating","Overbearing","None of these"].map(opt)
      },
      {
        id: "bp_7", text: "7. Do any of these NEGATIVE traits describe your brand? (Wisdom danger zone)", type: "multi", required: false,
        options: ["Condescending","Know-it-all","Complicated","Inaccessible","Pretentious","None of these"].map(opt)
      },
      {
        id: "bp_8", text: "8. Do any of these NEGATIVE traits describe your brand? (Pleasure danger zone)", type: "multi", required: false,
        options: ["Excessive","Frivolous","Superficial","Self-indulgent","Hedonistic","None of these"].map(opt)
      },
      {
        id: "bp_9", text: "9. Do any of these NEGATIVE traits describe your brand? (Care danger zone)", type: "multi", required: false,
        options: ["Overprotective","Patronizing","Smothering","Controlling","Martyr-like","None of these"].map(opt)
      },
      {
        id: "bp_10", text: "10. How do your most loyal customers describe your brand to others?", type: "textarea", required: true,
        placeholder: "Type your answer..", maxLength: 250
      },
    ]
  },

  // MODULE 4: Competitive Positioning
  {
    index: 3,
    title: "Competitive Positioning",
    subtitle: "Understand competitive emotional territory and differentiation",
    questions: [
      {
        id: "cp_1", text: "1. How many direct competitors operate in your space?", type: "single", required: true,
        options: ["Few (2–5)","Moderate (6–15)","Many (16–50)","Highly fragmented (50+)"].map(opt)
      },
      {
        id: "cp_2", text: "2. What emotions do your COMPETITORS primarily evoke? (Select up to 3)", type: "multi", required: true, maxSelections: 3,
        options: ["Security / Trust","Freedom / Independence","Leisure / Indulgence","Achievement / Success","Connection / Belonging","Care / Nurturing","Excitement / Energy","Wisdom / Intelligence"].map(opt)
      },
      {
        id: "cp_3", text: "3. What are the baseline expectations customers have for any brand in your category?", type: "multi", required: true,
        options: ["Reliability / Quality","Innovation","Social responsibility","Good value","Heritage / Experience","Performance","Convenience","Expertise","Design / Aesthetics","Customer service"].map(opt)
      },
      {
        id: "cp_4", text: "4. How differentiated is your brand from competitors?", type: "single", required: true,
        options: ["Highly distinctive (unique positioning)","Moderately differentiated","Somewhat similar (minor differences)","Largely undifferentiated (commodity-like)"].map(opt)
      },
      {
        id: "cp_5", text: "5. What MOST differentiates you from competitors?", type: "multi", required: true,
        options: ["Product / service features","Price / value","Community / connection","Customer experience","Convenience / accessibility","Innovation","Brand personality / emotion","Expertise / knowledge","Heritage / tradition"].map(opt)
      },
      {
        id: "cp_6", text: "6. Are there emotional territories in your category that NO major competitor owns?", type: "single", required: true,
        options: ["Yes, clear gaps exist","Possibly, but uncertain","No, category is saturated","Don't know"].map(opt)
      },
      {
        id: "cp_7", text: "7. If you could 'own' ONE emotional territory in your customers' minds, which would create the most business value?", type: "single", required: true,
        options: ["Security / Trust","Achievement / Success","Excitement / Energy","Freedom / Independence","Connection / Belonging","Wisdom / Intelligence","Leisure / Indulgence","Care / Nurturing"].map(opt)
      },
    ]
  },

  // MODULE 5: Brand Coherence
  {
    index: 4,
    title: "Brand Coherence",
    subtitle: "Assess Brand Singularity™, is your message unified or fragmented?",
    questions: [
      {
        id: "bc_1", text: "1. How does your brand connect with its customers? Select all channels your brand actively uses to communicate.", type: "multi", required: true,
        options: ["Website","Thought Leadership","Leisure / Indulgence","Social Media","Direct Mail","Care / Nurturing","Email Marketing","Content Marketing / Blog","Community / Forums","Paid Advertising","PR and Media Relations","SMS / Text","Events and Conferences","Podcasts / Video Content","Partnerships and Sponsorships","Sales Team / Direct Outreach","In-Store / Physical Locations","Advertising (TV / Radio / Print)","Mobile App","Packaging","Customer Service","Product / Service Delivery","Public Speaking / Thought Leadership"].map(opt)
      },
      {
        id: "bc_2", text: "2. Website emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_3", text: "3. Social media emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_4", text: "4. Advertising emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_5", text: "5. Physical experience emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_6", text: "6. Customer service emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_7", text: "7. Product / packaging emotional consistency:", type: "single", required: true,
        options: ["Strongly aligned","Mostly aligned","Somewhat aligned","Poorly aligned","Don't know"].map(opt)
      },
      {
        id: "bc_8", text: "8. Overall, when customers experience your brand across different touchpoints, does it feel like a unified, coherent experience?", type: "single", required: true,
        options: ["Yes, very consistent (strong red thread)","Mostly consistent (minor gaps)","Inconsistent (fragmented experience)","Very inconsistent (feels like different brands)"].map(opt)
      },
    ]
  },

  // MODULE 6: Performance Indicators
  {
    index: 5,
    title: "Performance Indicators",
    subtitle: "Understand brand health and improvement opportunities",
    questions: [
      {
        id: "pi_1", text: "1. What percentage of your target market recognizes your brand?", type: "single", required: true,
        options: ["0–10%","11–25%","26–50%","51–75%","76–100%"].map(opt)
      },
      {
        id: "pi_2", text: "2. Among those aware of your brand, what percentage would consider purchasing?", type: "single", required: true,
        options: ["0–20%","21–40%","41–60%","61–80%","81–100%"].map(opt)
      },
      {
        id: "pi_3", text: "3. What is your customer retention / repeat purchase rate?", type: "single", required: true,
        options: ["Very high (80%+ retention)","High (60–79%)","Moderate (40–59%)","Low (20–39%)","Very low (<20%)"].map(opt)
      },
      {
        id: "pi_4", text: "4. What percentage of customers actively recommend your brand to others?", type: "single", required: true,
        options: ["Very high (50%+ are promoters)","High (30–49%)","Moderate (15–29%)","Low (<15%)"].map(opt)
      },
      {
        id: "pi_5", text: "5. Can you charge a price premium compared to category average?", type: "single", required: true,
        options: ["Significant premium (20%+ above avg)","Moderate premium (10–20%)","Slight premium (5–10%)","At parity (category avg)","Below average (discount)"].map(opt)
      },
      {
        id: "pi_6", text: "6. How has your brand performed over the past 2 years?", type: "single", required: true,
        options: ["Strong growth (20%+ annual)","Moderate growth (10–20%)","Slight growth (5–10%)","Flat / Stagnant (0–5%)","Declining (negative growth)"].map(opt)
      },
      {
        id: "pi_7", text: "7. What is the SECOND most important emotion your brand evokes?", type: "single", required: true,
        options: ["Low awareness / discoverability","Weak differentiation","Inconsistent brand experience","Poor conversion rates","Low customer retention","Price pressure / commoditization","Outdated positioning","Fragmented brand identity","Competitive pressure","Category disruption"].map(opt)
      },
    ]
  },

  // MODULE 7: Brand Strategy & Foundations
  {
    index: 6,
    title: "Brand Strategy & Foundations",
    subtitle: "Capture your existing brand strategy assets and organizational context",
    questions: [
      {
        id: "bs_1", text: "1. How many employees does your organization have?", type: "single", required: true,
        options: ["1–5","6–15","26–100","101–500","501–2,000","2,000+"].map(opt)
      },
      {
        id: "bs_2", text: "2. Do you have an existing brand positioning statement?", type: "single", required: true,
        options: ["Yes","No"].map(opt)
      },
      {
        id: "bs_3", text: "3. Paste or type your current brand positioning statement here.", type: "textarea", required: false,
        placeholder: "Type your answer.."
      },
      {
        id: "bs_4", text: "4. Do you have an existing brand essence or brand DNA document?", type: "single", required: true,
        options: ["Yes","No"].map(opt)
      },
      {
        id: "bs_5", text: "5. Do you know what your brand pillars are?", type: "single", required: true,
        options: ["Yes","No"].map(opt)
      },
      {
        id: "bs_6", text: "6. List your brand pillars here.", type: "textarea", required: false,
        placeholder: "Type your answer.."
      },
    ]
  },
];
