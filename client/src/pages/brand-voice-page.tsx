import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, Upload, Info, ChevronDown, FileText } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend,
} from "recharts";

interface BrandVoicePageProps {
  brandProfile: any | null;
  onRetakeAssessment: () => void;
  onLoadDemo?: () => void;
  demoLoading?: boolean;
  userRole?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const TERRITORY_KEYS = [
  "trust_security", "achievement_success", "excitement_energy", "freedom_independence",
  "connection_belonging", "intelligence_wisdom", "pleasure_enjoyment", "care_nurturing",
];
const TERRITORY_NAMES = [
  "Trust & Security", "Achievement", "Excitement", "Freedom",
  "Connection", "Wisdom", "Pleasure", "Care",
];
const TERRITORY_LABELS_OUTER = [
  "TRUSTWORTHY", "ACHIEVING", "EXCITING", "INDEPENDENT",
  "CONNECTED", "KNOWLEDGEABLE", "ENTERTAINING", "CARING",
];
const TERRITORY_COLORS = [
  "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6",
  "#10B981", "#6366F1", "#F97316", "#EC4899",
];

const DANGER_ZONE_EXPLANATIONS: Record<string, string> = {
  "Generic": "Your brand risks being perceived as undifferentiated and forgettable in your category.",
  "Passive": "Content may come across as lacking energy or conviction, failing to inspire action.",
  "Inconsistent": "Mixed messaging across touchpoints creates confusion about what your brand stands for.",
  "Vague": "Unclear positioning makes it hard for customers to understand your unique value.",
  "Rigid": "Your brand risks being perceived as inflexible and unable to adapt to changing needs.",
  "Boring": "Content fails to capture attention or create emotional engagement with your audience.",
  "Predictable": "Communications feel formulaic and fail to surprise or delight your audience.",
  "Aggressive": "Tone may alienate audiences by being too pushy or confrontational.",
  "Arrogant": "Messaging comes across as superior rather than confident, damaging trust.",
  "Elitist": "Brand feels exclusionary rather than aspirational, limiting market appeal.",
  "Reckless": "Content feels chaotic and uncontrolled, undermining credibility.",
  "Superficial": "Messaging lacks depth, making your brand seem insubstantial.",
  "Detached": "Brand feels emotionally distant, making it hard for customers to connect.",
  "Clingy": "Overcommunication or excessive familiarity can feel intrusive to audiences.",
  "Condescending": "Messaging talks down to audiences rather than educating them.",
  "Excessive": "Content overindulges in style over substance, diluting your message.",
  "Overprotective": "Brand comes across as paternalistic, limiting customer autonomy.",
};

const DIFFERENTIATOR_GUIDANCE: Record<string, string> = {
  "Innovative": "Lead with forward-thinking language. Position new features as category firsts. Use 'pioneering' and 'breakthrough' in headlines.",
  "Authentic": "Use real stories and transparent language. Avoid corporate jargon. Let imperfections show — they build trust.",
  "Strategic": "Emphasize methodology and frameworks in content. Show the 'why' behind decisions. Use data to support claims.",
  "Bold": "Take clear stances on industry topics. Use confident, declarative sentences. Don't hedge or use passive voice.",
  "Expertise-Led": "Publish deep-dive content. Cite specific metrics. Position team members as thought leaders in their domains.",
  "Fresh Perspective": "Challenge conventional wisdom in your category. Use unexpected angles. Break format conventions.",
  "Customer-Centric": "Lead every piece of content with the customer's problem. Use 'you' more than 'we'. Share customer success stories.",
  "Heritage": "Reference your history and track record. Use legacy as proof of reliability. Connect past wins to future vision.",
  "Premium": "Use elevated vocabulary. Emphasize craftsmanship and attention to detail. Less volume, more impact per piece.",
  "Community-Driven": "Feature user-generated content. Create participatory campaigns. Use inclusive language like 'together' and 'our'.",
};

// 180+ emotion words distributed across 8 territory segments
function generateWordCloud(territories: Record<string, number> | null): { text: string; x: number; y: number; affinity: number; size: number }[] {
  const WORDS_BY_TERRITORY: string[][] = [
    // Trust & Security (top-right quadrant)
    ["Reliable", "Dependable", "Stable", "Consistent", "Secure", "Honest", "Transparent", "Credible", "Accountable", "Steadfast", "Assured", "Proven", "Trusted", "Grounded", "Authentic", "Principled", "Ethical", "Faithful", "Safe", "Solid", "Certain", "Unwavering"],
    // Achievement (right)
    ["Ambitious", "Driven", "Successful", "Accomplished", "Determined", "Focused", "Results-driven", "Precise", "Disciplined", "Competitive", "Elite", "Masterful", "Exceptional", "Winning", "Peak", "Strategic", "Decisive", "Goal-oriented", "Performance", "Superior", "Victorious", "Excellent"],
    // Excitement (bottom-right)
    ["Bold", "Dynamic", "Energetic", "Vibrant", "Thrilling", "Daring", "Electric", "Passionate", "Adventurous", "Fearless", "Exhilarating", "Intense", "Magnetic", "Spirited", "Fiery", "Lively", "Captivating", "Provocative", "Stimulating", "Audacious", "Courageous", "Blazing"],
    // Freedom (bottom-left)
    ["Independent", "Liberating", "Free-spirited", "Unconventional", "Maverick", "Pioneering", "Boundary-breaking", "Rebellious", "Original", "Autonomous", "Trailblazing", "Unbound", "Visionary", "Disruptive", "Progressive", "Experimental", "Radical", "Innovative", "Nonconformist", "Untamed", "Limitless", "Open"],
    // Connection (left)
    ["Warm", "Friendly", "Inclusive", "Welcoming", "Empathetic", "Belonging", "United", "Compassionate", "Collaborative", "Nurturing", "Social", "Together", "Harmonious", "Inviting", "Familiar", "Personal", "Communal", "Bonding", "Relatable", "Heartfelt", "Engaging", "Supportive"],
    // Wisdom (top-left)
    ["Intelligent", "Knowledgeable", "Insightful", "Expert", "Thoughtful", "Wise", "Analytical", "Learned", "Cerebral", "Enlightened", "Perceptive", "Astute", "Discerning", "Profound", "Sharp", "Informed", "Sophisticated", "Intellectual", "Curious", "Mindful", "Articulate", "Meticulous"],
    // Pleasure (top)
    ["Enjoyable", "Delightful", "Luxurious", "Indulgent", "Sensorial", "Premium", "Rewarding", "Pleasurable", "Elegant", "Beautiful", "Exquisite", "Refined", "Sumptuous", "Rich", "Opulent", "Lavish", "Gorgeous", "Tasteful", "Charming", "Enchanting", "Blissful", "Heavenly"],
    // Care (center-left)
    ["Caring", "Protective", "Nurturing", "Gentle", "Kind", "Considerate", "Attentive", "Devoted", "Tender", "Mindful", "Responsive", "Patient", "Generous", "Selfless", "Comforting", "Healing", "Wholesome", "Reassuring", "Thoughtful", "Dedicated", "Loving", "Benevolent"],
  ];

  const words: { text: string; x: number; y: number; affinity: number; size: number }[] = [];
  const cx = 0.5, cy = 0.5;

  // 8 territories positioned in octants around center
  const angles = TERRITORY_KEYS.map((_, i) => (i / 8) * Math.PI * 2 - Math.PI / 2);

  WORDS_BY_TERRITORY.forEach((territoryWords, ti) => {
    const baseAngle = angles[ti];
    const score = territories ? (territories[TERRITORY_KEYS[ti]] || 50) / 100 : 0.5;

    // Use top 12 words per territory, grid-positioned to avoid overlap
    const useWords = territoryWords.slice(0, 12);
    useWords.forEach((word, wi) => {
      // Grid-based: spread words in a structured arc around the territory angle
      const row = Math.floor(wi / 4);
      const col = wi % 4;
      const angleOffset = (col - 1.5) * 0.12;
      const distOffset = 0.15 + row * 0.1;
      const spreadAngle = baseAngle + angleOffset;
      const x = cx + Math.cos(spreadAngle) * distOffset;
      const y = cy + Math.sin(spreadAngle) * distOffset;

      const baseAffinity = 0.3 + (1 - wi / useWords.length) * 0.5;
      const affinity = Math.min(1, baseAffinity * (0.5 + score));
      const size = 12 + Math.round(affinity * 4);

      if (x > 0.06 && x < 0.94 && y > 0.06 && y < 0.94) {
        words.push({ text: word, x, y, affinity, size });
      }
    });
  });

  return words;
}

// ─── Heat Map Canvas (Gallea's distinct style: rounded rectangle, concentric rings) ───

function HeatMapCanvas({ territories, words }: {
  territories: Record<string, number> | null;
  words: { text: string; x: number; y: number; affinity: number; size: number }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height, cx = w / 2, cy = h / 2;

    // Dark background — Gallea style (deeper, richer)
    ctx.fillStyle = "#0c0c14";
    ctx.fillRect(0, 0, w, h);

    // Concentric rings (Gallea's distinct design — not ellipse like Hotspex)
    const maxR = Math.min(w, h) * 0.42;
    for (let ring = 4; ring >= 1; ring--) {
      const r = maxR * (ring / 4);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.03 + ring * 0.015})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // 8 radial divider lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Heat blobs per territory
    if (territories) {
      TERRITORY_KEYS.forEach((key, i) => {
        const score = (territories[key] || 50) / 100;
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const dist = maxR * 0.45;
        const bx = cx + Math.cos(angle) * dist;
        const by = cy + Math.sin(angle) * dist;
        const blobR = 30 + score * 50;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
        const alpha = 0.15 + score * 0.45;
        grad.addColorStop(0, `rgba(255, 137, 0, ${alpha})`);
        grad.addColorStop(0.5, `rgba(255, 80, 40, ${alpha * 0.4})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });
    }

    // Outer boundary circle
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Territory labels — BOLD, PROMINENT
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    TERRITORY_LABELS_OUTER.forEach((label, i) => {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const lx = cx + Math.cos(angle) * (maxR + 24);
      const ly = cy + Math.sin(angle) * (maxR + 24);
      ctx.font = "700 13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText(label, lx, ly);
    });

    // Draw word cloud (clipped to circle)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, maxR - 6, 0, Math.PI * 2);
    ctx.clip();

    words.forEach((word) => {
      const wx = word.x * w;
      const wy = word.y * h;
      const weight = word.affinity > 0.7 ? "600" : "400";
      ctx.font = `${weight} ${word.size}px 'Inter', sans-serif`;
      const alpha = 0.25 + word.affinity * 0.7;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(word.text, wx, wy);
    });
    ctx.restore();
  }, [territories, words]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: "460px" }} />;
}

// ─── Brand Profile View (Radar Chart) ───────────────────────────────────────────

function BrandProfileView({ territories }: { territories: Record<string, number> | null }) {
  const data = TERRITORY_KEYS.map((key, i) => ({
    territory: TERRITORY_NAMES[i],
    score: territories ? (territories[key] || 0) : 50,
    fullMark: 100,
  }));

  return (
    <div className="bg-[#0c0c14] rounded-lg p-6" style={{ height: "460px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="territory" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Your Brand" dataKey="score" stroke="#FF8900" fill="#FF8900" fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Territory Map View (colored segments with scores) ──────────────────────────

function TerritoryMapView({ territories }: { territories: Record<string, number> | null }) {
  return (
    <div className="bg-[#0c0c14] rounded-lg p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ minHeight: "460px" }}>
      {TERRITORY_KEYS.map((key, i) => {
        const score = territories ? (territories[key] || 0) : 50;
        return (
          <div key={key} className="flex flex-col items-center justify-center rounded-lg p-4"
            style={{ backgroundColor: `${TERRITORY_COLORS[i]}15`, border: `1px solid ${TERRITORY_COLORS[i]}30` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: `${TERRITORY_COLORS[i]}20`, border: `2px solid ${TERRITORY_COLORS[i]}60` }}>
              <span className="text-white text-lg font-semibold">{score}</span>
            </div>
            <p className="text-white/80 text-[12px] font-medium text-center">{TERRITORY_NAMES[i]}</p>
            <div className="w-full h-1 rounded-full mt-2" style={{ backgroundColor: `${TERRITORY_COLORS[i]}20` }}>
              <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: TERRITORY_COLORS[i] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Expandable Differentiator ──────────────────────────────────────────────────

function DifferentiatorTag({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const guidance = DIFFERENTIATOR_GUIDANCE[name] || `Leverage "${name}" by emphasizing this quality consistently across all brand touchpoints and content.`;
  return (
    <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-[14px] font-medium text-black hover:bg-[#F0F0F0] transition-colors">
        {name}
        <ChevronDown className={`w-3.5 h-3.5 text-[#585858] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-[12px] font-light text-[#585858] leading-relaxed">{guidance}</p>
        </div>
      )}
    </div>
  );
}

// ─── Danger Zone Badge ──────────────────────────────────────────────────────────

function DangerZoneBadge({ name }: { name: string }) {
  const explanation = DANGER_ZONE_EXPLANATIONS[name] || `Your brand should actively avoid being perceived as "${name.toLowerCase()}" in its communications.`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FF0000]/8 border border-[#FF0000]/20 cursor-help">
          <span className="text-[14px] font-medium text-[#FF0000]">{name}</span>
          <Info className="w-3 h-3 text-[#FF0000]/60" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[300px] text-[12px]">{explanation}</TooltipContent>
    </Tooltip>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function BrandVoicePage({ brandProfile, onRetakeAssessment, onLoadDemo, demoLoading, userRole }: BrandVoicePageProps) {
  const [mapView, setMapView] = useState<"heatmap" | "profile" | "territory">("heatmap");
  const [chartsOpen, setChartsOpen] = useState(false);
  const isAdmin = userRole === "admin";

  // Parse profile data
  const territories: Record<string, number> | null = useMemo(() => {
    if (!brandProfile?.emotionalTerritories) return null;
    try { return JSON.parse(brandProfile.emotionalTerritories); } catch { return null; }
  }, [brandProfile]);

  const differentiators: string[] = useMemo(() => {
    if (!brandProfile?.differentiators) return ["Innovative", "Authentic", "Strategic", "Bold"];
    try { return JSON.parse(brandProfile.differentiators); } catch { return []; }
  }, [brandProfile]);

  const dangerZones: string[] = useMemo(() => {
    if (!brandProfile?.dangerZones) return ["Generic", "Passive", "Inconsistent", "Vague"];
    try { return JSON.parse(brandProfile.dangerZones); } catch { return []; }
  }, [brandProfile]);

  const positiveTraits: string[] = useMemo(() => {
    if (!brandProfile?.positiveTraits) return [];
    try { return JSON.parse(brandProfile.positiveTraits); } catch { return []; }
  }, [brandProfile]);

  const brandRightSpace = brandProfile?.brandRightSpace ?? "Fun + Knowledgeable";
  const singularityScore = brandProfile?.singularityScore ?? 87;

  const wordCloud = useMemo(() => generateWordCloud(territories), [territories]);

  // Chart data
  const territoryRadarData = TERRITORY_KEYS.map((key, i) => ({
    territory: TERRITORY_NAMES[i],
    brand: territories ? (territories[key] || 0) : 50,
    category: 40 + Math.round(Math.random() * 20), // Category average placeholder
  }));

  const territoryPieData = TERRITORY_KEYS.map((key, i) => ({
    name: TERRITORY_NAMES[i],
    value: territories ? (territories[key] || 0) : 50,
    color: TERRITORY_COLORS[i],
  }));

  const voiceDimensionData = [
    { dimension: "Formality", score: 65 },
    { dimension: "Emotional Intensity", score: 72 },
    { dimension: "Boldness", score: 80 },
    { dimension: "Warmth", score: 58 },
    { dimension: "Innovation", score: 75 },
    { dimension: "Accessibility", score: 68 },
    { dimension: "Authority", score: 71 },
  ];
  // Try to derive from mandatories/voiceRulesData if available
  if (brandProfile?.voiceRulesData) {
    const vr = brandProfile.voiceRulesData;
    if (vr.formality) voiceDimensionData[0].score = parseInt(vr.formality) * 10;
    if (vr.emotionalIntensity) voiceDimensionData[1].score = parseInt(vr.emotionalIntensity) * 10;
  }

  const consistencyData = [
    { touchpoint: "Website", rating: "Strongly aligned", score: 90 },
    { touchpoint: "Social Media", rating: "Mostly aligned", score: 75 },
    { touchpoint: "Advertising", rating: "Somewhat aligned", score: 55 },
    { touchpoint: "Physical Exp.", rating: "Mostly aligned", score: 70 },
    { touchpoint: "Customer Svc.", rating: "Strongly aligned", score: 85 },
    { touchpoint: "Product/Pkg.", rating: "Mostly aligned", score: 78 },
  ];

  if (!brandProfile) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <p className="text-[14px] text-[#585858] mb-4">Complete the brand assessment to unlock your Brand Voice dashboard.</p>
        <div className="flex gap-3">
          <Button onClick={onRetakeAssessment} className="bg-black text-white">Start Assessment</Button>
          {onLoadDemo && (
            <Button variant="outline" onClick={onLoadDemo} disabled={demoLoading} className="border-[#E5E5E5] text-[14px] font-normal">
              {demoLoading ? "Loading..." : "Load Demo Data"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12" data-testid="brand-voice-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[36px] font-medium text-black">Brand Voice</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRetakeAssessment} className="border-[#E5E5E5] text-[14px] font-normal">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retake Assessment
            </Button>
            <Button variant="outline" size="sm" className="border-[#E5E5E5] text-[14px] font-normal">
              <Upload className="w-3.5 h-3.5 mr-1.5" />Upload Brand Documents
            </Button>
          </div>
        )}
      </div>

      {/* ═══ Section 1: Emotional Territory Map ═══ */}
      <div className="mb-10">
        <h2 className="text-[20px] font-medium text-black mb-1">Your Emotional Territory Map</h2>
        <p className="text-[14px] font-light text-[#585858] mb-4">
          Mapping 8 territories, 96 emotions, 182 personality associations, and 38 functional attributes to define your brand's emotional landscape.
        </p>

        <div className="bg-[#0c0c14] rounded-lg overflow-hidden border border-white/5">
          {mapView === "heatmap" && <HeatMapCanvas territories={territories} words={wordCloud} />}
          {mapView === "profile" && <BrandProfileView territories={territories} />}
          {mapView === "territory" && <TerritoryMapView territories={territories} />}

          {/* Tabs + Legend */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <div className="flex gap-1">
              {([
                { key: "heatmap" as const, label: "Heat Map" },
                { key: "profile" as const, label: "Brand Profile" },
                { key: "territory" as const, label: "Territory Map" },
              ]).map(({ key, label }) => (
                <button key={key} onClick={() => setMapView(key)}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                    mapView === key ? "bg-white text-black" : "text-white/50 hover:text-white"
                  }`}>{label}</button>
              ))}
            </div>
            {mapView === "heatmap" && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40">Low Affinity</span>
                <div className="w-24 h-2 rounded-full" style={{ background: "linear-gradient(to right, rgba(140,130,100,0.3), rgba(255,140,50,0.7), rgba(255,80,40,0.95))" }} />
                <span className="text-[10px] text-white/40">High Affinity</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Section 2: Brand Right Space + Singularity Score ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Card className="border-[#E5E5E5]">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[12px] text-[#585858] font-medium">Your Brand Right Space</p>
              <Tooltip>
                <TooltipTrigger><Info className="w-3 h-3 text-[#9B9B9B]" /></TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] text-[12px]">
                  Your Brand Right Space is the unique intersection of emotional territories where your brand has the strongest positioning. It's derived from your top-scoring emotional territories and personality trait analysis, representing the sweet spot where your brand feels most authentic and differentiated.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[24px] font-medium text-black">{brandRightSpace}</p>
            <p className="text-[14px] font-light text-[#585858] mt-3 leading-relaxed">
              The unique emotional intersection where your brand is most authentically positioned, derived from your assessment across 96 emotions and 182 personality associations.
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#E5E5E5]">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[12px] text-[#585858] font-medium">Brand Singularity Score</p>
              <Tooltip>
                <TooltipTrigger><Info className="w-3 h-3 text-[#9B9B9B]" /></TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] text-[12px]">
                  Measured on a 0-100 scale. Calculated from your emotional differentiation, trait uniqueness, competitive positioning, and cross-touchpoint consistency. 80+ = Excellent, 60-79 = Good, 40-59 = Developing, below 40 = Needs work.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[36px] font-medium text-black">{singularityScore}</p>
              <span className={`px-2 py-0.5 rounded text-[12px] font-medium ${
                singularityScore >= 80 ? "bg-[#1F9A15]/10 text-[#1F9A15]" :
                singularityScore >= 60 ? "bg-[#FF8900]/10 text-[#FF8900]" :
                "bg-[#FF0000]/10 text-[#FF0000]"
              }`}>
                {singularityScore >= 80 ? "Excellent" : singularityScore >= 60 ? "Good" : singularityScore >= 40 ? "Developing" : "Needs Work"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E5E5E5] mt-2">
              <div className="h-full rounded-full bg-black transition-all" style={{ width: `${singularityScore}%` }} />
            </div>
            <p className="text-[14px] font-light text-[#585858] mt-3 leading-relaxed">
              How distinctly your brand occupies its emotional territory versus competitors. Derived from emotional differentiation (40%), trait uniqueness (30%), and cross-touchpoint consistency (30%).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Section 3: Brand Strengths, Risks, Differentiators ═══ */}
      <div className="mb-10">
        <h2 className="text-[20px] font-medium text-black mb-4">Brand Strengths, Risks & Differentiators</h2>

        {/* Positive Traits */}
        {positiveTraits.length > 0 && (
          <div className="mb-6">
            <p className="text-[14px] font-medium text-black mb-2">Core Positive Traits</p>
            <div className="flex flex-wrap gap-2">
              {positiveTraits.map((t: string) => (
                <Tooltip key={t}>
                  <TooltipTrigger asChild>
                    <span className="px-3 py-1.5 rounded-md bg-[#1F9A15]/8 border border-[#1F9A15]/20 text-[13px] font-medium text-[#1F9A15] cursor-help">
                      {t}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-[12px] max-w-[260px]">
                    This trait scored highly in your brand personality assessment. Lean into "{t.toLowerCase()}" as a defining characteristic in all communications.
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Differentiators — expandable */}
        <div className="mb-6">
          <p className="text-[14px] font-medium text-black mb-2">Differentiators</p>
          <p className="text-[12px] text-[#585858] mb-3">Click each differentiator for actionable guidance on how to leverage it in your content and positioning.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {differentiators.map((d: string) => <DifferentiatorTag key={d} name={d} />)}
          </div>
        </div>

        {/* Danger Zones — enhanced */}
        <div>
          <p className="text-[16px] font-medium text-black mb-2">Danger Zones</p>
          <p className="text-[12px] text-[#585858] mb-3">Traits and tones your brand should actively avoid. Hover for specific guidance.</p>
          <div className="flex flex-wrap gap-2">
            {dangerZones.map((d: string) => <DangerZoneBadge key={d} name={d} />)}
          </div>
        </div>
      </div>

      {/* ═══ Section 4: Brand Intelligence (collapsible) ═══ */}
      <div className="mb-10">
        <button
          onClick={() => setChartsOpen(!chartsOpen)}
          className="text-[20px] font-medium text-black mb-4 flex items-center gap-2 hover:underline"
        >
          Brand Intelligence
          <ChevronDown className={`w-5 h-5 transition-transform ${chartsOpen ? "rotate-180" : ""}`} />
        </button>

        {chartsOpen && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 4a. Voice Dimension Breakdown */}
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-5">
              <p className="text-[14px] font-medium text-black mb-1">Voice Dimension Breakdown</p>
              <p className="text-[12px] text-[#585858] mb-3">Relative strength across key voice dimensions</p>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={voiceDimensionData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="dimension" type="category" tick={{ fontSize: 11 }} width={100} />
                    <RechartsTooltip />
                    <Bar dataKey="score" fill="#000000" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4b. Competitive Positioning Radar */}
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-5">
              <p className="text-[14px] font-medium text-black mb-1">Competitive Positioning</p>
              <p className="text-[12px] text-[#585858] mb-3">Your brand vs category averages across emotional territories</p>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={territoryRadarData}>
                    <PolarGrid stroke="#E5E5E5" />
                    <PolarAngleAxis dataKey="territory" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Your Brand" dataKey="brand" stroke="#000000" fill="#000000" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Category Avg" dataKey="category" stroke="#B7B7B7" fill="#B7B7B7" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4c. Emotional Territory Distribution */}
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-5">
              <p className="text-[14px] font-medium text-black mb-1">Emotional Territory Distribution</p>
              <p className="text-[12px] text-[#585858] mb-3">Percentage allocation across the 8 territories</p>
              <div style={{ height: 250 }} className="flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={territoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={50} outerRadius={90} paddingAngle={2} strokeWidth={0}>
                      {territoryPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number, name: string) => [`${value}`, name]} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4d. Brand Consistency Scorecard */}
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-5">
              <p className="text-[14px] font-medium text-black mb-1">Brand Consistency Scorecard</p>
              <p className="text-[12px] text-[#585858] mb-3">Touchpoint-by-touchpoint alignment from Module 5</p>
              <div className="space-y-3">
                {consistencyData.map((item) => (
                  <div key={item.touchpoint}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] text-black">{item.touchpoint}</span>
                      <span className={`text-[12px] font-medium ${
                        item.score >= 80 ? "text-[#1F9A15]" : item.score >= 60 ? "text-[#FF8900]" : "text-[#FF0000]"
                      }`}>{item.rating}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E5E5E5]">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${item.score}%`,
                        backgroundColor: item.score >= 80 ? "#1F9A15" : item.score >= 60 ? "#FF8900" : "#FF0000",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>}
      </div>

      {/* ═══ Section 5: Voice Documents ═══ */}
      <div>
        <h2 className="text-[20px] font-medium text-black mb-4">Voice Documents</h2>
        <Card className="border-[#E5E5E5]">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <FileText className="w-10 h-10 text-[#B7B7B7] mb-3" />
            <p className="text-[14px] font-light text-[#585858] mb-1">No brand documents uploaded yet</p>
            <p className="text-[12px] text-[#9B9B9B] mb-4">Uploaded materials compound with your questionnaire voice profile for richer, more accurate content generation.</p>
            <Button variant="outline" size="sm" className="border-[#E5E5E5] text-[14px] font-normal">
              <Upload className="w-3.5 h-3.5 mr-1.5" />Upload Brand Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
