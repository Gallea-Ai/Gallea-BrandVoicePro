import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import {
  ASSESSMENT_MODULES,
  type AssessmentQuestion,
  type AssessmentModule,
} from "@/data/assessment-modules";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface AssessmentPageProps {
  onComplete: (responses: Record<string, any>[]) => void;
  onBack: () => void;
  companyId?: number | null;
  userId?: number | null;
}

// ─── Progress Dots ──────────────────────────────────────────────────────────────

function ProgressDots({
  total,
  current,
  completed,
}: {
  total: number;
  current: number;
  completed: number[];
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" data-testid="progress-dots">
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = completed.includes(i);
        const isCurrent = i === current;
        return (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              isCompleted
                ? "bg-primary"
                : isCurrent
                  ? "bg-primary/60 ring-2 ring-primary/30"
                  : "bg-border"
            }`}
            data-testid={`progress-dot-${i}`}
          />
        );
      })}
    </div>
  );
}

// ─── Question Renderers ─────────────────────────────────────────────────────────

function SingleQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-sm font-medium leading-relaxed">{question.text}</Label>
      <RadioGroup value={value} onValueChange={onChange} data-testid={`radio-group-${question.id}`}>
        {question.options?.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3 py-1">
            <RadioGroupItem
              value={opt.value}
              id={`${question.id}-${opt.value}`}
              data-testid={`radio-${question.id}-${opt.value}`}
            />
            <Label
              htmlFor={`${question.id}-${opt.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

function MultiQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const toggleOption = useCallback(
    (optValue: string) => {
      if (value.includes(optValue)) {
        onChange(value.filter((v) => v !== optValue));
      } else {
        if (question.maxSelections && value.length >= question.maxSelections) return;
        onChange([...value, optValue]);
      }
    },
    [value, onChange, question.maxSelections],
  );

  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-sm font-medium leading-relaxed">
        {question.text}
        {question.maxSelections && (
          <span className="text-muted-foreground font-normal ml-1">
            (Select up to {question.maxSelections})
          </span>
        )}
      </Label>
      <div className="space-y-2">
        {question.options?.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3 py-1">
            <Checkbox
              id={`${question.id}-${opt.value}`}
              checked={value.includes(opt.value)}
              onCheckedChange={() => toggleOption(opt.value)}
              data-testid={`checkbox-${question.id}-${opt.value}`}
            />
            <Label
              htmlFor={`${question.id}-${opt.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScaleQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: number | null;
  onChange: (val: number) => void;
}) {
  const points = question.scalePoints || 10;

  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-sm font-medium leading-relaxed">{question.text}</Label>
      {question.scaleLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{question.scaleLabels.left}</span>
          <span>{question.scaleLabels.right}</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-1.5">
        {Array.from({ length: points }, (_, i) => {
          const num = i + 1;
          const isSelected = value === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`h-9 w-9 rounded-full border text-xs font-medium transition-all flex items-center justify-center ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-muted text-foreground"
              }`}
              data-testid={`scale-${question.id}-${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SpectrumQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: number | null;
  onChange: (val: number) => void;
}) {
  const points = question.scalePoints || 10;

  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-sm font-medium leading-relaxed">{question.text}</Label>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{question.scaleLabels?.left}</span>
        <span>{question.scaleLabels?.right}</span>
      </div>
      <div className="flex items-center justify-between gap-1.5">
        {Array.from({ length: points }, (_, i) => {
          const num = i + 1;
          const isSelected = value === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`h-9 w-9 rounded-full border text-xs font-medium transition-all flex items-center justify-center ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-muted text-foreground"
              }`}
              data-testid={`spectrum-${question.id}-${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextareaQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-sm font-medium leading-relaxed">{question.text}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || "Type your answer..."}
        maxLength={question.maxLength}
        className="min-h-[100px] resize-none"
        data-testid={`textarea-${question.id}`}
      />
      {question.maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length}/{question.maxLength}
        </p>
      )}
    </div>
  );
}

// ─── Question Router ────────────────────────────────────────────────────────────

function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: any;
  onChange: (val: any) => void;
}) {
  switch (question.type) {
    case "single":
      return <SingleQuestion question={question} value={value || ""} onChange={onChange} />;
    case "multi":
      return <MultiQuestion question={question} value={value || []} onChange={onChange} />;
    case "scale":
      return <ScaleQuestion question={question} value={value} onChange={onChange} />;
    case "spectrum":
      return <SpectrumQuestion question={question} value={value} onChange={onChange} />;
    case "textarea":
      return <TextareaQuestion question={question} value={value || ""} onChange={onChange} />;
    default:
      return null;
  }
}

// ─── Main Assessment Page ───────────────────────────────────────────────────────

export default function AssessmentPage({ onComplete, onBack, companyId, userId }: AssessmentPageProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [allResponses, setAllResponses] = useState<Record<string, any>[]>(
    ASSESSMENT_MODULES.map(() => ({})),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved assessment progress on mount
  useEffect(() => {
    if (!companyId) return;
    const loadSaved = async () => {
      try {
        const res = await apiRequest("GET", `/api/assessment/${companyId}`);
        const saved = await res.json();
        if (Array.isArray(saved) && saved.length > 0) {
          const restored = ASSESSMENT_MODULES.map(() => ({})) as Record<string, any>[];
          const completedIdxs: number[] = [];
          for (const entry of saved) {
            const idx = entry.moduleIndex;
            if (idx >= 0 && idx < ASSESSMENT_MODULES.length) {
              try {
                restored[idx] = typeof entry.responses === "string" ? JSON.parse(entry.responses) : entry.responses;
              } catch {
                restored[idx] = {};
              }
              completedIdxs.push(idx);
            }
          }
          setAllResponses(restored);
          setCompletedModules(completedIdxs);
          // Jump to the first incomplete module
          const firstIncomplete = ASSESSMENT_MODULES.findIndex((_, i) => !completedIdxs.includes(i));
          if (firstIncomplete >= 0) {
            setCurrentModuleIndex(firstIncomplete);
          }
        }
      } catch {
        // No saved data — start fresh
      }
    };
    loadSaved();
  }, [companyId]);

  const currentModule: AssessmentModule = ASSESSMENT_MODULES[currentModuleIndex];
  const isLastModule = currentModuleIndex === ASSESSMENT_MODULES.length - 1;
  const moduleResponses = allResponses[currentModuleIndex];

  const updateResponse = useCallback(
    (questionId: string, value: any) => {
      setAllResponses((prev) => {
        const next = [...prev];
        next[currentModuleIndex] = { ...next[currentModuleIndex], [questionId]: value };
        return next;
      });
    },
    [currentModuleIndex],
  );

  const isModuleValid = useCallback((): boolean => {
    for (const q of currentModule.questions) {
      if (!q.required) continue;
      const val = moduleResponses[q.id];
      if (val === undefined || val === null || val === "") return false;
      if (q.type === "multi" && Array.isArray(val) && val.length === 0) return false;
    }
    return true;
  }, [currentModule, moduleResponses]);

  const submitModule = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/assessment", {
        companyId: companyId || 0,
        userId: userId || 0,
        moduleIndex: currentModuleIndex,
        responses: JSON.stringify(moduleResponses),
      });
    } catch {
      // Silently continue — the backend may not be wired yet
    }
    setIsSubmitting(false);
  }, [companyId, userId, currentModuleIndex, moduleResponses]);

  const handleContinue = useCallback(async () => {
    await submitModule();
    setCompletedModules((prev) =>
      prev.includes(currentModuleIndex) ? prev : [...prev, currentModuleIndex],
    );

    if (isLastModule) {
      onComplete(allResponses);
    } else {
      setCurrentModuleIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitModule, currentModuleIndex, isLastModule, allResponses, onComplete]);

  const handleBack = useCallback(() => {
    if (currentModuleIndex === 0) {
      onBack();
    } else {
      setCurrentModuleIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentModuleIndex, onBack]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-4">
          <h1
            className="text-xl font-medium tracking-tight text-foreground"
            style={{ fontFamily: "'Georgia', serif" }}
            data-testid="text-assessment-logo"
          >
            GalleaBrandVoicePro
          </h1>
        </div>

        {/* Progress Dots */}
        <ProgressDots
          total={ASSESSMENT_MODULES.length}
          current={currentModuleIndex}
          completed={completedModules}
        />

        {/* Module Card */}
        <Card className="p-8">
          <CardContent className="p-0">
            {/* Module Header */}
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1" data-testid="text-module-index">
                Module {currentModuleIndex + 1} of {ASSESSMENT_MODULES.length}
              </p>
              <h2 className="text-lg font-semibold tracking-tight" data-testid="text-module-title">
                {currentModule.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-module-subtitle">
                {currentModule.subtitle}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Take your time — there are no wrong answers here.</p>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentModule.questions.map((question) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  value={moduleResponses[question.id]}
                  onChange={(val) => updateResponse(question.id, val)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                data-testid="button-assessment-back"
              >
                Back
              </Button>
              <Button
                size="lg"
                disabled={!isModuleValid() || isSubmitting}
                onClick={handleContinue}
                data-testid={isLastModule ? "button-complete-assessment" : "button-assessment-continue"}
              >
                {isSubmitting
                  ? "Saving..."
                  : isLastModule
                    ? "Finish & Build My Voice"
                    : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground" data-testid="text-assessment-powered-by">
          Powered by Gallea Ai
        </p>
      </div>
    </div>
  );
}
