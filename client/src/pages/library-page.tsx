import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Trash2, Check, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedContent } from "@shared/schema";

interface LibraryPageProps {
  user: { id: number; companyId: number | null };
  onNavigateToCreate?: () => void;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function ScoreColor(score: number | null): string {
  if (!score) return "text-muted-foreground";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-500";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toneDescription(contentType: string): string {
  const toneMap: Record<string, string> = {
    "Tagline/Slogan": "Aspirational Tone",
    Headline: "Bold Tone",
    "Body Copy": "Conversational Tone",
    "Blog Post": "Informative Tone",
    "LinkedIn Post": "Professional Tone",
    "Twitter / X Post": "Concise Tone",
    "Instagram Caption": "Engaging Tone",
    "Email Campaign": "Persuasive Tone",
    "Press Release": "Formal Tone",
    "Sales Outreach Email": "Direct Tone",
    "Landing Page": "Action-Driven Tone",
    "Case Study": "Analytical Tone",
    "White Paper": "Authoritative Tone",
    "Reddit Post": "Casual Tone",
    "TikTok Script": "Energetic Tone",
  };
  return toneMap[contentType] || "Balanced Tone";
}

export default function LibraryPage({ user, onNavigateToCreate }: LibraryPageProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const {
    data: contentItems,
    isLoading,
  } = useQuery<GeneratedContent[]>({
    queryKey: ["/api/content", user.companyId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/content/${user.companyId}`);
      return res.json();
    },
    enabled: !!user.companyId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (contentId: number) => {
      await apiRequest("DELETE", `/api/content/${contentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/content", user.companyId],
      });
      toast({ title: "Content deleted" });
    },
  });

  const handleCopy = useCallback(async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [toast]);

  return (
    <div className="w-full" data-testid="library-page">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" data-testid="text-page-title">
          Content History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All AI-generated content is automatically saved with brand alignment
          scores.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-testid="loading-skeleton">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : !contentItems || contentItems.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-testid="text-empty-library"
        >
          <PenLine className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-foreground">No content generated yet</p>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            Head to Create to generate your first piece of brand-aligned content.
          </p>
          {onNavigateToCreate && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onNavigateToCreate}
              data-testid="button-go-to-create"
            >
              <PenLine className="w-3.5 h-3.5 mr-1.5" />
              Go to Create
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4" data-testid="content-list">
          {contentItems.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-lg border border-border p-5 relative"
              data-testid={`card-content-${item.id}`}
            >
              {/* Top row: badges + score */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    data-testid={`badge-type-${item.id}`}
                  >
                    {item.contentType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    data-testid={`badge-category-${item.id}`}
                  >
                    {item.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    data-testid={`badge-tone-${item.id}`}
                  >
                    {toneDescription(item.contentType)}
                  </Badge>
                </div>
                {item.overallScore != null && (
                  <div
                    className={`px-3 py-1.5 rounded-lg text-center ${
                      item.overallScore >= 80
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : item.overallScore >= 60
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                    data-testid={`text-score-${item.id}`}
                  >
                    <span className="text-lg font-bold leading-none">{item.overallScore}</span>
                    <span className="text-xs font-medium ml-0.5">/100</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <p
                className="text-sm font-medium mb-2"
                data-testid={`text-input-${item.id}`}
              >
                Input: {item.contentIdea}
              </p>

              {/* Preview */}
              <p
                className="text-sm text-muted-foreground line-clamp-3 mb-2"
                data-testid={`text-preview-${item.id}`}
              >
                {item.generatedText}
              </p>
              <p className="text-xs text-muted-foreground mb-3" data-testid={`text-wordcount-${item.id}`}>
                {wordCount(item.generatedText)} words
              </p>

              {/* Score row */}
              <div
                className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3"
                data-testid={`scores-row-${item.id}`}
              >
                <span>Tone Match: {item.toneMatch ?? "—"}</span>
                <span>Vocabulary Fit: {item.vocabularyFit ?? "—"}</span>
                <span>
                  Brand Consistency: {item.brandConsistency ?? "—"}
                </span>
                <span>
                  Emotional Resonance: {item.emotionalResonance ?? "—"}
                </span>
              </div>

              {/* Timestamp + actions */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs text-muted-foreground"
                  data-testid={`text-date-${item.id}`}
                >
                  {formatDate(item.createdAt)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleCopy(item.generatedText, item.id)}
                    data-testid={`button-copy-${item.id}`}
                  >
                    {copiedId === item.id ? (
                      <><Check className="w-3.5 h-3.5 mr-1 text-green-600" />Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5 mr-1" />Copy</>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
