import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Feather,
  Plus,
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
  Info,
  Upload,
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
  "Sales Sheet / One-Pager": "List the key features, benefits, and differentiators...",
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

const SCORE_TOOLTIPS: Record<string, string> = {
  toneMatch: "How closely the output matches your brand's established tone",
  vocabularyFit: "How well the word choice aligns with your brand vocabulary",
  brandConsistency: "Overall coherence with your brand voice profile",
  emotionalResonance: "How effectively the content evokes your target emotions",
};

const LOADING_MESSAGES = [
  "Analyzing your brand voice...",
  "Crafting your {type}...",
  "Scoring brand alignment...",
];

interface CreativeBrief {
  projectName: string;
  background: string;
  objectives: string;
  targetAudience: string;
  keyMessages: string;
  toneNotes: string;
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

// ─── Loading Animation ──────────────────────────────────────────────────────────

function GeneratingAnimation({ contentType }: { contentType: string }) {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setMsgIdx((p) => (p + 1) % LOADING_MESSAGES.length), 2500);
    return () => clearInterval(timer);
  }, []);
  const msg = LOADING_MESSAGES[msgIdx].replace("{type}", contentType);
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-[#585858]">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-black" />
      <p key={msgIdx} className="text-[14px] font-light animate-[fadeIn_0.4s_ease-in]">{msg}</p>
    </div>
  );
}

// ─── Score Badge with Tooltip ───────────────────────────────────────────────────

function ScoreBadge({ label, value, tooltipKey }: { label: string; value: number; tooltipKey: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0F0F0] text-[12px] text-black cursor-help">
          {label}: <span className="font-medium">{value}</span>
          <Info className="w-3 h-3 text-[#585858]" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-[12px] font-light">
        {SCORE_TOOLTIPS[tooltipKey]}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Main Create Page ───────────────────────────────────────────────────────────

export default function CreatePage({ user, brandProfile, onContentGenerated }: CreatePageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Traditional");
  const [contentType, setContentType] = useState<string>(TRADITIONAL_CONTENT_TYPES[0]);
  const [contentIdea, setContentIdea] = useState("");
  const [importedContent, setImportedContent] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<CreativeBrief>({
    projectName: "", background: "", objectives: "",
    targetAudience: "", keyMessages: "", toneNotes: "",
  });
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState(false);
  // Regenerate with feedback
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenFeedback, setRegenFeedback] = useState("");

  const tabs: TabKey[] = ["Traditional", "Digital", "Social"];
  const contentOptions = useMemo(() => CONTENT_TYPES_MAP[activeTab], [activeTab]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setContentType(CONTENT_TYPES_MAP[tab][0]);
  };

  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[number]) => {
    setActiveTab(action.tab);
    setContentType(action.contentType);
  }, []);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    // Read text-based files directly
    if (file.name.endsWith(".txt") || file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setImportedContent((prev) => prev ? `${prev}\n\n${text}` : text);
      };
      reader.readAsText(file);
    }
    // For PDF/DOCX, store the filename as a reference (full extraction would require server-side)
    // The filename is shown to the user; they can also paste the content manually
  }, []);

  const generateMutation = useMutation({
    mutationFn: async (opts?: { feedback?: string }) => {
      const hasBrief = Object.values(brief).some((v) => v.trim() !== "");
      const payload: Record<string, any> = {
        companyId: user.companyId,
        userId: user.id,
        category: activeTab,
        contentType,
        contentIdea: importedContent ? `${contentIdea}\n\n[EXISTING CONTENT TO REWRITE]:\n${importedContent}` : contentIdea,
        creativeBrief: hasBrief ? JSON.stringify(brief) : null,
      };
      if (opts?.feedback && result) {
        payload.regenerationFeedback = opts.feedback;
        payload.previousOutput = result.generatedText;
      }
      const res = await apiRequest("POST", "/api/content/generate", payload);
      return (await res.json()) as GeneratedResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setIsEditing(false);
      setRegenOpen(false);
      setRegenFeedback("");
      onContentGenerated?.();
    },
  });

  const rescoreMutation = useMutation({
    mutationFn: async (editedText: string) => {
      const res = await apiRequest("POST", `/api/content/${result!.id}/rescore`, {
        editedText, companyId: user.companyId,
      });
      return (await res.json()) as GeneratedResult;
    },
    onSuccess: (data) => { setResult(data); setIsEditing(false); },
  });

  const placeholder = PLACEHOLDER_MAP[contentType] || "Describe your content idea...";

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

  const handleRescore = useCallback(() => {
    if (!editText.trim()) return;
    rescoreMutation.mutate(editText);
  }, [editText, rescoreMutation]);

  const handleRegenerate = useCallback(() => {
    if (regenFeedback.trim()) {
      generateMutation.mutate({ feedback: regenFeedback });
    } else {
      generateMutation.mutate();
    }
  }, [regenFeedback, generateMutation]);

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

  const BRIEF_FIELDS: { key: keyof CreativeBrief; label: string; type: "input" | "textarea" }[] = [
    { key: "projectName", label: "Project Name", type: "input" },
    { key: "background", label: "Background", type: "textarea" },
    { key: "objectives", label: "Objectives", type: "textarea" },
    { key: "targetAudience", label: "Target Audience", type: "input" },
    { key: "keyMessages", label: "Key Messages", type: "textarea" },
    { key: "toneNotes", label: "Tone Notes", type: "input" },
  ];

  return (
    <div className="w-full" data-testid="create-page">
      {/* Wordmark */}
      <div className="text-center mb-4">
        <h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1>
      </div>

      {/* Tab pills */}
      <div className="flex justify-center gap-2 mb-6" data-testid="category-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-5 py-2 rounded-full text-[14px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-black text-white"
                : "bg-white text-black border border-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* ─── Left Input Panel (~45%) ─── */}
        <div className="w-[45%] space-y-4" data-testid="input-panel">
          {/* 1. Content Type dropdown */}
          <div className="space-y-1.5">
            <Label className="text-[14px] font-medium text-black">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="bg-white border-[#E5E5E5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentOptions.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Import Existing Content (functional — paste or upload) */}
          <div>
            <button
              onClick={() => setImportOpen(!importOpen)}
              className="flex items-center gap-1.5 text-[14px] font-normal text-black underline hover:no-underline transition-colors"
              data-testid="import-content-link"
            >
              <Plus className="w-3.5 h-3.5" />
              Import Existing Content
            </button>
            {importOpen && (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={importedContent}
                  onChange={(e) => setImportedContent(e.target.value)}
                  placeholder="Paste existing content here to be rewritten in your brand voice..."
                  className="min-h-[80px] bg-[#F0F0F0] resize-none text-[14px]"
                  data-testid="textarea-imported-content"
                />
                <div
                  className="border-2 border-dashed border-[#B7B7B7] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors"
                  onClick={() => importFileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setImportFileName(file.name);
                      if (file.name.endsWith(".txt") || file.type === "text/plain") {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const text = ev.target?.result as string;
                          setImportedContent((prev) => prev ? `${prev}\n\n${text}` : text);
                        };
                        reader.readAsText(file);
                      }
                    }
                  }}
                  data-testid="import-upload-zone"
                >
                  <Upload className="w-5 h-5 text-[#585858] mb-1.5" />
                  {importFileName ? (
                    <p className="text-[13px] font-medium text-black">{importFileName}</p>
                  ) : (
                    <>
                      <p className="text-[13px] font-light text-[#585858]">Drag and drop a file, or click to upload</p>
                      <p className="text-[11px] text-[#9B9B9B] mt-0.5">PDF, DOCX, or TXT</p>
                    </>
                  )}
                </div>
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
            )}
          </div>

          {/* 3. Creative Brief (ABOVE content idea) */}
          <Collapsible open={briefOpen} onOpenChange={setBriefOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1.5 text-[14px] font-medium text-black w-full" data-testid="toggle-creative-brief">
                <ChevronDown className={`w-4 h-4 transition-transform ${briefOpen ? "rotate-180" : ""}`} />
                Creative Brief (Optional)
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-3 bg-[#F0F0F0] rounded-lg p-4">
                {BRIEF_FIELDS.map(({ key, label, type }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[12px] text-[#585858]">{label}</Label>
                    {type === "input" ? (
                      <Input
                        value={brief[key]} onChange={(e) => updateBrief(key, e.target.value)}
                        className="h-8 text-[14px] bg-white border-[#E5E5E5]"
                        placeholder={label === "Background" ? "Briefly describe your organization and why this content matters." : ""}
                      />
                    ) : (
                      <Textarea
                        value={brief[key]} onChange={(e) => updateBrief(key, e.target.value)}
                        className="min-h-[60px] text-[14px] bg-white border-[#E5E5E5] resize-none"
                        placeholder={label === "Background" ? "Briefly describe your organization and why this content matters." : ""}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 4. Your Content Idea */}
          <div className="space-y-1.5">
            <Label className="text-[14px] font-medium text-black">Your Content Idea</Label>
            <Textarea
              data-testid="input-content-idea"
              placeholder={placeholder}
              value={contentIdea}
              onChange={(e) => setContentIdea(e.target.value)}
              className="min-h-[120px] bg-[#F0F0F0] resize-none text-[14px]"
            />
          </div>

          {/* 5. Generate button — dynamic text */}
          <Button
            data-testid="button-generate"
            className="w-full bg-black text-white hover:bg-black/90 rounded-[10px] text-[14px] font-light"
            size="lg"
            disabled={!contentIdea.trim() || generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            {generateMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
            ) : (
              `Generate ${contentType}`
            )}
          </Button>

          {generateMutation.isError && (
            <p className="text-[14px] text-[#FF0000]">
              {generateMutation.error?.message || "Generation failed. Please try again."}
            </p>
          )}
        </div>

        {/* ─── Right Output Panel (~55%) ─── */}
        <div className="w-[55%] bg-white rounded-lg border border-[#E5E5E5] p-6 min-h-[500px] flex flex-col" data-testid="output-panel">
          {generateMutation.isPending ? (
            <GeneratingAnimation contentType={contentType} />
          ) : result ? (
            <div className="flex flex-col gap-4 flex-1">
              {/* Action bar */}
              <div className="flex items-center gap-2 justify-end flex-wrap" data-testid="content-actions">
                <Button variant="outline" size="sm" onClick={handleCopy} className="border-[#E5E5E5]">
                  {copied ? <><Check className="w-3.5 h-3.5 mr-1.5 text-[#1F9A15]" />Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1.5" />Copy</>}
                </Button>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleStartEdit} className="border-[#E5E5E5]">
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditText(""); }} className="border-[#E5E5E5]">
                      <X className="w-3.5 h-3.5 mr-1.5" />Cancel
                    </Button>
                    <Button size="sm" onClick={handleRescore} disabled={rescoreMutation.isPending} className="bg-black text-white">
                      {rescoreMutation.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Scoring...</> : "Re-score"}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline" size="sm"
                  onClick={() => setRegenOpen(!regenOpen)}
                  disabled={generateMutation.isPending}
                  className="border-[#E5E5E5]"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Regenerate
                </Button>
              </div>

              {/* Regenerate feedback input */}
              {regenOpen && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-[12px] text-[#585858] mb-1 block">What should change?</Label>
                    <Input
                      value={regenFeedback}
                      onChange={(e) => setRegenFeedback(e.target.value)}
                      placeholder="e.g. Make it more conversational, shorten the intro..."
                      className="text-[14px] bg-[#F0F0F0] border-[#E5E5E5]"
                      data-testid="input-regen-feedback"
                    />
                  </div>
                  <Button size="sm" onClick={handleRegenerate} disabled={generateMutation.isPending} className="bg-black text-white">
                    {generateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Go"}
                  </Button>
                </div>
              )}

              {/* Content display / edit */}
              {isEditing ? (
                <Textarea
                  value={editText} onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 min-h-[300px] text-[14px] leading-relaxed resize-none bg-[#F0F0F0]"
                />
              ) : (
                <div className="prose prose-sm max-w-none text-black whitespace-pre-wrap leading-relaxed text-[14px] flex-1">
                  {result.generatedText}
                </div>
              )}

              {/* Word count */}
              <p className="text-[12px] text-[#7E7E7E]">{wordCount} words</p>

              {/* Re-score error */}
              {rescoreMutation.isError && (
                <p className="text-[14px] text-[#FF0000]">{rescoreMutation.error?.message || "Re-scoring failed."}</p>
              )}

              {/* Scores with tooltips */}
              <div className="border-t border-[#E5E5E5] pt-4">
                <p className="text-[12px] text-[#585858] mb-2 font-medium">Brand Alignment Scores</p>
                <div className="flex flex-wrap gap-2" data-testid="scores-container">
                  {displayScores.map(({ label, value, key }) => (
                    <ScoreBadge key={key} label={label} value={value} tooltipKey={key} />
                  ))}
                </div>
                <p className="text-[12px] text-[#7E7E7E] mt-3">
                  Not quite right? Hit Regenerate to describe what needs to change, or Edit to fine-tune it yourself.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Feather className="w-10 h-10 mb-3 text-[#7E7E7E] opacity-40" />
              <p className="text-[14px] font-normal text-[#7E7E7E]" data-testid="text-empty-state">
                Your rewritten content will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[12px] text-[#585858] mt-6">Powered by Gallea Ai</p>
    </div>
  );
}
