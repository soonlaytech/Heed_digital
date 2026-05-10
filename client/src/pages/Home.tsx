import { useAuth } from "@/hooks/use-auth";
import { useLatestCheckin } from "@/hooks/use-checkins";
import { useRandomQuote } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Sun, CheckCircle2, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();
  const { data: latestCheckin, isLoading } = useLatestCheckin();
  const { quote: dailyQuote, isLoading: quotesLoading } = useRandomQuote();
  
  const today = format(new Date(), "yyyy-MM-dd");
  const hasCheckedInToday = latestCheckin?.date === today;

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto pt-20 px-6 space-y-8">
        <Skeleton className="h-12 w-3/4 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-12 px-6 pb-24 md:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8">
          <div className="text-muted-foreground font-medium mb-2 flex items-center gap-2">
            <Sun className="w-4 h-4 text-accent" />
            {format(new Date(), "EEEE, MMMM d")}
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},<br />
            <span className="text-primary">{user?.firstName || "Friend"}.</span>
          </h1>
        </header>

        {quotesLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl mb-8" />
        ) : dailyQuote ? (
          <motion.div 
            className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 p-6 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            data-testid="text-daily-quote"
          >
            <p className="text-lg font-medium text-foreground italic">"{dailyQuote.text}"</p>
          </motion.div>
        ) : null}

        {hasCheckedInToday ? (
          <div className="bg-white/80 backdrop-blur-sm border border-secondary p-8 rounded-3xl shadow-lg shadow-black/5 text-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-3">All caught up</h2>
            <p className="text-muted-foreground mb-8">
              You've checked in for today. Sleep well and take care of yourself.
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-background p-4 rounded-2xl border border-border/50">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Mood</span>
                <p className="font-medium text-lg mt-1 capitalize">{latestCheckin?.mood || "Recorded"}</p>
              </div>
              <div className="bg-background p-4 rounded-2xl border border-border/50">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Activity</span>
                <p className="font-medium text-lg mt-1">{latestCheckin?.activities ? "Yes" : "Relaxed"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-primary/20 p-8 rounded-3xl shadow-xl shadow-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
            
            <h2 className="font-display text-2xl font-semibold mb-3 relative z-10">Daily Check-in</h2>
            <p className="text-muted-foreground mb-8 relative z-10">
              Ready to pause for a moment? Let's see how you're feeling today.
            </p>
            
            <Link href="/check-in" className="block">
              <Button className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Start Check-in <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link href="/chat" className="bg-white/60 hover:bg-white border border-transparent hover:border-border p-6 rounded-2xl transition-all duration-200">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mb-4 text-accent-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <h3 className="font-semibold text-foreground">Chat</h3>
            <p className="text-sm text-muted-foreground">Talk to your companion</p>
          </Link>
          <Link href="/settings" className="bg-white/60 hover:bg-white border border-transparent hover:border-border p-6 rounded-2xl transition-all duration-200">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mb-4 text-foreground">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">History</h3>
            <p className="text-sm text-muted-foreground">View past days</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
