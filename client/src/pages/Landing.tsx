import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[50vh] h-[50vh] bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vh] h-[60vh] bg-accent/10 rounded-full blur-[100px]" />

      <header className="px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">H</div>
          Heed
        </div>

        <a href="/signin">
          <Button variant="ghost" className="font-medium hover:bg-white/50">
            Log In
          </Button>
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 border border-primary/20 text-primary text-sm font-semibold mb-6 shadow-sm">
            Your Gentle Digital Companion
          </span>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Small check-ins.
            <br />
            <span className="text-primary">Big difference.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Heed helps you maintain balance through gentle daily conversations about your mood, meals, and movement. No streaks, no scores—just care.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/signin">
              <Button
                size="lg"
                className="rounded-full px-8 h-14 text-lg shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5"
              >
                Start Your Journey
              </Button>
            </a>
          </div>
        </motion.div>
      </main>

      <footer className="py-8 text-center text-muted-foreground text-sm z-10">
        <p>&copy; {new Date().getFullYear()} Heed. Designed for peace of mind.</p>
      </footer>
    </div>
  );
}