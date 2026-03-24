import { useState, useEffect, useRef, useCallback } from "react";

const PROGRESS_MESSAGES = [
  "Analyzing your brand DNA...",
  "Crafting your brand pillars...",
  "Mapping emotional territories...",
  "Building your voice profile...",
];

const MIN_DISPLAY_MS = 20000;

interface ProcessingPageProps {
  onComplete: () => void;
  apiDone: boolean;
}

// ─── Neural Network Canvas ──────────────────────────────────────────────────────

function NeuralNetworkViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<{ x: number; y: number; r: number; vx: number; vy: number }[]>([]);
  const pulsesRef = useRef<{ fromIdx: number; toIdx: number; progress: number; speed: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    // Initialize nodes
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    const nodeCount = 40;
    if (nodesRef.current.length === 0) {
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * w, y: Math.random() * h,
          r: 2 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });
      }
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      ctx.clearRect(0, 0, cw, ch);

      // Move nodes
      for (const n of nodesRef.current) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > cw) n.vx *= -1;
        if (n.y < 0 || n.y > ch) n.vy *= -1;
        n.x = Math.max(0, Math.min(cw, n.x));
        n.y = Math.max(0, Math.min(ch, n.y));
      }

      // Draw connections
      const connectionDist = 120;
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const a = nodesRef.current[i];
          const b = nodesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Spawn new pulses occasionally
      if (Math.random() < 0.05 && pulsesRef.current.length < 8) {
        const fromIdx = Math.floor(Math.random() * nodesRef.current.length);
        let toIdx = Math.floor(Math.random() * nodesRef.current.length);
        if (toIdx === fromIdx) toIdx = (toIdx + 1) % nodesRef.current.length;
        pulsesRef.current.push({ fromIdx, toIdx, progress: 0, speed: 0.01 + Math.random() * 0.02 });
      }

      // Draw pulses
      pulsesRef.current = pulsesRef.current.filter((p) => {
        p.progress += p.speed;
        if (p.progress > 1) return false;
        const a = nodesRef.current[p.fromIdx];
        const b = nodesRef.current[p.toIdx];
        const px = a.x + (b.x - a.x) * p.progress;
        const py = a.y + (b.y - a.y) * p.progress;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 8);
        grad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(px - 8, py - 8, 16, 16);
        return true;
      });

      // Draw nodes
      for (const n of nodesRef.current) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(183, 183, 183, 0.5)";
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "transparent" }}
    />
  );
}

// ─── Processing Page ────────────────────────────────────────────────────────────

export default function ProcessingPage({ onComplete, apiDone }: ProcessingPageProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const hasCompleted = useRef(false);

  // Cycle messages every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Check if we can complete (API done + minimum time elapsed)
  const tryComplete = useCallback(() => {
    if (hasCompleted.current) return;
    const elapsed = Date.now() - startTime;
    if (apiDone && elapsed >= MIN_DISPLAY_MS) {
      hasCompleted.current = true;
      onComplete();
    }
  }, [apiDone, startTime, onComplete]);

  useEffect(() => {
    const timer = setInterval(tryComplete, 500);
    return () => clearInterval(timer);
  }, [tryComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAFAFA] flex flex-col items-center justify-center overflow-hidden">
      {/* Neural network visualization */}
      <NeuralNetworkViz />

      {/* Content overlay */}
      <div className="relative z-10 text-center space-y-6 px-4">
        {/* Brain icon area */}
        <div className="w-24 h-24 mx-auto rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="animate-pulse">
            <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4z" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
            <path d="M24 10c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14-6.27-14-14-14z" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" fill="none" />
            <circle cx="24" cy="24" r="3" fill="rgba(0,0,0,0.8)" />
            <circle cx="16" cy="20" r="1.5" fill="rgba(0,0,0,0.2)" />
            <circle cx="32" cy="20" r="1.5" fill="rgba(0,0,0,0.2)" />
            <circle cx="18" cy="30" r="1.5" fill="rgba(0,0,0,0.2)" />
            <circle cx="30" cy="30" r="1.5" fill="rgba(0,0,0,0.2)" />
            <line x1="24" y1="24" x2="16" y2="20" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
            <line x1="24" y1="24" x2="32" y2="20" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
            <line x1="24" y1="24" x2="18" y2="30" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
            <line x1="24" y1="24" x2="30" y2="30" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Cycling message */}
        <p
          key={messageIndex}
          className="text-[20px] font-light text-black animate-[fadeIn_0.5s_ease-in]"
        >
          {PROGRESS_MESSAGES[messageIndex]}
        </p>

        {/* Progress bar — wide */}
        <div className="w-[80vw] max-w-lg mx-auto h-[3px] bg-[#E5E5E5] rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, ((Date.now() - startTime) / MIN_DISPLAY_MS) * 100)}%` }}
          />
        </div>

        <p className="text-[12px] font-light text-[#9B9B9B] gallea-wordmark">GalleaBrandVoicePro</p>
      </div>
    </div>
  );
}
