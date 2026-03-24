import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "How does this agent work?",
    answer:
      "It uses AI with Gallea Ai's Brand DNA embedded in every prompt, ensuring output matches your strategic positioning.",
  },
  {
    question: "What is AEO?",
    answer:
      "Answer Engine Optimization ensures your brand content is structured for AI-powered search and discovery.",
  },
  {
    question: "Can I edit the output?",
    answer:
      "Yes, all generated content is fully editable. Use it as a starting point or final copy.",
  },
  {
    question: "How is data handled?",
    answer:
      "Your brand data is encrypted and stored securely. We never share your data with third parties.",
  },
  {
    question: "How does it strengthen the brand voice?",
    answer:
      "By embedding your brand DNA into every prompt, ensuring consistent voice across all touchpoints.",
  },
  {
    question: "What ROI can we expect?",
    answer:
      "Companies typically see 60-80% reduction in content creation time while maintaining brand consistency.",
  },
  {
    question: "How adaptable is it?",
    answer:
      "The platform adapts to any content type, from social posts to white papers, maintaining your brand voice.",
  },
  {
    question: "Future capabilities?",
    answer:
      "We're continuously improving with new content types, multi-language support, and advanced analytics.",
  },
];

export default function FaqPage() {
  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="faq-page">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" data-testid="text-page-title">
          FAQ
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Common questions about the platform.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="space-y-2"
        data-testid="faq-accordion"
      >
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="bg-card rounded-lg border px-4"
            data-testid={`faq-item-${index}`}
          >
            <AccordionTrigger
              className="text-sm font-medium"
              data-testid={`faq-trigger-${index}`}
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <p
                className="text-sm text-muted-foreground"
                data-testid={`faq-answer-${index}`}
              >
                {item.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
