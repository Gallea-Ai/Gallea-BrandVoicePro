import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Upload } from "lucide-react";
import { EMOTIONAL_TERRITORIES } from "@shared/schema";

interface BrandVoicePageProps {
  brandProfile: any | null;
  onRetakeAssessment: () => void;
}

// Territory labels positioned around the ellipse
const TERRITORY_LABELS = [
  "KNOWLEDGEABLE",
  "ENTERTAINING",
  "INDEPENDENT",
  "CARING",
  "FRIENDLY",
  "EXCITING",
  "TRUSTWORTHY",
  "ACHIEVING",
];

// Emotion words with positions and affinities
const EMOTION_WORDS = [
  { text: "Bold", x: 0.35, y: 0.3, affinity: 0.9, size: 16 },
  { text: "Innovative", x: 0.55, y: 0.25, affinity: 0.85, size: 15 },
  { text: "Authentic", x: 0.6, y: 0.45, affinity: 0.95, size: 17 },
  { text: "Reliable", x: 0.75, y: 0.35, affinity: 0.7, size: 13 },
  { text: "Playful", x: 0.25, y: 0.55, affinity: 0.4, size: 11 },
  { text: "Warm", x: 0.45, y: 0.65, affinity: 0.6, size: 12 },
  { text: "Sharp", x: 0.65, y: 0.55, affinity: 0.8, size: 14 },
  { text: "Visionary", x: 0.4, y: 0.4, affinity: 0.92, size: 16 },
  { text: "Empathetic", x: 0.3, y: 0.7, affinity: 0.5, size: 12 },
  { text: "Confident", x: 0.5, y: 0.5, affinity: 0.88, size: 15 },
  { text: "Dynamic", x: 0.7, y: 0.65, affinity: 0.75, size: 13 },
  { text: "Precise", x: 0.8, y: 0.5, affinity: 0.65, size: 12 },
  { text: "Inspiring", x: 0.5, y: 0.35, affinity: 0.9, size: 16 },
  { text: "Disruptive", x: 0.35, y: 0.45, affinity: 0.7, size: 13 },
  { text: "Humble", x: 0.55, y: 0.72, affinity: 0.35, size: 10 },
  { text: "Witty", x: 0.22, y: 0.42, affinity: 0.55, size: 11 },
  { text: "Courageous", x: 0.48, y: 0.28, affinity: 0.82, size: 14 },
  { text: "Strategic", x: 0.62, y: 0.38, affinity: 0.87, size: 15 },
  { text: "Passionate", x: 0.42, y: 0.58, affinity: 0.78, size: 14 },
  { text: "Thoughtful", x: 0.68, y: 0.72, affinity: 0.45, size: 11 },
  { text: "Expert", x: 0.52, y: 0.42, affinity: 0.93, size: 16 },
  { text: "Approachable", x: 0.38, y: 0.68, affinity: 0.58, size: 12 },
  { text: "Energetic", x: 0.28, y: 0.35, affinity: 0.68, size: 13 },
  { text: "Resilient", x: 0.72, y: 0.42, affinity: 0.72, size: 13 },
];

function getHeatColor(affinity: number): string {
  if (affinity > 0.85) return "rgba(255, 80, 40, 0.85)";
  if (affinity > 0.7) return "rgba(255, 140, 50, 0.7)";
  if (affinity > 0.55) return "rgba(255, 190, 60, 0.55)";
  if (affinity > 0.4) return "rgba(200, 160, 80, 0.35)";
  return "rgba(140, 130, 100, 0.2)";
}

function getTextColor(affinity: number): string {
  if (affinity > 0.8) return "rgba(255, 255, 255, 0.95)";
  if (affinity > 0.6) return "rgba(255, 255, 255, 0.8)";
  if (affinity > 0.4) return "rgba(255, 255, 255, 0.6)";
  return "rgba(255, 255, 255, 0.35)";
}

type MapView = "heatmap" | "profile" | "territory";

export default function BrandVoicePage({
  brandProfile,
  onRetakeAssessment,
}: BrandVoicePageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapView, setMapView] = useState<MapView>("heatmap");

  // Parse profile data
  const differentiators: string[] = brandProfile
    ? (() => {
        try {
          return JSON.parse(brandProfile.differentiators);
        } catch {
          return [];
        }
      })()
    : ["Innovative", "Authentic", "Strategic", "Bold"];

  const dangerZones: string[] = brandProfile
    ? (() => {
        try {
          return JSON.parse(brandProfile.dangerZones);
        } catch {
          return [];
        }
      })()
    : ["Generic", "Passive", "Inconsistent", "Vague"];

  const brandRightSpace = brandProfile?.brandRightSpace ?? "Fun + Knowledgeable";
  const singularityScore = brandProfile?.singularityScore ?? 87;

  // Derive emotion words from profile if available
  const words = useCallback(() => {
    if (brandProfile?.emotionalTerritories) {
      try {
        const territories = JSON.parse(brandProfile.emotionalTerritories);
        // Adjust affinities based on territory scores
        return EMOTION_WORDS.map((w) => ({
          ...w,
          affinity: Math.min(
            1,
            w.affinity * (0.8 + (territories[0]?.score || 0.5) * 0.4)
          ),
        }));
      } catch {
        return EMOTION_WORDS;
      }
    }
    return EMOTION_WORDS;
  }, [brandProfile]);

  // Draw the canvas
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

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const rx = w * 0.44;
    const ry = h * 0.42;

    // Dark background
    ctx.fillStyle = "#1a1a1e";
    ctx.fillRect(0, 0, w, h);

    // Ellipse background
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#121215";
    ctx.fill();
    ctx.restore();

    // Heat map gradient overlay
    const currentWords = words();
    if (mapView === "heatmap") {
      currentWords.forEach((word) => {
        const wx = word.x * w;
        const wy = word.y * h;

        // Check if point is inside ellipse
        const dx = (wx - cx) / rx;
        const dy = (wy - cy) / ry;
        if (dx * dx + dy * dy > 1) return;

        const gradient = ctx.createRadialGradient(
          wx,
          wy,
          0,
          wx,
          wy,
          40 + word.affinity * 40
        );
        gradient.addColorStop(0, getHeatColor(word.affinity));
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });
    }

    // Ellipse border
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Territory labels around the ellipse
    const labels = TERRITORY_LABELS;
    const labelPositions = [
      { x: cx, y: cy - ry - 14 }, // top: KNOWLEDGEABLE
      { x: cx - rx * 0.7, y: cy - ry * 0.65 }, // top-left: ENTERTAINING
      { x: cx - rx - 8, y: cy }, // left: INDEPENDENT
      { x: cx - rx * 0.7, y: cy + ry * 0.65 }, // bottom-left: CARING
      { x: cx, y: cy + ry + 18 }, // bottom: FRIENDLY
      { x: cx + rx * 0.7, y: cy + ry * 0.65 }, // bottom-right: EXCITING
      { x: cx + rx + 8, y: cy }, // right: TRUSTWORTHY
      { x: cx + rx * 0.7, y: cy - ry * 0.65 }, // top-right: ACHIEVING
    ];

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    labels.forEach((label, i) => {
      const pos = labelPositions[i];
      ctx.font = "600 9px 'Satoshi', 'Inter', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.letterSpacing = "2px";
      ctx.fillText(label, pos.x, pos.y);
    });

    // Draw words
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 4, ry - 4, 0, 0, Math.PI * 2);
    ctx.clip();

    currentWords.forEach((word) => {
      const wx = word.x * w;
      const wy = word.y * h;

      ctx.font = `${word.affinity > 0.8 ? "600" : "400"} ${word.size}px 'Satoshi', 'Inter', sans-serif`;
      ctx.fillStyle = getTextColor(word.affinity);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(word.text, wx, wy);
    });
    ctx.restore();
  }, [mapView, words]);

  if (!brandProfile) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center py-20"
        data-testid="brand-voice-empty"
      >
        <p className="text-muted-foreground text-sm mb-4">
          Complete the brand assessment to unlock your Brand Voice dashboard.
        </p>
        <Button onClick={onRetakeAssessment} data-testid="button-start-assessment">
          Start Assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="brand-voice-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" data-testid="text-page-title">
          Brand Voice
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetakeAssessment}
            data-testid="button-retake-assessment"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retake Assessment
          </Button>
          <Button variant="outline" size="sm" data-testid="button-upload-docs">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload Brand Documents
          </Button>
        </div>
      </div>

      {/* Section 1: Emotional Territory Map */}
      <div className="mb-8">
        <h2 className="text-base font-medium mb-1">
          Your Emotional Territory Map
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Mapping 8 territories, 96 emotions, 182 personality associations, and
          38 functional attributes to define your brand's emotional landscape.
        </p>

        {/* Canvas Map */}
        <div
          className="bg-[#1a1a1e] rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]"
          data-testid="territory-map-container"
        >
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{ height: "420px" }}
            data-testid="canvas-territory-map"
          />

          {/* Map view tabs + Legend */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex gap-1" data-testid="map-view-tabs">
              {(
                [
                  { key: "heatmap" as MapView, label: "Heat Map" },
                  { key: "profile" as MapView, label: "Brand Profile" },
                  { key: "territory" as MapView, label: "Territory Map" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  data-testid={`tab-map-${key}`}
                  onClick={() => setMapView(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    mapView === key
                      ? "bg-white text-black"
                      : "text-[rgba(255,255,255,0.5)] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2" data-testid="map-legend">
              <span className="text-[10px] text-[rgba(255,255,255,0.4)]">
                Low Affinity
              </span>
              <div
                className="w-24 h-2 rounded-full"
                style={{
                  background:
                    "linear-gradient(to right, rgba(140,130,100,0.3), rgba(200,160,80,0.5), rgba(255,190,60,0.65), rgba(255,140,50,0.8), rgba(255,80,40,0.95))",
                }}
              />
              <span className="text-[10px] text-[rgba(255,255,255,0.4)]">
                High Affinity
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Right Space + Singularity Score */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        data-testid="brand-metrics"
      >
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Your Brand Right Space
            </p>
            <p
              className="text-xl font-semibold"
              data-testid="text-brand-right-space"
            >
              {brandRightSpace}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Brand Singularity Score
            </p>
            <p
              className="text-xl font-semibold"
              data-testid="text-singularity-score"
            >
              {singularityScore}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              How distinctly your brand occupies its emotional territory versus
              competitors in your category.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Brand Strengths & Risks */}
      <div data-testid="brand-strengths-risks">
        <h2 className="text-base font-medium mb-4">Brand Strengths & Risks</h2>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
              Differentiators
            </p>
            <div
              className="flex flex-wrap gap-2"
              data-testid="differentiators-list"
            >
              {differentiators.map((d: string) => (
                <Badge
                  key={d}
                  variant="secondary"
                  className="text-xs"
                  data-testid={`badge-differentiator-${d.toLowerCase()}`}
                >
                  {d}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
              Danger Zones
            </p>
            <div
              className="flex flex-wrap gap-2"
              data-testid="danger-zones-list"
            >
              {dangerZones.map((d: string) => (
                <Badge
                  key={d}
                  variant="outline"
                  className="text-xs border-red-300 text-red-600 bg-red-50"
                  data-testid={`badge-danger-${d.toLowerCase()}`}
                >
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
