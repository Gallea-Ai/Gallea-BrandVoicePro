import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { Upload, CheckCircle2 } from "lucide-react";
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

function ProgressDots({ total, current, completed }: { total: number; current: number; completed: number[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" data-testid="progress-dots">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-all ${
            completed.includes(i) ? "bg-black" : i === current ? "bg-black/60 ring-2 ring-black/30" : "bg-[#E5E5E5]"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Module Completion Interstitial ──────────────────────────────────────────────

function ModuleInterstitial({ moduleTitle, completedCount, total, onContinue, nextModuleName }: {
  moduleTitle: string; completedCount: number; total: number; onContinue: () => void; nextModuleName: string;
}) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 2000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        {/* Animated checkmark */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1F9A15]/10">
          <CheckCircle2 className="w-10 h-10 text-[#1F9A15] animate-[checkDraw_0.5s_ease-out]" />
        </div>
        <h2 className="text-[20px] font-medium text-black">Module Complete!</h2>
        <p className="text-[14px] font-light text-black">{moduleTitle} Captured</p>
        <p className="text-[14px] font-light text-[#585858]">
          You've completed {completedCount} of {total} modules.
        </p>
        <Button variant="outline" onClick={onContinue} className="mt-4">
          Continue to {nextModuleName}
        </Button>
      </div>
    </div>
  );
}

// ─── Draggable Slider ───────────────────────────────────────────────────────────

function DraggableSlider({ value, onChange, min, max, leftLabel, rightLabel, id }: {
  value: number | null; onChange: (v: number) => void; min: number; max: number;
  leftLabel?: string; rightLabel?: string; id: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const current = value ?? Math.round((min + max) / 2);
  const pct = ((current - min) / (max - min)) * 100;

  const handleInteraction = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const val = Math.round(min + ratio * (max - min));
    onChange(val);
  }, [min, max, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleInteraction(e.clientX);
    const onMove = (ev: MouseEvent) => handleInteraction(ev.clientX);
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [handleInteraction]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleInteraction(e.touches[0].clientX);
    const onMove = (ev: TouchEvent) => { ev.preventDefault(); handleInteraction(ev.touches[0].clientX); };
    const onEnd = () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [handleInteraction]);

  return (
    <div data-testid={`slider-${id}`}>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between mb-1.5">
          <span className="text-[14px] font-light text-black">{leftLabel}</span>
          <span className="text-[14px] font-light text-black">{rightLabel}</span>
        </div>
      )}
      <div
        ref={trackRef}
        className="relative h-[4px] bg-[#B7B7B7] rounded-[2px] cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Filled portion */}
        <div className="absolute left-0 top-0 h-full bg-black rounded-[2px]" style={{ width: `${pct}%` }} />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-black rounded-full shadow-md"
          style={{ left: `${pct}%` }}
        />
      </div>
      {value !== null && (
        <p className="text-center text-[12px] text-[#585858] mt-1">{current}</p>
      )}
    </div>
  );
}

// ─── Question Renderers ─────────────────────────────────────────────────────────

function SingleQuestion({ question, value, onChange }: { question: AssessmentQuestion; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-[20px] font-medium leading-relaxed text-black">{question.text}</Label>
      {question.helperText && <p className="text-[14px] font-light text-[#585858]">{question.helperText}</p>}
      <RadioGroup value={value} onValueChange={onChange}>
        {question.options?.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3 py-1">
            <RadioGroupItem value={opt.value} id={`${question.id}-${opt.value}`} />
            <Label htmlFor={`${question.id}-${opt.value}`} className="text-[14px] font-light cursor-pointer text-black">{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

function MultiQuestion({ question, value, onChange }: { question: AssessmentQuestion; value: string[]; onChange: (v: string[]) => void }) {
  const allOptionValues = question.options?.filter(o => o.value !== "all_of_the_above").map(o => o.value) || [];

  const toggleOption = useCallback((optValue: string) => {
    if (optValue === "all_of_the_above") {
      if (value.includes("all_of_the_above")) {
        onChange([]);
      } else {
        onChange([...allOptionValues, "all_of_the_above"]);
      }
      return;
    }
    let next: string[];
    if (value.includes(optValue)) {
      next = value.filter((v) => v !== optValue && v !== "all_of_the_above");
    } else {
      if (question.maxSelections && value.filter(v => v !== "all_of_the_above").length >= question.maxSelections) return;
      next = [...value, optValue];
    }
    onChange(next);
  }, [value, onChange, question.maxSelections, allOptionValues]);

  const options = [...(question.options || [])];
  if (question.hasAllOfAbove && !options.find(o => o.value === "all_of_the_above")) {
    options.push({ label: "All of the Above", value: "all_of_the_above" });
  }

  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-[20px] font-medium leading-relaxed text-black">{question.text}</Label>
      {question.selectionInstruction && (
        <p className="text-[14px] font-medium text-black">{question.selectionInstruction}</p>
      )}
      {question.helperText && <p className="text-[14px] font-light text-[#585858]">{question.helperText}</p>}
      <div className="space-y-1">
        {question.categoryLabels ? (
          // Render with category group labels
          question.categoryLabels.map((cat, ci) => (
            <div key={ci} className="mb-3">
              <p className="text-[12px] font-medium text-[#585858] uppercase tracking-wider mb-1">{cat.label}</p>
              <div className="flex flex-wrap gap-2">
                {options.slice(cat.startIndex, cat.endIndex + 1).map((opt) => {
                  const selected = value.includes(opt.value);
                  return (
                    <button key={opt.value} type="button" onClick={() => toggleOption(opt.value)}
                      className={`px-3 py-1.5 rounded text-[14px] border transition-colors ${
                        selected ? "bg-black text-white border-black font-medium" : "bg-white text-black border-black font-light"
                      }`}
                    >{opt.label}</button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          // Render as tag chips
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button key={opt.value} type="button" onClick={() => toggleOption(opt.value)}
                  className={`px-3 py-1.5 rounded text-[14px] border transition-colors ${
                    selected ? "bg-black text-white border-black font-medium" : "bg-white text-black border-black font-light"
                  }`}
                >{opt.label}</button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ScaleQuestion({ question, value, onChange }: { question: AssessmentQuestion; value: number | null; onChange: (v: number) => void }) {
  const points = question.scalePoints || 10;
  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-[20px] font-medium leading-relaxed text-black">{question.text}</Label>
      {question.helperText && <p className="text-[14px] font-light text-[#585858]">{question.helperText}</p>}
      <DraggableSlider
        id={question.id} value={value} onChange={onChange}
        min={1} max={points}
        leftLabel={question.scaleLabels?.left} rightLabel={question.scaleLabels?.right}
      />
    </div>
  );
}

function SpectrumGroupQuestion({ question, values, onChange }: {
  question: AssessmentQuestion; values: Record<string, number>; onChange: (id: string, val: number) => void;
}) {
  return (
    <div className="space-y-6" data-testid={`question-${question.id}`}>
      <Label className="text-[20px] font-medium leading-relaxed text-black">{question.text}</Label>
      {question.spectrums?.map((s) => (
        <DraggableSlider
          key={s.id} id={s.id} value={values[s.id] ?? null} onChange={(v) => onChange(s.id, v)}
          min={1} max={s.points}
          leftLabel={s.left} rightLabel={s.right}
        />
      ))}
    </div>
  );
}

function TextareaQuestion({ question, value, onChange }: { question: AssessmentQuestion; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-[20px] font-medium leading-relaxed text-black">{question.text}</Label>
      {question.helperText && <p className="text-[14px] font-light text-[#585858]">{question.helperText}</p>}
      <Textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || "Type your answer..."} maxLength={question.maxLength}
        className="min-h-[100px] resize-none"
      />
      {question.maxLength && (
        <p className="text-xs text-[#585858] text-right">{value.length}/{question.maxLength}</p>
      )}
    </div>
  );
}

function PillarsQuestion({ question, value, onChange }: { question: AssessmentQuestion; value: string[]; onChange: (v: string[]) => void }) {
  const pillars = value.length === 4 ? value : ["", "", "", ""];
  const update = (idx: number, val: string) => {
    const next = [...pillars];
    next[idx] = val;
    onChange(next);
  };
  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-[20px] font-medium leading-relaxed text-black">{question.text}</Label>
      {[0, 1, 2, 3].map((i) => (
        <Input key={i} placeholder={`Brand Pillar ${i + 1}`} value={pillars[i]} onChange={(e) => update(i, e.target.value)} />
      ))}
    </div>
  );
}

function FileUploadQuestion({ question, value, onChange }: { question: AssessmentQuestion; value: string; onChange: (v: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Store file name as value for now (actual upload would go to server)
      onChange(file.name);
    }
  };

  return (
    <div className="space-y-3" data-testid={`question-${question.id}`}>
      <Label className="text-[14px] font-light text-black">{question.text}</Label>
      <div
        className="border-2 border-dashed border-[#B7B7B7] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-6 h-6 text-[#585858] mb-2" />
        {fileName ? (
          <p className="text-[14px] font-medium text-black">{fileName}</p>
        ) : (
          <>
            <p className="text-[14px] font-light text-[#585858]">{question.uploadLabel || "Drag and drop or click to upload"}</p>
            <p className="text-[12px] text-[#9B9B9B] mt-1">{question.acceptTypes?.replace(/\./g, "").toUpperCase()}</p>
          </>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept={question.acceptTypes} className="hidden" onChange={handleFileChange} />
    </div>
  );
}

// ─── Question Router ────────────────────────────────────────────────────────────

function QuestionRenderer({ question, value, onChange, allResponses }: {
  question: AssessmentQuestion; value: any; onChange: (val: any) => void; allResponses: Record<string, any>[];
}) {
  // Handle conditional display
  if (question.showIf) {
    const depModuleResponses = allResponses[question.showIf.moduleIndex] || {};
    if (depModuleResponses[question.showIf.questionId] !== question.showIf.value) return null;
  }
  if (question.hideIf) {
    const depModuleResponses = allResponses[question.hideIf.moduleIndex] || {};
    if (depModuleResponses[question.hideIf.questionId] === question.hideIf.value) return null;
  }

  switch (question.type) {
    case "single":
      return <SingleQuestion question={question} value={value || ""} onChange={onChange} />;
    case "multi":
      return <MultiQuestion question={question} value={value || []} onChange={onChange} />;
    case "scale":
      return <ScaleQuestion question={question} value={value} onChange={onChange} />;
    case "spectrumGroup":
      return <SpectrumGroupQuestion question={question} values={value || {}} onChange={(id, v) => onChange({ ...(value || {}), [id]: v })} />;
    case "textarea":
      return <TextareaQuestion question={question} value={value || ""} onChange={onChange} />;
    case "pillars":
      return <PillarsQuestion question={question} value={value || ["","","",""]} onChange={onChange} />;
    case "fileUpload":
      return <FileUploadQuestion question={question} value={value || ""} onChange={onChange} />;
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
  const [showInterstitial, setShowInterstitial] = useState(false);

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
              } catch { restored[idx] = {}; }
              completedIdxs.push(idx);
            }
          }
          setAllResponses(restored);
          setCompletedModules(completedIdxs);
          const firstIncomplete = ASSESSMENT_MODULES.findIndex((_, i) => !completedIdxs.includes(i));
          if (firstIncomplete >= 0) setCurrentModuleIndex(firstIncomplete);
        }
      } catch {}
    };
    loadSaved();
  }, [companyId]);

  const currentModule: AssessmentModule = ASSESSMENT_MODULES[currentModuleIndex];
  const isLastModule = currentModuleIndex === ASSESSMENT_MODULES.length - 1;
  const moduleResponses = allResponses[currentModuleIndex];

  const updateResponse = useCallback((questionId: string, value: any) => {
    setAllResponses((prev) => {
      const next = [...prev];
      next[currentModuleIndex] = { ...next[currentModuleIndex], [questionId]: value };
      return next;
    });
  }, [currentModuleIndex]);

  // Filter visible questions based on conditional logic
  const visibleQuestions = currentModule.questions.filter((q) => {
    if (q.showIf) {
      const depResponses = allResponses[q.showIf.moduleIndex] || {};
      if (depResponses[q.showIf.questionId] !== q.showIf.value) return false;
    }
    if (q.hideIf) {
      const depResponses = allResponses[q.hideIf.moduleIndex] || {};
      if (depResponses[q.hideIf.questionId] === q.hideIf.value) return false;
    }
    return true;
  });

  const isModuleValid = useCallback((): boolean => {
    for (const q of visibleQuestions) {
      if (!q.required) continue;
      const val = moduleResponses[q.id];
      if (val === undefined || val === null || val === "") return false;
      if (q.type === "multi" && Array.isArray(val) && val.length === 0) return false;
      if (q.type === "spectrumGroup" && q.spectrums) {
        if (!val || typeof val !== "object") return false;
        for (const s of q.spectrums) {
          if (val[s.id] === undefined || val[s.id] === null) return false;
        }
      }
    }
    return true;
  }, [visibleQuestions, moduleResponses]);

  const submitModule = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/assessment", {
        companyId: companyId || 0, userId: userId || 0,
        moduleIndex: currentModuleIndex, responses: JSON.stringify(moduleResponses),
      });
    } catch {}
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
      // Show interstitial
      setShowInterstitial(true);
    }
  }, [submitModule, currentModuleIndex, isLastModule, allResponses, onComplete]);

  const handleInterstitialDone = useCallback(() => {
    setShowInterstitial(false);
    setCurrentModuleIndex((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBack = useCallback(() => {
    if (currentModuleIndex === 0) {
      onBack();
    } else {
      setCurrentModuleIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentModuleIndex, onBack]);

  // ─── Interstitial screen ──
  if (showInterstitial) {
    const nextModule = ASSESSMENT_MODULES[currentModuleIndex + 1];
    return (
      <ModuleInterstitial
        moduleTitle={currentModule.title}
        completedCount={completedModules.length + 1}
        total={ASSESSMENT_MODULES.length}
        onContinue={handleInterstitialDone}
        nextModuleName={nextModule?.title || "Next Module"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar: Back | Logo | Counter */}
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4 pt-6 pb-2">
        <button onClick={handleBack} className="text-[14px] font-light text-black hover:underline">Back</button>
        <h1 className="text-[16px] font-normal text-black">GalleaBrandVoicePro</h1>
        <span className="text-[14px] font-light text-black">{currentModuleIndex + 1} / {ASSESSMENT_MODULES.length}</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Progress Dots */}
        <ProgressDots total={ASSESSMENT_MODULES.length} current={currentModuleIndex} completed={completedModules} />

        {/* Module Card */}
        <Card className="p-8 border-[#E5E5E5]">
          <CardContent className="p-0">
            {/* Module Header */}
            <div className="mb-6">
              <p className="text-xs font-medium text-[#585858] uppercase tracking-wide mb-1">
                Module {currentModuleIndex + 1} of {ASSESSMENT_MODULES.length}
              </p>
              <h2 className="text-[20px] font-medium text-black">{currentModule.title}</h2>
              <p className="text-[14px] font-light text-[#585858] mt-1">{currentModule.subtitle}</p>
              <p className="text-[12px] font-light text-[#9B9B9B] mt-2">Take your time — there are no wrong answers here.</p>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {currentModule.questions.map((question) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  value={moduleResponses[question.id]}
                  onChange={(val) => updateResponse(question.id, val)}
                  allResponses={allResponses}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
              <Button variant="ghost" onClick={handleBack} className="text-[14px] font-light">Back</Button>
              <Button
                size="lg"
                disabled={!isModuleValid() || isSubmitting}
                onClick={handleContinue}
                className="bg-black text-white hover:bg-black/90 rounded-[10px] text-[14px] font-light"
              >
                {isSubmitting ? "Saving..." : isLastModule ? "Build My Brand Voice" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-[12px] font-light text-[#585858]">Powered by Gallea Ai</p>
      </div>
    </div>
  );
}
