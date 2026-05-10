import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function SignIn() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl rounded-[32px] border border-border bg-white/90 p-10 shadow-xl shadow-black/5"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Sign in to Heed</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Connect your account to manage your daily check-ins, goals, and companion chat.
          </p>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            When you press continue, you will be redirected to the authentication provider.
          </p>

          <a href="/api/login">
            <Button size="lg" className="w-full justify-between px-6">
              Continue to Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>

          <div className="rounded-3xl border border-border/80 bg-secondary/40 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Need help?</p>
            <p>Return to the home page if you want to explore without signing in.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
