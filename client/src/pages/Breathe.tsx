import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Wind, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type Phase = { name: string; duration: number; tone: "in" | "hold" | "out" };

type Technique = {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
};

const TECHNIQUES: Technique[] = [
  {
    id: "4-7-8",
    name: "4-7-8 Calm",
    description: "Best for racing thoughts and trouble falling asleep.",
    phases: [
      { name: "Breathe in", duration: 4, tone: "in" },
      { name: "Hold", duration: 7, tone: "hold" },
      { name: "Breathe out", duration: 8, tone: "out" },
    ],
  },
  {
    id: "box",
    name: "Box Breathing",
    description: "Used by athletes and Navy SEALs to steady the nervous system.",
    phases: [
      { name: "Breathe in", duration: 4, tone: "in" },
      { name: "Hold", duration: 4, tone: "hold" },
      { name: "Breathe out", duration: 4, tone: "out" },
      { name: "Hold", duration: 4, tone: "hold" },
    ],
  },
  {
    id: "resonant",
    name: "Resonant 5-5",
    description: "Slow, even breathing that calms the heart rate.",
    phases: [
      { name: "Breathe in", duration: 5, tone: "in" },
      { name: "Breathe out", duration: 5, tone: "out" },
    ],
  },
];

export default function Breathe() {
  const [techniqueId, setTechniqueId] = useState<string>(TECHNIQUES[0].id);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TECHNIQUES[0].phases[0].duration);
  const [running, setRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const technique = useMemo(
    () => TECHNIQUES.find((t) => t.id === techniqueId) ?? TECHNIQUES[0],
    [techniqueId],
  );
  const phase = technique.phases[phaseIndex];

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        // advance phase
        setPhaseIndex((currentPhase) => {
          const nextPhase = currentPhase + 1;
          if (nextPhase >= technique.phases.length) {
            setCyclesCompleted((c) => c + 1);
            return 0;
          }
          return nextPhase;
        });
        return 0;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, technique.phases.length]);

  // When phaseIndex changes, reset secondsLeft to that phase's duration
  useEffect(() => {
    setSecondsLeft(technique.phases[phaseIndex].duration);
  }, [phaseIndex, technique]);

  function reset() {
    setRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(technique.phases[0].duration);
    setCyclesCompleted(0);
  }

  function changeTechnique(id: string) {
    setRunning(false);
    setTechniqueId(id);
    setPhaseIndex(0);
    const t = TECHNIQUES.find((x) => x.id === id) ?? TECHNIQUES[0];
    setSecondsLeft(t.phases[0].duration);
    setCyclesCompleted(0);
  }

  const scale = phase.tone === "in" ? 1.4 : phase.tone === "out" ? 0.85 : phase.tone === "hold" ? 1.15 : 1;
  const ringColor =
    phase.tone === "in" ? "#7c3aed" : phase.tone === "out" ? "#22c55e" : "#f59e0b";

  return (
    <div className="mx-auto max-w-3xl px-6 pt-12 pb-32 md:pt-20">
      <Link
        href="/home"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back home
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <header className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Wind className="h-3.5 w-3.5" />
            Breathing tool
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">Slow your breath. Slow your mind.</h1>
          <p className="mt-2 text-muted-foreground">{technique.description}</p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          {TECHNIQUES.map((t) => {
            const active = t.id === techniqueId;
            return (
              <button
                key={t.id}
                onClick={() => changeTechnique(t.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-primary bg-primary text-white shadow-md shadow-primary/30"
                    : "border-border bg-white text-foreground hover:border-primary/40"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border bg-white p-12 shadow-xl shadow-black/5">
          <div className="relative flex h-72 w-72 items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale, backgroundColor: `${ringColor}15` }}
              transition={{ duration: phase.duration, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-6 rounded-full"
              animate={{ scale, backgroundColor: `${ringColor}30` }}
              transition={{ duration: phase.duration, ease: "easeInOut" }}
            />
            <motion.div
              className="relative flex h-44 w-44 flex-col items-center justify-center rounded-full text-white shadow-2xl"
              animate={{ scale, backgroundColor: ringColor }}
              transition={{ duration: phase.duration, ease: "easeInOut" }}
            >
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80">{phase.name}</p>
              <p className="font-display text-6xl font-bold">{secondsLeft || phase.duration}</p>
            </motion.div>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <Button
              size="lg"
              onClick={() => setRunning((r) => !r)}
              className="h-12 rounded-full px-6 text-base"
            >
              {running ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={reset}
              className="h-12 rounded-full px-6 text-base"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>

          <div className="mt-8 grid w-full grid-cols-3 gap-4 text-center">
            <Stat label="Cycle" value={String(cyclesCompleted)} />
            <Stat label="Phase" value={`${phaseIndex + 1}/${technique.phases.length}`} />
            <Stat
              label="Cycle length"
              value={`${technique.phases.reduce((sum, p) => sum + p.duration, 0)}s`}
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">How to use:</span> sit somewhere comfortable, drop
            your shoulders, and let the circle guide you. Three to five cycles is usually enough to feel a
            difference. If you ever feel light-headed, pause and breathe normally.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
