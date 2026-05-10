import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateCheckin } from "@/hooks/use-checkins";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, Check, Meh, Frown, Smile } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Mood = 'good' | 'neutral' | 'bad';

export default function CheckIn() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const createCheckin = useCreateCheckin();
  
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<Mood | null>(null);
  const [meals, setMeals] = useState<boolean | null>(null);
  const [activity, setActivity] = useState<boolean | null>(null);
  const [note, setNote] = useState("");

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    try {
      await createCheckin.mutateAsync({
        userId: user?.id || "",
        date: format(new Date(), "yyyy-MM-dd"),
        mood: mood || "neutral",
        activities: { meals, activity },
        response: note,
        skipped: false,
      });
      setLocation("/");
    } catch (error) {
      console.error(error);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <div className="p-6">
        <Button variant="ghost" size="icon" onClick={step === 1 ? () => setLocation("/") : prevStep}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 pb-20">
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-primary" : "bg-primary/20"}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" custom={step}>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-8"
            >
              <h2 className="font-display text-3xl font-bold">How are you feeling today?</h2>
              <div className="grid gap-4">
                <MoodButton 
                  icon={Smile} 
                  label="Good" 
                  selected={mood === 'good'} 
                  onClick={() => { setMood('good'); nextStep(); }} 
                />
                <MoodButton 
                  icon={Meh} 
                  label="Okay" 
                  selected={mood === 'neutral'} 
                  onClick={() => { setMood('neutral'); nextStep(); }} 
                />
                <MoodButton 
                  icon={Frown} 
                  label="Not Great" 
                  selected={mood === 'bad'} 
                  onClick={() => { setMood('bad'); nextStep(); }} 
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8"
            >
              <h2 className="font-display text-3xl font-bold">Did you manage to have regular meals?</h2>
              <div className="grid gap-4">
                <OptionButton 
                  label="Yes, I ate well" 
                  selected={meals === true} 
                  onClick={() => { setMeals(true); nextStep(); }} 
                />
                <OptionButton 
                  label="Not really" 
                  selected={meals === false} 
                  onClick={() => { setMeals(false); nextStep(); }} 
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8"
            >
              <h2 className="font-display text-3xl font-bold">Any physical activity today?</h2>
              <p className="text-muted-foreground">Even a short walk counts.</p>
              <div className="grid gap-4">
                <OptionButton 
                  label="Yes, moved a bit" 
                  selected={activity === true} 
                  onClick={() => { setActivity(true); nextStep(); }} 
                />
                <OptionButton 
                  label="No, mostly resting" 
                  selected={activity === false} 
                  onClick={() => { setActivity(false); nextStep(); }} 
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8"
            >
              <h2 className="font-display text-3xl font-bold">Anything else on your mind?</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional thoughts..."
                className="w-full h-40 p-4 rounded-2xl bg-white border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={createCheckin.isPending}
                className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg"
              >
                {createCheckin.isPending ? "Saving..." : "Complete Check-in"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MoodButton({ icon: Icon, label, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-6 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        ${selected 
          ? "bg-primary/10 border-primary text-primary" 
          : "bg-white border-transparent hover:border-primary/30 text-foreground shadow-sm"}
      `}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selected ? "bg-primary text-white" : "bg-secondary text-primary"}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xl font-medium">{label}</span>
      {selected && <Check className="ml-auto w-6 h-6 text-primary" />}
    </button>
  );
}

function OptionButton({ label, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-6 rounded-2xl border-2 text-left transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        ${selected 
          ? "bg-primary/10 border-primary text-primary" 
          : "bg-white border-transparent hover:border-primary/30 text-foreground shadow-sm"}
      `}
    >
      <span className="text-xl font-medium">{label}</span>
      {selected && <Check className="float-right w-6 h-6 text-primary" />}
    </button>
  );
}
