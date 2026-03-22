import { useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Feather,
  Download,
  ChevronDown,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Pencil,
  X,
  Briefcase,
  Mail,
  FileText,
  Camera,
} from "lucide-react";
import {
  TRADITIONAL_CONTENT_TYPES,
  DIGITAL_CONTENT_TYPES,
  SOCIAL_CONTENT_TYPES,
} from "@shared/schema";

type TabKey = "Traditional" | "Digital" | "Social";

const CONTENT_TYPES_MAP: Record<TabKey, readonly string[]> = {
  Traditional: TRADITIONAL_CONTENT_TYPES,
  Digital: DIGITAL_CONTENT_TYPES,
  Social: SOCIAL_CONTENT_TYPES,
};

const PLACEHOLDER_MAP: Record<string, string> = {
  "Tagline/Slogan": "Describe your brand essence or campaign theme...",
  Headline: "What's the main message you want to convey?",
  Subheadline: "What supporting message should follow your headline?",
  "Body Copy": "Describe the product, service, or story to cover...",
  Brochure: "What should the brochure communicate? Include key points...",
  "Print Ad": "Describe the product/service and the ad's objective...",
  "Direct Mail": "Who is the audience and what action should they take?",
  "Radio Script": "Describe the scenario, tone, and call to action...",
  "Sales Sheet / One-Pager":
    "List the key features, benefits, and differentiators...",
  "Blog Post": "Main topic to cover...",
  "Landing Page": "What is the landing page for? Describe the offer...",
  "Website Page Copy": "Which page and what content should it include?",
  "Case Study": "Describe the client, challenge, solution, and results...",
  "White Paper": "What is the thesis or topic for the white paper?",
  "Product Description": "Describe the product and its key benefits...",
  "Press Release": "What is the newsworthy announcement?",
  Newsletter: "What topics or updates should the newsletter cover?",
  "Email Campaign": "Campaign goal and key message...",
  "Sales Outreach Email": "Who are you reaching out to and why?",
  "Follow-up Email": "What was the initial outreach about?",
  "Google / Search Ad Copy": "What product/service and keywords to target?",
  "Video Script": "Describe the video concept and key messages...",
  "LinkedIn Post": "What professional insight or update to share...",
  "Twitter / X Post": "What's the key message in 280 characters or less?",
  "Instagram Caption": "Describe the image/video and the message...",
  "Facebook Post": "What content or story to share with your community?",
  "TikTok Script": "Describe the hook, content, and call to action...",
  "Social Ad Copy": "What's the ad objective and target audience?",
  "Reddit Post": "What topic and which subreddit style?",
  "YouTube Script": "Describe the video topic and structure...",
};

const QUICK_ACTIONS = [
  { label: "LinkedIn Post", tab: "Social" as TabKey, contentType: "LinkedIn Post", icon: Briefcase },
  { label: "Email Campaign", tab: "Digital" as TabKey, contentType: "Email Campaign", icon: Mail },
  { label: "Blog Post", tab: "Digital" as TabKey, contentType: "Blog Post", icon: FileText },
  { label: "Instagram Caption", tab: "Social" as TabKey, contentType: "Instagram Caption", icon: Camera },
];

interface CreativeBrief {
  projectName: string;
  background: string;
  objectives: string;
  targetAudience: string;
  keyMessages: string;
  toneAndFeel: string;
  deliverablesFormat1: string;
  deliverablesFormat2: string;
  mandatoryInclusions: string;
  referencesInspiration: string;
}

interface GeneratedResult {
  id?: number;
  generatedText: string;
  toneMatch: number;
  vocabularyFit: number;
  brandConsistency: number;
  emotionalResonance: number;
  overallScore: number;
}

interface CreatePageProps {
  user: { id: number; companyId: number | null; fullName: string };
  brandProfile: any | null;
  onContentGenerated?: () => void;
}

export default function CreatePage({ user, brandProfile, onContentGenerated }: CreatePageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Traditional");
  const [contentType, setContentType] = useState<string>(
    TRADITIONAL_CONTENT_TYPES[0]
  );
  const [contentIdea, setContentIdea] = useState("");
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<CreativeBrief>({
    projectName: "",
    background: "",
    objectives: "",
    targetAudience: "",
    keyMessages: "",
    toneAndFeel: "",
    deliverablesFormat1: "",
    deliverablesFormat2: "",
    mandatoryInclusions: "",
    referencesInspiration: "",
  });
  const [result, setResult] = useState<GeneratedResult | null>(null);

  // Edit + re-score state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // Copy state
  const [copied, setCopied] = useState(false);

  const tabs: TabKey[] = ["Traditional", "Digital", "Social"];
  const contentOptions = useMemo(
    () => CONTENT_TYPES_MAP[activeTab],
    [activeTab]
  );

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const newTypes = CONTENT_TYPES_MAP[tab];
    setContentType(newTypes[0]);
  };

  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[number]) => {
    setActiveTab(action.tab);
    setContentType(action.contentType);
  }, []);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const hasBrief = Object.values(brief).some((v) => v.trim() !== "");
      const res = await apiRequest("POST", "/api/content/generate", {
        companyId: user.companyId,
        userId: user.id,
        category: activeTab,
        contentType,
        contentIdea,
        creativeBrief: hasBrief ? JSON.stringify(brief) : null,
      });
      return (await res.json()) as GeneratedResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setIsEditing(false);
      onContentGenerated?.();
    },
  });

  const rescoreMutation = useMutation({
    mutationFn: async (editedText: string) => {
      const res = await apiRequest("POST", `/api/content/${result!.id}/rescore`, {
        editedText,
        companyId: user.companyId,
      });
      return (await res.json()) as GeneratedResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setIsEditing(false);
    },
  });

  const placeholder =
    PLACEHOLDER_MAP[contentType] || "Describe your content idea...";

  const updateBrief = (field: keyof CreativeBrief, value: string) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleStartEdit = useCallback(() => {
    if (!result) return;
    setEditText(result.generatedText);
    setIsEditing(true);
  }, [result]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText("");
  }, []);

  const handleRescore = useCallback(() => {
    if (!editText.trim()) return;
    rescoreMutation.mutate(editText);
  }, [editText, rescoreMutation]);

  const wordCount = useMemo(() => {
    if (!result) return 0;
    const text = isEditing ? editText : result.generatedText;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [result, isEditing, editText]);

  const displayScores = result ? [
    { label: "Tone Match", value: result.toneMatch, key: "toneMatch" },
    { label: "Vocabulary Fit", value: result.vocabularyFit, key: "vocabularyFit" },
    { label: "Brand Consistency", value: result.brandConsistency, key: "brandConsistency" },
    { label: "Emotional Resonance", value: result.emotionalResonance, key: "emotionalResonance" },
  ] : [];

  return (
    <div className="w-full" data-testid="create-page">
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">What would you like to create?</h1>
        <p className="text-sm text-muted-foreground mt-1">Pick a format below, describe your idea, and we'll write it in your brand's voice.</p>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex gap-2 mb-4 flex-wrap" data-testid="quick-actions">
        {QUICK_ACTIONS.map(({ label, tab, contentType: ct, icon: Icon }) => (
          <button
            key={label}
            onClick={() => handleQuickAction({ label, tab, contentType: ct, icon: Icon })}
            data-testid={`quick-${label.toLowerCase().replace(/\s+/g, "-")}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeTab === tab && contentType === ct
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 mb-6" data-testid="category-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-testid={`tab-${tab.toLowerCase()}`}
            onClick={() => handleTabChange(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-foreground text-background"
                : "bg-card text-foreground border border-border hover:bg-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Left panel — 40% */}
        <div className="w-[40%] space-y-5" data-testid="input-panel">
          {/* Content Type */}
          <div className="space-y-2">
            <Label htmlFor="content-type" className="text-sm font-medium">
              Content Type
            </Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger
                id="content-type"
                data-testid="select-content-type"
                className="bg-card"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Import link */}
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="import-content-link"
          >
            <Download className="w-3.5 h-3.5" />
            Import Existing Content
          </button>

          {/* Content Idea */}
          <div className="space-y-2">
            <Label htmlFor="content-idea" className="text-sm font-medium">
              Tell us what you'd like to say
            </Label>
            <Textarea
              id="content-idea"
              data-testid="input-content-idea"
              placeholder={placeholder}
              value={contentIdea}
              onChange={(e) => setContentIdea(e.target.value)}
              className="min-h-[140px] bg-card resize-none"
            />
          </div>

          {/* Creative Brief collapsible */}
          <Collapsible open={briefOpen} onOpenChange={setBriefOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center gap-1.5 text-sm font-medium hover:text-muted-foreground transition-colors w-full"
                data-testid="toggle-creative-brief"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${briefOpen ? "rotate-180" : ""}`}
                />
                Add more detail (optional)
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 space-y-3 bg-card rounded-lg p-4 border border-border">
                {[
                  { key: "projectName" as const, label: "Project Name", type: "input" },
                  { key: "background" as const, label: "Background", type: "textarea" },
                  { key: "objectives" as const, label: "Objectives", type: "textarea" },
                  { key: "targetAudience" as const, label: "Target Audience", type: "input" },
                  { key: "keyMessages" as const, label: "Key Messages", type: "textarea" },
                  { key: "toneAndFeel" as const, label: "Tone and Feel", type: "input" },
                  {
                    key: "deliverablesFormat1" as const,
                    label: "Deliverables and Format",
                    type: "input",
                  },
                  {
                    key: "deliverablesFormat2" as const,
                    label: "Deliverables and Format (2)",
                    type: "input",
                  },
                  {
                    key: "mandatoryInclusions" as const,
                    label: "Mandatory Inclusions",
                    type: "textarea",
                  },
                  {
                    key: "referencesInspiration" as const,
                    label: "References and Inspiration",
                    type: "textarea",
                  },
                ].map(({ key, label, type }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {label}
                    </Label>
                    {type === "input" ? (
                      <Input
                        data-testid={`brief-${key}`}
                        value={brief[key]}
                        onChange={(e) => updateBrief(key, e.target.value)}
                        className="h-8 text-sm bg-background"
                      />
                    ) : (
                      <Textarea
                        data-testid={`brief-${key}`}
                        value={brief[key]}
                        onChange={(e) => updateBrief(key, e.target.value)}
                        className="min-h-[60px] text-sm bg-background resize-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Generate button */}
          <Button
            data-testid="button-generate"
            className="w-full"
            size="lg"
            disabled={!contentIdea.trim() || generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Write this for me"
            )}
          </Button>

          {generateMutation.isError && (
            <p
              className="text-sm text-destructive"
              data-testid="text-generate-error"
            >
              {generateMutation.error?.message || "Generation failed. Please try again."}
            </p>
          )}
        </div>

        {/* Right panel — 60% */}
        <div
          className="w-[60%] bg-card rounded-lg border border-border p-6 min-h-[500px] flex flex-col"
          data-testid="output-panel"
        >
          {generateMutation.isPending ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2
                className="w-8 h-8 animate-spin mb-3"
                data-testid="loading-spinner"
              />
              <p className="text-sm">Generating...</p>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-5 flex-1">
              {/* Action bar */}
              <div className="flex items-center gap-2 justify-end" data-testid="content-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  data-testid="button-copy"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 mr-1.5" />Copy</>
                  )}
                </Button>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                    data-testid="button-edit"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-edit"
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRescore}
                      disabled={rescoreMutation.isPending}
                      data-testid="button-rescore"
                    >
                      {rescoreMutation.isPending ? (
                        <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Scoring...</>
                      ) : (
                        <>Re-score</>
                      )}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  data-testid="button-regenerate"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Regenerate
                </Button>
              </div>

              {/* Content display / edit */}
              {isEditing ? (
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 min-h-[300px] text-sm leading-relaxed resize-none bg-background"
                  data-testid="textarea-edit-content"
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed"
                  data-testid="text-generated-content"
                >
                  {result.generatedText}
                </div>
              )}

              {/* Word count */}
              <p className="text-xs text-muted-foreground" data-testid="text-word-count">
                {wordCount} words
              </p>

              {/* Re-score error */}
              {rescoreMutation.isError && (
                <p className="text-sm text-destructive" data-testid="text-rescore-error">
                  {rescoreMutation.error?.message || "Re-scoring failed. Please try again."}
                </p>
              )}

              {/* Scores */}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Brand Alignment Scores
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  data-testid="scores-container"
                >
                  {displayScores.map(({ label, value, key }) => (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="text-xs font-normal"
                      data-testid={`score-${key}`}
                    >
                      {label}: {value}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Not quite right? Hit Regenerate for a fresh take, or Edit to fine-tune it yourself.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Feather className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm" data-testid="text-empty-state">
                Your content will appear here once you hit 'Write this for me'
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
